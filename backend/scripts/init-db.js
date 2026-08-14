const { pool } = require('../db');

const createTables = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username VARCHAR(30) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(50),
        avatar TEXT,
        bio TEXT,
        gender VARCHAR(20),
        birth_date DATE,
        coins INTEGER DEFAULT 0,
        diamonds INTEGER DEFAULT 0,
        vip_level INTEGER DEFAULT 0,
        vip_expires_at TIMESTAMP,
        follower_count INTEGER DEFAULT 0,
        following_count INTEGER DEFAULT 0,
        stream_count INTEGER DEFAULT 0,
        total_viewers INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        is_streamer BOOLEAN DEFAULT false,
        is_banned BOOLEAN DEFAULT false,
        ban_reason TEXT,
        banned_at TIMESTAMP,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `);

    // Refresh tokens
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        revoked BOOLEAN DEFAULT false,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Follows
    await client.query(`
      CREATE TABLE IF NOT EXISTS follows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(follower_id, following_id)
      )
    `);

    // Blocks
    await client.query(`
      CREATE TABLE IF NOT EXISTS blocks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
        blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(blocker_id, blocked_id)
      )
    `);

    // Reports
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
        reported_id UUID REFERENCES users(id) ON DELETE CASCADE,
        reason VARCHAR(100) NOT NULL,
        details TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        action_taken TEXT,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Streams
    await client.query(`
      CREATE TABLE IF NOT EXISTS streams (
        id UUID PRIMARY KEY,
        streamer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        thumbnail TEXT,
        category VARCHAR(50) DEFAULT 'general',
        status VARCHAR(20) DEFAULT 'live',
        viewer_count INTEGER DEFAULT 0,
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP,
        duration INTEGER,
        agora_channel VARCHAR(100),
        agora_token TEXT,
        ended_by_admin BOOLEAN DEFAULT false,
        admin_end_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Chat messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stream_id UUID REFERENCES streams(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'text',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Private messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS private_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Gifts
    await client.query(`
      CREATE TABLE IF NOT EXISTS gifts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon_url TEXT,
        coin_cost INTEGER NOT NULL,
        diamond_cost INTEGER DEFAULT 0,
        animation_url TEXT,
        rarity VARCHAR(20) DEFAULT 'common',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Gift transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS gift_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        stream_id UUID REFERENCES streams(id) ON DELETE SET NULL,
        gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        total_cost INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Payment transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        stripe_payment_intent_id VARCHAR(255),
        amount INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'usd',
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert default gifts
    await client.query(`
      INSERT INTO gifts (name, description, icon_url, coin_cost, diamond_cost, rarity)
      VALUES 
        ('Rose', 'A beautiful rose', 'https://cdn.amoralive.app/gifts/rose.png', 10, 1, 'common'),
        ('Heart', 'Show your love', 'https://cdn.amoralive.app/gifts/heart.png', 50, 5, 'common'),
        ('Trophy', 'Champion gift', 'https://cdn.amoralive.app/gifts/trophy.png', 100, 10, 'rare'),
        ('Crown', 'Royal treatment', 'https://cdn.amoralive.app/gifts/crown.png', 500, 50, 'epic'),
        ('Diamond', 'Ultimate gift', 'https://cdn.amoralive.app/gifts/diamond.png', 1000, 100, 'legendary')
      ON CONFLICT DO NOTHING
    `);

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_streams_status ON streams(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_streams_streamer ON streams(streamer_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chat_stream ON chat_messages(stream_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pm_sender ON private_messages(sender_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pm_receiver ON private_messages(receiver_id)`);

    await client.query('COMMIT');
    console.log('✅ Database initialized successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization failed:', err);
    throw err;
  } finally {
    client.release();
  }
};

// Run if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { createTables };
