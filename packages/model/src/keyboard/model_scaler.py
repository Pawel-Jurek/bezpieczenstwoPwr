import pandas as pd
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import joblib
import os

def prepare_keyboard_model():
    print("Wczytywanie danych i przygotowanie modelu...")
    df = pd.read_csv("combined_keyboard.csv")

    X = df.drop(columns=["is_bot"])
    y = df["is_bot"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_norm = scaler.fit_transform(X_train)
    X_test_norm = scaler.transform(X_test)

    os.makedirs("out", exist_ok=True)
    joblib.dump(scaler, "out/keyboard_scaler.pkl")

    model = keras.Sequential([
        keras.layers.Dense(256, input_shape=(X_train.shape[1],)),
        keras.layers.LeakyReLU(alpha=0.1),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(128),
        keras.layers.LeakyReLU(alpha=0.1),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(64),
        keras.layers.LeakyReLU(alpha=0.1),
        keras.layers.Dense(1, activation='sigmoid')
    ])

    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    print(" Rozpoczynam trening...")
    history = model.fit(
        X_train_norm, y_train, epochs=150, batch_size=32,
        validation_data=(X_test_norm, y_test), verbose=1
    )

    model.save("out/keyboard_model_dropout.h5")
    print(" Model zapisany do: out/keyboard_model_dropout.h5")
    print(" Skaler zapisany do: out/keyboard_scaler.pkl")

    # Wyniki końcowe
    final_acc = history.history['val_accuracy'][-1]
    final_loss = history.history['val_loss'][-1]
    print(f" Finalna dokładność walidacyjna: {final_acc:.4f}")
    print(f" Finalna strata walidacyjna: {final_loss:.4f}")
    # Zapis nazw kolumn
    with open("out/keyboard_feature_names.txt", "w") as f:
        f.write("\n".join(X.columns))

    return history

def charts():
    history = prepare_keyboard_model()

    plt.figure(figsize=(12, 5))

    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.xlabel('Epoka')
    plt.ylabel('Strata')
    plt.title('Binary Crossentropy Loss')
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(history.history['accuracy'], label='Train Acc')
    plt.plot(history.history['val_accuracy'], label='Val Acc')
    plt.xlabel('Epoka')
    plt.ylabel('Dokładność')
    plt.title('Accuracy over Epochs')
    plt.legend()

    plt.tight_layout()
    plt.show()

def main():
    history = prepare_keyboard_model()
    charts()

if __name__ == "__main__":
    main()
