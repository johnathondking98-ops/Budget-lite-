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

# Check adb (optional - needed for USB debugging)
echo "✓ Checking ADB (optional - for USB debugging)..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FOUND_ADB=""

_check_adb_candidate() {
    local candidate="$1"
    for path in "$candidate" "${candidate}.exe"; do
        if [ -x "$path" ]; then
            FOUND_ADB="$path"
            return 0
        elif [ -f "$path" ]; then
            FOUND_ADB="$path (needs chmod +x — launch-device.sh will fix this automatically)"
            return 0
        fi
    done
    return 1
}

if command -v adb &> /dev/null; then
    FOUND_ADB="$(command -v adb) (system PATH)"
elif command -v adb.exe &> /dev/null; then
    FOUND_ADB="$(command -v adb.exe) (system PATH)"
else
    _check_adb_candidate "$SCRIPT_DIR/node_modules/.bin/adb" || true
    if [ -z "$FOUND_ADB" ]; then
        _check_adb_candidate "$SCRIPT_DIR/node_modules/android-platform-tools/platform-tools/adb" || true
    fi
    if [ -z "$FOUND_ADB" ]; then
        _check_adb_candidate "$SCRIPT_DIR/platform-tools/adb" || true
    fi
fi

if [ -n "$FOUND_ADB" ]; then
    echo "  ✓ adb found: $FOUND_ADB"
else
    echo "  ⚠️  adb not found. Checked:"
    echo "     - system PATH"
    echo "     - $SCRIPT_DIR/node_modules/.bin/adb[.exe]"
    echo "     - $SCRIPT_DIR/node_modules/android-platform-tools/platform-tools/adb[.exe]"
    echo "     - $SCRIPT_DIR/platform-tools/adb[.exe]"
    echo "  Fix: run 'npm install' (downloads adb automatically),"
    echo "       or place the extracted platform-tools/ folder at $SCRIPT_DIR/platform-tools/"
fi

# Check launch-device.sh is present and executable
echo "✓ Checking launch-device.sh..."
if [ -x "$SCRIPT_DIR/launch-device.sh" ]; then
    echo "  ✓ launch-device.sh is present and executable"
elif [ -f "$SCRIPT_DIR/launch-device.sh" ]; then
    echo "  ⚠️  launch-device.sh is present but not executable. Run: chmod +x launch-device.sh"
else
    echo "  ❌ launch-device.sh is missing"
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
