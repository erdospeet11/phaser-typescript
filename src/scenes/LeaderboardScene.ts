import { GameDatabase } from '../services/GameDatabase';

export class LeaderboardScene extends Phaser.Scene {
    private backgrounds: Phaser.GameObjects.TileSprite[] = [];
    private scrollSpeeds: number[] = [0.5, 1];
    private ttime: number = 0;

    constructor() {
        super({ key: 'LeaderboardScene' });
    }

    preload() {
        this.load.image('menu-bg', 'assets/menu-background.png');
    }

    async create() {
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

        this.add.text(
            this.cameras.main.centerX,
            10,
            'Leaderboard',
            {
                fontSize: '20px',
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

        //get top 5 score
        const db = GameDatabase.getInstance();
        const scores = await db.getTopScores(5);

        //display scores
        scores.forEach((score, index) => {
            const rankPrefix = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            const date = new Date(score.date).toLocaleDateString();
            const yPos = 60 + (index * 40);

            this.add.text(
                this.cameras.main.centerX,
                yPos,
                `${rankPrefix} ${score.player_name} - ${score.score} points`,
                {
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    shadow: {
                        offsetX: 1,
                        offsetY: 1,
                        color: '#000000',
                        blur: 1,
                        fill: true
                    }
                }
            ).setOrigin(0.5);

            this.add.text(
                this.cameras.main.centerX,
                yPos + 15,
                date,
                {
                    fontSize: '10px',
                    color: '#888888',
                    fontFamily: 'monospace'
                }
            ).setOrigin(0.5);
        });

        this.createButton(
            this.cameras.main.height - 10,
            'Back',
            () => this.scene.start('MainMenuScene')
        );
    }

    private createButton(yPosition: number, text: string, onClick: () => void) {
        const button = this.add.graphics();
        const buttonWidth = 100;
        const buttonHeight = 20;
        const cornerRadius = 8;
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
                fontSize: '10px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'monospace'
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
} 