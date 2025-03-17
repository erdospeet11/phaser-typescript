import { Pickup } from '../pickups/Pickup';
import '@testing-library/jest-dom';

// Since Pickup is abstract, we need a concrete implementation for testing
class TestPickup extends Pickup {
    private testValue: number = 10;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'test-pickup');
        this.value = this.testValue;
    }
    
    collect(player: any): void {
        // Simple implementation for testing
        if (player && typeof player.addScore === 'function') {
            player.addScore(this.value);
        }
    }
}

describe('Pickup', () => {
    let pickup: TestPickup;
    let mockScene: any;
    let mockTween: any;
    
    beforeEach(() => {
        mockTween = {
            add: jest.fn().mockReturnValue({})
        };
        
        mockScene = {
            add: {
                existing: jest.fn()
            },
            physics: {
                add: {
                    existing: jest.fn().mockImplementation((obj: any) => {
                        obj.body = {
                            setSize: jest.fn(),
                            setOffset: jest.fn(),
                            setImmovable: jest.fn()
                        };
                    })
                }
            },
            tweens: mockTween
        };
        
        pickup = new TestPickup(mockScene, 100, 100);
    });
    
    test('should add itself to the scene on creation', () => {
        expect(mockScene.add.existing).toHaveBeenCalledWith(pickup);
        expect(mockScene.physics.add.existing).toHaveBeenCalledWith(pickup);
    });
    
    test('should create a floating animation', () => {
        expect(mockScene.tweens.add).toHaveBeenCalledWith(expect.objectContaining({
            targets: pickup,
            y: pickup.y - 5,
            duration: 1500,
            yoyo: true,
            repeat: -1
        }));
    });
    
    test('should call player.addScore when collected', () => {
        const mockPlayer = {
            addScore: jest.fn()
        };
        
        pickup.collect(mockPlayer);
        expect(mockPlayer.addScore).toHaveBeenCalledWith(10);
    });
    
    test('should handle collection when player has no addScore method', () => {
        const mockPlayer = {};
        
        // This should not throw an error
        expect(() => pickup.collect(mockPlayer)).not.toThrow();
    });
}); 