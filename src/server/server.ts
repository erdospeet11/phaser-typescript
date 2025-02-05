import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import cors from 'cors';

const app = express();

// Configure CORS before other middleware
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true
}));

app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Database initialization
let db: any;
async function initializeDb() {
    const dbPath = path.resolve(__dirname, '../../scores.db');
    console.log('Attempting to create/open database at:', dbPath);
    
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Create scores table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_name TEXT NOT NULL,
                score INTEGER NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create users table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                is_admin BOOLEAN DEFAULT 0
            )
        `);

        // Create game_rules table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS game_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rule_name TEXT UNIQUE NOT NULL,
                rule_value REAL NOT NULL,
                description TEXT
            )
        `);

        // Insert default admin user if not exists
        await db.run(`
            INSERT OR IGNORE INTO users (username, password, is_admin)
            VALUES ('admin', 'admin', 1)
        `);

        // Insert default game rules if not exists
        const defaultRules = [
            ['playerHealth', 100, 'Base player health'],
            ['playerSpeed', 1.0, 'Base player movement speed'],
            ['playerAttack', 10, 'Base player attack damage'],
            ['enemyHealth', 50, 'Base enemy health'],
            ['enemySpeed', 0.5, 'Base enemy movement speed'],
            ['enemyAttack', 10, 'Base enemy attack damage'],
            ['maxEnemies', 5, 'Maximum number of enemies'],
            ['spawnInterval', 2000, 'Enemy spawn interval in milliseconds']
        ];

        for (const [name, value, description] of defaultRules) {
            await db.run(`
                INSERT OR IGNORE INTO game_rules (rule_name, rule_value, description)
                VALUES (?, ?, ?)
            `, [name, value, description]);
        }
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
}

initializeDb().catch(console.error);

// API Routes
app.post('/api/scores', async (req, res) => {
    const { playerName, score } = req.body;
    try {
        await db.run(
            'INSERT INTO scores (player_name, score) VALUES (?, ?)',
            [playerName, score]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save score' });
    }
});

app.get('/api/scores', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const scores = await db.all(
            'SELECT player_name, score, date FROM scores ORDER BY score DESC LIMIT ?',
            [limit]
        );
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get scores' });
    }
});

app.post('/api/scores/clear', async (req, res) => {
    try {
        await db.run('DELETE FROM scores');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear scores' });
    }
});

// User authentication
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.get(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        if (user) {
            res.json({ 
                success: true, 
                isAdmin: user.is_admin 
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Game rules endpoints
app.get('/api/rules', async (req, res) => {
    try {
        const rules = await db.all('SELECT * FROM game_rules');
        res.json(rules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get rules' });
    }
});

app.post('/api/rules/update', async (req, res) => {
    const { rules } = req.body;
    try {
        for (const rule of rules) {
            await db.run(
                'UPDATE game_rules SET rule_value = ? WHERE rule_name = ?',
                [rule.value, rule.name]
            );
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update rules' });
    }
});

app.post('/api/rules/reset', async (req, res) => {
    try {
        const defaultRules = {
            playerHealth: 100,
            playerSpeed: 1.0,
            playerAttack: 10,
            enemyHealth: 50,
            enemySpeed: 0.5,
            enemyAttack: 10,
            maxEnemies: 5,
            spawnInterval: 2000
        };

        for (const [name, value] of Object.entries(defaultRules)) {
            await db.run(
                'UPDATE game_rules SET rule_value = ? WHERE rule_name = ?',
                [value, name]
            );
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset rules' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 