import { HealthPickup } from '../pickups/HealthPickup';
import { ArenaScene } from '../scenes/ArenaScene';
import { CoinPickup } from '../pickups/CoinPickup';
import { SpeedPickup } from '../pickups/SpeedPickup';
import { Chest } from '../entities/Chest';
import { BombPickup } from '../pickups/BombPickup';
import { ScorePickup } from '../pickups/ScorePickup';
import { StrengthPickup } from '../pickups/StrengthPickup';
import { Player } from '../Player';

export class Enemy extends Phaser.GameObjects.Sprite {
  protected health: number;
  protected maxHealth: number;
  protected attack: number;
  protected healthBar: Phaser.GameObjects.Graphics;
  protected speed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = 'enemy') {
    super(scene, x, y, texture);
    
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

  protected handleDeath(): void {
    // Drop experience when enemy dies (add this at the start of handleDeath)
    const experienceValue = 20; // Base experience value
    const player = (this.scene as ArenaScene).getPlayer();
    if (player) {
        console.log('Enemy died, dropping experience:', experienceValue);
        player.gainExperience(experienceValue);
    }

    var random = Phaser.Math.Between(1, 100);

    if (random <= 15) {
      const chest = new Chest(this.scene, this.x, this.y);
      chest.setupInteraction((this.scene as ArenaScene).getPlayer());
    } else if (random <= 30) {
      const pickup = new CoinPickup(this.scene, this.x, this.y);
      (this.scene as ArenaScene).addPickup(pickup);
    } else if (random <= 45) {
      const pickup = new SpeedPickup(this.scene, this.x, this.y);
      (this.scene as ArenaScene).addPickup(pickup);
    } else if (random <= 60) {
      const pickup = new HealthPickup(this.scene, this.x, this.y);
      (this.scene as ArenaScene).addPickup(pickup);
    } else if (random <= 70) {
      const pickup = new BombPickup(this.scene, this.x, this.y);
      (this.scene as ArenaScene).addPickup(pickup);
    } else if (random <= 80) {
      const pickup = new ScorePickup(this.scene, this.x, this.y);
      (this.scene as ArenaScene).addPickup(pickup);
    } else if (random <= 90) { // 10% chance for strength pickup
      const pickup = new StrengthPickup(this.scene, this.x, this.y);
      (this.scene as ArenaScene).addPickup(pickup);
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

  public getSpeed(): number {
    return this.speed;
  }

  public setSpeed(value: number): void {
    this.speed = value;
  }

  die(): void {
    // Add debug log
    console.log('Enemy died, dropping experience');
    const experienceValue = 20;
    if (this.scene && this.scene.registry) {
      const player = this.scene.registry.get('player') as Player;
      if (player) {
        player.gainExperience(experienceValue);
      }
    }
    // ... existing death code ...
  }
} 