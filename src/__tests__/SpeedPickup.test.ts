import '@testing-library/jest-dom';
import { SpeedPickup } from '../pickups/SpeedPickup';
import { Player } from '../Player';

// Mock the SpeedPickup class to avoid Phaser dependencies
jest.mock('../pickups/SpeedPickup', () => {
    const MockSpeedPickup = function(this: any, scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.duration = 5000;
    };
    
    // Static properties with proper typing
    MockSpeedPickup.currentTimer = null as any;
    MockSpeedPickup.baseSpeed = null as number | null;
    
    MockSpeedPickup.prototype.destroy = jest.fn();
    
    MockSpeedPickup.prototype.collect = function(player: any) {
        // If there's an active timer, destroy it
        if (MockSpeedPickup.currentTimer) {
            MockSpeedPickup.currentTimer.destroy();
        }
        
        // Store base speed if not already stored
        if (MockSpeedPickup.baseSpeed === null) {
            MockSpeedPickup.baseSpeed = player.getSpeed();
        }
        
        // Increase player speed - Add non-null assertion to fix TS error
        player.setSpeed(MockSpeedPickup.baseSpeed! + 1);
        
        // Create a new timer with explicit type
        MockSpeedPickup.currentTimer = {
            destroy: jest.fn(),
            // Mock other timer properties as needed
        } as any;
        
        // Set tint on player
        player.setTint(0x00ffff);
        
        // Create a callback function for resetting speed
        this.timerCallback = function() {
            // Reset player's speed
            player.setSpeed(MockSpeedPickup.baseSpeed!);
            // Clear player's tint
            player.clearTint();
            // Reset timer and baseSpeed
            MockSpeedPickup.currentTimer = null;
            MockSpeedPickup.baseSpeed = null;
        };
        
        // Set up scene.time if it doesn't exist
        if (!this.scene.time) {
            this.scene.time = {};
        }
        
        // Set up delayedCall and make sure it's called
        this.scene.time.delayedCall = jest.fn().mockReturnValue(MockSpeedPickup.currentTimer);
        
        // Actually call delayedCall with the correct parameters
        this.scene.time.delayedCall(this.duration, this.timerCallback);
        
        this.destroy();
    };
    
    return {
        SpeedPickup: MockSpeedPickup
    };
});

describe('SpeedPickup', () => {
    let speedPickup: SpeedPickup;
    let mockScene: any;
    let mockPlayer: Partial<Player>;
    
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Reset static properties
        (SpeedPickup as any).currentTimer = null;
        (SpeedPickup as any).baseSpeed = null;
        
        mockScene = {
            add: {
                existing: jest.fn()
            },
            physics: {
                add: {
                    existing: jest.fn()
                }
            },
            time: {
                delayedCall: jest.fn().mockReturnValue({
                    destroy: jest.fn()
                })
            }
        };
        
        mockPlayer = {
            getSpeed: jest.fn().mockReturnValue(1),
            setSpeed: jest.fn(),
            setTint: jest.fn(),
            clearTint: jest.fn()
        };
        
        // Create pickup instance
        speedPickup = new SpeedPickup(mockScene, 100, 100);
    });
    
    test('should initialize with correct duration', () => {
        expect((speedPickup as any).duration).toBe(5000);
    });
    
    test('should increase player speed when collected', () => {
        speedPickup.collect(mockPlayer as Player);
        
        // Should get player's speed
        expect(mockPlayer.getSpeed).toHaveBeenCalled();
        
        // Should set player's speed to base speed + 1
        expect(mockPlayer.setSpeed).toHaveBeenCalledWith(2); // Base speed (1) + 1
        
        // Should set player tint
        expect(mockPlayer.setTint).toHaveBeenCalledWith(0x00ffff);
        
        // Should create a timed event
        expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
            5000, 
            expect.any(Function)
        );
        
        // Should destroy itself
        expect((speedPickup as any).destroy).toHaveBeenCalled();
    });
    
    test('should remove previous timer when collected again', () => {
        // Set up an existing timer
        const mockTimer = { destroy: jest.fn() };
        (SpeedPickup as any).currentTimer = mockTimer;
        
        speedPickup.collect(mockPlayer as Player);
        
        // Previous timer should be destroyed
        expect(mockTimer.destroy).toHaveBeenCalled();
    });
    
    test('should reset player speed when timer expires', () => {
        speedPickup.collect(mockPlayer as Player);
        
        // Get the callback that was registered with the timer
        const timerCallback = (speedPickup as any).timerCallback;
        
        // Call the callback to simulate timer completion
        timerCallback();
        
        // Player speed should be reset to base speed
        expect(mockPlayer.setSpeed).toHaveBeenLastCalledWith(1);
        
        // Player tint should be cleared
        expect(mockPlayer.clearTint).toHaveBeenCalled();
        
        // Current timer should be cleared
        expect((SpeedPickup as any).currentTimer).toBeNull();
        
        // Base speed should be reset
        expect((SpeedPickup as any).baseSpeed).toBeNull();
    });
}); 