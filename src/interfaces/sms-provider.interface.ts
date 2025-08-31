/**
 * Interface for SMS provider adapters.
 * All SMS provider implementations must implement this interface.
 */
export interface ISmsProvider {
  /**
   * Get a phone number for receiving SMS.
   * @returns Promise<string> A phone number in international format (e.g., +1234567890)
   */
  getPhoneNumber(): Promise<string>;
  
  /**
   * Wait for an OTP code to be received via SMS.
   * @param phoneNumber The phone number to wait for SMS on
   * @param timeout Optional timeout in milliseconds (default: 30000)
   * @returns Promise<string> The extracted OTP code
   */
  waitForOtpCode(phoneNumber: string, timeout?: number): Promise<string>;
  
  /**
   * Initialize the SMS provider with necessary configuration.
   * @returns Promise<void>
   */
  initialize(): Promise<void>;
  
  /**
   * Clean up any resources used by the SMS provider.
   * @returns Promise<void>
   */
  cleanup(): Promise<void>;
}
