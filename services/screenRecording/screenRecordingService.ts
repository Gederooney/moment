/**
 * Screen Recording Service
 * Interface for native screen recording modules
 *
 * NOTE: This requires native implementation:
 * - iOS: ReplayKit (RPScreenRecorder)
 * - Android: MediaProjection API
 */

import { Platform } from 'react-native';
import { ScreenRecordingState, RecordingConfig } from '../../types/screenRecording';
import { ScreenRecordingBuffer } from './screenRecordingBuffer';

class ScreenRecordingService {
  private static instance: ScreenRecordingService;
  private buffer: ScreenRecordingBuffer;
  private state: ScreenRecordingState = {
    isRecording: false,
    isBackground: false,
    startTime: null,
    duration: 0,
  };

  private config: RecordingConfig = {
    bufferDurationMinutes: 3,
    quality: 'medium',
    audioEnabled: true,
  };

  private constructor() {
    this.buffer = new ScreenRecordingBuffer(this.config.bufferDurationMinutes);
  }

  static getInstance(): ScreenRecordingService {
    if (!ScreenRecordingService.instance) {
      ScreenRecordingService.instance = new ScreenRecordingService();
    }
    return ScreenRecordingService.instance;
  }

  /**
   * Start screen recording
   *
   * Native implementation required:
   * - iOS: [RPScreenRecorder.sharedRecorder startRecordingWithHandler:]
   * - Android: MediaProjection.createVirtualDisplay()
   */
  async startRecording(config?: Partial<RecordingConfig>): Promise<void> {
    if (this.state.isRecording) {
      console.warn('[ScreenRecording] Already recording');
      return;
    }

    if (config) {
      this.config = { ...this.config, ...config };
      this.buffer.setMaxDuration(this.config.bufferDurationMinutes);
    }

    try {
      // TODO: Call native module to start recording
      if (Platform.OS === 'ios') {
        // await NativeModules.ScreenRecording.startRecording(this.config);
        throw new Error('iOS screen recording not yet implemented');
      } else if (Platform.OS === 'android') {
        // await NativeModules.ScreenRecording.startRecording(this.config);
        throw new Error('Android screen recording not yet implemented');
      }

      this.state = {
        isRecording: true,
        isBackground: false,
        startTime: new Date(),
        duration: 0,
      };

      console.log('[ScreenRecording] Recording started');
    } catch (error) {
      console.error('[ScreenRecording] Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop screen recording
   */
  async stopRecording(): Promise<void> {
    if (!this.state.isRecording) {
      console.warn('[ScreenRecording] Not recording');
      return;
    }

    try {
      // TODO: Call native module to stop recording
      if (Platform.OS === 'ios') {
        // await NativeModules.ScreenRecording.stopRecording();
      } else if (Platform.OS === 'android') {
        // await NativeModules.ScreenRecording.stopRecording();
      }

      this.state = {
        ...this.state,
        isRecording: false,
        startTime: null,
        duration: 0,
      };

      console.log('[ScreenRecording] Recording stopped');
    } catch (error) {
      console.error('[ScreenRecording] Failed to stop recording:', error);
      throw error;
    }
  }

  /**
   * Capture moment from current recording
   * Extracts last N seconds from buffer and saves as video file
   */
  async captureMoment(durationSeconds: number = 10): Promise<string> {
    if (!this.state.isRecording) {
      throw new Error('Cannot capture moment: not recording');
    }

    try {
      const chunks = this.buffer.getLastNMinutes(durationSeconds * 1000);

      // TODO: Merge chunks and save to file
      // const videoPath = await NativeModules.ScreenRecording.saveChunksToFile(chunks);
      const videoPath = `/temp/moment_${Date.now()}.mp4`; // Placeholder

      console.log(`[ScreenRecording] Moment captured: ${videoPath}`);
      return videoPath;
    } catch (error) {
      console.error('[ScreenRecording] Failed to capture moment:', error);
      throw error;
    }
  }

  /**
   * Get current recording state
   */
  getState(): ScreenRecordingState {
    return { ...this.state };
  }

  /**
   * Get current configuration
   */
  getConfig(): RecordingConfig {
    return { ...this.config };
  }

  /**
   * Get buffer status
   */
  getBufferStatus() {
    return this.buffer.getConfig();
  }

  /**
   * Clear buffer
   */
  clearBuffer(): void {
    this.buffer.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RecordingConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.bufferDurationMinutes !== undefined) {
      this.buffer.setMaxDuration(config.bufferDurationMinutes);
    }
  }

  /**
   * Check if screen recording is supported on current device
   */
  static async isSupported(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // TODO: Check iOS version >= 11.0 (ReplayKit requirement)
      return true; // Placeholder
    } else if (Platform.OS === 'android') {
      // TODO: Check Android version >= 5.0 (MediaProjection requirement)
      return true; // Placeholder
    }
    return false;
  }

  /**
   * Request permissions for screen recording
   */
  static async requestPermissions(): Promise<boolean> {
    // TODO: Implement native permission request
    // iOS: Info.plist microphone usage description (if audio enabled)
    // Android: REQUEST_SCREEN_CAPTURE permission
    return true; // Placeholder
  }
}

export default ScreenRecordingService;
