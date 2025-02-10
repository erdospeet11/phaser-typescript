import { Player } from "../src/Player";
import { Item } from "./Item";

class Helmet extends Item {
    constructor() {
        super('Helmet', 'A protective helmet', 'helmet');
    }

    public use(player: Player): void {
        console.log(`${this.name} used by ${player.name}`);
    }
}
