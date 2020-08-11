const fs = require('fs');
class FileManager {
    static storeVideos(videos) {
        let text = JSON.stringify(videos)
        fs.writeFile('assets/video.json', text, (err) => {
            if(err) {
                console.log('File failed to write');
            }
        })
    }

    static getVideos() {
        let response = "[]";
        response = fs.readFileSync('assets/video.json', 'utf8')
        
        return JSON.parse(response);
    }
}

module.exports = FileManager;