export abstract class Weapon {
    readonly name: string;
    readonly spriteKey: string;
    readonly damage: number;
    readonly cooldown: number;

    constructor(
        name: string,
        spriteKey: string,
        damage: number = 10,
        cooldown: number = 250
    ) {
        this.name = name;
        this.spriteKey = spriteKey;
        this.damage = damage;
        this.cooldown = cooldown;
    }

    abstract use(scene: Phaser.Scene, x: number, y: number, angle: number): void;
}