# ML model

## Installing packages
[cuDNN 8.9]

## Building model

According to [tensorflow compatibility table](https://www.tensorflow.org/install/source#gpu) we need [cuDNN v8.9](https://developer.nvidia.com/cudnn-archive) and [CUDA 12.2](https://developer.nvidia.com/cuda-12-2-0-download-archive)

Or from here:
https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/

Activate venv with python 3.9.x

```bash
source ./venv/bin/activate
```

Train model.
TODO: add parameter for input files path
TODO: add parameter fro output files path

```bash
python3 mouse_move.py
```

```bash
tensorflowjs_converter --input_format=keras --output_format=tfjs_graph_model ./out/tf_keras.h5 ./out/tfjs_model
```

The converter output can befound at ./out/tfjs_model

## Development

Linting:

```bash
poetry run ruff check . --fix
```

Formatting:

```bash
poetry run ruff format .
```

## Troubleshooting

If GPU can't be found:

install nvidia-smi
