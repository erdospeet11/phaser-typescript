import { Player } from "../Player";
import { Tooltip } from './Tooltip';

export class CharacterSheetScene extends Phaser.Scene {
    private player!: Player;
    private readonly SLOT_SIZE = 40;
    private readonly SLOT_PADDING = 10;
    private tooltip!: Tooltip;

    constructor() {
        super({ key: 'CharacterSheetScene' });
    }

    create(data: { player: Player }) {
        this.player = data.player;
        const { width, height } = this.cameras.main;
        const playerName = localStorage.getItem('playerName') || 'ERROR';

        this.input.keyboard!.on('keydown-C', () => this.closeSheet());
        this.input.keyboard!.on('keydown-ESC', () => this.closeSheet());

        this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
        .setOrigin(0)
        .setDepth(998);

        this.add.text(width * 0.25, height * 0.2, playerName, {
            fontSize: '20px',
                color: '#ffffff',
            fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setDepth(999);

        this.add.sprite(width * 0.25, height * 0.4, this.player.texture.key)
            .setScale(3)
        .setDepth(999);

        const stats = [
            { label: 'Level', value: this.player.getLevel().toString() },
            { label: 'Experience', value: `${this.player.getExperience()}/${this.player.getExperienceToNextLevel()}` },
            { label: 'Health', value: `${this.player.getHealth()}/${this.player.getMaxHealth()}` },
            { label: 'Attack', value: this.player.getAttack().toString() },
            { label: 'Speed', value: this.player.getSpeed().toString() }
        ];

        stats.forEach((stat, index) => {
            this.add.text(width * 0.6, height * 0.2 + (index * 30), stat.label, {
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            })
            .setDepth(999);

            this.add.text(width * 0.8, height * 0.2 + (index * 30), stat.value, {
                fontSize: '12px',
                color: '#ffff00',
                fontStyle: 'bold'
            })
            .setDepth(999);
        });

        const closeButton = this.add.text(width - 20, 20, '✕', {
            fontSize: '20px',
            color: '#ffffff'
        })
        .setOrigin(1, 0)
        .setDepth(999)
        .setInteractive({ useHandCursor: true })
        .on('pointerup', () => this.closeSheet())
        .on('pointerover', () => closeButton.setTint(0xff0000))
        .on('pointerout', () => closeButton.clearTint());

        this.createEquipmentSlots();

        this.tooltip = new Tooltip(this);
    }

    private createEquipmentSlots(): void {
        const { width, height } = this.cameras.main;
        
        const equipmentSlots = ['Helmet', 'Outfit', 'Boots'];
        const combatSlots = ['Weapon', 'Ability'];
        
        const equipmentWidth = (this.SLOT_SIZE * 3) + (this.SLOT_PADDING * 2);
        const combatWidth = (this.SLOT_SIZE * 2) + this.SLOT_PADDING;
        const gapBetweenGroups = 30;
        
        const totalWidth = equipmentWidth + combatWidth + gapBetweenGroups;
        let startX = width/2 - totalWidth/2;
        const slotY = height - 60;

        equipmentSlots.forEach((slotType, index) => {
            const x = startX + (index * (this.SLOT_SIZE + this.SLOT_PADDING));
            this.createSlot(x, slotY, slotType);
        });

        const combatStartX = startX + equipmentWidth + gapBetweenGroups;
        combatSlots.forEach((slotType, index) => {
            const x = combatStartX + (index * (this.SLOT_SIZE + this.SLOT_PADDING));
            this.createSlot(x, slotY, slotType);
        });
    }

    private createSlot(x: number, y: number, slotType: string): void {
        const slot = this.add.rectangle(
            x + this.SLOT_SIZE/2,
            y,
            this.SLOT_SIZE,
            this.SLOT_SIZE,
            0x333333
        )
        .setStrokeStyle(2, 0x666666)
        .setDepth(999);

        if (slotType === 'Weapon') {
            //show player weapon
            const weapon = this.player.getWeapon();
            const weaponSprite = this.add.sprite(
                x + this.SLOT_SIZE/2,
                y,
                weapon.spriteKey
            )
            .setScale(2)
            .setDepth(1000);

            slot.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    slot.setStrokeStyle(2, 0x00ff00);
                    this.tooltip.show(
                        x + this.SLOT_SIZE/2,
                        y,
                        `${weapon.name}\nDamage: ${this.player.getAttack()}`
                    );
                })
                .on('pointerout', () => {
                    slot.setStrokeStyle(2, 0x666666);
                    this.tooltip.hide();
                });
        } else if (slotType === 'Ability') {
            //show player ability
            const playerClass = localStorage.getItem('selectedClass') || 'MAGE';
            let abilitySprite: string;
            let abilityName: string;
            let abilityDescription: string;

            switch (playerClass) {
                case 'MAGE':
                    abilitySprite = 'teleport-item';
                    abilityName = 'Teleport';
                    abilityDescription = 'Instantly teleport to cursor position';
                    break;
                case 'WARRIOR':
                    abilitySprite = 'slash-item';
                    abilityName = 'Slash';
                    abilityDescription = 'Perform a powerful circular slash attack';
                    break;
                default:
                    abilitySprite = 'dash-item';
                    abilityName = 'Dash';
                    abilityDescription = 'Quickly dash in any direction';
            }

            const abilityIcon = this.add.sprite(
                x + this.SLOT_SIZE/2,
                y,
                abilitySprite
            )
            .setScale(2)
            .setDepth(1000);

            slot.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    slot.setStrokeStyle(2, 0x00ff00);
                    this.tooltip.show(
                        x + this.SLOT_SIZE/2,
                        y,
                        `${abilityName}\n${abilityDescription}`
                    );
                })
                .on('pointerout', () => {
                    slot.setStrokeStyle(2, 0x666666);
                    this.tooltip.hide();
                });
        } else {
            //handle equipment slots
            const equippedItems = this.player.getEquippedItems();
            let equippedItem = null;

            switch(slotType) {
                case 'Helmet':
                    equippedItem = equippedItems.helmet;
                    break;
                case 'Outfit':
                    equippedItem = equippedItems.outfit;
                    break;
                case 'Boots':
                    equippedItem = equippedItems.boots;
                    break;
            }

            if (equippedItem) {
                const itemSprite = this.add.sprite(
                    x + this.SLOT_SIZE/2,
                    y,
                    equippedItem.icon
                )
                .setScale(2)
                .setDepth(1000);

                slot.setInteractive({ useHandCursor: true })
                    .on('pointerover', () => {
                        slot.setStrokeStyle(2, 0x00ff00);
                        this.tooltip.show(
                            x + this.SLOT_SIZE/2,
                            y,
                            `${equippedItem.getFullName()}\nDefense: +${equippedItem.getDefenseBonus()}`
                        );
                    })
                    .on('pointerout', () => {
                        slot.setStrokeStyle(2, 0x666666);
                        this.tooltip.hide();
                    });
            }
        }

        //label
        this.add.text(
            x + this.SLOT_SIZE/2,
            y + this.SLOT_SIZE/2 + 10,
            slotType,
            {
                fontSize: '10px',
                color: '#ffffff',
            }
        )
        .setOrigin(0.5)
        .setDepth(999);
    }

    private closeSheet(): void {
        this.tooltip.destroy();
        this.scene.resume('ArenaScene');
        this.scene.stop();
    }

    private updateStats(): void {
        //todo: update stats
    }

    preload() {
        this.load.image('dash-item', 'assets/items/dash-item.png');
        this.load.image('teleport-item', 'assets/items/teleport-item.png');
        this.load.image('slash-item', 'assets/items/slash-item.png');

        this.load.image('leather-outfit', 'assets/items/leather-outfit.png');
        this.load.image('leather-boot', 'assets/items/leather-boot.png');
        this.load.image('leather-helmet', 'assets/items/leather-helmet.png');
        this.load.image('iron-outfit', 'assets/items/iron-outfit.png');
        this.load.image('iron-boot', 'assets/items/iron-boot.png');
        this.load.image('iron-helmet', 'assets/items/iron-helmet.png');
        this.load.image('diamond-outfit', 'assets/items/diamond-outfit.png');
        this.load.image('diamond-boot', 'assets/items/diamond-boot.png');
        this.load.image('diamond-helmet', 'assets/items/diamond-helmet.png');
        this.load.image('emerald-outfit', 'assets/items/emerald-outfit.png');
        this.load.image('emerald-boot', 'assets/items/emerald-boot.png');
        this.load.image('emerald-helmet', 'assets/items/emerald-helmet.png');
    }
} 