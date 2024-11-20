import { Projectile } from '../Projectile';
import { Weapon } from './Weapon';

export class RangedWeapon extends Weapon {
    readonly projectileKey: string;
    private projectiles!: Phaser.GameObjects.Group;

    constructor(
        name: string,
        spriteKey: string,
        projectileKey: string,
        damage: number = 10,
        cooldown: number = 250
    ) {
        super(name, spriteKey, damage, cooldown);
        this.projectileKey = projectileKey;
    }

    initializeProjectiles(scene: Phaser.Scene): void {
        this.projectiles = scene.add.group({
            classType: Projectile,
            maxSize: 10,
            runChildUpdate: true,
            createCallback: (proj) => {
                const projectile = proj as Projectile;
                scene.physics.add.existing(projectile);
                const body = projectile.body as Phaser.Physics.Arcade.Body;
                body.setSize(8, 8);
                body.setOffset(4, 4);
            }
        });
    }

    use(scene: Phaser.Scene, x: number, y: number, angle: number): void {
        if (!this.projectiles) {
            this.initializeProjectiles(scene);
        }

        const offsetX = Math.cos(angle) * 5;
        const offsetY = Math.sin(angle) * 5;

        const projectile = this.projectiles.get(
            x + offsetX,
            y + offsetY
        ) as Projectile;

        if (projectile) {
            projectile.setActive(true);
            projectile.setVisible(true);
            projectile.setTexture(this.projectileKey);
            projectile.setDamage(this.damage);
            projectile.fire({
                x: Math.cos(angle),
                y: Math.sin(angle)
            });
        }
    }

    getProjectiles(): Phaser.GameObjects.Group {
        return this.projectiles;
    }
} 