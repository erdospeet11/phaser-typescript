import { Enemy } from '../enemies/Enemy';
import '@testing-library/jest-dom';
import { Player } from '../Player';
import { ArenaScene } from '../scenes/ArenaScene';

describe('Enemy', () => {
    let enemy: Enemy;
    let mockScene: any;
    let mockPlayer: Partial<Player>;

    beforeEach(() => {
        mockPlayer = {
            gainExperience: jest.fn(),
            addScore: jest.fn(),
            getHealth: jest.fn().mockReturnValue(100),
            getMaxHealth: jest.fn().mockReturnValue(100)
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
                            setVelocity: jest.fn()
                        };
                        //sprite methods
                        obj.setTexture = jest.fn().mockReturnThis();
                        obj.setPosition = jest.fn().mockReturnThis();
                        obj.destroy = jest.fn();
                        obj.scene = mockScene;
                    })
                }
            },
            //mock ArenaScene methods
            getPlayer: jest.fn().mockReturnValue(mockPlayer),
            addPickup: jest.fn()
        };

        //create enemy
        const spriteMethods = {
            setTexture: jest.fn().mockReturnThis(),
            setPosition: jest.fn().mockReturnThis(),
            destroy: jest.fn(),
            scene: mockScene
        };

        enemy = new Enemy(mockScene, 100, 100);
        Object.assign(enemy, spriteMethods);
        enemy.scene = mockScene;
    });

    test('should initialize with correct default values', () => {
        expect(enemy.getHealth()).toBe(100);
        expect(enemy.getAttack()).toBe(5);
        expect(enemy.getSpeed()).toBe(0.25);
    });

    test('should take damage correctly', () => {
        const initialHealth = enemy.getHealth();
        enemy.damage(20);
        expect(enemy.getHealth()).toBe(initialHealth - 20);
    });

    test('should die when health reaches 0', () => {
        const destroySpy = jest.spyOn(enemy, 'destroy');
        enemy.damage(200);
        expect(destroySpy).toHaveBeenCalled();
        expect(mockScene.getPlayer).toHaveBeenCalled();
        expect(mockPlayer.gainExperience).toHaveBeenCalled();
        expect(mockPlayer.addScore).toHaveBeenCalled();
    });

    test('should update speed correctly', () => {
        enemy.setSpeed(0.5);
        expect(enemy.getSpeed()).toBe(0.5);
    });
}); 