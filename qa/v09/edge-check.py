"""Additional edge cases after the full UI run, using isolated browser saves."""
import json
from playwright.sync_api import sync_playwright
import importlib.util
from pathlib import Path
spec = importlib.util.spec_from_file_location('v09_browser_check',Path(__file__).with_name('browser-check.py'))
checks = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checks)
KEY,WALK,errors,persisted,sit_phone,snap,start,track = (getattr(checks,name) for name in ['KEY','WALK','errors','persisted','sit_phone','snap','start','track'])

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    for touch in [False, True]:
        context=browser.new_context(viewport={'width':844,'height':390} if touch else {'width':1366,'height':900}, has_touch=touch, is_mobile=touch)
        page=context.new_page(); track(page)
        day={'version':1,'date':'2025-11-13','minute':1020,'day':13,'season':'Herbst'}
        page.evaluate('(day)=>localStorage.setItem("felice-elias.day.v061",JSON.stringify(day))',day)
        page.reload(wait_until='networkidle'); start(page)
        page.get_by_role('button',name='Erinnerungsbuch schließen',exact=True).click()
        sit_phone(page,touch)
        assert persisted(page)['active']['id']=='chat-2025-11-13'
        assert page.locator('[data-testid="felice-player"]').get_attribute('data-rest-phase')=='resting'
        page.locator('.chat-topics button').nth(1).click()
        page.get_by_role('button',name='Chat pausieren',exact=True).click()
        page.wait_for_timeout(1500)
        assert persisted(page)['progress']['chat-2025-11-13']['line']==1
        assert persisted(page)['clock']['minute']==1030
        page.get_by_role('button',name='Chat fortsetzen',exact=True).click()
        page.get_by_role('button',name='Antwort senden',exact=True).click()
        snap(page,'mobile-chat-final' if touch else 'chat-final')
        page.get_by_role('button',name='Handy schließen',exact=True).click()
        page.get_by_role('button',name='Unterbrechen',exact=True).click()
        assert persisted(page)['active'] is None
        assert persisted(page)['progress']['chat-2025-11-13']['topics']==['space']
        assert not persisted(page)['progress']['chat-2025-11-13'].get('completedAt')
        page.locator('.story-next-button').click()
        page.get_by_role('button',name='Erinnerungsbuch öffnen',exact=True).click()
        assert page.locator('[data-event-id="chat-2025-11-13"] button').is_enabled()
        assert not page.locator('[data-event-id="chat-2025-11-14"] button').is_enabled()
        page.locator('[data-event-id="chat-2025-11-13"] button').click()
        assert not page.locator('.journal-modal').count(), 'Resume from book closes it'
        print('Direct phone opening, pause, interruption and book resume passed:', 'touch' if touch else 'desktop', flush=True)
        context.close()

    context=browser.new_context(viewport={'width':1366,'height':900})
    page=context.new_page(); track(page)
    day={'version':1,'date':'2026-10-08','minute':850,'day':27,'season':'Sommer'}
    memory={'version':1,'memories':{'goelzau-shooting':{'completedAt':'2026-09-26T12:00Z','visits':3,'bestScore':75}}}
    page.evaluate('([day,memory])=>{localStorage.setItem("felice-elias.day.v061",JSON.stringify(day));localStorage.setItem("felice-elias.memories.v1",JSON.stringify(memory));}',[day,memory])
    page.reload(wait_until='networkidle'); start(page)
    page.get_by_role('button',name='Erinnerungsbuch schließen',exact=True).click()
    page.evaluate(WALK,[.79,.52]); page.locator('[data-testid="world-interact"]').click()
    page.get_by_role('button',name='In Ruhe anfangen',exact=True).click()
    svg=page.locator('.range-surface').bounding_box()
    for _ in range(9):
        page.mouse.click(svg['x']+20,svg['y']+20)
        page.wait_for_timeout(470)
    page.locator('.memory-result button.memory-primary').click()
    page.wait_for_function("document.querySelector('main').dataset.scene==='bedroom'")
    assert persisted(page)['clock']==day
    best=page.evaluate('JSON.parse(localStorage.getItem("felice-elias.memories.v1"))')
    assert best['memories']['goelzau-shooting']['bestScore']==75
    assert best['memories']['goelzau-shooting']['visits']==4
    assert persisted(page)['progress']['legacy-shooting']['visits']==2
    print('Existing photo/minigame replay preserves calendar and best score, updates book',flush=True)

    blocked=browser.new_context(viewport={'width':1366,'height':900})
    page=blocked.new_page(); track(page)
    page.evaluate("()=>{Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')};return true;}")
    start(page)
    assert 'Speichern' in page.locator('.day-save-warning').inner_text()
    assert page.locator('.journal-modal').is_visible()
    print('Blocked local storage reports failure while game remains playable',flush=True)
    assert not errors,errors
    browser.close()
    print('Edge QA passed. No JavaScript page errors.',flush=True)
