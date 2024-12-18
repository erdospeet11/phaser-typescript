import { Room } from './Room';
import { TentacleBoss } from '../enemies/TentacleBoss';
import { ArenaScene } from '../scenes/ArenaScene';

export class BossRoom extends Room {
    setup(): void {
        //Spawn the boss in the center
        const boss = new TentacleBoss(
            this.scene,
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY
        );

        // Add boss to enemies group collision
        this.scene.addEnemy(boss);

        // Setup any boss-specific colliders if needed
        this.scene.physics.add.collider(boss, this.scene.getWalls());
        this.scene.physics.add.collider(
            this.scene.getPlayer().getProjectiles(),
            boss,
            this.scene.handleProjectileEnemyCollision,
            undefined,
            this.scene
        );
    }
} 