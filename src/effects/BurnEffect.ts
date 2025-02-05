import { StatusEffect } from './StatusEffect';
import { Enemy } from '../enemies/Enemy';
import { FloatingDamage } from './FloatingDamage';

export class BurnEffect extends StatusEffect {
    private tickTimer: Phaser.Time.TimerEvent;
    private readonly tickInterval = 1000; // 1 second between ticks
    private readonly damage: number;
    private readonly enemy: Enemy;

    constructor(scene: Phaser.Scene, enemy: Enemy, damage: number, duration: number) {
        super(scene, enemy);
        this.damage = damage;
        this.enemy = enemy;
        
        // Visual effect - orange tint
        enemy.setTint(0xFFA500);
        
        // Set up damage ticks
        this.tickTimer = scene.time.addEvent({
            delay: this.tickInterval,
            callback: this.applyBurnDamage,
            callbackScope: this,
            repeat: (duration / this.tickInterval) - 1
        });
    }

    private applyBurnDamage(): void {
        if (this.enemy && this.enemy.active) {
            this.enemy.damage(this.damage);
            
            // Show floating damage
            new FloatingDamage(
                this.scene,
                this.enemy.x,
                this.enemy.y - 20,
                this.damage,
                false,
                '🔥',
                0xFFA500
            );
        }
    }

    protected remove(): void {
        if (this.tickTimer) {
            this.tickTimer.destroy();
        }
        if (this.enemy && this.enemy.active) {
            this.enemy.clearTint();
        }
        super.remove();
    }

    apply(): void {
        // Apply is handled in constructor
    }

    tick(): void {
        // Tick is handled by applyBurnDamage
    }
} 