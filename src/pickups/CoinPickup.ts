import { Pickup } from './Pickup';
import { Player } from '../Player';
import { Tooltip } from '../ui/Tooltip';

export class CoinPickup extends Pickup {
  private coinAmount: number = 1;
  private tooltip: Tooltip;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'coin-pickup');

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 16);
    body.setImmovable(true);

    this.tooltip = new Tooltip(scene);

    // Hover events
    this.setInteractive({ useHandCursor: true });
    this.on('pointerover', () => {
      this.tooltip.show(this.x, this.y, `Gold +${this.coinAmount}`);
    });
    this.on('pointerout', () => {
      this.tooltip.hide();
    });
  }

  collect(player: Player): void {
    player.addCoins(this.coinAmount);
    this.tooltip.hide();
    this.destroy();
  }
} 