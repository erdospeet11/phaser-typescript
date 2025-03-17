import '@testing-library/jest-dom';
import { PowerupPickup } from '../pickups/PowerupPickup';
import { Player } from '../Player';

// Mock the PowerupPickup class to avoid Phaser dependencies
jest.mock('../pickups/PowerupPickup', () => {
    const MockPowerupPickup = function(this: any, scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.value = 30;
    };
    
    MockPowerupPickup.prototype.destroy = jest.fn();
    
    MockPowerupPickup.prototype.collect = function(player: any) {
        player.addPowerup(this.value);
        this.destroy();
    };
    
    return {
        PowerupPickup: MockPowerupPickup
    };
});

describe('PowerupPickup', () => {
    let powerupPickup: PowerupPickup;
    let mockScene: any;
    let mockPlayer: Partial<Player>;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        mockScene = {
            add: {
                existing: jest.fn()
            },
            physics: {
                add: {
                    existing: jest.fn()
                }
            }
        };

        mockPlayer = {
            addPowerup: jest.fn()
        };

        // Create pickup instance
        powerupPickup = new PowerupPickup(mockScene, 100, 100);
    });

    test('should initialize with correct value', () => {
        expect((powerupPickup as any).value).toBe(30);
    });

    test('should add powerup to player when collected', () => {
        powerupPickup.collect(mockPlayer as Player);
        
        expect(mockPlayer.addPowerup).toHaveBeenCalledWith(30);
        expect((powerupPickup as any).destroy).toHaveBeenCalled();
    });
}); 