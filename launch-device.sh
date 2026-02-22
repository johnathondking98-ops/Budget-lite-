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

# ── 1. Locate adb ─────────────────────────────────────────────────────────────
# Checks (in order):
#   a) system PATH (adb or adb.exe)
#   b) node_modules/.bin/adb   — JS shim from android-platform-tools devDep
#   c) node_modules/android-platform-tools/platform-tools/adb[.exe]
#      — actual binary downloaded by the npm package after npm install
#   d) ./platform-tools/adb[.exe] — manually extracted Google SDK zip

ADB=""
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

_find_adb() {
    local candidate="$1"
    if [ -x "$candidate" ]; then
        ADB="$candidate"
        return 0
    fi
    # Windows (Git Bash / WSL) — try .exe variant
    if [ -x "${candidate}.exe" ]; then
        ADB="${candidate}.exe"
        return 0
    fi
    return 1
}

echo "🔍 Locating adb..."

if command -v adb &> /dev/null; then
    ADB="adb"
    echo "   Found: $(command -v adb)"
elif command -v adb.exe &> /dev/null; then
    ADB="adb.exe"
    echo "   Found: $(command -v adb.exe)"
else
    # Try npm devDep shim
    _find_adb "$SCRIPT_DIR/node_modules/.bin/adb" && echo "   Found: $ADB" || true
    # Try actual binary downloaded by android-platform-tools package
    if [ -z "$ADB" ]; then
        _find_adb "$SCRIPT_DIR/node_modules/android-platform-tools/platform-tools/adb" \
            && echo "   Found: $ADB" || true
    fi
    # Try manually extracted platform-tools folder in project root
    if [ -z "$ADB" ]; then
        _find_adb "$SCRIPT_DIR/platform-tools/adb" \
            && echo "   Found: $ADB (manually extracted)" || true
    fi
    if [ -z "$ADB" ]; then
        _find_adb "./platform-tools/adb" \
            && echo "   Found: $ADB (manually extracted)" || true
    fi
fi

if [ -z "$ADB" ]; then
    echo ""
    echo "❌ adb not found. Paths checked:"
    echo "   • system PATH"
    echo "   • $SCRIPT_DIR/node_modules/.bin/adb[.exe]"
    echo "   • $SCRIPT_DIR/node_modules/android-platform-tools/platform-tools/adb[.exe]"
    echo "   • $SCRIPT_DIR/platform-tools/adb[.exe]"
    echo ""
    echo "Options to fix:"
    echo "   1. Run 'npm install' — downloads adb automatically via android-platform-tools"
    echo "   2. Extract the platform-tools zip so the folder is at:"
    echo "      $SCRIPT_DIR/platform-tools/"
    echo "      (it should contain adb or adb.exe directly inside that folder)"
    echo "   3. Install Android SDK Platform Tools and add to system PATH:"
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
