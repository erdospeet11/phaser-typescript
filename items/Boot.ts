import { Item } from "./Item";
import { Player } from "../src/Player";

class Boot extends Item {
    constructor() {
        super('Boot', 'A sturdy leather boot', 'boot');
    }

    public use(player: Player): void {
        console.log(`${this.name} used by ${player.name}`);
    }
}