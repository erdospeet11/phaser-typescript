export class Projectile extends Phaser.Physics.Arcade.Sprite {
    private speed: number = 300;
    private damage: number = 20;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'projectile');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set up physics body
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(8, 8); // Adjust based on your projectile sprite size
    }

    fire(direction: { x: number, y: number }): void {
        this.setActive(true);
        this.setVisible(true);

        // Normalize the direction vector
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        direction.x /= length;
        direction.y /= length;

        // Calculate rotation angle from direction
        const angle = Math.atan2(direction.y, direction.x);
        this.setRotation(angle);

        // Set velocity
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(
            direction.x * this.speed,
            direction.y * this.speed
        );
    }

    getDamage(): number {
        return this.damage;
    }
} 