// Generates agent-browser batch commands. Uses an isolated browser session and
// test saves; run from the repository root with the local dev server running.
import { resolve } from 'node:path';
const commands=[];
const add=(...args)=>commands.push(args);
const evaluate=code=>add('eval',code);
const assert=code=>evaluate(`if(!(${code})) throw new Error(${JSON.stringify(code)}); true`);
const screenshot=name=>{ add('wait','200'); add('screenshot',resolve(`qa/v075/screenshots/${name}.png`)); };
const url=process.env.GAME_URL ?? 'http://127.0.0.1:5173/';
const start=(place,minute=840,season='Sommer')=>{
 add('open',url);
 evaluate(`localStorage.setItem('felice-elias.story.v05',JSON.stringify({version:1,chapter:null,step:0,completed:[],place:'${place}',bag:[]}));localStorage.setItem('felice-elias.day.v061',JSON.stringify({version:1,date:'2026-10-06',day:1,minute:${minute},season:'${season}'}));`);
 add('open',url); add('wait','--load','networkidle');
 add('find','role','button','click','--name','Welt betreten');
 add('find','role','button','click','--name','Erinnerungsbuch schließen');
};
const walkTo=(x,y)=>evaluate(`new Promise((resolve,reject)=>{
 const held=new Set(); const started=performance.now();
 const clear=()=>{for(const code of held) window.dispatchEvent(new KeyboardEvent('keyup',{code}));held.clear();};
 const timer=setInterval(()=>{
  const node=document.querySelector('[data-testid="felice-player"]');
  const dx=${x}-Number(node.dataset.x),dy=${y}-Number(node.dataset.y);
  if(Math.hypot(dx,dy)<.016){clearInterval(timer);clear();resolve(true);return;}
  if(performance.now()-started>10000){clearInterval(timer);clear();reject(new Error('Weg blockiert: '+node.dataset.x+','+node.dataset.y));return;}
  const next=new Set();if(Math.abs(dx)>.01)next.add(dx>0?'KeyD':'KeyA');if(Math.abs(dy)>.01)next.add(dy>0?'KeyS':'KeyW');
  for(const code of held)if(!next.has(code))window.dispatchEvent(new KeyboardEvent('keyup',{code}));
  for(const code of next)if(!held.has(code))window.dispatchEvent(new KeyboardEvent('keydown',{code}));
  held.clear();for(const code of next)held.add(code);
 },30);
})`);
const sitting=name=>{
 assert(`document.querySelector('[data-testid="world-interact"]')?.textContent.includes('Hinsetzen')`);
 add('click','[data-testid="world-interact"]');
 add('wait','--fn',`document.querySelector('[data-testid="felice-player"]').dataset.restPhase==='resting'`);
 add('find','role','button','click','--name','Mit Elias sitzen');
 add('wait','--fn',`document.querySelector('[data-testid="seated-elias"]').dataset.pose==='sitting'`);
 assert(`document.querySelector('[data-testid="felice-player"]').dataset.pose==='sitting' && !!document.querySelector('[data-testid="seated-elias"]')`);
 screenshot(name);
 add('press','e');
 add('wait','--fn',`document.querySelector('[data-testid="felice-player"]').dataset.restPhase==='none'`);
 assert(`document.querySelector('[data-testid="felice-player"]').dataset.pose==='standing' && !document.querySelector('[data-testid="seated-elias"]')`);
};

if (!process.env.FLOW_ONLY) for (const [mode,width,height] of [['desktop',1366,900],['mobile',844,390]]) {
 add('set','viewport',String(width),String(height));
 for(const place of ['bedroom','home','kitchen','garden','radegast','bus','zoerbig','school','goelzau','range']) {
  start(place); screenshot(`${mode}-${place}`);
  assert(`document.body.scrollWidth<=${width} && !document.querySelector('vite-error-overlay,[data-nextjs-dialog]')`);
 }
}
add('set','viewport','1366','900');
const travel=(to)=>{add('click','[data-testid="world-interact"]');assert(`document.querySelector('main').dataset.scene==='${to}'`);};
start('home');walkTo(.17,.52);travel('radegast');
for(const p of [[.455,.36],[.52,.52],[.61,.70],[.71,.87]])walkTo(...p);
assert(`document.querySelector('.memory-interaction').textContent.includes('Zur Bushaltestelle')`);
screenshot('radegast-path-end');travel('bus');
walkTo(.55,.54);walkTo(.735,.445);travel('zoerbig');
for(const p of [[.46,.30],[.415,.355],[.365,.415],[.345,.50],[.35,.59],[.31,.65],[.235,.725],[.17,.76]])walkTo(...p);
screenshot('zoerbig-school-arrival');travel('school');
walkTo(.69,.665);sitting('couple-front-tree');
walkTo(.535,.665);walkTo(.52,.75);sitting('couple-seat-wall');
walkTo(.535,.9);travel('zoerbig');
for(const p of [[.235,.725],[.31,.65],[.35,.59],[.345,.50],[.365,.415],[.415,.355],[.46,.30],[.47,.20]])walkTo(...p);
travel('bus');
walkTo(.77,.55);walkTo(.84,.76);travel('goelzau');
for(const p of [[.80,.60],[.73,.49],[.63,.42],[.48,.36],[.30,.31],[.265,.285]])walkTo(...p);
screenshot('goelzau-entrance');travel('range');walkTo(.5,.9);travel('goelzau');
for(const p of [[.48,.36],[.63,.42],[.73,.49],[.80,.60],[.90,.65]])walkTo(...p);
travel('bus');walkTo(.55,.60);walkTo(.20,.68);travel('radegast');
for(const p of [[.61,.70],[.52,.52],[.455,.36],[.38,.21]])walkTo(...p);
travel('home');
assert(`document.querySelector('main').dataset.minute==='1260'`);
add('press','j');assert(`document.querySelector('.map-node.is-current').textContent.includes('Wohnung')`);screenshot('world-map');
add('find','role','button','click','--name','Erinnerungsbuch schließen');
start('school',435);walkTo(.86,.8);walkTo(.875,.68);add('click','[data-testid="world-interact"]');
add('find','role','button','click','--name','Unterricht besuchen');
assert(`document.querySelector('main').dataset.minute==='780'`);
for(const place of ['radegast','bus','zoerbig','school','goelzau']){start(place,840,'Winter');screenshot(`winter-${place}`);}
add('errors');
process.stdout.write(JSON.stringify(commands));
