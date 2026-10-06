export type Place = "bedroom" | "home" | "garden" | "bus" | "school" | "range";
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
  ], obstacles: [{ left: .46, right: .73, top: .235, bottom: .48 }, { left: .12, right: .40, top: .17, bottom: .43 }, { left: .84, right: .96, top: .12, bottom: .46 }] },
  garden: { name: "Der Garten", subtitle: "Kleine Pfoten, große Welt", exits: [
    { x: .5, y: .23, to: "home", label: "Ins Haus", spawn: { x: .5, y: .8 } }, { x: .91, y: .69, to: "bus", label: "Zur Haltestelle", spawn: { x: .17, y: .7 } },
  ], obstacles: [{ left: .27, right: .7, top: .04, bottom: .19 }, { left: .07, right: .2, top: .23, bottom: .42 }, { left: .73, right: .9, top: .2, bottom: .4 }, { left: .15, right: .35, top: .52, bottom: .60 }] },
  bus: { name: "Radegast · Bushaltestelle", subtitle: "Mit dem Bus nach Zörbig", exits: [
    { x: .09, y: .7, to: "garden", label: "Nach Hause", spawn: { x: .82, y: .69 } }, { x: .78, y: .44, to: "school", label: "Bus zur Schule nehmen", spawn: { x: .5, y: .82 } }, { x: .91, y: .76, to: "range", label: "Nach Gölzau", spawn: { x: .5, y: .82 } },
  ], obstacles: [{ left: .61, right: .87, top: .05, bottom: .36 }, { left: .13, right: .42, top: .21, bottom: .37 }] },
  school: { name: "Sekundarschule Zörbig", subtitle: "Zwischen Unterricht und Heimweg", exits: [{ x: .5, y: .9, to: "bus", label: "Bus nach Radegast", spawn: { x: .76, y: .52 } }], obstacles: [{ left: .18, right: .82, top: .06, bottom: .32 }, { left: .11, right: .30, top: .38, bottom: .48 }, { left: .70, right: .89, top: .38, bottom: .48 }] },
  range: { name: "Schießstand · Gölzau", subtitle: "Einmal tief durchatmen", exits: [{ x: .5, y: .9, to: "bus", label: "Zur Haltestelle", spawn: { x: .82, y: .76 } }], obstacles: [{ left: .1, right: .9, top: .04, bottom: .34 }, { left: .66, right: .86, top: .76, bottom: .835 }] },
};

// Bestätigt: acht Personen beim Weihnachtsessen; Namen noch offen.
// Dialoge, Kleidung und genaue Szenengestaltung sind spielerische Entwürfe.
export const ENTITIES: Record<Place, Entity[]> = {
  bedroom: [{ id: "album", name: "Unser Erinnerungsbuch", x: .77, y: .32, display: { x: .68, y: .23 }, kind: "item", art: "book", text: "Vier Kapitel, viele kleine Momente. Öffne das Erinnerungsbuch oben rechts und wähle eine Geschichte." }, { id: "photo", name: "Foto aus Gölzau", x: .79, y: .52, display: { x: .885, y: .45 }, kind: "item", art: "photo", text: "Das Foto führt dich direkt zum Schießen in Gölzau." }],
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
    { id: "elias-bus", name: "Elias", x: .48, y: .47, kind: "person", art: "elias", text: "Ein gewöhnlicher Weg fühlt sich zusammen gleich anders an." },
    { id: "timetable", name: "Fahrplan · Radegast–Zörbig", x: .45, y: .4, display: { x: .445, y: .32 }, kind: "item", art: "sign", text: "Radegast ↔ Zörbig. Euer Schulbus verbindet die Haltestelle mit der Sekundarschule Zörbig. Rechts führt der Spielweg nach Gölzau." },
    { id: "ticket", name: "Fahrkarte", x: .36, y: .44, display: { x: .37, y: .34 }, kind: "item", art: "ticket", text: "Eine Fahrkarte für den gemeinsamen Weg." },
  ],
  school: [
    { id: "friends", name: "Elena", x: .37, y: .55, kind: "person", art: "elena", text: "Hey Felice! Schön, dich zu sehen. Wollen wir nach der Schule noch ein bisschen zusammen bleiben?" },
    { id: "jason", name: "Jason", x: .61, y: .61, kind: "person", art: "jason", text: "Hey. Ich mache gerade eine kleine Pause. Du kannst dich gern dazustellen." },
    { id: "luca", name: "Luca", x: .37, y: .73, kind: "person", art: "luca", text: "Hallo Felice. Heute ist es hier ziemlich ruhig. Das mag ich." },
    { id: "wyatt", name: "Wyatt", x: .73, y: .7, kind: "person", art: "wyatt", text: "Hey Felice! Schön, dass du da bist." },
    { id: "notebook", name: "Vergessenes Heft", x: .68, y: .69, kind: "item", art: "book", text: "Jemand hat ein Heft liegen gelassen." },
    { id: "school-door", name: "Schultür", x: .5, y: .38, display: { x: .5, y: .30 }, kind: "item", art: "bell", text: "Der Unterricht ist vorbei. Zeit für den gemeinsamen Heimweg." },
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
    { id: "school-bus", place: "bus", target: "timetable", label: "Schau auf den Fahrplan nach Zörbig", speaker: "Felice", text: "Radegast nach Zörbig – unser Bus ist bereit. Über den Ausgang beim Bus fahren wir zur Sekundarschule." },
    { id: "school-friends", place: "school", target: "friends", label: "Fahrt zur Sekundarschule Zörbig und begrüßt eure Freunde", speaker: "Freunde", text: "Hey! Habt ihr ein Heft gesehen? Es muss hier irgendwo liegen." },
    { id: "school-book", place: "school", target: "notebook", label: "Finde das vergessene Heft auf dem Schulhof", speaker: "Felice", text: "Da liegt es ja! Wir bringen es gleich zurück.", item: "Vergessenes Heft" },
    { id: "school-return", place: "school", target: "friends", label: "Gib das Heft zurück", speaker: "Freunde", text: "Danke euch! Das hätte ich morgen wirklich vermisst.", item: "-Vergessenes Heft" },
    { id: "school-home", place: "home", target: "elias-home", label: "Fahrt zurück und trefft euch zu Hause", speaker: "Elias", text: "Wieder da. Mit dir mag ich sogar den Weg nach Hause." },
  ] },
  { id: "shooting", title: "Schießen in Gölzau", date: "Ein Moment voller Konzentration", icon: "◎", intro: "Mach dich über den Garten und die Haltestelle auf den Weg nach Gölzau. Auf der Bahn warten neun Schüsse auf dich.", ending: "Neun Schüsse, ein tiefer Atemzug und eine Erinnerung für euer Zimmer.", reward: "Erinnerungsmedaille und persönlicher Bestwert", steps: [
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
export function canWalk(place: Place, x: number, y: number) {
  return x >= .075 && x <= .94 && y >= .16 && y <= .92 && !PLACES[place].obstacles.some(o => x > o.left - .02 && x < o.right + .02 && y > o.top - .015 && y < o.bottom + .015);
}
export const SPAWNS: Record<Place, Point> = { bedroom: { x: .5, y: .7 }, home: { x: .5, y: .78 }, garden: { x: .5, y: .38 }, bus: { x: .5, y: .72 }, school: { x: .5, y: .8 }, range: { x: .5, y: .8 } };
export function routeTo(from: Place, to: Place): Exit | undefined {
  const queue: { place: Place; first?: Exit }[] = [{ place: from }];
  const seen = new Set<Place>([from]);
  while (queue.length) {
    const current = queue.shift()!;
    if (current.place === to) return current.first;
    for (const exit of PLACES[current.place].exits) if (!seen.has(exit.to)) { seen.add(exit.to); queue.push({ place: exit.to, first: current.first ?? exit }); }
  }
}
