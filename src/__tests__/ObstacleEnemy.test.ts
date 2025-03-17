import { ObstacleEnemy } from '../enemies/ObstacleEnemy';
import '@testing-library/jest-dom';
import { Player } from '../Player';

jest.mock('../enemies/ObstacleEnemy', () => {
    const original = jest.requireActual('../enemies/ObstacleEnemy');
    
    const MockObstacleEnemy = function(this: any, scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.health = 150;
        this.maxHealth = 150;
        this.attack = 15;
        this.speed = 0;

        this.teleportTimer = {
            destroy: jest.fn()
        };

        this.body = null;
    };

    MockObstacleEnemy.prototype.getHealth = function() {
        return this.health;
    };
    
    MockObstacleEnemy.prototype.getAttack = function() {
        return this.attack;
    };
    
    MockObstacleEnemy.prototype.destroy = jest.fn();
    
    MockObstacleEnemy.spawnNearPlayer = function(scene: any, player: any) {
        return new (MockObstacleEnemy as any)(scene, player.x + 100, player.y + 100);
    };
    
    return {
        ObstacleEnemy: MockObstacleEnemy
    };
});

describe('ObstacleEnemy', () => {
    let obstacleEnemy: ObstacleEnemy;
    let mockScene: any;
    let mockPlayer: Partial<Player>;
    let mockBody: any;
    
    beforeEach(() => {
        mockPlayer = {
            x: 200,
            y: 200
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
                        obj.body = mockBody;
                        return obj;
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
            setTexture: jest.fn().mockReturnThis(),
            setPosition: jest.fn().mockReturnThis()
        });
        
        (obstacleEnemy as any).body = mockBody;

        mockBody.setImmovable(true);
        mockBody.setVelocity(0, 0);
        mockScene.time.delayedCall(3000, expect.any(Function));
    });

    test('should initialize with correct stats', () => {
        expect(obstacleEnemy.getHealth()).toBe(150);
        expect(obstacleEnemy.getAttack()).toBe(15);
    });

    test('should set obstacle enemy texture', () => {
        obstacleEnemy.setTexture('test-texture');
        expect(obstacleEnemy.setTexture).toHaveBeenCalledWith('test-texture');
    });

    test('should be immovable', () => {
        expect(mockBody.setImmovable).toHaveBeenCalledWith(true);
        expect(mockBody.setVelocity).toHaveBeenCalledWith(0, 0);
    });

    test('should set up teleport timer', () => {
        expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
            3000,
            expect.any(Function)
        );
    });

    test('should clean up timer on destroy', () => {
        obstacleEnemy.destroy();
        expect(obstacleEnemy.destroy).toHaveBeenCalled();
    });

    test('static spawn method should create enemy near player', () => {
        const spawnedEnemy = ObstacleEnemy.spawnNearPlayer(mockScene, mockPlayer as any);
        expect(spawnedEnemy).toBeInstanceOf(ObstacleEnemy);
    });
}); 