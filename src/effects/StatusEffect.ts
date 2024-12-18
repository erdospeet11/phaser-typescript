export abstract class StatusEffect {
    protected duration: number = 5000; // 5 seconds
    protected target: Phaser.GameObjects.Sprite;
    protected scene: Phaser.Scene;
    protected timer: Phaser.Time.TimerEvent;
    protected visualEffect?: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Phaser.Scene, target: Phaser.GameObjects.Sprite) {
        this.scene = scene;
        this.target = target;
        this.timer = scene.time.delayedCall(this.duration, this.remove, [], this);
    }

    abstract apply(): void;
    abstract tick(): void;

    protected remove(): void {
        if (this.visualEffect) {
            this.visualEffect.stop();
            this.visualEffect.destroy();
        }
        this.timer.remove();
    }
} 