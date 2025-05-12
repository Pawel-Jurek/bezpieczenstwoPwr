#!/bin/bash
ARCHIVE="data/mouse_data_combined.tar.gz"
ARCHIVE_K="data/combined_keyboard.tar.gz"

TARGET_DIR="data"

if [ ! -f "$ARCHIVE" ]; then
    echo "Nie znaleziono pliku $ARCHIVE"
    exit 1
fi
if [ ! -f "$ARCHIVE_K" ]; then
    echo "Nie znaleziono pliku $ARCHIVE_K"
    exit 1
fi
mkdir -p "$TARGET_DIR"

echo "Rozpakowywanie $ARCHIVE do $TARGET_DIR..."
tar -xzvf "$ARCHIVE" -C "$TARGET_DIR"
echo "Rozpakowywanie $ARCHIVE_K do $TARGET_DIR..."
tar -xzvf "$ARCHIVE_K" -C "$TARGET_DIR"

echo "Gotowe!"

