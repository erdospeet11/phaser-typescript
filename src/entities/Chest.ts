import { Player } from '../Player';
import { ArenaScene } from '../scenes/ArenaScene';
import { CoinPickup } from '../pickups/CoinPickup';
import { SpeedPickup } from '../pickups/SpeedPickup';
import { HealthPickup } from '../pickups/HealthPickup';
import { BombPickup } from '../pickups/BombPickup';
import { ScorePickup } from '../pickups/ScorePickup';
import { StrengthPickup } from '../pickups/StrengthPickup';
import { ITEMS } from '../items/ItemResources';
import { ItemPickup } from '../pickups/ItemPickup';

export class Chest extends Phaser.GameObjects.Sprite {
    private detectionZone: Phaser.GameObjects.Zone;
    private readonly DETECTION_RADIUS = 30;
    private isOpen: boolean = false;
    private interactText: Phaser.GameObjects.Text;
    private handleKeyPress: ((event: KeyboardEvent) => void) | null = null;
    private isPlayerInRange: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'chest-closed');
        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.detectionZone = scene.add.zone(x, y, this.DETECTION_RADIUS * 2, this.DETECTION_RADIUS * 2);
        scene.physics.world.enable(this.detectionZone);
        
        const zoneBody = this.detectionZone.body as Phaser.Physics.Arcade.Body;
        zoneBody.setCircle(this.DETECTION_RADIUS);

        //text
        this.interactText = scene.add.text(x, y - 20, 'Press E', {
            fontSize: '12px',
            backgroundColor: '#000000',
            padding: { x: 4, y: 4 }
        })
        .setOrigin(0.5)
        .setVisible(false);
    }

    setupInteraction(player: Player): void {
        this.scene.physics.add.overlap(
            player,
            this.detectionZone,
            () => {
                if (!this.isOpen) {
                    this.isPlayerInRange = true;
                    this.interactText.setVisible(true);
        
                    if (!this.handleKeyPress) {
                        this.handleKeyPress = (event: KeyboardEvent) => {
                            if (event.key.toLowerCase() === 'e' && this.isPlayerInRange) {
                                this.openChest(player);
                            }
                        };
                        window.addEventListener('keydown', this.handleKeyPress);
                    }
                }
            }
        );

        this.scene.events.on('update', () => {
            if (this.scene && !this.scene.physics.overlap(player, this.detectionZone)) {
                this.isPlayerInRange = false;
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

        //get all items
        const allItems = Object.values(ITEMS);
        const itemPool = allItems.filter(item => 
            item.name.includes('Outfit') || 
            item.name.includes('Helmet') || 
            item.name.includes('Boot')
        );

        //random item
        const randomIndex = Math.floor(Math.random() * itemPool.length);
        const selectedItem = itemPool[randomIndex];
        const pickup = new ItemPickup(this.scene, this.x, this.y, selectedItem);

        (this.scene as ArenaScene).addPickup(pickup);

        if (this.handleKeyPress) {
            window.removeEventListener('keydown', this.handleKeyPress);
            this.handleKeyPress = null;
        }

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