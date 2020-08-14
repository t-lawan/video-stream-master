const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const request = require("../utils/RequestManager");
const fileManager = require("../utils/FileManager");
const PORT = 8080;
const WebsocketClient = require('ws');
const EWSClientType = require('../utils/Enums').EWSClientType
const EWSMessageType = require('../utils/Enums').EWSMessageType

// Define WebSocketClient
let client = new WebsocketClient("wss://cs70esocmi.execute-api.us-east-1.amazonaws.com/dev/");

app.use(express.static(path.join(__dirname, "public")));

app.get("", (req, res) => {
  res.send("Hi");
});

app.get("/video/:videoId", function(req, res) {
  let videoId = req.params.videoId
  let videos = fileManager.getVideos();

  let video = videos.find((vid) => {
    return vid.id === videoId
  })

  const path = video ? `assets/${video.uri}` : `assets/${video[0].uri}`;
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

function websocketOpen(r) {
  console.log('onOpen', r);
  let message = JSON.stringify({
    client_type: EWSClientType.MASTER,
    message: EWSMessageType.INITIALISE,
    raspberry_pi_id: 1
  });
  client.send(message)
}

function websocketClose() {
  console.log('onClose')
}

function websocketMessage(e) {
  console.log('onMessage')
  if (typeof e.data === 'string') {
    let message = JSON.parse(e.data);

    switch(message.message) {
      case EWSMessageType.START_AUDIO:
        console.log('PLAY AUDIO');
        break;
      case EWSMessageType.START_SCHEDULE:
        console.log('START SCHEDULE');
        break;
    }
    if(message.message === EWSMessageType.START_PLAYLIST)
    console.log("Received: '" + e.data + "'");
  }
}

function setClientFunctions() {
  client.onopen = websocketOpen;
  client.onclose = websocketMessage;
  client.onmessage = websocketClose;
}



app.listen(PORT, async () => {
  console.log("Listening on port: " + PORT);
  let response = await request.getVideos();
  let videos = response.data.data;
  console.log('VIDEOS', videos)
  fileManager.storeVideos(videos);
  setClientFunctions();
});

