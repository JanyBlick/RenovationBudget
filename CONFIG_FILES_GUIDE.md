# 📁 Configuration Files Guide

This project uses renamed configuration files to ensure compatibility with GitHub uploads.

## 🔄 File Naming Convention

All configuration files that traditionally start with `.` (dot) have been renamed to avoid being treated as hidden files by GitHub.

### Configuration Files Mapping

| Original Name | New Name | Purpose |
|---------------|----------|---------|
| `.env.example` | `env.example.txt` | Environment variables template |
| `.eslintrc.json` | `eslintrc.json` | ESLint configuration |
| `.eslintignore` | `eslintignore.txt` | ESLint ignore patterns |
| `.prettierrc.json` | `prettierrc.json` | Prettier configuration |
| `.prettierignore` | `prettierignore.txt` | Prettier ignore patterns |
| `.solhint.json` | `solhint.json` | Solidity linter configuration |
| `.solhintignore` | `solhintignore.txt` | Solhint ignore patterns |
| `.gitignore` | `gitignore.txt` | Git ignore patterns |

### Directory Mapping

| Original Name | New Name | Purpose |
|---------------|----------|---------|
| `.github/` | `github-workflows/` | GitHub Actions workflows |
| `.husky/` | `husky-hooks/` | Git hooks for pre-commit/pre-push |

## 🔧 How to Use These Files

### For Development (Local Setup)

If you want to use the tools locally (ESLint, Prettier, Husky, etc.), you need to restore the original dot filenames:

```bash
# Navigate to project directory
cd /path/to/project

# Restore dot files
cp env.example.txt .env.example
cp eslintrc.json .eslintrc.json
cp eslintignore.txt .eslintignore
cp prettierrc.json .prettierrc.json
cp prettierignore.txt .prettierignore
cp solhint.json .solhint.json
cp solhintignore.txt .solhintignore
cp gitignore.txt .gitignore

# Restore directories
cp -r github-workflows .github
cp -r husky-hooks .husky

# Install dependencies
npm install

# Initialize Husky
npm run prepare
```

### For GitHub Upload (Deployment)

The current file structure is ready for GitHub upload:
- All files are visible (no hidden files)
- GitHub Pages will work correctly
- All documentation references have been updated

## 📝 Environment Setup

### Quick Start

1. **Copy environment template:**
   ```bash
   cp env.example.txt .env
   ```

2. **Edit `.env` with your settings:**
   ```env
   SEPOLIA_RPC_URL=your_rpc_url
   PRIVATE_KEY=your_private_key
   NUM_PAUSERS=3
   PAUSER_ADDRESS_0=address1
   PAUSER_ADDRESS_1=address2
   PAUSER_ADDRESS_2=address3
   KMS_GENERATION=1
   ```

3. **Never commit `.env` to GitHub** (it contains secrets)

## ⚙️ GitHub Actions (CI/CD)

The GitHub Actions workflows are located in `github-workflows/` directory:

- `test.yml` - Runs tests on every push/PR
- `security.yml` - Security audits (daily + on push)
- `deploy.yml` - Deployment automation

**Note:** When using these workflows:
1. Copy `github-workflows/` to `.github/` in your repository
2. GitHub Actions requires the `.github/workflows/` structure

## 🪝 Git Hooks (Husky)

Pre-commit and pre-push hooks are in `husky-hooks/`:

- `pre-commit` - Linting, formatting, secret detection
- `pre-push` - Tests, security audit, build

**Note:** Husky requires these to be in `.husky/` to work:
1. Copy `husky-hooks/` to `.husky/`
2. Run `npm run prepare`

## 🔒 Security Notes

✅ **Safe to commit:**
- `env.example.txt` (template with placeholder values)
- All configuration files (`eslintrc.json`, `prettierrc.json`, etc.)
- `github-workflows/` and `husky-hooks/` directories

❌ **NEVER commit:**
- `.env` (contains real secrets)
- `node_modules/` (dependencies)
- `artifacts/` and `cache/` (build outputs)

## 📚 Additional Resources

- **Environment Configuration:** See [ENV_CONFIGURATION_GUIDE.md](ENV_CONFIGURATION_GUIDE.md)
- **CI/CD Setup:** See [CI_CD.md](CI_CD.md)
- **Security Guide:** See [SECURITY_PERFORMANCE.md](SECURITY_PERFORMANCE.md)
- **Testing Guide:** See [TESTING.md](TESTING.md)

## 🚀 Quick Command Reference

```bash
# Development setup
npm install
cp env.example.txt .env
# Edit .env with your values
npm run compile
npm test

# Linting
npm run lint:sol     # Solidity
npm run lint:js      # JavaScript/TypeScript

# Formatting
npm run format       # Format all files
npm run format:check # Check formatting

# Deployment
npm run deploy       # Deploy to Sepolia

# Frontend
npm run dev          # Start local server
```

---

**Last Updated:** 2025-10-19
**Project:** Private Renovation Budget Manager
**Version:** 2.1.0
