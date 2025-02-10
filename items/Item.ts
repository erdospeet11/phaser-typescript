import { Player } from "../src/Player";

export class Item {
    constructor(public name: string, public description: string, public icon: string) {
        this.name = name;
        this.description = description;
        this.icon = icon;
    }


    public use(player: Player): void {
        console.log(`${this.name} used by ${player.name}`);
    }
}
