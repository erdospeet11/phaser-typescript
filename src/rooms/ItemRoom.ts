import { Room } from './Room';
import { ItemPickup } from '../pickups/ItemPickup';
import { ArenaScene } from '../scenes/ArenaScene';
import { NPC } from '../characters/NPC';

export class ItemRoom extends Room {
    setup(): void {
        // Create NPC
        const npc = new NPC(
            this.scene,
            this.scene.cameras.main.centerX - 50,  // Slightly to the left of center
            this.scene.cameras.main.centerY
        );
        npc.setupInteraction(this.scene.getPlayer());

        //Ancient Sword item
        const swordItem = this.scene.AVAILABLE_ITEMS.find(item => item.spriteKey === 'sword-item');
        
        if (!swordItem) {
            console.error('Sword item not found in AVAILABLE_ITEMS');
            return;
        }
        
        // Item pickup in the center
        const itemPickup = new ItemPickup(
            this.scene,
            this.scene.cameras.main.centerX + 50,  // Slightly to the right of center
            this.scene.cameras.main.centerY,
            swordItem
        );
        
        // Add to pickups group
        this.scene.addPickup(itemPickup);
    }
} 