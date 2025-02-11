import { Player } from "../Player";
import { Item } from "./Item";

export class Helmet extends Item {
    constructor() {
        super('Helmet', 'A protective helmet', 'helmet');
    }

    public use(player: Player): void {
        console.log(`${this.name} used by ${player}`);
    }
}
