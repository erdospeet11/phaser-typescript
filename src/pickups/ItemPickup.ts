import { Pickup } from './Pickup';
import { Player } from '../Player';
import { Item } from '../items/Item';
import { Tooltip } from '../ui/Tooltip';

export class ItemPickup extends Pickup {
    private item: Item;
    private tooltip: Tooltip;

    constructor(scene: Phaser.Scene, x: number, y: number, item: Item) {
        super(scene, x, y, item.spriteKey);
        this.item = item;
        
        // Create tooltip
        this.tooltip = new Tooltip(scene);

        // Hover events
        this.setInteractive({ useHandCursor: true });
        this.on('pointerover', () => {
            const text = `${this.item.name}\n${this.item.description}`;
            this.tooltip.show(this.x, this.y - 40, text);
        });
        this.on('pointerout', () => {
            this.tooltip.hide();
        });

        // Floating animation
        scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collect(player: Player): void {
        if (player.addItem(this.item)) {
            // Cleanup
            this.tooltip.hide();
            this.destroy();
        }
    }

    destroy(): void {
        this.tooltip.destroy();
        super.destroy();
    }
} 