import { Item, ItemTier } from "./Item";
import { Player } from "../Player";

export class Helmet extends Item {
    constructor(tier: ItemTier = 'leather') {
        super(
            'Helmet', 
            `A ${tier} helmet that provides defense`, 
            `${tier}-helmet`,
            tier
        );
    }
}
