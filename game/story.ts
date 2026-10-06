export type Place = "bedroom" | "home" | "kitchen" | "garden" | "radegast" | "bus" | "zoerbig" | "school" | "goelzau" | "range";
export type Point = { x: number; y: number };
export type ChapterId = "dog" | "christmas" | "school" | "shooting";
export type Step = { id: string; place: Place; target: string; label: string; speaker: string; text: string; item?: string };
export type Chapter = { id: ChapterId; title: string; date: string; icon: string; intro: string; ending: string; reward: string; steps: Step[] };
export type Entity = Point & { id: string; name: string; kind: "person" | "dog" | "item"; art: string; text: string; display?: Point };
export type Exit = Point & { to: Place; label: string; spawn: Point };
export type Obstacle = { left: number; right: number; top: number; bottom: number };
export const PLACES: Record<Place, { name: string; subtitle: string; exits: Exit[]; obstacles: Obstacle[] }> = {
  bedroom: { name: "Felices Zimmer", subtitle: "Hier beginnt eure Geschichte", exits: [{ x: .9, y: .68, to: "home", label: "Ins Wohnzimmer", spawn: { x: .2, y: .72 } }], obstacles: [
    { left: .12, right: .495, top: .085, bottom: .43 }, { left: .49, right: .745, top: .14, bottom: .3 }, { left: .57, right: .66, top: .24, bottom: .34 }, { left: .11, right: .215, top: .43, bottom: .595 }, { left: .84, right: .95, top: .33, bottom: .585 }, { left: .53, right: .96, top: .81, bottom: 1 },
  ] },
  home: { name: "Bei Felice zu Hause", subtitle: "Ein Platz für uns", exits: [
    { x: .12, y: .72, to: "bedroom", label: "Felices Zimmer", spawn: { x: .84, y: .68 } }, { x: .5, y: .9, to: "garden", label: "In den Garten", spawn: { x: .5, y: .35 } },
    { x: .925, y: .52, to: "kitchen", label: "In Felices Küche", spawn: { x: .5, y: .85 } },
    { x: .11, y: .52, to: "radegast", label: "Vor die Wohnung", spawn: { x: .435, y: .28 } },
  ], obstacles: [{ left: .46, right: .73, top: .235, bottom: .48 }, { left: .12, right: .40, top: .17, bottom: .43 }, { left: .84, right: .96, top: .12, bottom: .46 }] },
  kitchen: { name: "Felices Küche", subtitle: "Ein kleiner Moment im Alltag", exits: [{ x: .5, y: .9, to: "home", label: "Ins Wohnzimmer", spawn: { x: .89, y: .54 } }], obstacles: [
    { left: .087, right: .914, top: .09, bottom: .284 }, { left: .576, right: .854, top: .36, bottom: .585 },
  ] },
  garden: { name: "Der Garten", subtitle: "Kleine Pfoten, große Welt", exits: [
    { x: .5, y: .23, to: "home", label: "Ins Haus", spawn: { x: .5, y: .8 } }, { x: .91, y: .69, to: "radegast", label: "Auf den Weg zur Haltestelle", spawn: { x: .46, y: .42 } },
  ], obstacles: [{ left: .27, right: .7, top: .04, bottom: .19 }, { left: .07, right: .2, top: .23, bottom: .42 }, { left: .73, right: .9, top: .2, bottom: .4 }, { left: .15, right: .35, top: .52, bottom: .60 }] },
  bus: { name: "Radegast · Bushaltestelle", subtitle: "Mit dem Bus nach Zörbig", exits: [
    { x: .18, y: .68, to: "radegast", label: "Zurück zur Wohnung", spawn: { x: .71, y: .85 } }, { x: .735, y: .445, to: "zoerbig", label: "Bus nach Zörbig · Markt", spawn: { x: .61, y: .285 } }, { x: .835, y: .73, to: "goelzau", label: "Auf den Weg nach Gölzau", spawn: { x: .86, y: .63 } },
  ], obstacles: [{ left: 0, right: 1, top: 0, bottom: .245 }, { left: .50, right: .895, top: .26, bottom: .40 }, { left: .235, right: .435, top: .30, bottom: .43 }, { left: 0, right: .12, top: .57, bottom: 1 }, { left: .87, right: 1, top: .60, bottom: 1 }, { left: .16, right: .30, top: .71, bottom: .86 }, { left: .34, right: .53, top: .88, bottom: 1 }, { left: .67, right: 1, top: .89, bottom: 1 }] },
  radegast: { name: "Radegast · Weg zur Haltestelle", subtitle: "Von Felices Wohnung durch den Ort", exits: [
    { x: .38, y: .21, to: "home", label: "In Felices Wohnung", spawn: { x: .17, y: .52 } },
    { x: .46, y: .42, to: "garden", label: "In den Garten", spawn: { x: .82, y: .69 } },
    { x: .71, y: .89, to: "bus", label: "Zur Bushaltestelle", spawn: { x: .20, y: .68 } },
  ], obstacles: [] },
  zoerbig: { name: "Zörbig · Markt und Schulweg", subtitle: "Von der Bushaltestelle zur Grünstraße", exits: [
    { x: .47, y: .20, to: "bus", label: "Bus zurück nach Radegast", spawn: { x: .74, y: .47 } },
    { x: .17, y: .76, to: "school", label: "Zum Pausenhof", spawn: { x: .52, y: .90 } },
  ], obstacles: [{ left: .525, right: .555, top: .15, bottom: .21 }] },
  school: { name: "Sekundarschule Zörbig · Pausenhof", subtitle: "Treffpunkt an den Fenstergittern", exits: [{ x: .505, y: .945, to: "zoerbig", label: "Zurück zum Markt und Bus", spawn: { x: .20, y: .75 } }], obstacles: [] },
  goelzau: { name: "Gölzau · Weg zum Schützenhaus", subtitle: "Ankommen, Freunde treffen, zusammen schießen", exits: [
    { x: .90, y: .65, to: "bus", label: "Zurück nach Radegast", spawn: { x: .82, y: .76 } },
    { x: .265, y: .285, to: "range", label: "Ins Schützenhaus", spawn: { x: .5, y: .82 } },
  ], obstacles: [{ left: .05, right: .63, top: 0, bottom: .245 }, { left: .71, right: 1, top: 0, bottom: .43 }, { left: .505, right: .635, top: .26, bottom: .305 }] },
  range: { name: "Schießstand · Gölzau", subtitle: "Einmal tief durchatmen", exits: [{ x: .5, y: .9, to: "goelzau", label: "Vor das Schützenhaus", spawn: { x: .275, y: .32 } }], obstacles: [{ left: .1, right: .9, top: .04, bottom: .34 }, { left: .66, right: .86, top: .76, bottom: .835 }] },
};

// Bestätigt: acht Personen beim Weihnachtsessen; Namen noch offen.
// Dialoge, Kleidung und genaue Szenengestaltung sind spielerische Entwürfe.
export const ENTITIES: Record<Place, Entity[]> = {
  radegast: [{ id: "radegast-way", name: "Weg zur Bushaltestelle", x: .56, y: .61, kind: "item", art: "sign", text: "Von Felices Wohnung geht es entlang der Häuser und am Grün vorbei zur Haltestelle. Der Weg ist für das Spiel verkürzt." }],
  zoerbig: [
    { id: "zoerbig-stop", name: "Zörbig · Markt", x: .61, y: .285, display: { x: .59, y: .07 }, kind: "item", art: "landmark", text: "Hier kommt ihr mit dem Bus in Zörbig an. Von hier führt der Fußweg südlich zur Sekundarschule in der Grünstraße." },
    { id: "zoerbig-church", name: "St. Mauritius", x: .37, y: .60, display: { x: .70, y: .50 }, kind: "item", art: "landmark", text: "Die Kirche hilft bei der Orientierung: Der Markt liegt nördlich, die Schule südwestlich davon." },
  ],
  goelzau: [{ id: "goelzau-sign", name: "Schützenhaus Gölzau", x: .43, y: .35, display: { x: .40, y: .24 }, kind: "item", art: "landmark", text: "Am Schützenhaus in Weißandt-Gölzau trefft ihr eure Schießfreunde. Durch den Eingang geht es zur Bahn." }],
  bedroom: [{ id: "album", name: "Unser Erinnerungsbuch", x: .77, y: .32, display: { x: .68, y: .23 }, kind: "item", art: "book", text: "Vier Kapitel, viele kleine Momente. Öffne das Erinnerungsbuch oben rechts und wähle eine Geschichte." }, { id: "photo", name: "Foto aus Gölzau", x: .79, y: .52, display: { x: .885, y: .45 }, kind: "item", art: "photo", text: "Das Foto führt dich direkt zum Schießen in Gölzau." }],
  kitchen: [
    { id: "breakfast", name: "Frühstück vorbereiten", x: .535, y: .465, display: { x: .65, y: .465 }, kind: "item", art: "action", text: "Du bereitest ein kleines Frühstück vor und deckst den Küchentisch. Ein ruhiger Start in den Tag." },
    { id: "warm-drink", name: "Warmes Getränk machen", x: .21, y: .33, display: { x: .18, y: .17 }, kind: "item", art: "action", text: "Der Wasserkocher wird warm. Du machst dir ein warmes Getränk und nimmst dir einen kleinen Moment Zeit." },
    { id: "tidy-kitchen", name: "Küche aufräumen", x: .89, y: .48, display: { x: .8, y: .46 }, kind: "item", art: "action", text: "Du räumst das Geschirr weg und wischst den Tisch ab. Jetzt ist die Küche wieder gemütlich und ordentlich." },
    { id: "elias-kitchen", name: "Elias", x: .43, y: .58, kind: "person", art: "elias", text: "Ein Frühstück mit dir klingt gut. Wollen wir uns zusammen an den Tisch setzen?" },
  ],
  home: [
    { id: "family", name: "Felices Mutter", x: .28, y: .5, kind: "person", art: "mother", text: "Schön, dass ihr da seid. Hier ist immer Platz für euch." },
    { id: "stepfather", name: "Felices Stiefvater", x: .75, y: .47, kind: "person", art: "stepfather", text: "Kommt herein. Wir machen es uns heute alle zusammen gemütlich." },
    { id: "halfsister", name: "Felices Halbschwester", x: .32, y: .7, kind: "person", art: "halfsister", text: "Schön, heute Zeit miteinander zu verbringen." },
    { id: "halfsister-partner", name: "Freund der Halbschwester", x: .18, y: .62, kind: "person", art: "partner-one", text: "Hallo ihr beiden! Macht es euch gemütlich." },
    { id: "stepsister", name: "Tochter des Stiefvaters", x: .76, y: .8, kind: "person", art: "stepsister", text: "Heute sind wir zu acht. Das wird ein schöner gemeinsamer Abend." },
    { id: "stepsister-partner", name: "Ihr Freund", x: .86, y: .65, kind: "person", art: "partner-two", text: "Schön, dass wir heute alle zusammen hier sind." },
    { id: "elias-home", name: "Elias", x: .57, y: .77, kind: "person", art: "elias", text: "Am schönsten ist es, wenn wir gemeinsam hier sind." },
    { id: "dishes", name: "Geschirr", x: .77, y: .35, display: { x: .685, y: .345 }, kind: "item", art: "plates", text: "Teller, Besteck und Gläser für einen gemeinsamen Abend." },
    { id: "table", name: "Esstisch", x: .57, y: .53, display: { x: .57, y: .44 }, kind: "item", art: "star", text: "Ein Tisch voller kleiner Dinge, an die man sich später erinnert." },
    { id: "blanket", name: "Kuscheldecke", x: .3, y: .48, display: { x: .235, y: .325 }, kind: "item", art: "blanket", text: "Eine weiche Decke für einen neuen Lieblingsplatz." },
  ],
  garden: [
    { id: "anuk", name: "Anuk", x: .58, y: .53, kind: "dog", art: "dog", text: "Anuk, euer American Akita, schnuppert an deiner Hand. Sein eingerollter Schwanz wippt zufrieden." },
    { id: "bowl", name: "Wassernapf", x: .32, y: .46, kind: "item", art: "bowl", text: "Frisches Wasser steht bereit." },
    { id: "ball", name: "Spielball", x: .74, y: .69, kind: "item", art: "ball", text: "Ein kleiner Ball, bereit für eine große Freundschaft." },
    { id: "dog-bed", name: "Anuks Platz", x: .35, y: .72, kind: "item", art: "bed", text: "Hier kann Anuk in Ruhe ankommen." },
  ],
  bus: [
    { id: "elias-bus", name: "Elias", x: .485, y: .49, kind: "person", art: "elias", text: "Ein gewöhnlicher Weg fühlt sich zusammen gleich anders an." },
    { id: "timetable", name: "Fahrplan · Radegast–Zörbig", x: .45, y: .455, display: { x: .45, y: .32 }, kind: "item", art: "sign", text: "Radegast ↔ Zörbig. Euer Schulbus verbindet die Haltestelle mit der Sekundarschule Zörbig. Rechts führt der Spielweg nach Gölzau." },
    { id: "ticket", name: "Fahrkarte", x: .39, y: .48, display: { x: .405, y: .40 }, kind: "item", art: "ticket", text: "Eine Fahrkarte für den gemeinsamen Weg." },
  ],
  school: [
    { id: "school-grille", name: "Treffpunkt am Fenstergitter", x: .32, y: .60, display: { x: .37, y: .70 }, kind: "item", art: "landmark", text: "Die niedrigen Gitter sitzen vor den unteren Fenstern des grauen Schulgebäudes. Hier stehen Elena, Jason, Luca und Wyatt in der Pause." },
    { id: "friends", name: "Elena", x: .27, y: .66, kind: "person", art: "elena", text: "Hey Felice! Wir treffen uns am Gitter beim Schulgebäude. Bleibst du noch ein bisschen bei mir?" },
    { id: "jason", name: "Jason", x: .285, y: .56, kind: "person", art: "jason", text: "Hey. Ich mache gerade eine kleine Pause am Gitter. Du kannst dich gern dazustellen." },
    { id: "luca", name: "Luca", x: .295, y: .46, kind: "person", art: "luca", text: "Hallo Felice. Heute ist es hier ziemlich ruhig. Das mag ich." },
    { id: "wyatt", name: "Wyatt", x: .305, y: .36, kind: "person", art: "wyatt", text: "Hey Felice! Schön, dass du da bist." },
    { id: "notebook", name: "Vergessenes Heft", x: .57, y: .72, kind: "item", art: "book", text: "Jemand hat ein Heft liegen gelassen." },
    { id: "school-door", name: "Schultür", x: .77, y: .684, display: { x: .822, y: .625 }, kind: "item", art: "bell", text: "Der Unterricht ist vorbei. Zeit für den gemeinsamen Heimweg." },
  ],
  range: [{ id: "range-host", name: "Am Schießstand", x: .32, y: .57, kind: "person", art: "host", text: "Die Bahn ist bereit. Neun Schüsse, drei Scheiben. Nimm dir Zeit." }, { id: "shoot", name: "Schießbahn", x: .5, y: .44, kind: "item", art: "target", text: "Bereit für deine Runde?" },
    { id: "ida", name: "Ida", x: .19, y: .68, kind: "person", art: "ida", text: "Hallo Felice! Schön, dich beim Schießen zu sehen." },
    { id: "helena", name: "Helena", x: .32, y: .78, kind: "person", art: "helena", text: "Hi Felice! Wollen wir uns nach der Runde kurz zusammensetzen?" },
    { id: "linda", name: "Linda", x: .78, y: .57, kind: "person", art: "linda", text: "Hallo! Die nächste Runde wartet schon auf uns." },
    { id: "lina", name: "Lina", x: .65, y: .68, kind: "person", art: "lina", text: "Hey Felice, wie läuft dein Tag bisher?" },
    { id: "alexandra", name: "Alexandra", x: .82, y: .70, kind: "person", art: "alexandra", text: "Schön, dass wir uns hier treffen. Viel Spaß bei deiner Runde!" },
  ],
};

export const CHAPTERS: Chapter[] = [
  { id: "dog", title: "Willkommen, Anuk", date: "Der Tag, an dem Anuk kam", icon: "♥", intro: "Anuk, ein American Akita, kommt an. Bereite ihm einen gemütlichen Platz vor und lerne ihn in Ruhe kennen.", ending: "Ein Napf, eine Decke, ein gemeinsames Spiel. Aus einem neuen Ort wird für Anuk ein Zuhause.", reward: "Anuk begleitet dich im Garten", steps: [
    { id: "dog-family", place: "home", target: "family", label: "Sprich zu Hause mit Felices Mutter", speaker: "Felices Mutter", text: "Heute kommt Anuk. Lass uns seinen Platz vorbereiten, bevor wir ihn begrüßen." },
    { id: "dog-blanket", place: "home", target: "blanket", label: "Hol die Kuscheldecke", speaker: "Felice", text: "Die ist schön weich. Genau richtig für Anuks neuen Platz.", item: "Kuscheldecke" },
    { id: "dog-bed", place: "garden", target: "dog-bed", label: "Lege die Decke auf Anuks Platz im Garten", speaker: "Felice", text: "So. Ein gemütlicher Rückzugsort, ganz für dich.", item: "-Kuscheldecke" },
    { id: "dog-water", place: "garden", target: "bowl", label: "Fülle Anuks Wassernapf", speaker: "Felice", text: "Frisches Wasser steht bereit. Jetzt darfst du erst einmal ankommen." },
    { id: "dog-hello", place: "garden", target: "anuk", label: "Begrüße Anuk ganz vorsichtig", speaker: "Anuk", text: "Eine feuchte Nase an deiner Hand. Anuk schnuppert, wartet kurz – und wedelt." },
    { id: "dog-ball", place: "garden", target: "ball", label: "Hol den Spielball", speaker: "Felice", text: "Ob du Lust auf eine kleine Runde hast?", item: "Spielball" },
    { id: "dog-play", place: "garden", target: "anuk", label: "Spiele mit Anuk", speaker: "Felice", text: "Anuk flitzt dem Ball hinterher und kommt zu dir zurück. Willkommen zu Hause, kleiner Freund.", item: "-Spielball" },
  ] },
  { id: "christmas", title: "Das erste Weihnachtsessen", date: "25. Dezember 2025", icon: "✦", intro: "Elias ist zum ersten Mal bei Felice zu Hause zum Weihnachtsessen. Ein besonderer Abend beginnt an der Haltestelle.", ending: "Der 25.12.2025. Zum ersten Mal Elias bei Felice zu Hause, gemeinsam am Weihnachtstisch. Dieser Abend bleibt.", reward: "Weihnachtsstern im Erinnerungsbuch", steps: [
    { id: "xmas-meet", place: "bus", target: "elias-bus", label: "Begrüße Elias an der Haltestelle", speaker: "Elias", text: "Unser erstes Weihnachtsessen bei dir zu Hause. Ich freue mich darauf. Gehen wir zusammen?" },
    { id: "xmas-family", place: "home", target: "family", label: "Begrüßt Felices Mutter im Wohnzimmer", speaker: "Felices Mutter", text: "Frohe Weihnachten! Schön, dass du heute zum ersten Mal mit uns hier isst, Elias." },
    { id: "xmas-stepfather", place: "home", target: "stepfather", label: "Begrüßt Felices Stiefvater", speaker: "Felices Stiefvater", text: "Willkommen, Elias. Wir sind heute zu acht am Tisch. Macht es euch gemütlich." },
    { id: "xmas-halfsister", place: "home", target: "halfsister", label: "Sprecht mit Felices Halbschwester", speaker: "Felices Halbschwester", text: "Frohe Weihnachten! Schön, dass du dieses Jahr dabei bist, Elias." },
    { id: "xmas-halfpartner", place: "home", target: "halfsister-partner", label: "Begrüßt den Freund der Halbschwester", speaker: "Freund der Halbschwester", text: "Hallo ihr beiden! Ich freue mich auf den gemeinsamen Abend." },
    { id: "xmas-stepsister", place: "home", target: "stepsister", label: "Sprecht mit der Tochter des Stiefvaters", speaker: "Tochter des Stiefvaters", text: "Schön, euch zu sehen. Mein Freund und ich freuen uns, mit euch zu feiern." },
    { id: "xmas-steppartner", place: "home", target: "stepsister-partner", label: "Begrüßt ihren Freund", speaker: "Ihr Freund", text: "Frohe Weihnachten! Jetzt fehlt nur noch das gemeinsame Essen." },
    { id: "xmas-dishes", place: "home", target: "dishes", label: "Hol das Geschirr für den Weihnachtstisch", speaker: "Felice", text: "Wir helfen noch kurz beim Decken.", item: "Festtagsgeschirr" },
    { id: "xmas-table", place: "home", target: "table", label: "Decke den Weihnachtstisch", speaker: "Felice", text: "Alles steht bereit. Für Elias ist natürlich auch ein Platz frei.", item: "-Festtagsgeschirr" },
    { id: "xmas-elias", place: "home", target: "elias-home", label: "Sprich vor dem Essen mit Elias", speaker: "Elias", text: "Danke, dass ich heute hier sein darf. Es fühlt sich schön an, diesen Abend mit dir zu verbringen." },
    { id: "xmas-dinner", place: "home", target: "table", label: "Setzt euch zum gemeinsamen Weihnachtsessen", speaker: "Felice & Elias", text: "Das Essen beginnt. Stimmen am Tisch, warmes Licht und ein neuer gemeinsamer Moment." },
  ] },
  { id: "school", title: "Unser gemeinsamer Weg", date: "Radegast ↔ Zörbig", icon: "☀", intro: "Mit dem Bus von Radegast zur Sekundarschule Zörbig. Triff Elias an der Haltestelle, fahr mit ihm zur Schule und hilf euren Freunden.", ending: "Ein wiedergefundenes Heft, vertraute Gesichter und der Bus von Zörbig zurück nach Radegast. Ein kleiner Tag, der euch gehört.", reward: "Fahrkarte Radegast–Zörbig im Erinnerungsbuch", steps: [
    { id: "school-ticket", place: "bus", target: "ticket", label: "Nimm die Fahrkarte an der Haltestelle mit", speaker: "Felice", text: "Die Fahrkarte ist da. Jetzt fehlt nur noch Elias.", item: "Fahrkarte" },
    { id: "school-elias", place: "bus", target: "elias-bus", label: "Triff Elias an der Haltestelle", speaker: "Elias", text: "Da bist du! Schauen wir kurz nach dem Bus." },
    { id: "school-bus", place: "bus", target: "timetable", label: "Schau auf den Fahrplan nach Zörbig", speaker: "Felice", text: "Radegast nach Zörbig – unser Bus ist bereit. Über den Ausgang beim Bus fahren wir zum Markt in Zörbig. Von dort gehen wir zur Sekundarschule." },
    { id: "school-friends", place: "school", target: "friends", label: "Fahrt zur Sekundarschule Zörbig und begrüßt eure Freunde", speaker: "Freunde", text: "Hey! Habt ihr ein Heft gesehen? Es muss hier irgendwo liegen." },
    { id: "school-book", place: "school", target: "notebook", label: "Finde das vergessene Heft auf dem Schulhof", speaker: "Felice", text: "Da liegt es ja! Wir bringen es gleich zurück.", item: "Vergessenes Heft" },
    { id: "school-return", place: "school", target: "friends", label: "Gib das Heft zurück", speaker: "Freunde", text: "Danke euch! Das hätte ich morgen wirklich vermisst.", item: "-Vergessenes Heft" },
    { id: "school-home", place: "home", target: "elias-home", label: "Fahrt zurück und trefft euch zu Hause", speaker: "Elias", text: "Wieder da. Mit dir mag ich sogar den Weg nach Hause." },
  ] },
  { id: "shooting", title: "Schießen in Gölzau", date: "Ein Moment voller Konzentration", icon: "◎", intro: "Mach dich durch Radegast über die Haltestelle auf den Weg zum Schützenhaus in Gölzau. Auf der Bahn warten neun Schüsse auf dich.", ending: "Neun Schüsse, ein tiefer Atemzug und eine Erinnerung für euer Zimmer.", reward: "Erinnerungsmedaille und persönlicher Bestwert", steps: [
    { id: "range-welcome", place: "range", target: "range-host", label: "Lass dich am Schießstand begrüßen", speaker: "Am Schießstand", text: "Schön, dass du da bist. An der markierten Schießbahn geht es los. Die Punkte sind nicht alles – genieße den Moment." },
    { id: "range-play", place: "range", target: "shoot", label: "Spiele die neun Schüsse und bewahre die Erinnerung", speaker: "Felice", text: "Die Bahn ist frei. Los geht’s." },
  ] },
];

export type StorySave = { version: 1; chapter: ChapterId | null; step: number; completed: ChapterId[]; place: Place; bag: string[] };
export const STORY_KEY = "felice-elias.story.v05";
export const EMPTY_STORY: StorySave = { version: 1, chapter: null, step: 0, completed: [], place: "bedroom", bag: [] };
export function currentStep(save: StorySave) { return CHAPTERS.find(c => c.id === save.chapter)?.steps[save.step]; }
export function beginChapter(save: StorySave, id: ChapterId): StorySave {
  const chapter = CHAPTERS.find(c => c.id === id)!;
  return { ...save, chapter: id, step: 0, bag: [], place: id === "shooting" ? "bedroom" : chapter.steps[0].place };
}
export function advanceStory(save: StorySave, target: string): StorySave {
  const step = currentStep(save);
  if (!step || step.place !== save.place || step.target !== target) return save;
  const bag = step.item?.startsWith("-") ? save.bag.filter(i => i !== step.item!.slice(1)) : step.item ? [...save.bag, step.item] : save.bag;
  const next = { ...save, step: save.step + 1, bag };
  if (!currentStep(next) && save.chapter && !save.completed.includes(save.chapter)) next.completed = [...save.completed, save.chapter];
  return next;
}
export function parseStory(raw: string | null): StorySave {
  if (!raw) return { ...EMPTY_STORY, completed: [], bag: [] };
  const s = JSON.parse(raw);
  const chapter = CHAPTERS.find(c => c.id === s?.chapter);
  if (s?.version !== 1 || !Object.hasOwn(PLACES, s.place) || (s.chapter !== null && !chapter) || !Number.isInteger(s.step) || s.step < 0 || s.step > (chapter?.steps.length ?? 0) || !Array.isArray(s.completed) || !s.completed.every((id: unknown) => CHAPTERS.some(c => c.id === id)) || !Array.isArray(s.bag) || !s.bag.every((i: unknown) => typeof i === "string")) throw new Error("Unbekannter Spielstand");
  return { version: 1, chapter: s.chapter, step: s.step, completed: [...new Set<ChapterId>(s.completed)], place: s.place, bag: s.bag };
}
// Ground corridors measured against the V0.75 paintings. Their edges keep
// walkers on the pavement, including the curves between Markt and school.
const WALK_AREAS: Partial<Record<Place, Point[][]>> = {
  radegast: [[{x:.35,y:.16},{x:.39,y:.30},{x:.44,y:.44},{x:.50,y:.58},{x:.56,y:.72},{x:.645,y:.90},{x:.66,y:.94},{x:.80,y:.94},{x:.69,y:.72},{x:.625,y:.58},{x:.56,y:.44},{x:.50,y:.30},{x:.435,y:.16}]],
  zoerbig: [
    [{x:.414,y:.14},{x:.65,y:.14},{x:.67,y:.31},{x:.414,y:.31}],
    [{x:.415,y:.28},{x:.40,y:.35},{x:.34,y:.39},{x:.315,y:.47},{x:.31,y:.55},{x:.32,y:.60},{x:.25,y:.67},{x:.14,y:.73},{x:.12,y:.77},{x:.18,y:.80},{x:.31,y:.71},{x:.38,y:.65},{x:.40,y:.61},{x:.37,y:.54},{x:.37,y:.46},{x:.39,y:.42},{x:.43,y:.38},{x:.47,y:.33},{x:.48,y:.28}],
  ],
  goelzau: [[{x:.09,y:.26},{x:.61,y:.24},{x:.65,y:.32},{x:.69,y:.43},{x:.77,y:.50},{x:.83,y:.59},{x:.95,y:.59},{x:.95,y:.70},{x:.83,y:.73},{x:.79,y:.63},{x:.72,y:.55},{x:.66,y:.49},{x:.52,y:.45},{x:.35,y:.43},{x:.20,y:.42},{x:.09,y:.35}]],
};
// Ground footprints measured against the high overhead school courtyard.
// The green corner remains reachable around the southern tip of its sitting wall.
const SOLID_AREAS: Partial<Record<Place, Point[][]>> = {
  school: [
    [{x:0,y:0},{x:0.27,y:0},{x:0.263,y:0.137},{x:0.244,y:0.35},{x:0.228,y:0.56},{x:0.221,y:0.616},{x:0.205,y:0.669},{x:0,y:0.669}],
    [{x:0.773,y:0},{x:1,y:0},{x:1,y:1},{x:0.869,y:1},{x:0.82,y:0.83},{x:0.792,y:0.59},{x:0.779,y:0.37},{x:0.762,y:0.22}],
    [{x:0.355,y:0.262},{x:0.405,y:0.246},{x:0.455,y:0.253},{x:0.468,y:0.263},{x:0.444,y:0.296},{x:0.408,y:0.304},{x:0.357,y:0.284}],
    [{x:0.568,y:0.348},{x:0.61,y:0.325},{x:0.665,y:0.335},{x:0.694,y:0.376},{x:0.621,y:0.4},{x:0.57,y:0.361}],
    [{x:0.426,y:0.511},{x:0.47,y:0.49},{x:0.525,y:0.497},{x:0.55,y:0.514},{x:0.507,y:0.559},{x:0.43,y:0.529}],
    [{x:0.603,y:0.59},{x:0.65,y:0.562},{x:0.73,y:0.573},{x:0.739,y:0.598},{x:0.668,y:0.64},{x:0.608,y:0.614}],
    [{x:0.621,y:0.126},{x:0.69,y:0.126},{x:0.699,y:0.156},{x:0.624,y:0.16}],
    [{x:0.196,y:0.705},{x:0.344,y:0.742},{x:0.343,y:0.761},{x:0.329,y:0.809},{x:0.3,y:0.795},{x:0.32,y:0.754},{x:0.189,y:0.724}],
    [{x:0.304,y:0.79},{x:0.39,y:0.836},{x:0.414,y:0.914},{x:0.394,y:0.927},{x:0.384,y:0.85},{x:0.303,y:0.812}],
    [{x:0.086,y:0.838},{x:0.267,y:0.872},{x:0.286,y:0.888},{x:0.29,y:0.904},{x:0.269,y:0.918},{x:0.25,y:0.885},{x:0.083,y:0.861}],
    [{x:0.467,y:0.787},{x:0.48,y:0.779},{x:0.529,y:0.841},{x:0.511,y:0.861},{x:0.5,y:0.864},{x:0.461,y:0.808}],
    [{x:0,y:0.675},{x:0.186,y:0.685},{x:0.199,y:0.72},{x:0.173,y:0.764},{x:0,y:0.764}],
    [{x:0,y:0.88},{x:0.27,y:0.924},{x:0.322,y:0.957},{x:0.384,y:1},{x:0,y:1}],
    [{x:0.55,y:0.9},{x:0.632,y:0.9},{x:0.733,y:1},{x:0.55,y:1}],
    [{x:0.432,y:0.936},{x:0.462,y:0.936},{x:0.468,y:1},{x:0.432,y:1}],
    [{x:0.548,y:0.94},{x:0.575,y:0.94},{x:0.578,y:1},{x:0.548,y:1}],
  ],
};
function insideArea(x: number, y: number, points: Point[]) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i], b = points[j];
    if ((a.y > y) !== (b.y > y) && x < (b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x) inside = !inside;
  }
  return inside;
}
export function canWalk(place: Place, x: number, y: number) {
  return (!SOLID_AREAS[place] || !SOLID_AREAS[place]!.some(points => insideArea(x,y,points))) && (!WALK_AREAS[place] || WALK_AREAS[place]!.some(points => insideArea(x,y,points))) && x >= .075 && x <= .94 && y >= .16 && y <= (place === "school" ? .96 : .92) && !PLACES[place].obstacles.some(o => x > o.left - .02 && x < o.right + .02 && y > o.top - .015 && y < o.bottom + .015);
}
export const SPAWNS: Record<Place, Point> = { bedroom: { x: .5, y: .7 }, home: { x: .5, y: .78 }, kitchen: { x: .5, y: .85 }, garden: { x: .5, y: .38 }, radegast: { x: .435, y: .28 }, bus: { x: .5, y: .72 }, zoerbig: { x: .61, y: .285 }, school: { x: .52, y: .90 }, goelzau: { x: .86, y: .63 }, range: { x: .5, y: .8 } };
export function routeTo(from: Place, to: Place): Exit | undefined {
  const queue: { place: Place; first?: Exit }[] = [{ place: from }];
  const seen = new Set<Place>([from]);
  while (queue.length) {
    const current = queue.shift()!;
    if (current.place === to) return current.first;
    for (const exit of PLACES[current.place].exits) if (!seen.has(exit.to)) { seen.add(exit.to); queue.push({ place: exit.to, first: current.first ?? exit }); }
  }
}
