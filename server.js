const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 9001;

//database connections
const dbs = {
    scores: new sqlite3.Database('./scores.db'),
    game: new sqlite3.Database('./game.db')
};

//cors middleware for all origins
app.use((req, res, next) => {
    //get origin header
    const origin = req.headers.origin;
    
    //allow any request from localhost or 127.0.0.1
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
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

//get a single score
app.get('/api/scores/:id', (req, res) => {
    const { id } = req.params;
    dbs.scores.get('SELECT * FROM scores WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Score not found' });
            return;
        }
        res.json(row);
    });
});

//delete a single score
app.delete('/api/scores/:id', (req, res) => {
    const { id } = req.params;
    dbs.scores.run('DELETE FROM scores WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Score not found' });
            return;
        }
        
        res.json({ message: 'Score deleted successfully' });
    });
});

app.post('/api/scores', (req, res) => {
    const { playerName, score } = req.body;
    
    console.log('Received score save request:', { playerName, score });
    
    if (!playerName || score === undefined) {
        console.error('Invalid score data:', req.body);
        return res.status(400).json({ error: 'Invalid score data. playerName and score are required.' });
    }
    
    dbs.scores.run('INSERT INTO scores (player_name, score) VALUES (?, ?)', [playerName, score], function(err) {
        if (err) {
            console.error('Database error when saving score:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        
        console.log(`Score saved successfully: ${playerName} - ${score}, ID: ${this.lastID}`);
        res.status(201).json({ 
            message: 'Score saved successfully',
            id: this.lastID
        });
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

//game data endpoints
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

// User registration endpoint
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if username already exists
    dbs.scores.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (row) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        
        // Insert new user
        dbs.scores.run(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, password],
            function(err) {
                if (err) {
                    console.error("Error registering user:", err);
                    return res.status(500).json({ error: 'Failed to register user' });
                }
                
                res.status(201).json({ 
                    message: 'Registration successful',
                    userId: this.lastID
                });
            }
        );
    });
});

// User login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    dbs.scores.get(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, row) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!row) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            res.json({
                message: 'Login successful',
                userId: row.id,
                username: row.username
            });
        }
    );
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    dbs.scores.get(
        "SELECT * FROM users WHERE username = ? AND password = ? AND is_admin = 1",
        [username, password],
        (err, row) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!row) {
                return res.status(401).json({ error: 'Invalid admin credentials' });
            }
            
            res.json({
                message: 'Admin login successful',
                userId: row.id,
                username: row.username,
                isAdmin: true
            });
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