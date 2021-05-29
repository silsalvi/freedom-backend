"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const youtube_music_api_1 = __importDefault(require("youtube-music-api"));
const songs_controller_1 = require("./songs.controller");
const youtube = new youtube_music_api_1.default();
const YOUTUBE_ENDPOINT = "http://www.youtube.com/watch?v=";
const router = express_1.default.Router();
const songController = songs_controller_1.SongController.getInstance();
let results = [];
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
router.post("/find-brani", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield youtube.initalize();
        const response = yield youtube.search(req.body.name, "song");
        const results = response.content;
        songController.extractSongFromResponse(results).then((response) => {
            res.status(200).send(response);
        });
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
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
router.post("/find-brani/advanced", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (Object.values(req.body).filter((val) => val).length > 1) {
            res.status(500).send("La ricerca ammette un solo campo alla volta.");
            return;
        }
        yield youtube.initalize();
        const request = req.body;
        let response = null;
        if (request.album) {
            response = yield youtube.search(request.album, "album");
            const results = response.content;
            res.status(200).send(songController.extractAlbumFromResponse(results));
        }
        if (request.song) {
            response = yield youtube.search(request.song, "song");
            const results = response.content;
            songController.extractSongFromResponse(results).then((response) => {
                res.status(200).send(response);
            });
        }
        if (request.playlist) {
            response = yield youtube.search(request.playlist, "playlist");
            const results = response.content;
            res.status(200).send(songController.extractPlaylistFromResponse(results));
        }
        if (request.artist) {
            response = yield youtube.search(request.artist, "artist");
            const results = response.content;
            songController.extractArtistFromResponse(results).then((data) => {
                res.status(200).send(data);
            });
        }
        if (request.video) {
            response = yield youtube.search(request.video, "video");
            results = response.content;
            res.status(200).send(songController.extractVideosFromResponse(results));
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
/**
 * A partire dal videoId recuperato dalle ricerche,
 * crea uno stream per il video scaricato con youtubedl.
 */
router.get("/video/:videoId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = YOUTUBE_ENDPOINT + req.params.videoId;
    try {
        res.setTimeout(60000, () => {
            const error = {
                message: "Il video non è disponibile",
                status: res.statusCode,
            };
            res.status(504).send(error);
        });
        const yt = ytdl_core_1.default(url, { quality: "highestaudio" });
        yt.pipe(res);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
/**
 * Endpoint che estrae i brani associati ad una playlist
 */
router.get("/getPlaylist/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    yield youtube.initalize();
    const response = yield youtube.getPlaylist(id);
    const results = response.content;
    res.status(200).send(songController.extractSongForPlaylist(results));
}));
/**
 * Endpoint che estrae i brani associati ad un album
 */
router.get("/getAlbum/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    yield youtube.initalize();
    const response = yield youtube.getAlbum(id);
    const results = response.tracks;
    res.status(200).send(songController.extractSongForAlbum(results));
}));
/**
 * Endpoint che estrae i brani associati ad un artista
 */
router.post("/getSongsByArtist", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.body.name;
    yield youtube.initalize();
    const response = yield youtube.search(name, "song");
    const results = response.content;
    songController.extractSongForArtist(results, name).then((data) => {
        res.status(200).send(data);
    });
}));
exports.default = router;
