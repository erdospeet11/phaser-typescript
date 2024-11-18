import { Pickup } from './Pickup';
import { Player } from '../Player';

export class SpeedPickup extends Pickup {
    private duration: number = 5000; // 5 seconds in milliseconds

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'speed-pickup');  // You'll need to add this sprite
    }

    collect(player: Player): void {
        // Store original speed
        const originalSpeed = player.getSpeed();
        
        // Increase speed by 2
        player.setSpeed(originalSpeed + 1);

        // Set timer to revert speed
        this.scene.time.delayedCall(this.duration, () => {
            player.setSpeed(originalSpeed);
        });

        // Optional: Add visual effect to player
        player.setTint(0x00ffff);  // Cyan tint
        this.scene.time.delayedCall(this.duration, () => {
            player.clearTint();
        });

        this.destroy();
    }
}
