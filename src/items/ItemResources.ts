import { Boot } from "./Boot";
import { Helmet } from "./Helmet";
import { Outfit } from "./Outfit";

//defined items for the game
export const ITEMS = {
    diamondOutfit: new Outfit('diamond'),
    diamondBoot: new Boot('diamond'),
    diamondHelmet: new Helmet('diamond'),
    emeraldOutfit: new Outfit('emerald'),
    emeraldBoot: new Boot('emerald'),
    emeraldHelmet: new Helmet('emerald'),
    ironOutfit: new Outfit('iron'),
    ironBoot: new Boot('iron'),
    ironHelmet: new Helmet('iron'),
    leatherOutfit: new Outfit('leather'),
    leatherBoot: new Boot('leather'),
    leatherHelmet: new Helmet('leather'),
}