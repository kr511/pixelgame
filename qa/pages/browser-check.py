"""Test the built game on a strict static server under /pixelgame/.

Story completions come from UI interactions or the documented UI-earned year
save. Map-only fixtures install old-format starting locations, not completions.
"""
import importlib.util
import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[1]
URL = os.environ.get('GAME_URL', 'http://localhost:4174/pixelgame/')
os.environ['GAME_URL'] = URL
(ROOT / 'screenshots').mkdir(exist_ok=True)
spec = importlib.util.spec_from_file_location('year_ui', ROOT.parent / 'v09-year' / 'browser-check.py')
year = importlib.util.module_from_spec(spec)
spec.loader.exec_module(year)
spec = importlib.util.spec_from_file_location('legacy_ui', ROOT.parent / 'v09-year' / 'legacy-check.py')
legacy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy)
report = {'url': URL, 'checks': [], 'assets': [], 'pageErrors': [], 'networkFailures': []}
requests = set()

def record(text):
    report['checks'].append(text)
    print(text, flush=True)

def screenshot(page, name):
    page.screenshot(path=str(ROOT / 'screenshots' / f'{name}.png'))

year.screenshot = screenshot
legacy.screenshot = lambda page, name: screenshot(page, 'legacy-' + name)

def track(context):
    def response(value):
        parsed = urlparse(value.url)
        if parsed.netloc != urlparse(URL).netloc:
            report['networkFailures'].append('Unexpected external request: ' + value.url)
            return
        requests.add(parsed.path)
        if value.status >= 400:
            report['networkFailures'].append({'url': value.url, 'status': value.status})
        if not parsed.path.startswith('/pixelgame/'):
            report['networkFailures'].append('Asset outside repository path: ' + value.url)
    context.on('page', lambda page: page.on('pageerror', lambda e: report['pageErrors'].append(str(e))))
    context.on('response', response)
    context.on('requestfailed', lambda request: report['networkFailures'].append({'url': request.url, 'failure': request.failure}))

def start(context, place=None, date='2026-10-08', raw=None, touch=False):
    page = context.new_page()
    page.set_default_timeout(20000)
    page.goto(URL, wait_until='networkidle')
    if place:
        page.evaluate('([place,date])=>{localStorage.clear();localStorage.setItem("felice-elias.story.v05",JSON.stringify({version:1,chapter:null,step:0,completed:[],place,bag:[]}));localStorage.setItem("felice-elias.day.v061",JSON.stringify({version:1,date,minute:840,day:27,season:"Herbst"}));}', [place, date])
    elif raw:
        page.evaluate('([key,raw])=>localStorage.setItem(key,raw)', [year.KEY, raw])
    if place or raw:
        page.reload(wait_until='networkidle')
    year.tap(page.get_by_role('button', name='Welt betreten', exact=True), touch)
    year.close_album(page, touch)
    return page

if __name__ == '__main__':
    data = year.catalog()
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
            context = browser.new_context(viewport={'width':1366, 'height':900})
            track(context)
            page = start(context)
            assert year.saved(page)['clock']['date'] == '2025-11-01'
            beginning = next(e for e in data['events'] if e['id'] == 'beginning-2025-11-01')
            year.next_story(page, beginning)
            year.play(page, beginning, data['masks'], checkpoint=True)
            chat = next(e for e in data['events'] if e['scene'] == 'chat')
            year.next_story(page, chat)
            year.play(page, chat, data['masks'])
            earned = year.saved(page)
            assert earned['progress'][beginning['id']]['completedAt']
            assert earned['progress'][chat['id']]['completedAt']
            page.reload(wait_until='networkidle')
            page.get_by_role('button', name='Welt betreten', exact=True).click()
            year.close_album(page)
            assert year.saved(page) == earned
            record('Fresh static game: opening and interactive chat completed through UI; checkpoints, calendar and completions survive reload')
            screenshot(page, 'static-bedroom')
            context.close()

            code = "import { PLACES } from './game/story.ts'; console.log(JSON.stringify(Object.keys(PLACES)));"
            import subprocess
            places = json.loads(subprocess.check_output(['node', '--experimental-strip-types', '--input-type=module', '-e', code], cwd=PROJECT, text=True))
            context = browser.new_context(viewport={'width':1366, 'height':900})
            track(context)
            for place in places:
                page = start(context, place=place)
                assert page.locator('main').get_attribute('data-scene') == place
                sources = page.locator('.scene-backdrop image,.character-art image').evaluate_all("nodes=>nodes.map(n=>n.getAttribute('href'))")
                assert sources and all(source.startswith('/pixelgame/') for source in sources), (place, sources)
                if place in ('school', 'christmasmarket', 'eliasroom', 'playground'):
                    screenshot(page, 'static-' + place)
                page.close()
            for place in ('garden', 'home', 'playground'):
                page = start(context, place=place, date='2025-12-06')
                assert year.saved(page)['clock']['season'] == 'Winter'
                assert 'winter' in page.locator('.scene-backdrop image').first.get_attribute('href')
                page.close()
            record('All 15 connected maps, character atlases and three winter variants render with repository-prefixed asset URLs')
            context.close()

            raw = (ROOT.parent / 'v09-year' / 'final-save.json').read_text()
            original = json.loads(raw)
            context = browser.new_context(viewport={'width':844, 'height':390}, has_touch=True, is_mobile=True)
            track(context)
            page = start(context, raw=raw, touch=True)
            year.tap(page.locator('.world-phone-button'), True)
            year.tap(page.get_by_role('tab', name=re.compile('Kalender')), True)
            page.locator('.phone-chapter-calendar').wait_for(state='visible')
            assert page.locator('.phone-chapter-calendar li').count() == 8
            year.tap(page.get_by_role('tab', name=re.compile('Erinnerungen')), True)
            assert page.locator('.phone-memory-card').count() == 38
            page.wait_for_load_state('networkidle')
            year.tap(page.get_by_role('button', name='Handy schließen', exact=True), True)
            for event_id in ('radegast-chocolate', 'first-i-love-you'):
                year.tap(page.get_by_role('button', name='Erinnerungsbuch öffnen', exact=True), True)
                year.tap(page.locator(f'[data-event-id="{event_id}"] .memory-play-button'), True)
                event = next(e for e in data['events'] if e['id'] == event_id)
                year.play(page, event, data['masks'], True)
                result = year.saved(page)
                assert result['clock'] == original['clock']
                assert result['progress'][event_id]['completedAt'] == original['progress'][event_id]['completedAt']
                assert result['progress'][event_id]['visits'] == original['progress'][event_id]['visits'] + 1
            assert page.evaluate('document.body.scrollWidth <= innerWidth')
            record('Touch phone calendar, 38 memories, bicycle encounter and love-chat replays work and preserve actual clock and first completion')
            context.close()

            # Existing shooting uses SVG image hrefs and a CSS photo background.
            original_context = browser.new_context
            def tracked_context(**options):
                context = original_context(**options)
                track(context)
                return context
            browser.new_context = tracked_context
            legacy.shooting(browser)
            record('Preserved shooting memory: nine shots, SVG background, medal, saved score and reload work on static hosting')
            browser.close()
        assert not year.errors and not legacy.report['pageErrors']
        assert not report['pageErrors'] and not report['networkFailures'], report
        record('No server API calls, missing assets or JavaScript page errors on a strict static server')
    finally:
        report['assets'] = sorted(requests)
        (ROOT / 'evidence.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
