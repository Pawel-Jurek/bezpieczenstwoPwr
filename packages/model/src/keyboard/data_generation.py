import pandas as pd
import numpy as np

df = pd.read_csv("../../data/train.csv")

total_human_samples = df.shape[0]
samples_per_bot = total_human_samples // 5
bot_modes = ["regular", "fast", "humanlike", "chaotic", "precise"]

def generate_bot_samples_extended(num_samples, user_id, mode):
    data = []
    for _ in range(num_samples):
        sample = [user_id]
        press_time = 0
        for i in range(13):
            if mode == "regular":
                hold = 100
                interval = 150
            elif mode == "fast":
                hold = np.random.normal(80, 5)
                interval = np.random.normal(100, 10)
            elif mode == "humanlike":
                hold = np.random.normal(120, 20)
                interval = np.random.normal(180, 30)
            elif mode == "chaotic":
                hold = np.random.normal(150, 50)
                interval = np.random.normal(200, 80)
            elif mode == "precise":
                hold = 90 + np.random.uniform(-2, 2)
                interval = 130 + np.random.uniform(-2, 2)
            else:
                raise ValueError("Unknown mode")

            press = int(press_time + np.random.normal(0, 3))
            release = int(press + hold)
            press_time += interval
            sample += [press, release]
        data.append(sample)
    return pd.DataFrame(data, columns=["user"] + [f"{act}-{i}" for i in range(13) for act in ("press", "release")])

bot_dfs = []
for i, mode in enumerate(bot_modes):
    user_id = 200 + i
    bot_df = generate_bot_samples_extended(samples_per_bot, user_id, mode)
    bot_dfs.append(bot_df)

bot_data = pd.concat(bot_dfs, ignore_index=True)
combined_df = pd.concat([df, bot_data], ignore_index=True)
# Dodanie etykiety: 0 = człowiek, 1 = bot
combined_df["is_bot"] = combined_df["user"].apply(lambda x: 1 if x >= 200 else 0)

# Tworzenie cech
df_features = pd.DataFrame()
df_features["is_bot"] = combined_df["is_bot"]

for i in range(13):
    df_features[f"hold_time_{i}"] = combined_df[f"release-{i}"] - combined_df[f"press-{i}"]
    if i > 0:
        df_features[f"press_diff_{i}"] = combined_df[f"press-{i}"] - combined_df[f"press-{i - 1}"]
        df_features[f"release_diff_{i}"] = combined_df[f"release-{i}"] - combined_df[f"release-{i - 1}"]
df_features.to_csv("data/combined_keyboard.csv", index=False)

print("Zapisano plik: combined_train_with_bots.csv")