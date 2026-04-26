#!/usr/bin/env node

/**
 * VAPID Key Generation Script
 * 
 * This script generates VAPID (Voluntary Application Server Identification) keys
 * for push notifications using the web-push library.
 * 
 * Usage:
 *   node scripts/generate-vapid-keys.mjs
 * 
 * Output:
 *   - VAPID public key (for frontend: VITE_VAPID_PUBLIC_KEY)
 *   - VAPID private key (for backend: VAPID_PRIVATE_KEY)
 *   - VAPID subject (for backend: VAPID_SUBJECT)
 * 
 * Note: This is a one-time script for developers to generate keys.
 *       The generated keys should be added to your .env files.
 * 
 * Prerequisites:
 *   npm install --save-dev web-push
 */

try {
  // Try to import web-push
  const webPush = await import('web-push');
  
  // Generate VAPID keys
  const vapidKeys = webPush.generateVAPIDKeys();
  
  console.log('🎉 VAPID Keys Generated Successfully!\n');
  console.log('========================================');
  console.log('FRONTEND ENVIRONMENT VARIABLE (.env.local):');
  console.log('========================================');
  console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
  console.log('\n');
  
  console.log('========================================');
  console.log('BACKEND ENVIRONMENT VARIABLES (.env.server):');
  console.log('========================================');
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
  console.log(`VAPID_SUBJECT=mailto:admin@mybron.uz`);
  console.log('\n');
  
  console.log('========================================');
  console.log('INSTRUCTIONS:');
  console.log('========================================');
  console.log('1. Copy the VITE_VAPID_PUBLIC_KEY to your frontend .env.local file');
  console.log('2. Copy VAPID_PRIVATE_KEY and VAPID_SUBJECT to your backend .env file');
  console.log('3. Never expose the private key to the frontend or client-side code');
  console.log('4. Keep these keys secure - they authenticate your push notifications');
  console.log('\n');
  
  console.log('✅ Keys are in base64url format, ready for use with PushManager.subscribe()');
  
} catch (error) {
  console.error('❌ Error generating VAPID keys:', error.message);
  console.log('\n');
  console.log('========================================');
  console.log('TROUBLESHOOTING:');
  console.log('========================================');
  console.log('1. Install web-push as a dev dependency:');
  console.log('   npm install --save-dev web-push');
  console.log('\n');
  console.log('2. Alternative: Generate keys using an online tool:');
  console.log('   https://web-push-codelab.glitch.me/');
  console.log('\n');
  console.log('3. Manual generation example:');
  console.log('   - Visit: https://web-push-codelab.glitch.me/');
  console.log('   - Click "Generate VAPID Keys"');
  console.log('   - Copy the Public Key to VITE_VAPID_PUBLIC_KEY');
  console.log('   - Copy the Private Key to VAPID_PRIVATE_KEY');
  console.log('   - Set VAPID_SUBJECT=mailto:admin@mybron.uz');
  console.log('\n');
  console.log('4. Check that you have Node.js 14+ installed');
  process.exit(1);
}