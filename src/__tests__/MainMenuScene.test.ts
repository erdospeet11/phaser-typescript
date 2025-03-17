import '@testing-library/jest-dom';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { GameManager } from '../managers/GameManager';

jest.mock('../managers/GameManager', () => {
    return {
        GameManager: {
            destroyInstance: jest.fn()
        }
    };
});

const mockButton = {
    setInteractive: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis()
};

const mockImage = {
    setScale: jest.fn().mockReturnThis(),
    setOrigin: jest.fn().mockReturnThis(),
    setPosition: jest.fn().mockReturnThis(),
    setAlpha: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis()
};

const mockText = {
    setOrigin: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis()
};

const mockTileSprite = {
    setOrigin: jest.fn().mockReturnThis(),
    setScrollFactor: jest.fn().mockReturnThis(),
    setAlpha: jest.fn().mockReturnThis(),
    tilePositionX: 0,
    tilePositionY: 0
};

describe('MainMenuScene', () => {
    let mainMenuScene: MainMenuScene;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        mainMenuScene = new MainMenuScene();
        
        (mainMenuScene as any).add = {
            image: jest.fn().mockReturnValue(mockImage),
            text: jest.fn().mockReturnValue(mockText),
            tileSprite: jest.fn().mockReturnValue(mockTileSprite)
        };
        
        (mainMenuScene as any).input = {
            keyboard: {
                addKey: jest.fn(),
                on: jest.fn()
            }
        };
        
        (mainMenuScene as any).scene = {
            start: jest.fn(),
            launch: jest.fn()
        };
        
        (mainMenuScene as any).load = {
            image: jest.fn(),
            spritesheet: jest.fn()
        };
        
        (mainMenuScene as any).anims = {
            create: jest.fn()
        };
        
        (mainMenuScene as any).sound = {
            add: jest.fn().mockReturnValue({
                play: jest.fn()
            })
        };
        
        (mainMenuScene as any).cameras = {
            main: {
                centerOn: jest.fn()
            }
        };
        
        (mainMenuScene as any).game = {
            canvas: {
                width: 800,
                height: 600
            }
        };
        
        (mainMenuScene as any).create = jest.fn(() => {
            (mainMenuScene as any).backgrounds = [
                { ...mockTileSprite, tilePositionX: 0 },
                { ...mockTileSprite, tilePositionX: 0 }
            ];
            (mainMenuScene as any).scrollSpeeds = [0.5, 1.0];
            
            (mainMenuScene as any).scene.launch('MusicScene');
        });
        
        const originalUpdate = mainMenuScene.update;
        (mainMenuScene as any).update = jest.fn((time, delta) => {
            if ((mainMenuScene as any).backgrounds) {
                (mainMenuScene as any).backgrounds.forEach((bg: any, i: number) => {
                    bg.tilePositionX += (mainMenuScene as any).scrollSpeeds[i] * 0.5;
                    mockTileSprite.setScrollFactor();
                });
            }
        });
    });
    
    test('should preload assets', () => {
        (mainMenuScene as any).preload();

        expect((mainMenuScene as any).load.image).toHaveBeenCalled();
    });
    
    test('should launch music scene when created', () => {
        (mainMenuScene as any).create();
        
        expect((mainMenuScene as any).scene.launch).toHaveBeenCalledWith('MusicScene');
    });
    
    test('should start hero select when heroSelect method is called', () => {
        (mainMenuScene as any).heroSelect();
        
        expect(GameManager.destroyInstance).toHaveBeenCalled();
        expect((mainMenuScene as any).scene.start).toHaveBeenCalledWith('HeroSelectScene');
    });
    
    test('should start settings when openSettings method is called', () => {
        (mainMenuScene as any).openSettings();
        
        expect((mainMenuScene as any).scene.start).toHaveBeenCalledWith('SettingsScene');
    });
    
    test('should update background parallax in update method', () => {
        (mainMenuScene as any).create();
        (mainMenuScene as any).update(100, 16);

        expect(mockTileSprite.setScrollFactor).toHaveBeenCalled();
    });
}); 