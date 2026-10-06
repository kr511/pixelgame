# V0.7 – Figuren, Animationen und Namen

V0.7 verfeinert die Figuren aus V0.65: neue Richtungsbilder, sichtbare Wege zu Ruheplätzen und größere Namen. Alle sieben Orte wurden bei 1366 × 900 und im Handy-Querformat bei 844 × 390 geprüft. Zusätzlich wurden die vier Wintervarianten und die neuen Namensfunktionen durchgespielt.

## Szenenprüfung

| Ort | Ergebnis | Desktop | Handy |
| --- | --- | --- | --- |
| Zimmer | Felice geht zum Bett; Kopf auf dem Kissen, Körper unter der vorhandenen Decke. Der Name steht am Kopfteil. Abbrechen und Schlafen bis 5 Uhr funktionieren. | [Zimmer](screenshots/desktop-bedroom.png), [Bett](screenshots/bed-under-duvet.png) | [Zimmer](screenshots/mobile-bedroom.png), [Bett](screenshots/mobile-bed-under-duvet.png) |
| Wohnzimmer | Alle Familienrollen sind lesbar und im Buch benennbar. Ergänzte Namen bleiben nach Neuladen erhalten und zeigen im Gespräch das passende Porträt. | [Wohnzimmer](screenshots/desktop-home.png), [Gespräch](screenshots/custom-name-dialogue.png) | [Wohnzimmer](screenshots/mobile-home.png) |
| Küche | Frühstück, Getränk und Aufräumen funktionieren. Felice und Elias laufen zu ihren Stühlen; ihre Namen liegen unter den Füßen, außerhalb der Tischaktionen. | [Küche](screenshots/desktop-kitchen.png), [zusammen sitzen](screenshots/kitchen-together.png) | [Küche](screenshots/mobile-kitchen.png) |
| Garten | Elias geht auf Einladung zur Bank, pausiert mit dem Spiel und bleibt nach dem gemeinsamen Aufstehen ansprechbar. | [Garten](screenshots/desktop-garden.png), [gemeinsame Pause](screenshots/garden-together.png), [Elias bleibt](screenshots/elias-stays-in-garden.png) | [Garten](screenshots/mobile-garden.png) |
| Haltestelle | Elias, Bank und Wege sind sichtbar; der Name bleibt lesbar. | [Haltestelle](screenshots/desktop-bus.png) | [Haltestelle](screenshots/mobile-bus.png) |
| Schule | Alle vier Freunde bewegen sich. Der Browser erfasst vorne, hinten, links und rechts sowie beide Schrittphasen. Elena erreicht Bank und Decke und steht wieder auf. | [Schule](screenshots/desktop-school.png), [Richtungen](screenshots/friends-directions.png), [Sitzen](screenshots/friend-sitting.png), [Liegen](screenshots/friend-lying.png) | [Schule](screenshots/mobile-school.png), [Liegen](screenshots/mobile-friend-lying.png) |
| Schießstand | Alle fünf Schießfreunde, Gastgeber, Bahn und Ruheplätze sind sichtbar. Namen überlagern die Figuren nicht. | [Schießstand](screenshots/desktop-range.png) | [Schießstand](screenshots/mobile-range.png) |

Winterbilder: [Wohnzimmer](screenshots/winter-home.png), [Garten](screenshots/winter-garden.png), [Haltestelle](screenshots/winter-bus.png), [Schule](screenshots/winter-school.png).

## Durchgespielte Abläufe

- Namensübersicht: neun Freunde und sieben bisherige Familien-/Gastgeberrollen. Ein vorübergehender Testname wird ergänzt, gespeichert, nach Neuladen angezeigt und mit dem richtigen Porträt gesprochen. Ein leeres Feld stellt die Rollenbezeichnung wieder her. Die Modi „Immer“, „Beim Nähern“ und „Freunde immer“ funktionieren. [Übersicht](screenshots/names-roster.png), [Handy](screenshots/mobile-names-roster.png).
- Felice: Hinlegen am Bett lässt sich unterwegs abbrechen. Hinsetzen, Hinlegen und Aufstehen kosten weiterhin je zehn Spielminuten; die Übergangsbewegung kostet keine zusätzlichen Minuten.
- Elias: auf Einladung zur Gartenbank laufen, während des Wegs pausieren, gemeinsam sitzen und aufstehen. Anschließend lässt er sich als anwesende Figur erneut ansprechen und hinsetzen.
- Schule: alle vier Freunde laufen ohne Zeitverbrauch; Pause friert ihre Positionen ein. Elena wechselt von Bank zu Decke und zurück zum Stehen. Unterricht führt von 7:15 bis 13 Uhr.
- Küche: alle drei Alltagsaktionen und Wohnzimmer → Küche → Wohnzimmer bestehen. Die gemeinsamen Sitzpositionen zeigen beide Namen vollständig.
- Schlaf: 20:10 → nächster Tag um 5 Uhr; keine Hinweise für den übersprungenen Abend.
- Joystick bei 760 × 390 per Browser-Pointerdrag: Bewegung und Loslassen funktionieren, die Uhr bleibt unverändert, Aufgabenanzeige und Joystick überlagern sich nicht. [Joystick](screenshots/touch-kitchen.png).
- In den geprüften Ansichten treten keine horizontalen Überläufe oder Framework-Fehleranzeigen auf. Beide Browserprüfungen enden mit leerer Fehlerliste.

## Automatische Prüfung

37 Tests bestehen. Die neuen Prüfungen decken schnelle Änderungen während des Aufstehens, Felices Ein-/Ausstieg an jedem Ruheplatz, Elias' Weg zu jedem Nachbarplatz, Namensspeicherung und beschädigte Namensstände ab. Alle neuen Körperausschnitte liegen innerhalb ihrer PNG-Atlanten; die tatsächlichen Bildgrößen passen zum Katalog. Kapitel, Uhrzeit, Jahreszeiten, Wegerreichbarkeit, Bewegung, Audio und Schießwertung bleiben geprüft.

TypeScript, ESLint der geänderten Dateien und der Produktionsbuild bestehen. Die React-Komponenten wurden auf Hook-Abhängigkeiten, Formulare, lokale Speicherung und unnötige Aktualisierungen im Ruhezustand geprüft.

Die konkret zusätzlich gewünschten Namen und persönlichen Aussehensangaben sind noch offen. V0.7 erfindet keine Namen; die bisher genannten neun Freunde bleiben enthalten, zusätzliche Namen können im Buch ergänzt werden. Haltungen und Besuchspositionen gelten für die Spielsitzung; ergänzte Namen werden separat gespeichert.

## Browserprüfung wiederholen

Mit laufendem Server unter `http://127.0.0.1:5173`:

```bash
node qa/v07/browser-check.mjs > /tmp/v07-browser.json
npx --yes --package agent-browser agent-browser --session v07-check --executable-path /usr/bin/chromium batch --bail < /tmp/v07-browser.json
node qa/v07/character-check.mjs > /tmp/v07-characters.json
npx --yes --package agent-browser agent-browser --session v07-check --executable-path /usr/bin/chromium batch --bail < /tmp/v07-characters.json
```

Die Prüfung nutzt isolierte Browserdaten und eigene Beispielspielstände. Der Familien-Testname wird anschließend zurückgesetzt. Screenshots werden in diesem Ordner erneuert.
