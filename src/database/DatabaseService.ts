import sqlite3 from 'sqlite3';

export class DatabaseService {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database('game.db');
    this.initDatabase();
  }

  private initDatabase(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS highscores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async saveHighscore(playerName: string, score: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO highscores (player_name, score) VALUES (?, ?)',
        [playerName, score],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }

  async getTopScores(limit: number = 10): Promise<Array<{player_name: string, score: number}>> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT player_name, score FROM highscores ORDER BY score DESC LIMIT ?',
        [limit],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows as Array<{player_name: string, score: number}>);
        }
      );
    });
  }

  async getPlayerBestScore(playerName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT MAX(score) as best_score FROM highscores WHERE player_name = ?',
        [playerName],
        (err, row: { best_score: number | null }) => {
          if (err) reject(err);
          resolve(row?.best_score || 0);
        }
      );
    });
  }
}