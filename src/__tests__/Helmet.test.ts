import '@testing-library/jest-dom';
import { Helmet } from '../items/Helmet';
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

describe('Helmet', () => {
    let helmet: Helmet;
    let mockPlayer: Partial<Player>;
    let gameManager: any;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        gameManager = GameManager.getInstance();
        gameManager.equippedItems.helmet = null;

        mockPlayer = {
            equipItem: jest.fn(),
            modifyDefense: jest.fn(),
            updateUIText: jest.fn()
        };
        
        helmet = new Helmet('diamond');
    });
    
    test('should initialize with correct properties', () => {
        expect(helmet.name).toBe('Helmet');
        expect(helmet.icon).toBe('diamond-helmet');
        expect(helmet.getDefenseBonus()).toBe(5);
        expect(helmet.getTier()).toBe('diamond');
    });
    
    test('should correctly use/equip on player', () => {
        helmet.use(mockPlayer as Player);
        
        expect(mockPlayer.modifyDefense).toHaveBeenCalledWith(5);
        expect(mockPlayer.equipItem).toHaveBeenCalledWith(helmet);
    });
    
    test('should get full name with tier', () => {
        expect(helmet.getFullName()).toBe('diamond Helmet');
    });
    
    test.each([
        ['leather', 2],
        ['iron', 3],
        ['emerald', 4],
        ['diamond', 5]
    ])('should have correct defense bonus for %s tier', (tier, expectedDefense) => {
        const tierHelmet = new Helmet(tier as ItemTier);
        expect(tierHelmet.getDefenseBonus()).toBe(expectedDefense);
    });
}); 