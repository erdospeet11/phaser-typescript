import { GameManager } from "../managers/GameManager";

export class EndGameScene extends Phaser.Scene {
    private gameData!: { victory: boolean; score: number; gold: number };

    constructor() {
        super({ key: 'EndGameScene' });
    }

    init(data: { victory: boolean; score: number; gold: number }) {
        this.gameData = data;
    }

    create() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        // Add victory/defeat message
        const message = this.gameData.victory ? 'Victory!' : 'Game Over';
        this.add.text(centerX, centerY - 100, message, {
            fontSize: '48px',
            color: this.gameData.victory ? '#00ff00' : '#ff0000'
        }).setOrigin(0.5);

        // Add score and gold stats
        this.add.text(centerX, centerY, `Final Score: ${this.gameData.score}`, {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 40, `Gold Collected: ${this.gameData.gold}`, {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add restart button
        const restartButton = this.add.text(centerX, centerY + 100, 'Play Again', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            // Reset GameManager and restart game
            const gameManager = GameManager.getInstance();
            gameManager.reset();
            this.scene.start('ArenaScene');
        });

        // Add hover effect
        restartButton.on('pointerover', () => restartButton.setTint(0x999999));
        restartButton.on('pointerout', () => restartButton.clearTint());
    }
} 