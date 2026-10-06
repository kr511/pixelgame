// Generates agent-browser batch commands. Uses an isolated browser session and
// test saves; run from the repository root with the local dev server running.
import { resolve } from 'node:path';
const commands=[];
const add=(...args)=>commands.push(args);
const evaluate=code=>add('eval',code);
const assert=code=>evaluate(`if(!(${code})) throw new Error(${JSON.stringify(code)}); true`);
const screenshot=name=>{ add('wait','200'); add('screenshot',resolve(`qa/review-v061/after/${name}.png`)); };
const url=process.env.GAME_URL ?? 'http://127.0.0.1:5173/';
const start=(place,minute=840,season='Sommer')=>{
 add('open',url);
 evaluate(`localStorage.setItem('felice-elias.story.v05',JSON.stringify({version:1,chapter:null,step:0,completed:[],place:'${place}',bag:[]}));localStorage.setItem('felice-elias.day.v061',JSON.stringify({version:1,date:'2026-10-06',day:1,minute:${minute},season:'${season}'}));`);
 add('open',url); add('wait','--load','networkidle');
 add('find','role','button','click','--name','Welt betreten');
 add('find','role','button','click','--name','Erinnerungsbuch schließen');
};
const hold=(keys,ms)=>{
 evaluate(keys.map(code=>`window.dispatchEvent(new KeyboardEvent('keydown',{code:'${code}'}))`).join(';'));
 add('wait',String(ms));
 evaluate(keys.map(code=>`window.dispatchEvent(new KeyboardEvent('keyup',{code:'${code}'}))`).join(';'));
 add('wait','100');
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
 add('find','role','button','click','--name','Mit Elias sitzen');
 assert(`document.querySelector('[data-testid="felice-player"]').dataset.pose==='sitting' && !!document.querySelector('[data-testid="seated-elias"]')`);
 screenshot(name);
 add('press','e');
 assert(`document.querySelector('[data-testid="felice-player"]').dataset.pose==='standing' && !document.querySelector('[data-testid="seated-elias"]')`);
};
for (const [mode,width,height] of [['desktop',1366,900],['mobile',844,390],['touch',760,390]]) {
 add('set','viewport',String(width),String(height));
 for(const [i,place] of ['bedroom','home','garden','bus','school','range'].entries()) {
  start(place); screenshot(mode==='desktop'?`0${i+1}-${place}`:`${mode}-${place}`);
  assert(`document.body.scrollWidth<=${width} && !document.querySelector('vite-error-overlay,[data-nextjs-dialog]')`);
 }
}
add('set','viewport','1366','900');
for(const place of ['home','garden','bus','school']) { start(place,840,'Winter'); screenshot(`winter-${place}`); }
start('bedroom',1200,'Herbst');
walkTo(.30,.49);
assert(`document.querySelector('[data-testid="world-interact"]').textContent.includes('Hinlegen')`);
add('click','[data-testid="world-interact"]');
assert(`document.querySelector('[data-testid="felice-player"]').dataset.pose==='lying' && document.querySelector('main').dataset.minute==='1210'`);
screenshot('07-v061-lying');
add('find','role','button','click','--name','Schlafen bis 5:00 Uhr');
add('find','role','button','click','--name','Guten Morgen');
assert(`document.querySelector('main').dataset.minute==='300' && document.querySelector('main').dataset.day==='2' && !document.querySelector('[data-testid="day-notice"]')`);
start('garden',470);
walkTo(.4,.38);walkTo(.4,.65);walkTo(.25,.65);
sitting('07-v061-bench');
start('school');walkTo(.205,.54);sitting('bench-school-left');
start('school');walkTo(.8,.54);sitting('bench-school-right');
start('bus');walkTo(.5,.405);walkTo(.275,.405);sitting('bench-bus');
start('range');walkTo(.5,.89);walkTo(.76,.89);sitting('bench-range');
start('school',435);walkTo(.5,.38);
add('click','[data-testid="world-interact"]');
add('find','role','button','click','--name','Unterricht besuchen');
assert(`document.querySelector('main').dataset.minute==='780' && document.querySelector('[data-testid="day-notice"]').textContent.includes('8:00')`);
add('wait','4700');
assert(`document.querySelector('[data-testid="day-notice"]').textContent.includes('12:00')`);
screenshot('07-v061-school');
add('set','viewport','844','390');screenshot('07-v061-mobile');
add('set','viewport','1366','900');start('school');
for (const [key,direction] of [['KeyD','right'],['KeyA','left'],['KeyW','back'],['KeyS','front']]) {
 evaluate(`new Promise((resolve,reject)=>{const frames=new Set();window.dispatchEvent(new KeyboardEvent('keydown',{code:'${key}'}));const timer=setInterval(()=>frames.add(document.querySelector('[data-testid="felice-player"] .character-art').dataset.frame),16);setTimeout(()=>{clearInterval(timer);window.dispatchEvent(new KeyboardEvent('keyup',{code:'${key}'}));if(frames.size<2)reject(new Error('Laufbilder fehlen'));else resolve([...frames]);},650);})`);
 assert(`document.querySelector('[data-testid="felice-player"]').dataset.direction==='${direction}'`);
}
add('wait','100');
assert(`!document.querySelector('[data-testid="felice-player"]').classList.contains('walking') && document.querySelector('main').dataset.minute==='840'`);
evaluate(`window.reviewPosition=document.querySelector('[data-testid="felice-player"]').dataset.x`);
add('press','Escape');hold(['KeyD'],300);
assert(`document.querySelector('[data-testid="felice-player"]').dataset.x===window.reviewPosition`);
add('click','.start-card button');
start('range');walkTo(.5,.44);add('click','[data-testid="world-interact"]');add('wait','1500');screenshot('shooting-intro');
add('find','role','button','click','--name','In Ruhe anfangen');screenshot('shooting-playing');
add('set','viewport','844','390');screenshot('shooting-mobile');
for(let shot=0;shot<9;shot++) {
 const x=[254,450,646][Math.floor(shot/3)];
 evaluate(`(()=>{const surface=document.querySelector('.range-surface');const p=new DOMPoint(${x},258).matrixTransform(surface.getScreenCTM());surface.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,clientX:p.x,clientY:p.y}));})()`);
 add('wait','500');
}
add('wait','850');assert(`document.querySelector('.memory-result')?.textContent.includes('90')`);screenshot('shooting-result-mobile');
add('find','role','button','click','--name','Erinnerung mit nach Hause nehmen');add('wait','1500');
assert(`document.querySelector('main').dataset.scene==='range' && !!localStorage.getItem('felice-elias.memories.v1')`);
add('set','viewport','760','390');start('school');
evaluate(`window.reviewPosition=document.querySelector('[data-testid="felice-player"]').dataset.x`);
add('mouse','move','79','328');add('mouse','down');add('mouse','move','109','328');add('wait','500');add('mouse','up');add('wait','150');
assert(`Number(document.querySelector('[data-testid="felice-player"]').dataset.x)>Number(window.reviewPosition) && !document.querySelector('[data-testid="felice-player"]').classList.contains('walking')`);
assert(`document.querySelector('.quest-tracker').getBoundingClientRect().bottom<document.querySelector('.joystick').getBoundingClientRect().top`);
add('errors');
process.stdout.write(JSON.stringify(commands));
