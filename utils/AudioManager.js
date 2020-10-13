// var player = require('play-sound')(opts = {player: "omxplayer"})
var OmxManager = require("omx-manager");
const fileManager = require("../utils/FileManager");

class AudioManager {
  constructor() {
    this.audio_player;

    this.audio_playlist = [
      "./assets/05.wav",
      "./assets/04.wav",
      "./assets/03.wav"
    ];

    this.audio_playlist_index = 0;
    this.manager = new OmxManager();
  }

  startPlaylist() {}

  playSingleAudio(uri) {
    // let audioList = fileManager.getAudio();
    // let audio = audioList.find(au => {
    //   return au.id === id;
    // });

    // if (audio) {
      if (this.audio_player) {
        this.stopAudio();
      }

      this.audio_player = this.manager.create(`./assets/${uri}.wav`, {
        "-o": "alsa"
      });
      this.audio_player.play();
    // }
  }

  loopSingleAudio() {
    if (this.audio_player) {
      this.stopAudio();
    }

    this.audio_player = this.manager.create(`./assets/INTERMISSION_AUDIO.wav`, {
      "-o": "alsa",
      "--loop": true
    });
    this.audio_player.play();

  }

  stopAudio() {
    // if(this.audio_player) {
    this.audio_player.stop();
    // }
  }
}

module.exports = AudioManager;
