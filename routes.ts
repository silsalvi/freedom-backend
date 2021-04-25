import express from "express";
import ytdl from "ytdl-core";
import YoutubeMusicApi from "youtube-music-api";
import cors from "cors";
import { YoutubeResponse } from "./models/youtube.model";
import { HttpError } from "./models/http-error.model";
import { YoutubeSearch } from "./models/advanced-search.model";

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
    const response = await youtube.search(req.body.name, "song");
    const results = response.content;
    res.status(200).send(
      results.map((res: any) => {
        const artist =
          Array.isArray(res.artist) && res.artist.length > 0
            ? res.artist[0].name
            : res.artist
            ? res.artist.name
            : null;
        return {
          titolo: res.name,
          id: res.videoId,
          artista: artist,
          thumbnail: res.thumbnails[1].url,
        };
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.options("/find-brani/advanced", cors());
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
      res.status(200).send(
        results.map((res: any) => {
          return {
            titolo: res.name,
            id: res.browseId,
            artista: res.artist,
            thumbnail: res.thumbnails[3] ? res.thumbnails[3].url : null,
          };
        })
      );
    }
    if (request.song) {
      response = await youtube.search(request.song, "song");
      const results = response.content;
      res.status(200).send(
        results.map((res: any) => {
          const artist =
            Array.isArray(res.artist) && res.artist.length > 0
              ? res.artist[0].name
              : res.artist
              ? res.artist.name
              : null;
          return {
            titolo: res.name,
            id: res.videoId,
            artista: artist,
            thumbnail: res.thumbnails[1].url,
          };
        })
      );
    }
    if (request.playlist) {
      response = await youtube.search(request.playlist, "playlist");
      const results = response.content;
      res.status(200).send(
        results.map((res: any) => {
          return {
            titolo: res.title,
            id: res.browseId,
            totalTrack: res.trackCount,
            thumbnail: res.thumbnails[3] ? res.thumbnails[3].url : null,
          };
        })
      );
    }
    if (request.artist) {
      response = await youtube.search(request.artist, "artist");
      const results = response.content;

      res.status(200).send(
        results.map((res: any) => {
          return {
            titolo: res.name,
            id: res.browseId,
            thumbnail: res.thumbnails[1] ? res.thumbnails[1].url : null,
          };
        })
      );
    }
    if (request.video) {
      response = await youtube.search(request.video, "video");
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
    }
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
    res.setTimeout(10000, () => {
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

router.get("/getPlaylist/:id", async (req, res) => {
  const id = req.params.id;
  await youtube.initalize();
  const response = await youtube.getPlaylist(id);
  console.log(response);
  const result = response.content;
  res.status(200).send(
    result.map((res: any) => {
      return {
        titolo: res.name,
        id: res.videoId,
        artista: res.author.name,
        thumbnail: res.thumbnails.url,
      };
    })
  );
});

router.get("/getAlbum/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  await youtube.initalize();
  const response = await youtube.getAlbum(id);
  const result = response.tracks;
  res.status(200).send(
    result.map((res: any) => {
      return {
        titolo: res.name,
        id: res.videoId,
        artista: res.artistNames,
        thumbnail: res.thumbnails[3] ? res.thumbnails[3].url : null,
      };
    })
  );
});

router.post("/getSongsByArtist", async (req, res) => {
  const name = req.body.name;
  await youtube.initalize();
  const response = await youtube.search(name, "song");
  const result = response.content;
  console.log(result);
  res.status(200).send(
    result.map((res: any) => {
      return {
        titolo: res.name,
        id: res.videoId,
        artista: name,
        thumbnail: res.thumbnails[0] ? res.thumbnails[0].url : null,
      };
    })
  );
});
export default router;
