/**
 * Graceful shutdown handler for cleanup
 */

import { getLogger } from './logger.js';

type CleanupHandler = () => Promise<void> | void;

class ShutdownManager {
  private handlers: CleanupHandler[] = [];
  private isShuttingDown = false;

  /**
   * Register a cleanup handler
   */
  register(handler: CleanupHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Execute all cleanup handlers
   */
  async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    const logger = getLogger();
    logger.info(`Received ${signal}, shutting down gracefully...`);

    for (const handler of this.handlers) {
      try {
        await handler();
      } catch (error) {
        logger.error('Error during cleanup:', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    logger.info('Shutdown complete');
    process.exit(0);
  }

  /**
   * Setup signal handlers
   */
  setupHandlers(): void {
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

    for (const signal of signals) {
      process.on(signal, () => {
        void this.shutdown(signal);
      });
    }

    process.on('uncaughtException', (error) => {
      const logger = getLogger();
      logger.error('Uncaught exception:', {
        error: error.message,
        stack: error.stack,
      });
      void this.shutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason) => {
      const logger = getLogger();
      logger.error('Unhandled rejection:', {
        reason: String(reason),
      });
      void this.shutdown('UNHANDLED_REJECTION');
    });
  }
}

const shutdownManager = new ShutdownManager();

/**
 * Register a cleanup handler
 */
export function onShutdown(handler: CleanupHandler): void {
  shutdownManager.register(handler);
}

/**
 * Setup shutdown handlers (call once at startup)
 */
export function setupShutdownHandlers(): void {
  shutdownManager.setupHandlers();
}
