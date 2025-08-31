# Release Process

This document outlines the process for releasing new versions of pw-otp-client.

## Release Checklist

1. **Ensure all tests pass**

   ```bash
   npm test
   ```

2. **Update version number**

   - Update version in `package.json` according to [Semantic Versioning](https://semver.org/)
   - For breaking changes, increment the major version
   - For new features, increment the minor version
   - For bug fixes, increment the patch version

3. **Update CHANGELOG.md**

   - Add new version section at the top
   - Document all notable changes, following the Keep a Changelog format
   - Use categories: Added, Changed, Deprecated, Removed, Fixed, Security

4. **Build the project to verify everything compiles correctly**

   ```bash
   npm run build
   ```

5. **Create a release commit**

   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Release vX.Y.Z"
   ```

6. **Create a Git tag**

   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   ```

7. **Push to GitHub**

   ```bash
   git push origin main
   git push origin vX.Y.Z
   ```

8. **Create a GitHub release**

   - Go to the [Releases page](https://github.com/dreamquality/pw-otp-client/releases)
   - Click "Draft a new release"
   - Select the tag you just pushed
   - Title the release "vX.Y.Z"
   - Copy the relevant section from CHANGELOG.md into the description
   - Click "Publish release"

9. **Publish to npm**

   ### Option 1: Manual publishing

   ```bash
   npm login  # If not already logged in
   npm publish
   ```

   ### Option 2: Automated publishing via GitHub Actions

   The GitHub Actions workflow will automatically publish the package when you create a release.
   Make sure you have set the `NPM_TOKEN` secret in your GitHub repository settings.

## Post-Release

1. **Announce the release**

   - Notify users via appropriate channels

2. **Update documentation**

   - Ensure documentation site is updated if applicable

3. **Start next development cycle**
   - Create a new section in CHANGELOG.md for the next version (if needed)

## Handling Hotfixes

1. **Create a hotfix branch from the tag**

   ```bash
   git checkout -b hotfix/vX.Y.Z vX.Y.Z
   ```

2. **Make necessary fixes**

3. **Follow the normal release process**

   - Update version (increment patch)
   - Update changelog
   - Create commit and tag
   - Publish to npm

4. **Merge the hotfix back to main**
   ```bash
   git checkout main
   git merge hotfix/vX.Y.Z
   git push origin main
   ```

## Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/). In summary:

- **MAJOR** version for incompatible API changes
- **MINOR** version for adding functionality in a backward compatible manner
- **PATCH** version for backward compatible bug fixes
