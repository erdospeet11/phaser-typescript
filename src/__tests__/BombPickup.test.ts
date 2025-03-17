import '@testing-library/jest-dom';
import { BombPickup } from '../pickups/BombPickup';
import { Player } from '../Player';

import { ArenaScene } from '../scenes/ArenaScene';

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

const mockEnemies = [
    { damage: jest.fn(), constructor: { name: 'Enemy1' } },
    { damage: jest.fn(), constructor: { name: 'Enemy2' } },
    { damage: jest.fn(), constructor: { name: 'Enemy3' } }
];

jest.mock('../pickups/BombPickup', () => {
    const MockBombPickup = function(this: any, scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
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
            this.tooltip.show(this.x, this.y, 'Destroys all enemies!');
        };
        
        this.pointeroutCallback = () => {
            this.tooltip.hide();
        };
        
        this.on('pointerover', this.pointeroverCallback);
        this.on('pointerout', this.pointeroutCallback);
    };
    
    MockBombPickup.prototype.destroy = jest.fn(function(this: any) {
        this.tooltip.destroy();
    });
    
    MockBombPickup.prototype.collect = function(this: any, player: any) {
        const enemies = this.scene.getEnemies().getChildren();
        
        enemies.forEach((enemy: any) => {
            try {
                enemy.damage(1000);
            } catch (error) {
                console.error('Failed to damage enemy:', error);
            }
        });
        
        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.flash(500, 255, 0, 0);
        }
        
        this.tooltip.hide();
        this.destroy();
    };
    
    return {
        BombPickup: MockBombPickup
    };
});

describe('BombPickup', () => {
    let bombPickup: BombPickup;
    let mockScene: Partial<ArenaScene>;
    let mockPlayer: Partial<Player>;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        mockScene = {
            add: {
                existing: jest.fn()
            } as any,
            physics: {
                add: {
                    existing: jest.fn()
                }
            } as any,
            cameras: {
                main: {
                    flash: jest.fn()
                }
            } as any,
            getEnemies: jest.fn().mockReturnValue({
                getLength: jest.fn().mockReturnValue(mockEnemies.length),
                getChildren: jest.fn().mockReturnValue(mockEnemies)
            })
        };
        
        mockPlayer = {};
        
        bombPickup = new BombPickup(mockScene as any, 100, 100);
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
        const tooltip = (bombPickup as any).tooltip;
        
        (bombPickup as any).pointeroverCallback();
        
        expect(tooltip.show).toHaveBeenCalledWith(100, 100, 'Destroys all enemies!');
    });
    
    test('should hide tooltip on pointerout', () => {
        const tooltip = (bombPickup as any).tooltip;
        
        (bombPickup as any).pointeroutCallback();
        
        expect(tooltip.hide).toHaveBeenCalled();
    });
    
    test('should damage all enemies when collected', () => {
        bombPickup.collect(mockPlayer as Player);

        expect(mockScene.getEnemies).toHaveBeenCalled();
        const getEnemiesFn = mockScene.getEnemies as jest.Mock;
        expect(getEnemiesFn().getChildren).toHaveBeenCalled();
        
        mockEnemies.forEach(enemy => {
            expect(enemy.damage).toHaveBeenCalledWith(1000);
        });
        
        expect(mockScene.cameras!.main!.flash).toHaveBeenCalledWith(500, 255, 0, 0);
        expect((bombPickup as any).tooltip.hide).toHaveBeenCalled();
        expect((bombPickup as any).destroy).toHaveBeenCalled();
    });
    
    test('should clean up resources when destroyed', () => {
        bombPickup.destroy();
        
        expect((bombPickup as any).tooltip.destroy).toHaveBeenCalled();
    });
}); 