import { PlaywrightOtpClient } from 'pw-otp-client';
import { FullConfig } from '@playwright/test';

// Example of global setup with OTP client in Playwright tests
async function globalSetup(config: FullConfig) {
  // Create and initialize OTP client
  const otpClient = new PlaywrightOtpClient({
    provider: 'mailslurp', // Or whichever provider you prefer
    providerConfig: {
      apiKey: process.env.MAILSLURP_API_KEY
    }
  });
  
  // Initialize the client
  await otpClient.initialize();
  
  // Store in global state for use in tests
  process.env.OTP_CLIENT_INITIALIZED = 'true';
  
  // Alternatively, you could set up a shared HTTP service that tests can call
  // to get phone numbers and OTP codes, especially useful in parallel test execution
}

export default globalSetup;
