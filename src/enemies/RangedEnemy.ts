import { Enemy } from './Enemy';
import { Player } from '../Player';
import { Projectile } from '../Projectile';

export class RangedEnemy extends Enemy {
    private projectiles: Phaser.GameObjects.Group;
    private lastShootTime: number = 0;
    private shootCooldown: number = 5000;
    private projectileSprite: string;
    private burstCount: number = 0;
    private maxBurst: number = 0;
    private burstDelay: number = 200; // 200ms between each shot in burst

    constructor(scene: Phaser.Scene, x: number, y: number, spriteKey: string = 'ranged-enemy', projectileKey: string = 'projectile') {
        super(scene, x, y);
        
        this.setTexture(spriteKey);
        this.projectileSprite = projectileKey;
        
        // It does not move
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setVelocity(0, 0);
        
        // Create projectile with group
        this.projectiles = scene.add.group({
            classType: Projectile,
            maxSize: 10,
            runChildUpdate: true,
            createCallback: (proj) => {
                // Set custom projectile sprite
                (proj as Projectile).setTexture(this.projectileSprite);
            }
        });
    }

    update(player: Player): void {
        this.updateHealthBar();

        // Shoot
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastShootTime >= this.shootCooldown && this.burstCount === 0) {
            // Start a new burst
            this.maxBurst = Phaser.Math.Between(2, 3); // Randomly choose 2 or 3 shots
            this.shoot(player);
            this.burstCount = 1;
            this.lastShootTime = currentTime;
        } else if (this.burstCount > 0 && this.burstCount < this.maxBurst && 
                  currentTime - this.lastShootTime >= this.burstDelay) {
            // Continue burst
            this.shoot(player);
            this.burstCount++;
            this.lastShootTime = currentTime;
            
            // Reset burst when complete
            if (this.burstCount >= this.maxBurst) {
                this.burstCount = 0;
                this.lastShootTime = currentTime; // Start cooldown for next burst
            }
        }

        // Update facing direction
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
            projectile.setTexture(this.projectileSprite);
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