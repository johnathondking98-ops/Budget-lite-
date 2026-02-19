# Preview Launch Guide

Welcome! This guide will help you launch a preview of the Budget Lite application.

## 🎯 Quick Start (3 Steps)

### Step 1: Run the Launch Script
```bash
./launch-preview.sh
```

The script will:
- ✓ Check your environment (Node.js, npm)
- ✓ Install dependencies if needed
- ✓ Verify the application structure
- ✓ Guide you through launch options

### Step 2: Choose Your Preview Method

**Option A: Expo Go (Recommended)** 🌟
- No build process required
- Fastest way to preview
- Works on any phone with Expo Go app

**Option B: Web Browser**
- Opens automatically in your browser
- Good for quick testing
- Some native features won't work

**Option C: Simulator/Emulator**
- Requires iOS simulator (macOS) or Android emulator
- Full native experience
- Takes longer to start

### Step 3: View Your App!
- For Expo Go: Scan the QR code with your device
- For Web: Browser opens automatically
- For Simulator: App launches automatically

## 📱 Expo Go Setup (First Time)

If using Expo Go for the first time:

1. **Download the app:**
   - iOS: Search "Expo Go" in App Store
   - Android: Search "Expo Go" in Play Store

2. **Connect to same network:**
   - Ensure your phone and computer are on the same WiFi

3. **Scan QR code:**
   - iOS: Use Camera app or Expo Go app
   - Android: Use Expo Go app

## 🔧 Manual Launch Options

If you prefer to launch manually:

### Start Development Server
```bash
npm start
```
Opens Expo Dev Tools with QR code

### Open in Web Browser
```bash
npm run web
```
Opens at http://localhost:8081

### Open in iOS Simulator
```bash
npm run ios
```
Requires: macOS with Xcode installed

### Open in Android Emulator
```bash
npm run android
```
Requires: Android Studio with emulator configured

## ✨ What You'll See

Budget Lite includes these features:
- 📊 **Dashboard** - Budget overview and summary
- 📅 **Calendar** - Track income and expenses by date
- 🛒 **Grocery Management** - Shopping lists with barcode scanning
- 💰 **Payroll Tracking** - Log work shifts and calculate earnings
- 📈 **Monthly Reports** - Financial reports and analytics
- ⛽ **Fuel Tracking** - Record fuel expenses
- ⚙️ **Settings** - Configure app preferences

## 🔍 Verification

Run the verification script anytime:
```bash
./verify-app.sh
```

This checks:
- ✓ Node.js and npm versions
- ✓ All required files present
- ✓ Dependencies installed
- ✓ Application structure valid

## 🐛 Troubleshooting

### Issue: "Command not found: npm"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Cannot find module"
**Solution:** Reinstall dependencies
```bash
rm -rf node_modules
npm install
```

### Issue: "Port 8081 already in use"
**Solution:** Stop existing Metro bundler
```bash
# macOS/Linux
lsof -ti:8081 | xargs kill -9

# Or use a different port
npx expo start --port 8082
```

### Issue: QR code not working
**Solution:** 
1. Ensure phone and computer on same WiFi
2. Try tunnel mode: `npx expo start --tunnel`
3. Or use direct URL shown in terminal

### Issue: "Expo Go connection failed"
**Solution:**
- Check firewall settings
- Try localhost mode: `npx expo start --localhost`
- Or use tunnel: `npx expo start --tunnel`

### Issue: White screen or app won't load
**Solution:** Clear cache and restart
```bash
npx expo start --clear
```

## 📊 Performance Notes

**First Launch:**
- Metro bundler needs to build JavaScript bundle
- Takes ~30-60 seconds
- Progress shown in terminal

**Subsequent Launches:**
- Much faster (~5-10 seconds)
- Bundle is cached

**Development Mode:**
- Includes debugging tools
- Slightly slower than production
- Hot reload enabled for instant updates

## 🎨 Making Changes

When you edit code:
1. Save your changes
2. App automatically reloads (hot reload)
3. See changes instantly on your device

**Fast Refresh** is enabled:
- Component state preserved during reload
- Very fast updates
- No need to manually refresh

## 🌐 Network Requirements

**Local Network (Default):**
- Phone and computer on same WiFi
- Fastest connection
- No internet required after initial setup

**Tunnel Mode (Alternative):**
- Works across different networks
- Requires internet connection
- Slightly slower
```bash
npx expo start --tunnel
```

**Localhost Mode (Alternative):**
- USB connection or same device only
- Most reliable for local testing
```bash
npx expo start --localhost
```

## 📚 Additional Resources

- **RUNNING.md** - Complete running guide
- **QUICKSTART.md** - Memory optimization tips
- **README.md** - Project overview
- **Expo Docs** - https://docs.expo.dev/

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review RUNNING.md for detailed instructions
3. Visit Expo documentation: https://docs.expo.dev/
4. Check repository issues: https://github.com/johnathondking98-ops/Budget-lite-/issues

## ✅ Checklist Before Launch

- [ ] Node.js installed (v14+)
- [ ] npm available
- [ ] Dependencies installed (`npm install`)
- [ ] Same WiFi network (for Expo Go)
- [ ] Expo Go app installed on device (if using mobile)
- [ ] Port 8081 available

Once ready, run:
```bash
./launch-preview.sh
```

Happy previewing! 🚀
