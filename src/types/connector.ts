/**
 * Generic connector interface for external resources
 * @template TClient - The client type this connector manages (e.g., Pool)
 */
export type Connector<TClient> = {
  /**
   * Initialize the connector and establish connection
   */
  initialize: () => Promise<void>;

  /**
   * Get the underlying client instance
   * @throws Error if not initialized
   */
  getClient: () => TClient;

  /**
   * Close the connection and cleanup resources
   */
  close: () => Promise<void>;

  /**
   * Check if the connector is healthy and ready
   */
  isHealthy: () => boolean;
};

/**
 * Connector factory function signature
 */
export type ConnectorFactory<TClient, TConfig> = (config: TConfig) => Connector<TClient>;
