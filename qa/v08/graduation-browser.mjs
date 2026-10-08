import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const profile = await mkdtemp(`${tmpdir()}/pixelgame-range-browser-`);
const browser = spawn('/usr/bin/chromium', ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--remote-debugging-port=9227', `--user-data-dir=${profile}`, 'about:blank'], {stdio:'ignore'});
let socket;
const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
try {
  let target;
  for (let i=0;i<40;i++) {
    try { target=await (await fetch('http://127.0.0.1:9227/json/new?about:blank',{method:'PUT'})).json(); break; } catch { await pause(250); }
  }
  if(!target) throw new Error('Chromium did not start');
  socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  let sequence=0;
  const pending=new Map(), errors=[];
  socket.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    if(message.method==='Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description??message.params.exceptionDetails.text);
    if(message.id){const request=pending.get(message.id);pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result);}
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{
    const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    if(result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor=async expression=>{
    for(let i=0;i<80;i++){if(await evaluate(expression))return;await pause(200);}
    throw new Error(`Browser timeout: ${expression}`);
  };
  const clickText=async text=>evaluate(`(()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!button)throw new Error('Missing button: '+${JSON.stringify(text)});button.click();return true;})()`);
  const walkTo=async (x,y)=>evaluate(`new Promise((resolve,reject)=>{
    const held=new Set();const started=performance.now();
    const clear=()=>{for(const code of held)window.dispatchEvent(new KeyboardEvent('keyup',{code}));held.clear();};
    const timer=setInterval(()=>{
      const node=document.querySelector('[data-testid="felice-player"]');const dx=${x}-Number(node.dataset.x),dy=${y}-Number(node.dataset.y);
      if(Math.hypot(dx,dy)<.016){clearInterval(timer);clear();resolve(true);return;}
      if(performance.now()-started>10000){clearInterval(timer);clear();reject(new Error('Blocked route: '+node.dataset.x+','+node.dataset.y));return;}
      const next=new Set();if(Math.abs(dx)>.01)next.add(dx>0?'KeyD':'KeyA');if(Math.abs(dy)>.01)next.add(dy>0?'KeyS':'KeyW');
      for(const code of held)if(!next.has(code))window.dispatchEvent(new KeyboardEvent('keyup',{code}));
      for(const code of next)if(!held.has(code))window.dispatchEvent(new KeyboardEvent('keydown',{code}));
      held.clear();for(const code of next)held.add(code);
    },30);
  })`);
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
  const url='http://127.0.0.1:5181/';
  await send('Page.navigate',{url});
  await waitFor(`document.querySelector('.start-screen button')?.textContent.includes('Welt betreten')`);
  await evaluate(`localStorage.clear();localStorage.setItem('felice-elias.story.v05',JSON.stringify({version:1,chapter:null,step:0,completed:[],place:'gym',bag:[]}));localStorage.setItem('felice-elias.day.v061',JSON.stringify({version:1,date:'2026-10-08',day:1,minute:840,season:'Sommer'}));true`);
  await send('Page.navigate',{url});
  await waitFor(`document.querySelector('main')?.dataset.scene==='gym' && !!document.querySelector('.start-screen button')`);
  await pause(700);
  await clickText('Welt betreten');
  await waitFor(`!!document.querySelector('[aria-label="Erinnerungsbuch schließen"]')`);
  await evaluate(`document.querySelector('[aria-label="Erinnerungsbuch schließen"]').click();true`);
  await waitFor(`!document.querySelector('dialog[open],.start-screen')`);
  await evaluate(`document.querySelector('[aria-label="Erinnerungsbuch öffnen"]').click();true`);
  await waitFor(`document.querySelectorAll('.chapter-card').length===5`);
  await evaluate(`[...document.querySelectorAll('.chapter-card')].find(card=>card.querySelector('h2').textContent==='Unser Abschluss').querySelector('button').click();true`);
  await waitFor(`!!document.querySelector('.dialogue-modal[open]')`);
  await clickText('Zurück ins Spiel');
  await waitFor(`document.querySelector('main')?.dataset.chapter==='graduation'`);
  if(!await evaluate(`document.querySelector('select[aria-label="Jahreszeit"]').value==='Sommer'`))throw new Error('Graduation is not in summer');
  const gym=await send('Page.captureScreenshot',{format:'png'});await writeFile('/workspace/scratch/v08-gym.png',Buffer.from(gym.data,'base64'));
  const steps=[['Elias',.42,.76],['Schulleiter',.42,.31],['Bürgermeister',.60,.31],['Felice & Elias',.52,.32],['Paul',.35,.62],['Justin',.64,.62]];
  for(const [speaker,x,y] of steps){
    await walkTo(x,y);await evaluate(`document.querySelector('[data-testid="world-interact"]').click();true`);
    await waitFor(`!!document.querySelector('.dialogue-modal[open] h2')`);
    const actual=await evaluate(`document.querySelector('.dialogue-modal h2').textContent`);
    if(actual!==speaker)throw new Error('Expected '+speaker+', got '+actual);
    await clickText('Weiter');await waitFor(`!document.querySelector('.dialogue-modal[open]')`);
  }
  await walkTo(.55,.76);
  await evaluate(`document.querySelector('[data-testid="world-interact"]').click();true`);
  await waitFor(`!!document.querySelector('[data-testid="graduation-photos"]')`);
  if(!await evaluate(`Number(document.querySelector('[data-testid="snapshot-white"]').style.opacity)>0`))throw new Error('No white fade');
  if(!await evaluate(`!document.querySelector('[data-testid="graduation-photos"] button')`))throw new Error('Unexpected photo choice');
  await pause(1600);
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape'}));true`);
  const before=await evaluate(`document.querySelector('[data-testid="graduation-photos"]').dataset.photoTime`);
  await pause(3500);
  if(before!==await evaluate(`document.querySelector('[data-testid="graduation-photos"]').dataset.photoTime`))throw new Error('Photo sequence did not pause');
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape'}));true`);
  const seen=new Set();
  for(let i=0;i<80;i++){
    const index=await evaluate(`document.querySelector('[data-testid="graduation-photos"]')?.dataset.photoIndex`);
    if(index===undefined)break;
    if(!seen.has(index)){seen.add(index);await pause(800);const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('/workspace/scratch/v08-snapshot-'+index+'.png',Buffer.from(shot.data,'base64'));}
    await pause(200);
  }
  if(seen.size!==3)throw new Error('Did not display all snapshots: '+[...seen]);
  await waitFor(`!!document.querySelector('.dialogue-modal.chapter-ending[open]')`);
  const saved=await evaluate(`JSON.parse(localStorage.getItem('felice-elias.story.v05'))`);
  if(!saved.completed.includes('graduation'))throw new Error('Graduation was not saved');
  await clickText('Das bleibt ♥');
  // Repeat the finished memory on a small landscape viewport.
  await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:false});
  await evaluate(`document.querySelector('[data-testid="world-interact"]').click();true`);
  await waitFor(`!!document.querySelector('[data-testid="graduation-photos"]')`);await pause(1500);
  if(!await evaluate(`document.body.scrollWidth<=844`))throw new Error('Mobile overflow');
  const mobile=await send('Page.captureScreenshot',{format:'png'});await writeFile('/workspace/scratch/v08-snapshot-mobile.png',Buffer.from(mobile.data,'base64'));
  await waitFor(`!document.querySelector('[data-testid="graduation-photos"]')`);
  await walkTo(.35,.62);await evaluate(`document.querySelector('[data-testid="world-interact"]').click();true`);
  await waitFor(`!!document.querySelector('.dialogue-modal[open]')`);await clickText('Persönlich reden');
  if(!await evaluate(`document.querySelector('.dialogue-modal').innerText.includes('durchs Wiederholen')`))throw new Error('Missing Paul conversation');
  if(errors.length)throw new Error(errors.join('\n'));
  console.log(JSON.stringify({chapter:'graduation',steps:steps.map(x=>x[0]),snapshots:[...seen],saved:true,paused:true,mobile:true,personalConversation:true,javascriptErrors:errors}));
} finally {
  socket?.close();
  browser.kill('SIGTERM');
}
