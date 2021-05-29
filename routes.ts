import express from "express";
import ytdl from "ytdl-core";
import YoutubeMusicApi from "youtube-music-api";
import { YoutubeResponse } from "./models/youtube.model";
import { HttpError } from "./models/http-error.model";
import { YoutubeSearch } from "./models/advanced-search.model";
import { SongController } from "./songs.controller";

const youtube = new YoutubeMusicApi();
const YOUTUBE_ENDPOINT = "http://www.youtube.com/watch?v=";
const router = express.Router();
const songController = SongController.getInstance();
let results: YoutubeResponse[] = [];

/**
 * Endpoint per restituire la pagina html di redirect all'app di frontend.
 */
router.get("/", (req, res) => {
  res.status(200).sendFile(__dirname + "/index.html");
});

/**
 * Usa le API di youtube per cercare i video
 * per somiglianza con il nome del brano.
 */
router.post("/find-brani", async (req, res) => {
  try {
    await youtube.initalize();
    const response = await youtube.search(req.body.name, "song");
    const results = response.content;
    songController.extractSongFromResponse(results).then((response) => {
      res.status(200).send(response);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Endpoint per la ricerca avanzata.
 * A seconda di cosa viene passato come parametro,
 * Interroga l'API di Youtube per ottenere i campi specifici.
 * I campi disponibili sono:
 *      -canzone,
 *      -video,
 *      -album,
 *      -playlist,
 *      -artista
 */
router.post("/find-brani/advanced", async (req, res) => {
  try {
    if (Object.values(req.body).filter((val) => val).length > 1) {
      res.status(500).send("La ricerca ammette un solo campo alla volta.");
      return;
    }
    await youtube.initalize();
    const request: YoutubeSearch = req.body;
    let response = null;

    if (request.album) {
      response = await youtube.search(request.album, "album");
      const results = response.content;
      res.status(200).send(songController.extractAlbumFromResponse(results));
    }

    if (request.song) {
      await youtube.initalize();
      response = await youtube.search(request.song, "song");
      const results = response.content;
      songController.extractSongFromResponse(results).then((response) => {
        res.status(200).send(response);
      });
    }

    if (request.playlist) {
      response = await youtube.search(request.playlist, "playlist");
      const results = response.content;
      res.status(200).send(songController.extractPlaylistFromResponse(results));
    }

    if (request.artist) {
      response = await youtube.search(request.artist, "artist");
      const results = response.content;
      songController.extractArtistFromResponse(results).then((data) => {
        res.status(200).send(data);
      });
    }

    if (request.video) {
      response = await youtube.search(request.video, "video");
      results = response.content;
      res.status(200).send(songController.extractVideosFromResponse(results));
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

/**
 * A partire dal videoId recuperato dalle ricerche,
 * crea uno stream per il video scaricato con youtubedl.
 */
router.get("/video/:videoId", async (req, res) => {
  const url = YOUTUBE_ENDPOINT + req.params.videoId;
  try {
    res.setTimeout(60000, () => {
      const error: HttpError = {
        message: "Il video non è disponibile",
        status: res.statusCode,
      };
      res.status(504).send(error);
    });
    const yt = ytdl(url, { quality: "highestaudio" });
    yt.once("end", () => {
      res;
    });
    yt.pipe(res);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Endpoint che estrae i brani associati ad una playlist
 */
router.get("/getPlaylist/:id", async (req, res) => {
  const id = req.params.id;
  await youtube.initalize();
  const response = await youtube.getPlaylist(id);
  const results = response.content;
  res.status(200).send(songController.extractSongForPlaylist(results));
});

/**
 * Endpoint che estrae i brani associati ad un album
 */
router.get("/getAlbum/:id", async (req, res) => {
  const id = req.params.id;
  await youtube.initalize();
  const response = await youtube.getAlbum(id);
  const results = response.tracks;
  res.status(200).send(songController.extractSongForAlbum(results));
});

/**
 * Endpoint che estrae i brani associati ad un artista
 */
router.post("/getSongsByArtist", async (req, res) => {
  const name = req.body.name;
  await youtube.initalize();
  const response = await youtube.search(name, "song");
  const results = response.content;
  songController.extractSongForArtist(results, name).then((data) => {
    res.status(200).send(data);
  });
});

export default router;
