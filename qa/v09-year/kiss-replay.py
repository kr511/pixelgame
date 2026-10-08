"""Replay the UI-earned Christmas memory to check the final CSS kiss poses."""
import importlib.util
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('year_ui',ROOT/'browser-check.py')
qa=importlib.util.module_from_spec(spec);spec.loader.exec_module(qa)
pose_evidence=[]
original_screenshot=qa.screenshot

def screenshot(page,name):
    effect=page.locator('[data-testid=story-animation]')
    if effect.count() and effect.get_attribute('data-animation')=='kiss':
        page.wait_for_timeout(1750)
        pose=page.locator('[data-testid=felice-player] .character-art,[data-testid=story-elias] .character-art').evaluate_all("nodes=>nodes.map(e=>({animation:getComputedStyle(e).animationName,transform:getComputedStyle(e).transform,rect:e.getBoundingClientRect().toJSON()}))")
        assert len(pose)==2,pose
        assert all('kiss' in item['animation'] and item['transform']!='none' for item in pose),pose
        rotations={item['animation']:float(re.findall(r'-?\d+(?:\.\d+)?',item['transform'])[1]) for item in pose}
        assert rotations['pixel-kiss-felice']>0 and rotations['pixel-kiss-elias']<0, ('Heads must lean toward each other',pose)
        pose_evidence.append({'viewport':page.viewport_size,'poses':pose})
        name+='-lean-close'
    original_screenshot(page,name)
qa.screenshot=screenshot

if __name__=='__main__':
    raw=(ROOT/'final-save.json').read_text()
    data=qa.catalog()
    event=next(e for e in data['events'] if e['id']=='first-kiss-christmas')
    original=json.loads(raw)
    assert sum(bool(p.get('completedAt')) for p in original['progress'].values())==38
    try:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
            for touch in (False,True):
                context=browser.new_context(viewport={'width':844,'height':390} if touch else {'width':1366,'height':900},has_touch=touch,is_mobile=touch)
                page=qa.tracked_page(context,raw)
                qa.tap(page.get_by_role('button',name='Erinnerungsbuch öffnen',exact=True),touch)
                qa.tap(page.locator('[data-event-id="first-kiss-christmas"] .memory-play-button'),touch)
                qa.play(page,event,data['masks'],touch)
                result=qa.saved(page)
                assert result['clock']==original['clock']
                assert result['progress'][event['id']]['visits']==original['progress'][event['id']]['visits']+1
                assert result['progress'][event['id']]['completedAt']==original['progress'][event['id']]['completedAt']
                assert page.evaluate('document.body.scrollWidth <= innerWidth')
                qa.record(('Touch' if touch else 'Desktop')+' earned Christmas replay preserves clock and first completion; both sprites lean for the kiss')
                context.close()
            assert len(pose_evidence)==2,pose_evidence
            assert not qa.errors,qa.errors
            browser.close()
    finally:
        (ROOT/'kiss-evidence.json').write_text(json.dumps({'poses':pose_evidence,'checks':qa.evidence['checks'],'screenshots':qa.evidence['screenshots'],'errors':qa.errors},ensure_ascii=False,indent=2))
