/**
 * Service de logging centralisé pour PodCut
 * Gère les logs en développement et production (Sentry/Crashlytics)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
}

class LoggerService {
  private static instance: LoggerService;
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Garder les 100 derniers logs en mémoire

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private log(level: LogLevel, context: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      context,
      message,
      data,
    };

    // Ajouter au buffer
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console en développement
    if (__DEV__) {
      const prefix = `[${level.toUpperCase()}][${context}]`;
      switch (level) {
        case 'error':
          console.error(prefix, message, data || '');
          break;
        case 'warn':
          console.warn(prefix, message, data || '');
          break;
        case 'debug':
          console.debug(prefix, message, data || '');
          break;
        default:
          console.log(prefix, message, data || '');
      }
    } else {
      // Production: Envoyer à Sentry/Crashlytics
      this.sendToMonitoring(entry);
    }
  }

  info(context: string, message: string, data?: any) {
    this.log('info', context, message, data);
  }

  warn(context: string, message: string, data?: any) {
    this.log('warn', context, message, data);
  }

  error(context: string, message: string | Error, data?: any) {
    const errorMessage = message instanceof Error ? message.message : message;
    const errorData = message instanceof Error
      ? { ...data, stack: message.stack }
      : data;

    this.log('error', context, errorMessage, errorData);
  }

  debug(context: string, message: string, data?: any) {
    this.log('debug', context, message, data);
  }

  private sendToMonitoring(entry: LogEntry) {
    // TODO: Implémenter intégration Sentry/Crashlytics
    // Exemple:
    // if (entry.level === 'error') {
    //   Sentry.captureException(new Error(entry.message), {
    //     contexts: {
    //       app: {
    //         context: entry.context,
    //         data: entry.data
    //       }
    //     }
    //   });
    // }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

// Export singleton instance
export const Logger = LoggerService.getInstance();
