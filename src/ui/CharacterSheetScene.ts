import { Player } from "../Player";

export class CharacterSheetScene extends Phaser.Scene {
    private player!: Player;
    private silverOverlay!: Phaser.GameObjects.Rectangle;
    private statsPanel!: Phaser.GameObjects.Container;
    private background!: Phaser.GameObjects.Rectangle;
    private playerName!: Phaser.GameObjects.Text;
    private spritePreview!: Phaser.GameObjects.Sprite;

    constructor() {
        super({ key: 'CharacterSheetScene' });
    }

    create(data: { player: Player }) {
        this.player = data.player;

        // Add keyboard event for closing
        this.input.keyboard!.on('keydown-C', () => {
            console.log('Closing CharacterSheetScene');
            this.scene.resume('ArenaScene');
            this.scene.stop();
        });

        // Add keyboard event for ESC as well
        this.input.keyboard!.on('keydown-ESC', () => {
            console.log('Closing CharacterSheetScene with ESC');
            this.scene.resume('ArenaScene');
            this.scene.stop();
        });

        // Create dark overlay
        this.silverOverlay = this.add.rectangle(
            0, 
            0, 
            800,
            600,
            0xA86632
        )
        .setOrigin(0)
        .setScrollFactor(0)
        .setDepth(998);

        // Add player name at top
        this.playerName = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 130,
            'Darius',
            {
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#e8a26b',
                padding: { x: 10, y: 5 },
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
            }
        ).setOrigin(0.5, 0.5)
        .setDepth(999);

        // Left Panel
        const spritePanel = this.add.rectangle(
            this.cameras.main.centerX - 120,
            this.cameras.main.centerY - 30,
            100,
            150,
            0xe8a26b
        ).setDepth(999)
        .setStrokeStyle(2, 0x000000);

        // Player Sprite Preview
        this.spritePreview = this.add.sprite(
            this.cameras.main.centerX - 120,
            this.cameras.main.centerY - 35,
            'player'
        )
        .setScale(2)
        .setDepth(999);

        // Right Panel
        const statsBackground = this.add.rectangle(
            this.cameras.main.centerX + 80,
            this.cameras.main.centerY - 30,
            200,
            150,
            0xe8a26b
        ).setDepth(999)
        .setStrokeStyle(2, 0x000000);

        // Stats Panel
        this.statsPanel = this.createStatsPanel(
            this.cameras.main.centerX - 10,
            this.cameras.main.centerY - 90
        );

        this.scene.setVisible(true);
        console.log('Scene set visible');

        this.updateStats();

        this.player.on('healthChanged', () => this.updateStats());
        this.player.on('scoreChanged', () => this.updateStats());
    }

    private createStatsPanel(x: number, y: number): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        container.setDepth(999);

        const stats = [
            { label: 'Health', value: '100/100' },
            { label: 'Attack', value: '10' },
            { label: 'Defense', value: '5' },
            { label: 'Speed', value: '100' },
            { label: 'Score', value: '0' }
        ];

        stats.forEach((stat, index) => {
            const yOffset = index * 25 + 10;
            const text = this.add.text(0, yOffset, `${stat.label}: ${stat.value}`, {
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            });
            container.add(text);
        });

        return container;
    }

    public updateStats(): void {
        // Only update if scene is active and player exists
        if (!this.player || !this.scene.isActive()) return;
        
        const texts = this.statsPanel.getAll() as Phaser.GameObjects.Text[];
        if (!texts || texts.length === 0) return;  // Add safety check for texts array

        texts[0].setText(`Health: ${this.player.getHealth()}/${this.player.getMaxHealth()}`);
        texts[1].setText(`Attack: ${this.player.getAttack()}`);
        texts[2].setText(`Defense: ${this.player.getDefense()}`);
        texts[3].setText(`Speed: ${this.player.getSpeed()}`);
        texts[4].setText(`Score: ${this.player.getScore()}`);
    }
} 