import '@testing-library/jest-dom';
import { MusicScene } from '../scenes/MusicScene';

const mockSound = {
    play: jest.fn(),
    destroy: jest.fn(),
    setVolume: jest.fn()
};

const mockAdd = {
    add: jest.fn().mockReturnValue(mockSound)
};

describe('MusicScene', () => {
    let musicScene: MusicScene;
    
    beforeEach(() => {
        jest.clearAllMocks();

        musicScene = new MusicScene();

        (musicScene as any).sound = mockAdd;
        (musicScene as any).load = {
            audio: jest.fn()
        };
    });
    
    test('should preload the background music', () => {
        musicScene.preload();
        
        expect((musicScene as any).load.audio).toHaveBeenCalledWith(
            'background-music', 
            'assets/music/background-music.mp3'
        );
    });
    
    test('should create and play music in create method', () => {
        musicScene.create();

        expect((musicScene as any).sound.add).toHaveBeenCalledWith(
            'background-music', 
            {
                loop: true,
                volume: 0.5
            }
        );
        expect(mockSound.play).toHaveBeenCalled();
        expect((musicScene as any).music).toBe(mockSound);
    });
    
    test('should set volume on the music', () => {
        musicScene.create();

        musicScene.setVolume(0.8);
        
        expect(mockSound.setVolume).toHaveBeenCalledWith(0.8);
    });
    
    test('should destroy the music', () => {
        musicScene.create();
        musicScene.destroy();

        expect(mockSound.destroy).toHaveBeenCalled();
    });
    
    test('should not fail when setting volume if music is not initialized', () => {
        (musicScene as any).music = undefined;
        
        expect(() => {
            musicScene.setVolume(0.8);
        }).not.toThrow();
    });
    
    test('should not fail when destroying if music is not initialized', () => {
        (musicScene as any).music = undefined;
        
        expect(() => {
            musicScene.destroy();
        }).not.toThrow();
    });
}); 