#!/bin/bash

tekst="hello i'm mark scout "

delay=0.5

echo "Kliknij pole tekstowe na stronie, masz 5 sekund..."
sleep 5

for (( i=0; i<${#tekst}; i++ )); do
  litera="${tekst:$i:1}"
  xdotool type --delay 0 "$litera"
  sleep "$delay"
done
