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
    private burstDelay: number = 200;

    constructor(scene: Phaser.Scene, x: number, y: number, spriteKey: string = 'ranged-enemy', projectileKey: string = 'projectile') {
        super(scene, x, y);
        
        this.setTexture(spriteKey);
        this.projectileSprite = projectileKey;
        
        //stationary
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setVelocity(0, 0);
        
        //create projectile with group
        this.projectiles = scene.add.group({
            classType: Projectile,
            maxSize: 10,
            runChildUpdate: true,
            createCallback: (proj) => {
                (proj as Projectile).setTexture(this.projectileSprite);
            }
        });
    }

    update(player: Player): void {
        this.updateHealthBar();

        const currentTime = this.scene.time.now;
        if (currentTime - this.lastShootTime >= this.shootCooldown && this.burstCount === 0) {
            //start a new burst
            this.maxBurst = Phaser.Math.Between(2, 3);
            this.shoot(player);
            this.burstCount = 1;
            this.lastShootTime = currentTime;
        } else if (this.burstCount > 0 && this.burstCount < this.maxBurst && 
                  currentTime - this.lastShootTime >= this.burstDelay) {
            //continue burst
            this.shoot(player);
            this.burstCount++;
            this.lastShootTime = currentTime;
            
            //reset
            if (this.burstCount >= this.maxBurst) {
                this.burstCount = 0;
                this.lastShootTime = currentTime;
            }
        }

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