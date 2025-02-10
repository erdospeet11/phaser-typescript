export class MusicScene extends Phaser.Scene {
    private music?: Phaser.Sound.BaseSound;

    constructor() {
        super({ key: 'MusicScene' });
    }

    preload() {
        this.load.audio('background-music', 'assets/background-music.mp3');
    }

    create() {
        this.music = this.sound.add('background-music', {
            loop: true,
            volume: 0.5
        });
        this.music.play();
    }

    setVolume(volume: number) {
        if (this.music) {
            (this.music as Phaser.Sound.WebAudioSound).setVolume(volume);
        }
    }

    destroy() {
        if (this.music) {
            this.music.destroy();
        }
    }
}