import pyautogui
import time
import pygetwindow as gw
import keyboard
import random

def bot_typing_local(text="botpiszetekst", delay=0.05):
    print("Czekam 5 sekund, uruchom aplikację GUI i kliknij w okienko...")
    time.sleep(3)

    for w in gw.getWindowsWithTitle("Keyboard Detection"):
        w.activate()
        time.sleep(0.5)
        break

    for char in text:
        hold_time = 1
        pause_between_keys = 0.1

        keyboard.press(char)
        time.sleep(hold_time)
        keyboard.release(char)
        time.sleep(pause_between_keys)


if __name__ == "__main__":
    bot_typing_local()
