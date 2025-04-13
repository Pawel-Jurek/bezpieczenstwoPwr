import os

os.environ["KERAS_BACKEND"] = "tensorflow"
os.environ["TF_USE_LEGACY_KERAS"] = "1"

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, MinMaxScaler, StandardScaler
from tensorflow.keras.layers import LSTM, BatchNormalization, Dense, Dropout, Input
from tensorflow.keras.models import Sequential
from tensorflow.keras.regularizers import l2


def main():
    # Check for CUDA
    print(
        "Num GPUs Available: ", len(tf.config.experimental.list_physical_devices("GPU"))
    )

    # Load data
    data_path = "data/Train_Mouse.csv"
    df = pd.read_csv(data_path)

    # Encode categorical feature 'event_type'
    df["event_type"] = LabelEncoder().fit_transform(df["event_type"])

    # Create new feature: timestamp difference
    df["timestamp_diff"] = df.groupby("session_id")["timestamp"].diff().fillna(0)

    # normalize timestamp_diff
    df["timestamp_diff"] = StandardScaler().fit_transform(df[["timestamp_diff"]])

    # normalize coordinates
    scaler = MinMaxScaler()
    df[["screen_x", "screen_y"]] = scaler.fit_transform(df[["screen_x", "screen_y"]])

    # encode user_id
    label_encoder = LabelEncoder()
    df["user_id"] = label_encoder.fit_transform(df["user_id"])
    num_classes = len(label_encoder.classes_)

    # create sequences BEFORE splitting
    X, y = create_sequences(df, seq_length=75)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Build the model
    model = Sequential(
        [
            Input(shape=(X_train.shape[1], X_train.shape[2])),
            LSTM(128, return_sequences=True),
            BatchNormalization(),
            Dropout(0.3),
            LSTM(64, return_sequences=False),
            # Dropout(0.3),
            # LSTM(32, return_sequences=False),
            Dense(64, activation="relu", kernel_regularizer=l2(0.01)),
            Dropout(0.4),
            Dense(num_classes, activation="softmax"),
        ]
    )

    # Compile the model
    model.compile(
        loss="sparse_categorical_crossentropy",
        optimizer="RMSprop",
        metrics=["accuracy"],
    )

    X_train = np.array(X_train, dtype=np.float32).reshape(-1, 75, 4)
    X_test = np.array(X_test, dtype=np.float32).reshape(-1, 75, 4)

    print(f"X_train shape: {X_train.shape}, X_test shape: {X_test.shape}")

    # Train the model
    model.fit(
        X_train, y_train, epochs=30, batch_size=32, validation_data=(X_test, y_test)
    )

    # Export model to TensorFlow.js format
    model.save("out/tf_keras.h5")

    # Evaluate the model
    # loss, accuracy = model.evaluate(X_test, y_test)
    # print(f'Test Accuracy: {accuracy:.4f


# Function to create sequences
def create_sequences(df, seq_length=75):
    sequences, labels = [], []
    grouped = df.groupby("session_id")

    for _, group in grouped:
        group = group.sort_values("timestamp")
        data = group[["event_type", "screen_x", "screen_y", "timestamp_diff"]].values
        user = group["user_id"].iloc[0]

        for i in range(len(data) - seq_length):
            sequences.append(data[i : i + seq_length])
            labels.append(user)

    return np.array(sequences, dtype=np.float32), np.array(labels, dtype=np.int32)
