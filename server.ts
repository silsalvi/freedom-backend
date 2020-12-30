import express from "express";
import cors from "cors";
import fs from "fs";
import YoutubeMusicApi from "youtube-music-api";
import { YoutubeResponse } from "./models/youtube.model";
import youtubedl from "youtube-dl";
import path from "path";
import { spawn } from "child_process";
const app = express();
app.use(express.json());
app.use(cors());
const youtube = new YoutubeMusicApi();
const YOUTUBE_ENDPOINT = "http://www.youtube.com/watch?v=";
const port = process.env.PORT || 5000;
let results: YoutubeResponse[] = [];
app.get("/", (req, res) => {
  res.status(200).send("Mi sono avviato...");
});

app.post("/find-brani", async (req, res) => {
  try {
    await youtube.initalize();
    const response = await youtube.search(req.body.name, "video");
    results = response.content;
    res.status(200).send(
      results.map((res) => {
        return {
          titolo: res.name,
          id: res.videoId,
          artista: res.author,
          thumbnail: res.thumbnails.url,
        };
      })
    );
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/video/:videoId", async (req, res) => {
  const url = YOUTUBE_ENDPOINT + req.params.videoId;
  const convPath = path.join(__dirname, "../", req.params.videoId + ".mp3");
  try {
    youtubedl(url, ["--format=18"], { cwd: __dirname })
      .pipe(fs.createWriteStream(req.params.videoId + ".mp4", { flags: "a+" }))
      .on("close", () => {
        const process = spawn("py", [
          "converter.py",
          req.params.videoId + ".mp4",
        ]);
        process.on("exit", (code) => {
          console.log(
            `file con id ${req.params.videoId} convertito correttamente `
          );
          if (code === 0)
            res.sendFile(convPath, () => {
              fs.unlinkSync(req.params.videoId + ".mp4");
              fs.unlinkSync(req.params.videoId + ".mp3");
            });
        });
      });
  } catch (error) {
    res.status(500).send(error);
  }
});
app.listen(port, () => {
  console.log("In ascolto sulla porta " + port);
});
