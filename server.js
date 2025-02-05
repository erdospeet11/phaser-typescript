const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

// Create database connections
const dbs = {
    scores: new sqlite3.Database('./scores.db'),
    game: new sqlite3.Database('./game.db')  // Add another database
};

// Add CORS middleware with proper configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:9001');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Middleware to parse JSON
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize databases with their tables
dbs.scores.serialize(() => {
    dbs.scores.run(`CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

dbs.game.serialize(() => {
    dbs.game.run(`CREATE TABLE IF NOT EXISTS game_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id TEXT NOT NULL,
        data JSON,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Scores API endpoints
app.get('/api/scores', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    dbs.scores.all('SELECT * FROM scores ORDER BY score DESC LIMIT ?', [limit], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json(rows);
    });
});

app.post('/api/scores', (req, res) => {
    const { playerName, score } = req.body;
    dbs.scores.run('INSERT INTO scores (player_name, score) VALUES (?, ?)', [playerName, score], (err) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.status(201).json({ message: 'Score saved successfully' });
    });
});

app.post('/api/scores/clear', (req, res) => {
    dbs.scores.run('DELETE FROM scores', (err) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json({ message: 'All scores cleared' });
    });
});

// Game data API endpoints (example)
app.get('/api/game/:playerId', (req, res) => {
    const { playerId } = req.params;
    dbs.game.get('SELECT data FROM game_data WHERE player_id = ?', [playerId], (err, row) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json(row ? JSON.parse(row.data) : {});
    });
});

app.post('/api/game/:playerId', (req, res) => {
    const { playerId } = req.params;
    const { data } = req.body;
    dbs.game.run(
        'INSERT OR REPLACE INTO game_data (player_id, data) VALUES (?, ?)',
        [playerId, JSON.stringify(data)],
        (err) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.json({ message: 'Game data saved successfully' });
        }
    );
});

// Cleanup function for when the server shuts down
function cleanup() {
    console.log('Closing database connections...');
    Object.values(dbs).forEach(db => db.close());
    process.exit(0);
}

// Handle cleanup on server shutdown
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});