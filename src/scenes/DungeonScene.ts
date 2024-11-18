export class DungeonScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DungeonScene' });
    }

    create() {
        // Add your dungeon scene setup here
        const text = this.add.text(200, 150, 'Dungeon Scene', {
            fontSize: '32px',
            color: '#fff'
        }).setOrigin(0.5);
    }
} 