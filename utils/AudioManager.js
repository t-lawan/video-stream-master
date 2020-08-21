var player = require('play-sound')(opts = {})

class AudioManager {

    audio_player;

    audio_playlist = [
        './assets/05.wav',
        './assets/04.wav',
        './assets/03.wav'
    ]

    audio_playlist_index = 0;

    startPlaylist() {

    }
    playAudio() {
        this.audio_player = player.play(this.audio_playlist[this.audio_playlist_index], function (err) {
            if (err) throw err;
            console.log("Audio finished");
            if (this.audio_playlist_index + 1 >= this.audio_playlist.length) {
                this.audio_playlist_index = 0;
            }
            else {
                this.audio_playlist_index++;
            }
            stopAudio();

            this.playAudio();
        });
    }
    stopAudio() {
        this.audio_player.kill();
    }
}

module.exports = AudioManager;