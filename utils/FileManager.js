const fs = require('fs');

const SCREEN = 'screen';
const SCHEDULE_ = 'schedule';
const VIDEO = 'video'
const AUDIO = 'audio'
class FileManager {
    static storeVideos(videos) {
        FileManager.store(VIDEO, videos)
    }

    static storeScreens(screens) {
        FileManager.store(SCREEN, screens)
    }

    static storeSchedule(schedule) {
        FileManager.store(SCHEDULE_, schedule)
    }

    static storeAudio(audioList) {
        FileManager.store(AUDIO, audioList)
    }

    static getVideos() {
        return FileManager.get(VIDEO);
    }

    static getScreens() {
        return FileManager.get(SCREEN);
    }

    static getSchedule() {
        return FileManager.get(SCHEDULE_);
    }

    static getAudio() {
        return FileManager.get(AUDIO);
    }

    static store(title, objects) {
        let text = JSON.stringify(objects)
        fs.writeFile(`assets/${title}.json`, text, (err) => {
            if(err) {
                console.log('File failed to write');
            }
        }) 
    }

    static get(title) {
        let response = "[]";
        response = fs.readFileSync(`assets/${title}.json`, 'utf8')
        return JSON.parse(response);
    }

}

module.exports = FileManager;