import { Enemy } from './Enemy';
import { Player } from '../Player';
import { RangedEnemy } from './RangedEnemy';
import { ArenaScene } from '../scenes/ArenaScene';

export class DevilBoss extends Enemy {
    protected entity_state: 'chasing' | 'spawning';
    protected stateTimer: number;
    protected readonly SPAWN_INTERVAL = 5000;
    protected readonly DEMON_COUNT = 2;
    protected justEnteredSpawningState: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'devil');
        
        scene.physics.add.existing(this);
        
        this.entity_state = 'chasing';
        this.stateTimer = 0;
        
        // Higher stats for final boss
        this.health = 1000;
        this.maxHealth = 1000;
        this.speed = 0.6;

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(40, 35); // Adjusted for 46x41 sprite
        body.setOffset(3, 3);
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

        if (this.entity_state === 'chasing') {
            this.chasePlayer(player);
        } else {
            const body = this.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(0, 0);
            this.spawnDemons();
        }

        this.updateHealthBar();
    }

    private toggleState(): void {
        this.entity_state = this.entity_state === 'chasing' ? 'spawning' : 'chasing';
        if (this.entity_state === 'spawning') {
            this.justEnteredSpawningState = true;
        }
    }

    private spawnDemons(): void {
        if (this.justEnteredSpawningState) {
            const body = this.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(0, 0);

            for (let i = 0; i < this.DEMON_COUNT; i++) {
                const angle = (i * Math.PI * 2) / this.DEMON_COUNT;
                const distance = 100;
                
                const spawnX = this.x + Math.cos(angle) * distance;
                const spawnY = this.y + Math.sin(angle) * distance;
                
                const demon = new RangedEnemy(
                    this.scene, 
                    spawnX, 
                    spawnY, 
                    'demon',
                    'fireball'
                );
                const scene = this.scene as ArenaScene;
                scene.addEnemy(demon);
                scene.setupEnemyProjectileColliders(demon);
            }
            this.justEnteredSpawningState = false;
        }
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

    public handleDeath(): void {
        this.scene.scene.start('EndGameScene', { 
            victory: true,
            score: (this.scene as ArenaScene).getPlayer().getScore(),
            gold: (this.scene as ArenaScene).getPlayer().getCoins()
        });
    }
} 