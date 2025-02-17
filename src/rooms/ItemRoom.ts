import { Room } from './Room';
import { NPC } from '../characters/NPC';
import { ItemPickup } from '../pickups/ItemPickup';
import { ITEMS } from '../items/ItemResources';
import { Player } from '../Player';
import { ArenaScene } from '../scenes/ArenaScene';

export class ItemRoom extends Room {
    private npc: NPC | null = null;
    private itemPickup: ItemPickup | null = null;

    constructor(scene: ArenaScene) {
        super(scene);
    }

    setup(): void {
        const player = this.scene.getPlayer();
        
        this.npc = new NPC(
            this.scene,
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY + 50
        );
        this.npc.setupInteraction(player);
        
        this.spawnRandomItem(
            this.scene, 
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY - 50
        );

        //item pickup interaction
        if (this.itemPickup) {
            this.itemPickup.setupInteraction(player);
        }
    }

    private spawnRandomItem(scene: Phaser.Scene, x: number, y: number): void {
        const allItems = Object.values(ITEMS);
        const itemPool = allItems.filter(item => 
            item.name.includes('Outfit') || 
            item.name.includes('Helmet') || 
            item.name.includes('Boot')
        );

        const randomIndex = Math.floor(Math.random() * itemPool.length);
        const selectedItem = itemPool[randomIndex];

        this.itemPickup = new ItemPickup(scene, x, y, selectedItem);
        
        if ('addPickup' in scene) {
            (scene as any).addPickup(this.itemPickup);
        }
    }

    destroy(): void {
        if (this.npc) {
            this.npc.destroy();
        }
        if (this.itemPickup) {
            this.itemPickup.destroy();
        }
    }
}