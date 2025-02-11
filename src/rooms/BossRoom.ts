import { Room } from './Room';
import { TentacleBoss } from '../enemies/TentacleBoss';
import { BoxingDeerBoss } from '../enemies/BoxingDeerBoss';
import { ArenaScene } from '../scenes/ArenaScene';
import { Player } from '../Player';
import { Projectile } from '../Projectile';
import { DevilBoss } from '../enemies/DevilBoss';

export class BossRoom extends Room {
    setup(): void {
        //get the level type
        const levelType = (this.scene as ArenaScene).getLevelType();

        //choose boss based on level type
        let boss;
        if (levelType === 'forest') {
            boss = new BoxingDeerBoss(
                this.scene,
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY
            );
        } else if (levelType === 'hell') {
            boss = new DevilBoss(
                this.scene,
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY
            );
        } else {
            //default
            boss = new TentacleBoss(
                this.scene,
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY
            );
        }

        this.scene.addEnemy(boss);

        this.scene.physics.add.collider(boss, this.scene.getWalls());
        this.scene.physics.add.collider(
            this.scene.getPlayer().getProjectiles(),
            boss,
            this.scene.handleProjectileEnemyCollision,
            undefined,
            this.scene
        );

        //add additional collider setup for BoxingDeerBoss
        if (boss instanceof BoxingDeerBoss) {
            this.scene.physics.add.collider(
                this.scene.getPlayer(),
                (boss as any).weapon.getProjectiles(),
                (player, projectile) => {
                    (player as Player).damage(10);
                    (projectile as Projectile).destroy();
                }
            );

            this.scene.physics.add.collider(
                (boss as any).weapon.getProjectiles(),
                this.scene.getWalls(),
                (projectile) => {
                    (projectile as Projectile).destroy();
                }
            );
        }
    }
} 