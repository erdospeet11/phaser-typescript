import { HealthPickup } from '../pickups/HealthPickup';
import { ArenaScene } from '../scenes/ArenaScene';

export class Enemy extends Phaser.GameObjects.Sprite {
  private health: number;
  private maxHealth: number;
  private attack: number;
  private healthBar: Phaser.GameObjects.Graphics;
  private speed: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(16, 16);
    
    this.health = 100;
    this.maxHealth = 100;
    this.attack = 5;
    this.speed = 0.25;
    
    this.healthBar = scene.add.graphics();
    scene.add.existing(this);
    this.updateHealthBar();
  }

  damage(amount: number): boolean {
    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();
    if (this.health <= 0) {
      this.handleDeath();
      return true;
    }
    return false;
  }

  public updateHealthBar(): void {
    if (!this.healthBar || !this.active) return;
    
    this.healthBar.clear();
    
    this.healthBar.fillStyle(0xff0000);
    this.healthBar.fillRect(this.x-25, this.y-20, 50, 5);
    
    const width = Math.max(0, (this.health / this.maxHealth) * 50);
    this.healthBar.fillStyle(0x00ff00);
    this.healthBar.fillRect(this.x-25, this.y-20, width, 5);
  }

  private handleDeath(): void {
    if (Phaser.Math.Between(1, 100) <= 30) {
      const pickup = new HealthPickup(this.scene, this.x, this.y);
      (this.scene as ArenaScene).healthPickups.add(pickup);
    }

    if (this.healthBar) {
      this.healthBar.destroy();
    }
    this.destroy();
  }

  update(player: Phaser.GameObjects.Sprite): void {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      const dirX = dx / distance;
      const dirY = dy / distance;

      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        dirX * this.speed * 100,
        dirY * this.speed * 100
      );

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