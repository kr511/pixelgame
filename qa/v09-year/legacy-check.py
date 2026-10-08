"""Exercise preserved V0.8 mechanics through their actual V0.9 UI.

Only isolated old-format starting saves are installed. Story completions,
photographs, scores, resting, NPC poses and edited names come from UI actions.
"""
import importlib.util
import json
import os
import traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
URL = os.environ.get('GAME_URL', 'http://localhost:5173/')
KEY = 'felice-elias.timeline.v09'
spec = importlib.util.spec_from_file_location('year_helpers', ROOT / 'browser-check.py')
year = importlib.util.module_from_spec(spec)
spec.loader.exec_module(year)
report = {'url': URL, 'checks': [], 'failures': [], 'pageErrors': []}
MASKS = year.catalog()['masks']


def saved(page):
    return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))', KEY)


def start_page(browser, place='bedroom', touch=False):
    context = browser.new_context(viewport={'width': 844, 'height': 390} if touch else {'width': 1366, 'height': 900}, has_touch=touch, is_mobile=touch)
    page = context.new_page()
    page.set_default_timeout(20000)
    page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
    page.goto(URL, wait_until='networkidle')
    old_story = {'version': 1, 'chapter': None, 'step': 0, 'completed': [], 'place': place, 'bag': []}
    old_day = {'version': 1, 'date': '2026-10-08', 'day': 27, 'minute': 840, 'season': 'Herbst'}
    page.evaluate('([story,day])=>{localStorage.clear();localStorage.setItem("felice-elias.story.v05",JSON.stringify(story));localStorage.setItem("felice-elias.day.v061",JSON.stringify(day));}', [old_story, old_day])
    page.reload(wait_until='networkidle')
    page.get_by_role('button', name='Welt betreten', exact=True).click()
    year.close_album(page, touch)
    page.locator('.journal-modal').wait_for(state='detached')
    page.wait_for_timeout(250)
    assert page.locator('main').get_attribute('data-scene') == place
    return context, page


def open_album(page):
    page.get_by_role('button', name='Erinnerungsbuch öffnen', exact=True).click()
    page.locator('.journal-modal[open]').wait_for(state='visible')


def dialogue(page, choice=None, speaker=None):
    box = page.locator('[data-testid="dialogue-box"]')
    box.wait_for(state='visible')
    if speaker:
        assert box.locator('h2').inner_text() == speaker, f'Expected {speaker}, got {box.locator("h2").inner_text()}'
    assert page.locator('dialog[open]').count() == 1
    body = page.locator('[data-testid="dialogue-text"]')
    if body.get_attribute('data-complete') != 'true':
        body.click()
        page.wait_for_function("document.querySelector('[data-testid=dialogue-text]').dataset.complete==='true'")
    if choice:
        box.get_by_role('button', name=choice, exact=True).click()
    elif box.locator('[data-testid="dialogue-choice"]').count():
        box.locator('[data-testid="dialogue-choice"]').first.click()
    else:
        body.focus()
        page.keyboard.press('Enter')
    box.wait_for(state='detached')
    page.wait_for_timeout(120)


def walk(page, x, y, radius=.022):
    year.walk_path(page, [x, y], MASKS, radius=radius)


def interact(page):
    page.locator('[data-testid="world-interact"]').click()


def screenshot(page, name):
    page.screenshot(path=str(ROOT / 'screenshots' / f'legacy-{name}.png'))


def graduation(browser):
    context, page = start_page(browser)
    try:
        before = saved(page)['clock']
        open_album(page)
        page.locator('[data-event-id="legacy-graduation"] button').click()
        dialogue(page)
        assert page.locator('main').get_attribute('data-scene') == 'gym'
        assert saved(page)['clock'] == before
        assert page.locator('.daylight-shade').evaluate('(e)=>Number(e.style.opacity)') == 0
        speakers = [('Elias', .42, .76), ('Schulleiter', .42, .31), ('Bürgermeister', .60, .31), ('Felice & Elias', .52, .32), ('Paul', .35, .62), ('Justin', .64, .62)]
        for speaker, x, y in speakers:
            page.evaluate(year.prior.WALK, [x, y])
            interact(page)
            dialogue(page, speaker=speaker)
        page.evaluate(year.prior.WALK, [.55, .76])
        interact(page)
        photos = page.locator('[data-testid="graduation-photos"]')
        photos.wait_for(state='visible')
        assert photos.locator('.graduation-snapshot').count() == 3
        assert photos.locator('button').count() == 0
        assert float(page.locator('[data-testid="snapshot-white"]').evaluate('(e)=>e.style.opacity')) > 0
        page.wait_for_timeout(1100)
        page.keyboard.press('Escape')
        elapsed = photos.get_attribute('data-photo-time')
        page.wait_for_timeout(900)
        assert photos.get_attribute('data-photo-time') == elapsed
        page.keyboard.press('Escape')
        seen = set()
        gallery_saved = False
        for _ in range(65):
            index = page.evaluate("document.querySelector('[data-testid=graduation-photos]')?.dataset.photoIndex ?? null")
            if index is None:
                break
            seen.add(index)
            if index == '1' and not gallery_saved:
                screenshot(page, 'graduation-gallery')
                gallery_saved = True
            page.wait_for_timeout(180)
        assert seen == {'0', '1', '2'}, seen
        assert saved(page)['clock'] == before
        assert saved(page)['progress']['legacy-graduation']['visits'] == 1
        dialogue(page)
        assert page.locator('main').get_attribute('data-scene') == 'bedroom'
        assert 'graduation' in page.evaluate('JSON.parse(localStorage.getItem("felice-elias.story.v05")).completed')
        page.reload(wait_until='networkidle')
        page.get_by_role('button', name='Welt betreten', exact=True).click()
        year.close_album(page)
        assert saved(page)['clock'] == before
        assert saved(page)['progress']['legacy-graduation']['visits'] == 1
        open_album(page)
        card = page.locator('[data-event-id="legacy-graduation"]')
        assert card.get_attribute('data-status') == 'abgeschlossen'
        assert card.locator('time').inner_text() == 'Sommer 2026 · Genaues Datum offen'
        card.locator('button').click()
        dialogue(page)
        page.evaluate(year.prior.WALK, [.55, .76])
        interact(page)
        photos.wait_for(state='visible')
        photos.wait_for(state='detached', timeout=15000)
        assert saved(page)['clock'] == before
        assert saved(page)['progress']['legacy-graduation']['visits'] == 2
        page.get_by_role('button', name='Zurück in die Welt', exact=True).click()
        assert page.locator('main').get_attribute('data-scene') == 'bedroom'
    finally:
        context.close()


def shooting(browser):
    context, page = start_page(browser)
    try:
        before = saved(page)['clock']
        walk(page, .79, .52)
        interact(page)
        page.get_by_role('button', name='In Ruhe anfangen', exact=True).click()
        surface = page.locator('.range-surface')
        for index in range(9):
            point = page.locator(f'[data-testid="target-{index // 3 + 1}"]')
            # Use the actual target's first ring, respecting SVG screen transforms.
            center = point.locator('circle').first.evaluate('(circle)=>{const p=new DOMPoint(Number(circle.getAttribute("cx")),Number(circle.getAttribute("cy"))).matrixTransform(circle.getScreenCTM());return [p.x,p.y];}')
            page.mouse.click(*center)
            page.wait_for_timeout(485)
        page.locator('.memory-result').wait_for(state='visible')
        assert page.locator('.range-surface circle[fill="#191d1f"]').count() == 9
        score = int(page.locator('.memory-score').inner_text().split('/')[0].strip())
        assert 0 < score <= 90
        screenshot(page, 'shooting-result')
        page.get_by_role('button', name='Erinnerung mit nach Hause nehmen', exact=True).click()
        page.locator('[data-testid="shooting-memory"]').wait_for(state='detached')
        page.locator('[data-testid="shooting-medal"]').wait_for(state='visible')
        assert saved(page)['clock'] == before
        result = page.evaluate('JSON.parse(localStorage.getItem("felice-elias.memories.v1"))')
        assert result['memories']['goelzau-shooting']['bestScore'] == score
        assert result['memories']['goelzau-shooting']['visits'] == 1
        assert saved(page)['progress']['legacy-shooting']['visits'] == 1
        page.reload(wait_until='networkidle')
        page.get_by_role('button', name='Welt betreten', exact=True).click()
        year.close_album(page)
        assert page.locator('[data-testid="shooting-medal"]').is_visible()
        assert saved(page)['clock'] == before
    finally:
        context.close()


def names_and_patrol(browser):
    context, page = start_page(browser, 'school')
    try:
        before = page.locator('[data-entity="friends"]').evaluate('(e)=>[e.dataset.x,e.dataset.y]')
        moved = False
        for _ in range(30):
            page.wait_for_timeout(200)
            after = page.locator('[data-entity="friends"]').evaluate('(e)=>[e.dataset.x,e.dataset.y]')
            moved = moved or before != after
        assert moved, 'School NPC patrol is not moving'
        open_album(page)
        page.get_by_role('textbox', name='Name von Elena', exact=True).fill('Elena Testname')
        page.get_by_role('button', name='Name von Elena speichern', exact=True).click()
        page.get_by_role('combobox', name='Namensanzeige', exact=True).select_option('friends')
        saved_names = page.evaluate('JSON.parse(localStorage.getItem("felice-elias.names.v07"))')
        assert saved_names['names']['friends'] == 'Elena Testname'
        assert saved_names['visibility'] == 'friends'
        year.close_album(page)
        assert page.locator('[data-entity="friends"]').get_attribute('aria-label') == 'Elena Testname'
        page.reload(wait_until='networkidle')
        page.get_by_role('button', name='Welt betreten', exact=True).click()
        year.close_album(page)
        assert page.locator('[data-entity="friends"]').get_attribute('aria-label') == 'Elena Testname'
        open_album(page)
        assert page.get_by_role('combobox', name='Namensanzeige', exact=True).input_value() == 'friends'
        assert page.get_by_role('textbox', name='Name von Elena', exact=True).input_value() == 'Elena Testname'
        screenshot(page, 'names-preserved')
    finally:
        context.close()


def kitchen(browser):
    context, page = start_page(browser, 'kitchen')
    try:
        minute = saved(page)['clock']['minute']
        for title, x, y, effect in [('Frühstück vorbereiten', .535, .465, 'breakfast'), ('Warmes Getränk machen', .21, .33, 'warm-drink'), ('Küche aufräumen', .89, .48, 'tidy-kitchen')]:
            walk(page, x, y, radius=.015)
            interact(page)
            dialogue(page, choice=f'{title} · 10 Min.')
            minute += 10
            assert saved(page)['clock']['minute'] == minute
            assert page.locator(f'.kitchen-{effect}').is_visible()
        screenshot(page, 'kitchen-actions')
        # The kitchen's independent free-rest path starts in a separate save.
        context.close()
        context, page = start_page(browser, 'kitchen')
        page.evaluate(year.prior.WALK, [.7, .64])
        interact(page)
        page.wait_for_function("document.querySelector('[data-testid=felice-player]').dataset.restPhase==='resting'")
        assert page.locator('[data-testid="felice-player"]').get_attribute('data-pose') == 'sitting'
        page.get_by_role('button', name='Mit Elias sitzen', exact=True).click()
        page.wait_for_function("document.querySelector('[data-testid=seated-elias]')?.dataset.pose==='sitting'", timeout=25000)
        screenshot(page, 'kitchen-seated-together')
        interact(page)
        page.wait_for_function("document.querySelector('[data-testid=felice-player]').dataset.restPhase==='none'")
    finally:
        context.close()


def bed_rest(browser):
    context, page = start_page(browser)
    try:
        walk(page, .40, .49)
        interact(page)
        page.wait_for_function("document.querySelector('[data-testid=felice-player]').dataset.restPhase==='resting'")
        assert page.locator('[data-testid="felice-player"]').get_attribute('data-pose') == 'sitting'
        page.get_by_role('button', name='Mit Elias sitzen', exact=True).click()
        page.wait_for_function("document.querySelector('[data-testid=seated-elias]')?.dataset.pose==='sitting'", timeout=25000)
        screenshot(page, 'bed-edge-together')
        interact(page)
        page.wait_for_function("document.querySelector('[data-testid=felice-player]').dataset.restPhase==='none'")
        walk(page, .30, .49)
        interact(page)
        page.wait_for_function("document.querySelector('[data-testid=felice-player]').dataset.pose==='lying'")
        page.wait_for_function("document.querySelector('[data-testid=felice-player]').dataset.restPhase==='resting'")
        assert 'Du liegst wach im Bett' in page.locator('.rest-actions').inner_text()
        assert not page.get_by_role('button', name='Mit Elias sitzen', exact=True).count()
        screenshot(page, 'bed-under-duvet')
        interact(page)
        page.wait_for_function("document.querySelector('[data-testid=felice-player]').dataset.restPhase==='none'")
    finally:
        context.close()


def draft_returns(browser):
    for chapter, target in [('dog', [.58, .53]), ('christmas', [.485, .49]), ('school', [.39, .48])]:
        context, page = start_page(browser)
        try:
            clock = saved(page)['clock']
            origin = page.locator('[data-testid="felice-player"]').evaluate('(e)=>[e.dataset.x,e.dataset.y]')
            open_album(page)
            card = page.locator(f'[data-event-id="legacy-{chapter}"]')
            assert 'offen' in card.locator('time').inner_text().lower()
            card.locator('button').click()
            dialogue(page)
            walk(page, *target, radius=.012)
            interact(page)
            dialogue(page)
            assert saved(page)['clock'] == clock
            page.get_by_role('button', name='Zurück in die Welt', exact=True).click()
            assert page.locator('main').get_attribute('data-scene') == 'bedroom'
            assert page.locator('[data-testid="felice-player"]').evaluate('(e)=>[e.dataset.x,e.dataset.y]') == origin
            assert saved(page)['clock'] == clock
        finally:
            context.close()


if __name__ == '__main__':
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
        for name, check in [('graduation gallery, pause, completion, reload and replay', graduation), ('nine shots, medal and durable score', shooting), ('NPC patrol, name editing and durable visibility mode', names_and_patrol), ('three kitchen actions and sitting with Elias', kitchen), ('bed edge sitting, Elias, lying and standing', bed_rest), ('undated dog/Christmas/school draft return and clock separation', draft_returns)]:
            try:
                check(browser)
                report['checks'].append(name)
                print('PASS:', name, flush=True)
            except Exception as error:
                report['failures'].append({'check': name, 'error': str(error), 'traceback': traceback.format_exc()})
                print('FAIL:', name, traceback.format_exc(), flush=True)
        browser.close()
    (ROOT / 'legacy-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    assert not report['failures'], report['failures']
    assert not report['pageErrors'], report['pageErrors']
