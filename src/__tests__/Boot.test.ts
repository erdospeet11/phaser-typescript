import '@testing-library/jest-dom';
import { Boot } from '../items/Boot';
import { Player } from '../Player';
import { GameManager } from '../managers/GameManager';
import { ItemTier } from '../items/Item';

jest.mock('../managers/GameManager', () => {
    const mockEquippedItems = {
        helmet: null,
        outfit: null,
        boots: null
    };
    
    return {
        GameManager: {
            getInstance: jest.fn().mockReturnValue({
                equippedItems: mockEquippedItems,
                setDefense: jest.fn(),
                getDefense: jest.fn().mockReturnValue(0),
                setEquippedItems: jest.fn()
            })
        }
    };
});

describe('Boot', () => {
    let boot: Boot;
    let mockPlayer: Partial<Player>;
    let gameManager: any;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        gameManager = GameManager.getInstance();
        gameManager.equippedItems.boots = null;
        
        mockPlayer = {
            equipItem: jest.fn(),
            modifyDefense: jest.fn(),
            updateUIText: jest.fn()
        };
        boot = new Boot('iron');
    });
    
    test('should initialize with correct properties', () => {
        expect(boot.name).toBe('Boot');
        expect(boot.icon).toBe('iron-boot');
        expect(boot.getDefenseBonus()).toBe(3);
        expect(boot.getTier()).toBe('iron');
    });
    
    test('should correctly use/equip on player', () => {
        boot.use(mockPlayer as Player);
        expect(mockPlayer.modifyDefense).toHaveBeenCalledWith(3);
        expect(mockPlayer.equipItem).toHaveBeenCalledWith(boot);
    });
    
    test('should get full name with tier', () => {
        expect(boot.getFullName()).toBe('iron Boot');
    });
    
    test.each([
        ['leather', 2],
        ['iron', 3],
        ['emerald', 4],
        ['diamond', 5]
    ])('should have correct defense bonus for %s tier', (tier, expectedDefense) => {
        const tierBoot = new Boot(tier as ItemTier);
        expect(tierBoot.getDefenseBonus()).toBe(expectedDefense);
    });
    
    test('should use default leather tier if no tier specified', () => {
        const defaultBoot = new Boot();
        expect(defaultBoot.getTier()).toBe('leather');
        expect(defaultBoot.getDefenseBonus()).toBe(2);
    });
}); 