import { Game, AUTO, Scale } from 'phaser';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { MenuScene } from './scenes/MenuScene';
import { HealthPickup } from './pickups/HealthPickup';
import { CoinPickup } from './pickups/CoinPickup';
import { PowerupPickup } from './pickups/PowerupPickup';

class MyGame extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private tileSprite!: Phaser.GameObjects.TileSprite;
  private enemy!: Enemy;
  private healthPickup!: HealthPickup;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('tile', 'assets/tile.png'); // Make sure this path is correct
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('health-pickup', 'assets/health_pickup.png');
  }

  create() {
    // Create the repeating tile sprite
    this.tileSprite = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'tile');
    this.tileSprite.setOrigin(0, 0);

    this.player = new Player(this, 400, 300);
    this.player.setScale(1);
    // Set up keyboard input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard!.addKeys('W,A,S,D');

    this.setupCamera();

    this.enemy = new Enemy(this, 600, 300);

    // Create a pickup
    this.healthPickup = new HealthPickup(this, 300, 300);
    
    // Add collision between player and pickup
    this.physics.add.overlap(
      this.player,
      this.healthPickup,
      this.handlePickupCollision,
      undefined,
      this
    );

    // Add ESC key handler
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.pause();  // Pause current scene
      this.scene.launch('MenuScene');  // Launch menu scene
    });

    //DEBUG - FOR COLLISION DETECTION

    // Enable physics debug drawing
    this.physics.world.createDebugGraphic();
    
    // Optional: Set debug colors
    this.physics.world.debugGraphic.setAlpha(0.75);
    
    // Optional: Configure which debug features to show
    this.physics.world.defaults.debugShowBody = true;
    this.physics.world.defaults.debugShowStaticBody = true;
    this.physics.world.defaults.debugShowVelocity = true;
    this.physics.world.defaults.bodyDebugColor = 0xff00ff;
  }

  private handlePickupCollision(player: any, pickup: any) {
    (pickup as HealthPickup).collect(player as Player);
  }

  setupCamera() {
        // Set up the camera to follow the player
        this.cameras.main.startFollow(this.player);
    
        // Optional: Set camera bounds if you want to restrict camera movement
        this.cameras.main.setBounds(0, 0, 1600, 1200); // Adjust these values based on your game world size
        
        // Optional: Add smooth camera movement
        this.cameras.main.setZoom(2); // You can adjust zoom level
        this.cameras.main.setLerp(0.1, 0.1); // Adds smooth camera movement (values between 0 and 1)
        
        // Optional: Add deadzone - area where player can move without moving camera
        // this.cameras.main.setDeadzone(100, 100);
  }

  update() {
    this.player.update();
    this.enemy.update(this.player);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 800,
  height: 550,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: true,
      debugShowBody: true,
      debugShowStaticBody: true,
      debugShowVelocity: true
    }
  },
  scene: [MyGame, MenuScene],
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH
  },
  pixelArt: true,  // This enables nearest-neighbor interpolation
  antialias: false, // This disables anti-aliasing
};

const game = new Phaser.Game(config);
