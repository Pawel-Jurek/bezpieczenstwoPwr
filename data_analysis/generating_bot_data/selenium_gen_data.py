import os
import csv
import time
import random
import uuid
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Używamy absolutnej ścieżki do lokalnego pliku HTML
TEST_PAGE_URL = f"file:///{os.path.abspath('simple.html')}"

NUM_SESSIONS = 50  # Liczba sesji (zmniejszona na potrzeby testów)
KEYBOARD_TEXT = "united states"  # 13 znaków, jak w Twoim keyboard.csv
KEYBOARD_BASE_DELAY_RANGE = (0.03, 0.1)
MOUSE_START_RANGE = (50, 200)
MOUSE_END_RANGE = (400, 800)
MOUSE_STEPS_RANGE = (5, 15)

# Nazwy plików CSV
KEYBOARD_CSV = "bot_keyboard_events.csv"
MOUSE_CSV = "bot_mouse_events.csv"

# Dla keyboard – wide format (nagłówki muszą być dokładnie takie, jak w przykładowym keyboard.csv)
# Zakładamy 13 par (press-0 ... press-12 i release-0 ... release-12)
KEYBOARD_FIELDNAMES = []
for i in range(len(KEYBOARD_TEXT)):
    KEYBOARD_FIELDNAMES.append(f"press-{i}")
    KEYBOARD_FIELDNAMES.append(f"release-{i}")

# Dla myszy – format long, zgodny z Twoim Mouse.csv (tu nie używamy uid, ale session_id)
MOUSE_FIELDNAMES = ['session_id', 'event_type', 'x', 'y', 'timestamp']

def write_events_to_csv(events, fieldnames, filename):
    file_exists = os.path.isfile(filename)
    with open(filename, 'a', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerows(events)

def simulate_bot_keyboard_input_wide(actions):
    """
    Symulacja wpisywania tekstu klawiaturą.
    Zwraca jeden słownik zawierający czasy naciśnięcia (press-X)
    i zwolnienia (release-X) dla każdego znaku.
    Czasy podane są w milisekundach.
    """
    row = {}
    start_time = time.time()
    # Dla każdego znaku: zapisujemy czas naciśnięcia i zwolnienia
    for i, char in enumerate(KEYBOARD_TEXT):
        delay = random.uniform(*KEYBOARD_BASE_DELAY_RANGE)
        press_time = time.time() - start_time
        # Wyślij znak (symulacja naciśnięcia)
        actions.send_keys(char)
        time.sleep(delay)
        release_time = time.time() - start_time
        # Mnożymy przez 1000, by uzyskać milisekundy, i zaokrąglamy
        row[f"press-{i}"] = int(press_time * 1000)
        row[f"release-{i}"] = int(release_time * 1000)
    return row

def simulate_bot_mouse_movement(actions, session_id, driver):
    """
    Symulacja ruchu myszy.
    Losowane są punkty początkowe i końcowe, przy czym współrzędne
    są ograniczane do rozmiaru okna przeglądarki.
    Zdarzenia są zapisywane w formacie long (pojedyncze zdarzenia w wierszach).
    """
    events = []
    start_time = time.time()
    
    # Pobieramy wymiary okna przeglądarki
    window_size = driver.get_window_size()
    max_width = window_size['width']
    max_height = window_size['height']

    # Losujemy współrzędne startowe (z marginesem, aby nie wyjść poza okno)
    start_x = random.randint(MOUSE_START_RANGE[0], min(MOUSE_START_RANGE[1], max_width - 50))
    start_y = random.randint(MOUSE_START_RANGE[0], min(MOUSE_START_RANGE[1], max_height - 50))
    
    # Losujemy współrzędne końcowe, również ograniczone do wymiarów okna
    end_x = random.randint(MOUSE_END_RANGE[0], min(MOUSE_END_RANGE[1], max_width - 10))
    end_y = random.randint(MOUSE_END_RANGE[0], min(MOUSE_END_RANGE[1], max_height - 10))
    
    steps = random.randint(*MOUSE_STEPS_RANGE)
    
    # Przesuwamy kursor do punktu startowego
    actions.move_by_offset(start_x, start_y).perform()
    time.sleep(0.1)

    delta_x = (end_x - start_x) / steps
    delta_y = (end_y - start_y) / steps
    current_x, current_y = start_x, start_y

    for _ in range(steps):
        current_time = time.time() - start_time
        events.append({
            'session_id': session_id,
            'event_type': 'mouse_move',
            'screen_x': round(current_x),
            'screen_y': round(current_y),
            'timestamp': int(current_time * 1000)  # w milisekundach
        })
        time.sleep(random.uniform(0.03, 0.1))
        actions.move_by_offset(delta_x, delta_y)
        current_x += delta_x
        current_y += delta_y

    try:
        actions.perform()
    except Exception as e:
        print(f"Błąd wykonania akcji myszy: {e}")
    return events

def generate_bot_data():
    """
    Główna funkcja generująca dane botów.
    Dla klawiatury tworzy wiersz wide (zgodny z keyboard.csv),
    dla myszy generuje zdarzenia w formacie long.
    """
    # Usunięcie poprzednich plików, jeśli istnieją
    if os.path.exists(KEYBOARD_CSV):
        os.remove(KEYBOARD_CSV)
    if os.path.exists(MOUSE_CSV):
        os.remove(MOUSE_CSV)

    service = Service(ChromeDriverManager().install())

    for _ in range(NUM_SESSIONS):
        session_id = str(uuid.uuid4())
        print(f"Symulacja sesji: {session_id}")
        
        driver = webdriver.Chrome(service=service)
        driver.get(TEST_PAGE_URL)
        actions = ActionChains(driver)

        # Generujemy dane klawiatury w formacie wide
        keyboard_row = simulate_bot_keyboard_input_wide(actions)
        # Dodajemy (opcjonalnie) informację o session_id, jeżeli potrzebna w dalszej analizie;
        # jeśli nie, pomiń tę linię, tak by nagłówki dokładnie odpowiadały przykładowemu keyboard.csv
        # keyboard_row['session_id'] = session_id

        # Generujemy zdarzenia myszy
        mouse_events = simulate_bot_mouse_movement(actions, session_id, driver)

        # Zapisujemy dane – dla klawiatury jeden wiersz, dla myszy wiele wierszy
        write_events_to_csv([keyboard_row], KEYBOARD_FIELDNAMES, KEYBOARD_CSV)
        write_events_to_csv(mouse_events, MOUSE_FIELDNAMES, MOUSE_CSV)

        driver.quit()
        time.sleep(random.uniform(0.5, 1.5))

if __name__ == "__main__":
    generate_bot_data()
    print(f"Zakończono generowanie danych botów. Wyniki zapisano w {KEYBOARD_CSV} oraz {MOUSE_CSV}")
