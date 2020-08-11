const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const request = require("../utils/RequestManager");
const fileManager = require("../utils/FileManager");
const PORT = 8080;

app.use(express.static(path.join(__dirname, "public")));

app.get("", (req, res) => {
  res.send("Hi");
});

// Add dummy video to assets folder
//

app.get("/video", function(req, res) {
  const path = "assets/vid_01.mp4";
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  let videos = fileManager.getVideos();

  console.log('VIDEOS', videos)

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

app.listen(PORT, async () => {
  console.log("Listening on port: " + PORT);
  let response = await request.getVideos();
  let videos = response.data.data;
  fileManager.storeVideos(videos);
});
