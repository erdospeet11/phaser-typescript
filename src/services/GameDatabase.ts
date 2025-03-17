interface Score {
    player_name: string;
    score: number;
    date: string;
}

export class GameDatabase {
    private static instance: GameDatabase;
    private readonly API_URL = 'http://localhost:9001/api';

    private constructor() {}

    public static getInstance(): GameDatabase {
        if (!GameDatabase.instance) {
            GameDatabase.instance = new GameDatabase();
        }
        return GameDatabase.instance;
    }

    public async initialize(): Promise<void> {
        try {
            console.log('Initializing GameDatabase connection...');
            const response = await fetch(`${this.API_URL}/scores?limit=1`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log('GameDatabase API connection established');
        } catch (error) {
            console.error('Failed to connect to API:', error);
        }
    }

    public async saveScore(playerName: string, score: number): Promise<void> {
        try {
            console.log(`Attempting to save score: ${playerName} - ${score}`);
            const response = await fetch(`${this.API_URL}/scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify({ playerName, score })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const result = await response.json();
            console.log(`Score saved successfully: ${playerName} - ${score}`, result);
        } catch (error) {
            console.error('Error saving score:', error);
            throw error;
        }
    }

    public async getTopScores(limit: number = 10): Promise<Score[]> {
        try {
            const response = await fetch(`${this.API_URL}/scores?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting scores:', error);
            return [];
        }
    }

    public async clearScores(): Promise<void> {
        try {
            const response = await fetch(`${this.API_URL}/scores/clear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log('All scores cleared');
        } catch (error) {
            console.error('Error clearing scores:', error);
        }
    }
}

export const database = GameDatabase.getInstance(); 