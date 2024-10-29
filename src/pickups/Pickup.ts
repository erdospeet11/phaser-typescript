export abstract class Pickup extends Phaser.GameObjects.Sprite {
  protected value: number = 0;
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    
    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Optional: Add a bounce effect
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setBounce(0.2);
    
    // Optional: Add floating animation
    scene.tweens.add({
      targets: this,
      y: this.y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
  }

  // Abstract method that child classes must implement
  abstract collect(player: Phaser.GameObjects.GameObject): void;
} 