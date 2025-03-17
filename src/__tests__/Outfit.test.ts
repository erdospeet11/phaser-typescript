import '@testing-library/jest-dom';
import { Outfit } from '../items/Outfit';
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

describe('Outfit', () => {
    let outfit: Outfit;
    let mockPlayer: Partial<Player>;
    let gameManager: any;
    
    beforeEach(() => {
        jest.clearAllMocks();

        gameManager = GameManager.getInstance();
        gameManager.equippedItems.outfit = null;
        
        mockPlayer = {
            equipItem: jest.fn(),
            modifyDefense: jest.fn(),
            updateUIText: jest.fn()
        };
        
        outfit = new Outfit('emerald');
    });
    
    test('should initialize with correct properties', () => {
        expect(outfit.name).toBe('Outfit');
        expect(outfit.icon).toBe('emerald-outfit');
        expect(outfit.getDefenseBonus()).toBe(4);
        expect(outfit.getTier()).toBe('emerald');
    });
    
    test('should correctly use/equip on player', () => {
        outfit.use(mockPlayer as Player);

        expect(mockPlayer.modifyDefense).toHaveBeenCalledWith(4);
        expect(mockPlayer.equipItem).toHaveBeenCalledWith(outfit);
    });
    
    test('should get full name with tier', () => {
        expect(outfit.getFullName()).toBe('emerald Outfit');
    });
    
    test.each([
        ['leather', 2],
        ['iron', 3],
        ['emerald', 4],
        ['diamond', 5]
    ])('should have correct defense bonus for %s tier', (tier, expectedDefense) => {
        const tierOutfit = new Outfit(tier as ItemTier);
        expect(tierOutfit.getDefenseBonus()).toBe(expectedDefense);
    });
    
    test('should use default leather tier if no tier specified', () => {
        const defaultOutfit = new Outfit();
        expect(defaultOutfit.getTier()).toBe('leather');
        expect(defaultOutfit.getDefenseBonus()).toBe(2);
    });
}); 