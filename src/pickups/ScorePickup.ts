import { Pickup } from './Pickup';
import { Player } from '../Player';
import { Tooltip } from '../ui/Tooltip';

export class ScorePickup extends Pickup {
    private scoreAmount: number = 25;
    private tooltip: Tooltip;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'score-pickup');
        
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(16, 16);
        body.setImmovable(true);

        this.tooltip = new Tooltip(scene);

        //hover
        this.setInteractive({ useHandCursor: true });
        this.on('pointerover', () => {
            this.tooltip.show(this.x, this.y, `Score +${this.scoreAmount}`);
        });
        this.on('pointerout', () => {
            this.tooltip.hide();
        });
    }

    collect(player: Player): void {
        player.addScore(this.scoreAmount);
        
        //vfx
        player.setTint(0xFFD700);
        this.scene.time.delayedCall(200, () => {
            player.clearTint();
        });

        this.tooltip.hide();
        this.destroy();
    }

    destroy(): void {
        this.tooltip.destroy();
        super.destroy();
    }
} 