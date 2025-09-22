import { Config } from '../constants/Config';

export interface VideoInfo {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  author: string;
}

export interface ProcessingResult {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  audioUrl?: string;
  error?: string;
}

export class YouTubeService {
  static isValidYouTubeUrl(url: string): boolean {
    return Config.YOUTUBE_URL_PATTERNS.some(pattern => pattern.test(url));
  }

  static extractVideoId(url: string): string | null {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  static async getVideoInfo(url: string): Promise<VideoInfo> {
    // TODO: Implémenter l'appel API réel
    const videoId = this.extractVideoId(url);

    if (!videoId) {
      throw new Error('URL YouTube invalide');
    }

    // Simulation pour le développement
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: videoId,
          title: 'Titre de la vidéo simulée',
          duration: 1800, // 30 minutes
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          author: 'Auteur simulé',
        });
      }, 1000);
    });
  }

  static async processVideo(url: string): Promise<ProcessingResult> {
    // TODO: Implémenter l'appel API réel
    const videoId = this.extractVideoId(url);

    if (!videoId) {
      throw new Error('URL YouTube invalide');
    }

    // Simulation pour le développement
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          jobId: `job_${Date.now()}`,
          status: 'pending',
        });
      }, 500);
    });
  }

  static async checkJobStatus(jobId: string): Promise<ProcessingResult> {
    // TODO: Implémenter l'appel API réel

    // Simulation pour le développement
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          jobId,
          status: 'completed',
          audioUrl: 'https://example.com/audio.mp3',
        });
      }, 2000);
    });
  }
}