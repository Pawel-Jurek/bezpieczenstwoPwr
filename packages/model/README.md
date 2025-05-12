# ML model

## Installing packages

[cuDNN 8.9]

## Building model

According to [tensorflow compatibility table](https://www.tensorflow.org/install/source#gpu) we need [cuDNN v8.9](https://developer.nvidia.com/cudnn-archive) and [CUDA 12.2](https://developer.nvidia.com/cuda-12-2-0-download-archive)

Or from here:
https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/

Train model.
TODO: add parameter for input files path
TODO: add parameter fro output files path

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
