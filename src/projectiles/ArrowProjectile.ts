import { Projectile } from '../Projectile';
import { Enemy } from '../enemies/Enemy';
import { FloatingDamage } from '../effects/FloatingDamage';

export class ArrowProjectile extends Projectile {
    private static arrowCount: number = 0;
    private readonly POWER_SHOT_MULTIPLIER = 2;
    private readonly POWER_SHOT_SCALE = 1.5;
    private readonly POWER_SHOT_SPEED_REDUCTION = 0.7;
    private isPowerShot: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, spriteKey: string, attack: number) {
        super(scene, x, y, 'arrow', attack);
        
        ArrowProjectile.arrowCount++;
        this.isPowerShot = ArrowProjectile.arrowCount % 4 === 0;

        if (this.isPowerShot) {
            this.setScale(this.POWER_SHOT_SCALE);
            this.setDamage(this.getDamage() * this.POWER_SHOT_MULTIPLIER);
            this.setSpeed(this.speed * this.POWER_SHOT_SPEED_REDUCTION);
            this.setTint(0xFFD700);
        }
    }

    handleEnemyCollision(enemy: Enemy): void {
        const damage = this.getDamage();
        enemy.damage(damage);

        new FloatingDamage(
            this.scene,
            enemy.x,
            enemy.y - 20,
            damage,
            this.isPowerShot,
            this.isPowerShot ? '🎯' : '🏹',
            this.isPowerShot ? 0xFFD700 : 0xffffff
        );
    }
} 