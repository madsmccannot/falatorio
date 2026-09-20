#!/bin/bash
# Start Expo dev server accessible from phone on WSL2
# Usage: bash start-mobile.sh

set -e

WINDOWS_IP=$(/mnt/c/Windows/System32/ipconfig.exe 2>/dev/null \
  | grep -A 4 "Wi-Fi" \
  | grep "IPv4" \
  | head -1 \
  | awk '{print $NF}' \
  | tr -d '\r')

PORT=8081

echo "=== Expo Mobile Dev Server (WSL2) ==="
echo "Host: $WINDOWS_IP:$PORT"
echo ""

REACT_NATIVE_PACKAGER_HOSTNAME=$WINDOWS_IP npx expo start --port $PORT --lan
