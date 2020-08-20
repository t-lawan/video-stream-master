const csvFilePath = 'assets/test.csv'
const csv=require('csvtojson/v2')


class ScheduleManager {

    constructor() {
        this.screen_actions = [
            {
                action: 'END_SCHEDULE',
                pi_id: 1,
                payload: null,
                duration: 5000
            }
        ];

        this.screen_one_index = 0;
    }


    

    async loadCSV(){
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