import { Game, AUTO, Scale } from 'phaser';
import { ArenaScene } from './scenes/ArenaScene';
import { PauseScene } from './scenes/PauseScene';
import { MainMenuScene } from './scenes/MainMenuScene';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 400,
    height: 300,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
            fixedStep: false,
            fps: 300,
            debugShowBody: true,
        }
    },
    scene: [MainMenuScene, ArenaScene, PauseScene],
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    pixelArt: true,
    antialias: false,
    zoom: 2
};

const game = new Phaser.Game(config);