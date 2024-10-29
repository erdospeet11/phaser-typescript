import { Pickup } from './Pickup';
import { Player } from '../Player';

export class CoinPickup extends Pickup {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'coin-pickup');
    this.value = 10;  // Amount of coins to give
  }

  collect(player: Player): void {
    player.addCoins(this.value);
    this.destroy();
  }
} 