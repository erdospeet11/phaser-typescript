export class Projectile extends Phaser.Physics.Arcade.Sprite {
    protected speed: number = 300;
    private damage: number = 20;

    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        spriteKey: string = 'projectile',
        attack: number = 20
    ) {
        super(scene, x, y, spriteKey);
        this.damage = attack;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set up physics body
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(8, 8);
        body.setOffset(4, 4);
    }

    setSpeed(speed: number): void {
        this.speed = speed;
    }

    fire(direction: { x: number, y: number }): void {
        this.setActive(true);
        this.setVisible(true);

        // Normalize the direction vector
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        direction.x /= length;
        direction.y /= length;

        // Calculate rotation angle
        const angle = Math.atan2(direction.y, direction.x);
        this.setRotation(angle);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(
            direction.x * this.speed,
            direction.y * this.speed
        );
    }

    getDamage(): number {
        return this.damage;
    }

    setDamage(damage: number): void {
        this.damage = damage;
    }
} 