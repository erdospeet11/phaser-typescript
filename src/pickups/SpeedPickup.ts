import { Pickup } from './Pickup';
import { Player } from '../Player';

export class SpeedPickup extends Pickup {
    private duration: number = 5000;
    private static currentTimer: Phaser.Time.TimerEvent | null = null;
    private static baseSpeed: number | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'speed-pickup');
    }

    collect(player: Player): void {
        // If there's an active timer, destroy it
        if (SpeedPickup.currentTimer) {
            SpeedPickup.currentTimer.destroy();
        }

        // Store base speed if not already stored
        if (SpeedPickup.baseSpeed === null) {
            SpeedPickup.baseSpeed = player.getSpeed();
        }

        // Set speed to base speed + 1
        player.setSpeed(SpeedPickup.baseSpeed + 1);

        // Create new timer
        SpeedPickup.currentTimer = this.scene.time.delayedCall(this.duration, () => {
            if (SpeedPickup.baseSpeed !== null) {
                player.setSpeed(SpeedPickup.baseSpeed);
            }
            player.clearTint();
            SpeedPickup.currentTimer = null;
            SpeedPickup.baseSpeed = null;
        });

        // Visual effect
        player.setTint(0x00ffff);

        this.destroy();
    }
}
