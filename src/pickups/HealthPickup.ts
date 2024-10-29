import { Pickup } from './Pickup';
import { Player } from '../Player';

export class HealthPickup extends Pickup {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'health-pickup');  // 'health-pickup' is the texture key
    this.value = 20;  // Amount of health to restore
  }

  collect(player: Player): void {
    // Heal the player
    player.heal(this.value);
    
    // Destroy the pickup
    this.destroy();
  }
} 