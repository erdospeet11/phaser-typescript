import { Enemy } from './Enemy';

export class ObstacleEnemy extends Enemy {
    private static readonly MIN_SPAWN_DISTANCE = 10;
    private static readonly MAX_SPAWN_DISTANCE = 20;

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
    }

    update(player: Phaser.GameObjects.Sprite): void {
        this.updateHealthBar();
    }

    public static spawnNearPlayer(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): ObstacleEnemy {
        // Random angle
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        
        // Random distance
        const distance = Phaser.Math.Between(
            this.MIN_SPAWN_DISTANCE,
            this.MAX_SPAWN_DISTANCE
        );

        const spawnX = player.x + Math.cos(angle) * distance;
        const spawnY = player.y + Math.sin(angle) * distance;

        return new ObstacleEnemy(scene, spawnX, spawnY);
    }
} 