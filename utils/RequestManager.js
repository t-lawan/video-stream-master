const axios = require('axios')
class RequestManager {
    static baseUrl = 'http://localhost:3000/dev'

    static async getVideos() {
        return await this.get(`${this.baseUrl}/videos`);
    }


    static get = async (url) => {
        let config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }       
        return await axios.get(url, config);
    }

    static post = async (url, data) => {
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