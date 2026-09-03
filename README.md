# DL1250PB

Statische Website für das Amateurfunk-Sonderrufzeichen **DL1250PB** zum 1250-jährigen Stadtjubiläum Paderborns.

Das Rufzeichen wird vom DARC-Ortsverband Paderborn **N61** vom 1. Januar bis zum 31. Dezember 2027 aktiviert.

## Lokal starten

```bash
python3 -m http.server 8080
```

Anschließend `http://localhost:8080` öffnen.

## Inhalte pflegen

- Die DCL-Next-Widget-URLs für den On-Air- und LoTW-Uploadstatus stehen in den beiden `iframe`-Elementen im Abschnitt `#live` in `index.html`.
- Der DN9DKN-OQRS-Link steht im Abschnitt `#qsl`.
- Die Operatoren werden als Karten im Element `#operator-list` in `index.html` gepflegt.
- Die QSL-Angaben stehen im Abschnitt `#qsl`; die nicht indexierbare Anschrift steht in `qsl-address.html`.
- Deutsche und englische Texte werden über `data-de` und `data-en` direkt an den jeweiligen Elementen gepflegt.
- Termine werden in `ics/dl1250pb.ics` gepflegt und beim Laden der Seite automatisch in den Kalender übernommen.

## Veröffentlichung bei Hetzner Webhosting S

Die Seite benötigt weder Node.js noch Docker, PHP oder eine Datenbank. Für die Veröffentlichung einfach den **Inhalt dieses Repositorys** per FTP/SFTP oder über den Hetzner-Dateimanager in das Document-Root der Domain hochladen. Je nach Einrichtung heißt das Zielverzeichnis beispielsweise `public_html` oder ist das in der Hetzner-Konsole gewählte Ziel der Domain.

Für die Website werden nur diese Dateien benötigt:

- `index.html`
- `styles.css`
- `script.js`
- `qsl-address.html`
- `robots.txt`
- der Ordner `ics`

Nach dem Upload die Domain aufrufen und prüfen, ob die Startseite sowie die DCL-Next-Widgets geladen werden. Die Dateien verwenden relative Pfade und funktionieren daher sowohl auf einer eigenen Domain als auch in einem Unterverzeichnis.

> Hinweis: Die Schriftarten und DCL-Next-Widgets werden von externen Servern geladen. Besucher müssen diese Server erreichen können; auf dem Hetzner-Webspace ist dafür keine zusätzliche Konfiguration erforderlich.
