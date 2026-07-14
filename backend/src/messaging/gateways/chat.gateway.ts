import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from '../messaging.service';
import { PrismaService } from '../../common/prisma.service';

interface AuthedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' }, // tightened via APP_URL allow-list at the gateway edge in production
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  // Track which conversation rooms a socket is currently typing in, to auto-clear on disconnect
  private typingState = new Map<string, Set<string>>(); // conversationId -> Set<userId>

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private messagingService: MessagingService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthedSocket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers.authorization?.toString().replace('Bearer ', ''));

      if (!token) throw new UnauthorizedException('Missing token');

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });

      if (payload.type !== 'access') throw new UnauthorizedException('Invalid token type');

      client.userId = payload.sub;
      client.join(`user:${payload.sub}`);

      // Auto-join every conversation this user currently participates in
      const conversations = await this.prisma.conversationParticipant.findMany({
        where: { userId: payload.sub, leftAt: null },
        select: { conversationId: true },
      });
      for (const c of conversations) {
        client.join(`conversation:${c.conversationId}`);
      }

      this.logger.log(`Socket connected: user ${payload.sub}`);
    } catch (err) {
      this.logger.warn(`Socket auth failed: ${err.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthedSocket) {
    if (!client.userId) return;
    // Clear any typing indicators this socket left dangling
    for (const [conversationId, typers] of this.typingState.entries()) {
      if (typers.delete(client.userId)) {
        this.server.to(`conversation:${conversationId}`).emit('typing', {
          conversationId,
          userId: client.userId,
          isTyping: false,
        });
      }
    }
    this.logger.log(`Socket disconnected: user ${client.userId}`);
  }

  @SubscribeMessage('joinConversation')
  async onJoinConversation(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) return;
    await this.messagingService.assertParticipant(data.conversationId, client.userId).catch(() => {
      client.emit('error', { message: 'Not authorized for this conversation' });
      return null;
    });
    client.join(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async onSendMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'LOCATION';
      replyToId?: string;
    },
  ) {
    if (!client.userId) return;

    try {
      const { message, recipientIds } = await this.messagingService.sendMessage(
        data.conversationId,
        client.userId,
        data.content,
        data.type,
        data.replyToId,
      );

      // Broadcast to everyone in the conversation room (sender included, for multi-device sync)
      this.server.to(`conversation:${data.conversationId}`).emit('newMessage', message);

      // Also emit to each recipient's personal room, so they get a notification even if
      // they haven't explicitly joined this conversation room yet (e.g. app just opened)
      for (const recipientId of recipientIds) {
        this.server.to(`user:${recipientId}`).emit('messageNotification', {
          conversationId: data.conversationId,
          message,
        });
      }

      return { ack: true, messageId: message.id };
    } catch (err) {
      client.emit('error', { message: err.message || 'Failed to send message' });
      return { ack: false };
    }
  }

  @SubscribeMessage('typing')
  onTyping(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    if (!client.userId) return;

    if (!this.typingState.has(data.conversationId)) {
      this.typingState.set(data.conversationId, new Set());
    }
    const typers = this.typingState.get(data.conversationId);
    if (data.isTyping) typers.add(client.userId);
    else typers.delete(client.userId);

    client.to(`conversation:${data.conversationId}`).emit('typing', {
      conversationId: data.conversationId,
      userId: client.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('markRead')
  async onMarkRead(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { conversationId: string; lastReadMessageId: string },
  ) {
    if (!client.userId) return;
    try {
      await this.messagingService.markAsRead(data.conversationId, client.userId, data.lastReadMessageId);
      client.to(`conversation:${data.conversationId}`).emit('readReceipt', {
        conversationId: data.conversationId,
        userId: client.userId,
        lastReadMessageId: data.lastReadMessageId,
      });
    } catch (err) {
      client.emit('error', { message: err.message || 'Failed to mark as read' });
    }
  }
}
