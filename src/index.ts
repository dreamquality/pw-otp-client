// Export the main client
export { PlaywrightOtpClient, OtpClientConfig } from './otp-client';

// Export interfaces and base classes
export { ISmsProvider } from './interfaces/sms-provider.interface';
export { BaseSmsProvider } from './adapters/base-sms-provider.adapter';

// Export provider implementations
export { MailSlurpProvider, MailSlurpConfig } from './adapters/mailslurp-provider.adapter';
export { TwilioProvider, TwilioConfig } from './adapters/twilio-provider.adapter';
export { MailosaurProvider, MailosaurConfig } from './adapters/mailosaur-provider.adapter';

// Export utilities
export { OtpExtractor } from './utils/otp-extractor';

// Default export is the main client
import { PlaywrightOtpClient } from './otp-client';
export default PlaywrightOtpClient;
