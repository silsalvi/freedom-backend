import SpotifyWebApi from "spotify-web-api-node";
import { TypeSearchSpotify } from "./models/advanced-search.model";

export class SongController {
  private static instance: SongController;
  private spotifyApi: SpotifyWebApi;
  private CLIENT_ID: string = "455425bb591646f6a8bef1ac2ff2435d";
  private CLIENT_SECRECT: string = "845d428d58084adfabf943d68c70b6e3";

  private constructor() {
    this.spotifyApi = new SpotifyWebApi({
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
  public static getInstance(): SongController {
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
  extractSongFromResponse(results: any[] = []): Promise<any[]> {
    return new Promise((resolve) => {
      const response = results.map((res: any) => {
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
  extractAlbumFromResponse(results: any[] = []): any[] {
    return results.map((res: any) => {
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
  extractPlaylistFromResponse(results: any[] = []): any[] {
    return results.map((res: any) => {
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
  extractVideosFromResponse(results: any[] = []): any[] {
    return results.map((res: any) => {
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
  extractSongForPlaylist(results: any[] = []): any[] {
    return results.map((res: any) => {
      return {
        titolo: res.name,
        id: res.videoId,
        artista: this.getArtistName(res.author),
        thumbnail: this.extractBestThumbnail(res.thumbnails),
      };
    });
  }

  /**
   * Estrae a partire dalla response di youtube api
   * la response della ricerca da inviare al chiamante.
   * @note Versione usata per ritornare i brani associati ad un album.
   */
  extractSongForAlbum(results: any[] = []): any[] {
    return results.map((res: any) => {
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
  extractSongForArtist(results: any[] = [], artistName: string): Promise<any> {
    return new Promise((resolve) => {
      const response = results.map((res: any) => {
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
  extractArtistFromResponse(results: any[] = []): Promise<any> {
    return new Promise((resolve) => {
      const filtered = Array.from(new Set(results.map((el) => el.name))).map(
        (name) =>
          results.find((el) => el.name.toUpperCase() === name.toUpperCase())
      );
      const response = filtered.map((res: any) => {
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
  private getArtistName(res: any): string {
    if (Array.isArray(res.artist) && res.artist.length > 0) {
      return res.artist[0].name;
    }

    if (res.artist && typeof res.artist === "string") {
      return res.artist;
    }

    if (
      !Array.isArray(res.artist) &&
      res.artist &&
      typeof res.artist === "object"
    ) {
      return res.artist.name;
    }

    if (res.author) {
      return res.author;
    }

    return "";
  }

  /**
   * Ritorna l'immagine dell'artista a partire dall'id passato in input
   * @param idArtista - id dell'artista
   */
  private async getMetadataFromQuery(
    query: string,
    typeSearch: TypeSearchSpotify
  ) {
    try {
      const res = await this.spotifyApi.search(query, [typeSearch]);
      switch (typeSearch) {
        case "album": {
          const item = res.body.albums?.items.find((el) =>
            el.name.toUpperCase().includes(query.toUpperCase())
          );
          return item?.images[0]?.url;
        }
        case "artist": {
          const item = res.body.artists?.items.find((el) => {
            return el.name.toUpperCase() === query.toUpperCase();
          });
          return item?.images[0]?.url;
        }
        case "track": {
          return res.body.tracks?.items[0]?.album?.images[0]?.url;
        }
      }
    } catch (err) {
      return null;
    }
  }

  /**
   * Estrae dalle possibili thumbnail quella a qualità maggiore,
   * ritornando il link contenuto nell'ultimo elemento dell'array passato in input.
   * Se è un oggetto, allora torna direttamente quell'unico valore.
   */
  private extractBestThumbnail(thumbnails: any): string {
    if (Array.isArray(thumbnails) && thumbnails.length > 0) {
      const thumb = thumbnails[thumbnails.length - 1];
      return thumb ? thumb.url : null;
    }

    if (
      !Array.isArray(thumbnails) &&
      typeof thumbnails === "object" &&
      thumbnails
    ) {
      return thumbnails.url;
    }

    return "";
  }

  private setCredentials(): void {
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
