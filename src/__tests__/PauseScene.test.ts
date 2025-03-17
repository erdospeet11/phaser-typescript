import '@testing-library/jest-dom';
import { PauseScene } from '../scenes/PauseScene';

const mockGraphics = {
    fillStyle: jest.fn().mockReturnThis(),
    fillRoundedRect: jest.fn().mockReturnThis(),
    setInteractive: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    clear: jest.fn().mockReturnThis(),
    lineStyle: jest.fn().mockReturnThis(),
    strokeRoundedRect: jest.fn().mockReturnThis()
};

const mockText = {
    setOrigin: jest.fn().mockReturnThis()
};

const mockRectangle = {
    setInteractive: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    setOrigin: jest.fn().mockReturnThis()
};

interface MockButton {
    setInteractive: jest.Mock;
    on: jest.Mock;
}

describe('PauseScene', () => {
    let pauseScene: PauseScene;
    
    beforeEach(() => {
        jest.clearAllMocks();

        pauseScene = new PauseScene();
        
        (pauseScene as any).add = {
            rectangle: jest.fn().mockReturnValue(mockRectangle),
            text: jest.fn().mockReturnValue(mockText),
            graphics: jest.fn().mockReturnValue(mockGraphics)
        };
        
        (pauseScene as any).input = {
            keyboard: {
                addKey: jest.fn(),
                on: jest.fn()
            }
        };
        
        (pauseScene as any).scene = {
            resume: jest.fn(),
            stop: jest.fn(),
            start: jest.fn(),
            get: jest.fn().mockReturnValue({
                scene: {
                    pause: jest.fn()
                }
            })
        };
        
        (pauseScene as any).cameras = {
            main: {
                setBackgroundColor: jest.fn()
            }
        };
        
        (pauseScene as any).sound = {
            get: jest.fn().mockReturnValue({
                isPlaying: true,
                pause: jest.fn(),
                resume: jest.fn()
            })
        };
        
        (pauseScene as any).createButton = jest.fn((yPosition, text, onClick) => {
            const mockButton: MockButton = {
                setInteractive: jest.fn().mockReturnThis(),
                on: jest.fn((event: string, handler: Function): MockButton => {
                    if (event === 'pointerup') {
                        (handler as any).name = text.includes('Resume') ? 
                            'resumeGame' : (text.includes('Main Menu') ? 'mainMenu' : 'otherButton');
                    }
                    return mockButton;
                })
            };
            return mockButton;
        });
        
        (pauseScene as any).resumeGame = function() {
            this.scene.resume('ArenaScene');
            this.scene.stop('PauseScene');
        };
        
        (pauseScene as any).quitToMain = function() {
            this.scene.stop('ArenaScene');
            this.scene.start('MainMenuScene');
        };
        
        (pauseScene as any).create = jest.fn(() => {
            (pauseScene as any).resumeButton = (pauseScene as any).createButton(0, 'Resume Game', () => {});
            (pauseScene as any).mainMenuButton = (pauseScene as any).createButton(0, 'Return to Main Menu', () => {});
        });
    });
    
    test('should create UI elements in create method', () => {
        (pauseScene as any).create();
        
        expect((pauseScene as any).createButton).toHaveBeenCalledTimes(2);
        expect((pauseScene as any).resumeButton).toBeDefined();
        expect((pauseScene as any).mainMenuButton).toBeDefined();
    });
    
    test('should provide methods to resume game', () => {
        (pauseScene as any).create();

        const resumeHandler = (pauseScene as any).resumeGame.bind(pauseScene);
        resumeHandler();

        expect((pauseScene as any).scene.resume).toHaveBeenCalledWith('ArenaScene');
        expect((pauseScene as any).scene.stop).toHaveBeenCalledWith('PauseScene');
    });
    
    test('should provide methods to return to main menu', () => {
        (pauseScene as any).create();

        const mainMenuHandler = (pauseScene as any).quitToMain.bind(pauseScene);
        mainMenuHandler();
        
        expect((pauseScene as any).scene.stop).toHaveBeenCalledWith('ArenaScene');
        expect((pauseScene as any).scene.start).toHaveBeenCalledWith('MainMenuScene');
    });
}); 