#!/bin/bash

echo "=== [1] Build TensorFlow models ==="
cd packages/model

if [[ "$OSTYPE" == "darwin"* ]]; then
  poetry install --with=macos
else
  poetry install
fi
poetry run mm 
poetry run km

echo "=== [2] Move model files to bbotd ==="
cd ../..
rm -rf packages/bbotd/out/
mkdir -p packages/bbotd/out/
cp -r packages/model/out/* packages/bbotd/models/

echo "=== [3] Build bbotd package ==="
cd packages/bbotd
npm install 
npm run build

echo "✅ Done! Ready to publish."

