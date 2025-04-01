import pandas as pd
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.regularizers import l2
from sklearn.preprocessing import LabelEncoder, MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split

# Wczytanie danych
data_path = 'Train_Mouse.csv'
df = pd.read_csv(data_path)

# Tworzenie nowych cech
df['timestamp_diff'] = df.groupby('session_id')['timestamp'].diff().fillna(0)
df['timestamp_diff'] = StandardScaler().fit_transform(df[['timestamp_diff']])

# Normalizacja współrzędnych X, Y
scaler = MinMaxScaler()
df[['screen_x', 'screen_y']] = scaler.fit_transform(df[['screen_x', 'screen_y']])

# Kodowanie użytkowników
label_encoder = LabelEncoder()
df['user_id'] = label_encoder.fit_transform(df['user_id'])
num_classes = len(label_encoder.classes_)


# Grupowanie zdarzeń w sekwencje
def create_sequences(df, seq_length=75):
    sequences = []
    labels = []
    grouped = df.groupby('session_id')

    for _, group in grouped:
        group = group.sort_values('timestamp')
        data = group[['event_type', 'screen_x', 'screen_y', 'timestamp_diff']].values
        user = group['user_id'].iloc[0]

        for i in range(len(data) - seq_length):
            sequences.append(data[i:i + seq_length])
            labels.append(user)

    return np.array(sequences), np.array(labels)


seq_length = 75
X, y = create_sequences(df, seq_length)

# Podział na zbiory treningowe i testowe
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Budowanie modelu
model = Sequential([
    LSTM(128, return_sequences=True, input_shape=(seq_length, 4)),
    BatchNormalization(),
    Dropout(0.3),
    LSTM(64, return_sequences=False),
    Dense(64, activation='relu', kernel_regularizer=l2(0.01)),
    Dropout(0.4),
    Dense(num_classes, activation='softmax')
])

# Kompilacja modelu
model.compile(loss='sparse_categorical_crossentropy', optimizer='RMSprop', metrics=['accuracy'])

# Trenowanie modelu
model.fit(X_train, y_train, epochs=30, batch_size=32, validation_data=(X_test, y_test))

# Zapis modelu w formacie JSON
model_json = model.to_json()
with open('mouse_user_model.json', 'w') as json_file:
    json_file.write(model_json)
print("Model zapisany jako mouse_user_model.json")

# Zapis wag modelu
model.save_weights('mouse_user_model.weights.h5')
print("Wagi modelu zapisane jako mouse_user_model_weights.h5")

# Ocena modelu
loss, accuracy = model.evaluate(X_test, y_test)
print(f'Test Accuracy: {accuracy:.4f}')
