import { Item, ItemTier } from "./Item";
import { Player } from "../Player";

export class Outfit extends Item {
    constructor(tier: ItemTier = 'leather') {
        super(
            'Outfit', 
            `A ${tier} outfit that provides defense`, 
            `${tier}-outfit`,
            tier
        );
    }
}
