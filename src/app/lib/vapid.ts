/**
 * VAPID utility functions for push notifications.
 * 
 * @module vapid
 */

/**
 * Converts a base64url-encoded string to a Uint8Array.
 * This is required for iOS Safari compatibility when subscribing to push notifications.
 * 
 * iOS Safari requires the applicationServerKey to be provided as a Uint8Array,
 * not as a base64url string like other browsers.
 * 
 * @param base64String - The base64url-encoded string to convert
 * @returns A Uint8Array containing the decoded bytes
 * 
 * @example
 * ```typescript
 * const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
 * const keyArray = urlBase64ToUint8Array(publicKey);
 * const subscription = await pushManager.subscribe({
 *   userVisibleOnly: true,
 *   applicationServerKey: keyArray
 * });
 * ```
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // Add padding to base64url string if needed
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}