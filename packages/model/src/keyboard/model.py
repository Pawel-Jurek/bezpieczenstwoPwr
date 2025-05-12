import pandas as pd
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

def prepare_keyboard_model():
    df = pd.read_csv("data/combined_keyboard.csv")
    # Przygotowanie danych do trenowania
    X = df.drop(columns=["is_bot"])
    y = df["is_bot"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Normalizacja danych
    scaler = StandardScaler()
    X_train_norm = scaler.fit_transform(X_train)
    X_test_norm = scaler.transform(X_test)

    # Model binarny (1 wyjście z aktywacją sigmoid)
    model = keras.Sequential([
        keras.layers.Dense(256, input_shape=(X_train.shape[1],)),
        keras.layers.LeakyReLU(alpha=0.1),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(128),
        keras.layers.LeakyReLU(alpha=0.1),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(64),
        keras.layers.LeakyReLU(alpha=0.1),
        keras.layers.Dense(1, activation='sigmoid')  # jedno wyjście
    ])

    # Kompilacja modelu
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    # Trenowanie
    history = model.fit(
        X_train_norm, y_train, epochs=150, batch_size=32,
        validation_data=(X_test_norm, y_test), verbose=1
    )
    model.save(f"out/keyboard_model_dropout.h5")
    return history

def charts():
    history = prepare_keyboard_model()

    # Wykresy
    plt.figure(figsize=(12, 5))

    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.title('Binary Crossentropy Loss')
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(history.history['accuracy'], label='Train Acc')
    plt.plot(history.history['val_accuracy'], label='Val Acc')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.title('Accuracy over Epochs')
    plt.legend()

    plt.show()

def main():
    prepare_keyboard_model()