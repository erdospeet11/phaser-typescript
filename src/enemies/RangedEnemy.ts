import { Enemy } from './Enemy';
import { Player } from '../Player';
import { Projectile } from '../Projectile';

export class RangedEnemy extends Enemy {
    private projectiles: Phaser.GameObjects.Group;
    private lastShootTime: number = 0;
    private shootCooldown: number = 5000; // 5 seconds in milliseconds

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        
        // Change the sprite texture
        this.setTexture('ranged-enemy');
        
        // Make the enemy stationary
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(16, 16);
        body.setImmovable(true); // Make it immovable
        body.setVelocity(0, 0); // Set velocity to 0
        
        // Create projectiles group
        this.projectiles = scene.add.group({
            classType: Projectile,
            maxSize: 10,
            runChildUpdate: true
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