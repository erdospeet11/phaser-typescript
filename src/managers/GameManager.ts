export class GameManager {
    private static instance: GameManager | null = null;
    private score: number = 0;
    private gold: number = 0;
    private health: number = 100;
    private maxHealth: number = 100;
    private attack: number;
    private defense: number = 5;
    private speed: number;
    private experience: number = 0;
    private level: number = 1;
    private experienceToNextLevel: number = 100;
    private playerClass: string = '';

    private constructor() {
        this.attack = 4;  // Default values
        this.speed = 1;
    }

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        console.log(GameManager.instance);
        return GameManager.instance;
    }

    public getScore(): number {
        return this.score;
    }

    public addScore(amount: number): void {
        this.score += amount;
    }

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

    public increaseMaxHealth(amount: number): void {
        this.maxHealth += amount;
        this.health = this.maxHealth;
    }

    public getAttack(): number {
        return this.attack;
    }

    public setAttack(value: number): void {
        this.attack = value;
    }

    public getDefense(): number {
        return this.defense;
    }

    public setDefense(value: number): void {
        this.defense = value;
    }

    public getSpeed(): number {
        return this.speed;
    }

    public setSpeed(value: number): void {
        this.speed = value;
    }

    public getExperience(): number {
        return this.experience;
    }

    public setExperience(value: number): void {
        this.experience = value;
    }

    public getLevel(): number {
        return this.level;
    }

    public setLevel(value: number): void {
        this.level = value;
    }

    public getExperienceToNextLevel(): number {
        return this.experienceToNextLevel;
    }

    public setExperienceToNextLevel(value: number): void {
        this.experienceToNextLevel = value;
    }

    //reset method for new game
    public reset(): void {
        this.score = 0;
        this.gold = 0;
        this.health = this.maxHealth;
    }

    public setMaxHealth(value: number): void {
        this.maxHealth = value;
    }

    public static destroyInstance(): void {
        GameManager.instance = null;
    }

    public setInitialClassStats(playerClass: string): void {
        this.playerClass = playerClass;
        switch (playerClass) {
            case 'MAGE':
                this.speed = 1;
                break;
            case 'ARCHER':
                this.speed = 1;
                break;
            case 'WARRIOR':
                this.speed = 1;
                break;
            case 'THING':
                this.speed = 1;
                break;
        }
    }
} 