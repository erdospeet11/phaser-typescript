export abstract class Item {
    protected id: string;
    protected name: string;
    protected description: string;
    protected sprite: string;
    protected stackable: boolean;
    protected maxStack: number;

    constructor(id: string, name: string, description: string, sprite: string, stackable = false, maxStack = 1) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.sprite = sprite;
        this.stackable = stackable;
        this.maxStack = maxStack;
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getDescription(): string {
        return this.description;
    }

    public getSprite(): string {
        return this.sprite;
    }

    public isStackable(): boolean {
        return this.stackable;
    }

    public getMaxStack(): number {
        return this.maxStack;
    }

    abstract use(owner: Phaser.GameObjects.Sprite): void;
} 