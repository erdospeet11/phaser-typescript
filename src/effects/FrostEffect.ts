import { StatusEffect } from './StatusEffect';
import { Player } from '../Player';
import { Enemy } from '../enemies/Enemy';

export class FrostEffect extends StatusEffect {
    private readonly SLOW_FACTOR = 0.5;
    private originalSpeed: number;

    constructor(scene: Phaser.Scene, target: Phaser.GameObjects.Sprite) {
        super(scene, target);
        
        // Store original speed
        this.originalSpeed = (target instanceof Player) ? 
            (target as Player).getSpeed() : 
            (target instanceof Enemy) ? 
                (target as Enemy).getSpeed() : 1;
    }

    apply(): void {
        this.target.setTint(0x00ffff);
        if (this.target instanceof Player) {
            (this.target as Player).setSpeed(this.originalSpeed * this.SLOW_FACTOR);
        } else if (this.target instanceof Enemy) {
            (this.target as Enemy).setSpeed(this.originalSpeed * this.SLOW_FACTOR);
        }
    }

    tick(): void {
        // No tick effect needed for frost
    }

    protected remove(): void {
        this.target.clearTint();
        if (this.target instanceof Player) {
            (this.target as Player).setSpeed(this.originalSpeed);
        } else if (this.target instanceof Enemy) {
            (this.target as Enemy).setSpeed(this.originalSpeed);
        }
        super.remove();
    }
} 