import { Pickup } from './Pickup';
import { Player } from '../Player';

export class SpeedPickup extends Pickup {
    private duration: number = 5000;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'speed-pickup');
    }

    collect(player: Player): void {
        // Original speed
        const originalSpeed = player.getSpeed();
        
        // Increase speed
        player.setSpeed(originalSpeed + 1);

        // Timer
        this.scene.time.delayedCall(this.duration, () => {
            player.setSpeed(originalSpeed);
        });

        // Visual effect
        player.setTint(0x00ffff);
        this.scene.time.delayedCall(this.duration, () => {
            player.clearTint();
        });

        this.destroy();
    }
}
