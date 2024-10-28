import { Game, AUTO, Scale } from 'phaser';

class MyGame extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private tileSprite!: Phaser.GameObjects.TileSprite;

  private pointsText!: Phaser.GameObjects.Text;
  private points: number = 0;

  constructor() {
    super('MyGame');
  }

  preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('tile', 'assets/tile.png'); // Make sure this path is correct
  }

  create() {
    // Create the repeating tile sprite
    this.tileSprite = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'tile');
    this.tileSprite.setOrigin(0, 0);

    this.player = this.add.sprite(400, 300, 'player');
    this.player.setScale(1);
    // Set up keyboard input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard!.addKeys('W,A,S,D');

    this.pointsText = this.add.text(this.cameras.main.width - 20, 20, 'Points: 0', {
      color: '#ffffff',
      fontSize: '24px'
    });
    this.pointsText.setOrigin(1, 0);

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
    const speed = 1;
    var facingRight = true;

    this.points += 1/60; // Assuming 60 FPS
    this.pointsText.setText(`Points: ${Math.floor(this.points)}`);

    // Move player based on WASD keys
    if (this.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.A].isDown) {
      this.player.x -= speed;
    }
    if (this.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.D].isDown) {
      this.player.x += speed;
    }
    if (this.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.W].isDown) {
      this.player.y -= speed;
    }
    if (this.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.S].isDown) {
      this.player.y += speed;
    }

    // Optional: Scroll the tile sprite for a moving background effect
    // this.tileSprite.tilePositionX += 0.5;
    // this.tileSprite.tilePositionY += 0.5;
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 800,
  height: 550,
  scene: MyGame,
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH
  },
  pixelArt: true,  // This enables nearest-neighbor interpolation
  antialias: false, // This disables anti-aliasing
};

const game = new Phaser.Game(config);
