export class GameManager {
    private static instance: GameManager;
    private score: number = 0;
    private gold: number = 0;
    private health: number = 100;
    private maxHealth: number = 100;

    private constructor() {}

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    // Score methods
    public getScore(): number {
        return this.score;
    }

    public addScore(amount: number): void {
        this.score += amount;
    }

    // Gold methods
    public getGold(): number {
        return this.gold;
    }

    public addGold(amount: number): void {
        this.gold += amount;
    }

    public spendGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    // Health methods
    public getHealth(): number {
        return this.health;
    }

    public setHealth(value: number): void {
        this.health = Math.min(value, this.maxHealth);
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public heal(amount: number): void {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    public damage(amount: number): void {
        this.health = Math.max(this.health - amount, 0);
    }

    // Reset method for new games
    public reset(): void {
        this.score = 0;
        this.gold = 0;
        this.health = this.maxHealth;
    }
} 