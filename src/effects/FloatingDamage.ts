export class FloatingDamage extends Phaser.GameObjects.Text {
    private moveSpeed: number = 1;
    private fadeSpeed: number = 500; // Time in ms for the text to fade out
    private isCritical: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, damage: number, isCritical: boolean) {
        // Create text with damage value
        super(scene, x, y, damage.toString(), {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: isCritical ? '#ff0000' : '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });

        // Add to scene
        scene.add.existing(this);

        // Start floating animation
        this.startFloating();
    }

    private startFloating(): void {
        // Move upward
        this.scene.tweens.add({
            targets: this,
            y: this.y - 50, // Float up 50 pixels
            alpha: 0, // Fade out
            duration: this.fadeSpeed,
            ease: 'Power1',
            onComplete: () => {
                this.destroy(); // Remove when animation is complete
            }
        });
    }
} 