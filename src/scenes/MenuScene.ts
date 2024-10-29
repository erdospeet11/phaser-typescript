export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Semi-transparent black background
    const bg = this.add.rectangle(
      0, 0, 
      this.cameras.main.width, 
      this.cameras.main.height, 
      0x000000, 0.7
    );
    bg.setOrigin(0, 0);

    // Menu title
    this.add.text(
      this.cameras.main.centerX, 
      100, 
      'MENU', 
      { fontSize: '32px', color: '#ffffff' }
    ).setOrigin(0.5);

    // Resume button
    const resumeButton = this.add.rectangle(
      this.cameras.main.centerX,
      200,
      200,
      50,
      0x4a4a4a
    ).setInteractive();

    this.add.text(
      this.cameras.main.centerX,
      200,
      'Resume Game',
      { fontSize: '20px', color: '#ffffff' }
    ).setOrigin(0.5);

    // Button interactions
    resumeButton.on('pointerover', () => resumeButton.setFillStyle(0x6a6a6a));
    resumeButton.on('pointerout', () => resumeButton.setFillStyle(0x4a4a4a));
    resumeButton.on('pointerdown', () => this.resumeGame());

    // Add ESC key handler
    this.input.keyboard!.on('keydown-ESC', () => this.resumeGame());
  }

  private resumeGame() {
    this.scene.resume('GameScene');  // Resume the game scene
    this.scene.stop();  // Stop this menu scene
  }
} 