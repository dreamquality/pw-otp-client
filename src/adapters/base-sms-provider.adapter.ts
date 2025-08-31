import { ISmsProvider } from '../interfaces/sms-provider.interface';

/**
 * Abstract base class for SMS provider implementations.
 * Provides common functionality and enforces implementation of the ISmsProvider interface.
 */
export abstract class BaseSmsProvider implements ISmsProvider {
  protected config: Record<string, any>;

  /**
   * Create a new SMS provider instance.
   * @param config Configuration options for the provider
   */
  constructor(config: Record<string, any> = {}) {
    this.config = config;
  }

  /**
   * Initialize the SMS provider.
   * This method should be overridden by concrete implementations.
   */
  public async initialize(): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Clean up resources used by the provider.
   * This method should be overridden by concrete implementations if necessary.
   */
  public async cleanup(): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Get a phone number for receiving SMS.
   * Must be implemented by concrete implementations.
   */
  public abstract getPhoneNumber(): Promise<string>;

  /**
   * Wait for and extract an OTP code from an SMS message.
   * Must be implemented by concrete implementations.
   * @param phoneNumber The phone number to monitor for SMS
   * @param timeout Timeout in milliseconds
   */
  public abstract waitForOtpCode(phoneNumber: string, timeout?: number): Promise<string>;
}
