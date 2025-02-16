const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

//database connections
const dbs = {
    scores: new sqlite3.Database('./scores.db'),
    game: new sqlite3.Database('./game.db')
};

//cors middleware for all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//init databases
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

//root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//scores endpoints
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

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    dbs.scores.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.status(201).json({ message: 'User registered successfully' });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    dbs.scores.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        if (row) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        res.status(200).json({ 
            message: 'Admin login successful',
            isAdmin: true 
        });
    } else {
        res.status(401).json({ message: 'Invalid admin credentials' });
    }
});

//game endpoints
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

//admin route protection
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

function cleanup() {
    console.log('Closing database connections...');
    Object.values(dbs).forEach(db => db.close());
    process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});