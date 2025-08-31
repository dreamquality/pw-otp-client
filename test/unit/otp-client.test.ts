import { PlaywrightOtpClient, ISmsProvider } from '../../src';
import { MailSlurpProvider } from '../../src/adapters/mailslurp-provider.adapter';
import { TwilioProvider } from '../../src/adapters/twilio-provider.adapter';
import { MailosaurProvider } from '../../src/adapters/mailosaur-provider.adapter';
import sinon from 'sinon';

// Mock SMS Provider for testing
class MockSmsProvider implements ISmsProvider {
  public getPhoneNumberCalled = false;
  public waitForOtpCodeCalled = false;
  public initializeCalled = false;
  public cleanupCalled = false;
  
  public phoneNumber = '+11234567890';
  public otpCode = '123456';
  
  async initialize(): Promise<void> {
    this.initializeCalled = true;
  }
  
  async cleanup(): Promise<void> {
    this.cleanupCalled = true;
  }
  
  async getPhoneNumber(): Promise<string> {
    this.getPhoneNumberCalled = true;
    return this.phoneNumber;
  }
  
  async waitForOtpCode(phoneNumber: string, timeout?: number): Promise<string> {
    this.waitForOtpCodeCalled = true;
    return this.otpCode;
  }
}

// Mock the providers
jest.mock('../../src/adapters/mailslurp-provider.adapter', () => ({
  MailSlurpProvider: jest.fn().mockImplementation(() => {
    return new MockSmsProvider();
  })
}));

jest.mock('../../src/adapters/twilio-provider.adapter', () => ({
  TwilioProvider: jest.fn().mockImplementation(() => {
    return new MockSmsProvider();
  })
}));

jest.mock('../../src/adapters/mailosaur-provider.adapter', () => ({
  MailosaurProvider: jest.fn().mockImplementation(() => {
    return new MockSmsProvider();
  })
}));

describe('PlaywrightOtpClient', () => {
  let mockProvider: MockSmsProvider;
  let client: PlaywrightOtpClient;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockProvider = new MockSmsProvider();
    client = new PlaywrightOtpClient({
      customProvider: mockProvider
    });
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('constructor', () => {
    it('should create instance with custom provider', () => {
      expect(client).toBeInstanceOf(PlaywrightOtpClient);
    });
    
    it('should create instance with MailSlurp provider by default', () => {
      const defaultClient = new PlaywrightOtpClient({
        providerConfig: { apiKey: 'test-key' } // Need to provide API key to avoid error
      });
      expect(MailSlurpProvider).toHaveBeenCalled();
    });
    
    it('should create instance with Twilio provider when specified', () => {
      const twilioClient = new PlaywrightOtpClient({
        provider: 'twilio',
        providerConfig: {
          accountSid: 'test-sid',
          authToken: 'test-token'
        }
      });
      expect(TwilioProvider).toHaveBeenCalled();
    });
    
    it('should create instance with Mailosaur provider when specified', () => {
      const mailosaurClient = new PlaywrightOtpClient({
        provider: 'mailosaur',
        providerConfig: {
          apiKey: 'test-key',
          serverId: 'test-server'
        }
      });
      expect(MailosaurProvider).toHaveBeenCalled();
    });
    
    it('should throw error for unsupported provider type', () => {
      expect(() => {
        new PlaywrightOtpClient({
          // @ts-ignore - Testing invalid value
          provider: 'invalid-provider'
        });
      }).toThrow(/Unsupported provider/);
    });
  });
  
  describe('initialize', () => {
    it('should initialize the provider', async () => {
      await client.initialize();
      expect(mockProvider.initializeCalled).toBe(true);
    });
  });
  
  describe('cleanup', () => {
    it('should clean up the provider', async () => {
      await client.cleanup();
      expect(mockProvider.cleanupCalled).toBe(true);
    });
  });
  
  describe('getPhoneNumber', () => {
    it('should return a phone number from the provider', async () => {
      const phoneNumber = await client.getPhoneNumber();
      expect(phoneNumber).toBe(mockProvider.phoneNumber);
      expect(mockProvider.getPhoneNumberCalled).toBe(true);
    });
  });
  
  describe('getOtpCode', () => {
    it('should get OTP code using provided phone number', async () => {
      const otpCode = await client.getOtpCode('+11234567890');
      expect(otpCode).toBe(mockProvider.otpCode);
      expect(mockProvider.waitForOtpCodeCalled).toBe(true);
    });
    
    it('should use stored phone number if none provided', async () => {
      await client.getPhoneNumber(); // Store the phone number
      const otpCode = await client.getOtpCode();
      expect(otpCode).toBe(mockProvider.otpCode);
    });
    
    it('should throw error if no phone number is available', async () => {
      await expect(client.getOtpCode()).rejects.toThrow(/No phone number provided/);
    });
  });
  
  describe('getPhoneNumberAndOtpCode', () => {
    it('should return both phone number and OTP code', async () => {
      const result = await client.getPhoneNumberAndOtpCode();
      expect(result.phoneNumber).toBe(mockProvider.phoneNumber);
      expect(result.otpCode).toBe(mockProvider.otpCode);
      expect(mockProvider.getPhoneNumberCalled).toBe(true);
      expect(mockProvider.waitForOtpCodeCalled).toBe(true);
    });
  });
});
