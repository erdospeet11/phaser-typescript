import { Scene, AUTO } from 'phaser';

export default class Map {
    private scene: Scene;
    private layers: Phaser.Tilemaps.TilemapLayer[];

    constructor(scene: Scene) {
        this.scene = scene;
        this.layers = [];
    }

    preload(): void {
        this.scene.load.image('tiles', 'assets/tileset.png');
        this.scene.load.tilemapTiledJSON('map', 'assets/map.json');
    }

    create(): void {
        // Assuming your map has layers named 'Ground', 'Objects', etc.
        // Adjust these based on your actual map structure
    }
}
