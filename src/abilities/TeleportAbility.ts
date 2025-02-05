import { Ability } from './Ability';
import { Player } from '../Player';

export class TeleportAbility extends Ability {
    private player: Player;
    private readonly TELEPORT_PARTICLES = 10;
    private readonly PARTICLE_TINT = 0x9933ff;

    constructor(scene: Phaser.Scene, player: Player) {
        //cooldown is 2 seconds
        super(scene, 2000);
        this.player = player;
    }

    use(): void {
        if (!this.canUse()) return;

        // Create particle effect at starting position
        this.createTeleportEffect(this.player.x, this.player.y);

        // Get cursor position in world coordinates
        const pointer = this.scene.input.activePointer;
        const targetX = pointer.x + this.scene.cameras.main.scrollX;
        const targetY = pointer.y + this.scene.cameras.main.scrollY;

        // Instantly teleport player
        this.player.setPosition(targetX, targetY);
        
        // Create particle effect at destination
        this.createTeleportEffect(targetX, targetY);

        // Reset velocity to prevent any lingering momentum
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);

        this.startCooldown();
    }

    private createTeleportEffect(x: number, y: number): void {
        for (let i = 0; i < this.TELEPORT_PARTICLES; i++) {
            const angle = (i / this.TELEPORT_PARTICLES) * Math.PI * 2;
            const particle = this.scene.add.circle(x, y, 3, this.PARTICLE_TINT);
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 30,
                y: y + Math.sin(angle) * 30,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }
}
