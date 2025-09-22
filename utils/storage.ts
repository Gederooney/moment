/**
 * Utilities for storage calculation and management
 */

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
};

export const getQualityLabel = (quality: 'auto' | '720p' | '480p' | '360p'): string => {
  switch (quality) {
    case 'auto':
      return 'Automatique';
    case '720p':
      return '720p HD';
    case '480p':
      return '480p Standard';
    case '360p':
      return '360p Économique';
    default:
      return 'Automatique';
  }
};

export const calculateStoragePercentage = (used: number, total: number): number => {
  if (total === 0) return 0;
  return Math.min((used / total) * 100, 100);
};

export const getStorageWarningLevel = (percentage: number): 'low' | 'medium' | 'high' => {
  if (percentage < 70) return 'low';
  if (percentage < 90) return 'medium';
  return 'high';
};

export const getStorageWarningColor = (level: 'low' | 'medium' | 'high'): string => {
  switch (level) {
    case 'low':
      return '#10b981'; // green
    case 'medium':
      return '#f59e0b'; // yellow
    case 'high':
      return '#ef4444'; // red
    default:
      return '#10b981';
  }
};

export const getStorageWarningMessage = (level: 'low' | 'medium' | 'high'): string => {
  switch (level) {
    case 'medium':
      return 'Espace de stockage moyennement utilisé';
    case 'high':
      return 'Espace de stockage presque plein';
    default:
      return 'Espace de stockage disponible';
  }
};