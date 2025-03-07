import { Enemy } from './Enemy';
import { Player } from '../Player';
import { ArenaScene } from '../scenes/ArenaScene';

export class LineEnemy extends Enemy {
    private line: Phaser.GameObjects.Graphics;
    private readonly SLOW_FACTOR = 0.5;
    private isSlowingPlayer: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        
        this.setTexture('sniper-enemy');
        
        this.health = 50;
        this.maxHealth = 100;
        this.attack = 10;
        this.speed = 0;
        
        //stationary
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setVelocity(0, 0);

        this.line = scene.add.graphics();
    }

    update(player: Phaser.GameObjects.Sprite): void {
        super.updateHealthBar();

        const playerObj = (this.scene as ArenaScene).getPlayer();

        //update line position
        this.line.clear();
        this.line.lineStyle(2, 0xff0000);
        this.line.beginPath();
        this.line.moveTo(this.x, this.y);
        this.line.lineTo(playerObj.x, playerObj.y);
        this.line.strokePath();

        //check intersection
        const distance = Phaser.Math.Distance.Between(this.x, this.y, playerObj.x, playerObj.y);
        const angle = Phaser.Math.Angle.Between(this.x, this.y, playerObj.x, playerObj.y);
        const intersects = this.checkLineIntersectsPlayer(playerObj, distance, angle);

        //slow effect
        if (intersects && !this.isSlowingPlayer) {
            const originalSpeed = playerObj.getSpeed();
            playerObj.setSpeed(originalSpeed * this.SLOW_FACTOR);
            this.isSlowingPlayer = true;
        } else if (!intersects && this.isSlowingPlayer) {
            const originalSpeed = playerObj.getSpeed() / this.SLOW_FACTOR;
            playerObj.setSpeed(originalSpeed);
            this.isSlowingPlayer = false;
        }
    }

    private checkLineIntersectsPlayer(player: Player, distance: number, angle: number): boolean {
        const COLLISION_THRESHOLD = 20;
        const playerAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        return Math.abs(angle - playerAngle) < 0.1;
    }

    destroy(): void {
        //reset player speed if being slowed when destroyed
        if (this.isSlowingPlayer && this.scene) {
            try {
                const player = (this.scene as ArenaScene).getPlayer();
                const originalSpeed = player.getSpeed() / this.SLOW_FACTOR;
                player.setSpeed(originalSpeed);
            } catch (e) {
                // Scene might be shutting down, ignore errors
            }
        }

        if (this.line) {
            this.line.destroy();
        }
        
        super.destroy();
    }
}