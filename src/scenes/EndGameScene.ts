import { GameManager } from "../managers/GameManager";
import { RoomManager } from "../managers/RoomManager";
import { GameDatabase } from '../services/GameDatabase';

export class EndGameScene extends Phaser.Scene {
    private gameData!: { victory: boolean; score: number; gold: number };

    constructor() {
        super({ key: 'EndGameScene' });
    }

    init(data: { victory: boolean; score: number; gold: number }) {
        this.gameData = data;
    }

    async create() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        const message = this.gameData.victory ? 'Victory!' : 'Game Over';
        this.add.text(centerX, centerY - 100, message, {
            fontSize: '48px',
            color: this.gameData.victory ? '#00ff00' : '#ff0000'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY, `Final Score: ${this.gameData.score}`, {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 40, `Gold Collected: ${this.gameData.gold}`, {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const restartButton = this.add.text(centerX, centerY + 100, 'Play Again', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            const gameManager = GameManager.getInstance();
            const roomManager = RoomManager.getInstance();
            
            //reset managers
            gameManager.reset();
            roomManager.reset();
            
            //start hero select
            this.scene.start('HeroSelectScene');
        });

        restartButton.on('pointerover', () => restartButton.setTint(0x999999));
        restartButton.on('pointerout', () => restartButton.clearTint());

        //save score if player won
        if (this.gameData.victory) {
            const playerName = localStorage.getItem('playerName') || 'Unknown';
            const db = GameDatabase.getInstance();
            try {
                await db.saveScore(playerName, this.gameData.score);
                console.log('Score saved successfully to database');
                
                this.add.text(centerX, centerY + 150, 'Score saved!', {
                    fontSize: '16px',
                    color: '#00ff00'
                }).setOrigin(0.5);
            } catch (error) {
                console.error('Failed to save score:', error);
                
                this.add.text(centerX, centerY + 150, 'Failed to save score', {
                    fontSize: '16px',
                    color: '#ff0000'
                }).setOrigin(0.5);
            }
        }
    }
} 