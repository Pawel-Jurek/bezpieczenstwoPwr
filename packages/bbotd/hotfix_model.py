import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Input

model = load_model("data/mouse_user_model.h5")

if model.input_shape is None or None in model.input_shape:
    print("No input shape found! Fixing...")

    first_layer = model.layers[0]

    if hasattr(first_layer, "input_shape") and first_layer.input_shape:
        input_shape = first_layer.input_shape[1:]
    else:
        # raise ValueError("Could not determine input shape. Please provide one manualy")
        input_shape = (75, 4)

    print(f"Fixing model with input shape: {input_shape}")

    new_input = Input(shape=input_shape)
    new_model = tf.keras.Model(new_input, model(new_input))

    new_model.save('fixed_model.h5')
    model = new_model

