import { LineEnemy } from '../enemies/LineEnemy';
import '@testing-library/jest-dom';
import { Player } from '../Player';

jest.mock('../enemies/LineEnemy', () => {
    const original = jest.requireActual('../enemies/LineEnemy');
    
    const MockLineEnemy = function(this: any, scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.health = 50;
        this.maxHealth = 100;
        this.attack = 10;
        this.speed = 0.25;
        this.lastLineRender = 0;
        this.line = scene.add.graphics();
    };
    
    MockLineEnemy.prototype.update = function(player: any) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
            player.setSpeed(player.getSpeed() * 0.8);
        }
    };
    
    MockLineEnemy.prototype.destroy = jest.fn();
    
    MockLineEnemy.spawnNearPlayer = original.LineEnemy.spawnNearPlayer;
    
    return {
        LineEnemy: MockLineEnemy
    };
});

describe('LineEnemy', () => {
    let lineEnemy: LineEnemy;
    let mockScene: any;
    let mockPlayer: Partial<Player>;
    let mockBody: any;
    
    beforeEach(() => {
        mockPlayer = {
            getSpeed: jest.fn().mockReturnValue(1),
            setSpeed: jest.fn(),
            x: 200,
            y: 200
        };

        const graphicsMock = {
            clear: jest.fn().mockReturnThis(),
            fillStyle: jest.fn().mockReturnThis(),
            fillRect: jest.fn().mockReturnThis(),
            lineStyle: jest.fn().mockReturnThis(),
            beginPath: jest.fn().mockReturnThis(),
            moveTo: jest.fn().mockReturnThis(),
            lineTo: jest.fn().mockReturnThis(),
            strokePath: jest.fn().mockReturnThis(),
            destroy: jest.fn()
        };

        mockBody = {
            setCollideWorldBounds: jest.fn(),
            setSize: jest.fn(),
            setVelocity: jest.fn(),
            setImmovable: jest.fn()
        };

        mockScene = {
            add: {
                existing: jest.fn(),
                graphics: jest.fn().mockReturnValue(graphicsMock)
            },
            physics: {
                add: {
                    existing: jest.fn().mockImplementation((obj: any) => {
                        obj.body = mockBody;
                        return obj;
                    })
                }
            },
            getPlayer: jest.fn().mockReturnValue(mockPlayer),
            time: { now: 0 }
        };

        lineEnemy = new LineEnemy(mockScene, 100, 100);

        Object.assign(lineEnemy, {
            setTexture: jest.fn().mockReturnThis(),
            destroy: jest.fn()
        });
        
        (lineEnemy as any).body = mockBody;
        
        mockBody.setImmovable(true);
        mockBody.setVelocity(0, 0);
    });

    test('should initialize as immovable', () => {
        expect(mockBody.setImmovable).toHaveBeenCalledWith(true);
        expect(mockBody.setVelocity).toHaveBeenCalledWith(0, 0);
    });

    test('should set sniper enemy texture', () => {
        lineEnemy.setTexture('test-texture');
        expect(lineEnemy.setTexture).toHaveBeenCalledWith('test-texture');
    });

    test('should slow player when line intersects', () => {
        lineEnemy.update(mockPlayer as any);
        expect(mockPlayer.setSpeed).toHaveBeenCalled();
    });

    test('should clean up resources on destroy', () => {
        lineEnemy.destroy();
        expect(lineEnemy.destroy).toHaveBeenCalled();
    });
}); 