import express from "express";
import ytdl from "ytdl-core";
import YoutubeMusicApi from "youtube-music-api";
import cors from "cors";
import { YoutubeResponse } from "./models/youtube.model";
import { HttpError } from "./models/http-error.model";

const youtube = new YoutubeMusicApi();
const YOUTUBE_ENDPOINT = "http://www.youtube.com/watch?v=";
const router = express.Router();

let results: YoutubeResponse[] = [];
/**
 * Endpoint per il log del servizio
 */
router.get("/", (req, res) => {
  res.status(200).sendFile(__dirname + "/index.html");
});

router.options("/find-brani", cors());
/**
 * Usa le API di youtube per cercare i video
 * per somiglianza con il nome del brano.
 */
router.post("/find-brani", async (req, res) => {
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

router.options("/video/:videoId", cors());
/**
 * A partire dal videoId recuperato dalle ricerche,
 * crea uno stream per il video scaricato con youtubedl.
 */
router.get("/video/:videoId", (req, res) => {
  const url = YOUTUBE_ENDPOINT + req.params.videoId;
  try {
    res.setTimeout(15000, () => {
      const error: HttpError = {
        message: "Il video non è disponibile",
        status: res.statusCode,
      };
      res.status(504).send(error);
    });
    ytdl(url, { quality: "lowest" }).pipe(res);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
