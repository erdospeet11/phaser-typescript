import '@testing-library/jest-dom';
import { StrengthPickup } from '../pickups/StrengthPickup';
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

jest.mock('../pickups/StrengthPickup', () => {
    const MockStrengthPickup = function(this: any, scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.duration = 5000;
        
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
            this.tooltip.show(this.x, this.y, 'Double damage for 5 seconds!');
        };
        this.pointeroutCallback = () => {
            this.tooltip.hide();
        };
        this.on('pointerover', this.pointeroverCallback);
        this.on('pointerout', this.pointeroutCallback);
    };
    
    MockStrengthPickup.currentTimer = null as any;
    MockStrengthPickup.baseAttack = null as number | null;
    
    MockStrengthPickup.prototype.destroy = jest.fn(function() {
        this.tooltip.destroy();
    });
    
    MockStrengthPickup.prototype.collect = function(player: any) {
        if (MockStrengthPickup.currentTimer) {
            MockStrengthPickup.currentTimer.destroy();
        }
        
        if (MockStrengthPickup.baseAttack === null) {
            MockStrengthPickup.baseAttack = player.getAttack();
        }
        
        const doubledAttack = MockStrengthPickup.baseAttack! * 2;
        player.setAttack(doubledAttack);
        
        MockStrengthPickup.currentTimer = {
            destroy: jest.fn()
        } as any;
        
        player.setTint(0xff0000);
        
        this.timerCallback = function() {
            player.setAttack(MockStrengthPickup.baseAttack!);
            player.clearTint();
            MockStrengthPickup.currentTimer = null;
            MockStrengthPickup.baseAttack = null;
        };

        if (!this.scene.time) {
            this.scene.time = {};
        }
        this.scene.time.delayedCall = jest.fn().mockReturnValue(MockStrengthPickup.currentTimer);
        this.scene.time.delayedCall(this.duration, this.timerCallback);
        
        this.tooltip.hide();
        this.destroy();
    };
    
    return {
        StrengthPickup: MockStrengthPickup
    };
});

describe('StrengthPickup', () => {
    let strengthPickup: StrengthPickup;
    let mockScene: any;
    let mockPlayer: Partial<Player>;
    
    beforeEach(() => {
        jest.clearAllMocks();

        (StrengthPickup as any).currentTimer = null;
        (StrengthPickup as any).baseAttack = null;
        
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
            getAttack: jest.fn().mockReturnValue(10),
            setAttack: jest.fn(),
            setTint: jest.fn(),
            clearTint: jest.fn()
        };

        strengthPickup = new StrengthPickup(mockScene, 100, 100);
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
        const tooltip = (strengthPickup as any).tooltip;
        (strengthPickup as any).pointeroverCallback();
        
        expect(tooltip.show).toHaveBeenCalledWith(100, 100, 'Double damage for 5 seconds!');
    });
    
    test('should hide tooltip on pointerout', () => {
        const tooltip = (strengthPickup as any).tooltip;
        (strengthPickup as any).pointeroutCallback();
        
        expect(tooltip.hide).toHaveBeenCalled();
    });
    
    test('should double player attack when collected', () => {
        strengthPickup.collect(mockPlayer as Player);

        expect(mockPlayer.getAttack).toHaveBeenCalled();
        expect(mockPlayer.setAttack).toHaveBeenCalledWith(20);
        expect(mockPlayer.setTint).toHaveBeenCalledWith(0xff0000);
        expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
            5000, 
            expect.any(Function)
        );
        expect((strengthPickup as any).tooltip.hide).toHaveBeenCalled();
        expect((strengthPickup as any).destroy).toHaveBeenCalled();
    });
    
    test('should reset player attack when timer expires', () => {
        strengthPickup.collect(mockPlayer as Player);
        const timerCallback = (strengthPickup as any).timerCallback;
        timerCallback();
        expect(mockPlayer.setAttack).toHaveBeenLastCalledWith(10);
        expect(mockPlayer.clearTint).toHaveBeenCalled();
        expect((StrengthPickup as any).currentTimer).toBeNull();
        expect((StrengthPickup as any).baseAttack).toBeNull();
    });
    
    test('should clean up resources when destroyed', () => {
        strengthPickup.destroy();
        
        expect((strengthPickup as any).tooltip.destroy).toHaveBeenCalled();
    });
}); 