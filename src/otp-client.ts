import { ISmsProvider } from './interfaces/sms-provider.interface';
import { MailSlurpProvider, MailSlurpConfig } from './adapters/mailslurp-provider.adapter';
import { TwilioProvider, TwilioConfig } from './adapters/twilio-provider.adapter';
import { MailosaurProvider, MailosaurConfig } from './adapters/mailosaur-provider.adapter';

export interface OtpClientConfig {
  provider?: 'mailslurp' | 'twilio' | 'mailosaur' | 'custom';
  providerConfig?: MailSlurpConfig | TwilioConfig | MailosaurConfig | Record<string, any>;
  customProvider?: ISmsProvider;
  timeout?: number;
}

/**
 * PlaywrightOtpClient - Main class for retrieving OTP codes from SMS.
 * Integrates with Playwright for e2e testing.
 */
export class PlaywrightOtpClient {
  private provider: ISmsProvider;
  private timeout: number;
  private currentPhoneNumber: string | null = null;

  /**
   * Create a new OTP client instance.
   * @param config Configuration options for the client
   */
  constructor(config: OtpClientConfig = {}) {
    this.timeout = config.timeout || 30000;
    
    // Determine which provider to use
    if (config.customProvider) {
      // Use custom provider if provided
      this.provider = config.customProvider;
    } else {
      // Default to MailSlurp if no provider specified
      const providerType = config.provider || 'mailslurp';
      const providerConfig = config.providerConfig || {};
      
      switch (providerType) {
        case 'mailslurp':
          this.provider = new MailSlurpProvider(providerConfig as MailSlurpConfig);
          break;
        case 'twilio':
          this.provider = new TwilioProvider(providerConfig as TwilioConfig);
          break;
        case 'mailosaur':
          this.provider = new MailosaurProvider(providerConfig as MailosaurConfig);
          break;
        default:
          throw new Error(`Unsupported provider type: ${providerType}`);
      }
    }
  }

  /**
   * Initialize the OTP client and the underlying provider.
   * @returns Promise<void>
   */
  public async initialize(): Promise<void> {
    await this.provider.initialize();
  }

  /**
   * Clean up resources used by the OTP client.
   * @returns Promise<void>
   */
  public async cleanup(): Promise<void> {
    await this.provider.cleanup();
  }

  /**
   * Get a phone number for receiving SMS.
   * @returns Promise<string> A phone number in international format
   */
  public async getPhoneNumber(): Promise<string> {
    this.currentPhoneNumber = await this.provider.getPhoneNumber();
    return this.currentPhoneNumber;
  }

  /**
   * Wait for an OTP code to be received via SMS.
   * If no phone number is provided, uses the phone number from the last getPhoneNumber() call.
   * 
   * @param phoneNumber Optional phone number to use (if different from the one obtained with getPhoneNumber)
   * @param timeout Optional timeout in milliseconds (overrides the timeout set in the constructor)
   * @returns Promise<string> The extracted OTP code
   */
  public async getOtpCode(phoneNumber?: string, timeout?: number): Promise<string> {
    const phoneToUse = phoneNumber || this.currentPhoneNumber;
    if (!phoneToUse) {
      throw new Error('No phone number provided. Call getPhoneNumber() first or provide a phoneNumber parameter.');
    }
    
    const timeoutToUse = timeout || this.timeout;
    return this.provider.waitForOtpCode(phoneToUse, timeoutToUse);
  }

  /**
   * Convenience method to get a phone number and then wait for an OTP code.
   * Useful for quick, one-off OTP retrieval.
   * 
   * @param timeout Optional timeout in milliseconds for waiting for the OTP
   * @returns Promise<{phoneNumber: string, otpCode: string}> Object containing both the phone number and OTP code
   */
  public async getPhoneNumberAndOtpCode(timeout?: number): Promise<{phoneNumber: string, otpCode: string}> {
    const phoneNumber = await this.getPhoneNumber();
    const otpCode = await this.getOtpCode(phoneNumber, timeout);
    
    return { phoneNumber, otpCode };
  }
}

// Export all components for usage
export * from './interfaces/sms-provider.interface';
export * from './adapters/base-sms-provider.adapter';
export * from './adapters/mailslurp-provider.adapter';
export * from './adapters/twilio-provider.adapter';
export * from './adapters/mailosaur-provider.adapter';
export * from './utils/otp-extractor';
