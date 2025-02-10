import { Player } from "../src/Player";
import { Item } from "./Item";

class Outfit extends Item {
    constructor() {
        super('Outfit', 'A stylish outfit', 'outfit');
    }

    public use(player: Player): void {
        console.log(`${this.name} used by ${player.name}`);
    }
}
