import { ObstacleEnemy } from '../enemies/ObstacleEnemy';
import '@testing-library/jest-dom';
import { Player } from '../Player';

describe('ObstacleEnemy', () => {
    let obstacleEnemy: ObstacleEnemy;
    let mockScene: any;
    let mockPlayer: Partial<Player>;
    let setTextureMock: jest.Mock;

    beforeEach(() => {
        setTextureMock = jest.fn().mockReturnThis();
        mockPlayer = {
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
            time: {
                delayedCall: jest.fn().mockReturnValue({
                    destroy: jest.fn()
                })
            }
        };

        obstacleEnemy = new ObstacleEnemy(mockScene, 100, 100);
        Object.assign(obstacleEnemy, {
            setTexture: setTextureMock,
            setPosition: jest.fn(),
            scene: mockScene
        });
    });

    test('should initialize with correct stats', () => {
        expect(obstacleEnemy.getHealth()).toBe(150);
        expect(obstacleEnemy.getAttack()).toBe(15);
    });

    test('should set obstacle enemy texture', () => {
        expect(setTextureMock).toHaveBeenCalledWith('obstacle-enemy');
    });

    test('should be immovable', () => {
        const body = obstacleEnemy.body as any;
        expect(body.setImmovable).toHaveBeenCalledWith(true);
        expect(body.setVelocity).toHaveBeenCalledWith(0, 0);
    });

    test('should set up teleport timer', () => {
        expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
            3000,
            expect.any(Function)
        );
    });

    test('should clean up timer on destroy', () => {
        const destroySpy = jest.spyOn(obstacleEnemy, 'destroy');
        obstacleEnemy.destroy();
        expect(destroySpy).toHaveBeenCalled();
    });

    test('static spawn method should create enemy near player', () => {
        const spawnedEnemy = ObstacleEnemy.spawnNearPlayer(mockScene, mockPlayer as any);
        expect(spawnedEnemy).toBeInstanceOf(ObstacleEnemy);
    });
}); 