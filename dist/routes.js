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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var ytdl_core_1 = __importDefault(require("ytdl-core"));
var youtube_music_api_1 = __importDefault(require("youtube-music-api"));
var cors_1 = __importDefault(require("cors"));
var youtube = new youtube_music_api_1.default();
var YOUTUBE_ENDPOINT = "http://www.youtube.com/watch?v=";
var router = express_1.default.Router();
var results = [];
/**
 * Endpoint per il log del servizio
 */
router.get("/", function (req, res) {
    res.status(200).sendFile(__dirname + "/index.html");
});
router.options("/find-brani", cors_1.default());
/**
 * Usa le API di youtube per cercare i video
 * per somiglianza con il nome del brano.
 */
router.post("/find-brani", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var response, results_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, youtube.initalize()];
            case 1:
                _a.sent();
                return [4 /*yield*/, youtube.search(req.body.name, "song")];
            case 2:
                response = _a.sent();
                results_1 = response.content;
                res.status(200).send(results_1.map(function (res) {
                    var artist = Array.isArray(res.artist) && res.artist.length > 0
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
                }));
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.log(error_1);
                res.status(500).send(error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.options("/find-brani/advanced", cors_1.default());
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
router.post("/find-brani/advanced", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var request, response, results_2, results_3, results_4, results_5, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 12, , 13]);
                if (Object.values(req.body).filter(function (val) { return val; }).length > 1) {
                    res.status(500).send("La ricerca ammette un solo campo alla volta.");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, youtube.initalize()];
            case 1:
                _a.sent();
                request = req.body;
                response = null;
                if (!request.album) return [3 /*break*/, 3];
                return [4 /*yield*/, youtube.search(request.album, "album")];
            case 2:
                response = _a.sent();
                results_2 = response.content;
                res.status(200).send(results_2.map(function (res) {
                    return {
                        titolo: res.name,
                        id: res.browseId,
                        artista: res.artist,
                        thumbnail: res.thumbnails[3] ? res.thumbnails[3].url : null,
                    };
                }));
                _a.label = 3;
            case 3:
                if (!request.song) return [3 /*break*/, 5];
                return [4 /*yield*/, youtube.search(request.song, "song")];
            case 4:
                response = _a.sent();
                results_3 = response.content;
                res.status(200).send(results_3.map(function (res) {
                    var artist = Array.isArray(res.artist) && res.artist.length > 0
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
                }));
                _a.label = 5;
            case 5:
                if (!request.playlist) return [3 /*break*/, 7];
                return [4 /*yield*/, youtube.search(request.playlist, "playlist")];
            case 6:
                response = _a.sent();
                results_4 = response.content;
                res.status(200).send(results_4.map(function (res) {
                    return {
                        titolo: res.title,
                        id: res.browseId,
                        totalTrack: res.trackCount,
                        thumbnail: res.thumbnails[3] ? res.thumbnails[3].url : null,
                    };
                }));
                _a.label = 7;
            case 7:
                if (!request.artist) return [3 /*break*/, 9];
                return [4 /*yield*/, youtube.search(request.artist, "artist")];
            case 8:
                response = _a.sent();
                results_5 = response.content;
                res.status(200).send(results_5.map(function (res) {
                    return {
                        titolo: res.name,
                        id: res.browseId,
                        thumbnail: res.thumbnails[1] ? res.thumbnails[1].url : null,
                    };
                }));
                _a.label = 9;
            case 9:
                if (!request.video) return [3 /*break*/, 11];
                return [4 /*yield*/, youtube.search(request.video, "video")];
            case 10:
                response = _a.sent();
                results = response.content;
                res.status(200).send(results.map(function (res) {
                    return {
                        titolo: res.name,
                        id: res.videoId,
                        artista: res.author,
                        thumbnail: res.thumbnails.url,
                    };
                }));
                _a.label = 11;
            case 11: return [3 /*break*/, 13];
            case 12:
                error_2 = _a.sent();
                res.status(500).send(error_2);
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); });
router.options("/video/:videoId", cors_1.default());
/**
 * A partire dal videoId recuperato dalle ricerche,
 * crea uno stream per il video scaricato con youtubedl.
 */
router.get("/video/:videoId", function (req, res) {
    var url = YOUTUBE_ENDPOINT + req.params.videoId;
    try {
        res.setTimeout(10000, function () {
            var error = {
                message: "Il video non è disponibile",
                status: res.statusCode,
            };
            res.status(504).send(error);
        });
        ytdl_core_1.default(url, { quality: "lowest" }).pipe(res);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
router.get("/getPlaylist/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, response, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, youtube.initalize()];
            case 1:
                _a.sent();
                return [4 /*yield*/, youtube.getPlaylist(id)];
            case 2:
                response = _a.sent();
                console.log(response);
                result = response.content;
                res.status(200).send(result.map(function (res) {
                    return {
                        titolo: res.name,
                        id: res.videoId,
                        artista: res.author.name,
                        thumbnail: res.thumbnails.url,
                    };
                }));
                return [2 /*return*/];
        }
    });
}); });
router.get("/getAlbum/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, response, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                console.log(id);
                return [4 /*yield*/, youtube.initalize()];
            case 1:
                _a.sent();
                return [4 /*yield*/, youtube.getAlbum(id)];
            case 2:
                response = _a.sent();
                result = response.tracks;
                res.status(200).send(result.map(function (res) {
                    return {
                        titolo: res.name,
                        id: res.videoId,
                        artista: res.artistNames,
                        thumbnail: res.thumbnails[3] ? res.thumbnails[3].url : null,
                    };
                }));
                return [2 /*return*/];
        }
    });
}); });
router.post("/getSongsByArtist", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var name, response, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                name = req.body.name;
                return [4 /*yield*/, youtube.initalize()];
            case 1:
                _a.sent();
                return [4 /*yield*/, youtube.search(name, "song")];
            case 2:
                response = _a.sent();
                result = response.content;
                console.log(result);
                res.status(200).send(result.map(function (res) {
                    return {
                        titolo: res.name,
                        id: res.videoId,
                        artista: name,
                        thumbnail: res.thumbnails[0] ? res.thumbnails[0].url : null,
                    };
                }));
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
//# sourceMappingURL=routes.js.map