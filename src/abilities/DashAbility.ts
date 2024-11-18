import { Ability } from './Ability';
import { Player } from '../Player';

export class DashAbility extends Ability {
    private player: Player;
    private dashSpeed: number = 150;
    private dashDuration: number = 200;
    private dashDistance: number = 50;
    private dashTimer?: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, 1000);
        this.player = player;
    }

    use(): void {
        if (!this.canUse()) return;

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        let dashDirection = new Phaser.Math.Vector2(0, 0);

        // Dash direction
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

        // Normalize dash direction so it's always the same speed
        dashDirection.normalize();
        
        // Calculate target position
        const targetX = this.player.x + (dashDirection.x * this.dashDistance);
        const targetY = this.player.y + (dashDirection.y * this.dashDistance);

        // Smooth dash
        this.scene.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: this.dashDuration,
            ease: 'Cubic.easeOut',
            onStart: () => {
                // Dash effect
                this.scene.tweens.add({
                    targets: this.player,
                    alpha: 0.5,
                    duration: this.dashDuration / 2,
                    yoyo: true
                });
            },
            onComplete: () => {
                body.setVelocity(0, 0);
            }
        });

        this.startCooldown();
    }

    destroy(): void {
        if (this.dashTimer) {
            this.dashTimer.destroy();
        }
        super.destroy();
    }
} 