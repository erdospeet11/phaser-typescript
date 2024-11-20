import { Projectile } from './Projectile';
import { DashAbility } from './abilities/DashAbility';
import { GameManager } from './managers/GameManager';
import { Weapon } from './weapons/Weapon';
import { RangedWeapon } from './weapons/RangedWeapon';
import { MeleeWeapon } from './weapons/MeleeWeapon';
const CLASSES = {
  MAGE: new RangedWeapon(
    'Fire Tome',
    'fire-spellbook',
    'fireball',
    10,
    250
  ),
  WARRIOR: new MeleeWeapon(
    'Iron Sword',
    'iron-sword',
    10,
    250
  ),
  ARCHER: new RangedWeapon(
    'Longbow',
    'longbow',
    'arrow',
    10,
    250
  )
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  protected health: number;
  protected maxHealth: number;
  protected attack: number;
  protected defense: number;
  protected speed: number;
  protected cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  protected money: number;
  protected isPoweredUp: boolean = false;
  protected powerupTimer?: Phaser.Time.TimerEvent;
  protected baseAttack: number = 10;
  protected scoreText!: Phaser.GameObjects.Text;
  protected goldText!: Phaser.GameObjects.Text;
  protected projectiles: Phaser.GameObjects.Group;
  protected lastShootTime: number = 0;
  protected shootCooldown: number = 250;
  protected facing: number = 0;
  protected dashAbility: DashAbility;
  private gameManager: GameManager;
  protected weaponSprite!: Phaser.GameObjects.Sprite;
  public isInvulnerable: boolean = false;
  private invulnerabilityDuration: number = 1000;
  private currentWeapon: Weapon;
  private player_class: string;

  constructor(scene: Phaser.Scene, x: number, y: number, player_class: string) {
    super(scene, x, y, 'player');
    
    this.gameManager = GameManager.getInstance();

    this.player_class = player_class;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
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
    
    // Set up keyboard input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    scene.input.keyboard!.addKeys('W,A,S,D');

    // Create and set initial weapon (Fire Tome) BEFORE creating stats display
    this.currentWeapon = new RangedWeapon(
        'Fire Tome',
        'fire-spellbook',
        'fireball',
        10,
        250
    );
    (this.currentWeapon as RangedWeapon).initializeProjectiles(scene);
    this.shootCooldown = this.currentWeapon.cooldown;

    // Create the stats text AFTER weapon is initialized
    this.createStatsDisplay();

    // Create projectiles group
    this.projectiles = scene.add.group({
      classType: Projectile,
      maxSize: 10,
      runChildUpdate: true,
      createCallback: (proj) => {
        // Set the fireball sprite when projectile is created
        (proj as Projectile).setTexture('fireball');
      }
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
    // Create score text (top left)
    this.scoreText = this.scene.add.text(
        10,
        10,
        `🏆Score: ${this.gameManager.getScore()}`,
        {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            padding: { x: 0, y: 0 },
            align: 'left',
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000000',
                blur: 1,
                stroke: true,
                fill: true
            },
            stroke: '#000000',
            strokeThickness: 1
        }
    )
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(1000);

    // Create gold text (top right)
    this.goldText = this.scene.add.text(
        this.scene.cameras.main.width - 10,
        10,
        `💰Gold: ${this.gameManager.getGold()}`,
        {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            padding: { x: 0, y: 0 },
            align: 'right',
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000000',
                blur: 1,
                stroke: true,
                fill: true
            },
            stroke: '#000000',
            strokeThickness: 1
        }
    )
    .setOrigin(1, 0)
    .setScrollFactor(0)
    .setDepth(1000);

    // Create weapon display in bottom right
    const padding = 5;
    const squareSize = 32;
    
    // Add semi-transparent background square
    const weaponBackground = this.scene.add.rectangle(
        this.scene.cameras.main.width - padding,
        this.scene.cameras.main.height - padding,
        squareSize,
        squareSize,
        0x000000,
        0.75
    )
    .setOrigin(1, 1)
    .setScrollFactor(0)
    .setDepth(999)
    .setScale(2);

    // Add weapon sprite using current weapon's sprite
    this.weaponSprite = this.scene.add.sprite(
        this.scene.cameras.main.width - padding - squareSize,
        this.scene.cameras.main.height - padding - squareSize,
        this.currentWeapon.spriteKey
    )
    .setOrigin(0.5, 0.5)
    .setScrollFactor(0)
    .setDepth(1000)
    .setScale(2);
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

    // Update the stats texts with GameManager values
    if (this.scoreText) {
        this.scoreText.setText(`🏆Score: ${this.gameManager.getScore()}`);
    }
    if (this.goldText) {
        this.goldText.setText(`💰Gold: ${this.gameManager.getGold()}`);
    }
  }

  public damage(amount: number): void {
    // If player is invulnerable, don't take damage
    if (this.isInvulnerable) return;

    this.gameManager.damage(amount);
    
    // Make player invulnerable and flash red
    this.setTint(0xff0000);
    this.isInvulnerable = true;

    // Remove invulnerability after duration
    this.scene.time.delayedCall(this.invulnerabilityDuration, () => {
      this.isInvulnerable = false;
      this.clearTint();
    });

    if (this.gameManager.getHealth() <= 0) {
        this.handleDeath();
    }
  }

  public getHealth(): number {
    return this.gameManager.getHealth();
  }

  public getMaxHealth(): number {
    return this.gameManager.getMaxHealth();
  }

  public handleDeath(): void {
    this.scene.scene.start('EndGameScene', { 
        victory: false,
        score: this.gameManager.getScore(),
        gold: this.gameManager.getGold()
    });
  }

  public addCoins(amount: number): void {
    this.gameManager.addGold(amount);
    this.updateUIText();
  }

  getCoins(): number {
    return this.gameManager.getGold();
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
    this.clearTint();
    this.emit('powerupEnded');
  }

  public isPowered(): boolean {
    return this.isPoweredUp;
  }

  public heal(amount: number): void {
    this.gameManager.heal(amount);
    this.emit('healthChanged', this.gameManager.getHealth());
  }

  public getAttack(): number {
    return this.attack;
  }

  public getSpeed(): number {
    return this.speed;
  }

  getMoney(): number {
    return this.money;
  }

  private shoot(): void {
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastShootTime < this.currentWeapon.cooldown) {
      return;
    }
    this.lastShootTime = currentTime;

    // Use the weapon
    this.currentWeapon.use(
      this.scene,
      this.x,
      this.y,
      this.facing
    );
  }

  public getProjectiles(): Phaser.GameObjects.Group {
    return (this.currentWeapon as RangedWeapon).getProjectiles();
  }

  public addScore(points: number): void {
    this.gameManager.addScore(points);
    this.updateUIText();
  }

  public destroy() {
    this.dashAbility.destroy();
    super.destroy();
  }

  public getDefense(): number {
    return this.defense;
  }

  public setDefense(value: number): void {
    this.defense = value;
  }

  public getScore(): number {
    return this.gameManager.getScore();
  }

  public setSpeed(value: number): void {
    this.speed = value;
  }

  public updateUIText(): void {
    if (this.scoreText) {
      this.scoreText.setText(`🏆Score: ${this.gameManager.getScore()}`);
    }
    if (this.goldText) {
      this.goldText.setText(`💰Gold: ${this.gameManager.getGold()}`);
    }
  }

  // Add method to change weapons
  public setWeapon(weapon: Weapon): void {
    this.currentWeapon = weapon;
    this.shootCooldown = weapon.cooldown;
    if (this.weaponSprite) {
      this.weaponSprite.setTexture(weapon.spriteKey);
    }
  }

  public getCurrentWeapon(): Weapon {
    return this.currentWeapon;
  }
} 