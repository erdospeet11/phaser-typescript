export class FloatingDamage extends Phaser.GameObjects.Text {
    private moveSpeed: number = 1;
    private fadeSpeed: number = 500;
    private isCritical: boolean = false;

    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        damage: number, 
        isCritical: boolean,
        emoji: string = '',
        color: number = 0xffffff
    ) {
        //text with damage value and optional emoji
        super(scene, x, y, `${emoji}${damage}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: `#${color.toString(16)}`,
            stroke: '#000000',
            strokeThickness: 2
        });

        scene.add.existing(this);

        this.startFloating();
    }

    private startFloating(): void {
        //tween
        this.scene.tweens.add({
            targets: this,
            y: this.y - 50,
            alpha: 0,
            duration: this.fadeSpeed,
            ease: 'Power1',
            onComplete: () => {
                this.destroy();
            }
        });
    }
} 