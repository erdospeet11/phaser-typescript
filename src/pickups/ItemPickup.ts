import { Player } from '../Player';
import { Item } from '../items/Item';
import { Pickup } from './Pickup';

export class ItemPickup extends Pickup {
    private item: Item;
    private detectionZone: Phaser.GameObjects.Zone;
    private readonly DETECTION_RADIUS = 30;
    private interactText: Phaser.GameObjects.Text;
    private handleKeyPress: ((event: KeyboardEvent) => void) | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, item: Item) {
        super(scene, x, y, item.icon);
        this.item = item;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //detection zone
        this.detectionZone = scene.add.zone(x, y, this.DETECTION_RADIUS * 2, this.DETECTION_RADIUS * 2);
        scene.physics.world.enable(this.detectionZone);
        
        const zoneBody = this.detectionZone.body as Phaser.Physics.Arcade.Body;
        zoneBody.setCircle(this.DETECTION_RADIUS);

        //interact
        this.interactText = scene.add.text(x, y - 20, 'Press E to equip', {
            fontSize: '12px',
            backgroundColor: '#000000',
            padding: { x: 4, y: 4 }
        })
        .setOrigin(0.5)
        .setVisible(false);
    }

    setupInteraction(player: Player): void {
        if (!this.scene) return;

        const overlap = this.scene.physics.add.overlap(
            player,
            this.detectionZone,
            () => {
                if (!this.scene || !this.active) return;
                this.interactText.setVisible(true);
                
                if (!this.handleKeyPress) {
                    this.handleKeyPress = (event: KeyboardEvent) => {
                        if (!this.scene || !this.active) {
                            this.cleanupInteraction();
                            return;
                        }
                        if (event.key.toLowerCase() === 'e') {
                            this.equipItem(player);
                        }
                    };
                    window.addEventListener('keydown', this.handleKeyPress);
                }
            }
        );

        this.scene.events.on('update', () => {
            if (!this.scene || !this.active) {
                this.cleanupInteraction();
                return;
            }
            if (!this.scene.physics.overlap(player, this.detectionZone)) {
                this.interactText.setVisible(false);
                this.cleanupInteraction();
            }
        });
    }

    private cleanupInteraction(): void {
        if (this.handleKeyPress) {
            window.removeEventListener('keydown', this.handleKeyPress);
            this.handleKeyPress = null;
        }
        if (this.interactText) {
            this.interactText.setVisible(false);
        }
    }

    private equipItem(player: Player): void {
        this.item.use(player);
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

    collect(player: Player): void {
        this.item.use(player);
    }
} 