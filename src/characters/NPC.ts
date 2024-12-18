import { Player } from '../Player';

export class NPC extends Phaser.GameObjects.Sprite {
    private detectionZone: Phaser.GameObjects.Zone;
    private readonly DETECTION_RADIUS = 50;
    private shopText: Phaser.GameObjects.Text;
    private handleShop: ((event: KeyboardEvent) => void) | null = null;
    private isInteracting: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'npc');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setSize(16, 16);

        // Create shop text
        this.shopText = scene.add.text(x-60, y-60, 
            'Press E to shop\n1: Health +20 (50g)\n2: Attack +5 (100g)', {
            fontSize: '12px',
            backgroundColor: '#000000',
            padding: { x: 4, y: 4 }
        }).setVisible(false);

        // Create detection zone
        this.detectionZone = scene.add.zone(x, y, this.DETECTION_RADIUS * 2, this.DETECTION_RADIUS * 2);
        scene.physics.world.enable(this.detectionZone);
        
        const zoneBody = this.detectionZone.body as Phaser.Physics.Arcade.Body;
        zoneBody.setCircle(this.DETECTION_RADIUS);
    }

    setupInteraction(player: Player): void {
        // Show shop interface when player enters zone
        this.scene.physics.add.overlap(
            player,
            this.detectionZone,
            () => {
                if (!this.isInteracting) {
                    this.isInteracting = true;
                    this.shopText.setVisible(true);

                    // Handle shop inputs
                    this.handleShop = (event: KeyboardEvent) => {
                        if (!this.scene) return; // Guard against undefined scene
                        
                        if (event.key === '1' && player.getCoins() >= 50) {
                            player.heal(20);
                            player.addCoins(-50);
                        }
                        else if (event.key === '2' && player.getCoins() >= 100) {
                            player.modifyAttack(5);
                            player.addCoins(-100);
                        }
                    };

                    // Add keyboard listener
                    window.addEventListener('keydown', this.handleShop);
                }
            }
        );

        // Hide shop interface when player exits zone
        this.scene.events.on('update', () => {
            if (this.scene && this.isInteracting && !this.scene.physics.overlap(player, this.detectionZone)) {
                this.cleanupInteraction();
            }
        });

        // Cleanup on scene shutdown
        this.scene.events.once('shutdown', () => {
            this.cleanupInteraction();
        });
    }

    private cleanupInteraction(): void {
        this.isInteracting = false;
        if (this.handleShop) {
            window.removeEventListener('keydown', this.handleShop);
            this.handleShop = null;
        }
        if (this.shopText) {
            this.shopText.setVisible(false);
        }
    }

    destroy(): void {
        this.cleanupInteraction();
        if (this.shopText) {
            this.shopText.destroy();
        }
        if (this.detectionZone) {
            this.detectionZone.destroy();
        }
        super.destroy();
    }
} 