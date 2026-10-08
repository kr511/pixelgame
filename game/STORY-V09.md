# Storysystem V0.9

`timeline.ts` ergänzt `story.ts`, `day.ts` und die vorhandenen Memory-Komponenten. Bewegung, Kollisionsprüfung, Kamera, Charakteratlanten, Ruheanimationen, Jahreszeitenwahl, Audio-Stummschaltung und das Schießspiel werden weiterverwendet. Neue Storys laufen im selben `Game.tsx`, nicht auf separaten Demoseiten.

## Historische Angaben

Bestätigt sind der Chatzeitraum 13.–24.11.2025 mit ungefähr 17–23 Uhr, die fünf Gesprächsthemen, Radegast/Pferde/Fahrrad aus Zörbig/Schokolade/nicht gegessen/Unsicherheit am 19.11.2025 und die beiderseitigen schriftlichen Liebesnachrichten am 25.11.2025. Exakte Tageszuordnung der Chat-Themen, exakte Uhrzeiten, Wortlaut der übrigen Gespräche, Koppellayout und Pausen sind Inszenierung. Sie sind sichtbar als Rekonstruktion bezeichnet. Die Ankunftszeit 16 Uhr ist eine Spielzeit, keine historische Behauptung.

Die zwölf Chat-Episoden teilen den bestätigten Zeitraum spielerisch ein. Die Begegnung wird zwischen dem Abend des 18. und dem des 19. November erlebt; eine tatsächliche Reihenfolge innerhalb des 19. November ist nicht überliefert. Zu Collin wird ausschließlich das bestätigte Gesprächsthema dargestellt.

Anuk, Weihnachten, Schulweg, Schießen und der bestehende Abschluss aus V0.8 tragen `date: null` und `confirmed: false`. Ihre bereits vorhandenen Szenen sind ausdrücklich Entwürfe. Der in V0.8 bekannte Zeitraum „Sommer 2026“ für den Abschluss bleibt als `period` erhalten; ein exaktes Datum wird nicht ergänzt. Markt, eigener Schulweg, Turnhalle, persönliche Gespräche, Hundekissen-Migration und die drei Abschlussfotos aus V0.8 bleiben erhalten. Das frühere Weihnachtsdatum ist aus der aktiven Darstellung entfernt. Bekannte historische Tatsachen werden beim späteren Ergänzen den entsprechenden Entwurfsdetails vorgezogen.

## Daten und Erweiterung

`StoryEvent` enthält stabile `id`, `date` / optionales `until` bzw. ein bekannter grober `period`, Schauplatz, Szenentyp, `requires`, Bestätigungsstatus, Dialogdaten, Interaktionsfolge, Illustration, Beschreibung und Inszenierungsdaten. Der Abschlusszustand steht separat in `TimelineSave.progress[id]` mit Checkpoint, Themen, Nachrichtenschritt, erstem tatsächlichen Spielabschluss und Besuchszähler. Historische Daten werden nie aus `completedAt` abgeleitet.

Neue datierte Ereignisse in `STORY_EVENTS` eintragen. Für die vorhandenen Szenentypen `chat`, `encounter` und `love` ist keine neue Speicher- oder Kalenderlogik nötig. IDs bestehender Einträge nicht umbenennen. `requires` bestimmt die Folge; der Kalender überspringt keine unfertigen Vorgänger. Die Sortierung verwendet das historische Datum und `order` für Ereignisse am selben Tag. Unbekannte gültige IDs in gespeicherten Fortschritten bleiben erhalten.

Für die fünf vorbereiteten Kapitel zuerst die bestätigten Angaben sammeln. Datum, Beschreibung, Bedingungen und Inszenierungszeiten im jeweiligen `legacy-*`-Eintrag ergänzen; die genaue bestätigte Schrittfolge gehört weiterhin zu den datengesteuerten `CHAPTERS` in `story.ts`. Erst dann `confirmed` setzen. Bereits vorhandene Spielabschlüsse gelten als erhaltene Entwurfsabschlüsse und begründen kein historisches Datum.

## Getrennte Zeiten und Speicherung

- **Aktuelle Spielzeit:** `TimelineSave.clock`, mit vorhandener `DaySave`-Struktur. Neuer Start am 01.11.2025 um 5 Uhr. Aktionen/Schlaf bleiben innerhalb des Story-Zeitraums. Eine vorhandene Zeit innerhalb des Zeitraums wird unverändert übernommen, einschließlich der gewählten Saison.
- **Historischer Szenenzeitpunkt:** `StoryEvent.date` und szenische Darstellung. Während einer Erinnerung ist der normale Kalender pausiert. Der erste Abschluss kann die Spielzeit bis zum Ende dieses Ereignisses vorwärts bringen; er dreht sie niemals zurück.
- **Wiederholung:** flüchtiger eigener Zustand mit Ausgangsposition und Blickrichtung. Kein Checkpoint einer Wiederholung überschreibt den echten laufenden Fortschritt oder die aktuelle Uhrzeit. Abschluss erhöht nur den Besuchszähler und behält den ersten Abschluss bei.
- **Fortsetzen:** die aktive erste Erinnerung und ihre Checkpoints werden im neuen Kalender-Schlüssel atomar mit dem Fortschritt gespeichert. Neuladen startet die Szene erneut an ihrem Anlaufpunkt, setzt aber die Dialog-/Themenfolge fort. Unterbrechen behält den Checkpoint; ein abgebrochener Durchgang erhält keinen Abschluss.
- **Migration:** alte Kapitelabschlüsse und die bestehende Schießmedaille werden mit dem Marker `legacy` übernommen. Alte Schlüssel werden nicht gelöscht. Der alte Tages-Schlüssel bleibt unverändert; ab V0.9 ist der Kalender-Schlüssel maßgeblich. Namen, Kapitelaktionen und Schießbestwerte benutzen ihre bestehenden Speicherfunktionen.

Gespeicherte Kalender werden strikt validiert. Unlesbare oder unbekannte Versionen bleiben unangetastet. Bei gesperrtem oder vollem Browser-Speicher bleibt die Sitzung spielbar und zeigt einen Hinweis mit erneutem Speicherversuch. Die Jahreszeitenwahl bleibt die vorhandene manuelle Auswahl; historische Novemberszenen verwenden deren Herbstlicht und Partikel.

## Audio und Assets

Die vorhandenen Zimmer-, Welt- und Charakterdateien werden weiterverwendet. `StoryWorldArt.tsx` ergänzt kleine vektorbasierte Pixelillustrationen für Koppel, Pferde, Fahrrad, Schokolade und Handy. Der Koppelaufbau ist eine Spielinterpretation. `WorldAudio` ergänzt die vorhandene synthetische Atmosphäre um leise Abend-/Liebesmelodien; es gibt keine neuen Musikdateien oder Abhängigkeiten. Vorhandene Pause-, Hintergrund- und Stummschaltungsregeln gelten weiter.
