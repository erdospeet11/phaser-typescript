interface ClassOption {
    key: string;
    sprite: string;
    name: string;
    description: string;
}

export class HeroSelectScene extends Phaser.Scene {
    private backgrounds: Phaser.GameObjects.TileSprite[] = [];
    private scrollSpeeds: number[] = [0.5, 1, 1.5];
    private ttime: number = 0;
    private classes: ClassOption[] = [
        { 
            key: 'MAGE', 
            sprite: 'player-mage',
            name: 'Mage',
            description: 'Wields powerful magic tomes'
        },
        { 
            key: 'WARRIOR', 
            sprite: 'player-warrior',
            name: 'Warrior',
            description: 'Masters of close combat'
        },
        { 
            key: 'ARCHER', 
            sprite: 'player-archer',
            name: 'Archer',
            description: 'Skilled with bow and arrow'
        },
        { 
            key: 'THING', 
            sprite: 'player-thing',
            name: 'T̵̥̄h̸͉̏i̴̟̊n̸͇̈́g̵͕̋',
            description: '???'
        }
    ];

    private hoverText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'HeroSelectScene' });
    }

    preload() {
        // Load class sprites
        this.load.image('player-mage', 'assets/player-mage.png');
        this.load.image('player-warrior', 'assets/player-warrior.png');
        this.load.image('player-archer', 'assets/player-archer.png');
        this.load.image('player-thing', 'assets/player-thing.png');
        this.load.image('menu-bg', 'assets/menu-background.png');
    }

    create() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;

        // Create parallax background layers
        for (let i = 0; i < 2; i++) {
            const bg = this.add.tileSprite(
                0,
                0,
                width,
                height,
                'menu-bg'
            );
            bg.setOrigin(0, 0);
            bg.setAlpha(1 - (i * 0.2));
            bg.setTint(0xffffff - (i * 0x222222));
            this.backgrounds.push(bg);
        }

        //going back
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', () => {
                this.scene.start('MainMenuScene');
            });
        }

        // Title
        this.add.text(centerX, 50, 'Select Your Hero', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial, sans-serif',
            resolution: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 0,
                fill: true
            }
        }).setOrigin(0.5);

        // Create hover text (initially invisible)
        this.hoverText = this.add.text(centerX, 100, '', {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            fontFamily: 'Arial, sans-serif',
            resolution: 2
        })
        .setOrigin(0.5)
        .setVisible(false);

        // Spacing for layout
        const spacing = 80;
        const totalWidth = (this.classes.length - 1) * spacing;
        const startX = centerX - totalWidth / 2;

        // Horizontal layout
        this.classes.forEach((classOption, index) => {
            const x = startX + (index * spacing);
            const y = height * 0.6;

            const sprite = this.add.sprite(x, y, classOption.sprite)
                .setInteractive({ useHandCursor: true })
                .setScale(2);

            // Hover effects
            sprite.on('pointerover', () => {
                sprite.setTint(0x00ff00);
                this.hoverText.setText(classOption.name + '\n' + classOption.description);
                this.hoverText.setVisible(true);
            });

            sprite.on('pointerout', () => {
                sprite.clearTint();
                this.hoverText.setVisible(false);
            });

            // Click handler
            sprite.on('pointerdown', () => {
                this.selectClass(classOption.key);
            });
        });
    }

    update() {
        this.ttime += 0.01;
        
        this.backgrounds.forEach((bg, index) => {
            const speed = this.scrollSpeeds[index];
            bg.tilePositionX += speed * Math.cos(this.ttime + index);
            bg.tilePositionY += speed * Math.sin(this.ttime + index) * 0.5;
        });
    }

    private selectClass(classKey: string) {
        try {
            console.log(`Selected class: ${classKey}`); // Debugging log
            localStorage.setItem('selectedClass', classKey);
            this.scene.stop();
            this.scene.start('LevelSelectScene');
        } catch (error) {
            console.error('Error during class selection:', error);
            this.scene.start('MainMenuScene');
        }
    }

    shutdown() {
        // Clean up resources in shutdown
        if (this.backgrounds) {
            this.backgrounds.forEach(bg => {
                if (bg && bg.active) {
                    bg.destroy();
                }
            });
            this.backgrounds = [];
        }

        if (this.hoverText && this.hoverText.active) {
            this.hoverText.destroy();
        }

        // Clear keyboard events
        if (this.input && this.input.keyboard) {
            this.input.keyboard.removeAllListeners('keydown-ESC');
        }

        // Clear all events
        this.input.removeAllListeners();
        this.tweens.killAll();
        this.time.removeAllEvents();
    }
} 