export class SettingsScene extends Phaser.Scene {
    private backgrounds: Phaser.GameObjects.TileSprite[] = [];
    private scrollSpeeds: number[] = [0.5, 1, 1.5];
    private ttime: number = 0;
    private musicScene?: Phaser.Scene;

    constructor() {
        super({ key: 'SettingsScene' });
    }

    preload() {
        this.load.image('menu-bg', 'assets/menu-background.png');
    }

    init() {
        // Reset arrays and variables when entering
        this.backgrounds = [];
        this.ttime = 0;
    }

    create() {
        // Get reference
        this.musicScene = this.scene.get('MusicScene');

        // Create background layers
        this.load.once('complete', () => {
            for (let i = 0; i < 3; i++) {
                const bg = this.add.tileSprite(
                    0,
                    0,
                    this.cameras.main.width,
                    this.cameras.main.height,
                    'menu-bg'
                );
                bg.setOrigin(0, 0);
                bg.setAlpha(1 - (i * 0.2));
                bg.setTint(0xffffff - (i * 0x222222));
                this.backgrounds.push(bg);
            }
        });
        this.load.start();

        // Title
        this.add.text(
            this.cameras.main.centerX,
            30,
            'Settings',
            {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 2,
                    fill: true
                }
            }
        ).setOrigin(0.5);

        // Volume Settings
        this.add.text(
            this.cameras.main.centerX,
            80,
            'Music Volume',
            {
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Music Volume Slider
        this.createVolumeSlider(100, (volume: number) => {
            if (this.musicScene) {
                (this.musicScene as any).setVolume(volume);
            }
        });

        this.add.text(
            this.cameras.main.centerX,
            140,
            'Sound Effects Volume',
            {
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        this.createVolumeSlider(160, () => {
            // TODO: Implement SFX volume control
        });

        // Back Button
        this.createButton(
            this.cameras.main.centerX,
            220,
            'Back',
            () => this.returnToMainMenu()
        );
    }

    private createVolumeSlider(yPosition: number, onVolumeChange: (volume: number) => void) {
        const width = 150;
        const height = 10;
        const x = this.cameras.main.centerX - width / 2;
        const y = yPosition;

        // Slider background
        const sliderBg = this.add.rectangle(
            x + width / 2,
            y,
            width,
            height,
            0x4a4a4a
        ).setInteractive();

        // Slider knob
        const knob = this.add.circle(
            x + width * 0.8,
            y,
            height / 1.5,
            0x6a6a6a
        ).setInteractive();

        this.input.setDraggable(knob);

        // Constrain the knob to the slider width
        this.input.on('drag', (pointer: any, gameObject: any, dragX: number) => {
            if (gameObject === knob) {
                const newX = Phaser.Math.Clamp(dragX, x, x + width);
                gameObject.x = newX;
                const volume = (newX - x) / width;
                onVolumeChange(volume);
            }
        });
    }

    private createButton(x: number, y: number, text: string, onClick: () => void) {
        const button = this.add.graphics();
        const buttonWidth = 120;
        const buttonHeight = 30;
        const cornerRadius = 8;

        const normalColor = 0x4a4a4a;
        const hoverColor = 0x6a6a6a;

        button.fillStyle(normalColor);
        button.fillRoundedRect(
            x - buttonWidth / 2,
            y - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );

        const hitArea = new Phaser.Geom.Rectangle(
            x - buttonWidth / 2,
            y - buttonHeight / 2,
            buttonWidth,
            buttonHeight
        );

        const interactiveZone = this.add.zone(
            x,
            y,
            buttonWidth,
            buttonHeight
        ).setInteractive({ hitArea: hitArea, useHandCursor: true });

        this.add.text(
            x,
            y,
            text,
            {
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Hover effect
        interactiveZone.on('pointerover', () => {
            button.clear();
            button.fillStyle(hoverColor);
            button.fillRoundedRect(
                x - buttonWidth / 2,
                y - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
        });

        interactiveZone.on('pointerout', () => {
            button.clear();
            button.fillStyle(normalColor);
            button.fillRoundedRect(
                x - buttonWidth / 2,
                y - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
        });

        interactiveZone.on('pointerdown', onClick);
    }

    update() {
        this.ttime += 0.01;
        
        this.backgrounds.forEach((bg, index) => {
            const speed = this.scrollSpeeds[index];
            bg.tilePositionX += speed * Math.cos(this.ttime + index);
            bg.tilePositionY += speed * Math.sin(this.ttime + index) * 0.5;
        });
    }

    private returnToMainMenu() {
        this.scene.start('MainMenuScene');
    }
} 