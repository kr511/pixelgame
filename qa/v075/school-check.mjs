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

for(const [mode,width,height] of [['desktop',1366,900],['mobile',844,390]]){
 add('set','viewport',String(width),String(height));start('school');screenshot(`${mode}-school`);
}
add('set','viewport','1366','900');start('school');walkTo(.56,.69);walkTo(.54,.54);walkTo(.25,.51);sitting('couple-at-grille');walkTo(.355,.51);sitting('couple-second-grille-bench');
start('school');walkTo(.38,.60);add('click','[data-testid="world-interact"]');assert(`document.querySelector('.dialogue-modal h2').textContent==='Elena'`);
add('find','role','button','click','--name','Hinsetzen');add('wait','--fn',`document.querySelector('[data-entity="friends"]').dataset.pose==='sitting'`);screenshot('elena-sitting');
walkTo(.335,.485);add('click','[data-testid="world-interact"]');add('find','role','button','click','--name','Hinlegen');add('wait','--fn',`document.querySelector('[data-entity="friends"]').dataset.pose==='lying'`);screenshot('elena-lying');
walkTo(.40,.695);add('click','[data-testid="world-interact"]');add('find','role','button','click','--name','Aufstehen');assert(`document.querySelector('[data-entity="friends"]').dataset.pose==='standing'`);
start('school',840,'Winter');screenshot('winter-school');add('errors');process.stdout.write(JSON.stringify(commands));
