# Markt und Vordergrundmasken

Geprüft am 8. Oktober 2026:

- 43 automatisierte Tests, TypeScript und Produktionsbuild erfolgreich.
- Chromium: Markt → Schulweg → Pausenhof → Schulweg → Markt mit Tastatur und Interaktionsknopf vollständig gelaufen.
- Neue Marktgrafik geladen, Löwen-Apotheke oben links, Rathaus rechts.
- Brunnen und Säulensockel gesperrt; beide Markt-Ausgänge und alle Ankunftspunkte erreichbar.
- Markt, Schulweg, Radegast, Gölzau, Wohnzimmer und Küche ohne Grafik-Fallback oder JavaScript-Fehler dargestellt.
- Breite Straßenmasken entfernt; Sofamaske und Tisch/Stuhlmasken von leerem Boden getrennt.
- Chromium im Querformat 844 × 390 ohne horizontalen Überlauf geprüft.

Reproduktion: Entwicklungsserver auf Port 5181 starten, dann `node qa/v08/market-browser.mjs`. Chromium muss unter `/usr/bin/chromium` verfügbar sein. Das Skript verwendet ein eigenes temporäres Browserprofil.
