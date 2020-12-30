import express from "express";
import cors from "cors";
import fs from "fs";
import YoutubeMusicApi from "youtube-music-api";
import { YoutubeResponse } from "./models/youtube.model";
import youtubedl from "youtube-dl";
import path from "path";

const app = express();
app.use(express.json());
app.use(cors());
const youtube = new YoutubeMusicApi();
const YOUTUBE_ENDPOINT = "http://www.youtube.com/watch?v=";
const port = process.env.PORT || 5000;
let results: YoutubeResponse[] = [];

/**
 * Endpoint per il log del servizio
 */
app.get("/", (req, res) => {
  res.status(200).send("Mi sono avviato...");
});

/**
 * Usa le API di youtube per cercare i video
 * per somiglianza con il nome del brano.
 */
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

/**
 * A partire dal videoId recuperato dalle ricerche,
 * crea uno stream temporaneo per il video scaricato con youtubedl.
 * Successivamente apre un sottoprocesso in cui avvia uno script python
 * per la conversione del video in un file mp3.
 * Infine restituisce il file mp3 appena creato e cancella tutti i tmp.
 */
app.get("/video/:videoId", async (req, res) => {
  const url = YOUTUBE_ENDPOINT + req.params.videoId;
  const pathFile = path.join(__dirname, "../", req.params.videoId + ".mp4");
  try {
    youtubedl(url, ["--format=18"], { cwd: __dirname })
      .pipe(fs.createWriteStream(req.params.videoId + ".mp4", { flags: "a+" }))
      .on("close", () => {
        res.sendFile(pathFile, () => {
          fs.unlinkSync(req.params.videoId + ".mp4");
        });
      });
  } catch (error) {
    res.status(500).send(error);
  }
});
app.listen(port, () => {
  console.log("In ascolto sulla porta " + port);
});
