import { Enemy } from './Enemy';
import { Player } from '../Player';
import { ArenaScene } from '../scenes/ArenaScene';
import { RangedWeapon } from '../weapons/RangedWeapon';

export class BoxingDeerBoss extends Enemy {
    private entity_state: 'chasing' | 'shooting';
    private stateTimer: number;
    private readonly SHOOT_INTERVAL = 4000;
    private weapon: RangedWeapon;
    private justEnteredShootingState: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'boxingdeer-boss');
        
        scene.physics.add.existing(this);
        
        // Set boss stats
        this.health = 1000;
        this.maxHealth = 1000;
        this.speed = 0.6;  // Faster than tentacle boss
        this.attack = 25;  // Higher damage

        // Initialize state
        this.entity_state = 'chasing';
        this.stateTimer = 0;

        // Initialize weapon
        this.weapon = new RangedWeapon(
            'boxing-gloves',
            'boxing-glove',
            'boxing-glove',
            this.attack,
            0 // No cooldown for boss
        );
        this.weapon.initializeProjectiles(scene);

        // Set up physics body
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(24, 24);  // Adjust hitbox size as needed
        body.setOffset(4, 4);  // Adjust offset as needed
        body.setCollideWorldBounds(true);
        this.setScale(1.5);

        scene.add.existing(this);
    }

    update(player: Player): void {
        this.stateTimer += this.scene.game.loop.delta;

        if (this.stateTimer >= this.SHOOT_INTERVAL) {
            this.toggleState();
            this.stateTimer = 0;
        }

        if (this.entity_state === 'chasing') {
            this.chasePlayer(player);
        } else {
            const body = this.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(0, 0);
            
            // Only shoot if we just entered the shooting state
            if (this.justEnteredShootingState) {
                this.shootInAllDirections();
                this.justEnteredShootingState = false;
            }
        }

        this.updateHealthBar();
    }

    private toggleState(): void {
        this.entity_state = this.entity_state === 'chasing' ? 'shooting' : 'chasing';
        if (this.entity_state === 'shooting') {
            this.justEnteredShootingState = true;
        }
    }

    private shootInAllDirections(): void {
        const directions = [
            0,           // East
            Math.PI/4,   // Northeast
            Math.PI/2,   // North
            3*Math.PI/4, // Northwest
            Math.PI,     // West
            5*Math.PI/4, // Southwest
            3*Math.PI/2, // South
            7*Math.PI/4  // Southeast
        ];

        directions.forEach(angle => {
            this.weapon.use(this.scene, this.x, this.y, angle, this.attack);
        });
    }

    private chasePlayer(player: Player): void {
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

            // Flip sprite based on movement direction
            this.setFlipX(dirX < 0);
        }
    }

    destroy(fromScene?: boolean): void {
        if (this.weapon) {
            this.weapon.getProjectiles().destroy(true);
        }
        super.destroy(fromScene);
    }

    public handleDeath(): void {
        this.scene.scene.start('EndGameScene', { 
            victory: true,
            score: (this.scene as ArenaScene).getPlayer().getScore(),
            gold: (this.scene as ArenaScene).getPlayer().getCoins()
        });
    }
} 