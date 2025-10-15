# 🚀 Quick Start: CI/CD Setup

Get your CI/CD pipeline running in **5 minutes**!

## ⚡ Fast Setup (5 Steps)

### 1️⃣ Enable GitHub Actions (30 seconds)

1. Go to your GitHub repository
2. Click **Settings** → **Actions** → **General**
3. Select **"Allow all actions and reusable workflows"**
4. Click **Save**

### 2️⃣ Configure Codecov (2 minutes)

1. Visit [codecov.io](https://codecov.io) and sign in with GitHub
2. Click **"Add a repository"** and select your repo
3. Copy the **CODECOV_TOKEN**
4. In GitHub: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
5. Name: `CODECOV_TOKEN`, Value: paste token, click **Add secret**

### 3️⃣ Install Dependencies (1 minute)

```bash
npm install
```

This installs:
- ✅ Solhint (Solidity linter)
- ✅ Prettier (code formatter)
- ✅ All testing tools

### 4️⃣ Test Locally (1 minute)

```bash
# Run quick CI check
npm run ci:quick
```

This runs:
1. Solidity linting
2. Contract compilation
3. Full test suite (75+ tests)

### 5️⃣ Push to GitHub (30 seconds)

```bash
git add .
git commit -m "Enable CI/CD pipeline"
git push origin main
```

**Done!** 🎉

## ✅ Verify It's Working

1. Go to **Actions** tab in your repository
2. You should see "Test Suite" workflow running
3. Wait 5-8 minutes for completion
4. All jobs should show green checkmarks ✅

## 📊 What Runs in CI/CD?

Your pipeline now automatically:

| Job | What It Does | Duration |
|-----|--------------|----------|
| 🔍 **Quality** | Lints Solidity code | 30s |
| 🧪 **Tests** | Runs 75+ tests (Node 18 & 20) | 2-3min |
| 📊 **Coverage** | Generates coverage report | 3-4min |
| ⛽ **Gas** | Analyzes gas usage (PRs only) | 2-3min |
| 🏗️ **Build** | Compiles contracts | 1-2min |
| 🔒 **Security** | Checks vulnerabilities | 30s |

**Total**: ~5-8 minutes

## 🎯 Common Commands

```bash
# Before committing
npm run precommit          # Lint + format check

# Run full CI locally
npm run ci                 # Lint + compile + test + coverage

# Quick check
npm run ci:quick           # Lint + test only

# Individual checks
npm run lint:sol           # Lint Solidity
npm run lint:fix           # Auto-fix linting
npm test                   # Run tests
npm run coverage           # Generate coverage
npm run test:gas           # Gas report
```

## 🎨 Workflow Triggers

Your CI/CD runs on:

```
✓ Push to main
✓ Push to develop
✓ Push to feature/* branches
✓ All pull requests
✓ Manual trigger (Actions tab)
```

## 📈 Add Status Badges

Add these to your README:

```markdown
[![Tests](https://github.com/USERNAME/REPO/actions/workflows/test.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/USERNAME/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/REPO)
```

Replace `USERNAME` and `REPO` with your values.

## 🐛 Troubleshooting

### "Tests failing in CI but pass locally"

**Solution:**
```bash
# Test with CI Node versions
nvm install 18 && nvm use 18 && npm test
nvm install 20 && nvm use 20 && npm test
```

### "Codecov upload failed"

**Check:**
1. CODECOV_TOKEN is set in GitHub Secrets
2. Coverage file exists: `ls coverage/lcov.info`
3. Codecov service status: [status.codecov.com](https://status.codecov.com)

### "Linting errors in CI"

**Solution:**
```bash
npm run lint:fix           # Auto-fix issues
git add .
git commit -m "Fix linting"
git push
```

### "Gas report missing"

Gas reports **only run on pull requests**, not direct pushes.

**To see gas report:**
1. Create a feature branch
2. Make changes
3. Open pull request
4. Gas report appears in PR

## 📝 Best Practices

**Before Every Commit:**
```bash
npm run precommit
```

**Before Every Push:**
```bash
npm run ci:quick
```

**Before Creating PR:**
```bash
npm run ci
```

## 📚 Full Documentation

For detailed information:

- **CI/CD Guide**: See [CI_CD.md](CI_CD.md)
- **Testing Guide**: See [TESTING.md](TESTING.md)
- **README**: See [README.md](README.md)

## 🎉 Next Steps

1. ✅ Write more tests (maintain 85%+ coverage)
2. ✅ Enable branch protection rules
3. ✅ Require CI to pass before merging
4. ✅ Set up Dependabot for security updates

## 🔒 Branch Protection (Recommended)

Protect your main branch:

1. **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Status checks: Select all CI/CD jobs
4. Click **Create** or **Save changes**

Now all PRs must pass CI before merging! 🎉

## ⏱️ Pipeline Performance

**Expected durations:**

- ✅ **Fastest job**: Code Quality (~30s)
- ✅ **Average job**: Tests (~2-3min per version)
- ✅ **Slowest job**: Coverage (~3-4min)
- ✅ **Total pipeline**: ~5-8min

**Optimization tips:**
- Jobs run in parallel when possible
- Dependencies cached for faster installs
- Gas reports only on PRs (saves time)

## 📞 Need Help?

1. Check [CI_CD.md](CI_CD.md) troubleshooting section
2. Review workflow logs in Actions tab
3. Open an issue with:
   - Workflow run URL
   - Error message
   - Steps to reproduce

---

**Setup Time**: 5 minutes
**Pipeline Duration**: 5-8 minutes
**Difficulty**: Easy 🟢

**Questions?** See [CI_CD.md](CI_CD.md) for comprehensive documentation.
