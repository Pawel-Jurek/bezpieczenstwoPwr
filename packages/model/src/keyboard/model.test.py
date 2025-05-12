import pandas as pd
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
from model import model

history=model()
test_loss, test_acc = history.evaluate(X_test_norm, y_test)

y_pred_probs = history.predict(X_test_norm)
y_pred_classes = (y_pred_probs > 0.5).astype(int)

cm = confusion_matrix(y_test, y_pred_classes)


# =============================
# TESTS
# =============================

# Test 1: Model accuracy
REQUIRED_MIN_ACCURACY = 0.90
assert test_acc >= REQUIRED_MIN_ACCURACY, (
    f" Test niezaliczony: dokładność {test_acc:.2f} poniżej wymaganych {REQUIRED_MIN_ACCURACY:.2f}"
)
print(f" Test dokładności zaliczony: {test_acc:.2f} ≥ {REQUIRED_MIN_ACCURACY:.2f}")

# Test 2: Confusion matrix limits false positives and negatives
false_positives = cm[0][1]
false_negatives = cm[1][0]

MAX_FALSE_POSITIVES = 10
MAX_FALSE_NEGATIVES = 10

assert false_positives <= MAX_FALSE_POSITIVES, (
    f" Zbyt wiele false positives: {false_positives} > {MAX_FALSE_POSITIVES}"
)
print(f" False positives OK: {false_positives} ≤ {MAX_FALSE_POSITIVES}")

assert false_negatives <= MAX_FALSE_NEGATIVES, (
    f" Zbyt wiele false negatives: {false_negatives} > {MAX_FALSE_NEGATIVES}"
)
print(f" False negatives OK: {false_negatives} ≤ {MAX_FALSE_NEGATIVES}")

# Test 3: Expected features
expected_features = []
for i in range(13):
    expected_features.append(f"hold_time_{i}")
    if i > 0:
        expected_features.append(f"press_diff_{i}")
        expected_features.append(f"release_diff_{i}")

missing_features = [feat for feat in expected_features if feat not in df_features.columns]
assert not missing_features, f" Brakujące cechy w danych: {missing_features}"
