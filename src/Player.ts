import { Projectile } from './Projectile';
import { DashAbility } from './abilities/DashAbility';
import { GameManager } from './managers/GameManager';
import { Weapon } from './weapons/Weapon';
import { RangedWeapon } from './weapons/RangedWeapon';
import { StatusEffect } from './effects/StatusEffect';
import { TeleportAbility } from './abilities/TeleportAbility';
import { Ability } from './abilities/Ability';
import { SlashAbility } from './abilities/SlashAbility';
import { FireballProjectile } from './projectiles/FireballProjectile';
import { ArrowProjectile } from './projectiles/ArrowProjectile';
import { Helmet } from './items/Helmet';
import { Boot } from './items/Boot';
import { Outfit } from './items/Outfit';

//DEFINED NUMBERS FOR THE CLASSES
const CLASSES = {
  MAGE: new RangedWeapon(
    'Fire Tome',
    'fire-spellbook',
    'fireball',
    4,
    250
  ),
  WARRIOR: new RangedWeapon(
    'Iron Sword',
    'iron-sword',
    'sword-slash',
    10,
    250
  ),

  ARCHER: new RangedWeapon(
    'Bow',
    'longbow',
    'arrow',
    15,
    300
  ),

  THING: new RangedWeapon(
    'Void Orb',
    'void-orb',
    'standing-projectile',
    60,
    400 
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
  protected dashAbility!: Ability;
  private gameManager: GameManager;
  protected weaponSprite!: Phaser.GameObjects.Sprite;
  public isInvulnerable: boolean = false;
  private invulnerabilityDuration: number = 1000;
  private currentWeapon: Weapon;
  private player_class: string;
  private activeEffects: StatusEffect[] = [];
  private experience: number = 0;
  private level: number = 1;
  private experienceToNextLevel: number = 100;
  private criticalChance: number = 0.05;
  private isShooting: boolean = false;
  private experienceBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;

  private helmet!: Helmet;
  private boot!: Boot;
  private outfit!: Outfit;

  constructor(scene: Phaser.Scene, x: number, y: number, player_class: string) {
    const spriteKey = `player-${player_class.toLowerCase()}`;
    super(scene, x, y, spriteKey);
    
    this.gameManager = GameManager.getInstance();
    this.gameManager.setInitialClassStats(player_class);  // Set class-specific stats

    this.player_class = player_class;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    //configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(8, 8);
    body.setBounce(0);
    body.setImmovable(false);
    
    //get all stats from GameManager
    this.level = this.gameManager.getLevel();
    this.experience = this.gameManager.getExperience();
    this.experienceToNextLevel = this.gameManager.getExperienceToNextLevel();
    this.health = this.gameManager.getHealth();
    this.maxHealth = this.gameManager.getMaxHealth();
    this.attack = this.gameManager.getAttack();
    this.defense = this.gameManager.getDefense();
    this.speed = this.gameManager.getSpeed();
    this.money = this.gameManager.getGold();
    
    //base attack for powerups
    this.baseAttack = this.attack;
    
    //keyboard input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    scene.input.keyboard!.addKeys('W,A,S,D');

    //set initial weapon based on class
    this.currentWeapon = CLASSES[player_class as keyof typeof CLASSES];
    (this.currentWeapon as RangedWeapon).initializeProjectiles(scene);
    this.shootCooldown = this.currentWeapon.cooldown;
    
    //set player's attack based on weapon damage
    this.attack = this.currentWeapon.damage;
    this.baseAttack = this.currentWeapon.damage;
    this.gameManager.setAttack(this.attack);  // Sync with GameManager
    
    // Create the stats text AFTER weapon is initialized
    this.createStatsDisplay();

    // Create projectiles group
    this.projectiles = scene.add.group({
      classType: Projectile,
      maxSize: 10,
      runChildUpdate: true,
      createCallback: (proj) => {
        // Set the appropriate projectile texture based on class
        if (player_class === 'MAGE') {
          (proj as Projectile).setTexture('fireball');
        } else if (player_class === 'ARCHER') {
          (proj as Projectile).setTexture('arrow');
        } else if (player_class === 'THING') {
          (proj as Projectile).setTexture('standing-projectile');
        } else {
          (proj as Projectile).setTexture('sword-slash');
        }
      }
    });

    // Add left-click binding for shooting
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.isShooting = true;
      }
    });

    scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonReleased()) {
        this.isShooting = false;
      }
    });

    // Initialize ability based on class
    if (player_class === 'MAGE') {
      this.dashAbility = new TeleportAbility(scene, this);
    } else if (player_class === 'WARRIOR') {
      this.dashAbility = new SlashAbility(scene, this);
    } else {
      this.dashAbility = new DashAbility(scene, this);
    }

    // Add space key binding for dash or teleport
    scene.input.keyboard!.on('keydown-SPACE', () => {
      this.dashAbility.use();
    });

    // Create the experience bar
    this.createExperienceBar();
  }

  private createStatsDisplay(): void {
    // Create score text (top left)
    this.scoreText = this.scene.add.text(
        10,
        10,
        `🏆 ${this.gameManager.getScore()}`,
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
        `💰 ${this.gameManager.getGold()}`,
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

    // Create health text (center top)
    this.healthText = this.scene.add.text(
        this.scene.cameras.main.width / 2,
        10,
        `❤️ ${this.getHealth()}/${this.getMaxHealth()}`,
        {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            padding: { x: 0, y: 0 },
            align: 'center',
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
    .setOrigin(0.5, 0) // Center the text
    .setScrollFactor(0)
    .setDepth(1000);

    // Create weapon display in bottom right
    const padding = 5;
    const squareSize = 24; // Reduced size
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
    .setScale(1.5); // Adjusted scale

    // Add weapon sprite using current weapon's sprite
    this.weaponSprite = this.scene.add.sprite(
        this.scene.cameras.main.width - padding - squareSize / 2,
        this.scene.cameras.main.height - padding - squareSize / 2,
        this.currentWeapon.spriteKey
    )
    .setOrigin(0.75,0.75) // Center the sprite
    .setScrollFactor(0)
    .setDepth(1000)
    .setScale(1.5); // Adjusted scale
  }

  private createExperienceBar(): void {
    this.experienceBar = this.scene.add.graphics();
    this.experienceBar.setScrollFactor(0);
    this.experienceBar.setDepth(1000);
    this.updateExperienceBar();
  }

  private updateExperienceBar(): void {
    const barWidth = this.scene.cameras.main.width - 70; // Reduced width
    const barHeight = 10; // Reduced height
    const x = 20; // Adjusted position
    const y = this.scene.cameras.main.height - barHeight - 10; // Lowered position

    const percentage = this.experience / this.experienceToNextLevel;

    this.experienceBar.clear();
    this.experienceBar.fillStyle(0x222222, 1);
    this.experienceBar.fillRect(x, y, barWidth, barHeight);

    this.experienceBar.fillStyle(0x00ff00, 1);
    this.experienceBar.fillRect(x, y, barWidth * percentage, barHeight);
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    //reset velocity at the start of each update
    body.setVelocity(0);

    //movement
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
        this.scoreText.setText(`🏆 ${this.gameManager.getScore()}`);
    }
    if (this.goldText) {
        this.goldText.setText(`💰 ${this.gameManager.getGold()}`);
    }

    // Handle continuous shooting
    if (this.isShooting) {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastShootTime >= this.shootCooldown) {
            this.shoot();
            this.lastShootTime = currentTime;
        }
    }
  }

  public damage(amount: number): void {
    // If player is invulnerable, don't take damage
    if (this.isInvulnerable) return;

    this.gameManager.damage(amount);
    
    // Update health text immediately
    this.updateUIText();

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
    GameManager.destroyInstance();  // Destroy GameManager instance
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
    if (this.powerupTimer) {
      this.powerupTimer.destroy();
    }

    this.isPoweredUp = true;
    this.attack = this.baseAttack * 2;
    
    //vfx effect
    this.setTint(0xff0000);

    //timer
    this.powerupTimer = this.scene.time.delayedCall(duration * 1000, () => {
      this.endPowerup();
    });

    //emit ui update event
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
    if (this.player_class === 'ARCHER') {
        (this.currentWeapon as RangedWeapon).use(
            this.scene,
            this.x,
            this.y,
            this.facing,
            this.attack
        );
    } else {
        this.currentWeapon.use(
            this.scene,
            this.x,
            this.y,
            this.facing,
            this.attack
        );
    }
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

  public setAttack(value: number): void {
    this.attack = value;
    this.gameManager.setAttack(value);
    console.log(`Attack set to ${value}`);
  }

  public getScore(): number {
    return this.gameManager.getScore();
  }

  public setSpeed(value: number): void {
    this.speed = value;
    this.gameManager.setSpeed(value);
  }

  public updateUIText(): void {
    if (this.scoreText) {
      this.scoreText.setText(`🏆 ${this.gameManager.getScore()}`);
    }
    if (this.goldText) {
      this.goldText.setText(`💰 ${this.gameManager.getGold()}`);
    }
    if (this.healthText) {
      this.healthText.setText(`❤️ ${this.getHealth()}/${this.getMaxHealth()}`);
    }
    this.updateExperienceBar();
  }

  //method to change weapons
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

  public gainExperience(amount: number): void {
    this.experience += amount;
    this.gameManager.setExperience(this.experience);
    
    while (this.experience >= this.experienceToNextLevel) {
        this.levelUp();
    }
    
    this.updateExperienceBar();
  }

  public increaseAttack(number: number): void {
    this.attack += number; 
    this.gameManager.setAttack(this.attack);
    console.log(`Attack increased by ${number}.`);
  }

  public increaseSpeed(multiplier: number): void {
    this.speed *= (1 + multiplier);
    this.gameManager.setSpeed(this.speed);  
    console.log(`Speed increased by ${multiplier * 100}%. New speed: ${this.speed}`);
  }

  public increaseMaxHealth(amount: number): void {
    this.gameManager.increaseMaxHealth(amount);  
    this.updateUIText();
  }

  public increaseAttackSpeed(multiplier: number): void {
    this.shootCooldown *= (1 - multiplier);
    console.log(`Attack cooldown reduced by ${multiplier * 100}%. New cooldown: ${this.shootCooldown}ms`);
  }

  public increaseCriticalChance(amount: number): void {
    this.criticalChance = Math.min(1, this.criticalChance + amount);
    console.log(`Critical chance increased to ${this.criticalChance * 100}%`);
  }

  private levelUp(): void {
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
    this.gameManager.setExperienceToNextLevel(this.experienceToNextLevel);
    
    //level up scene
    this.scene.scene.pause();
    this.scene.scene.launch('LevelUpScene', { 
        player: this,
        level: this.level 
    });

    this.level++;
    this.gameManager.setLevel(this.level);
    
    console.log(`Level up! Now level ${this.level}`);
    this.updateUIText();
  }

  public modifyAttack(amount: number): void {
    this.attack += amount;
    this.gameManager.setAttack(this.attack);
  }

  public modifyDefense(amount: number): void {
    this.defense += amount;
  }

  public modifySpeed(amount: number): void {
    this.speed += amount;
    this.gameManager.setSpeed(this.speed);
  }

  public modifyMaxHealth(amount: number): void {
    this.maxHealth += amount;
    if (this.health > this.maxHealth) {
        this.health = this.maxHealth;
    }
  }

  public addEffect(effect: StatusEffect): void {
    this.activeEffects.push(effect);
    effect.apply();
  }

  public getExperience(): number {
    return this.experience;
  }

  public getExperienceToNextLevel(): number {
    return this.experienceToNextLevel;
  }

  public getLevel(): number {
    return this.level;
  }
} 