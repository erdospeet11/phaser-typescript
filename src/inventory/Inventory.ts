import { Item } from "./Item";

interface InventorySlot {
    item: Item | null;
    quantity: number;
}

export class Inventory {
    private slots: InventorySlot[];
    private capacity: number;
    private owner: Phaser.GameObjects.Sprite;

    constructor(owner: Phaser.GameObjects.Sprite, capacity: number = 20) {
        this.owner = owner;
        this.capacity = capacity;
        this.slots = Array(capacity).fill(null).map(() => ({
            item: null,
            quantity: 0
        }));
    }

    public addItem(item: Item, quantity: number = 1): boolean {
        if (item.isStackable()) {
            // Try to stack with existing items first
            for (let slot of this.slots) {
                if (slot.item?.getId() === item.getId() && slot.quantity < item.getMaxStack()) {
                    const spaceInStack = item.getMaxStack() - slot.quantity;
                    const amountToAdd = Math.min(quantity, spaceInStack);
                    slot.quantity += amountToAdd;
                    quantity -= amountToAdd;
                    
                    if (quantity <= 0) return true;
                }
            }
        }

        // Find empty slots for remaining items
        for (let slot of this.slots) {
            if (slot.item === null) {
                slot.item = item;
                slot.quantity = Math.min(quantity, item.getMaxStack());
                quantity -= slot.quantity;
                
                if (quantity <= 0) return true;
            }
        }

        return quantity <= 0;
    }

    public removeItem(slotIndex: number, quantity: number = 1): boolean {
        const slot = this.slots[slotIndex];
        if (!slot || !slot.item) return false;

        slot.quantity -= quantity;
        if (slot.quantity <= 0) {
            slot.item = null;
            slot.quantity = 0;
        }
        return true;
    }

    public useItem(slotIndex: number): boolean {
        const slot = this.slots[slotIndex];
        if (!slot || !slot.item) return false;

        slot.item.use(this.owner);
        return this.removeItem(slotIndex, 1);
    }

    public getSlots(): InventorySlot[] {
        return this.slots;
    }
} 