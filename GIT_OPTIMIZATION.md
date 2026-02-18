# Git Configuration for Memory Optimization

This document provides git configuration settings that can help reduce memory usage when working with this repository.

## Recommended Git Configurations

### Local Repository Settings

Run these commands in your local repository to optimize git performance:

```bash
# Optimize git compression (reduces disk usage)
git config core.compression 9

# Enable file system cache for Windows
git config core.fscache true

# Optimize pack file settings for better memory usage
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads 1

# Enable automatic garbage collection
git config gc.auto 256

# Optimize delta cache size
git config core.deltaBaseCacheLimit "50m"

# Enable git's maintenance features (Git 2.30+)
git maintenance start
```

### Global Settings (Optional)

These settings apply to all your repositories:

```bash
# Set default branch name
git config --global init.defaultBranch main

# Enable parallel index preload for faster status/diff
git config --global core.preloadindex true

# Enable filesystem monitor for faster git status (if available)
git config --global core.fsmonitor true

# Reduce merge conflict markers for cleaner diffs
git config --global merge.conflictStyle diff3
```

## Working with Limited Memory

### 1. Shallow Clone
Clone only recent history:
```bash
git clone --depth 1 https://github.com/johnathondking98-ops/Budget-lite-.git
```

### 2. Partial Clone
Clone without all objects immediately:
```bash
git clone --filter=blob:none https://github.com/johnathondking98-ops/Budget-lite-.git
```

### 3. Sparse Checkout
Only checkout files you need:
```bash
git clone --no-checkout https://github.com/johnathondking98-ops/Budget-lite-.git
cd Budget-lite-
git sparse-checkout init --cone
git sparse-checkout set components Pages
git checkout
```

## Maintenance Commands

### Clean Up Repository
```bash
# Remove untracked files
git clean -fd

# Prune old refs and run garbage collection
git gc --aggressive --prune=now

# Verify repository integrity
git fsck
```

### Reduce Repository Size
```bash
# Remove unreachable objects
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Check Repository Size
```bash
# Show total repository size
git count-objects -vH

# Show largest files in history
git rev-list --objects --all \
  | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
  | sed -n 's/^blob //p' \
  | sort --numeric-sort --key=2 \
  | tail -n 10
```

## Troubleshooting

### "Out of Memory" During Git Operations

If git operations fail with out-of-memory errors:

1. **Increase pack memory limits**:
   ```bash
   git config pack.windowMemory "10m"
   git config pack.packSizeLimit "20m"
   ```

2. **Use single thread for packing**:
   ```bash
   git config pack.threads 1
   ```

3. **Disable delta compression temporarily**:
   ```bash
   git config pack.window 0
   ```

### Slow Git Status

If `git status` is slow:

1. **Enable file system cache**:
   ```bash
   git config core.fscache true
   git config core.preloadindex true
   ```

2. **Use watchman** (on macOS/Linux):
   ```bash
   # Install watchman
   brew install watchman  # macOS
   
   # Configure git to use it
   git config core.fsmonitor true
   ```

## Additional Resources

- [Git Configuration Documentation](https://git-scm.com/docs/git-config)
- [Pro Git Book - Git Internals](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain)
- [GitHub: Working with Large Files](https://docs.github.com/en/repositories/working-with-files/managing-large-files)
