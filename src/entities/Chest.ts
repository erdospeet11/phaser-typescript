import { Player } from '../Player';
import { Item } from '../items/Item';
import { ItemPickup } from '../pickups/ItemPickup';
import { ArenaScene } from '../scenes/ArenaScene';

export class Chest extends Phaser.GameObjects.Sprite {
    private detectionZone: Phaser.GameObjects.Zone;
    private readonly DETECTION_RADIUS = 30;
    private isOpen: boolean = false;
    private interactText: Phaser.GameObjects.Text;
    private handleKeyPress: ((event: KeyboardEvent) => void) | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'chest-closed');
        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        // Create detection zone
        this.detectionZone = scene.add.zone(x, y, this.DETECTION_RADIUS * 2, this.DETECTION_RADIUS * 2);
        scene.physics.world.enable(this.detectionZone);
        
        const zoneBody = this.detectionZone.body as Phaser.Physics.Arcade.Body;
        zoneBody.setCircle(this.DETECTION_RADIUS);

        // Create "Press E" text
        this.interactText = scene.add.text(x, y - 20, 'Press E', {
            fontSize: '12px',
            backgroundColor: '#000000',
            padding: { x: 4, y: 4 }
        })
        .setOrigin(0.5)
        .setVisible(false);
    }

    setupInteraction(player: Player): void {
        // Show "Press E" when player is near
        this.scene.physics.add.overlap(
            player,
            this.detectionZone,
            () => {
                if (!this.isOpen) {
                    this.interactText.setVisible(true);
                    
                    // Check for E key press
                    this.handleKeyPress = (event: KeyboardEvent) => {
                        if (event.key.toLowerCase() === 'e') {
                            this.openChest(player);
                        }
                    };
                    
                    window.addEventListener('keydown', this.handleKeyPress);
                }
            }
        );

        // Hide text when player leaves
        this.scene.events.on('update', () => {
            if (this.scene && !this.scene.physics.overlap(player, this.detectionZone)) {
                this.interactText.setVisible(false);
                if (this.handleKeyPress) {
                    window.removeEventListener('keydown', this.handleKeyPress);
                    this.handleKeyPress = null;
                }
            }
        });
    }

    private openChest(player: Player): void {
        if (this.isOpen) return;
        this.isOpen = true;

        // Get sword item from ArenaScene
        const swordItem = (this.scene as ArenaScene).AVAILABLE_ITEMS.find(item => item.spriteKey === 'sword-item');
        
        if (!swordItem) {
            console.error('Sword item not found in AVAILABLE_ITEMS');
            return;
        }

        // Create item pickup
        const itemPickup = new ItemPickup(
            this.scene,
            this.x,
            this.y,
            swordItem
        );
        
        (this.scene as ArenaScene).addPickup(itemPickup);

        // Clean up event listeners before destroying
        if (this.handleKeyPress) {
            window.removeEventListener('keydown', this.handleKeyPress);
            this.handleKeyPress = null;
        }

        // Destroy after creating pickup
        this.destroy();
    }

    destroy(): void {
        if (this.handleKeyPress) {
            window.removeEventListener('keydown', this.handleKeyPress);
        }
        if (this.interactText) {
            this.interactText.destroy();
        }
        if (this.detectionZone) {
            this.detectionZone.destroy();
        }
        super.destroy();
    }
} 