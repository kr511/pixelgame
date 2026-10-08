"""Check free hugs, holding hands and collision-aware companionship via UI."""
import importlib.util
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('legacy_ui', ROOT / 'legacy-check.py')
qa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)
report = {'checks': [], 'positions': [], 'errors': []}

def point(locator):
    return locator.evaluate('(e)=>({x:Number(e.dataset.x),y:Number(e.dataset.y)})')

if __name__ == '__main__':
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
            context, page = qa.start_page(browser, 'home')
            page.on('pageerror', lambda e: report['errors'].append(str(e)))
            for choice, kind in [('Umarmen', 'hug'), ('Hand geben', 'handhold')]:
                before = qa.saved(page)['clock']['minute']
                qa.interact(page)
                qa.dialogue(page, choice=choice, speaker='Elias')
                effect = page.locator('[data-testid=story-animation]')
                assert effect.get_attribute('data-animation') == kind
                assert qa.saved(page)['clock']['minute'] == before + 10
                effect.wait_for(state='detached')
                report['checks'].append(choice + ' animates and advances only the active game clock')
            qa.interact(page)
            qa.dialogue(page, choice='Gemeinsam spazieren', speaker='Elias')
            qa.walk(page, .5, .86)
            qa.interact(page)
            page.wait_for_function("document.querySelector('main').dataset.scene==='garden'")
            assert page.locator('[data-entity=elias-guest]').count() == 1
            assert page.locator('.world-entity[aria-label=Elias]').count() == 1
            initial = point(page.locator('[data-entity=elias-guest]'))
            qa.walk(page, .5, .55)
            qa.walk(page, .60, .65)
            page.wait_for_timeout(1200)
            player = point(page.locator('[data-testid=felice-player]'))
            companion = point(page.locator('[data-entity=elias-guest]'))
            assert ((player['x']-companion['x'])**2+(player['y']-companion['y'])**2)**.5 < .12, (player, companion)
            assert companion != initial
            report['positions'].append({'player': player, 'companion': companion})
            qa.screenshot(page, 'elias-companion')
            report['checks'].append('Elias follows actual walking inputs through the house door into the garden without duplicate actors')
            qa.interact(page)
            qa.dialogue(page, choice='Spaziergang beenden', speaker='Elias')
            stopped = point(page.locator('[data-entity=elias-guest]'))
            page.wait_for_timeout(450)
            assert point(page.locator('[data-entity=elias-guest]')) == stopped
            report['checks'].append('Companionship ends through the dialogue choice')
            assert not report['errors'] and not qa.report['pageErrors']
            context.close()
            browser.close()
    finally:
        (ROOT / 'affection-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
