export class CharacterSheet extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private playerName: Phaser.GameObjects.Text;
    private spritePreview: Phaser.GameObjects.Sprite;
    private statsPanel: Phaser.GameObjects.Container;
    private darkOverlay!: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);

        // Create dark overlay for background
        this.darkOverlay = scene.add.rectangle(
            0, 
            0, 
            scene.cameras.main.width,
            scene.cameras.main.height,
            0x000000,
            0.7
        )
        .setOrigin(0)
        .setDepth(998);  // Just below the character sheet
        this.darkOverlay.setScrollFactor(0);
        
        // Set panel depth to be above overlay
        this.setDepth(999);
        this.setScrollFactor(0);  // Fix to camera

        // Create background panel
        this.background = scene.add.rectangle(0, 0, 400, 300, 0xCCCCCC)
            .setOrigin(0)
            .setAlpha(0.9);
        this.add(this.background);

        // Add player name at top
        this.playerName = scene.add.text(200, 20, 'Darius', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
        }).setOrigin(0.5,0.5);
        this.add(this.playerName);

        // Create left panel for player sprite with gray background
        const spritePanel = scene.add.rectangle(80, 120, 100, 150, 0x666666);
        this.add(spritePanel);

        // Add player sprite preview
        this.spritePreview = scene.add.sprite(80, 115, 'player')
            .setScale(2);
        this.add(this.spritePreview);

        // Create right panel for stats with gray background
        const statsBackground = scene.add.rectangle(280, 120, 200, 150, 0x666666);
        this.add(statsBackground);

        // Create stats container
        this.statsPanel = this.createStatsPanel(190, 60);
        this.add(this.statsPanel);

        // Create Skills,Abilities container
        // Create right panel for stats with gray background
        const skillsBackground = scene.add.rectangle(200, 253, 375, 70, 0x666666);
        this.add(skillsBackground);

        // Create grid of rectangles in the bottom panel
        const gridConfig = {
            rows: 2,
            cols: 12,
            rectWidth: 25,
            rectHeight: 25,
            spacing: 6,
            startX: 16,
            startY: 225
        };

        for (let row = 0; row < gridConfig.rows; row++) {
            for (let col = 0; col < gridConfig.cols; col++) {
                const x = gridConfig.startX + col * (gridConfig.rectWidth + gridConfig.spacing);
                const y = gridConfig.startY + row * (gridConfig.rectHeight + gridConfig.spacing);
                
                // Create the background rectangle
                const rect = scene.add.rectangle(
                    x,
                    y,
                    gridConfig.rectWidth,
                    gridConfig.rectHeight,
                    0x444444
                ).setOrigin(0, 0);
                
                this.add(rect);

                // Add sprite to the first grid cell (as an example)
                if (row === 0 && col === 0) {
                    const sprite = scene.add.sprite(
                        x + gridConfig.rectWidth/2, // Center of rectangle
                        y + gridConfig.rectHeight/2,
                        'fireball' // Make sure this asset is preloaded
                    );
                    
                    this.add(sprite);
                }
            }
        }

        // Initially hide the panel
        this.hide();
    }

    private createStatsPanel(x: number, y: number): Phaser.GameObjects.Container {
        const container = new Phaser.GameObjects.Container(this.scene, x, y);

        const stats = [
            { label: 'Health', value: '100/100' },
            { label: 'Attack', value: '10' },
            { label: 'Defense', value: '5' },
            { label: 'Speed', value: '100' },
            { label: 'Score', value: '0' }
        ];

        stats.forEach((stat, index) => {
            const yOffset = index * 25 + 10;
            const text = this.scene.add.text(0, yOffset, `${stat.label}: ${stat.value}`, {
                fontSize: '16px',
                color: '#ffffff'
            });
            container.add(text);
        });

        return container;
    }

    show(): void {
        this.setVisible(true);
        this.darkOverlay.setVisible(true);
        // Hide the stats display when character sheet is open
        if (this.scene.game.scene.getScene('ArenaScene')) {
            const player = (this.scene.game.scene.getScene('ArenaScene') as any).player;
            if (player?.statsText) {
                player.statsText.setVisible(false);
            }
        }
    }

    hide(): void {
        this.setVisible(false);
        this.darkOverlay.setVisible(false);
        // Show the stats display when character sheet is closed
        if (this.scene.game.scene.getScene('ArenaScene')) {
            const player = (this.scene.game.scene.getScene('ArenaScene') as any).player;
            if (player?.statsText) {
                player.statsText.setVisible(true);
            }
        }
    }

    updateStats(stats: {
        health: number,
        maxHealth: number,
        attack: number,
        defense: number,
        speed: number,
        score: number
    }): void {
        const texts = this.statsPanel.getAll() as Phaser.GameObjects.Text[];
        texts[0].setText(`Health: ${stats.health}/${stats.maxHealth}`);
        texts[1].setText(`Attack: ${stats.attack}`);
        texts[2].setText(`Defense: ${stats.defense}`);
        texts[3].setText(`Speed: ${stats.speed}`);
        texts[4].setText(`Score: ${stats.score}`);
    }
} 