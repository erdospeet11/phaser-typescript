export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  preload() {
    // Preload the background image
    this.load.image('menu-bg', 'assets/menu-background.png');
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

    // Pause title
    this.add.text(
      this.cameras.main.centerX, 
      50, 
      'PAUSED', 
      { fontSize: '24px', color: '#ffffff' }
    ).setOrigin(0.5);

    // Resume button
    const resumeButton = this.add.rectangle(
      this.cameras.main.centerX,
      100,
      200,
      40,
      0x4a4a4a
    ).setInteractive();

    this.add.text(
      this.cameras.main.centerX,
      100,
      'Resume Game',
      { fontSize: '16px', color: '#ffffff' }
    ).setOrigin(0.5);

    // Settings button
    const settingsButton = this.add.rectangle(
      this.cameras.main.centerX,
      150,
      200,
      40,
      0x4a4a4a
    ).setInteractive();

    this.add.text(
      this.cameras.main.centerX,
      150,
      'Settings',
      { fontSize: '16px', color: '#ffffff' }
    ).setOrigin(0.5);

    // Quit button
    const quitButton = this.add.rectangle(
      this.cameras.main.centerX,
      200,
      200,
      40,
      0x4a4a4a
    ).setInteractive();

    this.add.text(
      this.cameras.main.centerX,
      200,
      'Quit to Main Menu',
      { fontSize: '16px', color: '#ffffff' }
    ).setOrigin(0.5);

    // Button interactions
    resumeButton.on('pointerover', () => resumeButton.setFillStyle(0x6a6a6a));
    resumeButton.on('pointerout', () => resumeButton.setFillStyle(0x4a4a4a));
    resumeButton.on('pointerdown', () => this.resumeGame());

    settingsButton.on('pointerover', () => settingsButton.setFillStyle(0x6a6a6a));
    settingsButton.on('pointerout', () => settingsButton.setFillStyle(0x4a4a4a));
    settingsButton.on('pointerdown', () => this.openSettings());

    quitButton.on('pointerover', () => quitButton.setFillStyle(0x6a6a6a));
    quitButton.on('pointerout', () => quitButton.setFillStyle(0x4a4a4a));
    quitButton.on('pointerdown', () => this.quitToMain());

    // Add ESC key handler
    this.input.keyboard!.on('keydown-ESC', () => this.resumeGame());
  }

  private resumeGame() {
    this.scene.resume('ArenaScene');
    this.scene.stop();
  }

  private openSettings() {
    // TODO: Implement settings functionality
    console.log('Settings clicked');
  }

  private quitToMain() {
    // Make sure the background is loaded before transitioning
    this.load.once('complete', () => {
      this.scene.stop('ArenaScene');
      this.scene.stop();
      this.scene.start('MainMenuScene');
    });
    
    this.load.start();
  }
} 