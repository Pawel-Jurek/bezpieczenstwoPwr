#!/bin/bash

CYAN='\033[0;36m'
NC='\033[0m' # no color

cyan () {
  echo -e "${CYAN}${1}${NC}"
}

cyan "=== [1] Build TensorFlow models ==="
cd packages/model

if [[ "$OSTYPE" == "darwin"* ]]; then
  poetry install --with=macos
else
  poetry install
fi
poetry run mm 
poetry run km

cyan "=== [2] Compile to .json models ==="
poetry run task transform_m 
poetry run task transform_k

cyan "=== [3] Move model files to bbotd ==="
cd ../..
rm -rf packages/bbotd/public/models/
mkdir -p packages/bbotd/public/models/
mv packages/model/models/ packages/bbotd/public/

cyan "=== [4] Build bbotd package ==="
cd packages/bbotd
npm install 
npm run build

echo "✅ Done! Ready to publish."

