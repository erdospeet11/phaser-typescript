import { Item, ItemTier } from "./Item";
import { Player } from "../Player";

export class Boot extends Item {
    constructor(tier: ItemTier = 'leather') {
        super(
            'Boot', 
            `A ${tier} boot that provides defense`, 
            `${tier}-boot`,
            tier
        );
    }
}