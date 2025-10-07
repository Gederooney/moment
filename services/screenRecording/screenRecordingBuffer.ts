/**
 * Circular Buffer Service for Screen Recording
 * Stores last N minutes of screen recording in memory
 * Memory limit: 200MB
 */

import { RecordingBuffer, RecordingChunk } from '../../types/screenRecording';

export class ScreenRecordingBuffer {
  private buffer: RecordingChunk[] = [];
  private maxDurationMs: number;
  private maxMemoryBytes: number = 200 * 1024 * 1024; // 200MB
  private currentMemoryUsage: number = 0;

  constructor(durationMinutes: number = 3) {
    this.maxDurationMs = durationMinutes * 60 * 1000;
  }

  /**
   * Add video chunk to circular buffer
   * Removes oldest chunks if buffer exceeds max duration or memory limit
   */
  addChunk(chunk: RecordingChunk): void {
    // Add new chunk
    this.buffer.push(chunk);
    this.currentMemoryUsage += chunk.sizeBytes;

    // Remove old chunks if exceeding limits
    this.enforceBufferLimits();
  }

  /**
   * Get last N minutes of recording as chunks
   */
  getLastNMinutes(durationMs: number): RecordingChunk[] {
    const now = Date.now();
    const cutoffTime = now - durationMs;

    return this.buffer.filter((chunk) => chunk.timestamp >= cutoffTime);
  }

  /**
   * Get all chunks in buffer
   */
  getAllChunks(): RecordingChunk[] {
    return [...this.buffer];
  }

  /**
   * Clear buffer and reset memory usage
   */
  clear(): void {
    this.buffer = [];
    this.currentMemoryUsage = 0;
  }

  /**
   * Get current memory usage in bytes
   */
  getMemoryUsage(): number {
    return this.currentMemoryUsage;
  }

  /**
   * Get buffer duration in milliseconds
   */
  getBufferDuration(): number {
    if (this.buffer.length === 0) return 0;

    const oldestChunk = this.buffer[0];
    const newestChunk = this.buffer[this.buffer.length - 1];

    return newestChunk.timestamp - oldestChunk.timestamp;
  }

  /**
   * Enforce buffer limits (duration and memory)
   * Removes oldest chunks until limits are satisfied
   */
  private enforceBufferLimits(): void {
    const now = Date.now();
    const cutoffTime = now - this.maxDurationMs;

    // Remove chunks older than max duration
    while (this.buffer.length > 0 && this.buffer[0].timestamp < cutoffTime) {
      const removed = this.buffer.shift();
      if (removed) {
        this.currentMemoryUsage -= removed.sizeBytes;
      }
    }

    // Remove oldest chunks if exceeding memory limit
    while (this.currentMemoryUsage > this.maxMemoryBytes && this.buffer.length > 0) {
      const removed = this.buffer.shift();
      if (removed) {
        this.currentMemoryUsage -= removed.sizeBytes;
      }
    }
  }

  /**
   * Update max duration setting
   */
  setMaxDuration(durationMinutes: number): void {
    this.maxDurationMs = durationMinutes * 60 * 1000;
    this.enforceBufferLimits();
  }

  /**
   * Get configuration summary
   */
  getConfig(): RecordingBuffer {
    return {
      maxDurationMs: this.maxDurationMs,
      maxMemoryBytes: this.maxMemoryBytes,
      currentMemoryUsage: this.currentMemoryUsage,
      chunkCount: this.buffer.length,
      oldestChunkTimestamp: this.buffer[0]?.timestamp || 0,
      newestChunkTimestamp: this.buffer[this.buffer.length - 1]?.timestamp || 0,
    };
  }
}
