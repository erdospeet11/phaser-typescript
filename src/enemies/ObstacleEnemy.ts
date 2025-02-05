import { Enemy } from './Enemy';
import { ArenaScene } from '../scenes/ArenaScene';

export class ObstacleEnemy extends Enemy {
    private static readonly MIN_SPAWN_DISTANCE = 10;
    private static readonly MAX_SPAWN_DISTANCE = 20;
    private teleportTimer: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        
        this.setTexture('obstacle-enemy');
        
        this.health = 150;
        this.maxHealth = 150;
        this.attack = 15;
        this.speed = 0;
        
        // It does not move
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setVelocity(0, 0);

        // Set up teleport timer
        this.teleportTimer = this.scene.time.delayedCall(3000, () => {
            this.teleportNearPlayer();
        });
    }

    update(player: Phaser.GameObjects.Sprite): void {
        this.updateHealthBar();
    }

    private teleportNearPlayer(): void {
        const player = (this.scene as ArenaScene).getPlayer();
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        
        const distance = Phaser.Math.Between(
            ObstacleEnemy.MIN_SPAWN_DISTANCE,
            ObstacleEnemy.MAX_SPAWN_DISTANCE
        );

        const newX = player.x + Math.cos(angle) * distance;
        const newY = player.y + Math.sin(angle) * distance;

        this.setPosition(newX, newY);

        // Reset timer for next teleport
        this.teleportTimer = this.scene.time.delayedCall(3000, () => {
            this.teleportNearPlayer();
        });
    }

    public static spawnNearPlayer(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): ObstacleEnemy {
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        
        const distance = Phaser.Math.Between(
            this.MIN_SPAWN_DISTANCE,
            this.MAX_SPAWN_DISTANCE
        );

        const spawnX = player.x + Math.cos(angle) * distance;
        const spawnY = player.y + Math.sin(angle) * distance;

        return new ObstacleEnemy(scene, spawnX, spawnY);
    }

    destroy(fromScene?: boolean): void {
        if (this.teleportTimer) {
            this.teleportTimer.destroy();
        }
        super.destroy(fromScene);
    }
} 