const csvFilePath = 'assets/test.csv'
const csv = require('csvtojson/v2');
const { EWSMessageType } = require('./Enums');


class ScheduleManager {

    constructor() {
        this.screen_actions = [];

        this.screen_one_index = 0;
        this.current_time = 0;
        this.clock;
    }


    async loadCSV() {
        const jsonArray = await csv().fromFile(csvFilePath);
        this.mapCSV(jsonArray);
    }

    mapCSV(screenActions) {
        this.screen_actions = screenActions.map(function (screenAction, index) {
            return {
                ...screenAction,
                TIMECODE: parseInt(screenAction.TIMECODE) * 1000
            }
        })

        let timeCodes = this.screen_actions.map((action) => {
            return parseInt(action.TIMECODE)
        })

        this.screen_actions.push({
            ACTION: 'END_SCHEDULE',
            RPI_ID: 1,
            PAYLOAD: null,
            TIMECODE: Math.max(...timeCodes) + 1000
        })

    }

    start() {
        this.clock = setInterval(this.sendCalls.bind(this), 1000)
    }

    sendCalls() {
        let currentActions = this.screen_actions.filter((action) => {
            return action.TIMECODE == this.current_time 
        })
        if(currentActions.length > 0) {
            currentActions.forEach((action) => {
                console.log('ACTION', action)
                if(action.ACTION === EWSMessageType.STOP_SCHEDULE) {
                    clearInterval(this.clock)
                }

            })
        }
        this.current_time = this.current_time + 1000;
    }
}

module.exports = ScheduleManager;