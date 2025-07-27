// src/polyfills.js
// Add this file to provide Buffer support in the browser

import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;

// Also add process if needed
if (typeof window.process === 'undefined') {
  window.process = {
    env: {},
    version: ''
  };
}

// Export for use in other files if needed
export { Buffer };