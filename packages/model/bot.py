import time
from selenium.webdriver.common.keys import Keys

tekst = "Human like"
for char in tekst:
    input_box.send_keys(char)
    time.sleep(0.12)

input_box.send_keys("z")
time.sleep(0.2)
input_box.send_keys(Keys.BACKSPACE)
input_box.send_keys("k")

