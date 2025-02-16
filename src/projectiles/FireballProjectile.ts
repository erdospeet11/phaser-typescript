import { Projectile } from '../Projectile';
import { Enemy } from '../enemies/Enemy';
import { BurnEffect } from '../effects/BurnEffect';
import { FloatingDamage } from '../effects/FloatingDamage';

export class FireballProjectile extends Projectile {
    private burnDamage: number;
    private readonly BURN_DURATION = 3000;

    constructor(scene: Phaser.Scene, x: number, y: number, spriteKey: string, attack: number) {
        super(scene, x, y, 'fireball', attack);
        this.burnDamage = attack;
    }

    handleEnemyCollision(enemy: Enemy): void {
        enemy.damage(this.getDamage());

        const burnEffect = new BurnEffect(
            this.scene, 
            enemy, 
            this.burnDamage,
            this.BURN_DURATION
        );
        
        new FloatingDamage(
            this.scene,
            enemy.x,
            enemy.y - 20,
            this.burnDamage,
            false,
            '🔥',
            0xFFA500
        );
    }
} 