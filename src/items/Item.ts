import { Player } from "../Player";

export type ItemTier = 'leather' | 'iron' | 'emerald' | 'diamond';

export class Item {
    protected tier: ItemTier;
    protected defenseBonus: number;

    constructor(
        public name: string, 
        public description: string, 
        public icon: string,
        tier: ItemTier
    ) {
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.tier = tier;
        
        //defense bonus based on tier
        switch (tier) {
            case 'leather': this.defenseBonus = 2; break;
            case 'iron': this.defenseBonus = 3; break;
            case 'emerald': this.defenseBonus = 4; break;
            case 'diamond': this.defenseBonus = 5; break;
        }
    }

    public use(player: Player): void {
        console.log('Using item:', this.name, this.constructor.name);
        player.modifyDefense(this.defenseBonus);
        player.equipItem(this);
    }

    public getTier(): ItemTier {
        return this.tier;
    }

    public getDefenseBonus(): number {
        return this.defenseBonus;
    }

    public getFullName(): string {
        return `${this.tier} ${this.name}`;
    }
}
