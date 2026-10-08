# Prüfung des Jahres-Updates

Die Prüfungen verwenden isolierte Chromium-Kontexte und ändern keine Spielstände
oder Produktionsdaten der Spielerin. Der vollständige Durchlauf bedient die
sichtbare Spieloberfläche, ohne Hauptkapitel in `localStorage` vorab abzuschließen.
Der so erspielte Stand wird anschließend für Touch-Wiederholungen verwendet.
Nur die separate Migrationsprüfung setzt einen alten, synthetischen Version-1-Stand.

Für die lokale Entwicklungsfassung:

```sh
npm run dev -- --host 0.0.0.0
python3 qa/v09-year/browser-check.py
```

Für den gebauten Produktions-Worker:

```sh
npm run build
npm run start -- --port 4173
GAME_URL=http://localhost:4173/ python3 qa/v09-year/browser-check.py
```

Der jeweilige Server muss bereits laufen. Das Skript liest Storykonfiguration und
Kollisionsflächen, bewegt Felice jedoch ausschließlich mit Tastatur- oder
Touchereignissen. Es prüft alle acht Kapitel bis zum Finale, verschränkte
Novemberereignisse, Dialogporträts und Antwortauswahl, saisonale Kalenderwechsel,
Neuladen von Chat- und Szenencheckpoints, Erinnerungssammlung und Gegenstände,
Handyverlauf, Kalender, Album und unveränderte Spielzeit beim Wiederholen.

Das Ergebnis und die erlebten Events stehen nach dem Lauf in `evidence.json`;
Screenshots werden in `screenshots/` gespeichert. Fehlgeschlagene Durchläufe
speichern zusätzlich den rein im Prüfkontext erspielten Stand zur Fehleranalyse.

## Ergebnis der Abnahme

Am 8. Oktober 2026 wurden am lokal gebauten Produktions-Worker alle **38
Storyereignisse** tatsächlich über die Oberfläche gespielt. Sechs erste
Abschlüsse wurden nach einem Fehler im Test-Wegfinder aus ihrem bereits
erspielten Checkpoint fortgesetzt; es wurden keine Storyabschlüsse erfunden
oder vorab gesetzt. Alle acht Kapitel enden am 02.11.2026 um 16:40 Uhr.

Die fünf Touch-Wiederholungen (Chat, Begegnung, Geständnis, Liebesnachrichten
und Spielplatz) behalten die aktuelle Uhrzeit. Handyverlauf, Kalender, Album,
Brief/Kraniche und die Migration von 14 älteren Abschlüssen bestehen. Der
Browser meldete keine JavaScript-Seitenfehler. Die vollständigen Nachweise
stehen in `evidence.json`; `final-save.json` enthält den tatsächlich erspielten
Endstand für weitere Wiederholungsprüfungen.

`legacy-report.json` bestätigt sechs weitere Prüfgruppen am Produktions-Worker:
Abschluss mit Fotogalerie und Wiederholung, neun Schüsse mit gespeicherter
Medaille, NPC-Bewegung und Namensverwaltung, Küchenaktionen, Sitz-/Liegeplätze
sowie Rückkehr aus den alten undatierten Geschichten.

`kiss-evidence.json` bestätigt die vollständige Weihnachts-Wiederholung auf
Desktop und Touch: Beide Figuren neigen sich beim Kuss zueinander; Spielzeit
und erster Abschluss bleiben unverändert. `affection-report.json` bestätigt
Umarmung, Händchenhalten, gemeinsames Mitlaufen durch die Haustür ohne doppelte
Figuren und das Beenden des Spaziergangs über den Dialog.

Zusätzlich bestehen 67 automatisierte Tests, TypeScript-Prüfung und
Produktionsbuild. Die neuen Dialog-/Handy-/Album-Komponenten haben keine
ESLint-Fehler; die Rückblickbilder erhalten lediglich den allgemeinen
Next-Bildoptimierungshinweis. Ältere React-Compiler-Lintbefunde der bestehenden
Game-/3D-Komponenten sind davon getrennt.
