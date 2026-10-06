// Generates agent-browser batch commands. Uses an isolated browser session and
// test saves; run from the repository root with the local dev server running.
import { resolve } from 'node:path';
const commands=[];
const add=(...args)=>commands.push(args);
const evaluate=code=>add('eval',code);
const assert=code=>evaluate(`if(!(${code})) throw new Error(${JSON.stringify(code)}); true`);
const screenshot=name=>{ add('wait','200'); add('screenshot',resolve(`qa/v07/screenshots/${name}.png`)); };
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


add('set','viewport','1366','900');
start('home');
add('press','j');
assert(`document.querySelectorAll('.name-card').length===16`);
add('fill','input[aria-label="Name von Felices Mutter"]','Test Mutter');
add('find','role','button','click','--name','Name von Felices Mutter speichern');
assert(`JSON.parse(localStorage.getItem('felice-elias.names.v07')).names.family==='Test Mutter'`);
add('scrollintoview','.names-panel');screenshot('names-roster');
add('open',url);add('wait','--load','networkidle');
add('find','role','button','click','--name','Welt betreten');
add('find','role','button','click','--name','Erinnerungsbuch schließen');
assert(`document.querySelector('[data-entity="family"]').getAttribute('aria-label')==='Test Mutter'`);
walkTo(.28,.56);add('click','[data-testid="world-interact"]');
assert(`document.querySelector('.dialogue-modal h2').textContent==='Test Mutter' && !!document.querySelector('.dialogue-portrait image[href="/characters/portraits-v06.png"]')`);
screenshot('custom-name-dialogue');
add('find','role','button','click','--name','Zurück ins Spiel');
add('press','j');add('select','select[aria-label="Namensanzeige"]','nearby');
add('find','role','button','click','--name','Erinnerungsbuch schließen');
assert(`getComputedStyle(document.querySelector('[data-entity="family"] .entity-name')).display!=='none' && getComputedStyle(document.querySelector('[data-entity="stepsister"] .entity-name')).display==='none'`);
add('press','j');add('select','select[aria-label="Namensanzeige"]','friends');
add('find','role','button','click','--name','Erinnerungsbuch schließen');
assert(`getComputedStyle(document.querySelector('[data-entity="stepsister"] .entity-name')).display==='none' && getComputedStyle(document.querySelector('[data-entity="elias-home"] .entity-name')).display!=='none'`);
add('set','viewport','844','390');
add('press','j');add('scrollintoview','.names-panel');screenshot('mobile-names-roster');
assert(`document.querySelector('dialog[open]').scrollWidth<=document.querySelector('dialog[open]').clientWidth`);
add('fill','input[aria-label="Name von Felices Mutter"]','');
add('find','role','button','click','--name','Name von Felices Mutter speichern');
add('select','select[aria-label="Namensanzeige"]','always');
add('find','role','button','click','--name','Erinnerungsbuch schließen');
assert(`document.querySelector('[data-entity="family"]').getAttribute('aria-label')==='Felices Mutter' && !JSON.parse(localStorage.getItem('felice-elias.names.v07')).names.family`);
add('set','viewport','1366','900');
start('garden');walkTo(.25,.65);
add('click','[data-testid="world-interact"]');
assert(`document.querySelector('[data-testid="felice-player"]').dataset.restPhase==='entering'`);
add('wait','--fn',`document.querySelector('[data-testid="felice-player"]').dataset.restPhase==='resting'`);
add('find','role','button','click','--name','Mit Elias sitzen');
assert(`document.querySelector('[data-testid="seated-elias"]').dataset.pose==='standing'`);
add('press','Escape');
evaluate(`window.beforePause=[document.querySelector('[data-testid="seated-elias"]').style.left,document.querySelector('[data-testid="seated-elias"]').style.top]`);
add('wait','500');
assert(`window.beforePause.every((v,i)=>v===document.querySelector('[data-testid="seated-elias"]').style[i?'top':'left'])`);
add('click','.start-card button');
add('wait','--fn',`document.querySelector('[data-testid="seated-elias"]').dataset.pose==='sitting'`);
screenshot('garden-together');
add('press','e');
add('wait','--fn',`document.querySelector('[data-testid="felice-player"]').dataset.restPhase==='none'`);
assert(`!!document.querySelector('[data-entity="elias-guest"]') && document.querySelector('[data-entity="elias-guest"]').dataset.pose==='standing'`);
walkTo(.37,.67);add('click','[data-testid="world-interact"]');
assert(`document.querySelector('.dialogue-modal h2').textContent==='Elias'`);
add('find','role','button','click','--name','Hinsetzen');
add('wait','--fn',`document.querySelector('[data-entity="elias-guest"]').dataset.pose==='sitting'`);
screenshot('elias-stays-in-garden');
start('bedroom');walkTo(.30,.49);add('click','[data-testid="world-interact"]');
add('click','[data-testid="world-interact"]');
add('wait','--fn',`document.querySelector('[data-testid="felice-player"]').dataset.restPhase==='none'`);
assert(`document.querySelector('main').dataset.minute==='860' && document.querySelector('[data-testid="felice-player"]').dataset.pose==='standing'`);
start('kitchen');walkTo(.7,.64);sitting('kitchen-together');
start('school');
evaluate(`window.directions=new Set();window.frames=new Set();window.monitor=setInterval(()=>{const n=document.querySelector('[data-entity="friends"] .character-art');window.directions.add(n.dataset.direction);window.frames.add(n.dataset.frame)},30)`);
add('wait','17000');
evaluate(`clearInterval(window.monitor);({directions:[...window.directions],frames:[...window.frames]})`);
assert(`window.directions.size===4 && window.frames.has('1') && window.frames.has('2')`);
screenshot('friends-directions');
add('errors');
process.stdout.write(JSON.stringify(commands));
