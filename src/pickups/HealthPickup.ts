import { Pickup } from './Pickup';
import { Player } from '../Player';
import { Tooltip } from '../ui/Tooltip';

export class HealthPickup extends Pickup {
  private healAmount: number = 10;
  private tooltip: Tooltip;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'health-pickup');
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 16);
    body.setImmovable(true);

    this.tooltip = new Tooltip(scene);

    //Hover
    this.setInteractive({ useHandCursor: true });
    this.on('pointerover', () => {
      this.tooltip.show(this.x, this.y, `Health +${this.healAmount}`);
    });
    this.on('pointerout', () => {
      this.tooltip.hide();
    });
  }

  collect(player: Player): void {
    if (player.getHealth() < player.getMaxHealth()) {
      player.heal(this.healAmount);
      player.updateUIText();
      this.tooltip.hide();
      this.destroy();
    }
  }

  destroy(): void {
    this.tooltip.destroy();
    super.destroy();
  }
}