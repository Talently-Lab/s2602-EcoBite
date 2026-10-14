# Code Quality - Local Analysis

## Overview

We use **oxlint** (fast ES linter) + **SonarLint** (VS Code extension) to catch:
- Code duplications
- Security vulnerabilities
- Code smells and anti-patterns
- Unused variables and imports
- TypeScript type errors

**Philosophy:** Scan **locally before opening PRs**, not just in CI.

No external services or tokens needed — everything runs locally!

---

## Quick Start

### 1. Install SonarLint (VS Code)

Real-time feedback while coding:

```bash
code --install-extension SonarSource.sonarlint-vscode
```

Or search "SonarLint" in VS Code Extensions.

**That's it!** No setup needed. You get instant feedback as you type.

---

### 2. Run Oxlint Locally

#### Lint Backend
```bash
cd backend
pnpm lint
```

#### Lint API Portal
```bash
cd api-portal
pnpm lint
```

#### Fix Auto-fixable Issues
```bash
pnpm lint --fix
```

---

### 3. Pre-Push Hook (Optional but Recommended)

Automatically run linter before pushing:

```bash
# From repo root
mkdir -p .git/hooks
cat > .git/hooks/pre-push << 'HOOK'
#!/bin/bash

echo "🔍 Running linter checks before push..."

# Lint backend if changed
if git diff --name-only HEAD @{push} | grep -q "^backend/"; then
  echo "📦 Linting backend..."
  cd backend && pnpm lint || exit 1
  cd ..
fi

# Lint api-portal if changed
if git diff --name-only HEAD @{push} | grep -q "^api-portal/"; then
  echo "📦 Linting api-portal..."
  cd api-portal && pnpm lint || exit 1
  cd ..
fi

echo "✅ Lint checks passed!"
HOOK

chmod +x .git/hooks/pre-push
```

**This will:**
- Run linter automatically before `git push`
- Block push if linting fails
- Only lint packages you changed

---

## CI Integration

oxlint also runs in GitHub Actions on every PR.
See `.github/workflows/backend-ci.yml` and `.github/workflows/api-portal-ci.yml`.

**Local linting before push is still required** to catch issues early and avoid failed CI.

---

## Tools Used

### oxlint (Fast Linter)
- **What:** Blazing-fast ES/TS linter written in Rust
- **Used in:** Backend, API Portal, Frontend
- **Cost:** Free, no setup
- **Config:** `.oxlintrc.json` in each package
- **Docs:** https://oxc-project.github.io/docs/guide/linter.html

### SonarLint (VS Code Extension)
- **What:** Real-time code quality feedback in editor
- **Installed via:** VS Code Extensions marketplace
- **Cost:** Free
- **What it catches:**
  - Security issues
  - Code smells
  - Potential bugs
  - Duplications
- **How to use:** Just install and write code — feedback appears in real-time

---

## Quality Standards

oxlint enforces:
- ✅ No unused variables or imports
- ✅ No unreachable code
- ✅ No duplicate code patterns
- ✅ Proper TypeScript usage
- ✅ No security vulnerabilities in syntax
- ✅ Performance best practices
- ✅ Consistent code style

SonarLint catches additional issues SonarCloud would find.

---

## Troubleshooting

### "pnpm lint" command not found
- Make sure you ran `pnpm install` in the package directory
- Check that `package.json` has `lint` script

### SonarLint not showing warnings
1. Make sure extension is installed: `code --install-extension SonarSource.sonarlint-vscode`
2. Reload VS Code: `Cmd+R` or `Ctrl+R`
3. Check bottom-left status: should show Connected if working

### "Operation not permitted" on pre-push hook (Mac/Linux)
```bash
chmod +x .git/hooks/pre-push
```

### Bypass pre-push hook (only when necessary)
```bash
git push --no-verify
```

---

## Best Practices

1. **Install SonarLint in VS Code** → catch issues while coding
2. **Run `pnpm lint` locally** → before committing
3. **Use `pnpm lint --fix`** → auto-fix simple issues
4. **Install pre-push hook** → prevent pushing bad code
5. **Check CI output** → if lint fails in GitHub Actions
6. **Don't ignore warnings** → they accumulate technical debt

---

## Monorepo Linting

Lint all packages:
```bash
# From repo root
pnpm run -r lint
```

Lint specific package:
```bash
pnpm --filter backend lint
pnpm --filter api-portal lint
pnpm --filter frontend lint
```

---

## References

- oxlint: https://oxc-project.github.io/
- SonarLint VS Code: https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode
- oxlint Rules: https://oxc-project.github.io/docs/guide/rules.html
