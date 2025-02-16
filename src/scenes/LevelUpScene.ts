import { Scene } from 'phaser';
import { Player } from '../Player';

interface PerkOption {
    name: string;
    description: string;
    effect: (player: Player) => void;
}

export class LevelUpScene extends Scene {
    private player!: Player;
    private options: PerkOption[] = [];

    constructor() {
        super({ key: 'LevelUpScene' });
    }

    init(data: { player: Player }) {
        this.player = data.player;
        this.options = this.getRandomPerks();
        console.log('LevelUpScene initialized with options:', this.options);
    }

    create() {
        const { width, height } = this.cameras.main;

        //only pause ArenaScene if it's running
        if (this.scene.isActive('ArenaScene')) {
            this.scene.pause('ArenaScene');
        }

        this.scene.bringToTop();

        //background
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0)
            .setDepth(998);

        this.add.text(width / 2, height * 0.2, 'LEVEL UP!', {
            fontSize: '32px',
            color: '#ffff00',
            fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setDepth(999);

        //create three perk options horizontally
        const optionWidth = width * 0.25;
        const optionHeight = 120;
        const spacing = width * 0.1;

        this.options.forEach((option, index) => {
            const x = (width / 2) - (optionWidth + spacing) + index * (optionWidth + spacing);
            const y = height * 0.5;

            const container = this.add.container(x, y);

            const background = this.add.rectangle(0, 0, optionWidth, optionHeight, 0x444444)
                .setInteractive()
                .on('pointerover', () => background.setFillStyle(0x666666))
                .on('pointerout', () => background.setFillStyle(0x444444))
                .on('pointerdown', () => this.selectPerk(option));

            const title = this.add.text(0, -30, option.name, {
                fontSize: '13px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            const description = this.add.text(0, 10, option.description, {
                fontSize: '15px',
                color: '#cccccc',
                wordWrap: { width: optionWidth - 20 },
                resolution: 1
            }).setOrigin(0.5);

            container.add([background, title, description]);
            container.setDepth(999);
        });

        console.log('LevelUpScene created with options displayed.');
    }

    private getRandomPerks(): PerkOption[] {
        const allPerks: PerkOption[] = [
            {
                name: '💪 Strength',
                description: '+1 Attack Damage',
                effect: (player) => player.increaseAttack(1)
            },
            {
                name: '🏃 Speed',
                description: '+15% Movement Speed',
                effect: (player) => player.increaseSpeed(0.15)
            },
            {
                name: '❤️ Vitality',
                description: '+5 Max Health',
                effect: (player) => player.increaseMaxHealth(5)
            },
            {
                name: '⚡ Attack Speed',
                description: '-20% Attack Cooldown',
                effect: (player) => player.increaseAttackSpeed(0.2)
            },
            {
                name: '🎯 Critical Hit',
                description: '+10% Critical Chance',
                effect: (player) => player.increaseCriticalChance(0.1)
            }
        ];

        //shuffle and pick 3 random perks
        return allPerks
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
    }

    private selectPerk(option: PerkOption) {
        option.effect(this.player);
        console.log('Perk selected:', option.name);
        //only resume if ArenaScene exists and is paused
        if (this.scene.get('ArenaScene') && this.scene.isPaused('ArenaScene')) {
            this.scene.resume('ArenaScene');
        }
        this.scene.stop();
    }
} 