#!/bin/bash
# Budget Lite Application Verification Script
# This script verifies that the application is ready to run

echo "🔍 Budget Lite Application Verification"
echo "========================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  Node.js $NODE_VERSION installed"
else
    echo "  ❌ Node.js not found. Please install Node.js v14 or higher."
    exit 1
fi

# Check npm
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  npm $NPM_VERSION installed"
else
    echo "  ❌ npm not found. Please install npm."
    exit 1
fi

# Check required files
echo "✓ Checking application files..."
REQUIRED_FILES=(
    "package.json"
    "App.js"
    "index.js"
    "app.json"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ $file missing"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    echo ""
    echo "❌ Some required files are missing. Please ensure you're in the correct directory."
    exit 1
fi

# Check directories
echo "✓ Checking application directories..."
REQUIRED_DIRS=(
    "Pages"
    "components"
    "hooks"
    "assets"
    "constants"
    "styles"
)

MISSING_DIRS=0
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✓ $dir/"
    else
        echo "  ❌ $dir/ missing"
        MISSING_DIRS=$((MISSING_DIRS + 1))
    fi
done

if [ $MISSING_DIRS -gt 0 ]; then
    echo ""
    echo "❌ Some required directories are missing."
    exit 1
fi

# Check node_modules
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    PACKAGE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo "  ✓ node_modules installed ($PACKAGE_COUNT packages)"
else
    echo "  ⚠️  node_modules not found. Run 'npm install' to install dependencies."
fi

# Check adb (optional - needed for USB debugging; installed via android-platform-tools)
echo "✓ Checking ADB (optional - for USB debugging)..."
if command -v adb &> /dev/null; then
    ADB_VERSION=$(adb version | head -1)
    echo "  ✓ $ADB_VERSION"
elif [ -x "./node_modules/.bin/adb" ]; then
    ADB_VERSION=$(./node_modules/.bin/adb version | head -1)
    echo "  ✓ $ADB_VERSION (via node_modules)"
else
    echo "  ℹ️  adb not found. Run 'npm install' to install it via android-platform-tools."
fi

echo ""
echo "========================================="
echo ""
echo "To run the application:"
echo "  1. Install dependencies (if not done): npm install"
echo "  2. Start development server: npm start"
echo "  3. Scan QR code with Expo Go app"
echo ""
echo "To run on a USB-connected Android device:"
echo "  1. Enable USB Debugging on your device (Settings → Developer options)"
echo "  2. Connect device via USB, then run: npm run launch:device"
echo "     (This automatically forwards ports and launches the app.)"
echo ""
echo "For detailed instructions, see RUNNING.md"
echo "========================================="
