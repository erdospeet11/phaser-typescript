import { RangedEnemy } from '../enemies/RangedEnemy';
import '@testing-library/jest-dom';

describe('RangedEnemy', () => {
    let rangedEnemy: RangedEnemy;
    let mockScene: any;
    let setTextureMock: jest.Mock;

    beforeEach(() => {
        setTextureMock = jest.fn().mockReturnThis();

        mockScene = {
            add: {
                existing: jest.fn(),
                graphics: jest.fn().mockReturnValue({
                    clear: jest.fn().mockReturnThis(),
                    fillStyle: jest.fn().mockReturnThis(),
                    fillRect: jest.fn().mockReturnThis()
                }),
                group: jest.fn().mockReturnValue({
                    add: jest.fn(),
                    get: jest.fn()
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
                        //sprite methods
                        obj.setTexture = setTextureMock;
                        obj.setPosition = jest.fn().mockReturnThis();
                        obj.setScale = jest.fn().mockReturnThis();
                        obj.setOrigin = jest.fn().mockReturnThis();
                        obj.scene = mockScene;
                    })
                }
            },
            time: {
                now: 0
            }
        };

        //create ranged enemy
        rangedEnemy = new RangedEnemy(mockScene, 100, 100);
        Object.assign(rangedEnemy, {
            setTexture: setTextureMock,
            setPosition: jest.fn().mockReturnThis(),
            setScale: jest.fn().mockReturnThis(),
            setOrigin: jest.fn().mockReturnThis(),
            scene: mockScene
        });
    });

    test('should initialize with projectile group', () => {
        expect(rangedEnemy.getProjectiles()).toBeDefined();
    });

    test('should be immovable', () => {
        const body = rangedEnemy.body as any;
        expect(body.setImmovable).toHaveBeenCalledWith(true);
    });

    test('should set texture on initialization', () => {
        expect(setTextureMock).toHaveBeenCalledWith('ranged-enemy');
    });
}); 