import { Game, AUTO, Scale } from 'phaser';
import { ArenaScene } from './scenes/ArenaScene';
import { PauseScene } from './scenes/PauseScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { SettingsScene } from './scenes/SettingsScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { CharacterSheetScene } from './ui/CharacterSheetScene';
import { EndGameScene } from './scenes/EndGameScene';
import { HeroSelectScene } from './scenes/HeroSelectScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { LevelUpScene } from './scenes/LevelUpScene';
import { MusicScene } from './scenes/MusicScene';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 25 * 16,
    height: 18 * 16,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [
        MainMenuScene,
        HeroSelectScene,
        LeaderboardScene,
        CharacterSheetScene,
        LevelSelectScene,
        LevelUpScene,
        SettingsScene,
        ArenaScene,
        PauseScene,
        EndGameScene,
        MusicScene
    ],
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    pixelArt: true,
    antialias: false,
    zoom: 2
};

// Initialize the game
new Phaser.Game(config);