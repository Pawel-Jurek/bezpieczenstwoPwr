import tkinter as tk
from tkinter import messagebox
import time
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model

model = load_model("out/keyboard_model_dropout.h5")
scaler = joblib.load("out/keyboard_scaler.pkl")

press_times = []
release_times = []

MAX_KEYS = 13

def on_key_press(event):
    if len(press_times) < MAX_KEYS:
        press_times.append(time.time())

def on_key_release(event):
    if len(release_times) < MAX_KEYS:
        release_times.append(time.time())

    if len(release_times) == MAX_KEYS:
        analyze_typing()

def analyze_typing():
    hold_times = []
    press_diffs = []
    release_diffs = []

    for i in range(len(press_times)):
        hold = release_times[i] - press_times[i]
        hold_times.append(int(hold * 1000))

    for i in range(1, len(press_times)):
        press_diff = press_times[i] - press_times[i - 1]
        release_diff = release_times[i] - release_times[i - 1]
        press_diffs.append(int(press_diff * 1000))
        release_diffs.append(int(release_diff * 1000))

    sample = {}
    for i in range(MAX_KEYS):
        sample[f'hold_time_{i}'] = hold_times[i] if i < len(hold_times) else 0
    for i in range(1, MAX_KEYS):
        sample[f'press_diff_{i}'] = press_diffs[i - 1] if i - 1 < len(press_diffs) else 0
        sample[f'release_diff_{i}'] = release_diffs[i - 1] if i - 1 < len(release_diffs) else 0


    with open("out/keyboard_feature_names.txt", "r") as f:
        expected_columns = f.read().splitlines()

    sample_df = pd.DataFrame([sample])

    for col in expected_columns:
        if col not in sample_df.columns:
            sample_df[col] = 0

    sample_df = sample_df[expected_columns]

    print(" Surowe dane (sample_df):")
    print(sample_df)

    missing_cols = [col for col in expected_columns if col not in sample_df.columns]
    extra_cols = [col for col in sample_df.columns if col not in expected_columns]

    if missing_cols:
        print(f"Brakuje kolumn: {missing_cols}")
    if extra_cols:
        print(f"Nadmiarowe kolumny: {extra_cols}")

    sample_df = sample_df[expected_columns]

    print("Kolumny po przefiltrowaniu i uporządkowaniu:")
    print(sample_df.columns.tolist())

    sample_scaled = scaler.transform(sample_df)
    print("Dane po skalowaniu (sample_scaled):")
    print(sample_scaled)
    print(f" Wymiary danych: {sample_scaled.shape}")

    proba = model.predict(sample_scaled)[0][0]

    print(" Surowe dane (sample_df):")
    print(sample_df)
    print("\n Dane po skalowaniu (sample_scaled):")
    print(sample_scaled)
    print(f"\n Prawdopodobieństwo bycia botem (proba): {proba}")

    if proba > 0.5:
        result = "Bot"
    else:
        result = "Człowiek"

    messagebox.showinfo("Wynik", f"Prawdopodobieństwo bota: {proba:.2f}\nWykryto: {result}")

    press_times.clear()
    release_times.clear()
    text_entry.delete(0, tk.END)


root = tk.Tk()
root.title("Detekcja bota na podstawie klawiatury")

instructions = tk.Label(root, text="Wpisz 13 znaków (np. 'abcdefghijklm'):")
instructions.pack()

text_entry = tk.Entry(root, width=40, font=('Arial', 18))
text_entry.pack(padx=10, pady=10)
text_entry.focus()

text_entry.bind("<KeyPress>", on_key_press)
text_entry.bind("<KeyRelease>", on_key_release)

root.mainloop()
