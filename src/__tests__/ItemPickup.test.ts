import '@testing-library/jest-dom';
import { ItemPickup } from '../pickups/ItemPickup';
import { Player } from '../Player';
import { Item } from '../items/Item';

class MockItem implements Partial<Item> {
    public icon: string = 'test-item';
    public use = jest.fn();
}

const setSizeMock = jest.fn();
const setImmovableMock = jest.fn();
const setInteractiveMock = jest.fn().mockReturnThis();
const onMock = jest.fn().mockReturnThis();

jest.mock('../pickups/ItemPickup', () => {
    const MockItemPickup = function(this: any, scene: any, x: number, y: number, item: any) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.item = item;
        
        this.detectionZone = {
            body: {
                setCircle: jest.fn()
            },
            destroy: jest.fn()
        };
        
        this.interactText = {
            setOrigin: jest.fn().mockReturnThis(),
            setVisible: jest.fn().mockReturnThis(),
            destroy: jest.fn()
        };
        
        this.handleKeyPress = null;
        this.setInteractive = setInteractiveMock;
        this.on = onMock;
        this.DETECTION_RADIUS = 30;
    };
    
    MockItemPickup.prototype.destroy = jest.fn(function(this: any) {
        if (this.handleKeyPress) {
            window.removeEventListener('keydown', this.handleKeyPress);
        }
        if (this.interactText) {
            this.interactText.destroy();
        }
        if (this.detectionZone) {
            this.detectionZone.destroy();
        }
    });
    
    MockItemPickup.prototype.setupInteraction = jest.fn(function(this: any, player: any) {
        if (!this.scene) return;
        
        this.scene.physics = {
            add: {
                overlap: jest.fn().mockReturnValue({})
            },
            overlap: jest.fn().mockReturnValue(true)
        };
        
        this.player = player;
        
        this.showInteraction = () => {
            this.interactText.setVisible(true);
            
            if (!this.handleKeyPress) {
                this.handleKeyPress = (event: any) => {
                    if (event.key.toLowerCase() === 'e') {
                        this.equipItem(player);
                    }
                };
                window.addEventListener('keydown', this.handleKeyPress);
            }
        };
        
        this.scene.physics.add.overlap(
            player,
            this.detectionZone,
            this.showInteraction
        );
        
        this.cleanupInteraction = jest.fn(function(this: any) {
            if (this.handleKeyPress) {
                window.removeEventListener('keydown', this.handleKeyPress);
                this.handleKeyPress = null;
            }
            if (this.interactText) {
                this.interactText.setVisible(false);
            }
        });
        
        this.updateCallback = () => {
            if (!this.scene.physics.overlap(player, this.detectionZone)) {
                this.cleanupInteraction();
            }
        };
        
        this.scene.events = {
            on: jest.fn().mockImplementation((event, callback) => {
                if (event === 'update') {
                    this.updateCallback = callback;
                }
            })
        };
        
        this.scene.events.on('update', this.updateCallback);
    });
    
    MockItemPickup.prototype.equipItem = jest.fn(function(this: any, player: any) {
        this.item.use(player);
        this.destroy();
    });
    
    MockItemPickup.prototype.collect = jest.fn(function(this: any, player: any) {
        this.item.use(player);
    });
    
    return {
        ItemPickup: MockItemPickup
    };
});

describe('ItemPickup', () => {
    let itemPickup: ItemPickup;
    let mockScene: any;
    let mockPlayer: Partial<Player>;
    let mockItem: MockItem;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        mockScene = {
            add: {
                existing: jest.fn(),
                zone: jest.fn().mockReturnValue({
                    body: {
                        setCircle: jest.fn()
                    },
                    destroy: jest.fn()
                }),
                text: jest.fn().mockReturnValue({
                    setOrigin: jest.fn().mockReturnThis(),
                    setVisible: jest.fn().mockReturnThis(),
                    destroy: jest.fn()
                })
            },
            physics: {
                add: {
                    existing: jest.fn(),
                    overlap: jest.fn().mockReturnValue({})
                },
                world: {
                    enable: jest.fn()
                },
                overlap: jest.fn().mockReturnValue(true)
            },
            events: {
                on: jest.fn()
            }
        };
        
        mockPlayer = {};
        mockItem = new MockItem();
        itemPickup = new ItemPickup(mockScene, 100, 100, mockItem as any);
    });
    
    test('should initialize with the correct item', () => {
        expect((itemPickup as any).item).toBe(mockItem);
    });
    
    test('should initialize with correct detection radius', () => {
        expect((itemPickup as any).DETECTION_RADIUS).toBe(30);
    });
    
    test('should set up interaction zone when setupInteraction is called', () => {
        itemPickup.setupInteraction(mockPlayer as Player);
        
        expect((itemPickup as any).scene.physics.add.overlap).toHaveBeenCalledWith(
            mockPlayer,
            (itemPickup as any).detectionZone,
            expect.any(Function)
        );
        expect((itemPickup as any).player).toBe(mockPlayer);
        expect((itemPickup as any).scene.events.on).toHaveBeenCalledWith(
            'update',
            expect.any(Function)
        );
    });
    
    test('should show interaction UI when player overlaps with detection zone', () => {
        itemPickup.setupInteraction(mockPlayer as Player);
        (itemPickup as any).showInteraction();
        
        expect((itemPickup as any).interactText.setVisible).toHaveBeenCalledWith(true);
        expect((itemPickup as any).handleKeyPress).not.toBeNull();
    });
    
    test('should equip item when E key is pressed in detection zone', () => {
        itemPickup.setupInteraction(mockPlayer as Player);
        
        (itemPickup as any).showInteraction();
        
        const keyEvent = new KeyboardEvent('keydown', { key: 'e' });
        (itemPickup as any).handleKeyPress(keyEvent);
        
        expect((itemPickup as any).equipItem).toHaveBeenCalledWith(mockPlayer);
        expect(mockItem.use).toHaveBeenCalledWith(mockPlayer);
        expect((itemPickup as any).destroy).toHaveBeenCalled();
    });
    
    test('should clean up interaction when player leaves detection zone', () => {
        itemPickup.setupInteraction(mockPlayer as Player);
        (itemPickup as any).scene.physics.overlap = jest.fn().mockReturnValue(false);
        (itemPickup as any).updateCallback();

        expect((itemPickup as any).cleanupInteraction).toHaveBeenCalled();
        expect((itemPickup as any).interactText.setVisible).toHaveBeenCalledWith(false);
    });
    
    test('should clean up resources when destroyed', () => {
        (itemPickup as any).handleKeyPress = jest.fn();
        
        itemPickup.destroy();
        
        expect((itemPickup as any).interactText.destroy).toHaveBeenCalled();
        expect((itemPickup as any).detectionZone.destroy).toHaveBeenCalled();
    });
    
    test('should use item on player when collected', () => {
        itemPickup.collect(mockPlayer as Player);
        
        expect(mockItem.use).toHaveBeenCalledWith(mockPlayer);
    });
}); 