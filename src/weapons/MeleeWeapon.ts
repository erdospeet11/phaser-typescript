import { Weapon } from './Weapon';

export class MeleeWeapon extends Weapon {
    private hitbox!: Phaser.GameObjects.Rectangle;
    private isAttacking: boolean = false;
    private attackDuration: number = 100;
    private attackRange: number = 32;

    constructor(
        name: string,
        spriteKey: string,
        damage: number = 15, //smaller damage
        cooldown: number = 400 //longer cooldown
    ) {
        super(name, spriteKey, damage, cooldown);
    }

    use(scene: Phaser.Scene, x: number, y: number, angle: number): void {
        if (this.isAttacking) return;
        
        this.isAttacking = true;

        // Create hitbox
        if (!this.hitbox) {
            this.hitbox = scene.add.rectangle(x, y, this.attackRange, this.attackRange);
            scene.physics.add.existing(this.hitbox, true);
            this.hitbox.setVisible(false); // Hide the hitbox
        }

        // Position hitbox
        const offsetX = Math.cos(angle) * (this.attackRange / 2);
        const offsetY = Math.sin(angle) * (this.attackRange / 2);
        this.hitbox.setPosition(x + offsetX, y + offsetY);

        // Get all enemies in the scene
        const enemies = scene.physics.overlapRect(
            this.hitbox.x - this.attackRange/2,
            this.hitbox.y - this.attackRange/2,
            this.attackRange,
            this.attackRange
        );

        // Damage enemies in range
        enemies.forEach(enemy => {
            const gameObject = enemy.gameObject as any;
            if (gameObject && 'damage' in gameObject) {
                gameObject.damage(this.damage);
            }
        });

        // Reset
        scene.time.delayedCall(this.attackDuration, () => {
            this.isAttacking = false;
            this.hitbox.destroy();
            this.hitbox = undefined!;
        });
    }

    getProjectiles(): Phaser.GameObjects.Group {
        return null!; // Melee weapons don't have projectiles
    }
} 