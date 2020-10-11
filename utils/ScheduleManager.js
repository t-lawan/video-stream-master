const testCSV = 'assets/test.csv'
const realCSV = 'assets/real.csv'
const FileManager = require('./FileManager.js')
const csv = require('csvtojson/v2');
const { EWSMessageType } = require('./Enums');


const AudioMap = {
    'ac02c792-0b72-46a0-a909-c015cbd94be8': 460, //1_intro_audio
    'b155dd1c-3889-435a-8b63-402a8aa9c96c': 460, //1_intro_audio
    '09263068-0ee3-4a00-b6b5-938dced2b4f9': 460, //2_B1_audio
    '40d84d09-821c-4c4c-9b87-2c2f73b08b14': 420, //3_Sc1_audio
    'b0eba59e-2b62-4310-970e-a17821e9b62c': 420, //4_B2_audio   
    '5b6269ec-7e96-47a6-b4d5-2e3d731fed61': 420, //5_Sc2_audio
    '64158e24-a306-41c3-a651-545d7314c14b': 420, //6_B3_audio



    '500bb964-7ff0-423d-8dec-1f363cdf1d48': 460, //3_4_Sc1andBC2v2
    'eefae783-0c0f-4915-a9b2-9b4c7bc21ff5': 460, // 3_4_Sc1andBC2v3
    '80322349-0700-4df8-995d-27f0944694dd': 460, //5_Sc2
    '4ae17eca-a725-4c4b-9018-a91c169f72b2': 460, // 2_Broadcast1_audio
    'e1389bcc-ae81-4f56-84d9-7564cd43abd8': 460, //3_4_Sc1andBC2

}

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
                    TIMECODE: (parseInt(screenAction.TIMECODE)) + (AudioMap[screenAction['PAYLOAD']] ? AudioMap[screenAction['PAYLOAD']] : 460)
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