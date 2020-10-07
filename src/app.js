const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const RequestManager = require("../utils/RequestManager");
const ScheduleManager = require("../utils/ScheduleManager");
const fileManager = require("../utils/FileManager");
const net = require('net');

const PORT = 8080;
const WebsocketClient = require('ws');
const AudioManager = require("../utils/AudioManager");
const EWSClientType = require('../utils/Enums').EWSClientType
const EWSMessageType = require('../utils/Enums').EWSMessageType


app.use(express.static(path.join(__dirname, "public")));

app.get("", (req, res) => {
  res.send("Hi");
});






// Define WebSocketClient
let client;
let scheduleManager = new ScheduleManager();
let audioManager = new AudioManager();
app.get("/video/:videoId", function(req, res) {
  let videoId = req.params.videoId
  let videos = fileManager.getVideos();

  let video = videos.find((vid) => {
    return vid.id === videoId
  })

  const path = video ? `assets/${video.uri}` : `assets/${videos[0].uri}`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res
        .status(416)
        .send("Requested range not satisfiable\n" + start + " >= " + fileSize);
      return;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4", 
      "Access-Control-Allow-Origin": "*"
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4"
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});
app.get('/schedule', async function(req, res) {
  let actions = await scheduleManager.getCSV()
  res.send(JSON.stringify(actions));
})

function onWebsocketOpen(r) {
  console.log('onOpen');
  initialiseWebsocketOpen()
}

/**
 * This function sends a message with details to the Websocket server on initalising
 *
 */
function initialiseWebsocketOpen() {
  let message = JSON.stringify({
    client_type: EWSClientType.MASTER,
    message: EWSMessageType.INITIALISE,
    raspberry_pi_id: 1
  });

  client.send(message, function (err){
   // onStartUp()

    if(err) {
      setTimeout(() => {
        initialiseWebsocketOpen();
      }, 500);
    } else {
     // onStartUp()
    //  startVideoOnDisplayPis()

    }
  });
}

/**
 *
 *
 */
function onWebsocketClose() {
  console.log('onClose')
  // Restart the websocket connection
  setTimeout(function(){
    setClientFunctions();
  }, 1000)
}

/**
 * This function handles incoming messages from websocket server
 *
 * @param {*} e
 */
async function onWebsocketMessage(r) {
  // console.log('onMessage')
  if (typeof r.data === 'string') {
    let message = JSON.parse(r.data);
    switch(message.message) {
      case EWSMessageType.START_AUDIO:
        console.log('START_AUDIO');
        let id = message.payload;
        // audioManager.playSingleAudio(id);
        break;
      case EWSMessageType.START_AUDIO_PLAYLIST:
        audioManager.playAudio()
        // console.log('START_AUDIO');
      case EWSMessageType.START_SCHEDULE:
        console.log('START_SCHEDULE');
        scheduleManager.start(performAction);
        break;
      case EWSMessageType.STOP_SCHEDULE:
        console.log('STOP_SCHEDULE');
        // startVideoOnDisplayPis();
        // await scheduleManager.loadCSV();
        // let ac = {
        //   ACTION: EWSMessageType.START_SCHEDULE,
        //   raspberry_pi_id: 0,
        //   payload: ''
        // }
        // setTimeout(() => {
        //   performAction(ac)
        // }, 5000)
        break;
      default:
        // console.log('THIS IS OKAY');
        break;
    }
  }
}

/**
 * This function sets the client onopen, onclose, onmessage functions
 *
 */
function setClientFunctions() {
  client = new WebsocketClient("wss://cs70esocmi.execute-api.us-east-1.amazonaws.com/dev/")
  client.onopen = onWebsocketOpen;
  client.onclose = onWebsocketClose;
  client.onmessage = onWebsocketMessage;
}

/**
 * This function sends the initial requests to start process.
 *
 */
function onStartUp() {
  startAudioOnMaster()
  startAudioOnAdmin()
}

/**
 * This function sends a message via Websockets to start the audio on the master Raspberry Pi
 *
 */
function startAudioOnMaster() {
  let masterAudioMessage = JSON.stringify({
    client_type: EWSClientType.MASTER,
    message: EWSMessageType.START_AUDIO,
    raspberry_pi_id: 1,
    payload: 'ada4f2fd-1a6e-4688-bbf9-e20aadda5435'
  });

  client.send(masterAudioMessage, function (err){
    if(err) {
      setTimeout(() => {
        startAudioOnMaster()
      }, 500);
    }
  })
}

/**
 * This function sends a message via Websockets to start the audio on the React admin site
 *
 */
function startAudioOnAdmin() {
  let adminAudioMessage = JSON.stringify({
    client_type: EWSClientType.ADMIN,
    message: EWSMessageType.START_AUDIO,
    raspberry_pi_id: 0
  });

  client.send(adminAudioMessage, function (err){
    if(err) {
      setTimeout(() => {
        startAudioOnAdmin()
      }, 500);
    }
  })
}

function startVideoOnDisplayPis() {
  let startAllDisplays = JSON.stringify({
    client_type: EWSClientType.ADMIN,
    message: EWSMessageType.START_ALL_DISPLAYS,
    raspberry_pi_id: 0
  });

  client.send(startAllDisplays)
}

/**
 * Makes request to get videos then stores in video.json
 *
 */
async function storeVideosInJSONFile() {
  let response = await RequestManager.getVideos();
  let videos = response.data.data;
  // console.log('VIDEOS', videos)
  fileManager.storeVideos(videos);
}

/**
 * Makes request to get videos then stores in video.json
 *
 */
async function storeScreensInJSONFile() {
  let response = await RequestManager.getScreens();
  let screens = response.data.data;
  // console.log('SCREENS', screens)
  fileManager.storeScreens(screens);
}

/**
 * Makes request to get videos then stores in video.json
 *
 */
async function storeAudioInJSONFile() {
  let response = await RequestManager.getAudio();
  let audio = response.data.data;
  fileManager.storeAudio(audio);
}

function performAction(action) {
  let message = JSON.stringify({
    client_type: EWSClientType.DISPLAY,
    message: action.ACTION,
    raspberry_pi_id: action.RPI_ID,
    payload: action.PAYLOAD
  });

  sendMessageToDisplay(message)

  // client.send(message);
}

const IPMAP = {
  '1' : '10',
  '2' : '20',
  '3' : '30',
  '4' : '40',
  '5' : '50',
  '6' : '60',
  '7' : '70',
}

function sendMessageToDisplay(message) {
  let ip = '40';
  console.log('MESSAGE', message);
  // let socketClient = net.createConnection({
  //   host: `http://10.0.0.${IPMAP[ip]}`,
  //   port: '1234'
  // }, function() {
  //   socketClient.write(message);
  //   socketClient.end();
  // })
}



app.listen(PORT, async () => {
  console.log("Listening on port: " + PORT);
  await storeVideosInJSONFile();
  await storeScreensInJSONFile();
  await storeAudioInJSONFile();
  setClientFunctions();
  await scheduleManager.loadCSV();

  // setTimeout(function() {
  // }, 2000)
});



