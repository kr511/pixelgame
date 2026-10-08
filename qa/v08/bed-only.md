# V0.8 Vorbereitung: Liegen nur im Bett

46 Tests, TypeScript und Produktionsbuild bestanden. Chromium prüfte Wohnzimmer, Küche, Schulhof, Bushaltestelle, Schießstand und Garten: keine Liege-Decken oder Hinlegen-Aktion vorhanden. Helena kann sich weiterhin hinsetzen. Felice legt sich im Bett hin und steht wieder auf. Keine JavaScript-Fehler.

Das frühere Kuscheldecken-Objekt im Anuk-Kapitel ist ein Hundekissen. Alte Inventare werden beim Laden migriert; Schritt- und Objekt-IDs bleiben für vorhandene Spielstände erhalten.

Reproduktion: Entwicklungsserver auf Port 5181 starten, dann `node qa/v08/bed-browser.mjs` (Chromium unter `/usr/bin/chromium`).
