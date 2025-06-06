import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils import class_weight
from tensorflow.keras import models, layers
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import Binarizer


def engineer_features(_df):
    _df = _df.sort_values(['session_id', 'timestamp']).copy()

    result = []

    MIN_WINDOW = 6_000
    MAX_WINDOW = 12_000

    for session_id, group in _df.groupby('session_id'):
        group = group.copy()
        group['timestamp_rel'] = group['timestamp'] - group['timestamp'].min()

        start_time = 0
        subsession_index = 0

        while start_time < group['timestamp_rel'].max():
            end_time = start_time + MAX_WINDOW
            window = group[(group['timestamp_rel'] >= start_time) &
                           (group['timestamp_rel'] < end_time)]

            if len(window) == 0:
                break

            duration = window['timestamp_rel'].max() - window['timestamp_rel'].min()
            if duration < MIN_WINDOW:
                start_time = end_time
                continue

            window = window.copy()
            window['subsession_id'] = f"{session_id}_{subsession_index}"
            result.append(window)

            subsession_index += 1
            start_time = window['timestamp_rel'].max()

    expanded_df = pd.concat(result)
    expanded_df.drop(['session_id'], axis=1)

    agg_funcs = {
        'x_diff': ['mean', 'std', 'sum'],
        'y_diff': ['mean', 'std', 'sum'],
    }

    grouped = expanded_df.groupby('subsession_id').agg(agg_funcs)
    grouped.columns = ['_'.join(col) for col in grouped.columns]
    grouped.reset_index(inplace=True)

    labels = expanded_df.groupby('subsession_id')['bot'].first().reset_index()
    final_df = pd.merge(grouped, labels, on='subsession_id')

    final_df["xy_total_activity"] = final_df["x_diff_sum"] + final_df["y_diff_sum"]
    final_df["xy_std_total"] = final_df["x_diff_std"] + final_df["y_diff_std"]
    final_df["xy_mean_total"] = final_df["x_diff_mean"] + final_df["y_diff_mean"]

    return final_df


def get_model(input_shape: int):
    model = models.Sequential([
        layers.Dense(128, activation='relu', input_shape=(input_shape,)),
        layers.Dropout(0.3),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(1, activation='sigmoid')
    ])
    return model


def train_mouse_model_tf():
    df = pd.read_csv('data/mouse_data_combined.csv')
    df["y_diff"] = df["y_diff"].abs()
    df["x_diff"] = df["x_diff"].abs()
    df = df[df['timestamp'] > 6213218697]

    final_df = engineer_features(df)

    X = final_df.drop(['subsession_id', 'bot'], axis=1)
    y = final_df['bot'].astype(np.float32)

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    weights = class_weight.compute_class_weight(class_weight='balanced', classes=np.unique(y_train), y=y_train)
    class_weights = dict(enumerate(weights))

    model = get_model(input_shape=X_train.shape[1])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    history = model.fit(
        X_train, y_train,
        validation_split=0.1,
        epochs=50,
        batch_size=32,
        verbose=1,
        class_weight=class_weights
    )

    model.save(f"out/mouse_model_dropout.h5")

    # Report

    # binarizer = Binarizer(threshold=0.5)
    # y_pred = model.predict(X_test)
    # y_pred_binary = binarizer.fit_transform(y_pred.reshape(-1, 1)).flatten()

    # print(classification_report(y_test, y_pred_binary, digits=3))
    # cm = confusion_matrix(y_test, y_pred_binary)
    # plt.figure(figsize=(5, 4))
    # sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Human', 'Bot'], yticklabels=['Human', 'Bot'])
    # plt.title(f'Confusion Matrix')
    # plt.xlabel('Predicted')
    # plt.ylabel('Actual')
    # plt.tight_layout()
    # plt.show()

def main():
    train_mouse_model_tf()
