export abstract class Weapon {
    readonly name: string;
    readonly spriteKey: string;
    readonly damage: number;
    private _cooldown: number;

    constructor(
        name: string,
        spriteKey: string,
        damage: number = 10,
        cooldown: number = 250
    ) {
        this.name = name;
        this.spriteKey = spriteKey;
        this.damage = damage;
        this._cooldown = cooldown;
    }

    get cooldown(): number {
        return this._cooldown;
    }

    set cooldown(value: number) {
        this._cooldown = value;
    }

    abstract use(scene: Phaser.Scene, x: number, y: number, facing: number, attack: number): void;
}