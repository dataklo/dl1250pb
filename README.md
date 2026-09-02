# DL1250PB

Statische Website für das Amateurfunk-Sonderrufzeichen **DL1250PB** zum 1250-jährigen Stadtjubiläum Paderborns.

## Lokal starten

```bash
python3 -m http.server 8080
```

Anschließend `http://localhost:8080` öffnen.

## Inhalte pflegen

- Die Wavelog-Widget-URLs stehen in den beiden `iframe`-Elementen im Abschnitt `#live` in `index.html`.
- Die Operatoren werden als Karten im Element `#operator-list` in `index.html` gepflegt.
- QSL-Angaben und Adresse stehen im Abschnitt `#qsl`.
