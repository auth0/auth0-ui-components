/**
 * Creates a Promise that resolves after a specified delay
 * Useful for adding controlled delays in async operations
 * 
 * @param {number} ms - The delay duration in milliseconds
 * @returns {Promise<void>} Promise that resolves after the specified delay
 * 
 * @example
 * ```ts
 * // Wait for 1 second
 * await delay(1000);
 * 
 * // Use in an async function
 * async function fetchWithRetry() {
 *   try {
 *     return await fetch('/api');
 *   } catch {
 *     await delay(500); // Wait 500ms before retry
 *     return await fetch('/api');
 *   }
 * }
 * ```
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }