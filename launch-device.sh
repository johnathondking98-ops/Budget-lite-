#!/bin/bash
# launch-device.sh
# Launches Budget Lite on a USB-connected Android device.
# Automatically forwards the Metro bundler port over USB (adb reverse)
# then starts Expo bound to localhost.
#
# Usage:  npm run launch:device
#   or:   ./launch-device.sh [device-serial]

set -e

DEVICE_SERIAL="${1:-}"

# ── 1. Locate adb (system PATH, npm devDep, or manually-extracted platform-tools) ─
ADB=""
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if command -v adb &> /dev/null; then
    ADB="adb"
elif [ -x "$SCRIPT_DIR/node_modules/.bin/adb" ]; then
    # Installed via android-platform-tools devDependency (npm install)
    ADB="$SCRIPT_DIR/node_modules/.bin/adb"
elif [ -x "./node_modules/.bin/adb" ]; then
    ADB="./node_modules/.bin/adb"
elif [ -x "$SCRIPT_DIR/platform-tools/adb" ]; then
    # Manually extracted Google SDK Platform Tools zip into the project root
    ADB="$SCRIPT_DIR/platform-tools/adb"
elif [ -x "./platform-tools/adb" ]; then
    ADB="./platform-tools/adb"
fi

if [ -z "$ADB" ]; then
    echo "❌ adb not found. Options to fix:"
    echo "   1. Run 'npm install' (installs adb automatically via android-platform-tools)"
    echo "   2. Extract the platform-tools zip into this directory so that"
    echo "      platform-tools/adb exists alongside this script"
    echo "   3. Install Android SDK Platform Tools and add to PATH:"
    echo "      https://developer.android.com/studio/releases/platform-tools"
    exit 1
fi

# Build adb argument list as an array to avoid word-splitting issues
ADB_ARGS=()
if [ -n "$DEVICE_SERIAL" ]; then
    ADB_ARGS=(-s "$DEVICE_SERIAL")
fi

# ── 2. Confirm a device is connected and ready ────────────────────────────────
DEVICE_LINE=$("$ADB" "${ADB_ARGS[@]}" devices 2>/dev/null | grep -v "^List" | grep "device$" | head -1)
if [ -z "$DEVICE_LINE" ]; then
    echo "❌ No Android device found."
    echo "   • Make sure USB Debugging is enabled on the device."
    echo "   • Accept the 'Allow USB debugging?' prompt on the device screen."
    echo "   • Try: $ADB devices"
    exit 1
fi

SERIAL=$(echo "$DEVICE_LINE" | awk '{print $1}')
echo "✅ Device found: $SERIAL"

# ── 3. Forward Metro port over USB ───────────────────────────────────────────
echo "🔌 Setting up port forwarding (adb reverse tcp:8081 tcp:8081)..."
"$ADB" -s "$SERIAL" reverse tcp:8081 tcp:8081
echo "   Port 8081 forwarded."

# ── 4. Launch Expo on the device ─────────────────────────────────────────────
echo "🚀 Launching Budget Lite on device $SERIAL..."
npx expo start --android --localhost
