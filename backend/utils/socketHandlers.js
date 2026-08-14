const { pool } = require('./db');
const { v4: uuidv4 } = require('uuid');

module.exports = (io) => {
  const activeStreams = new Map(); // streamId -> Set of socket IDs
  const userSockets = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Authenticate socket
    socket.on('authenticate', async (token) => {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query(
          'SELECT id, username, display_name, avatar, vip_level, is_banned FROM users WHERE id = $1',
          [decoded.userId]
        );

        if (result.rows.length > 0 && !result.rows[0].is_banned) {
          socket.user = result.rows[0];
          userSockets.set(socket.user.id, socket.id);
          socket.emit('authenticated', { user: socket.user });
        }
      } catch (err) {
        socket.emit('auth_error', { error: 'Invalid token' });
      }
    });

    // Join stream room
    socket.on('join_stream', async (streamId) => {
      try {
        socket.join(`stream_${streamId}`);

        if (!activeStreams.has(streamId)) {
          activeStreams.set(streamId, new Set());
        }
        activeStreams.get(streamId).add(socket.id);

        // Update viewer count in DB
        await pool.query(
          'UPDATE streams SET viewer_count = viewer_count + 1 WHERE id = $1 AND status = 'live'',
          [streamId]
        );

        // Get updated viewer count
        const result = await pool.query(
          'SELECT viewer_count FROM streams WHERE id = $1',
          [streamId]
        );

        io.to(`stream_${streamId}`).emit('viewer_count', {
          streamId,
          count: result.rows[0]?.viewer_count || 0,
        });

        // Notify others
        if (socket.user) {
          socket.to(`stream_${streamId}`).emit('user_joined', {
            userId: socket.user.id,
            username: socket.user.username,
            displayName: socket.user.display_name,
            avatar: socket.user.avatar,
            vipLevel: socket.user.vip_level,
          });
        }
      } catch (err) {
        console.error('Join stream error:', err);
      }
    });

    // Leave stream room
    socket.on('leave_stream', async (streamId) => {
      try {
        socket.leave(`stream_${streamId}`);

        if (activeStreams.has(streamId)) {
          activeStreams.get(streamId).delete(socket.id);
          if (activeStreams.get(streamId).size === 0) {
            activeStreams.delete(streamId);
          }
        }

        await pool.query(
          'UPDATE streams SET viewer_count = GREATEST(viewer_count - 1, 0) WHERE id = $1 AND status = 'live'',
          [streamId]
        );

        const result = await pool.query(
          'SELECT viewer_count FROM streams WHERE id = $1',
          [streamId]
        );

        io.to(`stream_${streamId}`).emit('viewer_count', {
          streamId,
          count: result.rows[0]?.viewer_count || 0,
        });

        if (socket.user) {
          socket.to(`stream_${streamId}`).emit('user_left', {
            userId: socket.user.id,
            username: socket.user.username,
          });
        }
      } catch (err) {
        console.error('Leave stream error:', err);
      }
    });

    // Chat message
    socket.on('chat_message', async (data) => {
      try {
        const { streamId, message, type = 'text' } = data;

        if (!socket.user) {
          socket.emit('chat_error', { error: 'Not authenticated' });
          return;
        }

        if (!message || message.trim().length === 0 || message.length > 500) {
          socket.emit('chat_error', { error: 'Invalid message' });
          return;
        }

        // Save to DB
        const msgId = uuidv4();
        await pool.query(
          `INSERT INTO chat_messages (id, stream_id, user_id, message, type, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [msgId, streamId, socket.user.id, message.trim(), type]
        );

        // Broadcast to stream room
        io.to(`stream_${streamId}`).emit('new_message', {
          id: msgId,
          message: message.trim(),
          type,
          createdAt: new Date().toISOString(),
          user: {
            id: socket.user.id,
            username: socket.user.username,
            displayName: socket.user.display_name,
            avatar: socket.user.avatar,
            vipLevel: socket.user.vip_level,
          },
        });
      } catch (err) {
        console.error('Chat message error:', err);
        socket.emit('chat_error', { error: 'Failed to send message' });
      }
    });

    // Gift sent
    socket.on('send_gift', async (data) => {
      try {
        const { streamId, giftId, quantity = 1 } = data;

        if (!socket.user) {
          socket.emit('gift_error', { error: 'Not authenticated' });
          return;
        }

        const giftResult = await pool.query('SELECT * FROM gifts WHERE id = $1', [giftId]);
        if (giftResult.rows.length === 0) {
          socket.emit('gift_error', { error: 'Gift not found' });
          return;
        }

        const gift = giftResult.rows[0];
        const totalCost = gift.coin_cost * quantity;

        const userResult = await pool.query('SELECT coins FROM users WHERE id = $1', [socket.user.id]);
        if (userResult.rows[0].coins < totalCost) {
          socket.emit('gift_error', { error: 'Insufficient coins' });
          return;
        }

        // Deduct coins
        await pool.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [totalCost, socket.user.id]);

        // Add diamonds to streamer
        const streamResult = await pool.query('SELECT streamer_id FROM streams WHERE id = $1', [streamId]);
        if (streamResult.rows.length > 0) {
          const streamerId = streamResult.rows[0].streamer_id;
          await pool.query('UPDATE users SET diamonds = diamonds + $1 WHERE id = $2', [gift.diamond_cost * quantity, streamerId]);
        }

        // Record transaction
        await pool.query(
          `INSERT INTO gift_transactions (id, sender_id, stream_id, gift_id, quantity, total_cost, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [uuidv4(), socket.user.id, streamId, giftId, quantity, totalCost]
        );

        // Broadcast gift animation
        io.to(`stream_${streamId}`).emit('gift_received', {
          sender: {
            id: socket.user.id,
            username: socket.user.username,
            displayName: socket.user.display_name,
            avatar: socket.user.avatar,
          },
          gift: {
            id: gift.id,
            name: gift.name,
            iconUrl: gift.icon_url,
            animationUrl: gift.animation_url,
            rarity: gift.rarity,
          },
          quantity,
          totalCost,
        });

        socket.emit('gift_success', { remainingCoins: userResult.rows[0].coins - totalCost });
      } catch (err) {
        console.error('Gift error:', err);
        socket.emit('gift_error', { error: 'Failed to send gift' });
      }
    });

    // Private message
    socket.on('private_message', async (data) => {
      try {
        const { receiverId, message } = data;

        if (!socket.user) {
          socket.emit('pm_error', { error: 'Not authenticated' });
          return;
        }

        const msgId = uuidv4();
        await pool.query(
          `INSERT INTO private_messages (id, sender_id, receiver_id, message, is_read, created_at)
           VALUES ($1, $2, $3, $4, false, NOW())`,
          [msgId, socket.user.id, receiverId, message.trim()]
        );

        // Send to receiver if online
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_private_message', {
            id: msgId,
            senderId: socket.user.id,
            senderUsername: socket.user.username,
            senderAvatar: socket.user.avatar,
            message: message.trim(),
            createdAt: new Date().toISOString(),
          });
        }

        socket.emit('pm_sent', { messageId: msgId });
      } catch (err) {
        console.error('Private message error:', err);
        socket.emit('pm_error', { error: 'Failed to send message' });
      }
    });

    // Heartbeat / ping
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);

      if (socket.user) {
        userSockets.delete(socket.user.id);
      }

      // Clean up from all streams
      activeStreams.forEach((sockets, streamId) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          pool.query(
            'UPDATE streams SET viewer_count = GREATEST(viewer_count - 1, 0) WHERE id = $1 AND status = 'live'',
            [streamId]
          ).catch(console.error);
        }
      });
    });
  });
};
