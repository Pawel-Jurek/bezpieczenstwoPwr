#!/bin/bash

echo "=== [1] Build TensorFlow models ==="
cd packages/model
elif [[ "$OSTYPE" == "darwin"* ]]; then
  poetry install --with=macos
else
  poetry install
fi
poetry install
poetry run build-mouse
poetry run build-keyboard

echo "=== [2] Move model files to bbotd ==="
cd ../..
rm -rf packages/bbotd/models
mkdir -p packages/bbotd/moels
cp -r packages/model/dist/* packages/bbotd/models/

echo "=== [3] Build bbotd package ==="
cd packages/bbotd
npm install 
npm run build

echo "✅ Done! Ready to publish."

