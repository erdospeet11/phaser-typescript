import { Pickup } from './Pickup';
import { Player } from '../Player';
import { ArenaScene } from '../scenes/ArenaScene';
import { Tooltip } from '../ui/Tooltip';
import { Enemy } from '../enemies/Enemy';

export class BombPickup extends Pickup {
    private tooltip: Tooltip;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bomb-pickup');
        
        // Physics body
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(16, 16);
        body.setImmovable(true);

        // Tooltip
        this.tooltip = new Tooltip(scene);

        // Hover events
        this.setInteractive({ useHandCursor: true });
        this.on('pointerover', () => {
            this.tooltip.show(this.x, this.y, 'Destroys all enemies!');
        });
        this.on('pointerout', () => {
            this.tooltip.hide();
        });
    }

    collect(player: Player): void {
        const arenaScene = this.scene as ArenaScene;
        
        console.log('Total enemies before bomb:', arenaScene.getEnemies().getLength());
        
        // Destroy all enemies
        arenaScene.getEnemies().getChildren().forEach((enemy) => {
            console.log('Enemy type:', enemy.constructor.name);
            // Try to damage regardless of instance check
            try {
                (enemy as Enemy).damage(1000);
            } catch (error) {
                console.error('Failed to damage enemy:', error);
            }
        });

        console.log('Total enemies after bomb:', arenaScene.getEnemies().getLength());

        this.scene.cameras.main.flash(500, 255, 0, 0);
        this.tooltip.hide();
        this.destroy();
    }

    destroy(): void {
        this.tooltip.destroy();
        super.destroy();
    }
} 