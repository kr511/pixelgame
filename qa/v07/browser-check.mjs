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

for (const [mode,width,height] of [['desktop',1366,900],['mobile',844,390]]) {
 add('set','viewport',String(width),String(height));
 for(const place of ['bedroom','home','kitchen','garden','bus','school','range']) {
  start(place); screenshot(`${mode}-${place}`);
  assert(`document.body.scrollWidth<=${width} && !document.querySelector('vite-error-overlay,[data-nextjs-dialog]')`);
 }
}
add('set','viewport','1366','900');
start('bedroom',1200,'Herbst');walkTo(.30,.49);
add('click','[data-testid="world-interact"]');
assert(`document.querySelector('[data-testid="felice-player"]').dataset.restPhase==='entering'`);
add('wait','--fn',`document.querySelector('[data-testid="felice-player"]').dataset.restPhase==='resting'`);
assert(`document.querySelector('[data-testid="felice-player"]').dataset.pose==='lying' && document.querySelector('main').dataset.minute==='1210' && !!document.querySelector('image[href="/rooms/felice-bedroom-rest-v065.png"]')`);
screenshot('bed-under-duvet');
add('set','viewport','844','390');screenshot('mobile-bed-under-duvet');
add('find','role','button','click','--name','Schlafen bis 5:00 Uhr');
add('find','role','button','click','--name','Guten Morgen');
assert(`document.querySelector('main').dataset.minute==='300' && document.querySelector('main').dataset.day==='2' && !document.querySelector('[data-testid="day-notice"]')`);
add('set','viewport','1366','900');
start('kitchen',300);walkTo(.535,.465);add('click','[data-testid="world-interact"]');
add('find','role','button','click','--name','Frühstück vorbereiten · 10 Min.');
assert(`document.querySelector('main').dataset.minute==='310' && !!document.querySelector('.kitchen-breakfast')`);screenshot('kitchen-breakfast');
walkTo(.45,.465);walkTo(.21,.33);add('click','[data-testid="world-interact"]');
add('find','role','button','click','--name','Warmes Getränk machen · 10 Min.');
assert(`document.querySelector('main').dataset.minute==='320' && !!document.querySelector('.kitchen-warm-drink')`);screenshot('kitchen-drink');
walkTo(.48,.65);walkTo(.89,.65);walkTo(.89,.48);add('click','[data-testid="world-interact"]');
add('find','role','button','click','--name','Küche aufräumen · 10 Min.');
assert(`document.querySelector('main').dataset.minute==='330' && !!document.querySelector('.kitchen-tidy-kitchen')`);screenshot('kitchen-tidy');
walkTo(.89,.65);walkTo(.7,.64);sitting('kitchen-together');
start('home');walkTo(.925,.54);add('click','[data-testid="world-interact"]');
assert(`document.querySelector('main').dataset.scene==='kitchen' && document.querySelector('main').dataset.minute==='870'`);
walkTo(.5,.9);add('click','[data-testid="world-interact"]');
assert(`document.querySelector('main').dataset.scene==='home' && document.querySelector('main').dataset.minute==='900'`);
start('school');
evaluate(`window.positions=[...document.querySelectorAll('[data-entity]')].filter(n=>['friends','jason','luca','wyatt'].includes(n.dataset.entity)).map(n=>[n.dataset.entity,n.dataset.x,n.dataset.y]);`);
add('wait','5000');
assert(`window.positions.every(([id,x,y])=>{const n=document.querySelector('[data-entity="'+id+'"]');return n.dataset.x!==x || n.dataset.y!==y}) && document.querySelector('main').dataset.minute==='840'`);
screenshot('friends-walking');
add('press','Escape');evaluate(`window.pausedPositions=[...document.querySelectorAll('[data-entity]')].map(n=>[n.dataset.entity,n.dataset.x,n.dataset.y]);`);
add('wait','500');
assert(`window.pausedPositions.every(([id,x,y])=>{const n=document.querySelector('[data-entity="'+id+'"]');return n.dataset.x===x && n.dataset.y===y})`);
add('click','.start-card button');
walkTo(.4,.6);add('click','[data-testid="world-interact"]');
assert(`document.querySelector('.dialogue-modal h2').textContent==='Elena'`);
screenshot('friend-actions');
add('find','role','button','click','--name','Hinsetzen');
add('wait','--fn',`document.querySelector('[data-entity="friends"]').dataset.pose==='sitting'`);
screenshot('friend-sitting');
walkTo(.205,.54);add('click','[data-testid="world-interact"]');
add('find','role','button','click','--name','Hinlegen');
add('wait','--fn',`document.querySelector('[data-entity="friends"]').dataset.pose==='lying'`);
screenshot('friend-lying');
add('set','viewport','844','390');screenshot('mobile-friend-lying');add('set','viewport','1366','900');
walkTo(.17,.8);add('click','[data-testid="world-interact"]');
add('find','role','button','click','--name','Aufstehen');
assert(`document.querySelector('[data-entity="friends"]').dataset.pose==='standing'`);
start('school',435);walkTo(.5,.38);add('click','[data-testid="world-interact"]');add('find','role','button','click','--name','Unterricht besuchen');
assert(`document.querySelector('main').dataset.minute==='780'`);
for(const place of ['home','garden','bus','school']) { start(place,840,'Winter'); screenshot(`winter-${place}`); }
add('set','viewport','760','390');start('kitchen');
evaluate(`window.touchX=document.querySelector('[data-testid="felice-player"]').dataset.x`);
add('mouse','move','79','328');add('mouse','down');add('mouse','move','109','328');add('wait','500');add('mouse','up');add('wait','150');
assert(`Number(document.querySelector('[data-testid="felice-player"]').dataset.x)>Number(window.touchX) && !document.querySelector('[data-testid="felice-player"]').classList.contains('walking') && document.querySelector('main').dataset.minute==='840'`);
assert(`document.querySelector('.quest-tracker').getBoundingClientRect().bottom<document.querySelector('.joystick').getBoundingClientRect().top`);
screenshot('touch-kitchen');
add('errors');
process.stdout.write(JSON.stringify(commands));
