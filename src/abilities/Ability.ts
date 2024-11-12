export abstract class Ability {
    protected scene: Phaser.Scene;
    protected cooldown: number;
    protected isOnCooldown: boolean = false;
    protected cooldownTimer?: Phaser.Time.TimerEvent;
    protected icon?: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, cooldown: number) {
        this.scene = scene;
        this.cooldown = cooldown;
    }

    abstract use(): void;

    protected startCooldown(): void {
        this.isOnCooldown = true;
        
        // Update icon if it exists
        if (this.icon) {
            this.icon.setAlpha(0.5);
        }

        this.cooldownTimer = this.scene.time.delayedCall(
            this.cooldown,
            () => {
                this.isOnCooldown = false;
                if (this.icon) {
                    this.icon.setAlpha(1);
                }
            }
        );
    }

    canUse(): boolean {
        return !this.isOnCooldown;
    }

    getCooldownRemaining(): number {
        if (!this.isOnCooldown || !this.cooldownTimer) return 0;
        return this.cooldownTimer.getRemaining();
    }

    destroy(): void {
        if (this.cooldownTimer) {
            this.cooldownTimer.destroy();
        }
        if (this.icon) {
            this.icon.destroy();
        }
    }
} 