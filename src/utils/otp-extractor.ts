/**
 * Utility class for extracting OTP codes from text messages.
 */
export class OtpExtractor {
  /**
   * Extract an OTP code from a message using a regular expression.
   * 
   * @param message The message text to extract the OTP from
   * @param pattern Optional custom regex pattern, defaults to common OTP patterns
   * @returns The extracted OTP code or null if not found
   */
  public static extractOtp(message: string, pattern?: RegExp): string | null {
    // Default pattern looks for 4-8 digit codes
    const defaultPattern = /(?:code|код|otp|password|пароль)[^\d]*(\d{4,8})/i;
    const regex = pattern || defaultPattern;
    
    const match = message.match(regex);
    return match ? match[1] : null;
  }
  
  /**
   * Attempts to extract an OTP code using multiple common patterns.
   * 
   * @param message The message text to extract the OTP from
   * @returns The extracted OTP code or null if not found
   */
  public static extractOtpWithFallback(message: string): string | null {
    // Try with the default pattern first
    const defaultResult = this.extractOtp(message);
    if (defaultResult) return defaultResult;
    
    // Fallback patterns
    const patterns = [
      // Just digits in isolation (4-8 digits)
      /\b(\d{4,8})\b/,
      // Digits after specific keywords
      /verification.*?(\d{4,8})/i,
      /confirm.*?(\d{4,8})/i,
      /one-time.*?(\d{4,8})/i,
      // More aggressive extraction of any 6 digits
      /(\d{6})/
    ];
    
    for (const pattern of patterns) {
      const result = this.extractOtp(message, pattern);
      if (result) return result;
    }
    
    return null;
  }
}
