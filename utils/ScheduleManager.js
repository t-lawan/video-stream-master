const testCSV = 'assets/test.csv'
const realCSV = 'assets/real.csv'
const FileManager = require('./FileManager.js')
const csv = require('csvtojson/v2');
const { EWSMessageType } = require('./Enums');


class ScheduleManager {

    constructor() {
        this.screen_actions = [];

        this.screen_one_index = 0;
        this.current_time = 0;
        this.clock;
        this.performAction;
        this.is_running = false;
    }


    load(schedule) {

        // let schedule = FileManager.getSchedule();
        this.screen_actions = this.transformSchedule(schedule);
    }

    transformSchedule(schedule) {
        let screenActions = schedule.map(function (screenAction, index) {

            if(screenAction.ACTION === "STOP_VIDEO") {
                screenAction = {
                    ...screenAction,
                    PAYLOAD: '782b91f0-28a2-41a0-8289-8ca8de9ba077',
                    ACTION: EWSMessageType.START_VIDEO
                }
            }

            let newAction = {
                ...screenAction,
                TIMECODE: (parseInt(screenAction.TIMECODE)) + 1000
            }
            if(screenAction.ACTION === "START_AUDIO") {
                newAction = {
                    ...screenAction, 
                    TIMECODE: (parseInt(screenAction.TIMECODE)) + 460
                }
            } 

            return newAction;
        })

        let timeCodes = screenActions.map((action) => {
            return parseInt(action.TIMECODE)
        })
        

        screenActions.push({
            ACTION: EWSMessageType.STOP_SCHEDULE,
            RPI_ID: 0,
            PAYLOAD: null,
            TIMECODE: Math.max(...timeCodes) + 1000
        })

        return screenActions
    }


    start(callback) {
        if(!this.is_running) {
            this.is_running = true;
            this.performAction = callback
            this.clock = setInterval(this.sendCalls.bind(this), 20)
        }
    }

    sendCalls() {
        let currentActions = this.screen_actions.filter((action) => {
            return action.TIMECODE == this.current_time 
        })

        if(currentActions.length > 0) {

            let startAudioActionExists = currentActions.find((audio) => {
                return audio.ACTION === EWSMessageType.START_AUDIO;
            })

            if(startAudioActionExists) {
                currentActions = currentActions.sort((a, b) => {
                    if(a.ACTION === EWSMessageType.START_AUDIO) {
                        return +1;
                    } else if(b.ACTION === EWSMessageType.START_AUDIO) {
                        return -1;
                    } else {
                        return 0;
                    }
                })

            }

            currentActions.forEach((action) => {
                this.performAction(action);
                if(action.ACTION === EWSMessageType.STOP_SCHEDULE) {
                    this.stop();
                }
            })
        }
        this.current_time = this.current_time + 20;
    }

    stop() {
        clearInterval(this.clock);
        this.clock = null;
        this.current_time = 0;
        this.is_running = false;
    }
}

module.exports = ScheduleManager;