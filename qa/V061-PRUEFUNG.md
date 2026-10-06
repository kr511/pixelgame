# V0.61 – Prüfung

## Automatische Prüfungen

- `npm test`: 22 Tests bestanden.
- `npx tsc --noEmit`: bestanden.
- ESLint auf geänderten TS-/TSX-Dateien und dem Tagestest: bestanden.
- `npm run build`: Vinext-Produktionsbuild erfolgreich.

## Browser

Lokale Vinext-Vorschau, Chromium über agent-browser; zusammenhängende Befehlsfolgen halten den richtigen Tab aktiv.

- Start um 5 Uhr und Jahreszeit-Auswahl sichtbar, keine Laufzeitfehler.
- Per Bewegungstasten zum Bett, über Aktionsknopf hinlegen: Liegeposition und 10-Minuten-Verbrauch geprüft.
- Schlaf um 20:10 Uhr: nächster Morgen 5 Uhr, Tag erhöht, keine Abendhinweise; Begrüßung kostet keine zusätzliche Zeit.
- Jahreszeit auf Sommer umgestellt; Auswahl, Tag und Uhrzeit überstehen Neuladen.
- Gartenbank über Bewegung erreichbar; Hinsetzen kostet 10 Minuten und löst beim Überschreiten von 8 Uhr den kurzen Hinweis aus.
- Mit Elias sitzen zeigt beide Sitzpositionen; Aufstehen über E entfernt den Begleiter und stellt Felice auf den begehbaren Anlaufpunkt.
- Hinweis verschwindet nach 4,5 Sekunden.
- Schultür ab 7:15 Uhr: Unterricht besuchen führt zu 13 Uhr; Hinweise zu 8 und 12 Uhr werden nacheinander gezeigt.
- Darstellung bei 1280×633 und 844×390 geprüft, ohne horizontalen Seitenüberlauf oder Fehleroverlay.

## Noch offene Gestaltung

Die persönlichen Grafiken der neun Freunde sind Platzhalter aus dem vorhandenen Figurenatlas. Dialoge sind erste spielerische Entwürfe. Sitzpositionen verwenden den oberen Teil der vorhandenen Figur mit gezeichneten angewinkelten Beinen; im Bett liegt Felice unter einer Decke.
