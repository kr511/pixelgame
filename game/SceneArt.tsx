import { memo } from "react";
import type { Place } from "./story";

function Tree({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><path d="M-4 0h8v-32h-8" fill="#775038"/><path d="M-25-24h50v-16h-7v-16H8v-8H-9v8h-12v16h-4Z" fill="#315d48"/><path d="M-18-43h30v-10H2v-5H-7v8h-11Z" fill="#568564"/><path d="M-24-22h48v5h-48Z" fill="#254c3c"/></g>;
}
function Window({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><rect width="48" height="48" fill="#684c43"/><rect x="4" y="4" width="40" height="38" fill="#b4d5ca"/><path d="M24 4v38M4 24h40" stroke="#fff1cf" strokeWidth="3"/><path d="M-5 46h58v7H-5Z" fill="#8b6450"/></g>;
}
export const SceneArt = memo(function SceneArt({ place, christmas }: { place: Place; christmas: boolean }) {
  if (place === "bedroom") return null;
  const outdoors = ["garden", "bus", "school"].includes(place);
  return <svg className="scene-art" viewBox="0 0 600 600" aria-hidden="true" shapeRendering="crispEdges">
    <defs><pattern id="grass" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill={christmas ? "#cad5c4" : "#8ca779"}/><path d="M7 11h3v3H7M23 25h5v2h-5" fill={christmas ? "#e3e8d8" : "#779466"}/></pattern><pattern id="floor" width="90" height="30" patternUnits="userSpaceOnUse"><rect width="90" height="30" fill="#b68a64"/><path d="M0 29h90M1 0v30M45 0v5M18 12h32" stroke="#9c7556" strokeWidth="2"/></pattern><pattern id="paving" width="36" height="24" patternUnits="userSpaceOnUse"><rect width="36" height="24" fill="#c6bda1"/><path d="M0 23h36M0 0v24" stroke="#afa88f"/></pattern></defs>
    <rect width="600" height="600" fill={outdoors ? "url(#grass)" : "url(#floor)"}/>
    {place === "garden" && <>
      <path d="M274 123h52v470h-52M298 391h302v55H298" fill="#cbb18a"/><path d="M278 132h44v450h-44M310 397h290v42H310" fill="#ddc399"/>
      <rect x="158" y="30" width="274" height="96" fill="#e5c49c"/><path d="M143 35V17h302v18Z" fill="#754b47"/><path d="M150 37h288v12H150" fill="#ab6d55"/><rect x="277" y="67" width="46" height="60" fill="#765345"/><rect x="286" y="73" width="27" height="24" fill="#dfbc7f"/><Window x={184} y={61}/><Window x={351} y={61}/>
      <Tree x={81} y={235}/><Tree x={490} y={228}/><Tree x={69} y={529}/><Tree x={506} y={538}/>
      <path d="M36 560h530M36 566h530" stroke="#deceb0" strokeWidth="5"/>{[40,100,160,220,380,440,500,560].map(x=><rect key={x} x={x} y="548" width="7" height="28" fill="#ecdbb9"/>)}
      {[{x:125,y:304},{x:460,y:292},{x:421,y:483}].map(p=><g key={p.x} transform={`translate(${p.x} ${p.y})`}><path d="M0 0v14M18 3v13M-14 5v11" stroke="#527b4d" strokeWidth="3"/><path d="M-5-4h10v8H-5M13-1h10v8H13M-19 1h10v8h-10" fill={christmas ? "#d9ece3" : "#f1d892"}/></g>)}
    </>}
    {place === "home" && <>
      <rect width="600" height="91" fill="#d5b18d"/><path d="M0 88h600" stroke="#735343" strokeWidth="9"/><Window x={111} y={23}/><Window x={341} y={23}/>
      <rect x="211" y="196" width="202" height="199" fill="#a36e67"/><path d="M220 204h184v182H220Z" fill="none" stroke="#d7af88" strokeWidth="4"/>
      <rect x="222" y="221" width="173" height="118" fill="#684a3b"/><rect x="225" y="216" width="168" height="108" fill="#cfaa7a"/><rect x="245" y="216" width="34" height="108" fill="#ece0bf"/>
      {[244,365].flatMap(x=>[231,256,281,306].map(y=><g key={`${x}-${y}`}><circle cx={x} cy={y} r="10" fill="#f5ead1"/><circle cx={x} cy={y} r="7" fill="#e2d1b4"/></g>))}
      <rect x="77" y="114" width="108" height="87" fill="#5a6e63"/><rect x="86" y="120" width="90" height="52" fill="#8ba187"/><path d="M86 178h90M130 121v49" stroke="#c0c5a2" strokeWidth="3"/>
      <rect x="375" y="100" width="72" height="70" fill="#845d47"/><rect x="380" y="102" width="62" height="13" fill="#dfbe94"/>
      {christmas ? <g><rect x="499" y="178" width="12" height="43" fill="#7d4d36"/><path d="M503 83l-43 63h15l-24 44h105l-23-44h14Z" fill="#3b6b53"/><path d="M480 140l45 18M469 168l63 15" stroke="#d8b76b" strokeWidth="4"/><path d="M501 76h7v16h-7M496 81h17v6h-17" fill="#ffe0a0"/>{[478,507,530].map((x,i)=><rect key={x} x={x} y={154+i*13} width="7" height="7" fill="#d79077"/>)}<rect x="465" y="210" width="25" height="21" fill="#c27b68"/><path d="M477 210v21" stroke="#f2d398" strokeWidth="4"/></g> : <><Tree x={506} y={204}/><rect x="490" y="195" width="34" height="25" fill="#b7795c"/></>}
      <path d="M40 390v70M276 568h49" stroke="#ecc597" strokeWidth="7"/>
    </>}
    {place === "bus" && <>
      <rect y="255" width="600" height="127" fill="#676f73"/><path d="M0 321h600" stroke="#e6dcc2" strokeWidth="4" strokeDasharray="30 24"/><rect y="382" width="600" height="101" fill="url(#paving)"/>
      <rect x="104" y="128" width="103" height="17" fill="#4d665f"/><path d="M114 146v93M198 146v93" stroke="#4d665f" strokeWidth="7"/><rect x="119" y="152" width="73" height="59" fill="#9fb8b0"/><rect x="120" y="220" width="71" height="10" fill="#986e4e"/>
      <rect x="325" y="116" width="220" height="101" rx="5" fill="#dbc184"/><rect x="328" y="129" width="212" height="47" fill="#5e878b"/>{[379,431,487].map(x=><path key={x} d={`M${x} 129v46`} stroke="#dbc184" strokeWidth="5"/>)}<rect x="334" y="186" width="157" height="8" fill="#b9855e"/><rect x="493" y="176" width="38" height="37" fill="#658180"/><circle cx="363" cy="216" r="15" fill="#394449"/><circle cx="503" cy="216" r="15" fill="#394449"/><circle cx="363" cy="216" r="6" fill="#9aa39c"/><circle cx="503" cy="216" r="6" fill="#9aa39c"/>
      <path d="M246 192v55" stroke="#606a58" strokeWidth="5"/><circle cx="246" cy="185" r="15" fill="#e4cd83"/><text x="246" y="190" textAnchor="middle" fill="#527251" fontSize="17" fontWeight="bold">H</text><rect x="107" y="110" width="97" height="17" fill="#e9d9b0"/><text x="156" y="122" textAnchor="middle" fill="#52634d" fontSize="10" fontFamily="monospace">RADEGAST</text><text x="433" y="128" textAnchor="middle" fill="#f5e7bc" fontSize="10" fontFamily="monospace">ZÖRBIG</text>
      <Tree x={56} y={208}/><Tree x={547} y={537}/><path d="M90 531h321" stroke="#b1bd93" strokeWidth="8"/>
    </>}
    {place === "school" && <>
      <rect x="60" y="200" width="484" height="328" fill="url(#paving)"/><rect x="100" y="38" width="400" height="157" fill="#bb8b68"/><rect x="91" y="33" width="418" height="22" fill="#6a6058"/><path d="M106 182h390" stroke="#e0c39a" strokeWidth="12"/>
      {[133,207,345,419].map(x=><Window key={x} x={x} y={89}/>)}<rect x="275" y="119" width="50" height="79" fill="#5a7774"/><path d="M300 121v73" stroke="#d8c6a2" strokeWidth="4"/><rect x="218" y="58" width="165" height="26" fill="#ead8b2"/><text x="301" y="69" textAnchor="middle" fill="#715a45" fontSize="9" fontFamily="monospace">SEKUNDARSCHULE</text><text x="301" y="80" textAnchor="middle" fill="#715a45" fontSize="10" fontFamily="monospace">ZÖRBIG</text>
      {[{x:74,y:329},{x:449,y:329}].map(p=><g key={p.x}><rect x={p.x} y={p.y} width="82" height="17" fill="#a47750"/><rect x={p.x+6} y={p.y+20} width="70" height="13" fill="#886246"/></g>)}<Tree x={48} y={236}/><Tree x={554} y={230}/><Tree x={74} y={551}/><Tree x={527} y={553}/>
      <path d="M290 526h30v74h-30Z" fill="#c6bda1"/>
    </>}
    {place === "range" && <>
      <rect width="600" height="211" fill="#b8baa3"/><path d="M0 192h600" stroke="#8c6d4d" strokeWidth="16"/>
      {[150,300,450].map(x=><g key={x}><rect x={x-40} y="74" width="80" height="88" fill="#6b6555"/><rect x={x-34} y="80" width="68" height="73" fill="#efe1b8"/>{[26,20,14,8].map((r,i)=><circle key={r} cx={x} cy="116" r={r} fill={i>1?"#394840":"none"} stroke="#4d594e" strokeWidth="2"/>)}</g>)}<path d="M120 219v110M300 219v110M480 219v110M65 389h470" stroke="#d4ba82" strokeWidth="4" strokeDasharray="12 9"/>
      <rect x="62" y="429" width="108" height="46" fill="#80644e"/><rect x="64" y="421" width="104" height="15" fill="#c8a87d"/>
    </>}
    <rect x="3" y="3" width="594" height="594" fill="none" stroke={outdoors ? "#556b4e" : "#6b4c3e"} strokeWidth="6"/>
  </svg>;
});

export function PersonArt({ variant }: { variant: string }) {
  const palette: Record<string,string> = { elias: "#647f92", mother: "#b77970", stepfather: "#607657", halfsister: "#ba975e", "partner-one": "#777d9c", stepsister: "#9c7291", "partner-two": "#759c95", family: "#b77970" };
  const shirt = palette[variant] ?? "#9e9772";
  return <svg viewBox="0 0 24 32" shapeRendering="crispEdges" aria-hidden="true"><path d="M6 29h12v3H6Z" fill="#30433e" opacity=".3"/><path d="M7 19h10v7H7M7 25h4v5H7M14 25h4v5h-4" fill="#465464"/><path d="M5 12h14v10H5M3 14h3v8H3M18 14h3v8h-3" fill={shirt}/><path d="M7 3h11v10H7M5 5h3v5H5" fill="#e6b793"/><path d="M6 2h12v4H6M6 4h3v4H6M16 4h3v5h-3" fill={variant === "family" ? "#806153" : "#56473b"}/><path d="M10 8h2v2h-2M16 8h2v2h-2" fill="#3a3b36"/><path d="M11 12h5v2h-5" fill="#d69e80"/><path d="M6 29h6v2H6M14 29h5v2h-5" fill="#423b38"/></svg>;
}
export function DogArt() {
  return <svg viewBox="0 0 36 28" shapeRendering="crispEdges" aria-hidden="true"><path d="M4 24h27v3H4Z" fill="#30433e" opacity=".25"/><path d="M7 11h20v12H7M7 21h5v5H7M23 20h5v6h-5" fill="#b99972"/><path d="M9 19h15v4H9M8 23h4v3H8M24 23h4v3h-4" fill="#f1e5cb"/><path d="M6 17H2V7h4V3h8v4h3v7H9v-4h4V8H7v7h3v4H6Z" fill="#e7d9bb"/><path d="M20 2h4v5h-5V4h1M30 2h3v3h2v5h-5" fill="#4d4a40"/><path d="M21 7h12v13H21M18 10h17v8H18" fill="#4d4a40"/><path d="M22 16h10v6H22M25 13h5v7h-5" fill="#e9d9b9"/><path d="M22 11h2v2h-2M30 11h2v2h-2M26 16h5v3h-5" fill="#202d2b"/><path d="M20 21h13v2H20" fill="#a9705e"/></svg>;
}

export function ItemArt({ art }: { art: string }) {
  return <svg viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true">
    {art === "book" || art === "photo" || art === "ticket" || art === "sign" ? <><path d="M4 4h17v17H4Z" fill="#5d5445"/><path d="M5 3h15v16H5Z" fill={art === "book" ? "#b97465" : "#eee0ba"}/><path d="M7 3v16M10 7h7M10 11h7" stroke={art === "book" ? "#f0c78c" : "#7c927b"} strokeWidth="2"/></> : art === "bowl" || art === "plates" ? <><path d="M3 11h18v8H3M5 19h14v2H5" fill="#e0d8ba"/><path d="M5 10h14v6H5" fill={art === "bowl" ? "#80b8c3" : "#f6eacb"}/><path d="M7 11h9v2H7" fill="#d4e9df"/></> : art === "blanket" || art === "bed" ? <><path d="M2 8h20v13H2" fill="#8b6857"/><path d="M4 6h16v12H4" fill="#c69581"/><path d="M5 9h14M8 6v12M16 6v12" stroke="#f0c79d" strokeWidth="2"/></> : art === "ball" ? <><circle cx="12" cy="13" r="8" fill="#d3a364"/><path d="M8 8h5v5H8M13 13h5v5h-5" fill="#e9cc83"/></> : art === "target" ? <>{[10,7,4,1].map((r,i)=><circle key={r} cx="12" cy="12" r={r} fill={i%2?"#657365":"#e9d6b2"}/>)}</> : <path d="M10 2h4v6h6v4h-4v7h-4v-4H8v4H4v-7H1V8h9Z" fill="#ebcf89"/>}
  </svg>;
}
