import { Projectile } from '../Projectile';
import { Weapon } from './Weapon';
import { FireballProjectile } from '../projectiles/FireballProjectile';
import { ArrowProjectile } from '../projectiles/ArrowProjectile';

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

    use(scene: Phaser.Scene, x: number, y: number, facing: number, attack: number): void {
        let projectile;
        
        // Check projectile type based on projectileKey
        switch (this.projectileKey) {
            case 'fireball':
                projectile = new FireballProjectile(scene, x, y, this.projectileKey, attack);
                break;
            case 'arrow':
                projectile = new ArrowProjectile(scene, x, y, this.projectileKey, attack);
                break;
            default:
                projectile = new Projectile(scene, x, y, this.projectileKey, attack);
        }
        
        this.projectiles.add(projectile);
        
        // Calculate direction from facing angle
        const direction = {
            x: Math.cos(facing),
            y: Math.sin(facing)
        };
        
        // Fire the projectile
        projectile.fire(direction);
    }

    getProjectiles(): Phaser.GameObjects.Group {
        return this.projectiles;
    }
} 