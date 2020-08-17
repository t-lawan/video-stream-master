
class ScheduleManager {
    screen_one = [
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
            duration: 5000
        },
        {
            action: 'STOP_STREAM',
            pi_id: 1,
            payload: null,
            duration: 5000
        },
        {
            action: 'END',
            pi_id: 1,
            payload: null,
            duration: 5000
        }
    ];

    screen_one_index = 0;

    start(){
        let time = 0;
        if(this.screen_one_index > 0) {
            time = this.screen_one[this.screen_one_index - 1].duration
        }

        setTimeout(() => {
            this.sendCall();
        }, time)
    }

    sendCall(){
        this.screen_one_index = this.screen_one_index + 1;
        console.log(this.screen_one[this.screen_one_index - 1].action)

        if(!this.isLastItem()) {
            this.start()
        }
    }

    isLastItem() {
        return this.screen_one_index + 1 === this.screen_one.length;
    }
}

module.exports = ScheduleManager;