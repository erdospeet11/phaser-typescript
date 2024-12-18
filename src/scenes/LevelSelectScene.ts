import { RoomManager } from '../managers/RoomManager';

export class LevelSelectScene extends Phaser.Scene {
    private backgrounds: Phaser.GameObjects.TileSprite[] = [];
    private scrollSpeeds: number[] = [0.5, 1, 1.5];
    private ttime: number = 0;

    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    preload() {
        this.load.image('menu-bg', 'assets/menu-background.png');
    }

    create() {
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
            'Select Level',
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

        // Level button
        const levelConfigs = [
            { text: '🌳Evil Forest🌳', y: 150 },
            { text: '🏰Dungeons of Khaos🏰', y: 200 },
            { text: '🔥HELL🔥', y: 250 }
        ];

        levelConfigs.forEach((config, index) => {
            this.createButton(config.y, config.text, () => this.startLevel(index + 1));
        });

        // Back button
        this.createButton(350, 'Back to Menu', () => this.scene.start('MainMenuScene'));
    }

    private createButton(yPosition: number, text: string, onClick: () => void) {
        const button = this.add.graphics();
        const buttonWidth = 200;
        const buttonHeight = 40;
        const cornerRadius = 10;
        const normalColor = 0x4a4a4a;
        const hoverColor = 0x6a6a6a;

        button.fillStyle(normalColor);
        button.fillRoundedRect(
            this.cameras.main.centerX - buttonWidth / 2,
            yPosition - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );

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
                fontSize: '16px',
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
    }

    update() {
        this.ttime += 0.01;
        
        this.backgrounds.forEach((bg, index) => {
            const speed = this.scrollSpeeds[index];
            bg.tilePositionX += speed * Math.cos(this.ttime + index);
            bg.tilePositionY += speed * Math.sin(this.ttime + index) * 0.5;
        });
    }

    private startLevel(levelNumber: number): void {
        const roomManager = RoomManager.getInstance();
        roomManager.setCurrentLevel(levelNumber);
        
        this.scene.start('ArenaScene', {
            roomPosition: { x: 0, y: 1 },
            roomType: 'start'
        });
    }
} 