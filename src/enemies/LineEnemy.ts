import { Enemy } from './Enemy';
import { Player } from '../Player';
import { ArenaScene } from '../scenes/ArenaScene';

export class LineEnemy extends Enemy {
    private line: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        
        this.setTexture('sniper-enemy');
        
        // Initialize
        this.health = 100;
        this.maxHealth = 100;
        this.attack = 10;
        this.speed = 0;
        
        // It doesn't move
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setVelocity(0, 0);

        // Create line
        this.line = scene.add.graphics();
    }

    update(player: Player): void {
        super.updateHealthBar();

        // Update line position
        this.line.clear();
        this.line.lineStyle(2, 0xff0000);
        this.line.beginPath();
        this.line.moveTo(this.x, this.y);
        this.line.lineTo(player.x, player.y);
        this.line.strokePath();
    }

    destroy(): void {
        this.line.destroy();
        super.destroy();
    }
}