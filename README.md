# DL1250PB

Statische Website für das Amateurfunk-Sonderrufzeichen **DL1250PB** zum 1250-jährigen Stadtjubiläum Paderborns.

Das Rufzeichen wird vom DARC-Ortsverband Paderborn **N61** vom 1. Januar bis zum 31. Dezember 2027 aktiviert.

Der Sonder-DOK lautet **1250PB**.

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
- Der Ordner `ics` wird extern automatisch aktualisiert. Termine im externen Quellkalender pflegen, nicht in der generierten Datei `ics/dl1250pb.ics`. Die Website fragt sie beim Laden mit Cache-Revalidierung ab und übernimmt sie in den Kalender.
- Die ICS-Terminbeschreibung (`DESCRIPTION`) wird unter dem Operator und der Uhrzeit als Text angezeigt. Eine Angabe wie `80m, SSB` kann im externen Kalender in die Beschreibung geschrieben werden und erscheint dann auch auf der Website. Zeilenumbrüche bleiben erhalten; HTML wird als Text dargestellt.
- Ein Kalendereintrag legt kein Band und keine QRG fest: Der jeweilige Operator wählt beides frei. Angaben in der Beschreibung dienen der Planung und können sich ändern.
- Der Bildslider im Jubiläumsbereich steht in `.city-gallery-track` in `index.html`. Für weitere Bilder ein `figure.city-slide` ergänzen: Bild unter `img/` ablegen und Dateipfad, Alternativtexte, Bildtitel und Quellenlink anpassen. Die Pfeilbedienung berücksichtigt alle Karten automatisch; Wischen und die Pfeiltasten bei fokussiertem Slider sind ebenfalls möglich.
- Die Sliderbilder erhalten die gleiche Höhe wie die QSL-Karte; ihre Breite ergibt sich aus dem jeweiligen Seitenverhältnis. Die Bilder werden weder beschnitten noch gestreckt.
- Der QSL-Ablauf und die Erklärungen zu OQRS/SAE stehen in `#qsl`, die aufklappbaren häufigen Fragen in `#faq`. Auch neue Texte jeweils auf Deutsch und Englisch pflegen.

## Veröffentlichung bei Hetzner Webhosting S

Die Seite benötigt weder Node.js noch Docker, PHP oder eine Datenbank. Für die Veröffentlichung einfach den **Inhalt dieses Repositorys** per FTP/SFTP oder über den Hetzner-Dateimanager in das Document-Root der Domain hochladen. Je nach Einrichtung heißt das Zielverzeichnis beispielsweise `public_html` oder ist das in der Hetzner-Konsole gewählte Ziel der Domain.

Für die Website werden nur diese Dateien benötigt:

- `index.html`
- `styles.css`
- `gallery.css`
- `info.css`
- `script.js`
- `qsl-address.html`
- `impressum.html`
- `datenschutz.html`
- `robots.txt`
- der Ordner `ics`
- der Ordner `img`
- der Ordner `qsl`

Nach dem Upload die Domain aufrufen und prüfen, ob die Startseite sowie die DCL-Next-Widgets geladen werden. Die Dateien verwenden relative Pfade und funktionieren daher sowohl auf einer eigenen Domain als auch in einem Unterverzeichnis.

> Hinweis: Die Schriftarten und DCL-Next-Widgets werden von externen Servern geladen. Besucher müssen diese Server erreichen können; auf dem Hetzner-Webspace ist dafür keine zusätzliche Konfiguration erforderlich.
