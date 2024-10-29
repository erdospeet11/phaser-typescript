import { Pickup } from './Pickup';
import { Player } from '../Player';

export class PowerupPickup extends Pickup {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'powerup-pickup');
    this.value = 30;  // Duration in seconds
  }

  collect(player: Player): void {
    player.addPowerup(this.value);
    this.destroy();
  }
} 