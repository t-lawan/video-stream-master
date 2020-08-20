const csvFilePath = 'assets/test.csv'
const csv=require('csvtojson/v2')


class ScheduleManager {

    constructor() {
        this.screen_actions = [
            {
                action: 'BABA',
                pi_id: 1,
                payload: null,
                duration: 1000
            },
            {
                action: 'START_VIDEO',
                pi_id: 1,
                payload: null,
                duration: 5000
            },
            {
                action: 'START_STREAM',
                pi_id: 1,
                payload: null,
                duration: 2000
            },
            {
                action: 'STOP_STREAM',
                pi_id: 1,
                payload: null,
                duration: 7000
            },
            {
                action: 'END',
                pi_id: 1,
                payload: null,
                duration: 5000
            }
        ];
    }


    screen_one_index = 0;

    async loadCSV(){
        const jsonArray= await csv().fromFile(csvFilePath);
    }

    mapCSV(screenActions) {
        this.screen_actions = screenActions.map((screenAction, index), {
            return {
                ...screenAction,
                TIMECODE: parseInt(screenAction.TIMECODE) * 1000
            }
        })
        console.log(1, this.screen_actions);
    }

    start(){
        let time = 0;
        if(this.screen_one_index > 0) {
            time = this.screen_actions[this.screen_one_index - 1].duration
        }

        setTimeout(() => {
            this.sendCall();
        }, time)
    }

    sendCall(){
        this.screen_one_index = this.screen_one_index + 1;
        console.log(this.screen_actions[this.screen_one_index - 1].action)

        if(!this.isLastItem()) {
            this.start()
        }
    }

    isLastItem() {
        return this.screen_one_index + 1 === this.screen_actions.length;
    }
}

module.exports = ScheduleManager;