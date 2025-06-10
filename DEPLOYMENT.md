# 🚀 Deployment Guide

This guide explains how to set up automated deployment to npm using GitHub Actions.

## 📋 Prerequisites

1. **NPM Account**: Ensure you have an npm account and are logged in
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **NPM Token**: Generate an npm access token for automated publishing

## 🔐 Setup NPM Token

### Step 1: Generate NPM Access Token

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Go to your profile → **Access Tokens**
3. Click **"Generate New Token"**
4. Choose **"Automation"** (for CI/CD use)
5. Copy the generated token

### Step 2: Add NPM Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **"Add secret"**

## 🔄 Automated Workflows

We've set up three GitHub Actions workflows:

### 1. NPM Publish (`npm-publish.yml`)
**Triggers**: When you create a release or push a version tag
**Purpose**: Simple, direct publishing to npm

```yaml
# Triggered on:
# - Creating a GitHub release
# - Pushing tags like v1.0.1
```

### 2. CI/CD Pipeline (`ci-cd.yml`)
**Triggers**: Push to main, PRs, releases
**Purpose**: Complete testing and deployment pipeline

**Features**:
- ✅ Tests on Node.js 18, 20, 22
- 🔒 Security audits
- 📊 Code coverage
- 🚀 Conditional npm publishing
- 📦 Release asset generation

### 3. Version Bump (`version-bump.yml`)
**Triggers**: Manual workflow dispatch
**Purpose**: Automated version management

**Features**:
- 🔢 Bump patch/minor/major versions
- 📝 Auto-generate changelog
- 🏷️ Create git tags
- 📋 Create GitHub releases

## 🎯 Deployment Methods

### Method 1: Create GitHub Release (Recommended)

1. Go to your repository → **Releases**
2. Click **"Create a new release"**
3. Choose a tag (e.g., `v1.0.1`) or create new one
4. Add release title and description
5. Click **"Publish release"**

✅ This will automatically:
- Run tests
- Build the package
- Publish to npm
- Attach build artifacts

### Method 2: Use Version Bump Workflow

1. Go to **Actions** → **Version Bump and Release**
2. Click **"Run workflow"**
3. Choose version type (patch/minor/major)
4. Add release notes (optional)
5. Click **"Run workflow"**

✅ This will automatically:
- Bump version in package.json
- Update CHANGELOG.md
- Create git tag
- Create GitHub release
- Trigger npm publishing

### Method 3: Manual Tag Push

```bash
# Bump version manually
npm version patch  # or minor/major

# Push the tag
git push origin v1.0.1
```

## 🔧 Configuration

### Package.json Scripts
Ensure these scripts exist in your `package.json`:

```json
{
  "scripts": {
    "build": "medusa plugin:build",
    "test": "jest --testPathPattern=src",
    "test:unit": "jest --testPathPattern=src --testPathIgnorePatterns=integration-tests",
    "test:integration": "jest --testPathPattern=integration-tests",
    "test:coverage": "jest --coverage",
    "prepublishOnly": "medusa plugin:build"
  }
}
```

### Environment Variables

The workflows use these environment variables:
- `NPM_TOKEN`: Your npm access token (from GitHub secrets)
- `GITHUB_TOKEN`: Automatically provided by GitHub

## 📊 Monitoring

### Check Deployment Status

1. **GitHub Actions**: Go to **Actions** tab to see workflow runs
2. **NPM Package**: Check https://www.npmjs.com/package/medusa-payment-ipay
3. **Release Assets**: View in **Releases** section

### Troubleshooting

**Common Issues**:

1. **NPM_TOKEN not set**: Add the secret in repository settings
2. **Version already exists**: The workflow checks and skips if version exists
3. **Tests failing**: Fix tests before the workflow will publish
4. **Build errors**: Ensure `npm run build` works locally

**Debug Steps**:
1. Check workflow logs in GitHub Actions
2. Verify npm token permissions
3. Test build and publish locally first

## 🔄 Version Management

### Semantic Versioning

Follow [SemVer](https://semver.org/):
- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features (backward compatible)
- **Major** (2.0.0): Breaking changes

### Release Notes Template

```markdown
## New Features
- Added support for XYZ
- Improved ABC functionality

## Bug Fixes
- Fixed issue with DEF
- Resolved GHI error

## Breaking Changes
- Changed JKL interface
- Removed deprecated MNO

## Migration Guide
Steps to upgrade from previous version...
```

## 🛡️ Security

- ✅ NPM tokens are stored securely in GitHub secrets
- ✅ Workflows use official GitHub Actions
- ✅ Security audits run on every build
- ✅ Provenance information included in packages

## 📚 Resources

- [NPM Tokens Documentation](https://docs.npmjs.com/about-access-tokens)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github) 