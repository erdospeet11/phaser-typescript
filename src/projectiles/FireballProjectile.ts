import { Projectile } from '../Projectile';
import { Enemy } from '../enemies/Enemy';
import { BurnEffect } from '../effects/BurnEffect';
import { FloatingDamage } from '../effects/FloatingDamage';

export class FireballProjectile extends Projectile {
    private readonly BURN_DAMAGE = 4;
    private readonly BURN_DURATION = 3000;

    constructor(scene: Phaser.Scene, x: number, y: number, spriteKey?: string, attack: number = 20) {
        super(scene, x, y, 'fireball', attack);
    }

    handleEnemyCollision(enemy: Enemy): void {
        enemy.damage(this.getDamage());

        const burnEffect = new BurnEffect(
            this.scene, 
            enemy, 
            this.BURN_DAMAGE,
            this.BURN_DURATION
        );
        
        new FloatingDamage(
            this.scene,
            enemy.x,
            enemy.y - 20,
            this.BURN_DAMAGE,
            false,
            '🔥',
            0xFFA500
        );
    }
} 