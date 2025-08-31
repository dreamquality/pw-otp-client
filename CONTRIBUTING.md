# Contributing to Playwright OTP Client

Thank you for considering contributing to the Playwright OTP Client library! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct, which is to be respectful and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

- Check the issue tracker to see if the bug has already been reported
- If not, create a new issue
- Include a clear title and description
- Add as much relevant information as possible (OS, Node.js version, library version)
- Include steps to reproduce the issue
- If possible, include a minimal code example that demonstrates the issue

### Suggesting Enhancements

- Check the issue tracker to see if your enhancement has already been suggested
- If not, create a new issue
- Clearly describe the enhancement and its benefits
- Provide examples of how the enhancement would be used

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bugfix (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Write or update tests as necessary
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -am 'Add your feature or fix'`)
7. Push to the branch (`git push origin feature/your-feature-name`)
8. Submit a pull request

## Development Setup

1. Clone the repository

   ```bash
   git clone https://github.com/dreamquality/pw-otp-client.git
   cd pw-otp-client
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Build the project

   ```bash
   npm run build
   ```

4. Run tests
   ```bash
   npm test
   ```

## Testing

- Write unit tests for new functionality
- Update existing tests when changing functionality
- Run the full test suite before submitting pull requests
- Integration tests that require SMS provider credentials can be run with:
  ```bash
  npm run test:integration
  ```

## Coding Guidelines

- Follow the existing code style and formatting
- Use TypeScript for all new code
- Document public APIs with JSDoc comments
- Write clear commit messages that explain the why, not just the what

## Adding a New SMS Provider

If you're adding support for a new SMS provider:

1. Create a new adapter in `src/adapters/your-provider.adapter.ts`
2. Extend the `BaseSmsProvider` class and implement the `ISmsProvider` interface
3. Add appropriate configuration options and documentation
4. Write unit tests for your provider
5. Update the documentation to include your new provider
6. Add the provider to the main OtpClient class

## Release Process

Project maintainers will handle releases according to the following process:

1. Update version in package.json according to semantic versioning
2. Update CHANGELOG.md with notable changes
3. Create a GitHub release with release notes
4. Publish to npm

## Questions?

If you have any questions or need help, please open an issue or contact the maintainers directly.

Thank you for your contributions!
