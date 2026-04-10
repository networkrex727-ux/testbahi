import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';


dotenv.config();

export const app = express();
const PORT = 3000;

// Database configuration
let db: any;

async function connectDatabase() {
  if (db) return;
  
  let mysqlConfig;
  try {
    const configPath = path.join(process.cwd(), 'db-config.json');
    if (fs.existsSync(configPath)) {
      mysqlConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
      mysqlConfig = {
        user: 'primekha_fh',
        host: '51.195.40.96',
        database: 'primekha_fh',
        password: 'A6yV2HCv@VeEFt2',
        port: 3306
      };
    }
    
    mysqlConfig = {
      ...mysqlConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
  } catch (err) {
    console.error('Failed to read db-config.json:', err);
    return;
  }

  try {
    const pool = mysql.createPool(mysqlConfig);
    // Test MySQL connection
    await pool.query('SELECT 1');
    console.log('Connected to remote MySQL database successfully');
    db = pool;
  } catch (error: any) {
    console.error('Remote MySQL connection failed:', error.message);
    if (error.message.includes('not allowed to connect')) {
      const match = error.message.match(/Host '([^']+)'/);
      if (match) {
        console.log('\n==================================================');
        console.log('CRITICAL: DATABASE CONNECTION BLOCKED');
        console.log('Please whitelist this IP in your cPanel/Remote MySQL:');
        console.log(match[1]);
        console.log('TIP: Add "%" (percent sign) in cPanel Remote MySQL to allow all IPs permanently.');
        console.log('==================================================\n');
      }
    }
  }
}

// Helper for database queries
async function query(text: string, params: any[] = []) {
  if (!db) {
    await connectDatabase();
    if (!db) {
      throw new Error('Database connection not established');
    }
  }

  // Find all $N placeholders in the order they appear
  const matches = text.match(/\$\d+/g) || [];
  const mysqlParams: any[] = [];
  
  // Map each placeholder to its value in params
  matches.forEach(match => {
    const index = parseInt(match.substring(1)) - 1;
    mysqlParams.push(params[index] === undefined ? null : params[index]);
  });

  // Convert $1, $2 to ? for MySQL
  const mysqlText = text.replace(/\$\d+/g, '?');
  
  const [rows] = await db.execute(mysqlText, mysqlParams);
  return { rows: Array.isArray(rows) ? rows : [rows], insertId: (rows as any).insertId };
}

// Initialize Database Schema
async function setupDatabase() {
  try {
    // Create Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        role VARCHAR(50) DEFAULT 'user',
        subscription_status VARCHAR(50) DEFAULT 'inactive',
        subscription_plan VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create Anime table
    await query(`
      CREATE TABLE IF NOT EXISTS anime (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        genre VARCHAR(100),
        poster_url TEXT,
        rating DECIMAL(3,1),
        status VARCHAR(50),
        type VARCHAR(50),
        release_year VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Episodes table
    await query(`
      CREATE TABLE IF NOT EXISTS episodes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        anime_id INTEGER,
        title VARCHAR(255) NOT NULL,
        video_url TEXT NOT NULL,
        download_url TEXT,
        access_type VARCHAR(50) DEFAULT 'free',
        \`order\` INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
      )
    `);

    // Create Likes table
    await query(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INTEGER,
        anime_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, anime_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
      )
    `);

    // Create Comments table
    await query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INTEGER,
        anime_id INTEGER,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
      )
    `);

    // Create Redeem Codes table
    await query(`
      CREATE TABLE IF NOT EXISTS redeem_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        plan_id VARCHAR(50) NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        used_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (used_by) REFERENCES users(id)
      )
    `);

    // Create Purchase Requests table
    await query(`
      CREATE TABLE IF NOT EXISTS purchase_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INTEGER,
        plan_id VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        utr VARCHAR(100),
        screenshot_url TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Settings table
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Insert Supabase key if not exists
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRld3lmaXlpcWR2ZXFhb2NremZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjU3NjUsImV4cCI6MjA5MTA0MTc2NX0.vaKIark_ASNTTiFGYrLWQFH0hX83YAer43NALvW1ivs';
    await query('INSERT IGNORE INTO settings (`key`, value) VALUES ($1, $2)', ['VITE_SUPABASE_ANON_KEY', supabaseKey]);
    
    // Default model setting
    await query('INSERT IGNORE INTO settings (`key`, value) VALUES ($1, $2)', ['DEFAULT_AI_MODEL', 'google/gemini-2.5-flash-lite']);

    // Seed sample data if empty
    const animeCountResult = await query('SELECT COUNT(*) as count FROM anime');
    const animeCount = parseInt(animeCountResult.rows[0].count || 0);
    
    if (animeCount === 0) {
      const sampleAnime = await query(`
        INSERT INTO anime (title, description, genre, poster_url, rating, status, type, release_year)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'Solo Leveling',
        'In a world where hunters must battle deadly monsters to protect mankind, Sung Jinwoo, a notoriously weak hunter, finds himself in a struggle for survival.',
        'Action, Fantasy',
        'https://picsum.photos/seed/solo/800/1200',
        9.8,
        'Ongoing',
        'TV Series',
        '2024'
      ]);

      const animeId = sampleAnime.insertId;
      await query(`
        INSERT INTO episodes (anime_id, title, video_url, \`order\`, access_type)
        VALUES ($1, $2, $3, $4, $5)
      `, [animeId, 'Episode 1: I\'m Used to It', 'https://www.w3schools.com/html/mov_bbb.mp4', 1, 'free']);
    }

    // Ensure admin@rex.com has admin role
    await query("UPDATE users SET role = 'admin' WHERE email = $1", ['admin@rex.com']);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

async function startServer() {
  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      dbConnected: !!db,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });
  });

  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, country } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const role = email === 'admin@rex.com' ? 'admin' : 'user';
      const result = await query(
        'INSERT INTO users (name, email, password, country, role) VALUES ($1, $2, $3, $4, $5)',
        [name, email, hashedPassword, country, role]
      );
      const user = { id: result.insertId, name, email, role };
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ token, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      if (!user) return res.status(400).json({ error: 'User not found' });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/user/me', authenticateToken, async (req: any, res) => {
    try {
      const result = await query('SELECT id, name, email, role, country, subscription_status FROM users WHERE id = $1', [req.user.id]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Fetch me error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Anime Routes
  app.get('/api/anime', async (req, res) => {
    try {
      const animeResult = await query('SELECT * FROM anime');
      const animes = await Promise.all(animeResult.rows.map(async (anime: any) => {
        const episodesResult = await query('SELECT * FROM episodes WHERE anime_id = $1 ORDER BY `order` ASC', [anime.id]);
        return {
          id: anime.id?.toString() || '',
          title: anime.title,
          description: anime.description,
          genre: anime.genre,
          posterUrl: anime.poster_url,
          rating: anime.rating,
          status: anime.status,
          type: anime.type,
          releaseYear: anime.release_year,
          episodes: episodesResult.rows.map((ep: any) => ({
            id: ep.id?.toString() || '',
            title: ep.title,
            videoUrl: ep.video_url,
            downloadUrl: ep.download_url,
            accessType: ep.access_type,
            order: ep.order
          }))
        };
      }));
      res.json(animes);
    } catch (error) {
      console.error('Fetch anime error:', error);
      res.status(500).json({ error: 'Failed to fetch anime' });
    }
  });

  app.get('/api/anime/:id/engagement', async (req, res) => {
    const { id } = req.params;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (e) {}
    }

    try {
      const likesCountResult = await query('SELECT COUNT(*) FROM likes WHERE anime_id = $1', [id]);
      const isLikedResult = userId ? await query('SELECT * FROM likes WHERE anime_id = $1 AND user_id = $2', [id, userId]) : { rows: [] };
      const commentsResult = await query(`
        SELECT c.*, u.name as user_name, u.role as user_role 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.anime_id = $1 
        ORDER BY c.created_at DESC
      `, [id]);

      res.json({
        likesCount: parseInt(likesCountResult.rows[0].count || likesCountResult.rows[0]['COUNT(*)'] || 0),
        isLiked: isLikedResult.rows.length > 0,
        comments: commentsResult.rows.map((c: any) => ({
          id: c.id?.toString() || '',
          userId: c.user_id?.toString() || '',
          userName: c.user_name,
          text: c.text,
          createdAt: c.created_at
        }))
      });
    } catch (error) {
      console.error('Fetch engagement error:', error);
      res.status(500).json({ error: 'Failed to fetch engagement data' });
    }
  });

  app.post('/api/anime/:id/like', authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const existingLike = await query('SELECT * FROM likes WHERE anime_id = $1 AND user_id = $2', [id, userId]);
      if (existingLike.rows.length > 0) {
        await query('DELETE FROM likes WHERE anime_id = $1 AND user_id = $2', [id, userId]);
        res.json({ isLiked: false });
      } else {
        await query('INSERT INTO likes (anime_id, user_id) VALUES ($1, $2)', [id, userId]);
        res.json({ isLiked: true });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to toggle like' });
    }
  });

  app.post('/api/anime/:id/comment', authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    try {
      const result = await query(
        'INSERT INTO comments (anime_id, user_id, text) VALUES ($1, $2, $3)',
        [id, userId, text]
      );
      const commentId = result.insertId;
      const userResult = await query('SELECT name FROM users WHERE id = $1', [userId]);
      
      res.json({
        id: commentId.toString(),
        userId: userId.toString(),
        userName: userResult.rows[0]?.name || 'Unknown',
        text: text,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add comment' });
    }
  });

  app.delete('/api/comment/:id', authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
      // Allow if owner or admin
      const comment = await query('SELECT user_id FROM comments WHERE id = $1', [id]);
      if (comment.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
      
      if (comment.rows[0].user_id !== userId && userRole !== 'admin') {
        return res.sendStatus(403);
      }

      await query('DELETE FROM comments WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  });

  // Admin Anime Management
  app.post('/api/admin/anime', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { id, title, description, genre, posterUrl, rating, status, type, releaseYear } = req.body;

    try {
      if (id && !id.toString().startsWith('local_')) {
        // Update existing
        await query(`
          UPDATE anime 
          SET title = $1, description = $2, genre = $3, poster_url = $4, rating = $5, status = $6, type = $7, release_year = $8
          WHERE id = $9
        `, [title, description, genre, posterUrl, rating, status, type, releaseYear, id]);
        res.json({ success: true, id });
      } else {
        // Create new
        const result = await query(`
          INSERT INTO anime (title, description, genre, poster_url, rating, status, type, release_year)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [title, description, genre, posterUrl, rating, status, type, releaseYear]);
        res.json({ success: true, id: result.insertId });
      }
    } catch (error) {
      console.error('Admin anime save error:', error);
      res.status(500).json({ error: 'Failed to save anime' });
    }
  });

  app.delete('/api/admin/anime/:id', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { id } = req.params;

    try {
      await query('DELETE FROM anime WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error('Admin anime delete error:', error);
      res.status(500).json({ error: 'Failed to delete anime' });
    }
  });

  // Admin Episode Management
  app.post('/api/admin/episodes', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { id, animeId, title, videoUrl, downloadUrl, accessType, order } = req.body;

    // Ensure numeric values are actually numbers
    const parsedAnimeId = parseInt(animeId);
    const parsedOrder = parseInt(order);

    if (isNaN(parsedAnimeId) || isNaN(parsedOrder)) {
      return res.status(400).json({ error: 'Invalid animeId or order' });
    }

    try {
      if (id && !id.toString().startsWith('local_')) {
        await query(`
          UPDATE episodes 
          SET title = $1, video_url = $2, download_url = $3, access_type = $4, \`order\` = $5
          WHERE id = $6
        `, [title, videoUrl, downloadUrl, accessType, parsedOrder, id]);
        res.json({ success: true, id });
      } else {
        const result = await query(`
          INSERT INTO episodes (anime_id, title, video_url, download_url, access_type, \`order\`)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [parsedAnimeId, title, videoUrl, downloadUrl, accessType, parsedOrder]);
        res.json({ success: true, id: result.insertId });
      }
    } catch (error) {
      console.error('Admin episode save error:', error);
      res.status(500).json({ error: 'Failed to save episode' });
    }
  });

  app.delete('/api/admin/episodes/:id', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { id } = req.params;

    try {
      await query('DELETE FROM episodes WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error('Admin episode delete error:', error);
      res.status(500).json({ error: 'Failed to delete episode' });
    }
  });

  app.get('/api/admin/redeem-codes', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
      const result = await query('SELECT r.*, u.name as used_by_name FROM redeem_codes r LEFT JOIN users u ON r.used_by = u.id ORDER BY r.created_at DESC');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch redeem codes' });
    }
  });

  app.post('/api/admin/redeem-codes', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { code, planId } = req.body;
    try {
      await query('INSERT INTO redeem_codes (code, plan_id) VALUES ($1, $2)', [code, planId]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create redeem code' });
    }
  });

  app.post('/api/user/redeem', authenticateToken, async (req: any, res) => {
    const { code } = req.body;
    const userId = req.user.id;

    try {
      const codeResult = await query('SELECT * FROM redeem_codes WHERE code = $1 AND is_used = FALSE', [code]);
      if (codeResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or already used code' });
      }

      const redeemCode = codeResult.rows[0];
      const planId = redeemCode.plan_id;

      // Update user subscription
      await query('UPDATE users SET subscription_status = "active", subscription_plan = $1 WHERE id = $2', [planId, userId]);
      
      // Mark code as used
      await query('UPDATE redeem_codes SET is_used = TRUE, used_by = $1 WHERE id = $2', [userId, redeemCode.id]);

      res.json({ success: true, planName: planId });
    } catch (error) {
      console.error('Redeem error:', error);
      res.status(500).json({ error: 'Failed to redeem code' });
    }
  });

  app.post('/api/admin/db-config', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const newConfig = req.body;
    
    try {
      const configPath = path.join(process.cwd(), 'db-config.json');
      fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
      
      // Close old pool if exists
      if (db) {
        await db.end();
        db = null;
      }
      
      // Try to connect with new config
      await connectDatabase();
      
      // Setup database schema on new DB
      await setupDatabase();
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to update DB config:', error);
      res.status(500).json({ error: `Failed to update DB config: ${error.message}` });
    }
  });

  app.get('/api/admin/db-config', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
      const configPath = path.join(process.cwd(), 'db-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        res.json(config);
      } else {
        res.status(404).json({ error: 'Config file not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to read DB config' });
    }
  });

  app.get('/api/admin/settings', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
      const result = await query('SELECT * FROM settings');
      const settings: any = {};
      result.rows.forEach((row: any) => {
        settings[row.key] = row.value;
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.post('/api/admin/settings', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const settings = req.body;
    try {
      for (const [key, value] of Object.entries(settings)) {
        await query('INSERT INTO settings (\`key\`, value) VALUES ($1, $2) ON DUPLICATE KEY UPDATE value = $2', [key, value]);
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Settings save error:', error);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });

  app.get('/api/admin/users', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
      const result = await query('SELECT id, name, email, role, country, subscription_status, created_at FROM users ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/admin/users/:id/role', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { id } = req.params;
    const { role } = req.body;
    try {
      await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update role' });
    }
  });

  app.post('/api/admin/users/:id/subscription', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { id } = req.params;
    const { status } = req.body;
    try {
      await query('UPDATE users SET subscription_status = $1 WHERE id = $2', [status, id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update subscription' });
    }
  });

  app.get('/api/admin/requests', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
      const result = await query(`
        SELECT r.*, u.name as user_name, u.email as user_email 
        FROM purchase_requests r 
        JOIN users u ON r.user_id = u.id 
        ORDER BY r.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });

  app.post('/api/admin/requests/:id/approve', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { id } = req.params;
    try {
      const requestResult = await query('SELECT * FROM purchase_requests WHERE id = $1', [id]);
      if (requestResult.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
      
      const purchaseRequest = requestResult.rows[0];
      
      // Update user subscription
      await query('UPDATE users SET subscription_status = "active", subscription_plan = $1 WHERE id = $2', [purchaseRequest.plan_id, purchaseRequest.user_id]);
      
      // Update request status
      await query('UPDATE purchase_requests SET status = "approved" WHERE id = $1', [id]);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to approve request' });
    }
  });

  app.post('/api/admin/requests/:id/reject', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { id } = req.params;
    try {
      await query('UPDATE purchase_requests SET status = "rejected" WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reject request' });
    }
  });

  app.post('/api/user/request-subscription', authenticateToken, async (req: any, res) => {
    const { planId, amount, utr, screenshotUrl } = req.body;
    const userId = req.user.id;
    try {
      await query(`
        INSERT INTO purchase_requests (user_id, plan_id, amount, utr, screenshot_url)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, planId, amount, utr, screenshotUrl]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit request' });
    }
  });

  app.get('/api/admin/stats', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
      const usersCount = await query('SELECT COUNT(*) as count FROM users');
      const premiumCount = await query("SELECT COUNT(*) as count FROM users WHERE subscription_status = 'active'");
      const animeCount = await query('SELECT COUNT(*) as count FROM anime');

      const pendingRequests = await query("SELECT COUNT(*) as count FROM purchase_requests WHERE status = 'pending'");

      res.json({
        totalUsers: parseInt(usersCount.rows[0].count || 0),
        premiumUsers: parseInt(premiumCount.rows[0].count || 0),
        totalAnime: parseInt(animeCount.rows[0].count || 0),
        pendingRequests: parseInt(pendingRequests.rows[0].count || 0)
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  });

  app.get('/api/settings/public', async (req, res) => {
    try {
      const result = await query('SELECT * FROM settings');
      const settings: any = {};
      result.rows.forEach((row: any) => {
        // Only expose non-sensitive settings publicly
        if (!row.key.toLowerCase().includes('token') && !row.key.toLowerCase().includes('secret')) {
          settings[row.key] = row.value;
        }
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.post('/api/ai/proxy', async (req, res) => {
    try {
      const settingsResult = await query('SELECT `key`, value FROM settings WHERE `key` IN ($1, $2)', ['VITE_SUPABASE_ANON_KEY', 'DEFAULT_AI_MODEL']);
      const settings = settingsResult.rows.reduce((acc: any, row: any) => {
        acc[row.key] = row.value;
        return acc;
      }, {});

      const apiKey = settings['VITE_SUPABASE_ANON_KEY'];
      const defaultModel = settings['DEFAULT_AI_MODEL'] || 'google/gemini-2.5-flash-lite';

      if (!apiKey) {
        return res.status(500).json({ error: 'AI Service not configured in database. Please add Supabase Anon Key in Admin Settings.' });
      }

      const requestBody = {
        ...req.body,
        model: req.body.model || defaultModel
      };

      console.log(`AI Proxy Request to Supabase using model: ${requestBody.model}`);
      const response = await fetch("https://dewyfiyiqdveqaockzfn.supabase.co/functions/v1/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey,
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Supabase Error:", errorText);
        return res.status(response.status).json({ error: errorText });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: `AI Proxy Error: ${error.message}` });
    }
  });

  app.post('/api/ai/tts', async (req, res) => {
    const { text } = req.body;
    
    try {
      // Try to get key from database first, then environment
      const result = await query('SELECT value FROM settings WHERE `key` = $1', ['GEMINI_API_KEY']);
      let apiKey = result.rows[0]?.value || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured. Please add it in Admin Settings.' });
      }

      const { GoogleGenAI, Modality } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say naturally in a friendly Hinglish tone: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audio: `data:audio/wav;base64,${base64Audio}` });
      } else {
        res.status(500).json({ error: 'Failed to generate audio' });
      }
    } catch (error: any) {
      console.error("TTS Proxy Error:", error);
      res.status(500).json({ error: `TTS Error: ${error.message}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', async () => {
      console.log(`Server running on http://localhost:${PORT}`);
      
      // Connect to database in the background after server is up
      try {
        await connectDatabase();
        if (db) {
          await setupDatabase();
        }
      } catch (error) {
        console.error('Background database initialization failed:', error);
      }
    });
  } else {
    // In Vercel, we need to initialize DB on the first request or here
    // But since Vercel functions are stateless, we'll try to connect when needed
    connectDatabase().then(() => {
      if (db) setupDatabase();
    }).catch(console.error);
  }
}

startServer();

export default app;
