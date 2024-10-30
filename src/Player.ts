import { Ability } from './abilities/Ability';
import { Fireball } from './abilities/Fireball';

export class Player extends Phaser.GameObjects.Sprite {
  private health: number;
  private maxHealth: number;
  private attack: number;
  private speed: number;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private money: number;
  private coins: number;
  private isPoweredUp: boolean = false;
  private powerupTimer?: Phaser.Time.TimerEvent;
  private baseAttack: number = 10;  // Store base attack value
  private abilities: Ability[];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    this.health = 100;
    this.maxHealth = 100;
    this.attack = this.baseAttack;
    this.speed = 0.5;
    this.money = 0;
    this.coins = 0;
    
    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Optional: Add collision body size/offset if needed
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 16);  // Adjust these numbers to match your sprite
    
    // Set up keyboard input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    scene.input.keyboard!.addKeys('W,A,S,D');

    // Initialize abilities
    this.abilities = [
      new Fireball(scene, this),
      // Add more abilities here
    ];
  }

  update() {
    // Move player based on WASD keys
    if (this.scene.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.A].isDown) {
      this.x -= this.speed;
      this.setFlipX(true);  // Face left
    }
    if (this.scene.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.D].isDown) {
      this.x += this.speed;
      this.setFlipX(false);  // Face right
    }
    if (this.scene.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.W].isDown) {
      this.y -= this.speed;
    }
    if (this.scene.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.S].isDown) {
      this.y += this.speed;
    }

    // Bind ability keys
    this.scene.input.keyboard!.on('keydown-Q', () => {
      this.useAbility(0);
    });
    // Add more keybindings for other abilities
  }

  damage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.handleDeath();
    }
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  handleDeath(): void {
    // Implement death handling logic here
  }

  addCoins(amount: number): void {
    this.coins += amount;
    // Optional: Emit an event for UI updates
    this.emit('coinsChanged', this.coins);
  }

  getCoins(): number {
    return this.coins;
  }

  addPowerup(duration: number): void {
    // Clear existing powerup if any
    if (this.powerupTimer) {
      this.powerupTimer.destroy();
    }

    // Apply powerup
    this.isPoweredUp = true;
    this.attack = this.baseAttack * 2;  // Double attack during powerup
    
    // Optional: Add visual effect
    this.setTint(0xff0000);  // Red tint during powerup

    // Set timer to end powerup
    this.powerupTimer = this.scene.time.delayedCall(duration * 1000, () => {
      this.endPowerup();
    });

    // Emit event for UI updates
    this.emit('powerupStarted', duration);
  }

  private endPowerup(): void {
    this.isPoweredUp = false;
    this.attack = this.baseAttack;
    this.clearTint();  // Remove visual effect
    this.emit('powerupEnded');
  }

  isPowered(): boolean {
    return this.isPoweredUp;
  }

  heal(amount: number): void {
    // Add health but don't exceed max health
    this.health = Math.min(this.health + amount, this.maxHealth);
    
    // Emit event for UI updates
    this.emit('healthChanged', this.health);
  }

  getAttack(): number {
    return this.attack;
  }

  getSpeed(): number {
    return this.speed;
  }

  getMoney(): number {
    return this.money;
  }

  private useAbility(index: number): void {
    if (index >= 0 && index < this.abilities.length) {
      this.abilities[index].use();
    }
  }
} 