import { Ability } from './Ability';
import { Player } from '../Player';

export class DashAbility extends Ability {
    private player: Player;
    private readonly DASH_SPEED = 150;
    private readonly DASH_DURATION = 200;  // milliseconds
    private readonly DASH_MULTIPLIER = 2.5;
    private readonly GHOST_ALPHA = 0.3;
    private readonly GHOST_TINT = 0x4444ff;
    private readonly NUM_GHOSTS = 3;
    private dashTimer?: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, 1000);
        this.player = player;
    }

    use(): void {
        if (!this.canUse()) return;

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        let dashDirection = new Phaser.Math.Vector2(0, 0);

        // Get dash direction
        const keys = this.scene.input.keyboard!.keys;
        if (keys[Phaser.Input.Keyboard.KeyCodes.A].isDown) dashDirection.x -= 1;
        if (keys[Phaser.Input.Keyboard.KeyCodes.D].isDown) dashDirection.x += 1;
        if (keys[Phaser.Input.Keyboard.KeyCodes.W].isDown) dashDirection.y -= 1;
        if (keys[Phaser.Input.Keyboard.KeyCodes.S].isDown) dashDirection.y += 1;

        // If no keys pressed, dash towards mouse
        if (dashDirection.length() === 0) {
            const pointer = this.scene.input.activePointer;
            dashDirection = new Phaser.Math.Vector2(
                pointer.x + this.scene.cameras.main.scrollX - this.player.x,
                pointer.y + this.scene.cameras.main.scrollY - this.player.y
            );
        }

        dashDirection.normalize();
        
        // Use DASH_MULTIPLIER for distance calculation
        const dashDistance = this.DASH_SPEED * this.DASH_MULTIPLIER;
        const targetX = this.player.x + (dashDirection.x * dashDistance);
        const targetY = this.player.y + (dashDirection.y * dashDistance);

        // Create ghost trail
        const ghostInterval = this.DASH_DURATION / this.NUM_GHOSTS;
        for (let i = 0; i < this.NUM_GHOSTS; i++) {
            this.scene.time.delayedCall(i * ghostInterval, () => {
                this.createGhostEffect();
            });
        }

        // Use DASH_DURATION for the tween
        this.scene.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: this.DASH_DURATION,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                body.setVelocity(0, 0);
            }
        });

        this.startCooldown();
    }

    private createGhostEffect(): void {
        const ghost = this.scene.add.sprite(
            this.player.x,
            this.player.y,
            this.player.texture.key,
            this.player.frame.name
        );
        ghost.setAlpha(this.GHOST_ALPHA);
        ghost.setTint(this.GHOST_TINT);
        ghost.setFlipX(this.player.flipX);
        ghost.setOrigin(0.5);
        ghost.setDepth(this.player.depth - 1);
        ghost.setScale(this.player.scaleX, this.player.scaleY);

        this.scene.tweens.add({
            targets: ghost,
            alpha: 0,
            duration: this.DASH_DURATION / 2,
            ease: 'Linear',
            onComplete: () => ghost.destroy()
        });
    }

    destroy(): void {
        if (this.dashTimer) {
            this.dashTimer.destroy();
        }
        super.destroy();
    }
} 