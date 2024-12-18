import { Player } from "../Player";
import { Enemy } from "../enemies/Enemy";
import { Projectile } from "../Projectile";
import { HealthPickup } from "../pickups/HealthPickup";
import { RangedEnemy } from '../enemies/RangedEnemy';
import { FloatingDamage } from '../effects/FloatingDamage';
import { CharacterSheetScene } from '../ui/CharacterSheetScene';
import { CoinPickup } from '../pickups/CoinPickup';
import { Pickup } from '../pickups/Pickup';
import { RoomManager } from '../managers/RoomManager';
import { ObstacleEnemy } from '../enemies/ObstacleEnemy';
import { TentacleBoss } from '../enemies/TentacleBoss';
import { ItemPickup } from '../pickups/ItemPickup';
import { Item } from '../items/Item';
import { ItemRoom } from '../rooms/ItemRoom';
import { BossRoom } from '../rooms/BossRoom';
import { LineEnemy } from '../enemies/LineEnemy';

export class ArenaScene extends Phaser.Scene {
    private player!: Player;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private enemies!: Phaser.GameObjects.Group;
    private rangedEnemies!: Phaser.GameObjects.Group;
    private pickups!: Phaser.GameObjects.Group;
    private max_enemies: number = 2;
    private characterSheet!: CharacterSheetScene;
    private portals: {[key: string]: Phaser.GameObjects.Sprite} = {};
    protected roomPosition: { x: number, y: number };
    private roomType: 'start' | 'normal' | 'boss' | 'item';
    private roomManager: RoomManager;
    private obstacleEnemy!: ObstacleEnemy;
    private boss?: TentacleBoss;
    private entryDirection: string = 'default';
    private portalsSpawned: boolean = false;
    private readonly TILE_SIZE = 16;
    private readonly ROOM_WIDTH_TILES = 25;
    private readonly ROOM_HEIGHT_TILES = 18;
    private readonly ROOM_WIDTH = this.ROOM_WIDTH_TILES * this.TILE_SIZE;
    private readonly ROOM_HEIGHT = this.ROOM_HEIGHT_TILES * this.TILE_SIZE;
    public readonly AVAILABLE_ITEMS = [
        new Item(
            'Ancient Sword',
            'A powerful sword that increases attack',
            'sword-item',
            { attack: 15 },
            'rare'
        ),
        new Item(
            'Magic Shield',
            'A mystical shield that boosts defense',
            'shield-item',
            { defense: 10 },
            'rare'
        ),
        new Item(
            'Swift Boots',
            'Enchanted boots that increase speed',
            'boots-item',
            { speed: 0.3 },
            'rare'
        ),
        new Item(
            'Heart Crystal',
            'Increases maximum health',
            'crystal-item',
            { maxHealth: 25 },
            'epic'
        )
    ];

    constructor() {
        super({ key: 'ArenaScene' });
        this.roomPosition = { x: 0, y: 1 }; // Start position
        this.roomType = 'start';
        this.roomManager = RoomManager.getInstance();
    }

    init(data: { roomPosition?: { x: number, y: number }, roomType?: 'start' | 'normal' | 'boss' | 'item', entryDirection?: string }) {
        if (data.roomType === 'start') {
            this.roomManager.resetVisitedRooms();
        }
        if (data.roomPosition) {
            this.roomPosition = data.roomPosition;
        }
        if (data.roomType) {
            this.roomType = data.roomType;
        }
        if (data.entryDirection) {
            this.entryDirection = data.entryDirection;
        }
    }

    preload() {
        this.load.image('floor', 'assets/tile.png');
        this.load.image('projectile', 'assets/fireball.png');
        this.load.image('health-pickup', 'assets/health_pickup.png');
        this.load.image('custom-cursor', 'assets/cursor.png');
        this.load.image('fireball', 'assets/fireball.png');
        this.load.image('coin-pickup', 'assets/coin_pickup.png');
        this.load.image('portal', 'assets/portal.png');
        this.load.image('speed-pickup', 'assets/speed_pickup.png');
        this.load.image('voidball', 'assets/void-ball.png');
        this.load.image('character-sheet-bg', 'assets/sheet_background.png');
        this.load.image('sniper-enemy', 'assets/sniper-enemy.png');


        //Players
        this.load.image('player', 'assets/player5.png');this.load.image('wall', 'assets/wall.png');
        //Enemies
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('ranged-enemy', 'assets/ranged-enemy.png');
        this.load.image('obstacle-enemy', 'assets/obstacle-enemy.png');
        this.load.image('tentacle-boss', 'assets/professor-tentacle.png');
        this.load.image('tentacle', 'assets/tentacle-minion.png');
        //Weapons
        this.load.image('fire-spellbook', 'assets/fire-spellbook.png');
        this.load.image('ice-spellbook', 'assets/ice-spellbook.png');
        this.load.image('wind-spellbook', 'assets/wind-spellbook.png');
        //Items

        //Animations
        this.load.spritesheet(
            'stone-spike', 
            'assets/stone-spike-spritesheet.png', 
            { 
                frameWidth: 16, 
                frameHeight: 16 
            }
        );
        this.load.spritesheet(
            'explosion',
            'assets/explosion-spritesheet.png',
            {
                frameWidth: 16,
                frameHeight: 16
            }
        );

        //Load items
        this.load.image('sword-item', 'assets/items/sword-item.png');
        this.load.image('shield-item', 'assets/items/shield-item.png');
        this.load.image('boots-item', 'assets/items/boots-item.png');
        this.load.image('crystal-item', 'assets/items/crystal-item.png');
    }

    create() {
        //this.physics.world.createDebugGraphic();

        this.input.setDefaultCursor('url(assets/cursor.png), auto');

        this.add.tileSprite(200, 150, 400, 300, 'floor');

        this.createArenaWalls();

        // Get spawn position from RoomManager
        const spawnPosition = this.roomManager.getSpawnPosition(this.entryDirection);
        this.player = new Player(this, spawnPosition.x, spawnPosition.y, 'MAGE');
        
        // Update UI with current values
        this.player.updateUIText();

        this.setupGroups();

        // Collision
        this.physics.world.fixedStep = false;

        // Physics
        this.setupPhysicsColliders();
        this.setupPhysicsOverlaps();

        // Modify room based on type
        if (this.roomType === 'boss') {
            this.max_enemies = 0;
            new BossRoom(this).setup();
        } else if (this.roomType === 'item') {
            this.max_enemies = 0;
            new ItemRoom(this).setup();
        } else {
            this.max_enemies = 5;
            this.startEnemySpawner();
        }

        // Pause
        this.input.keyboard!.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseScene');
        });

        // Character Sheet
        this.input.keyboard!.on('keydown-C', () => {
            this.scene.pause();
            this.scene.launch('CharacterSheetScene', { player: this.player });
            this.scene.bringToTop('CharacterSheetScene');
        });

        // Create portals
        this.time.delayedCall(10000, () => {
            this.createPortals();
            this.portalsSpawned = true;
            
            // Flash screen
            this.cameras.main.flash(500, 0, 0, 255);
        });
    }

    private createArenaWalls(): void {
        this.walls = this.physics.add.staticGroup();

        // Horizontal walls
        for (let x = 0; x < this.ROOM_WIDTH_TILES; x++) {
            this.walls.create(
                x * this.TILE_SIZE + this.TILE_SIZE/2,
                this.TILE_SIZE/2,
                'wall'
            );
            this.walls.create(
                x * this.TILE_SIZE + this.TILE_SIZE/2,
                this.ROOM_HEIGHT - this.TILE_SIZE/2,
                'wall'
            );
        }

        // Vertical walls
        for (let y = 1; y < this.ROOM_HEIGHT_TILES - 1; y++) {
            this.walls.create(
                this.TILE_SIZE/2,
                y * this.TILE_SIZE + this.TILE_SIZE/2,
                'wall'
            );
            this.walls.create(
                this.ROOM_WIDTH - this.TILE_SIZE/2,
                y * this.TILE_SIZE + this.TILE_SIZE/2,
                'wall'
            );
        }
    }

    private handlePlayerEnemyCollision(player: any, enemy: any): void {
        // I need to cast here because the type is any, ArcadePhysicsCallback returns any
        const playerObj = player as Player;
        
        // Check if player is invulnerable
        if (playerObj.isInvulnerable) return;

        const damage = 10;
        new FloatingDamage(
            this,
            player.x,
            player.y - 20,
            damage,
            false
        );
        playerObj.damage(damage);
    }

    public handleProjectileEnemyCollision(projectile: any, enemy: any): void {
        const projectileObj = projectile as Projectile;
        const enemyObj = enemy as Enemy;
        const damage = projectileObj.getDamage();
        
        // Floating Damage
        new FloatingDamage(
            this,
            enemy.x,
            enemy.y - 20,
            damage,
            false
        );
        
        projectileObj.destroy();
        
        if (enemyObj.damage(damage)) {
            this.player.addScore(100);
        }
    }

    update() {
        // Update player
        this.player.update();
        
        // Update regular enemies
        this.enemies.getChildren().forEach((enemy: any) => {
            if (enemy?.active) {
                enemy.update(this.player);
            }
        });
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

    // Groups: groups are used to manage game objects efficiently

    private setupGroups(): void {
        // Create enemies group
        this.enemies = this.add.group({
            classType: Enemy,
            runChildUpdate: true,
            maxSize: 20
        });
    
        // Create ranged enemies group
        this.rangedEnemies = this.add.group({
            classType: RangedEnemy,
            runChildUpdate: true,
            maxSize: 20
        });
    
        // Replace separate pickup groups with a single group
        this.pickups = this.add.group({
            runChildUpdate: true
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

        // Pickups and pla
        this.physics.add.overlap(
            this.player,
            this.pickups,
            (player, pickup) => {
                (pickup as Pickup).collect(player as Player);
            }
        );

        // Player and obstacle enemy
        this.physics.add.overlap(
            this.player,
            this.obstacleEnemy,
            this.handlePlayerEnemyCollision,
            undefined,
            this
        );
    }

    // ENEMY SPAWNING AND FUNCTIONALITY

    private spawnEnemy(): void {
        if (this.enemies.getLength() >= this.max_enemies) {
            return;
        }

        const randomNum = Phaser.Math.Between(1, 100);
        let enemy;

        if (randomNum <= 80) {
            const spawnPoint = this.getRandomSpawnPoint();
            enemy = new LineEnemy(this, spawnPoint.x, spawnPoint.y);
        } else if (randomNum <= 40) {
            const spawnPoint = this.getRandomSpawnPoint();
            enemy = new RangedEnemy(this, spawnPoint.x, spawnPoint.y);
        } else if (randomNum <= 70) {
            enemy = ObstacleEnemy.spawnNearPlayer(this, this.player);
        } else {
            const spawnPoint = this.getRandomSpawnPoint();
            enemy = new Enemy(this, spawnPoint.x, spawnPoint.y);
        }

        this.enemies.add(enemy);

        // Add projectile collisions if it's a RangedEnemy
        if (enemy instanceof RangedEnemy) {
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
        }
    }

    private startEnemySpawner(): void {
        if (this.roomType !== 'boss') {
            this.time.addEvent({
                delay: 2000,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
        }
    }

    private getRandomSpawnPoint(): { x: number, y: number } {
        const side = Phaser.Math.Between(0, 3);
        let x, y;

        switch(side) {
            case 0:
                x = Phaser.Math.Between(50, 350);
                y = 50;
                break;
            case 1:
                x = 350;
                y = Phaser.Math.Between(50, 250);
                break;
            case 2:
                x = Phaser.Math.Between(50, 350);
                y = 250;
                break;
            case 3:
                x = 50;
                y = Phaser.Math.Between(50, 250);
                break;
            default:
                x = 50;
                y = 50;
        }

        return { x, y };
    }

    private createPortals(): void {
        const availablePortals = this.roomManager.getAvailablePortals(this.roomPosition);
        
        availablePortals.forEach(portal => {
            this.portals[portal.direction] = this.createPortal(portal.x, portal.y, portal.direction);
        });
    }

    private createPortal(x: number, y: number, direction: string): Phaser.GameObjects.Sprite {
        const portal = this.add.sprite(x, y, 'portal');
        this.physics.add.existing(portal, true);
        
        this.physics.add.overlap(
            this.player,
            portal,
            () => this.handlePortalCollision(direction),
            undefined,
            this
        );

        return portal;
    }

    private handlePortalCollision(direction: string): void {
        if (!this.portalsSpawned) return;

        const newPosition = this.roomManager.getNextRoomPosition(this.roomPosition, direction);
        const newRoomType = this.roomManager.getRoomType(newPosition);
        const oppositeDirection = this.roomManager.getOppositeDirection(direction);

        this.cameras.main.fade(500, 0, 0, 0);
        
        this.time.delayedCall(500, () => {
            this.scene.start('ArenaScene', { 
                roomPosition: newPosition,
                roomType: newRoomType,
                entryDirection: oppositeDirection
            });
        });
    }

    public addPickup(pickup: Pickup): void {
        this.pickups.add(pickup);
    }

    public addEnemy(enemy: Enemy): void {
        this.enemies.add(enemy);
    }

    public setupEnemyProjectileColliders(enemy: RangedEnemy): void {
        // Setup player collision
        this.physics.add.collider(
            this.player,
            enemy.getProjectiles(),
            (player, projectile) => {
                const damage = 10;
                (player as Player).damage(damage);
                (projectile as Projectile).destroy();
            }
        );

        // Setup wall collision
        this.physics.add.collider(
            enemy.getProjectiles(),
            this.walls,
            (projectile) => {
                (projectile as Projectile).destroy();
            }
        );
    }

    public getPlayer(): Player {
        return this.player;
    }

    public getWalls(): Phaser.Physics.Arcade.StaticGroup {
        return this.walls;
    }
} 