# Playwright OTP Client

[![npm version](https://img.shields.io/npm/v/pw-otp-client.svg)](https://www.npmjs.com/package/pw-otp-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.0-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-compatible-green.svg)](https://playwright.dev/)

A versatile NPM package for retrieving One-Time Password (OTP) codes from SMS messages in Playwright-based E2E UI tests.

## Features

- 🚀 Easily retrieve SMS OTP codes in your Playwright tests
- 🔄 Multiple SMS providers supported:
  - [MailSlurp](https://www.mailslurp.com/) (default)
  - [Twilio](https://www.twilio.com/)
  - [Mailosaur](https://mailosaur.com/)
  - Custom adapters through standard interface
- 🧩 Modular architecture with clean provider abstractions
- 🔧 Simple configuration through constructor options
- ⚙️ Comprehensive test coverage

## Installation

```bash
npm install pw-otp-client --save-dev
```

## Quick Start

```typescript
import { test, expect } from "@playwright/test";
import { PlaywrightOtpClient } from "pw-otp-client";

test("login with OTP", async ({ page }) => {
  // Initialize the OTP client with MailSlurp (default provider)
  const otpClient = new PlaywrightOtpClient({
    providerConfig: {
      apiKey: process.env.MAILSLURP_API_KEY,
    },
  });

  await otpClient.initialize();

  // Get a phone number for receiving SMS
  const phoneNumber = await otpClient.getPhoneNumber();

  // Navigate to your application and submit the phone number
  await page.goto("https://your-app.com/login");
  await page.fill("#phone-input", phoneNumber);
  await page.click("#send-otp-button");

  // Wait for the OTP code to arrive via SMS
  const otpCode = await otpClient.getOtpCode(phoneNumber);

  // Enter the OTP code in your application
  await page.fill("#otp-input", otpCode);
  await page.click("#verify-button");

  // Verify successful login
  await expect(page.locator(".welcome-message")).toBeVisible();

  // Clean up
  await otpClient.cleanup();
});
```

## SMS Provider Setup Guide

### MailSlurp (Default)

#### Getting API Key

1. **Create an account**:

   - Go to [MailSlurp website](https://www.mailslurp.com/)
   - Sign up for an account (free tier is available)

2. **Get your API key**:

   - Log in to your MailSlurp dashboard
   - Navigate to "API Keys" section
   - Copy your API key or generate a new one

3. **Configure in your tests**:

```typescript
import { PlaywrightOtpClient } from "pw-otp-client";

const otpClient = new PlaywrightOtpClient({
  provider: "mailslurp", // optional, this is the default
  providerConfig: {
    apiKey: "your-mailslurp-api-key",
  },
});
```

#### Phone Number Setup

With MailSlurp, the library will:

1. First try to use existing phone numbers in your account
2. If no numbers exist, attempt to create a new one (requires paid plan)

#### Environment Variables

Add to your `.env` file:

```
MAILSLURP_API_KEY=your_mailslurp_api_key_here
```

#### Common Issues and Solutions

| Issue                        | Solution                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| "Failed to get phone number" | Verify your API key is correct and your account has SMS enabled                     |
| "No SMS message received"    | Ensure your test app is sending messages to the correct phone number                |
| Phone number creation fails  | Check if your MailSlurp plan supports SMS (free tier has limited SMS functionality) |
| Timeout waiting for OTP      | Increase the timeout parameter in `getOtpCode` method                               |

### Twilio

#### Getting API Credentials

1. **Create an account**:

   - Sign up at [Twilio](https://www.twilio.com/)
   - Complete the verification process

2. **Get your credentials**:

   - From your Twilio dashboard, find your Account SID and Auth Token
   - These are located on your Twilio Console home page

3. **Set up phone number**:

   - Purchase a phone number from the Twilio Console
   - Make sure the number can receive SMS messages

4. **Configure in your tests**:

```typescript
import { PlaywrightOtpClient } from "pw-otp-client";

const otpClient = new PlaywrightOtpClient({
  provider: "twilio",
  providerConfig: {
    accountSid: "your-twilio-account-sid",
    authToken: "your-twilio-auth-token",
    fromPhoneNumber: "+12345678900", // Your Twilio phone number
  },
});
```

#### Phone Number Management

Unlike MailSlurp and Mailosaur, Twilio requires you to:

1. Purchase phone numbers manually through their console
2. Provide the number in your configuration
3. Ensure your account has sufficient funds for SMS reception

#### Environment Variables

Add to your `.env` file:

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_FROM_PHONE_NUMBER=+12345678900
```

#### Common Issues and Solutions

| Issue                       | Solution                                                               |
| --------------------------- | ---------------------------------------------------------------------- |
| Authentication failed       | Double-check your Account SID and Auth Token                           |
| "No phone number available" | Specify a `fromPhoneNumber` in the provider config                     |
| SMS delivery failures       | Ensure the phone number is correctly formatted with country code       |
| Rate limiting               | Twilio has API rate limits - add backoff logic for high-volume testing |
| Billing issues              | Verify your Twilio account has sufficient credit                       |

### Mailosaur

#### Getting API Key and Server ID

1. **Create an account**:

   - Sign up at [Mailosaur](https://mailosaur.com/)
   - Create a new server from your dashboard

2. **Get your API key**:

   - Go to API tab in your Mailosaur dashboard
   - Copy your API key

3. **Get your server ID**:

   - Select your server from the dashboard
   - Copy the server ID from the URL or server settings

4. **Configure in your tests**:

```typescript
import { PlaywrightOtpClient } from "pw-otp-client";

const otpClient = new PlaywrightOtpClient({
  provider: "mailosaur",
  providerConfig: {
    apiKey: "your-mailosaur-api-key",
    serverId: "your-mailosaur-server-id",
    phoneCountryCode: "US", // Optional, defaults to 'US'
  },
});
```

#### Phone Number Setup

Mailosaur will:

1. Check for existing SMS numbers on your server
2. If no numbers exist, attempt to create a new one (requires appropriate plan)
3. Return the phone number for testing

#### Environment Variables

Add to your `.env` file:

```
MAILOSAUR_API_KEY=your_mailosaur_api_key_here
MAILOSAUR_SERVER_ID=your_mailosaur_server_id_here
```

#### Common Issues and Solutions

| Issue                                | Solution                                              |
| ------------------------------------ | ----------------------------------------------------- |
| "API key and server ID are required" | Ensure both values are provided in your configuration |
| "Failed to create SMS number"        | Check if your plan includes SMS functionality         |
| No SMS detected                      | Verify the server has SMS capability enabled          |
| Message searching fails              | Check if your server exists and is active             |
| OTP extraction failure               | Try increasing timeout or check the message format    |

## Sending and Receiving SMS Messages

### Sending Test Messages

For testing your OTP client setup without integrating with your actual application:

#### Using Twilio for Sending Test Messages

```typescript
import twilio from "twilio";

async function sendTestSMS(to: string, message: string) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    const message = await client.messages.create({
      body: `Your verification code is: 123456`,
      from: process.env.TWILIO_FROM_PHONE_NUMBER,
      to: to,
    });

    console.log(`Message sent with SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error("Error sending test message:", error);
    return false;
  }
}

// Example usage
const phoneNumber = await otpClient.getPhoneNumber();
await sendTestSMS(phoneNumber, "Your verification code is: 123456");
const otpCode = await otpClient.getOtpCode(phoneNumber);
console.log(`Received OTP code: ${otpCode}`); // Should output: 123456
```

### Receiving and Parsing Messages

The OTP client handles message receiving and parsing automatically, but here's what happens behind the scenes:

1. **Message Polling**:

   - The client polls the SMS provider API at regular intervals
   - For Twilio and Mailosaur, this is approximately every 2 seconds
   - For MailSlurp, it uses the waitForLatestSms API when available

2. **OTP Extraction**:

   - The client uses various regex patterns to extract OTP codes
   - Default pattern looks for 4-8 digits after words like "code", "код", "otp", etc.
   - Fallback patterns are used if the default pattern doesn't match

3. **Timeout Handling**:
   - If no OTP is received within the timeout period, an error is thrown
   - Default timeout is 30 seconds but can be configured

## Troubleshooting

### General Issues

1. **No OTP code received**:

   - Verify the SMS was actually sent by your application
   - Check if the phone number format is correct (international format with country code)
   - Increase the timeout parameter (some providers or networks may be slow)
   - Check provider account for any delivery issues or logs

2. **Wrong OTP extracted**:
   - If the wrong digits are being extracted, provide a custom regex pattern:

```typescript
// Direct use of OTP extractor with custom pattern
import { OtpExtractor } from "pw-otp-client";

// Extract using a custom pattern that matches exactly 6 digits after "code:"
const message = "Your verification code: 123456";
const otpCode = OtpExtractor.extractOtp(message, /code:\s*(\d{6})/i);
```

3. **Provider API errors**:
   - Make sure your internet connection is stable
   - Check if provider services are operational
   - Verify your API credentials are current (some providers rotate keys)
   - Check if you've exceeded API rate limits or account quotas

### Debugging Tips

1. **Enable verbose logging**:

   ```typescript
   // Add this before using the OTP client
   process.env.DEBUG = "pw-otp-client:*";
   ```

2. **Manual message checking**:

   - Log in to your provider's dashboard to verify message delivery
   - Check if messages are being delivered but not matched by the OTP extraction

3. **Network issues**:
   - If testing behind corporate firewalls, ensure outbound connections to provider APIs are permitted
   - Check if proxy configuration is needed for your environment

## Custom SMS Provider

You can implement your own SMS provider by implementing the `ISmsProvider` interface:

```typescript
import {
  PlaywrightOtpClient,
  ISmsProvider,
  BaseSmsProvider,
} from "pw-otp-client";

class MyCustomSmsProvider extends BaseSmsProvider implements ISmsProvider {
  constructor(config: any) {
    super(config);
  }

  async initialize(): Promise<void> {
    // Initialize your SMS provider
  }

  async getPhoneNumber(): Promise<string> {
    // Get a phone number for receiving SMS
    return "+1234567890";
  }

  async waitForOtpCode(phoneNumber: string, timeout?: number): Promise<string> {
    // Wait for and extract OTP code from SMS
    return "123456";
  }

  async cleanup(): Promise<void> {
    // Clean up resources
  }
}

// Use your custom provider
const otpClient = new PlaywrightOtpClient({
  provider: "custom",
  customProvider: new MyCustomSmsProvider({
    // Your custom config
  }),
});
```

## API Reference

### PlaywrightOtpClient

The main class for interacting with SMS providers and retrieving OTP codes.

#### Constructor Options

```typescript
interface OtpClientConfig {
  provider?: "mailslurp" | "twilio" | "mailosaur" | "custom";
  providerConfig?: any;
  customProvider?: ISmsProvider;
  timeout?: number; // Default: 30000 (30 seconds)
}
```

#### Methods

- `initialize()`: Initialize the OTP client
- `cleanup()`: Clean up resources used by the client
- `getPhoneNumber()`: Get a phone number for receiving SMS
- `getOtpCode(phoneNumber?, timeout?)`: Wait for and extract OTP code from SMS
- `getPhoneNumberAndOtpCode(timeout?)`: Convenience method to get both phone number and OTP code

## CI Integration

To use this package in CI environments, you'll need to provide your SMS provider API credentials as environment variables.

### GitHub Actions Example

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        env:
          MAILSLURP_API_KEY: ${{ secrets.MAILSLURP_API_KEY }}
          # Add other provider keys as needed
        run: npx playwright test
```

### Environment Variables

Create a `.env` file in your project (and add it to `.gitignore`):

```
# MailSlurp configuration
MAILSLURP_API_KEY=your_mailslurp_api_key_here

# Twilio configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_FROM_PHONE_NUMBER=+12345678900  # Optional

# Mailosaur configuration
MAILOSAUR_API_KEY=your_mailosaur_api_key_here
MAILOSAUR_SERVER_ID=your_mailosaur_server_id_here
```

Then in your tests:

```typescript
import dotenv from "dotenv";
dotenv.config();

const otpClient = new PlaywrightOtpClient({
  provider: "mailslurp",
  providerConfig: {
    apiKey: process.env.MAILSLURP_API_KEY,
  },
});
```

## License

MIT © 2023-2024 [Alex Bobyr](https://github.com/dreamquality)

See [LICENSE](./LICENSE) for more information.
