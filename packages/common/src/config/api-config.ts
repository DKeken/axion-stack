/**
 * Shared API configuration
 * Used across gateway, contracts, and other packages
 */

/**
 * Get API prefix from environment or use default
 */
export function getApiPrefix(): string {
  return process.env.API_PREFIX || '/api/v1';
}

/**
 * Get API version from environment or use default
 */
export function getApiVersion(): string {
  return process.env.API_VERSION || 'v1';
}

/**
 * Build full API path for a service
 */
export function buildApiPath(serviceName: string, path = ''): string {
  const prefix = getApiPrefix();
  return `${prefix}/${serviceName}${path}`;
}

/**
 * Extract service-relative path from full API path
 */
export function normalizeApiPath(fullPath: string, serviceName: string): string {
  const prefix = getApiPrefix();
  const servicePrefix = `${prefix}/${serviceName}`;

  if (fullPath.startsWith(servicePrefix)) {
    const relativePath = fullPath.substring(servicePrefix.length);
    return relativePath || '/';
  }

  return fullPath;
}
