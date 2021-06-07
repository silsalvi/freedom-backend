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
exports.SongController = void 0;
const spotify_web_api_node_1 = __importDefault(require("spotify-web-api-node"));
class SongController {
    constructor() {
        this.CLIENT_ID = "455425bb591646f6a8bef1ac2ff2435d";
        this.CLIENT_SECRECT = "845d428d58084adfabf943d68c70b6e3";
        this.spotifyApi = new spotify_web_api_node_1.default({
            clientId: this.CLIENT_ID,
            clientSecret: this.CLIENT_SECRECT,
        });
        this.setCredentials();
        setInterval(() => {
            this.setCredentials();
        }, 1000 * 60 * 60);
    }
    /**
     * Ritorna l'istanza esistente della classe SongController,
     * altrimenti ne crea una nuova.
     *
     * Implementa il Singleton Pattern.
     */
    static getInstance() {
        if (!SongController.instance) {
            SongController.instance = new SongController();
        }
        return SongController.instance;
    }
    /**
     * Estrae a partire dalla response di youtube api
     * la response della ricerca da inviare al chiamante.
     * @note Versione usata per i brani.
     */
    extractSongFromResponse(results = []) {
        return new Promise((resolve) => {
            const response = results.map((res) => {
                const artist = this.getArtistName(res);
                return this.getMetadataFromQuery(res.name + " " + artist, "track")
                    .then((cover) => {
                    return {
                        titolo: res.name,
                        id: res.videoId,
                        artista: artist,
                        thumbnail: cover,
                    };
                })
                    .catch((err) => {
                    return {
                        titolo: res.name,
                        id: res.videoId,
                        artista: artist,
                        thumbnail: null,
                    };
                });
            });
            Promise.all(response).then((data) => {
                resolve(data);
            });
        });
    }
    /**
     * Estrae a partire dalla response di youtube api
     * la response della ricerca da inviare al chiamante.
     * @note Versione usata per gli album.
     */
    extractAlbumFromResponse(results = []) {
        return results.map((res) => {
            return {
                titolo: res.name,
                id: res.browseId,
                artista: res.artist,
                thumbnail: this.extractBestThumbnail(res.thumbnails),
            };
        });
    }
    /**
     * Estrae a partire dalla response di youtube api
     * la response della ricerca da inviare al chiamante.
     * @note Versione usata per le playlist.
     */
    extractPlaylistFromResponse(results = []) {
        return results.map((res) => {
            return {
                titolo: res.title,
                id: res.browseId,
                totalTrack: res.trackCount,
                thumbnail: this.extractBestThumbnail(res.thumbnails),
            };
        });
    }
    /**
     * Estrae a partire dalla response di youtube api
     * la response della ricerca da inviare al chiamante.
     * @note Versione usata per i video.
     */
    extractVideosFromResponse(results = []) {
        return results.map((res) => {
            return {
                titolo: res.name,
                id: res.videoId,
                artista: res.author,
                thumbnail: this.extractBestThumbnail(res.thumbnails),
            };
        });
    }
    /**
     * Estrae a partire dalla response di youtube api
     * la response della ricerca da inviare al chiamante.
     * @note Versione usata per ritornare i brani associati ad una playlist.
     */
    extractSongForPlaylist(results = []) {
        return new Promise((resolve) => {
            const response = results.map((res) => {
                const artist = this.getArtistName(res);
                return this.getMetadataFromQuery(res.name + " " + artist, "track")
                    .then((cover) => {
                    return {
                        titolo: res.name,
                        id: res.videoId,
                        artista: artist,
                        thumbnail: cover,
                    };
                })
                    .catch((err) => {
                    return {
                        titolo: res.name,
                        id: res.videoId,
                        artista: artist,
                        thumbnail: null,
                    };
                });
            });
            Promise.all(response).then((data) => {
                resolve(data);
            });
        });
    }
    /**
     * Estrae a partire dalla response di youtube api
     * la response della ricerca da inviare al chiamante.
     * @note Versione usata per ritornare i brani associati ad un album.
     */
    extractSongForAlbum(results = []) {
        return results.map((res) => {
            return {
                titolo: res.name,
                id: res.videoId,
                artista: res.artistNames,
                thumbnail: this.extractBestThumbnail(res.thumbnails),
            };
        });
    }
    /**
     * Estrae a partire dalla response di youtube api
     * la response della ricerca da inviare al chiamante.
     * @note Versione usata per ritornare i brani associati ad un'artista.
     */
    extractSongForArtist(results = [], artistName) {
        return new Promise((resolve) => {
            const response = results.map((res) => {
                return this.getMetadataFromQuery(res.name + " " + artistName, "track")
                    .then((cover) => {
                    return {
                        titolo: res.name,
                        id: res.videoId,
                        artista: artistName,
                        thumbnail: cover,
                    };
                })
                    .catch((err) => {
                    return {
                        titolo: res.name,
                        id: res.videoId,
                        artista: artistName,
                        thumbnail: null,
                    };
                });
            });
            Promise.all(response).then((data) => {
                resolve(data);
            });
        });
    }
    /**
     * Estrae a partire dalla response di youtube api
     * la response della ricerca da inviare al chiamante.
     * @note Versione usata per ritornare i brani associati a degli artisti.
     */
    extractArtistFromResponse(results = []) {
        return new Promise((resolve) => {
            const filtered = Array.from(new Set(results.map((el) => el.name))).map((name) => results.find((el) => el.name.toUpperCase() === name.toUpperCase()));
            const response = filtered.map((res) => {
                return this.getMetadataFromQuery(res.name, "artist")
                    .then((cover) => {
                    return {
                        titolo: res.name,
                        id: res.browseId,
                        thumbnail: cover,
                    };
                })
                    .catch((err) => {
                    return {
                        titolo: res.name,
                        id: res.browseId,
                        thumbnail: null,
                    };
                });
            });
            Promise.all(response).then((data) => {
                resolve(data);
            });
        });
    }
    /**
     * Ritorna una stringa contenente il nome di un'artista.
     * Gestisce i casi in cui ci siano più artisti (array), un artista rappresentato come oggetto,
     * e un singolo artista restituito come stringa.
     * @param res - response contenente le informazioni da cui estrarre l'artista
     * @returns - il brano dell'artista
     */
    getArtistName(res) {
        if (Array.isArray(res.artist) && res.artist.length > 0) {
            return res.artist[0].name;
        }
        if (res.artist && typeof res.artist === "string") {
            return res.artist;
        }
        if (!Array.isArray(res.artist) &&
            res.artist &&
            typeof res.artist === "object") {
            return res.artist.name;
        }
        if (!Array.isArray(res.author) && res.author) {
            return res.author.name;
        }
        if (Array.isArray(res.author) && res.author) {
            return res.author[0].name;
        }
        return "";
    }
    /**
     * Ritorna l'immagine dell'artista a partire dall'id passato in input
     * @param idArtista - id dell'artista
     */
    getMetadataFromQuery(query, typeSearch) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.spotifyApi.search(query, [typeSearch]);
                switch (typeSearch) {
                    case "album": {
                        const item = (_a = res.body.albums) === null || _a === void 0 ? void 0 : _a.items.find((el) => el.name.toUpperCase().includes(query.toUpperCase()));
                        return (_b = item === null || item === void 0 ? void 0 : item.images[0]) === null || _b === void 0 ? void 0 : _b.url;
                    }
                    case "artist": {
                        const item = (_c = res.body.artists) === null || _c === void 0 ? void 0 : _c.items.find((el) => {
                            return el.name.toUpperCase() === query.toUpperCase();
                        });
                        return (_d = item === null || item === void 0 ? void 0 : item.images[0]) === null || _d === void 0 ? void 0 : _d.url;
                    }
                    case "track": {
                        return (_h = (_g = (_f = (_e = res.body.tracks) === null || _e === void 0 ? void 0 : _e.items[0]) === null || _f === void 0 ? void 0 : _f.album) === null || _g === void 0 ? void 0 : _g.images[0]) === null || _h === void 0 ? void 0 : _h.url;
                    }
                }
            }
            catch (err) {
                return null;
            }
        });
    }
    /**
     * Estrae dalle possibili thumbnail quella a qualità maggiore,
     * ritornando il link contenuto nell'ultimo elemento dell'array passato in input.
     * Se è un oggetto, allora torna direttamente quell'unico valore.
     */
    extractBestThumbnail(thumbnails) {
        if (Array.isArray(thumbnails) && thumbnails.length > 0) {
            const thumb = thumbnails[thumbnails.length - 1];
            return thumb ? thumb.url : null;
        }
        if (!Array.isArray(thumbnails) &&
            typeof thumbnails === "object" &&
            thumbnails) {
            return thumbnails.url;
        }
        return "";
    }
    setCredentials() {
        this.spotifyApi
            .clientCredentialsGrant()
            .then((data) => {
            console.log("The access token is " + data.body["access_token"]);
            this.spotifyApi.setAccessToken(data.body["access_token"]);
        })
            .catch((err) => {
            console.log("Something went wrong!", err);
        });
    }
}
exports.SongController = SongController;
