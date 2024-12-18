import { Player } from "../Player";

export interface ItemStats {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
    maxHealth?: number;
}

export class Item {
    public readonly name: string;
    public readonly description: string;
    public readonly spriteKey: string;
    public readonly stats: ItemStats;
    public readonly rarity: 'common' | 'rare' | 'epic' | 'legendary';

    constructor(
        name: string,
        description: string,
        spriteKey: string,
        stats: ItemStats,
        rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
    ) {
        this.name = name;
        this.description = description;
        this.spriteKey = spriteKey;
        this.stats = stats;
        this.rarity = rarity;
    }

    apply(player: Player): void {
        if (this.stats.attack) player.modifyAttack(this.stats.attack);
        if (this.stats.defense) player.modifyDefense(this.stats.defense);
        if (this.stats.speed) player.modifySpeed(this.stats.speed);
        if (this.stats.health) player.heal(this.stats.health);
        if (this.stats.maxHealth) player.modifyMaxHealth(this.stats.maxHealth);
    }
} 