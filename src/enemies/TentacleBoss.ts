import { Enemy } from './Enemy';
import { Player } from '../Player';
import { RangedEnemy } from './RangedEnemy';
import { ArenaScene } from '../scenes/ArenaScene';
import { Projectile } from '../Projectile';

export class TentacleBoss extends Enemy {
    protected statee: 'chasing' | 'spawning';
    protected stateTimer: number;
    protected readonly SPAWN_INTERVAL = 5000;
    protected readonly TENTACLE_COUNT = 1;
    protected justEnteredSpawningState: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'tentacle-boss');
        
        scene.physics.add.existing(this);
        
        this.statee = 'chasing';
        this.stateTimer = 0;
        
        this.health = 750;
        this.maxHealth = 500;
        this.speed = 0.5;

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(16, 16);
        body.setOffset(13, 13);
        body.setCollideWorldBounds(true);
        this.setScale(2);

        scene.add.existing(this);
    }

    update(player: Player): void {
        this.stateTimer += this.scene.game.loop.delta;

        if (this.stateTimer >= this.SPAWN_INTERVAL) {
            this.toggleState();
            this.stateTimer = 0;
        }

        if (this.statee === 'chasing') {
            this.chasePlayer(player);
        } else {
            const body = this.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(0, 0);
            this.spawnTentacles();
        }

        this.updateHealthBar();
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

            this.setFlipX(dirX < 0);
        }
    }

    private toggleState(): void {
        this.statee = this.statee === 'chasing' ? 'spawning' : 'chasing';
        if (this.statee === 'spawning') {
            this.justEnteredSpawningState = true;
        }
    }

    private spawnTentacles(): void {
        if (this.justEnteredSpawningState) {
            const body = this.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(0, 0);

            for (let i = 0; i < this.TENTACLE_COUNT; i++) {
                const angle = (i * Math.PI * 2) / this.TENTACLE_COUNT;
                const distance = 100;
                
                const spawnX = this.x + Math.cos(angle) * distance;
                const spawnY = this.y + Math.sin(angle) * distance;
                
                const tentacle = new RangedEnemy(
                    this.scene, 
                    spawnX, 
                    spawnY, 
                    'tentacle',    // tentacle sprite
                    'voidball'     // projectile sprite
                );
                const scene = this.scene as ArenaScene;
                scene.addEnemy(tentacle);
                scene.setupEnemyProjectileColliders(tentacle);
            }
            this.justEnteredSpawningState = false;
        }
    }
}

