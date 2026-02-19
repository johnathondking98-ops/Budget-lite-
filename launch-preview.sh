#!/bin/bash

# Budget Lite - Launch Preview Script
# This script prepares and launches the development preview

set -e  # Exit on error

echo "🚀 Budget Lite - Launch Preview"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "   Please install Node.js v14 or higher"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "   npm should come with Node.js"
    exit 1
fi

echo "✓ Node.js $(node --version) detected"
echo "✓ npm $(npm --version) detected"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    echo "   This may take a few minutes on first run"
    npm install
    echo "✓ Dependencies installed"
    echo ""
else
    echo "✓ Dependencies already installed"
    echo ""
fi

# Run verification
echo "🔍 Verifying application structure..."
if [ -f "verify-app.sh" ]; then
    ./verify-app.sh
    echo ""
fi

# Display launch options
echo "🎯 Choose how to launch the preview:"
echo ""
echo "1. Expo Go (Recommended - No build required)"
echo "   - Install 'Expo Go' app on your mobile device"
echo "   - Scan the QR code that will appear"
echo "   - App runs instantly on your device"
echo ""
echo "2. Web Browser"
echo "   - Opens in your default web browser"
echo "   - Some features may be limited"
echo ""
echo "3. iOS Simulator (macOS only, requires Xcode)"
echo "4. Android Emulator (requires Android Studio)"
echo ""

# Ask user for choice
read -p "Enter your choice (1-4, or press Enter for default Expo Go): " choice
choice=${choice:-1}

echo ""
echo "🚀 Starting development server..."
echo ""
echo "📱 To stop the server, press Ctrl+C"
echo ""

case $choice in
    1)
        echo "Starting Expo Go preview..."
        echo "Scan the QR code with your device's camera (iOS) or Expo Go app (Android)"
        npm start
        ;;
    2)
        echo "Opening web browser preview..."
        npm run web
        ;;
    3)
        echo "Starting iOS simulator..."
        npm run ios
        ;;
    4)
        echo "Starting Android emulator..."
        npm run android
        ;;
    *)
        echo "Invalid choice. Starting default Expo Go preview..."
        npm start
        ;;
esac
