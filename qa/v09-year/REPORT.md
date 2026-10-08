# V0.9 – Produktionsprüfung vom 08.10.2026

Der gebaute Produktions-Worker wurde lokal über `http://localhost:4173/` mit Chromium geprüft. Die Jahresrunde begann ohne Speicherstand. Nach der Korrektur des Testwegfinders wurde ihr ausschließlich über die Spieloberfläche erzeugter Zwischenstand weitergespielt. Sämtliche 38 Ereignisse wurden über Bewegung, Dialoge, Antworten und Szenenanimationen abgeschlossen.

| Kapitel | Spielbare Ereignisse | Ergebnis |
| --- | ---: | --- |
| 1 | 20 | Abgeschlossen |
| 2 | 4 | Abgeschlossen |
| 3 | 2 | Abgeschlossen |
| 4 | 1 | Abgeschlossen |
| 5 | 2 | Abgeschlossen |
| 6 | 3 | Abgeschlossen |
| 7 | 3 | Abgeschlossen |
| 8 | 3 | Abgeschlossen |

Der Endstand liegt am **02.11.2026 um 16:40 Uhr, Tag 367, Herbst**. Jeder Event besitzt genau einen Abschluss; das Album enthält nach erneutem Laden alle 38 Erinnerungen. Historische Daten, bestätigte Zeiträume und als Inszenierung markierte Alltagsszenen werden im Album geprüft. Der persönliche Brief und die gefalteten Kraniche lassen sich öffnen.

Die Prüfung umfasst Antwortauswahl und wechselnde Porträts, das Schokoladentreffen am 16. November, das Geständnis am 24. November um 17:20 Uhr, beide Liebesnachrichten, mehrteilige Weihnachts- und Besuchsszenen, Neuladen von Chat- und Szenencheckpoints sowie alle vier Kalenderjahreszeiten.

Fünf Wiederholungen wurden mit Touchsteuerung auf 844 × 390 gespielt: Chat, Schokolade, Geständnis, „Ich liebe dich“ und Spielplatz. Alle bewahren die aktuelle Spielzeit und erhöhen den Besuchszähler. Handy-Verlauf, Kalender mit acht Kapiteln, Erinnerungsübersicht und Album-Link funktionieren. Hochformat zeigt die bestehende Drehhilfe. Ein separater synthetischer Version-1-Stand bewahrt seine 14 vorhandenen Novemberabschlüsse nach Migration. Während der Läufe wurden keine JavaScript-Seitenfehler erfasst.

Die vollständige Node-Test-Suite besteht aus **67 bestandenen Tests**, einschließlich begehbarer Wege zu jedem Storyziel, Grenzen des Storykalenders, Speicherprüfung und älteren Spielmechaniken.

`evidence.json` enthält die Ereignisfolge, beobachtete Porträts, Prüfungen und Screenshotnamen. `final-save.json` ist der ausschließlich im isolierten Prüfkontext erspielte Endstand für gezielte Wiederholungsprüfungen.
