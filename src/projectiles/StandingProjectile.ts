import { Projectile } from '../Projectile';
import { Enemy } from '../enemies/Enemy';
import { FloatingDamage } from '../effects/FloatingDamage';

export class StandingProjectile extends Projectile {
    private readonly ACCELERATION = 5;
    private readonly MAX_SPEED = 10;
    private readonly DECELERATION = -300;
    private readonly FLIGHT_TIME = 200; // Time in ms before starting to decelerate
    private readonly LIFETIME = 30000; // 30 seconds total lifetime
    private flightTimer: number = 0;
    private isDecelerating: boolean = false;
    private isStopped: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, spriteKey?: string, attack: number = 25) {
        super(scene, x, y, spriteKey || 'standing-projectile', attack);
        super(scene, x, y, spriteKey || 'standing-projectile', attack);

        // Destroy after lifetime
        scene.time.delayedCall(this.LIFETIME, () => {
            this.destroy();
        });
    }

    preUpdate(time: number, delta: number): void {
        if (this.isStopped) return;

        this.flightTimer += delta;
        const body = this.body as Phaser.Physics.Arcade.Body;
        const currentVelocity = new Phaser.Math.Vector2(body.velocity.x, body.velocity.y);
        const speed = currentVelocity.length();

        if (this.flightTimer <= this.FLIGHT_TIME) {
            // Acceleration phase
            if (speed < this.MAX_SPEED) {
                const direction = currentVelocity.normalize();
                const newSpeed = Math.min(speed + (this.ACCELERATION * delta / 1000), this.MAX_SPEED);
                body.setVelocity(
                    direction.x * newSpeed,
                    direction.y * newSpeed
                );
            }
        } else if (!this.isDecelerating) {
            // Start deceleration
            this.isDecelerating = true;
        }

        if (this.isDecelerating) {
            // Deceleration phase
            if (speed > 0) {
                const direction = currentVelocity.normalize();
                const newSpeed = Math.max(speed + (this.DECELERATION * delta / 1000), 0);
                if (newSpeed === 0) {
                    this.isStopped = true;
                    body.setVelocity(0, 0);
                } else {
                    body.setVelocity(
                        direction.x * newSpeed,
                        direction.y * newSpeed
                    );
                }
            }
        }
    }

    handleEnemyCollision(enemy: Enemy): void {
        const damage = this.getDamage();
        enemy.damage(damage);

        // Show floating damage
        new FloatingDamage(
            this.scene,
            enemy.x,
            enemy.y - 20,
            damage,
            false,
            '✨', // Sparkle emoji for standing projectile
            0x00ffff // Cyan color
        );

        this.destroy();
    }
} 