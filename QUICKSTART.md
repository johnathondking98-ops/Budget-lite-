# Quick Start Guide for Memory-Constrained Systems

If you're working on a computer with limited memory, follow this streamlined setup guide.

## Minimal Setup (Recommended)

### Step 1: Clone with Shallow History
```bash
# Clone only the latest version (saves ~90% of disk space)
git clone --depth 1 https://github.com/johnathondking98-ops/Budget-lite-.git
cd Budget-lite-
```

### Step 2: Install Dependencies with Memory Limits
```bash
# Set Node.js memory limit (adjust based on your system)
export NODE_OPTIONS="--max-old-space-size=2048"

# Install dependencies with the optimized .npmrc settings
npm install
```

### Step 3: Run the Development Server
```bash
npm start
```

### Step 4: Use Expo Go (No Native Builds Needed)
1. Download "Expo Go" app on your iOS or Android device
2. Scan the QR code shown in your terminal
3. The app runs on your device - no need to build native code locally!

## If You Still Need More Memory Savings

### Option 1: Use Codespaces or Gitpod
Work in the cloud instead of locally:
- GitHub Codespaces: https://github.com/features/codespaces
- Gitpod: https://gitpod.io

### Option 2: Partial Clone
Clone without downloading all file contents immediately:
```bash
git clone --filter=blob:none https://github.com/johnathondking98-ops/Budget-lite-.git
cd Budget-lite-
```

### Option 3: Use Yarn with Plug'n'Play (Zero Installs)
```bash
# Install Yarn 2+
npm install -g yarn

# Enable PnP mode (no node_modules!)
yarn set version berry
echo "nodeLinker: pnp" >> .yarnrc.yml

# Install dependencies
yarn install
```

### Option 4: Sparse Checkout (Only Specific Folders)
```bash
git clone --no-checkout https://github.com/johnathondking98-ops/Budget-lite-.git
cd Budget-lite-
git sparse-checkout init --cone
git sparse-checkout set App.js Pages components  # Only essential folders
git checkout
```

## Memory Monitoring

### Check Your Current Memory Usage
```bash
# On Linux/macOS
top

# Or use htop (better interface)
htop

# Check Node.js memory specifically
node -e "console.log('Memory:', process.memoryUsage())"
```

## Troubleshooting Common Issues

### "JavaScript heap out of memory"
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Then retry your command
npm install  # or whatever failed
```

### npm install is very slow
```bash
# Clear cache and try again
npm cache clean --force
npm install
```

### Git operations are slow
```bash
# Run garbage collection
git gc --aggressive

# Check repo size
git count-objects -vH
```

### Still having issues?
1. Close other applications
2. Restart your terminal
3. Try using swap/virtual memory
4. Consider using a cloud development environment

## What Gets Excluded (Won't Use Your Memory)

Thanks to `.gitignore`, these won't be committed:
- ✅ `node_modules/` - Can be reinstalled with `npm install`
- ✅ `.expo/` - Expo cache (regenerated automatically)
- ✅ `dist/` and `web-build/` - Build outputs
- ✅ `/ios` and `/android` - Native folders (generated when needed)

## Memory Usage Comparison

| Approach | Typical Disk Usage | Memory During Development |
|----------|-------------------|---------------------------|
| Full clone + native builds | ~2-5 GB | ~4-8 GB RAM |
| Shallow clone + Expo Go | ~100-300 MB | ~1-2 GB RAM |
| Codespaces/Cloud | ~0 MB local | ~500 MB RAM (browser) |

## Next Steps

Once your environment is set up:
1. Read the main [README.md](README.md) for project overview
2. Check [GIT_OPTIMIZATION.md](GIT_OPTIMIZATION.md) for advanced git configs
3. Start building! 🚀

## Need Help?

- Check existing issues: https://github.com/johnathondking98-ops/Budget-lite-/issues
- Create a new issue if you're stuck
- Read Expo documentation: https://docs.expo.dev/
