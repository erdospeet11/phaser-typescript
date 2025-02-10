import { Player } from "../Player";

export class CharacterSheetScene extends Phaser.Scene {
    private player!: Player;

    constructor() {
        super({ key: 'CharacterSheetScene' });
    }

    create(data: { player: Player }) {
        this.player = data.player;
        const { width, height } = this.cameras.main;
        const playerName = localStorage.getItem('playerName') || 'ERROR';

        this.input.keyboard!.on('keydown-C', () => this.closeSheet());
        this.input.keyboard!.on('keydown-ESC', () => this.closeSheet());

        this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0)
            .setDepth(998);
        
        this.add.text(width * 0.25, height * 0.2, playerName, {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setDepth(999);

        this.add.sprite(width * 0.25, height * 0.4, this.player.texture.key)
            .setScale(3)
            .setDepth(999);

        const stats = [
            { label: 'Level', value: '1' },
            { label: 'Experience', value: `${this.player.getExperience()}/${this.player.getExperienceToNextLevel()}` },
            { label: 'Health', value: `${this.player.getHealth()}/${this.player.getMaxHealth()}` },
            { label: 'Attack', value: this.player.getAttack().toString() },
            { label: 'Speed', value: this.player.getSpeed().toString() }
        ];

        stats.forEach((stat, index) => {
            this.add.text(width * 0.6, height * 0.25 + (index * 30), stat.label, {
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            })
            .setDepth(999);

            this.add.text(width * 0.8, height * 0.25 + (index * 30), stat.value, {
                fontSize: '12px',
                color: '#ffff00',
                fontStyle: 'bold'
            })
            .setDepth(999);
        });

        const closeButton = this.add.text(width - 20, 20, '✕', {
            fontSize: '20px',
            color: '#ffffff'
        })
        .setOrigin(1, 0)
        .setDepth(999)
        .setInteractive({ useHandCursor: true })
        .on('pointerup', () => this.closeSheet())
        .on('pointerover', () => closeButton.setTint(0xff0000))
        .on('pointerout', () => closeButton.clearTint());
    }

    private closeSheet(): void {
        this.scene.resume('ArenaScene');
        this.scene.stop();
    }

    private updateStats(): void {
        // Add any stat update logic here if needed
    }
} 