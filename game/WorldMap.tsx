import { PLACES, type Place } from "./story";

const nodes: { x: number; y: number; name: string; places: Place[] }[] = [
  { x: 125, y: 85, name: "Wohnung & Garten", places: ["bedroom","home","kitchen","garden"] },
  { x: 125, y: 155, name: "Weg durch Radegast", places: ["radegast"] },
  { x: 125, y: 225, name: "Bushaltestelle", places: ["bus"] },
  { x: 390, y: 85, name: "Markt · Busankunft", places: ["zoerbig"] },
  { x: 390, y: 225, name: "Schule · Gitter & Hof", places: ["school"] },
  { x: 655, y: 155, name: "Weg zum Schützenhaus", places: ["goelzau"] },
  { x: 655, y: 225, name: "Schießstand", places: ["range"] },
];

export function WorldMap({ place }: { place: Place }) {
  return <section className="world-map-panel" aria-label="Ortsplan">
    <div className="world-map-heading"><div><h2>Eure Wege</h2><p>Du bist hier: <strong>{PLACES[place].name}</strong></p></div><span>Radegast · Zörbig · Gölzau</span></div>
    <svg viewBox="0 0 780 300" role="img" aria-label="Spielwege: Von der Wohnung durch Radegast zur Bushaltestelle. Mit dem Bus zum Markt in Zörbig und zu Fuß zur Schule. Von Radegast über den Gölzauer Weg zum Schützenhaus.">
      {[ [15,"RADEGAST"], [280,"ZÖRBIG"], [545,"GÖLZAU"] ].map(([x,title]) => <g key={title}><rect x={x} y="12" width="220" height="270" rx="10" className="map-town"/><text x={Number(x)+110} y="39" className="map-town-title" textAnchor="middle">{title}</text></g>)}
      <path d="M125 85V225M390 85V225M655 155V225" className="map-footpath"/>
      <path d="M125 225C250 225 250 85 390 85M125 225C170 326 620 326 655 155" className="map-connection"/>
      <text x="248" y="136" className="map-route-label" textAnchor="middle">Bus</text><text x="508" y="274" className="map-route-label" textAnchor="middle">Nach Gölzau</text>
      {nodes.map(node => <g key={node.name} className={node.places.includes(place) ? "map-node is-current" : "map-node"}><circle cx={node.x} cy={node.y} r="8"/><rect x={node.x-96} y={node.y+14} width="192" height="25" rx="4"/><text x={node.x} y={node.y+31} textAnchor="middle">{node.name}</text></g>)}
      <text x="408" y="159" className="map-route-label">zu Fuß</text>
    </svg>
    <p className="world-map-caption">Die Wege sind für das Spiel verkürzt. Der Markt und der Pausenhof in Zörbig sind eigene Orte.</p>
  </section>;
}
