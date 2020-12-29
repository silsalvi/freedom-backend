export interface YoutubeResponse {
  type: string;
  videoId: string;
  playlistId: string;
  name: string;
  author: string;
  views: string;
  duration: number;
  thumbnails: {
    url: string;
    width: number;
    height: number;
  };
  params: string;
}
