export class Enemy extends Phaser.GameObjects.Sprite {
  private health: number;
  private maxHealth: number;
  private attack: number;
  private healthBar: Phaser.GameObjects.Graphics;
  private speed: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    
    // Enable physics on this sprite
    scene.physics.add.existing(this);

    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(16, 16); // Adjust these values based on your sprite size
    
    this.health = 50;
    this.maxHealth = 50;
    this.attack = 5;
    this.speed = 0.25; // Adjust this value to change enemy speed
    
    this.healthBar = scene.add.graphics();
    scene.add.existing(this);
    this.updateHealthBar();
  }

  damage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();
    if (this.health <= 0) {
      this.handleDeath();
    }
  }

  private updateHealthBar(): void {
    this.healthBar.clear();
    
    // Bar background
    this.healthBar.fillStyle(0xff0000);
    this.healthBar.fillRect(this.x-10, this.y-20, 50, 5);
    
    // Health remaining
    const width = (this.health / this.maxHealth) * 50;
    this.healthBar.fillStyle(0x00ff00);
    this.healthBar.fillRect(this.x-10, this.y-20, width, 5);
  }

  private handleDeath(): void {
    this.healthBar.destroy();  // Clean up health bar
    this.emit('death');
    this.destroy();
  }

  update(player: Phaser.GameObjects.Sprite): void {
    // Calculate direction to player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    
    // Normalize the direction
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      const dirX = dx / distance;
      const dirY = dy / distance;

      // Use velocity instead of directly modifying position
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        dirX * this.speed * 100,
        dirY * this.speed * 100
      );

      // Flip sprite based on movement direction
      this.setFlipX(dirX < 0);
    }

    this.updateHealthBar();
  }

  getHealth(): number {
    return this.health;
  }

  getAttack(): number {
    return this.attack;
  }
} 