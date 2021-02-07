export interface YoutubeSearch {
  video: string;
  song: string;
  album: string;
  playlist: string;
  artist: string;
}

export interface PlayList {
  type: string;
  browseId: string;
  title: string;
  author: string;
  trackCount: number;
  thumbnails: any[];
}

export interface Artist {
  type: string;
  browseId: string;
  name: string;
  thumbnails: any[];
}

export interface Album {
  type: string;
  browseId: string;
  playlistId: string;
  name: string;
  artist: string;
  year: string;
  thumbnails: any[];
}
