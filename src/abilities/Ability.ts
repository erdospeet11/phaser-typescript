export abstract class Ability {
    protected cooldown: number;
    protected isOnCooldown: boolean;
    protected owner: Phaser.GameObjects.Sprite;
    protected scene: Phaser.Scene;
    
    constructor(scene: Phaser.Scene, owner: Phaser.GameObjects.Sprite, cooldown: number) {
        this.scene = scene;
        this.owner = owner;
        this.cooldown = cooldown;
        this.isOnCooldown = false;
    }

    abstract use(): void;

    protected startCooldown(): void {
        this.isOnCooldown = true;
        this.scene.time.delayedCall(this.cooldown * 1000, () => {
            this.isOnCooldown = false;
        });
    }

    public canUse(): boolean {
        return !this.isOnCooldown;
    }
} 