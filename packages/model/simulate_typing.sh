#!/bin/bash

tekst="Mark^Scout^mark.scout@mail.com^"

delay=0.5

echo "Kliknij pole tekstowe na stronie, masz 5 sekund..."
sleep 5

for (( i=0; i<${#tekst}; i++ )); do
  znak="${tekst:$i:1}"

  if [[ "$znak" == "^" ]]; then
    xdotool key Tab
  else
    xdotool type --delay 0 "$znak"
  fi

  sleep "$delay"
done
