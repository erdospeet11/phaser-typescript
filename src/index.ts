import { Game, AUTO, Scale } from 'phaser';
import { ArenaScene } from './scenes/ArenaScene';
import { PauseScene } from './scenes/PauseScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { SettingsScene } from './scenes/SettingsScene';
import { DungeonScene } from './scenes/DungeonScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';

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
    scene: [MainMenuScene, LevelSelectScene, SettingsScene, ArenaScene, PauseScene, DungeonScene],
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    pixelArt: true,
    antialias: false,
    zoom: 2,
    render: {
        antialias: false,
        pixelArt: true,
        roundPixels: true
    },
    callbacks: {
        postBoot: (game) => {
            const canvas = game.canvas;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.imageSmoothingEnabled = false;
            }
        }
    }
};

const game = new Phaser.Game(config);