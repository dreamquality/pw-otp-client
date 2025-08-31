import { PlaywrightOtpClient } from 'pw-otp-client';
import { FullConfig } from '@playwright/test';

// Example of global teardown with OTP client in Playwright tests
async function globalTeardown(config: FullConfig) {
  // Clean up resources if OTP client was initialized
  if (process.env.OTP_CLIENT_INITIALIZED === 'true') {
    const otpClient = new PlaywrightOtpClient({
      provider: 'mailslurp',
      providerConfig: {
        apiKey: process.env.MAILSLURP_API_KEY
      }
    });
    
    await otpClient.cleanup();
    
    // Clear the flag
    process.env.OTP_CLIENT_INITIALIZED = '';
  }
}

export default globalTeardown;
