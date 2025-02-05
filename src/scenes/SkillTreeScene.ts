import { Scene } from 'phaser';

interface SkillNode {
    x: number;
    y: number;
    name: string;
    description: string;
    unlocked: boolean;
    sprite: Phaser.GameObjects.Sprite;
    connections: Phaser.GameObjects.Line[];
}

export class SkillTreeScene extends Scene {
    private nodes: Map<string, SkillNode> = new Map();
    private backButton!: Phaser.GameObjects.Text;
    private descriptionText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'SkillTreeScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Add semi-transparent grey background
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0)
            .setDepth(998);

        // Add panel background
        this.add.rectangle(width/2, height/2, width * 0.8, height * 0.8, 0x808080)
            .setOrigin(0.5)
            .setDepth(999);

        // Rest of the UI elements need setDepth(1000)
        this.add.text(width / 2, 50, 'Skill Tree', {
            fontSize: '32px',
            color: '#ffffff'
        })
        .setOrigin(0.5)
        .setDepth(1000);

        // Create nodes
        this.createSkillNode('root', width / 2, height / 2, 'Base Skill', 'Your starting point');
        this.createSkillNode('left', width / 3, height / 3, 'Left Branch', 'Enhances your attack');
        this.createSkillNode('right', (width / 3) * 2, height / 3, 'Right Branch', 'Enhances your defense');

        // Create connections between nodes
        this.createConnection('root', 'left');
        this.createConnection('root', 'right');

        // Add back button
        this.backButton = this.add.text(50, 50, '← Back', {
            fontSize: '24px',
            color: '#ffffff'
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('ArenaScene');
        })
        .setDepth(1000);

        // Add description text area
        this.descriptionText = this.add.text(width / 2, height - 100, '', {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        })
        .setOrigin(0.5)
        .setDepth(1000);

        // Replace TAB with M key handler
        this.input.keyboard!.on('keydown-M', () => {
            this.scene.resume('ArenaScene');
            this.scene.stop();
        });

        // Add ESC key handler as an alternative
        this.input.keyboard!.on('keydown-ESC', () => {
            this.scene.resume('ArenaScene');
            this.scene.stop();
        });

        // Remove the back button since we're using M/ESC
        if (this.backButton) {
            this.backButton.destroy();
        }
    }

    private createSkillNode(id: string, x: number, y: number, name: string, description: string) {
        // Create a red circle for the node
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffffff);  // White border
        graphics.fillStyle(0xff0000, 1);  // Red fill
        graphics.fillCircle(x, y, 25);    // Fill circle
        graphics.strokeCircle(x, y, 25);  // Draw border
        graphics.setDepth(1000);          // Ensure it's visible above background

        // Make the graphics object interactive
        const hitArea = new Phaser.Geom.Circle(x, y, 25);
        graphics.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

        // Create the node object
        const node: SkillNode = {
            x,
            y,
            name,
            description,
            unlocked: id === 'root',
            sprite: graphics as any, // We're using graphics instead of sprite
            connections: []
        };

        // Add hover effects
        graphics.on('pointerover', () => {
            graphics.clear();
            graphics.lineStyle(2, 0xffffff);
            graphics.fillStyle(0xff3333, 1);  // Lighter red on hover
            graphics.fillCircle(x, y, 25);
            graphics.strokeCircle(x, y, 25);
            this.descriptionText.setText(`${name}\n${description}`);
        });

        graphics.on('pointerout', () => {
            graphics.clear();
            graphics.lineStyle(2, 0xffffff);
            graphics.fillStyle(0xff0000, 1);  // Back to original red
            graphics.fillCircle(x, y, 25);
            graphics.strokeCircle(x, y, 25);
            this.descriptionText.setText('');
        });

        this.nodes.set(id, node);
    }

    private createConnection(fromId: string, toId: string) {
        const fromNode = this.nodes.get(fromId);
        const toNode = this.nodes.get(toId);

        if (fromNode && toNode) {
            const line = this.add.line(
                0, 0,
                fromNode.x, fromNode.y,
                toNode.x, toNode.y,
                0xffffff
            ).setOrigin(0);

            fromNode.connections.push(line);
        }
    }
} 