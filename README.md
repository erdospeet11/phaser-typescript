This is a basic Phaser game project made with Typescript.

Idea is you have infinite dungeons (rooms joined together) and you kill monsters collect loot. everything attacks automatically, you only have to position yourself. you can collect powerups: gear, weapon, skills, attacks, gold. Special rooms or maps that are big and you encounter bigger waves.
    
## What we need
- [] MapLayout / Rooms with transition
    - [] Portal Room
    - [] Door Room
    - [] Corridor
    - [] Jungle
    - [] Shopkeeper
    - [] NPCs
- [] Enemies
    - [x] Walker (it walks toward the player)
    - [x] Caster (it casts projectiles toward the player)
    - [] Summoner (it summons minions)
    - [x] Boss
- [] Character select
    - [] Every character has a dash and an active weapon
    - [] Warrior => swings a sword
    - [x] Mage => shoots fireballs
    - [] Rogue => ?
    - [] Healer => Healing ability
    - [] Alchemist => low damage projectile inflicting on floor / poisioning on touch    
- [] Save progression
- [] Backend Database
- [] Login authorization / admin / change rules
- [] More powerups / abilites / skills



- Shopkeeper
- Chest
- items
- 2 more boss
- 2 more level design

- if u select a hero, its data loaded in and you can play as him





## Bugs or Mistakes
- [] Opening the character sheet does not pause the game
- [] Scaling down a sprite is messy
- [x] Player does not have invincibility frames after hurt
- [x] When player's health reaches zero, it dies