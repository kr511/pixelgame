# V0.75 – Orts- und Szenenprüfung

Geprüft am 06.10.2026 mit Chromium, agent-browser und dem lokalen Vinext-Entwicklungsserver. Alle zehn Orte wurden in 1366 × 900 und 844 × 390 aufgenommen und auf Darstellung sowie horizontales Überlaufen geprüft. Der Schulhof wurde anschließend mit den vier Nutzerfotos neu gestaltet und in beiden Größen erneut geprüft. Die [Ortsreferenzen](SOURCES.md) beschreiben den Fotoabgleich und seine Grenzen.

## Ergebnis

- 41 Logiktests bestanden: kollisionsgeprüfte Hin- und Rückwege in den drei Wegszenen, Schul-/Schießrouten über die neuen Ankunftsorte, kompatible Kapitelstände sowie genau vier Freunde am Fenstergitter ohne Elias. Die Wegsuche prüft auch schmale Sitzmauern zwischen ihren Rasterpunkten.
- TypeScript-Prüfung, ESLint der geänderten Spiel- und QA-Dateien sowie Produktionsbuild bestanden.
- Browser: Wohnung → Radegast → Haltestelle → Zörbiger Markt → Schule und zurück vollständig mit Tastatur gelaufen. Die Gölzauer Zufahrt wurde nach dem Bildabgleich nochmals in beide Richtungen geprüft, einschließlich Eintritt in den Schießstand. Der abschließende Reise-, Unterrichts- und Winterlauf besteht mit 165 Prüfschritten ohne JavaScript-Fehler.
- Der fotobasierte Hof zeigt den grauen Schulbau links, das Backsteingebäude rechts, den roten Querweg, Baumbeete und die grüne Ecke mit Sitzmauern. Die vier Freunde bewegen sich entlang der blau markierten unteren Fenstergitter. Ohne Einladung erscheint kein Elias auf dem Hof.
- Felice und Elias erreichen den Sitzrand am vorderen Baum, die Sitzmauer am Gehweg sowie die Haltestellenbank, sitzen zusammen und stehen wieder auf. Elias bleibt anschließend außerhalb der Schulgruppe ansprechbar. Elena erreicht einen Sitzplatz und die Ruhedecke in der grünen Ecke und kann wieder aufstehen.
- Unterricht an der neuen Türposition springt von 7:15 auf 13:00. Gehen verbraucht keine zusätzliche Spielzeit; Ortswechsel und Ruheaktionen verwenden die vorhandenen Zeitregeln.
- Ortsplan markiert den aktuellen Ort; auf Desktop und Handy vollständig sichtbar nach Scrollen im Buch.
- Joystick per Maus-/Pointer-Drag bei 760 × 390 geprüft: Bewegung startet und stoppt beim Loslassen. Dies prüft den Pointer-Pfad, nicht reale Touch-Hardware.
- Abschließende Browserläufe melden keine JavaScript-Fehler.

Die Schule besitzt Hindernispolygone für Fassaden, Baumbeete und Sitzmauern sowie passende Vordergrundmasken. Die diagonale Sitzmauer verwendet mehrere Tiefenabschnitte, damit sitzende Figuren sichtbar bleiben. Ein eigener Browserlauf prüft 118 Schritte einschließlich beider Paar-Sitzplätze, Elenas Haltungswechsel, Hofausgang und Rückkehr, Unterricht und Winterdarstellung; alle Schritte bestehen ohne JavaScript-Fehler. Die einfache Ersatzgrafik folgt derselben Hofanordnung.

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
- [Vier Schulfreunde an den Fenstergittern](screenshots/friends-at-window-grilles.png)
- [Felice und Elias am vorderen Baum](screenshots/couple-front-tree.png)
- [Felice und Elias auf der Sitzmauer](screenshots/couple-seat-wall.png)
- [Schultür nach Unterricht bis 13 Uhr](screenshots/school-door-photo.png)
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

Die drei neuen Wegszenen sind bewusst komprimiert. Der Schulhof folgt den Nutzerfotos, ohne vermessene Abstände oder einen zugesicherten aktuellen Bauzustand. Die aktuelle Außenform des Schützenhauses ist eine Spielinterpretation. Reale Busabfahrtszeiten werden nicht simuliert.
