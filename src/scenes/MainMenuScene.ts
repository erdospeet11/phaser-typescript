import { GameDatabase } from '../services/GameDatabase';

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

    async create() {
        // Parallax background
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
            'Legends of Smash Arena',
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

        // Create buttons using the createButton method
        const startButton = this.createButton(
            this.cameras.main.centerY,
            'Start Game',
            () => this.scene.start('HeroSelectScene')
        );

        const leaderboardButton = this.createButton(
            this.cameras.main.centerY + 60,
            'Leaderboard',
            () => this.scene.start('LeaderboardScene')
        );

        const settingsButton = this.createButton(
            this.cameras.main.centerY + 120,
            'Settings',
            () => this.scene.start('SettingsScene')
        );

        // Version number
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
        const button = this.add.graphics();
        const buttonWidth = 200;
        const buttonHeight = 40;
        const cornerRadius = 10;
        const normalColor = 0x333333;
        const hoverColor = 0x555555;

        button.fillStyle(normalColor);
        button.fillRoundedRect(
            this.cameras.main.centerX - buttonWidth / 2,
            yPosition - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );

        // Interactive zone
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

        const buttonText = this.add.text(
            this.cameras.main.centerX,
            yPosition,
            text,
            {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

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

        return { button, buttonText, interactiveZone };
    }

    update() {
        this.ttime += 0.01;
        
        this.backgrounds.forEach((bg, index) => {
            const speed = this.scrollSpeeds[index];
            bg.tilePositionX += speed * Math.cos(this.ttime + index);
            bg.tilePositionY += speed * Math.sin(this.ttime + index) * 0.5;
        });
    }

    private startGame() {
        this.scene.start('HeroSelectScene');
    }

    private openSettings() {
        this.scene.start('SettingsScene');
    }
} 