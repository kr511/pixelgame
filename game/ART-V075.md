# Grafiken und Ortsaufbau in V0.75

Fünf aktive PNG-Hintergründe, jeweils 1254 × 1254, wurden mit Imagegen erstellt. Die drei Luftbilder des Nutzers dienen als Ortsreferenz, die vier sichtbaren Schulhof-Fotos zusätzlich als direkte Bildreferenzen für den Hof. Spielgeometrie und Vordergrundmasken sind auf die fertigen Bilder ausgerichtet. Die Originalfotos werden nicht veröffentlicht.

| Datei unter `public/rooms/` | Gestaltungsbrief |
| --- | --- |
| `radegast-walk-v075.png` | Verkürzte, von oben schräg sichtbare Straße: Felices graues Wohnhaus mit vorgelagertem Giebel oben links, Straße nach Süden/rechts, dichte Hausreihen, rückwärtige Gärten und westliches Grün. Warme, gemalte Bildsprache passend zum bisherigen Spiel. |
| `radegast-stop-v075.png` | Haltestellenszene im Ortskern mit Wartehäuschen, horizontaler Bank, H-Schild und Bus; freie gepflasterte Fläche vor dem Einstieg. Gestaltung ergänzt aus dem Ortskontext. |
| `zoerbig-walk-v075.png` | Markt und Busankunft oben, gebogener südwestlicher Schulweg, Kirche rechts, langer Schulbau unten links und benachbarte Schulgebäude. Keine eingebrannten Spieltexte oder Figuren. |
| `school-court-overhead-v075.png` | Steile Vogelperspektive mit sichtbaren Dächern und großzügiger Hofübersicht. Grauer Schulbau links mit drei Vollgeschossen, weißen Fensterrahmen, Kellergittern und Außentreppe; roter Backsteinbau rechts; roter Querweg, graues Pflaster, Baumbeete mit Sitzrändern und grüne Ecke mit hellen Sitzmauern. Keine Menschen, Beschriftungen, blaue Markierung oder freistehender Hofzaun. |
| `goelzau-walk-v075.png` | Kurzer Weg von der Straße über die Zufahrt zum Schützenhaus, Vorplatz und ländliche Umgebung. Eigene Interpretation des öffentlich belegten Orts; die Fassade ist nicht anhand einer aktuellen Außenaufnahme vermessen. |

`school-court-v075.png` und `school-court-photo-v075.png` sind frühere, nicht mehr verwendete Hofgrafiken. Die Vogelperspektive entstand als Kameravariation der geprüften fotobasierten Grafik; der Grafikkatalog verweist ausschließlich auf `school-court-overhead-v075.png`.

`story.ts` beschreibt begehbare Bodenflächen der drei Wegszenen sowie die Gebäude, Baumbeete und schmalen Sitzmauern des Schulhofs als Polygone. Die Wegsuche prüft zusätzlich die Strecken zwischen ihren Rasterpunkten, damit Figuren schmale Mauern nicht überspringen. `graphics.ts` legt Vordergrundmasken fest; die diagonale Sitzmauer hat mehrere Tiefenabschnitte. Auch die einfache Ersatzgrafik übernimmt die Ansicht von oben. Der südliche Bodenrand reicht bis zum sichtbaren Tor und lässt den Zugang zur grünen Ecke um die Sitzmauer frei.

Elena, Jason, Luca und Wyatt bewegen sich auf kurzen Wegen entlang der unteren Fenstergitter des grauen Schulbaus. Jason und Luca gehen langsamer und pausieren länger. Elias hat dort keine Gruppenroute. Er kommt auf Einladung zum Sitzrand am vorderen Baum oder zur Sitzmauer am Gehweg. Die Ruhedecke liegt auf der freien grünen Fläche. Sitzpositionen, Aufstehwege und die kleinere Figurengröße sind auf die Vogelperspektive abgestimmt. Nach dem Aufstehen umgehen die Schulfreunde die Hofhindernisse auf ihrem Rückweg zur Gruppe.

Die neuen Außenbilder verwenden für Winter eine kühlere, entsättigte Darstellung und die vorhandene Jahreszeitenatmosphäre. Sie besitzen keine eigenen verschneiten PNG-Varianten. Die Garten- und Wohnzimmer-Wintergrafiken bleiben vorhanden.

[Referenzen und Grenzen des Ortsabgleichs](../qa/v075/SOURCES.md) · [Browserprüfung](../qa/v075/REVIEW.md)
