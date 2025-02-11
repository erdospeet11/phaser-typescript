import { Player } from "../Player";
import { Item } from "./Item";

export class Outfit extends Item {
    constructor() {
        super('Outfit', 'A stylish outfit', 'outfit');
    }

    public use(player: Player): void {
        console.log(`${this.name} used by ${player}`);
    }
}
