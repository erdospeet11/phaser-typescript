import { Ability } from './Ability';

export class Fireball extends Ability {
    private damage: number;
    private speed: number;

    constructor(scene: Phaser.Scene, owner: Phaser.GameObjects.Sprite) {
        super(scene, owner, 2); // 2 second cooldown
        this.damage = 20;
        this.speed = 300;
    }

    use(): void {
        if (!this.canUse()) return;

        // Create fireball sprite/projectile
        const fireball = this.scene.physics.add.sprite(
            this.owner.x,
            this.owner.y,
            'fireball'
        );

        // Get mouse position for direction
        const pointer = this.scene.input.activePointer;
        const angle = Phaser.Math.Angle.Between(
            this.owner.x,
            this.owner.y,
            pointer.worldX,
            pointer.worldY
        );

        // Set velocity based on angle
        fireball.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );

        // Start cooldown
        this.startCooldown();
    }
} 