import { Enemy } from './Enemy';
import { Player } from '../Player';
import { Projectile } from '../Projectile';

export class RangedEnemy extends Enemy {
    private projectiles: Phaser.GameObjects.Group;
    private lastShootTime: number = 0;
    private shootCooldown: number = 5000; // 5 seconds in milliseconds
    private projectileSprite: string;

    constructor(scene: Phaser.Scene, x: number, y: number, spriteKey: string = 'ranged-enemy', projectileKey: string = 'projectile') {
        super(scene, x, y);
        
        // Use the provided sprite key or fall back to default
        this.setTexture(spriteKey);
        this.projectileSprite = projectileKey;
        
        // Make the enemy stationary
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(16, 16);
        body.setImmovable(true); // Make it immovable
        body.setVelocity(0, 0); // Set velocity to 0
        
        // Create projectiles group with custom sprite
        this.projectiles = scene.add.group({
            classType: Projectile,
            maxSize: 10,
            runChildUpdate: true,
            createCallback: (proj) => {
                // Set the custom sprite when projectile is created
                (proj as Projectile).setTexture(this.projectileSprite);
            }
        });
    }

    update(player: Player): void {
        // Only update health bar and shooting, skip movement
        this.updateHealthBar();

        // Handle shooting
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastShootTime >= this.shootCooldown) {
            this.shoot(player);
            this.lastShootTime = currentTime;
        }

        // Update facing direction without moving
        const dx = player.x - this.x;
        this.setFlipX(dx < 0);
    }

    private shoot(player: Player): void {
        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            player.x,
            player.y
        );

        const projectile = this.projectiles.get(
            this.x,
            this.y
        ) as Projectile;

        if (projectile) {
            projectile.setTexture(this.projectileSprite);  // Ensure correct texture
            projectile.fire({
                x: Math.cos(angle),
                y: Math.sin(angle)
            });
        }
    }

    getProjectiles(): Phaser.GameObjects.Group {
        return this.projectiles;
    }
} 