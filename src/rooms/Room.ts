import { ArenaScene } from '../scenes/ArenaScene';

export abstract class Room {
    protected scene: ArenaScene;

    constructor(scene: ArenaScene) {
        this.scene = scene;
    }

    abstract setup(): void;
} 