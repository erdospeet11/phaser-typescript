export class GameDatabase {
    private static instance: GameDatabase;
    private db!: IDBDatabase;
    private readonly DB_NAME = 'gameScores';
    private readonly STORE_NAME = 'scores';
    private dbReady: Promise<void>;

    private constructor() {
        this.dbReady = this.initDB();
    }

    public static getInstance(): GameDatabase {
        if (!GameDatabase.instance) {
            GameDatabase.instance = new GameDatabase();
        }
        return GameDatabase.instance;
    }

    private initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);

            request.onerror = () => {
                console.error("Error opening database");
                reject();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };
        });
    }

    public async saveScore(playerName: string, score: number, level: number): Promise<void> {
        await this.dbReady;
        
        const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        
        store.add({
            playerName,
            score,
            level,
            date: new Date()
        });
    }

    public async getTopScores(limit: number = 10): Promise<any[]> {
        await this.dbReady;
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const scores = request.result
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit);
                resolve(scores);
            };
        });
    }
} 