import { test, expect } from '@playwright/test';
import { PlaywrightOtpClient } from 'pw-otp-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Example test showing how to use the OTP client with Playwright
test('Login with SMS OTP verification', async ({ page }) => {
  // Create and initialize the OTP client
  const otpClient = new PlaywrightOtpClient({
    provider: 'mailslurp',
    providerConfig: {
      apiKey: process.env.MAILSLURP_API_KEY
    },
    timeout: 60000 // 60 seconds timeout
  });
  
  await otpClient.initialize();
  
  try {
    // Step 1: Navigate to the login page
    await page.goto('https://example-app.com/login');
    await expect(page).toHaveTitle(/Login/);
    
    // Step 2: Get a phone number for SMS verification
    console.log('Requesting a phone number for SMS verification...');
    const phoneNumber = await otpClient.getPhoneNumber();
    console.log(`Using phone number: ${phoneNumber}`);
    
    // Step 3: Enter the phone number and request OTP
    await page.fill('#phone-input', phoneNumber);
    await page.click('#request-otp-button');
    
    // Verify that the OTP form appeared
    await expect(page.locator('#otp-form')).toBeVisible();
    
    // Step 4: Wait for the OTP code
    console.log('Waiting for OTP code...');
    const otpCode = await otpClient.getOtpCode(phoneNumber);
    console.log(`Received OTP code: ${otpCode}`);
    
    // Step 5: Enter the OTP code
    await page.fill('#otp-input', otpCode);
    await page.click('#verify-button');
    
    // Step 6: Verify successful login
    await expect(page.locator('.dashboard-welcome')).toBeVisible();
    await expect(page.locator('.user-profile')).toContainText(phoneNumber);
    
    console.log('Login successful!');
  } finally {
    // Always clean up resources
    await otpClient.cleanup();
  }
});

// Example test using the convenience method
test('Register with SMS verification - simplified', async ({ page }) => {
  const otpClient = new PlaywrightOtpClient({
    provider: 'mailslurp',
    providerConfig: {
      apiKey: process.env.MAILSLURP_API_KEY
    }
  });
  
  await otpClient.initialize();
  
  try {
    // Navigate to registration page
    await page.goto('https://example-app.com/register');
    
    // Fill in registration form
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    
    // Use the convenience method to get both phone number and OTP
    const { phoneNumber, otpCode } = await otpClient.getPhoneNumberAndOtpCode();
    
    // Complete registration with phone verification
    await page.fill('#phone-input', phoneNumber);
    await page.click('#send-code-button');
    
    await page.fill('#verification-code', otpCode);
    await page.click('#complete-registration');
    
    // Verify successful registration
    await expect(page.locator('.registration-success')).toBeVisible();
  } finally {
    await otpClient.cleanup();
  }
});
