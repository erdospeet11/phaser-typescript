import '@testing-library/jest-dom';
import { EndGameScene } from '../scenes/EndGameScene';
import { GameDatabase } from '../services/GameDatabase';

jest.mock('../managers/GameManager', () => {
    return {
        GameManager: {
            getInstance: jest.fn().mockReturnValue({
                reset: jest.fn()
            })
        }
    };
});

jest.mock('../managers/RoomManager', () => {
    return {
        RoomManager: {
            getInstance: jest.fn().mockReturnValue({
                reset: jest.fn()
            })
        }
    };
});

jest.mock('../services/GameDatabase', () => {
    const saveScoreMock = jest.fn().mockResolvedValue({});
    
    return {
        GameDatabase: {
            getInstance: jest.fn().mockReturnValue({
                saveScore: saveScoreMock
            })
        }
    };
});

const getMockedSaveScore = () => {
    return jest.requireMock('../services/GameDatabase').GameDatabase.getInstance().saveScore;
};

describe('EndGameScene', () => {
    let scene: EndGameScene;
    let mockTextObj: any;
    let mockLocalStorage: any;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        mockLocalStorage = {
            getItem: jest.fn().mockReturnValue('TestPlayer')
        };
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });
        
        mockTextObj = {
            setOrigin: jest.fn().mockReturnThis(),
            setInteractive: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            setTint: jest.fn().mockReturnThis(),
            clearTint: jest.fn().mockReturnThis()
        };
        
        scene = new EndGameScene();
        
        scene.add = {
            text: jest.fn().mockReturnValue(mockTextObj)
        } as any;
        
        scene.cameras = {
            main: {
                width: 800,
                height: 600
            }
        } as any;
        
        scene.scene = {
            start: jest.fn()
        } as any;
    });
    
    test('should initialize with game data', () => {
        const gameData = { victory: true, score: 1000, gold: 500 };
        scene.init(gameData);
        
        expect((scene as any).gameData).toEqual(gameData);
    });
    
    test('should create different messages based on victory state', async () => {
        scene.init({ victory: true, score: 1000, gold: 500 });
        await scene.create();
        
        expect(scene.add.text).toHaveBeenCalledWith(
            400, 200, 'Victory!',
            expect.objectContaining({ color: '#00ff00' })
        );
        
        jest.clearAllMocks();
        scene = new EndGameScene();
        scene.add = { text: jest.fn().mockReturnValue(mockTextObj) } as any;
        scene.cameras = { main: { width: 800, height: 600 } } as any;
        scene.scene = { start: jest.fn() } as any;
        
        scene.init({ victory: false, score: 500, gold: 200 });
        await scene.create();
        
        expect(scene.add.text).toHaveBeenCalledWith(
            400, 200, 'Game Over',
            expect.objectContaining({ color: '#ff0000' })
        );
    });
    
    test('should display score and gold information', async () => {
        jest.clearAllMocks();
        scene.init({ victory: true, score: 1234, gold: 567 });
        await scene.create();
        
        expect(scene.add.text).toHaveBeenCalledWith(
            400, 300, 'Final Score: 1234',
            expect.anything()
        );
        
        expect(scene.add.text).toHaveBeenCalledWith(
            400, 340, 'Gold Collected: 567',
            expect.anything()
        );
    });
    
    test('should create an interactive restart button', async () => {
        jest.clearAllMocks();
        scene.init({ victory: true, score: 1000, gold: 500 });
        await scene.create();
        
        expect(mockTextObj.setInteractive).toHaveBeenCalled();
        expect(mockTextObj.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    });
    
    test('should save score when player wins', async () => {
        jest.clearAllMocks();
        const saveScoreMock = getMockedSaveScore();
        
        scene.init({ victory: true, score: 1000, gold: 500 });
        await scene.create();
        
        expect(saveScoreMock).toHaveBeenCalledWith('TestPlayer', 1000);
    });
    
    test('should not save score when player loses', async () => {
        jest.clearAllMocks();
        const saveScoreMock = getMockedSaveScore();
        
        scene.init({ victory: false, score: 500, gold: 200 });
        await scene.create();
        
        expect(saveScoreMock).not.toHaveBeenCalled();
    });
}); 