import { Pickup } from './Pickup';
import { Player } from '../Player';
import { Tooltip } from '../ui/Tooltip';

export class StrengthPickup extends Pickup {
    private duration: number = 5000;
    private static currentTimer: Phaser.Time.TimerEvent | null = null;
    private static baseAttack: number | null = null;
    private tooltip: Tooltip;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'strength-pickup');
        
        // Physics body
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(16, 16);
        body.setImmovable(true);

        // Tooltip
        this.tooltip = new Tooltip(scene);

        // Hover events
        this.setInteractive({ useHandCursor: true });
        this.on('pointerover', () => {
            this.tooltip.show(this.x, this.y, 'Double damage for 5 seconds!');
        });
        this.on('pointerout', () => {
            this.tooltip.hide();
        });
    }

    collect(player: Player): void {
        //if there's an active timer, destroy it
        if (StrengthPickup.currentTimer) {
            StrengthPickup.currentTimer.destroy();
        }

        //store base attack if not already stored
        if (StrengthPickup.baseAttack === null) {
            StrengthPickup.baseAttack = player.getAttack();
            console.log('Base attack:', StrengthPickup.baseAttack);
        }

        const doubledAttack = StrengthPickup.baseAttack * 2;
        console.log('Setting attack to:', doubledAttack);
        player.setAttack(doubledAttack);

        //new timer
        StrengthPickup.currentTimer = this.scene.time.delayedCall(this.duration, () => {
            if (StrengthPickup.baseAttack !== null) {
                console.log('Resetting attack to:', StrengthPickup.baseAttack);
                player.setAttack(StrengthPickup.baseAttack);
            }
            player.clearTint();
            StrengthPickup.currentTimer = null;
            StrengthPickup.baseAttack = null;
        });

        player.setTint(0xff0000);

        this.tooltip.hide();
        this.destroy();
    }

    destroy(): void {
        this.tooltip.destroy();
        super.destroy();
    }
}