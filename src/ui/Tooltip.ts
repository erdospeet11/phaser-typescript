export class Tooltip {
    private scene: Phaser.Scene;
    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;
    private padding: number = 10;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        this.background = scene.add.rectangle(0, 0, 0, 0, 0x000000, 0.7)
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(1000);

        this.text = scene.add.text(0, 0, '', {
            fontSize: '10px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 150 }
        })
        .setOrigin(0.5)
        .setVisible(false)
        .setDepth(1000);
    }

    show(x: number, y: number, content: string): void {
        this.text.setText(content);

        const textWidth = this.text.width + this.padding * 2;
        const textHeight = this.text.height + this.padding;
        this.background.setSize(textWidth, textHeight);

        const tooltipY = y - textHeight - 5;
        this.background.setPosition(x, tooltipY);
        this.text.setPosition(x, tooltipY);

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