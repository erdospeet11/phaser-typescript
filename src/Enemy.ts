export class Enemy extends Phaser.GameObjects.Sprite {
  private health: number;
  private maxHealth: number;
  private attack: number;
  private healthBar: Phaser.GameObjects.Graphics;
  private speed: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    
    this.health = 50;
    this.maxHealth = 50;
    this.attack = 5;
    this.speed = 0.5; // Adjust this value to change enemy speed
    
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
    this.healthBar.fillRect(this.x - 25, this.y - 40, 50, 5);
    
    // Health remaining
    const width = (this.health / this.maxHealth) * 50;
    this.healthBar.fillStyle(0x00ff00);
    this.healthBar.fillRect(this.x - 25, this.y - 40, width, 5);
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

      // Move toward player
      this.x += dirX * this.speed;
      this.y += dirY * this.speed;

      // Flip sprite based on movement direction
      if (dirX < 0) {
        this.setFlipX(true);
      } else {
        this.setFlipX(false);
      }
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