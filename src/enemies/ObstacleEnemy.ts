import { Enemy } from './Enemy';

export class ObstacleEnemy extends Enemy {
    private static readonly MIN_SPAWN_DISTANCE = 10; // Minimum distance from player
    private static readonly MAX_SPAWN_DISTANCE = 20; // Maximum distance from player

    private damageInterval: number = 1000; // Time in ms between damage ticks
    private lastDamageTime: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        
        // Change appearance
        this.setTexture('obstacle-enemy');
        
        // Customize stats
        this.health = 150;
        this.maxHealth = 150;
        this.attack = 15;
        this.speed = 0; // Doesn't move
        
        // Make it stationary
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setVelocity(0, 0);
    }

    update(player: Phaser.GameObjects.Sprite): void {
        // Only update health bar, skip movement logic
        this.updateHealthBar();
    }

    // Optional: Override handleDeath to maybe spawn some specific pickups
    protected handleDeath(): void {
        // You could add specific death behavior here
        super.handleDeath();
    }

    public static spawnNearPlayer(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): ObstacleEnemy {
        // Generate random angle
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        
        // Generate random distance between min and max
        const distance = Phaser.Math.Between(
            this.MIN_SPAWN_DISTANCE,
            this.MAX_SPAWN_DISTANCE
        );

        // Calculate spawn position
        const spawnX = player.x + Math.cos(angle) * distance;
        const spawnY = player.y + Math.sin(angle) * distance;

        return new ObstacleEnemy(scene, spawnX, spawnY);
    }
} 