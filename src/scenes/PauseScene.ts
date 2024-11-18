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
      {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 2,
          fill: true
        }
      }
    ).setOrigin(0.5);

    // Create buttons with centered spacing
    const centerY = this.cameras.main.centerY;
    this.createButton(centerY - 40, 'Resume', () => this.resumeGame());
    this.createButton(centerY, 'Settings', () => this.openSettings());
    this.createButton(centerY + 40, 'Quit to Menu', () => this.quitToMain());

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

  // Use the exact same createButton method as MainMenuScene
  private createButton(yPosition: number, text: string, onClick: () => void) {
    const button = this.add.graphics();
    const buttonWidth = 140;
    const buttonHeight = 30;
    const cornerRadius = 8;

    const normalColor = 0x4a4a4a;
    const hoverColor = 0x6a6a6a;

    // Draw the rounded rectangle
    button.fillStyle(normalColor);
    button.fillRoundedRect(
      this.cameras.main.centerX - buttonWidth / 2,
      yPosition - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      cornerRadius
    );

    // Create an interactive zone for the button
    const hitArea = new Phaser.Geom.Rectangle(
      this.cameras.main.centerX - buttonWidth / 2,
      yPosition - buttonHeight / 2,
      buttonWidth,
      buttonHeight
    );

    const interactiveZone = this.add.zone(
      this.cameras.main.centerX,
      yPosition,
      buttonWidth,
      buttonHeight
    ).setInteractive({ hitArea: hitArea, useHandCursor: true });

    // Add text
    const buttonText = this.add.text(
      this.cameras.main.centerX,
      yPosition,
      text,
      {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Hover effects with proper redraw
    interactiveZone.on('pointerover', () => {
      button.clear();
      button.fillStyle(hoverColor);
      button.fillRoundedRect(
        this.cameras.main.centerX - buttonWidth / 2,
        yPosition - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        cornerRadius
      );
    });

    interactiveZone.on('pointerout', () => {
      button.clear();
      button.fillStyle(normalColor);
      button.fillRoundedRect(
        this.cameras.main.centerX - buttonWidth / 2,
        yPosition - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        cornerRadius
      );
    });

    interactiveZone.on('pointerdown', onClick);
  }
} 