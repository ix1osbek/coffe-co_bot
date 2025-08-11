export interface NewMessageSession {
  points_from?: number;
  points_to?: number;
  text?: string;
  media_type?: "photo" | "video";
  media?: string;
}
