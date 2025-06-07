import tkinter as tk
from tkinter import messagebox
import time
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay

model = load_model("out/keyboard_model_dropout.h5")
scaler = joblib.load("out/keyboard_scaler.pkl")
def generate_bot_sample(style='fast', noise=0.05):
    """
    Wygeneruj jedną próbkę bota o zadanym stylu.
    style: 'fast', 'slow', 'random', 'human_like'
    """
    n_keys = 13  # jak hold_time_0 do hold_time_12

    if style == 'fast':
        base_hold = 50
        base_gap = 30
    elif style == 'slow':
        base_hold = 200
        base_gap = 150
    elif style == 'random':
        base_hold = np.random.randint(40, 250)
        base_gap = np.random.randint(30, 200)
    elif style == 'human_like':
        base_hold = np.random.normal(120, 30)
        base_gap = np.random.normal(100, 40)
    elif style == 'aggressive':
        base_hold = 30
        base_gap = 20
    elif style == 'lazy':
        base_hold = 250
        base_gap = 200
    elif style == 'drunk':
        base_hold = np.random.normal(120, 80)
        base_gap = np.random.normal(100, 90)
    elif style == 'robotic':
        base_hold = 100
        base_gap = 100
        noise = 0.01  # bardzo mała zmienność
    else:
        raise ValueError("Nieznany styl")


    hold_times = [int(max(1, np.random.normal(base_hold, abs(base_hold * noise)))) for _ in range(n_keys)]
    press_diffs = [int(max(1, np.random.normal(base_gap, abs(base_gap * noise)))) for _ in range(1, n_keys)]
    release_diffs = [int(max(1, np.random.normal(base_gap, abs(base_gap * noise)))) for _ in range(1, n_keys)]

    row = {}
    for i in range(n_keys):
        row[f'hold_time_{i}'] = hold_times[i]
        if i > 0:
            row[f'press_diff_{i}'] = press_diffs[i - 1]
            row[f'release_diff_{i}'] = release_diffs[i - 1]
    return row

def generate_dataset(n=1000, styles=('fast', 'slow', 'random', 'human_like', 'aggressive', 'lazy', 'drunk', 'robotic')):
    data = []
    for _ in range(n):
        style = np.random.choice(styles)
        row = generate_bot_sample(style=style)
        row['bot_style'] = style
        data.append(row)
    return pd.DataFrame(data)

def test_bot_samples(df, model, scaler):
    features = [col for col in df.columns if col.startswith('hold_') or col.startswith('press_') or col.startswith('release_')]
    X = scaler.transform(df[features])
    predictions = model.predict(X)
    df['bot_probability'] = predictions
    return df

# Przykład użycia (zakłada istnienie modelu i skalera):
bot_df = generate_dataset(n=500)
result_df = test_bot_samples(bot_df, model, scaler)
print(result_df.groupby('bot_style')['bot_probability'].describe())
result_df.to_csv("bot_test_results.csv", index=False)


# # Grupowanie po stylu bota
# style_stats = result_df.groupby('bot_style')['bot_probability'].agg(['mean', 'std']).reset_index()
#
# # 📦 BOXPLOT
# plt.figure(figsize=(10, 6))
# sns.boxplot(data=result_df, x='bot_style', y='bot_probability', hue='bot_style', palette='Set2', legend=False)
# plt.title("Rozkład prawdopodobieństw bycia botem wg stylu")
# plt.xticks(rotation=45)
# plt.tight_layout()
# plt.savefig("plot_boxplot.png")
# plt.show()
#
# # 📊 BARPLOT z błędami standardowymi
# result_counts = result_df['bot_style'].value_counts().reindex(style_stats['bot_style'])
# style_stats['stderr'] = style_stats['std'] / result_counts.pow(0.5).values
#
# plt.figure(figsize=(10, 6))
# sns.barplot(data=style_stats, x='bot_style', y='mean', hue='bot_style', palette='Blues_d', legend=False, errorbar=None)
# plt.errorbar(x=range(len(style_stats)), y=style_stats['mean'], yerr=style_stats['stderr'], fmt='none', c='black', capsize=5)
# plt.title("Średnie prawdopodobieństwo bycia botem wg stylu (z błędem standardowym)")
# plt.xticks(rotation=45)
# plt.tight_layout()
# plt.savefig("plot_barplot.png")
# plt.show()
#
# # 📈 HISTOGRAM dla każdego stylu
# plt.figure(figsize=(12, 8))
# for style in result_df['bot_style'].unique():
#     subset = result_df[result_df['bot_style'] == style]
#     sns.kdeplot(subset['bot_probability'], label=style, fill=True, alpha=0.4)
# plt.title("Rozkład gęstości prawdopodobieństw bycia botem")
# plt.xlabel("Prawdopodobieństwo bycia botem")
# plt.legend()
# plt.tight_layout()
# plt.savefig("plot_histogram.png")
# plt.show()
#
#
# # 📌 Filtry do grup cech
# hold_cols = [col for col in result_df.columns if col.startswith('hold_time_')]
# press_cols = [col for col in result_df.columns if col.startswith('press_diff_')]
# release_cols = [col for col in result_df.columns if col.startswith('release_diff_')]
#
# # 1️⃣ Heatmapa: korelacja hold_time_*
# plt.figure(figsize=(10, 8))
# sns.heatmap(result_df[hold_cols].corr(), annot=True, cmap='YlGnBu', fmt=".2f")
# plt.title("Korelacja między hold_time_*")
# plt.tight_layout()
# plt.savefig("plot_heatmap_hold_time.png")
# plt.show()
#
# # 2️⃣ Heatmapa: korelacja press_diff_*
# plt.figure(figsize=(10, 8))
# sns.heatmap(result_df[press_cols].corr(), annot=True, cmap='OrRd', fmt=".2f")
# plt.title("Korelacja między press_diff_*")
# plt.tight_layout()
# plt.savefig("plot_heatmap_press_diff.png")
# plt.show()
#
# # 3️⃣ Heatmapa: korelacja release_diff_*
# plt.figure(figsize=(10, 8))
# sns.heatmap(result_df[release_cols].corr(), annot=True, cmap='BuPu', fmt=".2f")
# plt.title("Korelacja między release_diff_*")
# plt.tight_layout()
# plt.savefig("plot_heatmap_release_diff.png")
# plt.show()
#
# # 4️⃣ (Opcjonalnie) Heatmapa korelacji per styl bota
# for style in result_df['bot_style'].unique():
#     subset = result_df[result_df['bot_style'] == style]
#     corr = subset[hold_cols + press_cols + release_cols].corr()
#
#     plt.figure(figsize=(12, 10))
#     sns.heatmap(corr, cmap='coolwarm', center=0, annot=False)
#     plt.title(f"Heatmapa korelacji - styl: {style}")
#     plt.tight_layout()
#     plt.savefig(f"plot_heatmap_{style}.png")
#     plt.show()


# Pivot: średnia predykcja dla każdego stylu i cechy
features = [col for col in result_df.columns if col.startswith('hold_') or col.startswith('press_') or col.startswith('release_')]
pivot_data = result_df.groupby('bot_style')[features].mean()

plt.figure(figsize=(14, 6))
sns.heatmap(pivot_data, annot=False, cmap='coolwarm', center=0.5)
plt.title("Średnia wartość cech dla każdego stylu bota")
plt.tight_layout()
plt.savefig("plot_feature_means_per_style.png")
plt.show()

# Korelacja między stylami
style_feature_means = result_df.groupby('bot_style')[features].mean()
style_similarity = style_feature_means.T.corr()  # korelacja stylów względem cech

plt.figure(figsize=(8, 6))
sns.heatmap(style_similarity, annot=True, cmap='viridis')
plt.title("Podobieństwo stylów bota (korelacja)")
plt.tight_layout()
plt.savefig("plot_style_similarity.png")
plt.show()
