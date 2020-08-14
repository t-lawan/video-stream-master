const fs = require('fs');

const SCREEN = 'screen';
const VIDEO = 'video'
class FileManager {
    static storeVideos(videos) {
        FileManager.store(VIDEO, videos)
    }

    static storeScreens(screens) {
        FileManager.store(SCREEN, screens)
    }

    static getVideos() {
        return FileManager.get(VIDEO);
    }

    static getScreens() {
        return FileManager.get(SCREEN);
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