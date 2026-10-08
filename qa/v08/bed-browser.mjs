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
  await evaluate(`localStorage.clear();localStorage.setItem('felice-elias.story.v05',JSON.stringify({version:1,chapter:null,step:0,completed:[],place:'range',bag:[]}));localStorage.setItem('felice-elias.day.v061',JSON.stringify({version:1,date:'2026-10-08',day:1,minute:840,season:'Sommer'}));true`);
  await send('Page.navigate',{url});
  await waitFor(`document.querySelector('main')?.dataset.scene==='range' && !!document.querySelector('.start-screen button')`);
  await pause(700);
  await clickText('Welt betreten');
  await waitFor(`!!document.querySelector('[aria-label="Erinnerungsbuch schließen"]')`);
  await evaluate(`document.querySelector('[aria-label="Erinnerungsbuch schließen"]').click();true`);
  await waitFor(`!document.querySelector('dialog[open],.start-screen')`);
  const scenes=['home','kitchen','school','bus','range','garden'];
  for(const place of scenes){
    await evaluate(`localStorage.setItem('felice-elias.story.v05',JSON.stringify({version:1,chapter:null,step:0,completed:[],place:${JSON.stringify(place)},bag:[]}));true`);
    await send('Page.navigate',{url});
    await waitFor(`document.querySelector('main')?.dataset.scene===${JSON.stringify(place)} && !!document.querySelector('.start-screen button')`);
    await clickText('Welt betreten');await pause(300);
    await evaluate(`document.querySelector('[aria-label="Erinnerungsbuch schließen"]')?.click();true`);await pause(200);
    if(await evaluate(`!!document.querySelector('.rest-mat') || document.body.innerText.includes('Hinlegen') || document.body.innerText.includes('Kuscheldecke')`))throw new Error('Blanket/lying still exposed in '+place);
    if(place==='range'){
      await walkTo(.32,.78);await evaluate(`document.querySelector('[data-testid="world-interact"]').click();true`);
      await waitFor(`!!document.querySelector('.dialogue-modal[open]')`);
      if(await evaluate(`document.querySelector('.dialogue-modal').innerText.includes('Hinlegen')`))throw new Error('Friend can still lie down');
      await clickText('Hinsetzen');
      await waitFor(`document.querySelector('[data-entity="helena"]')?.dataset.pose==='sitting'`);
    }
  }
  await evaluate(`localStorage.setItem('felice-elias.story.v05',JSON.stringify({version:1,chapter:null,step:0,completed:[],place:'bedroom',bag:[]}));true`);
  await send('Page.navigate',{url});
  await waitFor(`document.querySelector('main')?.dataset.scene==='bedroom' && !!document.querySelector('.start-screen button')`);
  await clickText('Welt betreten');await pause(300);await evaluate(`document.querySelector('[aria-label="Erinnerungsbuch schließen"]')?.click();true`);
  await walkTo(.30,.49);
  if(!await evaluate(`document.querySelector('[data-testid="world-interact"]')?.textContent.includes('Hinlegen')`))throw new Error('Bed lying unavailable');
  await evaluate(`document.querySelector('[data-testid="world-interact"]').click();true`);
  await waitFor(`document.querySelector('[data-testid="felice-player"]')?.dataset.pose==='lying'`);
  await waitFor(`document.querySelector('.rest-actions')?.innerText.includes('Du liegst wach im Bett')`);
  const screenshot=await send('Page.captureScreenshot',{format:'png'});await writeFile('/workspace/scratch/bed-only.png',Buffer.from(screenshot.data,'base64'));
  await evaluate(`document.querySelector('[data-testid="world-interact"]').click();true`);
  await waitFor(`!document.querySelector('.rest-actions')`);
  if(errors.length)throw new Error(errors.join('\n'));
  console.log(JSON.stringify({scenes,blanketsRemoved:true,friendsStillSit:true,bedLieAndStand:true,javascriptErrors:errors}));
} finally {
  socket?.close();
  browser.kill('SIGTERM');
}
