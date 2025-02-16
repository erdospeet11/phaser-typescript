import { Player } from '../Player';

export class NPC extends Phaser.GameObjects.Sprite {
    private detectionZone: Phaser.GameObjects.Zone;
    private readonly DETECTION_RADIUS = 50;
    private shopPanel: Phaser.GameObjects.Container;
    private handleShop: ((event: KeyboardEvent) => void) | null = null;
    private isInteracting: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'npc');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setSize(16, 16);

        this.shopPanel = scene.add.container(x - 80, y - 100);

        const panel = scene.add.rectangle(0, 0, 160, 70, 0x333333, 0.8)
            .setOrigin(0, 0)
            .setStrokeStyle(1, 0xffffff);
        
        const divider = scene.add.line(80, 0, 0, 0, 0, 70, 0xffffff)
            .setOrigin(0.5, 0);

        const xpText = scene.add.text(10, 15, '1: Buy 50 XP\n10 gold', {
            fontSize: '8px',
            color: '#ffffff',
            align: 'center'
        });
        const xpIcon = scene.add.sprite(30, 45, 'xp-potion')
            .setScale(1.5);

        const healthText = scene.add.text(90, 15, '2: Full Health\n15 gold', {
            fontSize: '8px',
            color: '#ffffff',
            align: 'center'
        });
        const healthIcon = scene.add.sprite(110, 45, 'health-potion')
            .setScale(1.5);

        this.shopPanel.add([panel, divider, xpText, xpIcon, healthText, healthIcon]);
        this.shopPanel.setDepth(1000);
        this.shopPanel.setVisible(false);

        this.detectionZone = scene.add.zone(x, y, this.DETECTION_RADIUS * 2, this.DETECTION_RADIUS * 2);
        scene.physics.world.enable(this.detectionZone);
        
        const zoneBody = this.detectionZone.body as Phaser.Physics.Arcade.Body;
        zoneBody.setCircle(this.DETECTION_RADIUS);
    }

    setupInteraction(player: Player): void {
        this.scene.physics.add.overlap(
            player,
            this.detectionZone,
            () => {
                if (!this.isInteracting) {
                    this.isInteracting = true;
                    this.shopPanel.setVisible(true);

                    this.handleShop = (event: KeyboardEvent) => {
                        if (!this.scene) return;
                        
                        if (event.key === '1' && player.getCoins() >= 1) {
                            player.gainExperience(50);
                            player.addCoins(-10);
                            console.log('bought xp boost');
                        }
                        else if (event.key === '2' && player.getCoins() >= 1) {
                            player.heal(player.getMaxHealth());
                            player.addCoins(-15);
                            console.log('bought health restore');
                        }
                    };

                    window.addEventListener('keydown', this.handleShop);
                }
            }
        );

        this.scene.events.on('update', () => {
            if (this.scene && this.isInteracting && !this.scene.physics.overlap(player, this.detectionZone)) {
                this.cleanupInteraction();
            }
        });

        this.scene.events.once('shutdown', () => {
            this.cleanupInteraction();
        });
    }

    private cleanupInteraction(): void {
        this.isInteracting = false;
        if (this.handleShop) {
            window.removeEventListener('keydown', this.handleShop);
            this.handleShop = null;
        }
        if (this.shopPanel) {
            this.shopPanel.setVisible(false);
        }
    }

    destroy(): void {
        this.cleanupInteraction();
        if (this.shopPanel) {
            this.shopPanel.destroy();
        }
        if (this.detectionZone) {
            this.detectionZone.destroy();
        }
        super.destroy();
    }
} 