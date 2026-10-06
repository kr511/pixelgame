# V0.65 – Szenen und Spielabläufe

V0.65 erweitert die verfeinerte V0.61 um Felices Küche, die genaue Bettlage und bewegliche Freunde. Alle sieben Orte wurden im Browser bei 1366 × 900 und im Handy-Querformat bei 844 × 390 geprüft. Die vier vorhandenen Wintervarianten wurden zusätzlich aufgenommen.

## Szenenprüfung

| Ort | Geprüfte Darstellung und Verhalten | Desktop | Handy |
| --- | --- | --- | --- |
| Felices Zimmer | Unveränderte Einrichtung; Kopf auf dem linken Kissen, Körper unter der vorhandenen Decke; Aufstehen und Schlaf bis 5 Uhr | [Zimmer](screenshots/desktop-bedroom.png), [Bett](screenshots/bed-under-duvet.png) | [Zimmer](screenshots/mobile-bedroom.png), [Bett](screenshots/mobile-bed-under-duvet.png) |
| Wohnzimmer | Sofa als Sitzplatz; erreichbare Küchentür; Personen bleiben ansprechbar; nächstes Ziel entscheidet zwischen Tür und Person | [Wohnzimmer](screenshots/desktop-home.png) | [Wohnzimmer](screenshots/mobile-home.png) |
| Küche | Möbel, Hindernisse und Vordergrund passen zum gemalten Raum; Herd, Tisch und Rückweg erreichbar; zwei Stühle für Felice und Elias | [Küche](screenshots/desktop-kitchen.png), [zusammen sitzen](screenshots/kitchen-together.png) | [Küche](screenshots/mobile-kitchen.png) |
| Garten | Hausausgang, Anuk, Gegenstände und Bank bleiben sichtbar und erreichbar | [Garten](screenshots/desktop-garden.png) | [Garten](screenshots/mobile-garden.png) |
| Haltestelle | Elias, Bank und Wege bleiben erreichbar; Ruhedecke liegt auf dem Gras | [Haltestelle](screenshots/desktop-bus.png) | [Haltestelle](screenshots/mobile-bus.png) |
| Schule | Vier Freunde laufen unterhalb des Gebäudes auf getrennten Wegen; Sitzen auf der gemalten Bank und Liegen auf der Decke | [Schule](screenshots/desktop-school.png), [Laufen](screenshots/friends-walking.png), [Sitzen](screenshots/friend-sitting.png), [Liegen](screenshots/friend-lying.png) | [Schule](screenshots/mobile-school.png), [Liegen](screenshots/mobile-friend-lying.png) |
| Schießstand | Alle fünf Schießfreunde, Schießbahn, Bank, Ruhedecke und Ausgang sichtbar; Sitzen und Liegen für alle fünf im Logiktest | [Schießstand](screenshots/desktop-range.png) | [Schießstand](screenshots/mobile-range.png) |

Winterbilder: [Wohnzimmer](screenshots/winter-home.png), [Garten](screenshots/winter-garden.png), [Haltestelle](screenshots/winter-bus.png), [Schule](screenshots/winter-school.png).

## Durchgespielte Abläufe

- Küche: Frühstück, warmes Getränk und Aufräumen erhöhen die Uhr jeweils genau zehn Minuten; kurze Rückmeldungen und Animationen erscheinen. [Frühstück](screenshots/kitchen-breakfast.png), [Getränk](screenshots/kitchen-drink.png), [Aufräumen](screenshots/kitchen-tidy.png).
- Wohnzimmer → Küche → Wohnzimmer: jeder Ortswechsel kostet dreißig Minuten. Ein nahes Gespräch blockiert die näher gelegene Tür nicht mehr.
- Bett: Hinlegen um 20 Uhr führt zu 20:10; Schlafen führt zu Tag 2 um 5 Uhr, ohne Abendhinweise.
- Schulfreunde: alle vier ändern ihre Position, ohne die Uhr weiterzustellen; Pause friert ihre Positionen ein. Nach „Weiter“ setzt sich das Spiel direkt fort.
- Elena: Ansprechen → zur Bank laufen → sitzen → alte Bank verlassen → zur Decke laufen → liegen → aufstehen. Die Auswahl zeigt [eigene Haltungsaktionen](screenshots/friend-actions.png).
- Unterricht an der Schultür: 7:15 → 13:00 Uhr.
- Joystick im Querformat bei 760 × 390 per Browser-Pointerdrag geprüft: Felice bewegt sich und hält nach Loslassen an; die Uhr bleibt unverändert. Aufgabenanzeige und Joystick überlagern sich nicht. [Joystick in der Küche](screenshots/touch-kitchen.png).
- Keine horizontalen Überläufe oder Fehleranzeigen in den geprüften Desktop-/Handyszenen; Browserfehlerliste leer.

## Automatische Prüfung

30 Tests bestanden. Sie prüfen auch die Schulwege, Schrittbilder, jede Sitz- und Liegeposition aller neun Freunde und Elias, Haltungswechsel von Bank zu Decke und zurück, Platzreservierungen, alle neuen Atlasgrenzen und die bisherigen Kapitel-/Speicher-/Tagesabläufe. TypeScript, ESLint der geänderten Dateien und Produktionsbuild bestehen.

Die persönlichen Aussehensangaben der Freunde fehlen weiterhin; Stand-, Lauf- und Ruhezeichnungen nutzen die vorhandenen Platzhalteridentitäten. Haltungen und Reservierungen gelten während der Spielsitzung. Kapitel, Tageszeit und Jahreszeit behalten ihre bisherigen Speicherformate.

## Browserprüfung wiederholen

Mit laufendem Server unter `http://127.0.0.1:5173`:

```bash
node qa/v065/browser-check.mjs > /tmp/v065-browser.json
npx --yes --package agent-browser agent-browser --session v065-check --executable-path /usr/bin/chromium --args '--no-sandbox' batch --bail < /tmp/v065-browser.json
```

Die Prüfung nutzt isolierte Browserdaten und eigene Beispielspielstände. Die Screenshots werden in diesem Ordner erneuert.
