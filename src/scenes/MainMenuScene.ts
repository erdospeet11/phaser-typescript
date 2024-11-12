export class MainMenuScene extends Phaser.Scene {
    private backgrounds: Phaser.GameObjects.TileSprite[] = [];
    private scrollSpeeds: number[] = [0.5, 1, 1.5];
    private ttime: number = 0;
    private readonly VERSION: string = 'v0.1.0';

    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        this.load.image('menu-bg', 'assets/menu-background.png');
    }

    create() {
        // Create parallax background layers
        for (let i = 0; i < 2; i++) {
            const bg = this.add.tileSprite(
                0,
                0,
                this.cameras.main.width,
                this.cameras.main.height,
                'menu-bg'
            );
            bg.setOrigin(0, 0);
            bg.setAlpha(1 - (i * 0.2));
            bg.setTint(0xffffff - (i * 0x222222));
            this.backgrounds.push(bg);
        }

        // Title
        this.add.text(
            this.cameras.main.centerX,
            50,
            'SmashTV2',
            {
                fontSize: '32px',
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

        // Create rounded buttons
        this.createButton(120, 'Play Game', () => this.startGame());
        this.createButton(170, 'Settings', () => this.openSettings());
        this.createButton(220, 'Credits', () => this.showCredits());

        // Add version number text
        this.add.text(
            this.cameras.main.width - 10,
            this.cameras.main.height - 10,
            this.VERSION,
            {
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold',
                shadow: {
                    offsetX: 1,
                    offsetY: 1,
                    color: '#000000',
                    blur: 1,
                    fill: true
                }
            }
        ).setOrigin(1, 1);
    }

    private createButton(yPosition: number, text: string, onClick: () => void) {
        // Create rounded rectangle graphics
        const button = this.add.graphics();
        const buttonWidth = 200;
        const buttonHeight = 40;
        const cornerRadius = 10;  // Adjust this for more or less rounding

        // Button colors
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
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Hover effects
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

        // Click effect
        interactiveZone.on('pointerdown', () => {
            button.clear();
            button.fillStyle(normalColor);
            button.fillRoundedRect(
                this.cameras.main.centerX - buttonWidth / 2,
                yPosition - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
            onClick();
        });
    }

    update() {
        this.ttime += 0.01;
        
        this.backgrounds.forEach((bg, index) => {
            // Add sine wave movement for more organic scrolling
            const speed = this.scrollSpeeds[index];
            bg.tilePositionX += speed * Math.cos(this.ttime + index);
            bg.tilePositionY += speed * Math.sin(this.ttime + index) * 0.5;
        });
    }

    private startGame() {
        this.scene.start('ArenaScene');
    }

    private openSettings() {
        this.scene.start('SettingsScene');
    }

    private showCredits() {
        // TODO: Implement credits functionality
        console.log('Credits clicked');
    }
} 