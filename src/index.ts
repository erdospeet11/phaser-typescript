import { Game, AUTO, Scale } from 'phaser';
import { ArenaScene } from './scenes/ArenaScene';
import { PauseScene } from './scenes/PauseScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { SettingsScene } from './scenes/SettingsScene';
import { DungeonScene } from './scenes/DungeonScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { CharacterSheetScene } from './ui/CharacterSheetScene';
import { EndGameScene } from './scenes/EndGameScene';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 25 * 16,
    height: 18 * 16,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
            fixedStep: false,
            fps: 300,
            debugShowBody: false,
        }
    },
    scene: [MainMenuScene, CharacterSheetScene, LevelSelectScene, SettingsScene, ArenaScene, PauseScene, DungeonScene, EndGameScene],
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
    }
};

const game = new Phaser.Game(config);