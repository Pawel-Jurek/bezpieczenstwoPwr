import pandas as pd
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt

df = pd.read_csv("combined_train_with_bots.csv")

#1 = bot, 0 = człowiek
df["is_bot"] = df["user"].apply(lambda x: 1 if x >= 200 else 0)


df_features = pd.DataFrame()
df_features["is_bot"] = df["is_bot"]

for i in range(13):
    df_features[f"hold_time_{i}"] = df[f"release-{i}"] - df[f"press-{i}"]
    if i > 0:
        df_features[f"press_diff_{i}"] = df[f"press-{i}"] - df[f"press-{i-1}"]
        df_features[f"release_diff_{i}"] = df[f"release-{i}"] - df[f"release-{i-1}"]


X = df_features.drop(columns=["is_bot"])
y = df_features["is_bot"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_norm = scaler.fit_transform(X_train)
X_test_norm = scaler.transform(X_test)


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

history = model.fit(
    X_train_norm, y_train, epochs=150, batch_size=32,
    validation_data=(X_test_norm, y_test), verbose=1
)

test_loss, test_acc = model.evaluate(X_test_norm, y_test)
print(f"Test Accuracy: {test_acc:.4f}")

y_pred_probs = model.predict(X_test_norm)
y_pred_classes = (y_pred_probs > 0.5).astype(int)

cm = confusion_matrix(y_test, y_pred_classes)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Human", "Bot"])

fig, ax = plt.subplots(figsize=(6, 6))
disp.plot(ax=ax, cmap='Blues')
plt.title("Confusion Matrix")
plt.savefig("confusion_matrix.png")
print("Macierz pomyłek zapisana jako: confusion_matrix.png")


# Zapis modelu
model.save("bot_detection_model.h5")
print("Model zapisany jako: bot_detection_model.h5")

# Wykresy
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Val Loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.title('Loss over Epochs')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['accuracy'], label='Train Acc')
plt.plot(history.history['val_accuracy'], label='Val Acc')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.title('Accuracy over Epochs')
plt.legend()

# Zapis wykresu do pliku
plt.tight_layout()
plt.savefig("training_metrics.png")
print("Wykres zapisany jako: training_metrics.png")

plt.show()

