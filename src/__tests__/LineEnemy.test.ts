import { LineEnemy } from '../enemies/LineEnemy';
import '@testing-library/jest-dom';
import { Player } from '../Player';

describe('LineEnemy', () => {
    let lineEnemy: LineEnemy;
    let mockScene: any;
    let mockPlayer: Partial<Player>;
    let setTextureMock: jest.Mock;

    beforeEach(() => {
        setTextureMock = jest.fn().mockReturnThis();
        mockPlayer = {
            getSpeed: jest.fn().mockReturnValue(1),
            setSpeed: jest.fn(),
            x: 200,
            y: 200
        };

        mockScene = {
            add: {
                existing: jest.fn(),
                graphics: jest.fn().mockReturnValue({
                    clear: jest.fn().mockReturnThis(),
                    fillStyle: jest.fn().mockReturnThis(),
                    fillRect: jest.fn().mockReturnThis(),
                    lineStyle: jest.fn().mockReturnThis(),
                    beginPath: jest.fn().mockReturnThis(),
                    moveTo: jest.fn().mockReturnThis(),
                    lineTo: jest.fn().mockReturnThis(),
                    strokePath: jest.fn().mockReturnThis(),
                    destroy: jest.fn()
                })
            },
            physics: {
                add: {
                    existing: jest.fn().mockImplementation((obj: any) => {
                        obj.body = {
                            setCollideWorldBounds: jest.fn(),
                            setSize: jest.fn(),
                            setVelocity: jest.fn(),
                            setImmovable: jest.fn()
                        };
                    })
                }
            },
            getPlayer: jest.fn().mockReturnValue(mockPlayer),
            time: { now: 0 }
        };

        lineEnemy = new LineEnemy(mockScene, 100, 100);
        Object.assign(lineEnemy, {
            setTexture: setTextureMock,
            scene: mockScene
        });
    });

    test('should initialize as immovable', () => {
        const body = lineEnemy.body as any;
        expect(body.setImmovable).toHaveBeenCalledWith(true);
        expect(body.setVelocity).toHaveBeenCalledWith(0, 0);
    });

    test('should set sniper enemy texture', () => {
        expect(setTextureMock).toHaveBeenCalledWith('sniper-enemy');
    });

    test('should slow player when line intersects', () => {
        lineEnemy.update(mockPlayer as any);
        expect(mockPlayer.setSpeed).toHaveBeenCalled();
    });

    test('should clean up resources on destroy', () => {
        const destroySpy = jest.spyOn(lineEnemy, 'destroy');
        lineEnemy.destroy();
        expect(destroySpy).toHaveBeenCalled();
    });
}); 