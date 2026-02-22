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

# ── 1. Require adb ────────────────────────────────────────────────────────────
if ! command -v adb &> /dev/null; then
    echo "❌ adb not found. Install Android SDK Platform Tools:"
    echo "   https://developer.android.com/studio/releases/platform-tools"
    exit 1
fi

# Build adb argument list as an array to avoid word-splitting issues
ADB_ARGS=()
if [ -n "$DEVICE_SERIAL" ]; then
    ADB_ARGS=(-s "$DEVICE_SERIAL")
fi

# ── 2. Confirm a device is connected and ready ────────────────────────────────
DEVICE_LINE=$(adb "${ADB_ARGS[@]}" devices 2>/dev/null | grep -v "^List" | grep "device$" | head -1)
if [ -z "$DEVICE_LINE" ]; then
    echo "❌ No Android device found."
    echo "   • Make sure USB Debugging is enabled on the device."
    echo "   • Accept the 'Allow USB debugging?' prompt on the device screen."
    echo "   • Try: adb devices"
    exit 1
fi

SERIAL=$(echo "$DEVICE_LINE" | awk '{print $1}')
echo "✅ Device found: $SERIAL"

# ── 3. Forward Metro port over USB ───────────────────────────────────────────
echo "🔌 Setting up port forwarding (adb reverse tcp:8081 tcp:8081)..."
adb -s "$SERIAL" reverse tcp:8081 tcp:8081
echo "   Port 8081 forwarded."

# ── 4. Launch Expo on the device ─────────────────────────────────────────────
echo "🚀 Launching Budget Lite on device $SERIAL..."
npx expo start --android --localhost
