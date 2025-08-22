# 🚀 Release Guide

## Automatic Release System

The project is configured for automatic releases using:

- **Semantic Release** - automatic versioning
- **Conventional Commits** - standardized commits
- **GitHub Actions** - CI/CD automation

## How It Works

### 1. Commits → Versions

```bash
fix: bug fix                   → 1.0.0 → 1.0.1 (patch)
feat: new feature              → 1.0.0 → 1.1.0 (minor)
feat!: breaking change         → 1.0.0 → 2.0.0 (major)
```

### 2. Automatic Process

When pushing to `main`:

1. ✅ **Commit Analysis** - determine release type
2. 🏷️ **Version Generation** - according to semantic versioning
3. 📝 **CHANGELOG Creation** - from commit descriptions
4. 📦 **GitHub Release** - with assets and release notes
5. 🔄 **package.json Update** - new version

### 3. Commit Types

| Type                           | Description              | Release |
| ------------------------------ | ------------------------ | ------- |
| `fix:`                         | Bug fix                  | patch   |
| `feat:`                        | New feature              | minor   |
| `feat!:` or `BREAKING CHANGE:` | Breaking changes         | major   |
| `docs:`                        | Documentation            | patch   |
| `style:`                       | Styles, formatting       | patch   |
| `refactor:`                    | Refactoring              | patch   |
| `perf:`                        | Performance improvements | patch   |
| `test:`                        | Tests                    | -       |
| `build:`                       | Build system             | -       |
| `ci:`                          | CI/CD                    | -       |
| `chore:`                       | Maintenance              | -       |

## Commands

```bash
# Check future release (without publishing)
bun run release:dry

# Manual release (usually automatic)
bun run release

# Check conventional commits
bunx commitlint --from HEAD~1 --to HEAD --verbose
```

## Commit Examples

### ✅ Correct

```bash
git commit -m "feat: add user authentication system"
git commit -m "fix(api): handle null values in user response"
git commit -m "docs: update installation guide"
git commit -m "feat!: change API response format

BREAKING CHANGE: API now returns data in different structure"
```

### ❌ Incorrect

```bash
git commit -m "Update files"           # type not specified
git commit -m "Fix bug"               # doesn't describe what was fixed
git commit -m "Add feature."          # period at the end
git commit -m "FIX: user login"       # capital letters
```

## Local Environment Setup

### Installing commitizen (optional)

```bash
# Interactive commit helper
bun add -D commitizen cz-conventional-changelog

# Add to package.json
"config": {
  "commitizen": {
    "path": "./node_modules/cz-conventional-changelog"
  }
}

# Usage
bunx cz
```

### Git hooks (optional)

```bash
# Check commits before push
bun add -D husky

# Setup
bunx husky init
echo 'bunx commitlint --edit "$1"' > .husky/commit-msg
```

## Release Monitoring

- **Releases**: https://github.com/DKeken/axion-stack/releases
- **Actions**: https://github.com/DKeken/axion-stack/actions
- **CHANGELOG**: [CHANGELOG.md](../CHANGELOG.md)

## Troubleshooting

### Release wasn't created

1. Check GitHub Actions logs
2. Ensure commits follow conventional commits
3. Check `GITHUB_TOKEN` permissions

### Wrong version

1. Check commit types since last release
2. Use `bun run release:dry` for debugging
3. Create patch commit if needed

### Release rollback

```bash
# Delete tag locally and on GitHub
git tag -d v1.2.3
git push origin --delete v1.2.3

# Create revert commit
git revert <commit-hash>
git push origin main
```
