# V0.75 – Orts- und Szenenprüfung

Geprüft am 06.10.2026 mit Chromium, agent-browser und dem lokalen Vinext-Entwicklungsserver. Alle zehn Orte wurden in 1366 × 900 und 844 × 390 aufgenommen und auf Darstellung sowie horizontales Überlaufen geprüft. Die neuen Außenbilder und der Hof wurden anhand der fertigen Hintergründe ausgerichtet. Die [Ortsreferenzen](SOURCES.md) beschreiben die Grenzen des realen Abgleichs.

## Ergebnis

- 39 Logiktests bestanden. Neu: vollständige, kollisionsgeprüfte Hin- und Rückwege bis zu allen Ausgängen der drei Wegszenen; Schul-/Schießrouten über die neuen Ankunftsorte; alte Kapitelstände bleiben lesbar.
- TypeScript-Prüfung, ESLint der geänderten Spiel- und QA-Dateien sowie Produktionsbuild bestanden.
- Browser: Wohnung → Radegast → Haltestelle → Zörbiger Markt → Schule und zurück vollständig mit Tastatur gelaufen. Die Gölzauer Zufahrt wurde nach dem Bildabgleich nochmals in beide Richtungen geprüft, einschließlich Eintritt in den Schießstand.
- Felice und Elias erreichen beide Bänke am Gitter sowie die Haltestellenbank, sitzen zusammen und stehen wieder auf. Elena erreicht eine Bank und die Ruhedecke und kann wieder aufstehen.
- Unterricht an der neuen Türposition springt von 7:15 auf 13:00. Gehen verbraucht keine zusätzliche Spielzeit; Ortswechsel und Ruheaktionen verwenden die vorhandenen Zeitregeln.
- Ortsplan markiert den aktuellen Ort; auf Desktop und Handy vollständig sichtbar nach Scrollen im Buch.
- Joystick per Maus-/Pointer-Drag bei 760 × 390 geprüft: Bewegung startet und stoppt beim Loslassen. Dies prüft den Pointer-Pfad, nicht reale Touch-Hardware.
- Abschließende Browserläufe melden keine JavaScript-Fehler.

Bei der Prüfung wurden die Beschriftung der Marktankunft, die zwei Schulbankpositionen, der Gölzauer Rückweg auf der Zufahrt und die geometrischen Grenzen der Straßenkurven ausgerichtet. Lucas ruhiger Laufweg liegt ebenfalls vor dem Gitter. Zwei QA-Schritte wurden korrigiert: Ein Weglabel gehört zur Aktionsbeschreibung über dem Knopf; Elenas Sitzplatz muss vor ihrem Haltungswechsel direkt angesprochen werden. Die betroffenen Schritte wurden erfolgreich wiederholt.

## Alle zehn Orte

| Ort | Desktop | Handy-Querformat |
| --- | --- | --- |
| Felices Zimmer | [Bild](screenshots/desktop-bedroom.png) | [Bild](screenshots/mobile-bedroom.png) |
| Wohnzimmer | [Bild](screenshots/desktop-home.png) | [Bild](screenshots/mobile-home.png) |
| Küche | [Bild](screenshots/desktop-kitchen.png) | [Bild](screenshots/mobile-kitchen.png) |
| Garten | [Bild](screenshots/desktop-garden.png) | [Bild](screenshots/mobile-garden.png) |
| Weg Radegast | [Bild](screenshots/desktop-radegast.png) | [Bild](screenshots/mobile-radegast.png) |
| Haltestelle Radegast | [Bild](screenshots/desktop-bus.png) | [Bild](screenshots/mobile-bus.png) |
| Markt und Schulweg Zörbig | [Bild](screenshots/desktop-zoerbig.png) | [Bild](screenshots/mobile-zoerbig.png) |
| Pausenhof | [Bild](screenshots/desktop-school.png) | [Bild](screenshots/mobile-school.png) |
| Zufahrt Schützenhaus | [Bild](screenshots/desktop-goelzau.png) | [Bild](screenshots/mobile-goelzau.png) |
| Schießstand | [Bild](screenshots/desktop-range.png) | [Bild](screenshots/mobile-range.png) |

## Wege, Figuren und Karte

- [Radegaster Weg bis zur Haltestelle](screenshots/radegast-path-end.png)
- [Schulankunft vom Markt aus](screenshots/zoerbig-school-arrival.png)
- [Felice und Elias auf der ersten Bank beim Gitter](screenshots/couple-at-grille.png)
- [Auf der zweiten Bank](screenshots/couple-second-grille-bench.png)
- [Zusammen an der Haltestelle](screenshots/couple-bus-bench.png)
- [Elena sitzt](screenshots/elena-sitting.png) · [Elena liegt auf der Decke](screenshots/elena-lying.png)
- [Eingang Schützenhaus](screenshots/goelzau-entrance.png) · [Rückweg auf der Zufahrt](screenshots/goelzau-return-road.png)
- [Ortsplan Desktop](screenshots/world-map.png) · [Ortsplan Handy](screenshots/mobile-world-map.png)
- [Pointer-Joystick auf dem Gölzauer Weg](screenshots/touch-goelzau.png)

Die fünf neuen Außenbilder haben eine kühle Winterdarstellung: [Radegast](screenshots/winter-radegast.png), [Haltestelle](screenshots/winter-bus.png), [Zörbig](screenshots/winter-zoerbig.png), [Pausenhof](screenshots/winter-school.png), [Gölzau](screenshots/winter-goelzau.png). Eigene verschneite PNG-Varianten sind für diese Bilder nicht enthalten.

## Wiederholen

Server mit `npm run dev` starten. Die QA verwendet einen eigenen Browserkontext und lokale Testspielstände:

```bash
node qa/v075/browser-check.mjs > /tmp/pixelgame-v075-commands.json
npx --yes --package agent-browser agent-browser --session v075 --executable-path /usr/bin/chromium batch --bail --json < /tmp/pixelgame-v075-commands.json
node qa/v075/refinement-check.mjs > /tmp/pixelgame-v075-refine-commands.json
npx --yes --package agent-browser agent-browser --session v075 batch --bail --json < /tmp/pixelgame-v075-refine-commands.json
node qa/v075/school-check.mjs > /tmp/pixelgame-v075-school-commands.json
npx --yes --package agent-browser agent-browser --session v075 batch --bail --json < /tmp/pixelgame-v075-school-commands.json
npx --yes --package agent-browser agent-browser --session v075 close
```

Die drei neuen Wegszenen sind bewusst komprimiert. Die aktuelle Außenform des Schützenhauses und sämtliche Hofdetails konnten nicht vollständig anhand aktueller Fotos belegt werden. Reale Busabfahrtszeiten werden nicht simuliert.
