import MailosaurClient from 'mailosaur';
import { BaseSmsProvider } from './base-sms-provider.adapter';
import { OtpExtractor } from '../utils/otp-extractor';

export interface MailosaurConfig {
  apiKey: string;
  serverId: string;
  phoneCountryCode?: string;
  timeout?: number;
}

/**
 * Mailosaur SMS provider adapter.
 * Uses Mailosaur API to receive SMS messages and extract OTP codes.
 */
export class MailosaurProvider extends BaseSmsProvider {
  private client: any = null;
  private phoneNumber: string | null = null;

  constructor(config: MailosaurConfig) {
    super(config);
    if (!config.apiKey || !config.serverId) {
      throw new Error('Mailosaur API key and server ID are required');
    }
  }

  /**
   * Initialize the Mailosaur client.
   */
  public async initialize(): Promise<void> {
    this.client = new MailosaurClient(this.config.apiKey);
  }

  /**
   * Clean up Mailosaur resources.
   */
  public async cleanup(): Promise<void> {
    // No specific cleanup needed for Mailosaur
  }

  /**
   * Get a phone number for receiving SMS via Mailosaur.
   * @returns A phone number in international format
   */
  public async getPhoneNumber(): Promise<string> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      // Use any type to bypass type checking issues
      const servers: any = this.client.servers;
      
      // Get server details
      const server = await servers.get(this.config.serverId);
      
      // Check if server has SMS numbers
      if (server && Array.isArray(server.smsNumbers) && server.smsNumbers.length > 0) {
        // Use existing phone number
        const number: string = server.smsNumbers[0].number;
        this.phoneNumber = number;
        return number;
      }
      
      // If no SMS numbers found, try to create one if the API supports it
      try {
        const phoneCountryCode = this.config.phoneCountryCode || 'US';
        const phoneNumber = await servers.createSmsNumber(this.config.serverId, { 
          countryCode: phoneCountryCode 
        });
        
        if (phoneNumber && phoneNumber.number) {
          const number: string = phoneNumber.number;
          this.phoneNumber = number;
          return number;
        }
        
        throw new Error('Failed to create SMS number');
      } catch (createError) {
        throw new Error(`Could not create SMS number: ${createError instanceof Error ? createError.message : String(createError)}`);
      }
    } catch (error) {
      throw new Error(`Failed to get phone number from Mailosaur: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Wait for an OTP code to be received via Mailosaur.
   * @param phoneNumber The phone number to monitor
   * @param timeout Timeout in milliseconds (default: 30000)
   * @returns The extracted OTP code
   */
  public async waitForOtpCode(phoneNumber: string, timeout = 30000): Promise<string> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.config.serverId) {
      throw new Error('Mailosaur server ID is required');
    }
    
    try {
      // Use any to bypass type checking for API
      const messages: any = this.client.messages;
      
      // Try to use waitForSms method if available
      try {
        const message = await messages.waitForSms({
          server: this.config.serverId,
          receivedAfter: new Date(),
          timeout
        });
        
        if (message && message.text) {
          const otpCode = OtpExtractor.extractOtpWithFallback(message.text);
          if (otpCode) return otpCode;
        }
        
        throw new Error('Could not extract OTP from received message');
      } catch (waitError) {
        // Fallback to polling if waitForSms is not available
        const startTime = Date.now();
        const receivedAfter = new Date(startTime);
        
        while (Date.now() - startTime < timeout) {
          try {
            // Search for SMS messages
            const searchCriteria = {
              server: this.config.serverId,
              receivedAfter,
              itemsPerPage: 10
            };
            
            const result = await messages.search(searchCriteria);
            
            // Check for messages with OTP
            if (result && result.items && Array.isArray(result.items)) {
              for (const msg of result.items) {
                if (msg.type === 'sms' && msg.text) {
                  const otpCode = OtpExtractor.extractOtpWithFallback(msg.text);
                  if (otpCode) return otpCode;
                }
              }
            }
          } catch (searchError) {
            console.error('Error searching for messages:', searchError);
          }
          
          // Wait before polling again
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        throw new Error(`Timeout waiting for OTP code (${timeout}ms)`);
      }
    } catch (error) {
      throw new Error(`Failed to get OTP code from Mailosaur: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
