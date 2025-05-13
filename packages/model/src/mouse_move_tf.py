import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import classification_report
from tensorflow.keras import models, layers


def engineer_features(_df):
    agg_funcs = {
        #'behaviour_x': ['min', 'max'],
        #'behaviour_y': ['min', 'max'],
        'time_diff': ['mean', 'std', 'sum', 'max'],
        'x_diff': ['mean', 'std', 'sum'],
        'y_diff': ['mean', 'std', 'sum'],
    }

    grouped = _df.groupby('session_id').agg(agg_funcs)
    grouped.columns = ['_'.join(col) for col in grouped.columns]
    grouped.reset_index(inplace=True)

    labels = _df.groupby('session_id')['bot'].first().reset_index()
    final_df = pd.merge(grouped, labels, on='session_id')
    return final_df


def get_model(input_shape: int):
    model = models.Sequential()
    model.add(layers.Dense(64, activation='relu', input_shape=(input_shape,)))
    model.add(layers.Dropout(0.5))
    model.add(layers.Dense(32, activation='relu'))
    model.add(layers.Dropout(0.3))
    model.add(layers.Dense(1, activation='sigmoid'))

    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

def train_mouse_model_tf():
    df = pd.read_csv('data/mouse_data_combined.csv')

    final_df = engineer_features(df)

    X = final_df.drop(['session_id', 'bot'], axis=1)
    y = final_df['bot'].astype(np.float32)

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    model = get_model(input_shape=X_train.shape[1])
    model.fit(X_train, y_train, epochs=50, batch_size=32, validation_split=0.1, verbose=1)

    model.save(f"out/mouse_model_dropout.h5")

    # y_pred_probs = model.predict(X_test).flatten()
    # y_pred = (y_pred_probs > 0.5).astype(int)


    # report = classification_report(y_test, y_pred, digits=3)
    # return report

def main():
    train_mouse_model_tf()
