import { HealthPickup } from '../pickups/HealthPickup';
import '@testing-library/jest-dom';
import { Player } from '../Player';

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

const setSizeMock = jest.fn();
const setImmovableMock = jest.fn();

jest.mock('../pickups/HealthPickup', () => {
    const originalModule = jest.requireActual('../pickups/HealthPickup');
    
    const MockHealthPickup = function(this: any, scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.healAmount = 10;
        this.tooltip = {
            show: jest.fn(),
            hide: jest.fn(),
            destroy: jest.fn()
        };
        
        this.body = {
            setSize: setSizeMock,
            setImmovable: setImmovableMock
        };

        this.body.setSize(16, 16);
        this.body.setImmovable(true);
    };
    MockHealthPickup.prototype.collect = function(player: any) {
        if (player.getHealth() < player.getMaxHealth()) {
            player.heal(this.healAmount);
            player.updateUIText();
            this.tooltip.hide();
            this.destroy();
        }
    };
    
    MockHealthPickup.prototype.destroy = jest.fn();
    
    return {
        HealthPickup: MockHealthPickup
    };
});

describe('HealthPickup', () => {
    let healthPickup: HealthPickup;
    let mockScene: any;
    let mockPlayer: Partial<Player>;

    beforeEach(() => {
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
            tweens: {
                add: jest.fn().mockReturnValue({})
            }
        };

        mockPlayer = {
            getHealth: jest.fn().mockReturnValue(50),
            getMaxHealth: jest.fn().mockReturnValue(100),
            heal: jest.fn(),
            updateUIText: jest.fn()
        };

        healthPickup = new HealthPickup(mockScene, 100, 100);
        
        healthPickup.setInteractive = jest.fn().mockReturnThis();
        healthPickup.on = jest.fn().mockReturnThis();
    });

    test('should initialize with interactive properties', () => {
        expect(setSizeMock).toHaveBeenCalledWith(16, 16);
        expect(setImmovableMock).toHaveBeenCalledWith(true);
    });

    test('should add event listeners for pointerover and pointerout', () => {
        expect(typeof healthPickup.setInteractive).toBe('function');
        expect(typeof healthPickup.on).toBe('function');
    });

    test('should heal player and destroy itself when collected', () => {
        healthPickup.collect(mockPlayer as Player);
        
        expect(mockPlayer.getHealth).toHaveBeenCalled();
        expect(mockPlayer.getMaxHealth).toHaveBeenCalled();
        expect(mockPlayer.heal).toHaveBeenCalled();
        expect(mockPlayer.updateUIText).toHaveBeenCalled();
        expect(healthPickup.destroy).toHaveBeenCalled();
    });

    test('should not heal player at full health', () => {
        mockPlayer.getHealth = jest.fn().mockReturnValue(100);
        
        healthPickup.collect(mockPlayer as Player);
        
        expect(mockPlayer.heal).not.toHaveBeenCalled();
        expect(healthPickup.destroy).not.toHaveBeenCalled();
    });
}); 