export class Tooltip {
    private scene: Phaser.Scene;
    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;
    private padding: number = 10;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // Create invisible background
        this.background = scene.add.rectangle(0, 0, 0, 0, 0x000000, 0.7)
            .setOrigin(0.5)
            .setVisible(false);

        // Create invisible text
        this.text = scene.add.text(0, 0, '', {
            fontSize: '12px',
            color: '#ffffff',
            align: 'center',
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000000',
                blur: 1,
                fill: true
            }
        })
        .setOrigin(0.5)
        .setVisible(false);
    }

    show(x: number, y: number, content: string): void {
        // Update text content
        this.text.setText(content);

        // Adjust background size to fit text
        const textWidth = this.text.width + this.padding * 2;
        const textHeight = this.text.height + this.padding;
        this.background.setSize(textWidth, textHeight);

        // Position both elements
        const tooltipY = y - 30; // Offset above the item
        this.background.setPosition(x, tooltipY);
        this.text.setPosition(x, tooltipY);

        // Make visible
        this.background.setVisible(true);
        this.text.setVisible(true);
    }

    hide(): void {
        this.background.setVisible(false);
        this.text.setVisible(false);
    }

    destroy(): void {
        this.background.destroy();
        this.text.destroy();
    }
} 