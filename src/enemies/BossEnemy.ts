import { Enemy } from './Enemy';
import { Player } from '../Player';
import { Projectile } from '../Projectile';

enum BossState {
    CHASE,
    SHOOT
}

export class BossEnemy extends Enemy {
    private projectiles: Phaser.GameObjects.Group;
    private currentState: BossState = BossState.CHASE;
    private lastStateChange: number = 0;
    private stateChangeCooldown: number = 3000; // Switch states every 3 seconds
    private lastShootTime: number = 0;
    private shootCooldown: number = 1000; // Shoot every 1 second when in SHOOT state

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        
        // Change sprite and adjust properties for boss
        this.setTexture('boss'); // You might want to use a different texture
        this.setScale(3); // Make boss bigger
        
        // Adjust boss stats
        this.health = 500;
        this.maxHealth = 500;
        this.attack = 20;
        this.speed = 0.15; // Slower than regular enemies
        
        // Configure physics body for larger size
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(32, 32);
        
        // Create projectiles group
        this.projectiles = scene.add.group({
            classType: Projectile,
            maxSize: 20,
            runChildUpdate: true
        });
    }

    update(player: Player): void {
        super.updateHealthBar();

        // Check if it's time to switch states
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastStateChange >= this.stateChangeCooldown) {
            this.switchState();
            this.lastStateChange = currentTime;
        }

        // Handle behavior based on current state
        if (this.currentState === BossState.CHASE) {
            this.handleChaseState(player);
        } else {
            this.handleShootState(player);
        }

        // Update facing direction
        const dx = player.x - this.x;
        this.setFlipX(dx < 0);
    }

    private switchState(): void {
        // Switch between states
        this.currentState = this.currentState === BossState.CHASE 
            ? BossState.SHOOT 
            : BossState.CHASE;

        // Stop movement when switching to shoot state
        if (this.currentState === BossState.SHOOT) {
            const body = this.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(0, 0);
        }
    }

    private handleChaseState(player: Player): void {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
            const dirX = dx / distance;
            const dirY = dy / distance;

            const body = this.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(
                dirX * this.speed * 100,
                dirY * this.speed * 100
            );
        }
    }

    private handleShootState(player: Player): void {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastShootTime >= this.shootCooldown) {
            this.shoot(player);
            this.lastShootTime = currentTime;
        }
    }

    private shoot(player: Player): void {
        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            player.x,
            player.y
        );

        const projectile = this.projectiles.get(
            this.x,
            this.y
        ) as Projectile;

        if (projectile) {
            projectile.fire({
                x: Math.cos(angle),
                y: Math.sin(angle)
            });
        }
    }

    getProjectiles(): Phaser.GameObjects.Group {
        return this.projectiles;
    }

    // Override damage to make boss flash red when hit
    damage(amount: number): boolean {
        const isDead = super.damage(amount);
        
        // Flash red effect
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
        
        return isDead;
    }
} 