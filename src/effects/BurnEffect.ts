import { StatusEffect } from './StatusEffect';
import { Player } from '../Player';
import { Enemy } from '../enemies/Enemy';

export class BurnEffect extends StatusEffect {
    private readonly DAMAGE_PER_TICK = 5;
    private readonly TICK_INTERVAL = 1000; // 1 second
    private tickTimer: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, target: Phaser.GameObjects.Sprite) {
        super(scene, target);
        
        // Ticking damage
        this.tickTimer = scene.time.addEvent({
            delay: this.TICK_INTERVAL,
            callback: this.tick,
            callbackScope: this,
            loop: true
        });
    }

    apply(): void {
        this.target.setTint(0xff4400);
    }

    tick(): void {
        if (this.target instanceof Player) {
            (this.target as Player).damage(this.DAMAGE_PER_TICK);
        } else if (this.target instanceof Enemy) {
            (this.target as Enemy).damage(this.DAMAGE_PER_TICK);
        }
    }

    protected remove(): void {
        this.target.clearTint();
        this.tickTimer.remove();
        super.remove();
    }
} 