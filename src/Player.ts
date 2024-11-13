import { Projectile } from './Projectile';
import { DashAbility } from './abilities/DashAbility';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private health: number;
  private maxHealth: number;
  private attack: number;
  private defense: number;
  private speed: number;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private money: number;
  private coins: number;
  private isPoweredUp: boolean = false;
  private powerupTimer?: Phaser.Time.TimerEvent;
  private baseAttack: number = 10;  // Store base attack value
  private statsText!: Phaser.GameObjects.Text;
  private projectiles: Phaser.GameObjects.Group;
  private lastShootTime: number = 0;
  private shootCooldown: number = 250; // 250ms between shots
  private facing: number = 0; // Will now store angle in radians
  private score: number = 0;
  private dashAbility: DashAbility;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set the sprite scale to half size
    this.setScale(0.75);
    
    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    // Adjust hitbox size to match new sprite size (assuming original was 16x16)
    body.setSize(8, 8);  // Half of original size
    body.setBounce(0);
    body.setImmovable(false);
    
    this.health = 100;
    this.maxHealth = 100;
    this.attack = this.baseAttack;
    this.defense = 5;
    this.speed = 1;
    this.money = 0;
    this.coins = 0;
    
    // Set up keyboard input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    scene.input.keyboard!.addKeys('W,A,S,D');

    // Create the stats text
    this.createStatsDisplay();

    // Create projectiles group
    this.projectiles = scene.add.group({
      classType: Projectile,
      maxSize: 10,
      runChildUpdate: true
    });

    // Add left-click binding for shooting
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.shoot();
      }
    });

    // Add dash ability
    this.dashAbility = new DashAbility(scene, this);

    // Add space key binding for dash
    scene.input.keyboard!.on('keydown-SPACE', () => {
      this.dashAbility.use();
    });
  }

  private createStatsDisplay(): void {
    this.statsText = this.scene.add.text(
      10,
      10,
      this.getStatsString(),
      {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ffffff',
        padding: { x: 0, y: 0 },
        align: 'left',
        // Add shadow
        shadow: {
            offsetX: 1,
            offsetY: 1,
            color: '#000000',
            blur: 1,
            stroke: true,
            fill: true
        },
        // Add stroke (outline)
        stroke: '#000000',
        strokeThickness: 1
      }
    )
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(1000);
  }

  private getStatsString(): string {
    return [
      `🏆Score: ${this.score}`
    ].join('\n');
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Reset velocity at the start of each update
    body.setVelocity(0);

    // Handle WASD movement
    if (this.scene.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.A].isDown) {
      body.setVelocityX(-this.speed * 75);
    }
    if (this.scene.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.D].isDown) {
      body.setVelocityX(this.speed * 75);
    }
    if (this.scene.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.W].isDown) {
      body.setVelocityY(-this.speed * 75);
    }
    if (this.scene.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.S].isDown) {
      body.setVelocityY(this.speed * 75);
    }

    // Update facing based on mouse position
    const pointer = this.scene.input.activePointer;
    const angle = Phaser.Math.Angle.Between(
      this.x, 
      this.y,
      pointer.x + this.scene.cameras.main.scrollX,
      pointer.y + this.scene.cameras.main.scrollY
    );
    this.facing = angle;

    // Flip sprite based on mouse position
    this.setFlipX(Math.abs(angle) > Math.PI/2);

    // Update the stats text
    if (this.statsText) {
      this.statsText.setText(this.getStatsString());
    }
  }

  damage(amount: number): void {
    const damageAfterDefense = Math.max(1, amount - this.defense);
    this.health = Math.max(0, this.health - damageAfterDefense);
    if (this.statsText) {
      this.statsText.setText(this.getStatsString());
    }
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
    this.health = Math.min(this.health + amount, this.maxHealth);
    if (this.statsText) {
      this.statsText.setText(this.getStatsString());
    }
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

  private shoot(): void {
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastShootTime < this.shootCooldown) {
      return;
    }
    this.lastShootTime = currentTime;

    // Adjust offset for smaller sprite
    const offsetX = Math.cos(this.facing) * 5;  // Reduced from 10
    const offsetY = Math.sin(this.facing) * 5;  // Reduced from 10

    const projectile = this.projectiles.get(
      this.x + offsetX,
      this.y + offsetY
    ) as Projectile;

    if (projectile) {
      projectile.fire({
        x: Math.cos(this.facing),
        y: Math.sin(this.facing)
      });
    }
  }

  getProjectiles(): Phaser.GameObjects.Group {
    return this.projectiles;
  }

  addScore(points: number): void {
    this.score += points;
    console.log('Score updated:', this.score);
    if (this.statsText && this.statsText.active) {
      this.statsText.setText(this.getStatsString());
      this.statsText.setVisible(true);
    }
  }

  destroy() {
    this.dashAbility.destroy();
    super.destroy();
  }

  getDefense(): number {
    return this.defense;
  }

  setDefense(value: number): void {
    this.defense = value;
  }

  public getScore(): number {
    return this.score;
  }
} 