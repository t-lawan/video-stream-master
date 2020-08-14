const axios = require('axios')
class RequestManager {

    static async getVideos() {
        return await this.get(`https://v2lu4dcv0l.execute-api.us-east-1.amazonaws.com/dev/videos`);
    }

    static async getScreens() {
        return await this.get(`https://v2lu4dcv0l.execute-api.us-east-1.amazonaws.com/dev/screens`);
    }


    static async get (url) {
        let config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }       
        return await axios.get(url, config);
    }

    static async post (url, data) {
        const d = JSON.stringify(data); 
        let config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }                                                                                      
        return await axios.post(url, d, config);
    }
}

module.exports = RequestManager;