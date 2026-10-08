"""Keep V0.8 graduation and photo replay functional without changing the V0.9 clock."""
import importlib.util
from pathlib import Path
from playwright.sync_api import sync_playwright
spec=importlib.util.spec_from_file_location('checks',Path(__file__).with_name('browser-check.py'))
checks=importlib.util.module_from_spec(spec); spec.loader.exec_module(checks)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1366,'height':900})
    page=context.new_page(); checks.track(page); checks.start(page)
    clock=checks.persisted(page)['clock']
    page.locator('[data-event-id="legacy-graduation"] button').click()
    page.locator('.dialogue-actions button').first.click()
    assert checks.persisted(page)['clock']==clock
    assert page.locator('main').get_attribute('data-scene')=='gym'
    assert page.locator('.daylight-shade').evaluate('(e)=>Number(e.style.opacity)')==0
    checks.snap(page,'graduation-preserved')
    steps=[('Elias',.42,.76),('Schulleiter',.42,.31),('Bürgermeister',.60,.31),('Felice & Elias',.52,.32),('Paul',.35,.62),('Justin',.64,.62)]
    for speaker,x,y in steps:
        page.evaluate(checks.WALK,[x,y]); page.locator('[data-testid="world-interact"]').click()
        assert page.locator('.dialogue-modal h2').inner_text()==speaker
        page.locator('.dialogue-actions button').first.click()
    page.evaluate(checks.WALK,[.55,.76]); page.locator('[data-testid="world-interact"]').click()
    page.locator('[data-testid="graduation-photos"]').wait_for(state='visible')
    assert not page.locator('[data-testid="graduation-photos"] button').count()
    assert float(page.locator('[data-testid="snapshot-white"]').evaluate('(e)=>e.style.opacity'))>0
    page.wait_for_timeout(1200)
    page.keyboard.press('Escape')
    elapsed=page.locator('[data-testid="graduation-photos"]').get_attribute('data-photo-time')
    page.wait_for_timeout(1500)
    assert page.locator('[data-testid="graduation-photos"]').get_attribute('data-photo-time')==elapsed
    page.keyboard.press('Escape')
    seen=set()
    for _ in range(65):
        photo=page.locator('[data-testid="graduation-photos"]')
        if not photo.count(): break
        seen.add(photo.get_attribute('data-photo-index'))
        if '1' in seen and len(seen)==2: checks.snap(page,'graduation-snapshots')
        page.wait_for_timeout(200)
    assert seen=={'0','1','2'},seen
    page.locator('.dialogue-modal.chapter-ending').wait_for(state='visible')
    assert checks.persisted(page)['progress']['legacy-graduation']['visits']==1
    assert checks.persisted(page)['clock']==clock
    page.get_by_role('button',name='Das bleibt ♥',exact=True).click()
    assert page.locator('main').get_attribute('data-scene')=='bedroom'
    assert 'graduation' in page.evaluate('JSON.parse(localStorage.getItem("felice-elias.story.v05")).completed')
    page.reload(wait_until='networkidle'); checks.start(page)
    assert checks.persisted(page)['clock']==clock
    assert checks.persisted(page)['progress']['legacy-graduation']['visits']==1
    if not page.locator('.journal-modal').count():
        page.get_by_role('button',name='Erinnerungsbuch öffnen',exact=True).click()
    card=page.locator('[data-event-id="legacy-graduation"]')
    assert card.get_attribute('data-status')=='abgeschlossen'
    assert card.locator('time').inner_text()=='Sommer 2026 · Genaues Datum offen'
    card.locator('button').click(); page.locator('.dialogue-actions button').first.click()
    # After graduation, its photo spot remains directly replayable.
    page.evaluate(checks.WALK,[.55,.76]); page.locator('[data-testid="world-interact"]').click()
    page.locator('[data-testid="graduation-photos"]').wait_for(state='visible')
    page.locator('[data-testid="graduation-photos"]').wait_for(state='detached',timeout=15000)
    assert checks.persisted(page)['clock']==clock
    assert checks.persisted(page)['progress']['legacy-graduation']['visits']==2
    page.get_by_role('button',name='Zurück in die Welt',exact=True).click()
    assert page.locator('main').get_attribute('data-scene')=='bedroom'
    assert not checks.errors,checks.errors
    browser.close()
    print('V0.8 graduation, all three photos, pause, saved completion and photo replay preserved. Calendar unchanged.',flush=True)
