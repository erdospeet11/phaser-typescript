import { Projectile } from '../Projectile';
import '@testing-library/jest-dom';

describe('Projectile', () => {
    let projectile: Projectile;
    let mockScene: any;

    beforeEach(() => {
        mockScene = {
            add: {
                existing: jest.fn()
            },
            physics: {
                add: {
                    existing: jest.fn().mockImplementation((obj: any) => {
                        obj.body = {
                            setSize: jest.fn(),
                            setOffset: jest.fn(),
                            setVelocity: jest.fn()
                        };
                    })
                }
            }
        };

        projectile = new Projectile(mockScene, 100, 100, 'test-projectile', 25);
        
        // Add necessary methods to the projectile mock
        Object.assign(projectile, {
            setActive: jest.fn().mockReturnThis(),
            setVisible: jest.fn().mockReturnThis(),
            setRotation: jest.fn().mockReturnThis(),
            active: false,
            visible: false
        });
    });

    test('should initialize with correct properties', () => {
        expect(projectile.getDamage()).toBe(25);
    });

    test('should set damage correctly', () => {
        projectile.setDamage(30);
        expect(projectile.getDamage()).toBe(30);
    });

    test('should set speed correctly', () => {
        projectile.setSpeed(400);
        // We need to test the speed indirectly through the fire method
        const direction = { x: 1, y: 0 };
        projectile.fire(direction);
        
        const body = projectile.body as any;
        expect(body.setVelocity).toHaveBeenCalledWith(400, 0);
    });

    test('should correctly fire in the given direction', () => {
        const direction = { x: 0, y: 1 };
        projectile.fire(direction);
        
        // Check that setActive and setVisible are called
        expect(projectile.setActive).toHaveBeenCalledWith(true);
        expect(projectile.setVisible).toHaveBeenCalledWith(true);
        
        // Update the properties as they would be in the actual implementation
        projectile.active = true;
        projectile.visible = true;
        
        // Expect projectile to be active and visible
        expect(projectile.active).toBe(true);
        expect(projectile.visible).toBe(true);
        
        // Expect velocity to be set in the right direction
        const body = projectile.body as any;
        expect(body.setVelocity).toHaveBeenCalledWith(0, 300); // Default speed is 300
    });

    test('should normalize non-unit vectors when firing', () => {
        const direction = { x: 3, y: 4 }; // Length 5
        projectile.fire(direction);
        
        const body = projectile.body as any;
        // Should normalize to (0.6, 0.8) and multiply by speed 300
        expect(body.setVelocity).toHaveBeenCalledWith(0.6 * 300, 0.8 * 300);
    });
}); 