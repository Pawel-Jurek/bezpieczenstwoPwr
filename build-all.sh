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

echo "=== [2] Compile to .json models ==="
poetry run task transform_m 
poetry run task transform_k

echo "=== [3] Move model files to bbotd ==="
cd ../..
rm -rf packages/bbotd/models/
mkdir -p packages/bbotd/models/
mv packages/model/models/ packages/bbotd/models/

echo "=== [4] Build bbotd package ==="
cd packages/bbotd
npm install 
npm run build

echo "✅ Done! Ready to publish."

