import { Ability } from './Ability';
import { Player } from '../Player';
import { Projectile } from '../Projectile';
import { ArenaScene } from '../scenes/ArenaScene';

export class SlashAbility extends Ability {
    private player: Player;
    private readonly SLASH_DAMAGE = 200;
    private readonly SLASH_SIZE = 32;
    private readonly SLASH_COOLDOWN = 10000; 
    private readonly SLASH_ANGLES = [45, 135, 225, 315];

    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, 10000);
        this.player = player;
    }

    use(): void {
        if (!this.canUse()) return;

        this.SLASH_ANGLES.forEach(angle => {
            this.createSlash(angle);
        });

        this.startCooldown();
    }

    private createSlash(angle: number): void {
        const radianAngle = Phaser.Math.DegToRad(angle);
        const slashX = this.player.x + Math.cos(radianAngle) * (this.SLASH_SIZE / 2);
        const slashY = this.player.y + Math.sin(radianAngle) * (this.SLASH_SIZE / 2);

        //Slash
        const slash = this.scene.add.sprite(slashX, slashY, 'sword-slash');
        slash.setRotation(radianAngle);
        slash.setScale(2);
        slash.setDepth(10);

        //Hitbox
        const projectile = new Projectile(this.scene, slashX, slashY, 'sword-slash');
        projectile.setDamage(this.SLASH_DAMAGE);
        projectile.setRotation(radianAngle);
        projectile.setScale(2);
        projectile.setDepth(10);

        //Physics
        this.scene.physics.add.existing(projectile);
        (this.scene as ArenaScene).getPlayerProjectiles().add(projectile);

        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
        body.setSize(this.SLASH_SIZE, this.SLASH_SIZE);
        body.setImmovable(true);

        // Destroy the visual effect and hitbox
        this.scene.time.delayedCall(200, () => {
            slash.destroy();
            projectile.destroy();
        });
    }
} 