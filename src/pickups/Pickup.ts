export abstract class Pickup extends Phaser.GameObjects.Sprite {
  protected value: number = 0;
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Floating tween
    scene.tweens.add({
      targets: this,
      y: this.y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
  }

  abstract collect(player: Phaser.GameObjects.GameObject): void;
} 