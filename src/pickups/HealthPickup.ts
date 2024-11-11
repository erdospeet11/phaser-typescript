import { Pickup } from './Pickup';
import { Player } from '../Player';

export class HealthPickup extends Pickup {
  private healAmount: number = 20; // Amount of health to restore

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'health-pickup');
    
    // Add a physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 16);
    body.setImmovable(true);
  }

  collect(player: Player): void {
    // Only collect if player is not at max health
    if (player.getHealth() < player.getMaxHealth()) {
      player.heal(this.healAmount);
      this.destroy();
    }
  }
} 