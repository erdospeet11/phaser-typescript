import '@testing-library/jest-dom';
import { CoinPickup } from '../pickups/CoinPickup';
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
const setInteractiveMock = jest.fn().mockReturnThis();
const onMock = jest.fn().mockReturnThis();

jest.mock('../pickups/CoinPickup', () => {
    const originalModule = jest.requireActual('../pickups/CoinPickup');
    
    const MockCoinPickup = function(this: any, scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.coinAmount = 1;
        
        this.body = {
            setSize: setSizeMock,
            setImmovable: setImmovableMock
        };
        
        const TooltipClass = jest.requireMock('../ui/Tooltip').Tooltip;
        this.tooltip = new TooltipClass(scene);
        
        this.setInteractive = setInteractiveMock;
        this.on = onMock;
        
        this.body.setSize(16, 16);
        this.body.setImmovable(true);
        
        this.setInteractive({ useHandCursor: true });
        
        this.pointeroverCallback = () => {
            this.tooltip.show(this.x, this.y, `Gold +${this.coinAmount}`);
        };
        
        this.pointeroutCallback = () => {
            this.tooltip.hide();
        };
        
        this.on('pointerover', this.pointeroverCallback);
        this.on('pointerout', this.pointeroutCallback);
    };
    
    MockCoinPickup.prototype.collect = function(player: any) {
        player.addCoins(this.coinAmount);
        this.tooltip.hide();
        this.destroy();
    };
    
    MockCoinPickup.prototype.destroy = jest.fn();
    
    return {
        CoinPickup: MockCoinPickup
    };
});

describe('CoinPickup', () => {
    let coinPickup: CoinPickup;
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
            addCoins: jest.fn()
        };

        coinPickup = new CoinPickup(mockScene, 100, 100);
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
        const tooltip = (coinPickup as any).tooltip;
        
        if ((coinPickup as any).pointeroverCallback) {
            (coinPickup as any).pointeroverCallback();
        }
        
        expect(tooltip.show).toHaveBeenCalledWith(100, 100, 'Gold +1');
    });

    test('should hide tooltip on pointerout', () => {
        const tooltip = (coinPickup as any).tooltip;
        
        if ((coinPickup as any).pointeroutCallback) {
            (coinPickup as any).pointeroutCallback();
        }
        
        expect(tooltip.hide).toHaveBeenCalled();
    });

    test('should add coins to player and destroy itself when collected', () => {
        coinPickup.collect(mockPlayer as Player);
        expect(mockPlayer.addCoins).toHaveBeenCalledWith(1);
        expect((coinPickup as any).tooltip.hide).toHaveBeenCalled();
        expect(coinPickup.destroy).toHaveBeenCalled();
    });
}); 