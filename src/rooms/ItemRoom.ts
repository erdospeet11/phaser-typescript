import { Room } from './Room';
import { ItemPickup } from '../pickups/ItemPickup';
import { ArenaScene } from '../scenes/ArenaScene';

export class ItemRoom extends Room {
    setup(): void {
        //Ancient Sword item
        const swordItem = this.scene.AVAILABLE_ITEMS.find(item => item.spriteKey === 'sword-item');
        
        if (!swordItem) {
            console.error('Sword item not found in AVAILABLE_ITEMS');
            return;
        }
        
        // Item pickup in the center
        const itemPickup = new ItemPickup(
            this.scene,
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            swordItem
        );
        
        // Add to pickups group
        this.scene.addPickup(itemPickup);
    }
} 