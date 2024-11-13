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
    - [] Boss
- [] Character select
    - [] Every character has a dash and an active weapon
    - [] Warrior => swings a sword
    - [] Mage => shoots fireballs
    - [] Rogue => ?
    - [] Healer => Healing ability
    - [] Alchemist => low damage projectile inflicting on floor / poisioning on touch    
- [] Save progression
- [] Backend Database
- [] Login authorization / admin / change rules
- [] More powerups / abilites / skills

## Bugs or Mistakes
- [] Opening the character sheet does not pause the game
- [] Scaling down a sprite is messy
- [] Player does not have invincibility frames after hurt
- [] When player's health reaches zero, it dies