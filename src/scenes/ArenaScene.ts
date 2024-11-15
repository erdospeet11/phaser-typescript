import { Player } from "../Player";
import { Enemy } from "../enemies/Enemy";
import { Projectile } from "../Projectile";
import { HealthPickup } from "../pickups/HealthPickup";
import { RangedEnemy } from '../enemies/RangedEnemy';
import { FloatingDamage } from '../effects/FloatingDamage';
import { CharacterSheet } from '../ui/CharacterSheet';
import { CoinPickup } from '../pickups/CoinPickup';

export class ArenaScene extends Phaser.Scene {
    private player!: Player;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private enemies!: Phaser.GameObjects.Group;
    public healthPickups!: Phaser.GameObjects.Group;
    public coinPickups!: Phaser.GameObjects.Group;
    private rangedEnemies!: Phaser.GameObjects.Group;
    private readonly MAX_ENEMIES: number = 2;
    private characterSheet!: CharacterSheet;

    constructor() {
        super({ key: 'ArenaScene' });
    }

    preload() {
        this.load.image('player', 'assets/player2.png');
        this.load.image('wall', 'assets/wall.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('ranged-enemy', 'assets/ranged-enemy.png');
        this.load.image('floor', 'assets/tile.png');
        this.load.image('projectile', 'assets/fireball.png');
        this.load.image('health-pickup', 'assets/health_pickup.png');
        this.load.image('custom-cursor', 'assets/cursor.png');
        this.load.image('fireball', 'assets/fireball.png');
        this.load.image('coin-pickup', 'assets/coin_pickup.png');
    }

    create() {
        this.input.setDefaultCursor('url(assets/cursor.png), auto');

        // Create arena floor - reduced size from 800x600 to 400x300
        this.add.tileSprite(200, 150, 400, 300, 'floor');

        // Create arena walls
        this.createArenaWalls();

        // Create player in center of smaller arena
        this.player = new Player(this, 200, 150);

        // Create enemies group with proper physics
        this.enemies = this.add.group({
            classType: Enemy,
            runChildUpdate: true,
            maxSize: 20
        });

        // Create health pickups group
        this.healthPickups = this.add.group({
            classType: HealthPickup,
            runChildUpdate: true
        });

        // Create coin pickups group
        this.coinPickups = this.add.group({
            classType: CoinPickup,
            runChildUpdate: true
        });

        // Create ranged enemies group
        this.rangedEnemies = this.add.group({
            classType: RangedEnemy,
            runChildUpdate: true,
            maxSize: 20
        });

        // Add collisions
        this.physics.world.fixedStep = false;

        // Setup physics
        this.setupPhysicsColliders();
        this.setupPhysicsOverlaps();

        // Start spawning enemies
        this.startEnemySpawner();

        // Add ESC key handler for pausing
        this.input.keyboard!.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseScene');
        });

        // Create character sheet at center of screen
        this.characterSheet = new CharacterSheet(
            this,
            this.cameras.main.centerX - 200,  // Center horizontally
            this.cameras.main.centerY - 150   // Center vertically
        );

        // Add key binding to toggle character sheet
        this.input.keyboard!.on('keydown-C', () => {
            if (this.characterSheet.visible) {
                this.characterSheet.hide();
            } else {
                this.characterSheet.show();
            }
        });
    }

    private createArenaWalls(): void {
        this.walls = this.physics.add.staticGroup();

        // Create border walls - adjusted positions and scales for smaller arena
        // Top wall
        this.walls.create(200, 25, 'wall')
            .setScale(20, 1) // Reduced from 40 to 20
            .refreshBody();
        
        // Bottom wall
        this.walls.create(200, 275, 'wall')
            .setScale(20, 1)
            .refreshBody();
        
        // Left wall
        this.walls.create(25, 150, 'wall')
            .setScale(1, 15) // Reduced from 30 to 15
            .refreshBody();
        
        // Right wall
        this.walls.create(375, 150, 'wall')
            .setScale(1, 15)
            .refreshBody();
    }

    private handlePlayerEnemyCollision(player: any, enemy: any): void {
        const damage = 10;
        new FloatingDamage(
            this,
            player.x,
            player.y - 20,
            damage,
            false
        );
        player.damage(damage);
    }

    private handleProjectileEnemyCollision(projectile: any, enemy: any): void {
        const projectileObj = projectile as Projectile;
        const enemyObj = enemy as Enemy;
        const damage = projectileObj.getDamage();
        
        // Create floating damage number
        new FloatingDamage(
            this,
            enemy.x,
            enemy.y - 20, // Spawn slightly above the enemy
            damage,
            false
        );
        
        // Destroy projectile first
        projectileObj.destroy();
        
        // Then handle enemy damage and scoring
        if (enemyObj.damage(damage)) {
            this.player.addScore(100);
        }
    }

    update() {
        this.player.update();
        
        // Update both enemy types
        this.enemies.children.iterate((enemy: any) => {
            if (enemy && enemy.active) {
                enemy.update(this.player);
            }
            return true;
        });

        this.rangedEnemies.children.iterate((enemy: any) => {
            if (enemy && enemy.active) {
                enemy.update(this.player);
            }
            return true;
        });

        // Only update stats when visible
        if (this.characterSheet.visible) {
            this.characterSheet.updateStats({
                health: this.player.getHealth(),
                maxHealth: this.player.getMaxHealth(),
                attack: this.player.getAttack(),
                defense: this.player.getDefense(),
                speed: this.player.getSpeed(),
                score: this.player.getScore()
            });
        }
    }

    private setupPhysicsColliders(): void {
        // Player and walls
        this.physics.add.collider(this.player, this.walls);
        
        // Enemy and walls
        this.physics.add.collider(this.enemies, this.walls);
        
        // Player projectiles and walls
        this.physics.add.collider(
            this.player.getProjectiles(), 
            this.walls, 
            (projectile) => {
                (projectile as Projectile).destroy();
            }
        );
        
        // Player projectiles and enemies
        this.physics.add.collider(
            this.player.getProjectiles(), 
            this.enemies, 
            this.handleProjectileEnemyCollision, 
            undefined, 
            this
        );
        
        // Player projectiles and ranged enemies
        this.physics.add.collider(
            this.player.getProjectiles(),
            this.rangedEnemies,
            this.handleProjectileEnemyCollision,
            undefined,
            this
        );

        // Ranged enemy projectiles setup
        this.rangedEnemies.children.iterate((enemy: any) => {
            if (enemy) {
                // With player
                this.physics.add.collider(
                    this.player,
                    (enemy as RangedEnemy).getProjectiles(),
                    (player, projectile) => {
                        const damage = 10;
                        const playerObj = player as Player;
                        new FloatingDamage(
                            this,
                            playerObj.x,
                            playerObj.y - 20,
                            damage,
                            false
                        );
                        playerObj.damage(damage);
                        (projectile as Projectile).destroy();
                    }
                );
                
                // With walls
                this.physics.add.collider(
                    (enemy as RangedEnemy).getProjectiles(),
                    this.walls,
                    (projectile) => {
                        (projectile as Projectile).destroy();
                    }
                );
            }
            return true;
        });
    }

    private setupPhysicsOverlaps(): void {
        // Player and enemies
        this.physics.add.overlap(
            this.player, 
            this.enemies, 
            this.handlePlayerEnemyCollision, 
            undefined, 
            this
        );

        // Player and health pickups
        this.physics.add.overlap(
            this.player,
            this.healthPickups,
            (player, pickup) => {
                (pickup as HealthPickup).collect(player as Player);
            }
        );

        // Player and coin pickups
        this.physics.add.overlap(
            this.player,
            this.coinPickups,
            (player, pickup) => {
                (pickup as CoinPickup).collect(player as Player);
            }
        );
    }

    // ENEMY SPAWNING AND FUNCTIONALITY

    private spawnEnemy(): void {
        if (this.enemies.getLength() + this.rangedEnemies.getLength() >= this.MAX_ENEMIES) {
            return;
        }

        const spawnPoint = this.getRandomSpawnPoint();
        
        if (Phaser.Math.Between(1, 100) <= 30) {
            const enemy = new RangedEnemy(this, spawnPoint.x, spawnPoint.y);
            this.rangedEnemies.add(enemy);

            // Add collisions for the new ranged enemy's projectiles
            this.physics.add.collider(
                this.player,
                enemy.getProjectiles(),
                (player, projectile) => {
                    (player as Player).damage(10);
                    (projectile as Projectile).destroy();
                }
            );

            this.physics.add.collider(
                enemy.getProjectiles(),
                this.walls,
                (projectile) => {
                    (projectile as Projectile).destroy();
                }
            );
        } else {
            const enemy = new Enemy(this, spawnPoint.x, spawnPoint.y);
            this.enemies.add(enemy);
        }
    }


    private startEnemySpawner(): void {
        // Spawn enemies periodically
        this.time.addEvent({
            delay: 2000, // Spawn every 2 seconds
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    private getRandomSpawnPoint(): { x: number, y: number } {
        const side = Phaser.Math.Between(0, 3);
        let x, y;

        switch(side) {
            case 0: // Top
                x = Phaser.Math.Between(50, 350);
                y = 50;
                break;
            case 1: // Right
                x = 350;
                y = Phaser.Math.Between(50, 250);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(50, 350);
                y = 250;
                break;
            case 3: // Left
                x = 50;
                y = Phaser.Math.Between(50, 250);
                break;
            default:
                x = 50;
                y = 50;
        }

        return { x, y };
    }
} 