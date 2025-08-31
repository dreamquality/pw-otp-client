import { Twilio } from 'twilio';
import { BaseSmsProvider } from './base-sms-provider.adapter';
import { OtpExtractor } from '../utils/otp-extractor';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromPhoneNumber?: string;
  pollingInterval?: number;
}

/**
 * Twilio SMS provider adapter.
 * Uses Twilio API to receive SMS messages and extract OTP codes.
 */
export class TwilioProvider extends BaseSmsProvider {
  private client: Twilio | null = null;
  private fromPhoneNumber: string | null = null;
  private pollingInterval: number;
  private lastCheckDate: Date | null = null;

  constructor(config: TwilioConfig) {
    super(config);
    if (!config.accountSid || !config.authToken) {
      throw new Error('Twilio account SID and auth token are required');
    }
    
    this.pollingInterval = config.pollingInterval || 2000; // Default polling interval: 2 seconds
    this.fromPhoneNumber = config.fromPhoneNumber || null;
  }

  /**
   * Initialize the Twilio client.
   */
  public async initialize(): Promise<void> {
    this.client = new Twilio(this.config.accountSid, this.config.authToken);
  }

  /**
   * Clean up Twilio resources.
   */
  public async cleanup(): Promise<void> {
    // No specific cleanup needed for Twilio
  }

  /**
   * Get a phone number for receiving SMS via Twilio.
   * Note: Twilio doesn't provide temporary phone numbers as easily as other services.
   * This method returns the configured "fromPhoneNumber" or throws an error if not set.
   * @returns A phone number in international format
   */
  public async getPhoneNumber(): Promise<string> {
    if (!this.client) {
      await this.initialize();
    }

    // If a fromPhoneNumber was provided in the config, return it
    if (this.fromPhoneNumber) {
      return this.fromPhoneNumber;
    }
    
    // Otherwise, try to get an existing phone number from the account
    try {
      const numbers = await this.client!.incomingPhoneNumbers.list({limit: 1});
      if (numbers.length > 0 && numbers[0].phoneNumber) {
        this.fromPhoneNumber = numbers[0].phoneNumber;
        return numbers[0].phoneNumber;
      }
    } catch (error) {
      throw new Error(`Failed to get phone number from Twilio: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    throw new Error('No phone number available in Twilio account. Please provide a fromPhoneNumber in the config.');
  }

  /**
   * Wait for an OTP code to be received via Twilio.
   * Uses polling to check for new messages.
   * @param phoneNumber The phone number to monitor (Twilio number that receives messages)
   * @param timeout Timeout in milliseconds (default: 30000)
   * @returns The extracted OTP code
   */
  public async waitForOtpCode(phoneNumber: string, timeout = 30000): Promise<string> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('Twilio client is not initialized');
    }
    
    // Set the start time for polling
    const startTime = Date.now();
    this.lastCheckDate = this.lastCheckDate || new Date();
    let dateFilter = this.lastCheckDate;
    
    // Polling loop
    while (Date.now() - startTime < timeout) {
      try {
        // Get messages sent to our Twilio number, filtered by date
        const messages = await this.client.messages.list({
          to: phoneNumber,
          dateSentAfter: dateFilter
        });
        
        // Update the last check date
        this.lastCheckDate = new Date();
        
        // Process messages in reverse order (newest first)
        for (const message of messages) {
          if (message.body) {
            // Try to extract OTP from message body
            const otpCode = OtpExtractor.extractOtpWithFallback(message.body);
            
            if (otpCode) {
              return otpCode;
            }
          }
        }
        
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
      } catch (error) {
        throw new Error(`Error polling Twilio for messages: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    throw new Error(`Timeout waiting for OTP code (${timeout}ms)`);
  }
}
