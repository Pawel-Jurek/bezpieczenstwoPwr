# ML model

## Building model

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
