// var player = require('play-sound')(opts = {player: "omxplayer"})
var OmxManager = require('omx-manager');
const fileManager = require("../utils/FileManager");

class AudioManager {
    constructor(){
        this.audio_player;

        this.audio_playlist = [
            './assets/05.wav',
            './assets/04.wav',
            './assets/03.wav'
        ]
    
        this.audio_playlist_index = 0;
        this.manager = new OmxManager()

    }


    startPlaylist() {

    }

    playSingleAudio(id) {
        let audioList = fileManager.getAudio()
        let audio = audioList.find((au) => {
            return au.id === id;
        })

        if (audio) {
            // if(this.audio_player) {
            //     this.stopAudio();
            // } 

            this.audio_player = this.manager.create(`./assets/${audio.uri}`, {'-o': 'alsa'});
            this.audio_player.on('play', function() {
                let date = new Date()
                console.log('PLAY AUDIO', date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds())
            })
            this.audio_player.play()
            // this.audio_player = player.play(`./assets/${audio.uri}`), function (err) {
            //     if (err) throw err;
            //     console.log("Audio finished");

            // }
        }
    }

    loopSingleAudio(id) {
        let audioList = fileManager.getAudio()
        let audio = audioList.find((au) => {
            return au.id === id;
        })
        if (audio) {
            if(this.audio_player) {
                this.stopAudio();
            } 

            this.audio_player = this.manager.create(`./assets/${audio.uri}`, {'-o': 'alsa', '--loop': true});
            this.audio_player.play();
        }

    }

    stopAudio() {
        // if(this.audio_player) {
            this.audio_player.stop();
        // }
    }
}

module.exports = AudioManager;