const EWSClientType =  {
    ADMIN: "ADMIN",
    DISPLAY: "DISPLAY",
    MASTER: "MASTER" 
}
const EWSMessageType =  {
    INITIALISE: 'INITIALISE',
    START_STREAM: 'START_STREAM',
    STOP_STREAM: 'STOP_STREAM',
    START_PLAYLIST: 'START_PLAYLIST',
    STOP_PLAYLIST: 'STOP_PLAYLIST',
    START_SCHEDULE: 'START_SCHEDULE',
    START_AUDIO: 'START_AUDIO'
}

module.exports = {
    EWSClientType,
    EWSMessageType
}