import { MailSlurp } from 'mailslurp-client';
import { BaseSmsProvider } from './base-sms-provider.adapter';
import { OtpExtractor } from '../utils/otp-extractor';

export interface MailSlurpConfig {
  apiKey: string;
  timeout?: number;
}

/**
 * MailSlurp SMS provider adapter.
 * Uses MailSlurp API to receive SMS messages and extract OTP codes.
 */
export class MailSlurpProvider extends BaseSmsProvider {
  private client: any = null;
  private phoneId: string | null = null;

  constructor(config: MailSlurpConfig) {
    super(config);
    if (!config.apiKey) {
      throw new Error('MailSlurp API key is required');
    }
  }

  /**
   * Initialize the MailSlurp client.
   */
  public async initialize(): Promise<void> {
    // Create client with API key
    this.client = new MailSlurp({ apiKey: this.config.apiKey });
  }

  /**
   * Clean up MailSlurp resources.
   */
  public async cleanup(): Promise<void> {
    // No specific cleanup needed for MailSlurp
  }

  /**
   * Get a phone number for receiving SMS via MailSlurp.
   * @returns A phone number in international format
   */
  public async getPhoneNumber(): Promise<string> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      // Use any to bypass type checking
      const phoneController: any = this.client.phoneController;
      
      // First try to get existing phone numbers
      const phoneNumbers = await phoneController.getPhoneNumbers({});
      
      // Check if we have existing phone numbers
      if (phoneNumbers && phoneNumbers.content && phoneNumbers.content.length > 0) {
        // Use existing phone number
        const phone = phoneNumbers.content[0];
        this.phoneId = phone.id;
        return phone.phoneNumber;
      }
      
      // Otherwise try to create a new phone number
      try {
        const createOptions = { createPhoneNumberOptions: { phoneCountry: 'US' } };
        const phone = await phoneController.createPhoneNumber(createOptions);
        this.phoneId = phone.id;
        return phone.phoneNumber;
      } catch (createError) {
        throw new Error(`Could not create phone number: ${createError instanceof Error ? createError.message : String(createError)}`);
      }
    } catch (error) {
      throw new Error(`Failed to get phone number from MailSlurp: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Wait for an OTP code to be received via MailSlurp.
   * @param phoneNumber The phone number to monitor
   * @param timeout Timeout in milliseconds (default: 30000)
   * @returns The extracted OTP code
   */
  public async waitForOtpCode(phoneNumber: string, timeout = 30000): Promise<string> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.phoneId) {
      throw new Error('No phone ID available. Call getPhoneNumber() first.');
    }
    
    try {
      // Use any to bypass type checking for API
      const phoneController: any = this.client.phoneController;
      
      // Try to use the waitForLatestSms method if available
      try {
        const waitOptions = {
          phoneNumberId: this.phoneId,
          timeout,
          unreadOnly: true
        };
        
        const sms = await phoneController.waitForLatestSms(waitOptions);
        if (!sms || !sms.body) {
          throw new Error('No SMS message received or message body is empty');
        }
        
        const otpCode = OtpExtractor.extractOtpWithFallback(sms.body);
        if (otpCode) return otpCode;
        
        throw new Error(`Could not extract OTP code from message: ${sms.body}`);
      } catch (waitError) {
        // Fallback to polling if waitForLatestSms is not available or fails
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
          // Get latest messages
          const messages = await phoneController.getPhoneMessages(this.phoneId, {});
          
          if (messages && Array.isArray(messages.content)) {
            // Look for OTP in messages
            for (const message of messages.content) {
              if (message && message.body) {
                const otpCode = OtpExtractor.extractOtpWithFallback(message.body);
                if (otpCode) return otpCode;
              }
            }
          }
          
          // Wait before polling again
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        throw new Error(`Timeout waiting for OTP code (${timeout}ms)`);
      }
    } catch (error) {
      throw new Error(`Failed to get OTP code from MailSlurp: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
