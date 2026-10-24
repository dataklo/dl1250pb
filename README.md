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
- Die Clubstationen stehen als Karten im gleichen Design direkt darunter in `#clubstation-list`. Bänder und Betriebsarten nur ergänzen, wenn sie für die jeweilige Station bekannt sind.
- Beide Clubstationen verwenden den einheitlichen Hinweis „Anmeldung per E-Mail erwünscht“. DL0PS ist gelegentlich auch außerhalb der regulären Abende besetzt; Besuche sind dann nach vorheriger Anmeldung und Absprache möglich.
- Der OV-Abend steht als eigene Karte bei den Clubstationen: jeden zweiten Mittwoch im Monat ab 20:00 Uhr Ortszeit bei Schinken Willi, ohne Anmeldung. Für Fragen ist `qso@dl1250pb.de` angegeben.
- Besuchszeiten und Anmeldung stehen in den Clubstationskarten: DL0PS jeden zweiten und vierten Mittwoch im Monat ca. 17:30–20:20 Uhr, DL0HNF dienstags 17:00–19:00 Uhr. Diese Zeiten sind ausdrücklich Ortszeit, während der Aktivierungskalender UTC verwendet. Die festen Besuchszeiten werden nicht in den extern gepflegten ICS-Kalender geschrieben.
- Die öffentlichen Treffpunkte sind in den Stationskarten und strukturierten Daten hinterlegt: DL0HNF, Fürstenallee 7, 33102 Paderborn; DL0PS, Kreuzung Hermann-Kirchhoff-Straße / Taubenweg, 33102 Paderborn. Die Adressen sind mit Kartenansichten verlinkt.
- Der Einstieg für Interessierte ohne Funkwissen steht in `#amateurfunk`, mit kurzen Erklärungen und einem aufklappbaren Funklexikon. Die technischen Angaben für Funkamateure bleiben in Kalender, Live-Bereich und QSL-Informationen.
- Die QSL-Angaben stehen im Abschnitt `#qsl`; die nicht indexierbare Anschrift steht in `qsl-address.html`.
- Deutsche und englische Texte werden über `data-de` und `data-en` direkt an den jeweiligen Elementen gepflegt.
- Der Ordner `ics` wird extern automatisch aktualisiert. Termine im externen Quellkalender pflegen, nicht in der generierten Datei `ics/dl1250pb.ics`. Die Website fragt sie beim Laden mit Cache-Revalidierung ab und übernimmt sie in den Kalender.
- Die ICS-Terminbeschreibung (`DESCRIPTION`) wird unter dem Operator und der Uhrzeit als Text angezeigt. Eine Angabe wie `80m, SSB` kann im externen Kalender in die Beschreibung geschrieben werden und erscheint dann auch auf der Website. Zeilenumbrüche bleiben erhalten; HTML wird als Text dargestellt.
- Bandangaben wie `80m`, `20 m` oder `70 cm` aus der Beschreibung erscheinen zusätzlich direkt im jeweiligen Tagesfeld des Monatskalenders. Mehrere Bänder werden zusammengeführt; ohne Bandangabe wird kein Band ergänzt.
- Ein Kalendereintrag legt kein Band und keine QRG fest: Der jeweilige Operator wählt beides frei. Angaben in der Beschreibung dienen der Planung und können sich ändern.
- Die Übersicht `#next-activation` am Seitenanfang verwendet dieselbe ICS-Quelle und zeigt einen laufenden Kalendereintrag oder die nächste geplante Aktivierung. Abgelaufene und abgesagte Termine werden nicht als nächste Aktivierung ausgewählt; ein laufender Kalendereintrag ist keine Live-On-Air-Bestätigung.
- Uhrzeiten werden nach UTC umgerechnet und entsprechend beschriftet. `TZID`-Angaben wie `Europe/Berlin` berücksichtigen Sommer- und Winterzeit; für Termine ohne Zeitzonenangabe gilt `X-WR-TIMEZONE` oder standardmäßig `Europe/Berlin`. Ganztägige Termine erscheinen als „Ganztägig“.
- Der Bildslider im Jubiläumsbereich steht in `.city-gallery-track` in `index.html`. Für weitere Bilder ein `figure.city-slide` ergänzen: Bild unter `img/` ablegen und Dateipfad, Alternativtexte, Bildtitel und Quellenlink anpassen. Die tatsächlichen Bildmaße als `width` und `height` angeben, damit schon vor dem Laden Platz für das Foto reserviert wird. Die Pfeilbedienung berücksichtigt alle Karten automatisch; Wischen und die Pfeiltasten bei fokussiertem Slider sind ebenfalls möglich.
- Die Sliderbilder erhalten maximal die Höhe der QSL-Karte; ihre Breite ergibt sich aus dem jeweiligen Seitenverhältnis. Auf schmalen Displays werden Bilder samt Bildtext auf die verfügbare Galeriebreite begrenzt. Die Bilder werden dabei proportional verkleinert und weder beschnitten noch gestreckt.
- Ein Klick auf ein Galeriebild öffnet eine Großansicht mit Bildtext und Quellenlink. Pfeiltasten oder die Dialogpfeile wechseln das Bild; Escape, Schließen oder ein Klick außerhalb schließen die Ansicht. Der Fokus kehrt zum geöffneten Bild zurück.
- Für spätere optimierte Dateien kann ein Galeriebild optional `data-full-src="img/grossansicht.webp"` verwenden. Ohne dieses Attribut verwendet die Großansicht dieselbe Bilddatei wie die Galerie. Weitere statisch ergänzte `figure.city-slide` werden automatisch berücksichtigt.
- Die kurzen Bildtexte stehen jeweils in der `figcaption` unter dem Foto. Die verlinkten Wikipedia-Artikel dienen als weiterführende Quellen.
- Die drei datierten Meldungen in `#aktuelles` werden in `index.html` gepflegt. Neue Beiträge mit einem tatsächlichen Veröffentlichungsdatum, überprüfbaren Angaben und deutscher sowie englischer Fassung ergänzen.
- Die bestätigte Hauptadresse ist `https://dl1250pb.de/`. Canonical-Link, Sitemap, strukturierte Daten und Vorschaubilder verwenden diese Adresse. Bei einem Domainwechsel alle Angaben zusammen anpassen.
- Suchmaschinen erhalten Titel, Beschreibung und die sichtbaren deutschen Inhalte bereits im HTML. Beim Sprachwechsel werden auch Titel, Beschreibung und Vorschau-Metadaten übersetzt. Beide Sprachen verwenden dieselbe URL; es werden keine separaten Sprachadressen oder `hreflang`-Seiten vorgetäuscht.
- `sitemap.xml` enthält die öffentliche Startseite. `qsl-address.html`, Impressum und Datenschutz bleiben mit ihren bisherigen Indexierungsregeln geschützt. Bei tatsächlichen inhaltlichen Änderungen das Datum `lastmod` der Sitemap aktualisieren.
- Der QSL-Ablauf und die Erklärungen zu OQRS/SAE stehen in `#qsl`, die aufklappbaren häufigen Fragen in `#faq`. Auch neue Texte jeweils auf Deutsch und Englisch pflegen.

## Veröffentlichung bei Hetzner Webhosting S

Die Seite benötigt weder Node.js noch Docker, PHP oder eine Datenbank. Für die Veröffentlichung einfach den **Inhalt dieses Repositorys** per FTP/SFTP oder über den Hetzner-Dateimanager in das Document-Root der Domain hochladen. Je nach Einrichtung heißt das Zielverzeichnis beispielsweise `public_html` oder ist das in der Hetzner-Konsole gewählte Ziel der Domain.

Für die Website werden nur diese Dateien benötigt:

- `index.html`
- `styles.css`
- `gallery.css`
- `lightbox.css`
- `lightbox.js`
- `info.css`
- `activation.css`
- `content.css`
- `basics.css`
- `script.js`
- `qsl-address.html`
- `impressum.html`
- `datenschutz.html`
- `robots.txt`
- `sitemap.xml`
- der Ordner `ics`
- der Ordner `img`
- der Ordner `qsl`

Nach dem Upload die Domain aufrufen und prüfen, ob die Startseite sowie die DCL-Next-Widgets geladen werden. Die Dateien verwenden relative Pfade und funktionieren daher sowohl auf einer eigenen Domain als auch in einem Unterverzeichnis.

Für die Suchmaschinenfreigabe `https://dl1250pb.de/` in der Google Search Console bestätigen, die Sitemap `https://dl1250pb.de/sitemap.xml` einreichen und eine URL-Prüfung der Startseite anstoßen. Auf dem Webspace HTTPS sowie die Weiterleitung zusätzlicher Domainvarianten auf die Hauptadresse einrichten. Der lokale Code führt diese Schritte nicht aus; Suchpositionen und Indexierungszeitpunkt bestimmt Google.

> Hinweis: Die Schriftarten und DCL-Next-Widgets werden von externen Servern geladen. Besucher müssen diese Server erreichen können; auf dem Hetzner-Webspace ist dafür keine zusätzliche Konfiguration erforderlich.
