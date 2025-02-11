import { Player } from '../Player';
import { ArenaScene } from '../scenes/ArenaScene';
import { CoinPickup } from '../pickups/CoinPickup';
import { SpeedPickup } from '../pickups/SpeedPickup';
import { HealthPickup } from '../pickups/HealthPickup';
import { BombPickup } from '../pickups/BombPickup';
import { ScorePickup } from '../pickups/ScorePickup';
import { StrengthPickup } from '../pickups/StrengthPickup';

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

        const random = Phaser.Math.Between(1, 100);

        let pickup;
        if (random <= 20) {
            pickup = new CoinPickup(this.scene, this.x, this.y);
        } else if (random <= 40) {
            pickup = new SpeedPickup(this.scene, this.x, this.y);
        } else if (random <= 60) {
            pickup = new HealthPickup(this.scene, this.x, this.y);
        } else if (random <= 75) {
            pickup = new BombPickup(this.scene, this.x, this.y);
        } else if (random <= 90) {
            pickup = new ScorePickup(this.scene, this.x, this.y);
        } else {
            pickup = new StrengthPickup(this.scene, this.x, this.y);
        }

        (this.scene as ArenaScene).addPickup(pickup);

        // Clean up event listeners
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