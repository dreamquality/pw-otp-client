import { OtpExtractor } from '../../src/utils/otp-extractor';

describe('OtpExtractor', () => {
  describe('extractOtp', () => {
    it('should extract OTP from a message with default pattern', () => {
      const message = 'Your verification code is 123456. Do not share it with anyone.';
      const otp = OtpExtractor.extractOtp(message);
      expect(otp).toBe('123456');
    });

    it('should extract OTP with Russian keywords', () => {
      const message = 'Ваш код подтверждения: 654321';
      const otp = OtpExtractor.extractOtp(message);
      expect(otp).toBe('654321');
    });

    it('should extract OTP with a custom pattern', () => {
      const message = 'ABC-123-456';
      const pattern = /ABC-(\d{3})-\d{3}/;
      const otp = OtpExtractor.extractOtp(message, pattern);
      expect(otp).toBe('123');
    });

    it('should return null when no OTP is found', () => {
      const message = 'This message does not contain an OTP code';
      const otp = OtpExtractor.extractOtp(message);
      expect(otp).toBeNull();
    });
  });

  describe('extractOtpWithFallback', () => {
    it('should extract OTP with the default pattern', () => {
      const message = 'Your verification code is 123456';
      const otp = OtpExtractor.extractOtpWithFallback(message);
      expect(otp).toBe('123456');
    });

    it('should extract OTP with a fallback pattern if default fails', () => {
      const message = 'Please use 987654 to verify your account.';
      const otp = OtpExtractor.extractOtpWithFallback(message);
      expect(otp).toBe('987654');
    });

    it('should extract isolated digits', () => {
      const message = 'Important message: 123456. Keep it secure.';
      const otp = OtpExtractor.extractOtpWithFallback(message);
      expect(otp).toBe('123456');
    });

    it('should return null when no pattern matches', () => {
      const message = 'This message has no digits at all.';
      const otp = OtpExtractor.extractOtpWithFallback(message);
      expect(otp).toBeNull();
    });
  });
});
