# V0.9 – Funktionsprüfung

Geprüft am 08.10.2026 in Chromium 151 mit isolierten Browser-Kontexten. Desktop: 1366 × 900; Smartphone: 844 × 390 mit tatsächlichen Touch-/Pointer-Ereignissen am Joystick. Hochformat: 390 × 844 mit der bestehenden Querformat-Anleitung. Die Anwendung bleibt lokal im Browser; Story-Aktionen benötigen keine neue Server-API.

## Ergebnis

| Ablauf | Nachweis |
|---|---|
| Neuer Kalender | Start am 01.11.2025 um 5 Uhr; spätere Erinnerungen zunächst gesperrt |
| Kapitel 1 | Alle 14 datierten Ereignisse vollständig durch ihre UI durchgespielt |
| Verzahnung | Chat 18.11. → Pferde/Schokolade 19.11. → Chat 19.11. → weitere Abende → Liebesnachrichten 25.11. |
| Interaktive Chats | Am Schreibtisch Platz nehmen, Handy öffnen, Themen wählen, Antworten senden, Abend abschließen |
| Unterbrechen/Neuladen | Angefangenes Thema bleibt gespeichert; erneutes Öffnen setzt denselben Chat fort |
| Begegnung | Fahrradankunft, Felice läuft zu Elias, Gespräch, Schokoladenannahme, nicht essen, Unsicherheit, Abschluss |
| Liebesnachrichten | Elias erscheint zuerst; Antwort erst nach kurzer Pause; beide Nachrichten, Herzpartikel, Abschluss |
| Erinnerungsbuch | Richtige historischen Daten, Statuswechsel, Illustrationen, besondere Liebeserinnerung und aktive Wiederholungsbuttons |
| Wiederholung | Ganze Chat-/Begegnungs-/Liebesszenen erneut erlebt; Kalender, alte Tagesspeicherung und vorhandene Abschlüsse behalten ihre Werte |
| Smartphone | Begegnung, Chat und Liebesnachrichten mit Touch-Joystick und Antippen spielbar; keine horizontale Seitenüberbreite |
| Migration | Alte Kapitelabschlüsse, Uhrzeit, Saison und Schießbestwert übernommen; originale Speicher-Schlüssel unverändert |
| Alte Schießerinnerung | Foto → neun Schüsse → Ergebnis → zurück ins Zimmer; Uhrzeit unverändert, Bestwert bleibt erhalten, Buchabschluss/Besuche aktualisiert |
| Unbekannte Daten | Fünf spätere Geschichten mit offenem historischem Datum und ausdrücklich unbestätigtem Ablauf |
| V0.8 bewahrt | Zwölf Orte, Markt/Schulweg, persönliche Gespräche, Hundekissen und Abschlussfeier bleiben erhalten; alle drei Fotos, Pause, gespeicherter Abschluss und erneutes Abspielen geprüft, Kalender dabei unverändert |
| Fehler beim Speichern | Beschädigter Kalender wird nicht überschrieben; bei blockiertem Schreiben erscheint ein Hinweis, die Sitzung bleibt spielbar |
| Pause im Chat | Keine neue Nachricht während der Pause; nach Fortsetzen geht derselbe Nachrichtenstand weiter |

Die automatisierte Browserprüfung registrierte keine JavaScript-Seitenfehler. Die Position des Speicherhinweises wurde nach einem reproduzierten Überlappen der Aktionsknöpfe korrigiert. Der direkte Handy-Einstieg von einem normalen Sitzplatz öffnet den Chat ohne ein zweites Hinsetzen. Der spätere Themenverlauf enthält unterschiedliche, weiterhin ausdrücklich rekonstruierte Texte.

## Logik und Build

- `npm test`: **58/58 bestanden**, einschließlich aller bestehenden Welt-, Routen-, Bewegungs-, Ruhe-, Audio- und Erinnerungsprüfungen sowie acht neuer Kalender-/Storytests.
- `./node_modules/.bin/tsc --noEmit`: bestanden.
- `npm run build`: bestanden; bestehende Vinext-Hinweise zur statischen Routenerkennung sind nicht blockierend.
- `git diff --check`: bestanden.

Die Kalenderprüfungen umfassen Abhängigkeiten, falsche/zu frühe Abschlüsse, spätere bestehende Spielzeit, Wiederholungsbesuche, unterbrochene Chats, Migration, Kalendergrenzen, unbekannte IDs und beschädigte Speicherformate. Historische Daten und die tatsächlichen Zeitstempel der Browserabschlüsse werden getrennt geprüft.

## Wiederholbare Browserprüfung

Der lokale Entwicklungsserver läuft über `npm run dev`. Die Prüfskripte verwenden die im Arbeitsumfeld vorhandene Python-Playwright-Installation und Chromium, nicht die Browserdaten der Spielerin:

```sh
python qa/v09/browser-check.py
python qa/v09/edge-check.py
python qa/v09/legacy-check.py
```

## Szenenbilder

- [Story-Kalender und zunächst gesperrte Einträge](screenshots/calendar-initial.png)
- [Chat am ersten gemeinsamen Abend](screenshots/chat-final.png)
- [Begegnung bei den Pferden](screenshots/radegast-encounter.png)
- [Kleine Unsicherheit mit Schokolade](screenshots/radegast-encounter-pause.png)
- [Das erste Ich liebe dich](screenshots/first-love.png)
- [Erinnerungsbuch nach dem Kapitel](screenshots/memory-book-completed.png)
- [Chat auf dem Smartphone](screenshots/mobile-chat-final.png)
- [Pferdebegegnung auf dem Smartphone](screenshots/mobile-radegast.png)
- [Liebesnachrichten auf dem Smartphone](screenshots/mobile-first-love.png)

Die Koppelgrafik ist eine spielerische Illustration. Szenische Uhrzeiten, Pausen und rekonstruierte Gespräche sind keine neu behaupteten historischen Details.

Die zusätzlich veröffentlichte V0.8-Fassung wurde mit der bereitgestellten V0.75-Codebasis und V0.9 zusammengeführt. Der grobe Abschlusszeitraum „Sommer 2026“ bleibt erhalten; ein genaues Datum wird nicht erfunden. [Erhaltene Turnhalle](screenshots/graduation-preserved.png) · [Abschlussfotos](screenshots/graduation-snapshots.png).
