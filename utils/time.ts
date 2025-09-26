/**
 * Formats time in seconds to MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string (MM:SS)
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formats time in seconds to HH:MM:SS format for longer videos
 * @param seconds - Time in seconds
 * @returns Formatted time string (HH:MM:SS or MM:SS)
 */
export const formatTimeDetailed = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formats duration in seconds to human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "30s", "2min", "1.5min")
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = seconds / 60;

  // If it's a whole number of minutes, show as "2min"
  if (minutes === Math.floor(minutes)) {
    return `${Math.floor(minutes)}min`;
  }

  // If it's less than 10 minutes, show with one decimal place like "1.5min"
  if (minutes < 10) {
    return `${Math.round(minutes * 10) / 10}min`;
  }

  // For longer durations, round to nearest minute
  return `${Math.round(minutes)}min`;
};
