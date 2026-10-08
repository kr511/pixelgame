# GitHub-Pages-Prüfung

Die Nutzerin öffnet die gebaute `index.html` unter `/pixelgame/`, startet die
vorhandene Spielwelt und erlebt Szenen. Kalender und Abschlüsse werden im
Browser gespeichert und nach dem Neuladen wieder angezeigt. Alle Bilder,
Porträts und Erinnerungen müssen aus demselben Repository-Pfad laden.

```sh
npm run build:pages
npm run preview:pages -- --port 4174
GAME_URL=http://localhost:4174/pixelgame/ python3 qa/pages/browser-check.py
```

Die Abnahme verwendet einen streng statischen HTTP-Server, der nur das gebaute
`dist-pages/` unter `/pixelgame/` bereitstellt. Damit können weder ein
Spielserver noch ein Entwicklungs-Fallback fehlende Dateien verdecken.
Browserkontexte sind isoliert; es werden keine Produktionsstände geändert.

| Grenze | Nachweis |
| --- | --- |
| HTML → Spiel | Statischer Einstieg lädt dasselbe `Game`; neuer Anfang und Chat werden tatsächlich gespielt. |
| Spiel → Assets | Alle 15 Karten und Wintervarianten werden geladen; HTTP-Fehler und URLs außerhalb `/pixelgame/` werden erfasst. |
| Interaktion → Speicher | Chat- und Szenencheckpoints, Kalender und Abschlüsse überstehen Neuladen. |
| Speicher → Album/Handy | Der zuvor über die Oberfläche erspielte Jahresstand öffnet Kalender und 38 Erinnerungen. |
| Touch → Wiederholung | Fahrradbegegnung und Liebesnachrichten werden per Touch erneut gespielt; aktuelle Zeit und erster Abschluss bleiben erhalten. |
| Alte Mechanik → Ergebnis | Neun echte Schüsse, Medaille, Bestwert und Neuladen werden geprüft. |
| GitHub → Live-Adresse | Benötigt die einmalige Pages-Einstellung „GitHub Actions“; der Workflow veröffentlicht nur bei aktivierter Konfiguration. |

`evidence.json` enthält beobachtete Prüfungen, angeforderte Ressourcen und
Browser-/Netzwerkfehler. Screenshotbelege stehen in `screenshots/`. Der erste
Durchlauf korrigierte einen Selektor des neuen Prüfscripts; Spielcode musste
dafür nicht geändert werden. Der anschließende vollständige Durchlauf ist
maßgeblich. Die bisherigen 38 Kapitelereignisse wurden zuvor vollständig
geprüft; der Pages-Lauf prüft gezielt den neuen statischen Einstieg und Pfad.

Zusätzlich bestehen 70 Node-Tests, TypeScript-Prüfung sowie statischer und
bisheriger Serverbuild. Der Workflow verändert die Repository-Sichtbarkeit
nicht. Ein fremder Website-Spielstand wird nicht automatisch auf die neue
Browser-Origin übertragen.
