# Budget Lite

A lightweight budget tracking application built with React Native and Expo.

## ✅ Yes, the Application Runs!

**The entire Budget-lite application can now run from this repository!** All source code, dependencies, and assets are present and verified working.

**Quick Start:**
```bash
npm install    # Install dependencies
npm start      # Start development server
```

📖 **For complete running instructions, see [RUNNING.md](RUNNING.md)**

## Memory Optimization Guide

This guide helps you work with this repository efficiently without consuming excessive memory on your local machine.

### Quick Setup

1. **Clone with shallow history** (saves disk space and memory):
   ```bash
   git clone --depth 1 https://github.com/johnathondking98-ops/Budget-lite-.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

### Memory Optimization Tips

#### 1. Use Shallow Clone
If you've already cloned the repository, you can convert it to a shallow clone:
```bash
git fetch --depth 1
git gc --prune=all
```

#### 2. Clean Dependencies Regularly
Remove unused dependencies and clear cache:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

#### 3. Use Expo Go Instead of Building Locally
Instead of building native iOS/Android projects locally (which consume significant memory), use Expo Go app:
- Download Expo Go on your phone
- Scan the QR code when running `npm start`
- This avoids having to build native folders locally

#### 4. Exclude Large Directories
The `.gitignore` already excludes memory-intensive directories:
- `node_modules/` - Dependencies (can be reinstalled)
- `.expo/` - Expo cache
- `dist/` and `web-build/` - Build artifacts
- `/ios` and `/android` - Native folders (generated when needed)

#### 5. Git Configuration for Performance
These configurations are automatically set in this repository:
- Git compression optimized for performance
- Large file handling configured
- Garbage collection optimized

### Working with the Repository

#### Development
```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/simulator
npm run android:device  # Run on a USB-connected Android device (USB debugging)
npm run launch:device   # One command: detect device, forward port, and launch
npm run ios        # Run on iOS device/simulator
npm run web        # Run in web browser
```

#### Project Structure
- `App.js` - Main application component
- `Pages/` - Application screens
- `components/` - Reusable React components
- `constants/` - Application constants
- `hooks/` - Custom React hooks
- `styles/` - Styling configurations
- `assets/` - Images and static assets
- `firebase.js` - Firebase configuration

### Troubleshooting

#### Out of Memory Errors
If you encounter memory issues:

1. **Increase Node memory limit**:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

2. **Clear all caches**:
   ```bash
   rm -rf node_modules .expo dist web-build
   npm cache clean --force
   npm install
   ```

3. **Use watchman** (for better file watching on macOS/Linux):
   ```bash
   brew install watchman  # macOS
   ```

### Best Practices

1. **Don't commit `node_modules/`** - Always listed in `.gitignore`
2. **Don't commit build artifacts** - Use `.gitignore` for `dist/`, `web-build/`
3. **Keep dependencies updated** - Regular updates can include performance improvements
4. **Use `.gitattributes`** - Properly handle line endings and large files
5. **Pull with rebase** - Keeps history cleaner: `git pull --rebase`

### License
This project is licensed under 0BSD (Zero-Clause BSD).

---

## 📚 Additional Documentation

- **[RUNNING.md](RUNNING.md)** - Complete guide to running the application
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start for memory-constrained systems
- **[GIT_OPTIMIZATION.md](GIT_OPTIMIZATION.md)** - Git configuration and optimization
- **[LICENSE](LICENSE)** - License information

**Quick Links:**
- 🚀 [How to run the app](RUNNING.md) - Detailed running instructions
- 💾 [Memory optimization](QUICKSTART.md) - For low-memory systems
- ⚙️ [Git tips](GIT_OPTIMIZATION.md) - Repository optimization
- ✅ Run `./verify-app.sh` - Verify your setup is ready
