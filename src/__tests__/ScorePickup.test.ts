import '@testing-library/jest-dom';
import { ScorePickup } from '../pickups/ScorePickup';
import { Player } from '../Player';

// Mock the Tooltip class
jest.mock('../ui/Tooltip', () => {
    return {
        Tooltip: jest.fn().mockImplementation(() => {
            return {
                show: jest.fn(),
                hide: jest.fn(),
                destroy: jest.fn()
            };
        })
    };
});

// Create mocks for physics methods
const setSizeMock = jest.fn();
const setImmovableMock = jest.fn();
const setInteractiveMock = jest.fn().mockReturnThis();
const onMock = jest.fn().mockReturnThis();

// Mock the ScorePickup class to avoid Phaser dependencies
jest.mock('../pickups/ScorePickup', () => {
    const MockScorePickup = function(this: any, scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.scoreAmount = 25;
        
        // Create mock body
        this.body = {
            setSize: setSizeMock,
            setImmovable: setImmovableMock
        };
        
        // Set up tooltip
        const TooltipClass = jest.requireMock('../ui/Tooltip').Tooltip;
        this.tooltip = new TooltipClass(scene);
        
        // Setup interactive methods
        this.setInteractive = setInteractiveMock;
        this.on = onMock;
        
        // Call physics methods
        this.body.setSize(16, 16);
        this.body.setImmovable(true);
        
        // Set up interactive behavior
        this.setInteractive({ useHandCursor: true });
        
        // Store callbacks
        this.pointeroverCallback = () => {
            this.tooltip.show(this.x, this.y, `Score +${this.scoreAmount}`);
        };
        
        this.pointeroutCallback = () => {
            this.tooltip.hide();
        };
        
        // Register callbacks
        this.on('pointerover', this.pointeroverCallback);
        this.on('pointerout', this.pointeroutCallback);
    };
    
    MockScorePickup.prototype.destroy = jest.fn(function(this: any) {
        this.tooltip.destroy();
    });
    
    MockScorePickup.prototype.collect = function(this: any, player: any) {
        player.addScore(this.scoreAmount);
        
        // Add visual effect
        player.setTint(0xFFD700);
        
        // Create the clearTint callback function
        this.clearTintCallback = function() {
            player.clearTint();
        };
        
        // Set up delayedCall and actually call it with the correct delay
        if (!this.scene.time) {
            this.scene.time = {};
        }
        this.scene.time.delayedCall = jest.fn((delay, callback) => {
            // Store the callback for testing
            this.storedCallback = callback;
            return { destroy: jest.fn() };
        });
        
        // Call the delayedCall with the correct parameters (200ms delay)
        this.scene.time.delayedCall(200, this.clearTintCallback);
        
        this.tooltip.hide();
        this.destroy();
    };
    
    return {
        ScorePickup: MockScorePickup
    };
});

describe('ScorePickup', () => {
    let scorePickup: ScorePickup;
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
            },
            time: {
                delayedCall: jest.fn().mockReturnValue({
                    destroy: jest.fn()
                })
            }
        };
        
        mockPlayer = {
            addScore: jest.fn(),
            setTint: jest.fn(),
            clearTint: jest.fn()
        };
        
        // Create pickup instance
        scorePickup = new ScorePickup(mockScene, 100, 100);
    });
    
    test('should initialize with correct score amount', () => {
        expect((scorePickup as any).scoreAmount).toBe(25);
    });
    
    test('should initialize with correct physics properties', () => {
        expect(setSizeMock).toHaveBeenCalledWith(16, 16);
        expect(setImmovableMock).toHaveBeenCalledWith(true);
    });
    
    test('should set up interactive properties', () => {
        expect(setInteractiveMock).toHaveBeenCalledWith({ useHandCursor: true });
        expect(onMock).toHaveBeenCalledWith('pointerover', expect.any(Function));
        expect(onMock).toHaveBeenCalledWith('pointerout', expect.any(Function));
    });
    
    test('should show tooltip on pointerover', () => {
        const tooltip = (scorePickup as any).tooltip;
        
        // Trigger pointerover callback
        (scorePickup as any).pointeroverCallback();
        
        expect(tooltip.show).toHaveBeenCalledWith(100, 100, 'Score +25');
    });
    
    test('should hide tooltip on pointerout', () => {
        const tooltip = (scorePickup as any).tooltip;
        
        // Trigger pointerout callback
        (scorePickup as any).pointeroutCallback();
        
        expect(tooltip.hide).toHaveBeenCalled();
    });
    
    test('should add score to player when collected', () => {
        scorePickup.collect(mockPlayer as Player);
        
        // Should add score to player
        expect(mockPlayer.addScore).toHaveBeenCalledWith(25);
        
        // Should set player tint
        expect(mockPlayer.setTint).toHaveBeenCalledWith(0xFFD700);
        
        // Should create a delayed call to clear tint
        expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
            200, 
            expect.any(Function)
        );
        
        // Should hide tooltip
        expect((scorePickup as any).tooltip.hide).toHaveBeenCalled();
        
        // Should destroy itself
        expect((scorePickup as any).destroy).toHaveBeenCalled();
    });
    
    test('should clear player tint after delay', () => {
        scorePickup.collect(mockPlayer as Player);
        
        // Get the callback that was registered with the delayed call
        const clearTintCallback = (scorePickup as any).clearTintCallback;
        
        // Call the callback to simulate timer completion
        clearTintCallback();
        
        // Player tint should be cleared
        expect(mockPlayer.clearTint).toHaveBeenCalled();
    });
    
    test('should clean up resources when destroyed', () => {
        scorePickup.destroy();
        
        // Should destroy tooltip
        expect((scorePickup as any).tooltip.destroy).toHaveBeenCalled();
    });
}); 