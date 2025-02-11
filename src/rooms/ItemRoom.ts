import { Room } from './Room';
import { ArenaScene } from '../scenes/ArenaScene';
import { NPC } from '../characters/NPC';

export class ItemRoom extends Room {
    private readonly NUM_TENTS = 10;

    setup(): void {
        const npc = new NPC(
            this.scene,
            this.scene.cameras.main.centerX - 50,
            this.scene.cameras.main.centerY
        );
        npc.setupInteraction(this.scene.getPlayer());

        //scatter tents
        for (let i = 0; i < this.NUM_TENTS; i++) {
            const margin = 50;
            const x = Phaser.Math.Between(margin, this.scene.cameras.main.width - margin);
            const y = Phaser.Math.Between(margin, this.scene.cameras.main.height - margin);
            
            const tent = this.scene.add.image(x, y, 'tent')
                .setDepth(y)
                .setAlpha(0.8);
        }
    }
}   