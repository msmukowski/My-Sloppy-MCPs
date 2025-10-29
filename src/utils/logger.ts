/**
 * Structured logging utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogFormat = 'json' | 'text';

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
};

class Logger {
  private level: LogLevel;
  private format: LogFormat;
  private readonly levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(level: LogLevel = 'info', format: LogFormat = 'json') {
    this.level = level;
    this.format = format;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setFormat(format: LogFormat): void {
    this.format = format;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.level];
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context !== undefined && { context }),
    };

    const output = this.format === 'json' ? JSON.stringify(entry) : this.formatText(entry);

    console.error(output);
  }

  private formatText(entry: LogEntry): string {
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}`;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }
}

let loggerInstance: Logger | null = null;

export function createLogger(level?: LogLevel, format?: LogFormat): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger(level, format);
  }
  return loggerInstance;
}

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
}
