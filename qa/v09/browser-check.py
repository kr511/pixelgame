"""Real UI regression checks. Uses isolated browser contexts and their own saves."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = 'http://localhost:5173/'
ROOT = Path(__file__).resolve().parent
KEY = 'felice-elias.timeline.v09'
errors = []

WALK = """([x,y]) => new Promise((resolve,reject)=>{
 const held=new Set(),started=performance.now();
 const clear=()=>{for(const code of held)window.dispatchEvent(new KeyboardEvent('keyup',{code}));held.clear();};
 const timer=setInterval(()=>{
  const node=document.querySelector('[data-testid="felice-player"]');
  const dx=x-Number(node.dataset.x),dy=y-Number(node.dataset.y);
  if(Math.hypot(dx,dy)<.012){clearInterval(timer);clear();resolve(true);return;}
  if(performance.now()-started>12000){clearInterval(timer);clear();reject(new Error('Blocked at '+node.dataset.x+','+node.dataset.y));return;}
  const next=new Set();if(Math.abs(dx)>.008)next.add(dx>0?'KeyD':'KeyA');if(Math.abs(dy)>.008)next.add(dy>0?'KeyS':'KeyW');
  for(const code of held)if(!next.has(code))window.dispatchEvent(new KeyboardEvent('keyup',{code}));
  for(const code of next)if(!held.has(code))window.dispatchEvent(new KeyboardEvent('keydown',{code}));
  held.clear();for(const code of next)held.add(code);
 },25);
})"""

def track(page):
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(URL,wait_until='networkidle')

def start(page):
    page.get_by_role('button',name='Welt betreten',exact=True).click()

def snap(page,name):
    page.screenshot(path=str(ROOT / 'screenshots' / f'{name}.png'))

def persisted(page):
    return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))', KEY)

def close_dialog(page):
    page.locator('.dialogue-actions button').first.click()

def tap_or_click(locator, touch=False):
    locator.tap() if touch else locator.click()

def walk_touch(page,x,y):
    joy=page.locator('.joystick').bounding_box()
    cx,cy=joy['x']+joy['width']/2,joy['y']+joy['height']/2
    cdp=page.context.new_cdp_session(page)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':cx,'y':cy}]})
    for _ in range(150):
        position=page.locator('[data-testid="felice-player"]').evaluate('(e)=>[Number(e.dataset.x),Number(e.dataset.y)]')
        dx,dy=x-position[0],y-position[1]
        dist=(dx*dx+dy*dy)**.5
        if dist<.014:
            break
        cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':cx+dx/dist*30,'y':cy+dy/dist*30}]})
        page.wait_for_timeout(70)
    else:
        raise AssertionError(f'Touch walk blocked at {position}')
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    cdp.detach()

def sit_phone(page,touch=False):
    if touch: walk_touch(page,.60,.395)
    else: page.evaluate(WALK,[.60,.395])
    tap_or_click(page.locator('[data-testid="world-interact"]'),touch)
    page.wait_for_function("document.querySelector('[data-testid=felice-player]').dataset.restPhase==='resting'")
    assert page.locator('[data-testid="felice-player"]').get_attribute('data-rest-id')=='felice-desk'
    tap_or_click(page.get_by_role('button',name='Handy öffnen',exact=False),touch)
    page.locator('.story-phone').wait_for(state='visible')

def chat_topics(page,touch=False,interrupted=False):
    tap_or_click(page.locator('.chat-topics button').nth(1),touch)
    if interrupted:
        raw=page.evaluate('(key)=>localStorage.getItem(key)',KEY)
        assert json.loads(raw)['progress']['chat-2025-11-13']['topic']=='space'
        page.reload(wait_until='networkidle'); start(page); sit_phone(page,touch)
        assert page.locator('.phone-chat').inner_text().count('Manchmal denke')==1
    tap_or_click(page.get_by_role('button',name='Antwort senden',exact=True),touch)
    tap_or_click(page.locator('.chat-topics button').nth(4),touch)
    tap_or_click(page.get_by_role('button',name='Gedanken stehen lassen',exact=True),touch)
    assert not page.locator('.chat-topics button').nth(1).is_enabled()
    tap_or_click(page.get_by_role('button',name='Den Abend bewahren',exact=False),touch)
    page.locator('.story-phone').wait_for(state='detached')

def encounter(page,touch=False,name='radegast-encounter'):
    page.wait_for_function("document.querySelector('[data-testid=encounter-elias]').dataset.arriving==='false'")
    if touch: walk_touch(page,.59,.63)
    else: page.evaluate(WALK,[.59,.63])
    snap(page,name)
    for i in range(4):
        tap_or_click(page.locator('[data-testid="world-interact"]'),touch)
        if i==3:
            assert 'verunsichert' in page.locator('.dialogue-modal').inner_text()
            snap(page,name+'-pause')
        tap_or_click(page.locator('.dialogue-actions button').first,touch)
    page.wait_for_function("document.querySelector('main').dataset.chapter==='free'")

def love(page,touch=False,name='first-love'):
    sit_phone(page,touch)
    send=page.get_by_role('button',name='„Ich liebe dich.“ senden',exact=False)
    send.wait_for(state='visible')
    assert not send.is_enabled(), 'Brief deliberate pause before replying'
    tap_or_click(send,touch)
    assert page.locator('.chat-message').count()==2
    assert page.locator('.chat-message').nth(0).inner_text().count('Ich liebe dich.')==1
    snap(page,name)
    tap_or_click(page.get_by_role('button',name='Diesen Moment bewahren',exact=False),touch)

if __name__ == '__main__':
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        desktop=browser.new_context(viewport={'width':1366,'height':900})
        page=desktop.new_page(); track(page); start(page)
        assert '01.11.2025' in page.locator('.day-clock').inner_text()
        assert page.locator('[data-status="verfügbar"]').count()==0
        snap(page,'calendar-initial')
        page.get_by_role('button',name='Erinnerungsbuch schließen',exact=True).click()
        ordered=[]
        for index in range(14):
            page.locator('.story-next-button').click()
            close_dialog(page)
            page.locator('.story-next-button').click()
            story_id=page.locator('main').get_attribute('data-chapter')
            ordered.append(story_id)
            if story_id=='radegast-chocolate': encounter(page)
            elif story_id=='first-i-love-you': love(page)
            else:
                sit_phone(page)
                if index==0: snap(page,'chat-evening')
                chat_topics(page,interrupted=index==0)
            state=persisted(page)
            assert state['progress'][story_id].get('completedAt'),story_id
            assert state['active'] is None
            print('Completed',story_id,flush=True)
        assert ordered[6]=='radegast-chocolate' and ordered[7]=='chat-2025-11-19'
        assert ordered[-1]=='first-i-love-you'
        state=persisted(page)
        assert state['clock']['date']=='2025-11-25'
        page.get_by_role('button',name='Erinnerungsbuch öffnen',exact=True).click()
        assert page.locator('[data-event-id="radegast-chocolate"]').get_attribute('data-status')=='abgeschlossen'
        assert '19.11.2025' in page.locator('[data-event-id="radegast-chocolate"]').inner_text()
        assert page.locator('[data-event-id="legacy-christmas"] time').inner_text()=='Historisches Datum noch offen'
        snap(page,'memory-book-completed')
        raw_clock=json.dumps(state['clock'],sort_keys=True)
        legacy_before=page.evaluate("[localStorage.getItem('felice-elias.story.v05'),localStorage.getItem('felice-elias.day.v061')]")
        page.locator('[data-event-id="chat-2025-11-13"] button').click()
        assert page.locator('main').get_attribute('data-replay')=='true'
        sit_phone(page); chat_topics(page)
        assert json.dumps(persisted(page)['clock'],sort_keys=True)==raw_clock
        assert persisted(page)['progress']['chat-2025-11-13']['visits']==2
        assert page.evaluate("[localStorage.getItem('felice-elias.story.v05'),localStorage.getItem('felice-elias.day.v061')]")==legacy_before
        page.reload(wait_until='networkidle'); start(page)
        assert len([p for p in persisted(page)['progress'].values() if p.get('completedAt')])==14
        print('Desktop chronology, resume, replay and reload passed',flush=True)
        saved=page.evaluate('(key)=>localStorage.getItem(key)',KEY)

        mobile=browser.new_context(viewport={'width':844,'height':390},has_touch=True,is_mobile=True)
        phone=mobile.new_page(); track(phone)
        phone.evaluate('([key,raw])=>localStorage.setItem(key,raw)',[KEY,saved]); phone.reload(wait_until='networkidle'); start(phone)
        phone.get_by_role('button',name='Erinnerungsbuch öffnen',exact=True).tap()
        snap(phone,'mobile-book')
        phone.locator('[data-event-id="radegast-chocolate"] button').tap()
        encounter(phone,True,'mobile-radegast')
        assert json.dumps(persisted(phone)['clock'],sort_keys=True)==raw_clock
        phone.get_by_role('button',name='Erinnerungsbuch öffnen',exact=True).tap()
        phone.locator('[data-event-id="first-i-love-you"] button').tap()
        love(phone,True,'mobile-first-love')
        assert json.dumps(persisted(phone)['clock'],sort_keys=True)==raw_clock
        phone.get_by_role('button',name='Erinnerungsbuch öffnen',exact=True).tap()
        phone.locator('[data-event-id="chat-2025-11-13"] button').tap(); sit_phone(phone,True)
        snap(phone,'mobile-chat')
        chat_topics(phone,True)
        assert phone.evaluate('document.body.scrollWidth <= innerWidth')
        phone.set_viewport_size({'width':390,'height':844})
        assert phone.locator('.rotate-screen').is_visible()
        print('Mobile touch controls, encounters, chats, love and orientation passed',flush=True)

        migration=browser.new_context(viewport={'width':1366,'height':900})
        old=migration.new_page(); track(old)
        old_story=json.dumps({'version':1,'chapter':None,'step':0,'completed':['dog','christmas'],'place':'garden','bag':[]})
        old_day=json.dumps({'version':1,'date':'2026-10-08','day':27,'minute':850,'season':'Sommer'})
        old_memory=json.dumps({'version':1,'memories':{'goelzau-shooting':{'completedAt':'2026-09-26T12:00Z','visits':3,'bestScore':75}}})
        values={'felice-elias.story.v05':old_story,'felice-elias.day.v061':old_day,'felice-elias.memories.v1':old_memory}
        old.evaluate('(v)=>Object.entries(v).forEach(([k,s])=>localStorage.setItem(k,s))',values)
        old.reload(wait_until='networkidle'); start(old)
        assert persisted(old)['clock']['minute']==850
        assert persisted(old)['progress']['legacy-dog']['completedAt']=='legacy'
        assert persisted(old)['progress']['legacy-shooting']['completedAt']=='legacy'
        for key,value in values.items(): assert old.evaluate('(key)=>localStorage.getItem(key)',key)==value
        print('Old save migration preserves original keys, achievements, clock and season',flush=True)
        corrupt=browser.new_context(viewport={'width':1366,'height':900})
        bad=corrupt.new_page(); track(bad)
        bad.evaluate('(key)=>localStorage.setItem(key,"{broken")',KEY)
        bad.reload(wait_until='networkidle'); start(bad)
        assert 'nicht lesbar' in bad.locator('.day-save-warning').inner_text()
        assert bad.evaluate('(key)=>localStorage.getItem(key)',KEY)=='{broken'
        print('Corrupt save preserved without overwrite',flush=True)
        assert not errors,errors
        browser.close()
        print('Browser QA passed. No JavaScript page errors.',flush=True)
