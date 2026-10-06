# V0.6 – Prüfung am 06.10.2026

## Automatisierte Prüfung

- `npm test`: 16 bestanden, 0 fehlgeschlagen. Enthält alle zehn bisherigen Logiktests sowie sechs neue Prüfungen für Kameragrenzen/Zielhinweise, Grafikdateien/Sprecher und Tonfreigabe/Stummschaltung/Fehlerfälle.
- `npx tsc --noEmit`: erfolgreich.
- ESLint für `Game.tsx`, `GameUI.tsx`, `WorldArt.tsx`, `audio.ts`, `camera.ts`, `graphics.ts`, `story.ts`, `memories/ShootingMemory.tsx` und `tests/world.test.mjs`: erfolgreich.
- `npm run build`: alle fünf Vinext-Buildstufen erfolgreich; keine Veröffentlichung durchgeführt.

## Browserdurchlauf

Der Durchlauf verwendete die eigene lokale Testadresse `http://[::1]:5173/`. Der bestehende Spielstand unter `http://localhost:5173/` wurde nicht verändert.

- Anuk: Mutter begrüßt, Decke aufgenommen/abgegeben, Wasser bereitgestellt, Anuk begrüßt, Ball geholt und gespielt; Kapitelabschluss im Buch sichtbar.
- Weihnachten: Haltestelle → Garten → Wohnzimmer, alle sechs Angehörigen begrüßt, Geschirr und Tisch erreicht, Elias angesprochen, gemeinsames Essen und Belohnung abgeschlossen. Alle Sprecher zeigen zugeordnete Porträts; der gemeinsame Dialog zeigt Felice und Elias.
- Schulweg: Fahrkarte, Elias, Fahrplan, Bus zur Schule, Freunde, Heft und Rückgabe, Bus/Garten/Wohnzimmer zurück; Kapitel abgeschlossen.
- Gölzau: vollständiger Weg vom Zimmer über Wohnzimmer/Garten/Haltestelle zum Schießstand; Gastgeber und Bahn erreicht. Neun Schüsse auf drei Scheiben, Ergebnis 88/90; Rückkehr und vierte Kapitelmarkierung erfolgreich.
- Schießrunde erneut gestartet und vorzeitig verlassen; vier bewahrte Kapitel bleiben bestehen.
- Weihnachtskapitel erneut begonnen, ersten Schritt abgeschlossen und Seite neu geladen: Aufgabe 2/11 korrekt fortgesetzt, vier bewahrte Kapitel unverändert.
- Pause: Bewegung bleibt gesperrt; im Minispiel verbraucht die Leertaste während der Pause keine Munition.
- Stummschaltung über Neuladen erhalten. Tonzustände einschließlich verborgenem Tab und blockierten Audiogeräten zusätzlich durch isolierte Web-Audio-Tests geprüft.
- Konsole des Testtabs: keine Fehler.

## Darstellung

Desktop 1280×720, Handyansichten 844×390 und 740×360 sowie Hochformat 390×844 geprüft. Die Handyprüfung erfolgte im Browser mit angepasster Fenstergröße, nicht auf einem physischen Gerät. Der sichtbare Touch-Joystick wurde per Zeigerbewegung betätigt und bewegt die Figur. Hauptbedienelemente und Minispielknöpfe haben mindestens 44 Pixel große Flächen. Der Hochformat-Hinweis ist sichtbar und sperrt Bewegung.

Alle sechs Orte besucht, Kamerafolge und Szenenränder geprüft. Grundgrafiken, Wintervarianten, Elias-Atlas und Porträts visuell angesehen. Figurenmaßstab neben Felice, vier Ansichten, alternierende Schritte und Dialogausschnitt geprüft. Vordergrundmasken sind an Möbel-/Baumpositionen gebunden; der Erreichbarkeitstest kontrolliert alle Aufgaben und Ausgänge. Dekorative Animationen haben Pause- und `prefers-reduced-motion`-Regeln. Fehlende Grafikdateien verwenden die vorherigen SVG-Darstellungen; blockiertes Audio lässt das Spiel weiterlaufen.

Während der Sichtprüfung wurden Felices Porträtausschnitt, der Abstand der Handy-Aufgabenanzeige und die kleinen Minispiel-Touchflächen korrigiert. Danach TypeScript, ESLint und Produktionsbuild erneut erfolgreich ausgeführt.

## Vorschauen

- [Welt mit Felice, Elias und Familie](v06-world.png)
- [Vier bewahrte Kapitel im Erinnerungsbuch](v06-journal.png)
- [Winterwelt mit Touch-Steuerung](v06-mobile.png)
