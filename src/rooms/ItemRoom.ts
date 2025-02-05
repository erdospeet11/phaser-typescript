import { Room } from './Room';
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
    }
}   