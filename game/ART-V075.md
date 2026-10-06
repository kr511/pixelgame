# Grafiken und Ortsaufbau in V0.75

Fünf neue PNG-Hintergründe, jeweils 1254 × 1254, wurden mit Imagegen erstellt. Die drei Luftbilder des Nutzers dienten als Referenz für Radegast, Zörbig und den Schulstandort. Die neuen Dateien bleiben unverändert; Spielgeometrie und Vordergrundmasken sind auf die fertigen Bilder ausgerichtet.

| Datei unter `public/rooms/` | Gestaltungsbrief |
| --- | --- |
| `radegast-walk-v075.png` | Verkürzte, von oben schräg sichtbare Straße: Felices graues Wohnhaus mit vorgelagertem Giebel oben links, Straße nach Süden/rechts, dichte Hausreihen, rückwärtige Gärten und westliches Grün. Warme, gemalte Bildsprache passend zum bisherigen Spiel. |
| `radegast-stop-v075.png` | Haltestellenszene im Ortskern mit Wartehäuschen, horizontaler Bank, H-Schild und Bus; freie gepflasterte Fläche vor dem Einstieg. Gestaltung ergänzt aus dem Ortskontext. |
| `zoerbig-walk-v075.png` | Markt und Busankunft oben, gebogener südwestlicher Schulweg, Kirche rechts, langer Schulbau unten links und benachbarte Schulgebäude. Keine eingebrannten Spieltexte oder Figuren. |
| `school-court-v075.png` | Schulgebäude am oberen Rand, Gitter direkt davor mit mittlerem Durchgang, zwei horizontale Bänke vor dem Gitter, rechter Gebäudeflügel und bepflanzter Hof. Die seitliche Bank rechts bleibt Hintergrundmöbel; benutzt werden die zwei korrekt ausgerichteten Bänke links. |
| `goelzau-walk-v075.png` | Kurzer Weg von der Straße über die Zufahrt zum Schützenhaus, Vorplatz und ländliche Umgebung. Eigene Interpretation des öffentlich belegten Orts; die Fassade ist nicht anhand einer aktuellen Außenaufnahme vermessen. |

`story.ts` beschreibt die begehbaren Bodenflächen in den drei neuen Wegszenen als Polygone. Bus, Schulgebäude, Gitter, Bänke und Beete haben zusätzliche Hindernisse. `graphics.ts` legt die passenden Vordergrundmasken fest. Figuren werden auf den Straßenübersichten kleiner gezeichnet als auf dem nahen Pausenhof.

Die beiden Schulbänke verwenden unterschiedliche Plätze mit gemessenen Sitzpositionen. Die Ruhedecke liegt auf freier Hoffläche. Die vier Schulfreunde laufen auf kurzen Wegen unterhalb des Gitters; Jason und Luca behalten ihre langsamere Bewegung und längeren Pausen. Bestehende Figurenatlanten und Felices Bett unter der Decke bleiben Teil der Welt.

Die neuen Außenbilder verwenden für Winter eine kühlere, entsättigte Darstellung und die vorhandene Jahreszeitenatmosphäre. Sie besitzen keine eigenen verschneiten PNG-Varianten. Die Garten- und Wohnzimmer-Wintergrafiken bleiben vorhanden.

[Referenzen und Grenzen des Ortsabgleichs](../qa/v075/SOURCES.md) · [Browserprüfung](../qa/v075/REVIEW.md)
