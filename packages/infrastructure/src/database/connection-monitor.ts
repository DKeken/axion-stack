import { Logger } from '@nestjs/common';

/**
 * Database Connection Monitor
 *
 * Utility functions for monitoring database connections in development mode.
 * Helps track connection leaks and HMR behavior.
 */

const logger = new Logger('ConnectionMonitor');
let connectionCount = 0;
const connections = new Set<string>();

/**
 * Register a new connection
 */
export function registerConnection(id: string): void {
  connections.add(id);
  connectionCount++;
  logger.log(`📊 Connection registered: ${id} (Total: ${connectionCount})`);
}

/**
 * Unregister a connection
 */
export function unregisterConnection(id: string): void {
  if (connections.delete(id)) {
    connectionCount--;
    logger.log(`📊 Connection unregistered: ${id} (Total: ${connectionCount})`);
  }
}

/**
 * Get current connection count
 */
export function getConnectionCount(): number {
  return connectionCount;
}

/**
 * Get all active connections
 */
export function getActiveConnections(): string[] {
  return Array.from(connections);
}

/**
 * Log connection status
 */
export function logStatus(): void {
  logger.log(`📊 Active connections: ${connectionCount}`);
  if (connectionCount > 0) {
    logger.log(`📊 Connection IDs: ${getActiveConnections().join(', ')}`);
  }
}

/**
 * Reset monitoring (useful for development)
 */
export function reset(): void {
  connections.clear();
  connectionCount = 0;
  logger.log('📊 Connection monitoring reset');
}
