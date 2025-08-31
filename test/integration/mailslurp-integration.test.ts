import { PlaywrightOtpClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file if available
dotenv.config();

// Skip tests if API key is not provided
const MAILSLURP_API_KEY = process.env.MAILSLURP_API_KEY;
const runTests = !!MAILSLURP_API_KEY;

// Only run these tests when API key is available
(runTests ? describe : describe.skip)('MailSlurp Integration Tests', () => {
  let client: PlaywrightOtpClient;
  
  beforeEach(() => {
    client = new PlaywrightOtpClient({
      provider: 'mailslurp',
      providerConfig: {
        apiKey: MAILSLURP_API_KEY
      },
      timeout: 60000 // 60 seconds timeout for real API calls
    });
  });
  
  afterEach(async () => {
    await client.cleanup();
  });
  
  it('should initialize successfully', async () => {
    await expect(client.initialize()).resolves.not.toThrow();
  });
  
  it('should get a valid phone number', async () => {
    await client.initialize();
    const phoneNumber = await client.getPhoneNumber();
    
    expect(phoneNumber).toBeDefined();
    expect(typeof phoneNumber).toBe('string');
    expect(phoneNumber.length).toBeGreaterThan(5); // Basic validation
  });
  
  // Note: Testing for actual SMS receipt requires sending real SMS,
  // which is not suitable for automated CI tests
  // This could be tested manually or with a mock SMS sender in a controlled environment
});
