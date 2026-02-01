// types/video-detail.ts
import { Video } from './video'; // Import tipe Video yang sudah ada untuk related videos

export interface VideoDetail {
  title: string;
  description: string;
  embedUrl: string;
  downloadUrl: string;
  thumbnail: string;
  uploadDate: string;
  duration: string;
  tags: string[];
  relatedVideos: Video[];
}