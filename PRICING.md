# SMS Provider Pricing & Alternatives

This document provides information about pricing structures, limitations, and alternatives for SMS-based OTP verification services that can be used with the pw-otp-client library.

## Provider Pricing Comparison

### MailSlurp

**Overview:** MailSlurp offers virtual phone numbers for SMS reception in testing environments.

| Plan | Price | SMS Numbers | Monthly SMS | Features |
|------|-------|-------------|-------------|----------|
| Free | $0 | 1 | 50 | Basic API access, 1 hour inbox retention |
| Developer | $9.99/month | 2 | 250 | 30 day retention, priority support |
| Team | $49.99/month | 10 | 1,000 | 60 day retention, webhook notifications |
| Enterprise | Custom pricing | Custom | Custom | SLA, dedicated support, custom retention |

**Notable Features:**
- API access for automation
- Multiple country number options
- Team collaboration features
- Webhook support for real-time notifications

**Limitations:**
- Free plan has limited retention
- SMS delivery can occasionally be delayed
- Regional restrictions may apply in some countries

**Documentation:** [MailSlurp Pricing](https://www.mailslurp.com/pricing/)

### Twilio

**Overview:** Twilio provides a robust SMS infrastructure with global reach, primarily focused on production environments but usable for testing.

| SMS Pricing Model | Cost |
|------------------|------|
| Phone Numbers | $1.00/month per number |
| Incoming SMS | $0.0075 per message |
| Outgoing SMS | $0.0075-$0.12 per message (varies by country) |

**Volume Discounts:**
- 0-250K messages: Standard pricing
- 250K-1M messages: 10% discount
- 1M+ messages: Contact sales for custom pricing

**Notable Features:**
- Extensive global coverage
- High reliability and delivery rates
- Comprehensive API documentation
- Support for long codes and short codes
- Message scheduling and queuing

**Limitations:**
- Higher cost for testing purposes
- Requires compliance with telecom regulations
- More complex setup than testing-specific services

**Documentation:** [Twilio Pricing](https://www.twilio.com/sms/pricing)

### Mailosaur

**Overview:** Mailosaur provides both email and SMS testing capabilities with a focus on automated testing environments.

| Plan | Price | SMS Numbers | Monthly SMS | Features |
|------|-------|-------------|-------------|----------|
| Indie | $19/month | 1 | 50 | Basic SMS testing, 1 server |
| Teams | $59/month | 3 | 150 | Multiple users, 5 servers |
| Enterprise | Custom pricing | Custom | Custom | SLA, priority support, custom volume |

**Notable Features:**
- Combined email and SMS testing
- Seamless integration with testing frameworks
- API for automation
- Server-based organization system
- GDPR compliant

**Limitations:**
- Limited SMS volume in lower tiers
- Fewer country options than specialized SMS providers
- Primarily designed for testing, not production use

**Documentation:** [Mailosaur Pricing](https://mailosaur.com/pricing/)

## Alternative OTP Acquisition Methods

### Custom API Endpoint

**Implementation:** Develop an internal service that generates and validates OTP codes without relying on third-party SMS providers.

**Architecture Options:**
1. **Centralized OTP Service**
   - Create a microservice that generates, stores, and validates OTP codes
   - Expose endpoints for OTP generation and validation
   - Integrate with your testing framework via API calls

2. **Test Environment Bypass**
   - Implement a "test mode" in your application that shows OTP codes directly
   - Create an API endpoint that returns the most recently generated OTP for a given phone number
   - Use environment variables to control OTP visibility in different environments

**Sample Implementation:**
```typescript
// Example of a simple Express.js OTP service
import express from 'express';
import { randomInt } from 'crypto';

const app = express();
const otpStore = new Map<string, {code: string, timestamp: number}>();

app.use(express.json());

// Generate OTP endpoint
app.post('/generate-otp', (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }
  
  const code = randomInt(100000, 999999).toString();
  otpStore.set(phoneNumber, { 
    code, 
    timestamp: Date.now() 
  });
  
  return res.json({ success: true, phoneNumber });
});

// Verify OTP endpoint
app.post('/verify-otp', (req, res) => {
  const { phoneNumber, code } = req.body;
  
  if (!phoneNumber || !code) {
    return res.status(400).json({ error: 'Phone number and code required' });
  }
  
  const storedData = otpStore.get(phoneNumber);
  
  if (!storedData) {
    return res.status(404).json({ error: 'No OTP found for this number' });
  }
  
  // Check if OTP is still valid (10 minute expiry)
  if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
    otpStore.delete(phoneNumber);
    return res.status(401).json({ error: 'OTP expired' });
  }
  
  // Check if OTP matches
  if (storedData.code !== code) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }
  
  // OTP is valid, clear it to prevent reuse
  otpStore.delete(phoneNumber);
  return res.json({ success: true });
});

// Retrieve OTP for testing (test environments only)
app.get('/retrieve-otp', (req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    return res.status(403).json({ error: 'Endpoint only available in test environment' });
  }
  
  const phoneNumber = req.query.phoneNumber as string;
  
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }
  
  const storedData = otpStore.get(phoneNumber);
  
  if (!storedData) {
    return res.status(404).json({ error: 'No OTP found for this number' });
  }
  
  return res.json({ phoneNumber, code: storedData.code });
});

app.listen(3000, () => {
  console.log('OTP service running on port 3000');
});
```

### Mock SMS Provider

Create a mock implementation of the ISmsProvider interface for testing environments:

```typescript
import { ISmsProvider } from 'pw-otp-client';

export class MockSmsProvider implements ISmsProvider {
  private phoneNumbers: Map<string, string> = new Map();
  
  async initialize(): Promise<void> {
    // No initialization needed
  }
  
  async cleanup(): Promise<void> {
    this.phoneNumbers.clear();
  }
  
  async getPhoneNumber(): Promise<string> {
    // Generate a random phone number
    const phoneNumber = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    // Store with a predetermined OTP code
    this.phoneNumbers.set(phoneNumber, '123456');
    return phoneNumber;
  }
  
  async waitForOtpCode(phoneNumber: string, timeout?: number): Promise<string> {
    // Return the predetermined code
    const code = this.phoneNumbers.get(phoneNumber) || '123456';
    return code;
  }
}

// Usage with pw-otp-client
import { PlaywrightOtpClient } from 'pw-otp-client';

const mockProvider = new MockSmsProvider();
const otpClient = new PlaywrightOtpClient({
  provider: 'custom',
  customProvider: mockProvider
});
```

### Database Integration

For full-stack testing, implement a solution that directly queries your application's database:

```typescript
import { ISmsProvider } from 'pw-otp-client';
import { Pool } from 'pg'; // Example using PostgreSQL

export class DatabaseOtpProvider implements ISmsProvider {
  private pool: Pool;
  private currentPhoneNumber: string | null = null;
  
  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
    });
  }
  
  async initialize(): Promise<void> {
    // Verify database connection
    await this.pool.query('SELECT 1');
  }
  
  async cleanup(): Promise<void> {
    await this.pool.end();
  }
  
  async getPhoneNumber(): Promise<string> {
    // Generate a test phone number
    this.currentPhoneNumber = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    return this.currentPhoneNumber;
  }
  
  async waitForOtpCode(phoneNumber: string, timeout = 30000): Promise<string> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      // Query the database directly for the OTP code
      const result = await this.pool.query(
        'SELECT code FROM otp_codes WHERE phone_number = $1 ORDER BY created_at DESC LIMIT 1',
        [phoneNumber]
      );
      
      if (result.rows.length > 0) {
        return result.rows[0].code;
      }
      
      // Wait before trying again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Timeout waiting for OTP code (${timeout}ms)`);
  }
}
```

## Free and Self-Hosted Alternatives

### SMS Gateways

1. **SMSTools3**
   - **Description:** Open-source SMS gateway software that can be used with GSM modems
   - **Features:** Send/receive SMS, run as a service, API integration
   - **Link:** [SMSTools3](http://smstools3.kekekasvi.com/)
   - **Cost:** Free, requires hardware (GSM modem + SIM card)

2. **Kannel**
   - **Description:** Open-source WAP and SMS gateway
   - **Features:** High performance, scalable, configurable
   - **Link:** [Kannel](https://www.kannel.org/)
   - **Cost:** Free, requires setup and infrastructure

### Mock Authentication Services

1. **MockOTP**
   - **Description:** Simple mock OTP service for development and testing
   - **Features:** API for generating and validating OTPs, no actual SMS sending
   - **Link:** [MockOTP on GitHub](https://github.com/example/mockotp) (example)
   - **Cost:** Free

2. **JSON Server + Custom Middleware**
   - **Description:** Use JSON Server with custom routes to mock OTP functionality
   - **Link:** [JSON Server](https://github.com/typicode/json-server)
   - **Cost:** Free, requires implementation

### Hardware Solutions

1. **SIM Banks**
   - **Description:** Physical devices that hold multiple SIM cards for SMS reception
   - **Features:** API access, multiple numbers, real SMS reception
   - **Cost:** $300-1000 for hardware + SIM card costs

2. **GSM Modems**
   - **Description:** Connect USB GSM modems to your servers to send/receive SMS
   - **Features:** Real SMS processing, direct hardware access
   - **Cost:** $20-100 per modem + SIM card costs

## Comparison of Approaches

| Approach | Setup Complexity | Maintenance | Cost | Reliability | Best For |
|----------|------------------|-------------|------|------------|----------|
| Commercial SMS Services | Low | Low | Medium-High | High | Production apps, cross-region testing |
| Custom API Endpoint | Medium | Low | Low | High | Internal applications, controlled environments |
| Mock SMS Provider | Low | Low | None | High | Unit/integration testing |
| Database Integration | Medium | Medium | None | High | Full-stack testing of existing apps |
| Self-hosted SMS Gateway | High | High | Low-Medium | Medium | Organizations with privacy requirements |
| Hardware Solutions | High | High | Medium | Medium | Long-term testing infrastructure |

## Additional Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [SMS vs. App-based 2FA Comparison](https://www.ncsc.gov.uk/guidance/authentication-methods)

## Conclusion

When selecting an SMS provider or alternative OTP solution for your testing needs, consider:

1. **Budget constraints:** Commercial services provide convenience but at a cost
2. **Testing volume:** Higher volumes may justify investment in self-hosted solutions
3. **Security requirements:** Some industries have specific compliance needs
4. **Geographic coverage:** Ensure your solution works in all required regions
5. **Integration complexity:** Balance setup effort against long-term maintenance

For most testing scenarios, a combination of commercial services (for complex integration testing) and mock providers (for unit/component testing) offers the best balance of cost and functionality.
