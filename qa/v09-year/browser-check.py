"""Play the year through its real UI; no mainline completion seeding is allowed."""
import heapq
import importlib.util
import json
import os
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[1]
URL = os.environ.get('GAME_URL', 'http://localhost:5173/')
(ROOT / 'screenshots').mkdir(exist_ok=True)
KEY = 'felice-elias.timeline.v09'
GRID = .015
spec = importlib.util.spec_from_file_location('prior_ui_helpers', ROOT.parent / 'v09' / 'browser-check.py')
prior = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prior)
PRECISE_WALK = prior.WALK.replace('Math.hypot(dx,dy)<.012', 'Math.hypot(dx,dy)<.004').replace('Math.abs(dx)>.008', 'Math.abs(dx)>.002').replace('Math.abs(dy)>.008', 'Math.abs(dy)>.002')
errors = []
evidence = {'events': [], 'portraits': [], 'checks': [], 'screenshots': []}


def catalog():
    """Read-only configuration and collision mask; this never changes game state."""
    code = """
    import { STORY_EVENTS, STORY_CHAPTERS } from './game/timeline.ts';
    import { PLACES, storyCanWalk } from './game/story.ts';
    const masks={};
    for (const place of Object.keys(PLACES)) {
      masks[place]=[];
      for(let y=0;y<=1.00001;y+=.015) {
        const row=[];
        for(let x=0;x<=1.00001;x+=.015) row.push([-.015,0,.015].every(dx=>[-.015,0,.015].every(dy=>storyCanWalk(place,x+dx,y+dy,{pasture:place==='radegast'}))));
        masks[place].push(row);
      }
    }
    process.stdout.write(JSON.stringify({events:STORY_EVENTS,chapters:STORY_CHAPTERS,masks}));
    """
    result = subprocess.run(['node', '--experimental-strip-types', '--input-type=module', '-e', code], cwd=PROJECT, capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def saved(page):
    return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))', KEY)


def record(label):
    evidence['checks'].append(label)
    print(label, flush=True)


def screenshot(page, name):
    page.screenshot(path=str(ROOT / 'screenshots' / f'{name}.png'))
    evidence['screenshots'].append(name)


def tracked_page(context, resume_raw=None):
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL, wait_until='networkidle')
    if resume_raw:
        page.evaluate('([key,raw])=>localStorage.setItem(key,raw)',[KEY,resume_raw])
        page.reload(wait_until='networkidle')
    page.get_by_role('button', name='Welt betreten', exact=True).click()
    return page


def tap(locator, touch=False):
    locator.tap() if touch else locator.click()


def close_album(page, touch=False):
    button = page.get_by_role('button', name='Erinnerungsbuch schließen', exact=True)
    if button.count() and button.is_visible():
        tap(button, touch)


def collect_portraits(page):
    found = page.locator('[data-emotion][data-character]').evaluate_all("nodes=>nodes.filter(n=>n.getBoundingClientRect().width>0).map(n=>({character:n.dataset.character,emotion:n.dataset.emotion,markup:n.innerHTML}))")
    for portrait in found:
        if not any(existing['character'] == portrait['character'] and existing['emotion'] == portrait['emotion'] for existing in evidence['portraits']):
            evidence['portraits'].append(portrait)


def dialogue_locator(page):
    return page.locator('[data-testid=dialogue-box]').first


def finish_dialogue(page, touch=False, keyboard=True):
    dialog = dialogue_locator(page)
    if not dialog.count() or not dialog.is_visible():
        return
    assert page.locator('dialog[open]').count() == 1, 'Overlapping native dialogs'
    before = page.locator('[data-testid="felice-player"]').evaluate('(e)=>[e.dataset.x,e.dataset.y]')
    collect_portraits(page)
    body = page.locator('[data-testid="dialogue-text"]')
    if body.get_attribute('data-complete') != 'true':
        page.keyboard.press('Enter') if keyboard and not touch else tap(body, touch)
        page.wait_for_function("document.querySelector('[data-testid=dialogue-text]').dataset.complete==='true'")
    assert page.locator('[data-testid="felice-player"]').evaluate('(e)=>[e.dataset.x,e.dataset.y]') == before, 'Movement continued during dialogue'
    choice = page.locator('[data-testid="dialogue-choice"]').first
    if choice.count() and choice.is_visible():
        tap(choice, touch)
    elif keyboard and not touch:
        body.focus()
        page.keyboard.press('Space')
    else:
        tap(page.locator('[data-testid="dialogue-next"]').first, touch)
    page.wait_for_timeout(80)


def precise_walk_touch(page, x, y):
    joy = page.locator('.joystick').bounding_box()
    cx, cy = joy['x'] + joy['width']/2, joy['y'] + joy['height']/2
    cdp = page.context.new_cdp_session(page)
    cdp.send('Input.dispatchTouchEvent', {'type':'touchStart', 'touchPoints':[{'x':cx,'y':cy}]})
    try:
        for _ in range(300):
            position = page.locator('[data-testid="felice-player"]').evaluate('(e)=>[Number(e.dataset.x),Number(e.dataset.y)]')
            dx, dy = x-position[0], y-position[1]
            distance = (dx*dx + dy*dy)**.5
            if distance < .004:
                return
            strength = min(30, distance*1500)
            cdp.send('Input.dispatchTouchEvent', {'type':'touchMove', 'touchPoints':[{'x':cx+dx/distance*strength,'y':cy+dy/distance*strength}]})
            page.wait_for_timeout(40)
        raise AssertionError(f'Touch walk blocked at {position}, target {(x,y)}')
    finally:
        cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
        cdp.detach()


def walk_path(page, target, masks, touch=False, radius=.065):
    """A* chooses collision-safe approaches; only actual input moves Felice."""
    position = page.locator('[data-testid="felice-player"]').evaluate('(e)=>[Number(e.dataset.x),Number(e.dataset.y)]')
    if ((position[0] - target[0])**2 + (position[1] - target[1])**2)**.5 < radius:
        return
    place = page.locator('main').get_attribute('data-scene')
    mask = masks[place]
    height, width = len(mask), len(mask[0])
    candidates = [(x, y) for y in range(height) for x in range(width) if mask[y][x]]
    start = min(candidates, key=lambda p: (p[0]*GRID-position[0])**2 + (p[1]*GRID-position[1])**2)
    goals = {p for p in candidates if ((p[0]*GRID-target[0])**2 + (p[1]*GRID-target[1])**2)**.5 < radius}
    assert goals, f'No walkable approach to target {target} in {place}'
    queue = [(0, start)]
    costs, previous = {start: 0}, {}
    while queue:
        _, point = heapq.heappop(queue)
        if point in goals:
            path = [point]
            while path[-1] != start:
                path.append(previous[path[-1]])
            path.reverse()
            break
        for dx, dy in [(1,0),(-1,0),(0,1),(0,-1)]:
            neighbor = point[0]+dx, point[1]+dy
            x, y = neighbor
            if not (0 <= x < width and 0 <= y < height and mask[y][x]):
                continue
            if dx and dy and not (mask[point[1]][x] and mask[y][point[0]]):
                continue
            cost = costs[point] + (1.415 if dx and dy else 1)
            if cost >= costs.get(neighbor, float('inf')):
                continue
            costs[neighbor], previous[neighbor] = cost, point
            heuristic = ((x*GRID-target[0])**2+(y*GRID-target[1])**2)**.5 / GRID
            heapq.heappush(queue, (cost+heuristic, neighbor))
    else:
        raise AssertionError(f'Unreachable target {target} in {place}, Felice at {position}')
    # Adjacent nodes on a straight corridor share a safe direction. Fewer input
    # changes also keep the touch test close to how a player uses the joystick.
    waypoints = [[path[0][0]*GRID, path[0][1]*GRID]]
    for i, point in enumerate(path):
        if i == len(path)-1 or i and (point[0]-path[i-1][0],point[1]-path[i-1][1]) != (path[i+1][0]-point[0],path[i+1][1]-point[1]):
            waypoints.append([point[0]*GRID, point[1]*GRID])
    for waypoint in waypoints:
        if touch:
            precise_walk_touch(page, *waypoint)
        else:
            page.evaluate(PRECISE_WALK, waypoint)


def sit_phone(page, masks, touch=False):
    walk_path(page, [.60, .395], masks, touch, .025)
    tap(page.locator('[data-testid="world-interact"]'), touch)
    page.wait_for_function("document.querySelector('[data-testid=felice-player]').dataset.restPhase==='resting'")
    tap(page.locator('.rest-actions .phone-open-button'), touch)
    page.locator('.story-phone').wait_for(state='visible')


def reveal_phone(page, touch=False):
    chat = page.locator('.phone-chat')
    if chat.count() and chat.is_visible():
        # Revelation does not send a response or complete the event.
        tap(chat, touch)
    collect_portraits(page)


def chat_episode(page, masks, touch=False):
    sit_phone(page, masks, touch)
    for index in (1, 4):
        reveal_phone(page, touch)
        tap(page.locator('.chat-topics button').nth(index), touch)
        for _ in range(30):
            reveal_phone(page, touch)
            response = page.get_by_role('button', name='Antwort senden', exact=True) if index == 1 else page.get_by_role('button', name='Gedanken stehen lassen', exact=True)
            if response.count() and response.is_enabled():
                tap(response, touch)
                break
            page.wait_for_timeout(150)
        else:
            raise AssertionError('Chat response never became usable')
    reveal_phone(page, touch)
    tap(page.get_by_role('button', name='Den Abend bewahren', exact=False), touch)
    page.locator('.story-phone').wait_for(state='detached')


def scripted_phone(page, masks, touch=False, checkpoint=False):
    sit_phone(page, masks, touch)
    event_id = page.locator('main').get_attribute('data-chapter')
    checkpoint_done = False
    for _ in range(120):
        reveal_phone(page, touch)
        end = page.get_by_role('button', name='Diesen Moment bewahren', exact=False)
        if end.count() and end.is_enabled():
            screenshot(page, 'mobile-'+event_id if touch else event_id)
            tap(end, touch)
            return
        send = page.locator('.script-send').first
        if not send.count():
            send = page.get_by_role('button', name='„Ich liebe dich.“ senden', exact=False)
        if send.count() and send.is_enabled():
            tap(send, touch)
            if checkpoint and not checkpoint_done:
                cursor = saved(page)['progress'][event_id]['cursor']
                page.reload(wait_until='networkidle')
                page.get_by_role('button', name='Welt betreten', exact=True).click()
                close_album(page, touch)
                assert saved(page)['active']['id'] == event_id
                assert saved(page)['progress'][event_id]['cursor'] == cursor
                sit_phone(page, masks, touch)
                checkpoint_done = True
        page.wait_for_timeout(150)
    raise AssertionError(f'Scripted phone scene did not complete: {event_id}')


def play_sequence(page, event, masks, touch=False, checkpoint=False):
    event_id = event['id']
    reloaded = False
    for _ in range(len(event.get('steps', [])) * 6 + 30):
        if page.locator('main').get_attribute('data-chapter') != event_id:
            return
        if dialogue_locator(page).count() and dialogue_locator(page).is_visible():
            finish_dialogue(page, touch)
            continue
        animation = page.locator('[data-testid=story-animation]')
        if animation.count() and animation.is_visible():
            if event_id in ('first-kiss-christmas', 'new-year-2026', 'our-story-finale'):
                screenshot(page, ('mobile-' if touch else '') + event_id + '-animation-' + str(saved(page)['progress'][event_id]['cursor']))
            animation.wait_for(state='detached', timeout=10000)
            continue
        marker = page.locator('[data-testid="story-target"]')
        marker.wait_for(state='visible')
        target = marker.evaluate('(e)=>[Number(e.dataset.x),Number(e.dataset.y)]')
        walk_path(page, target, masks, touch)
        tap(page.locator('[data-testid="world-interact"]'), touch)
        if dialogue_locator(page).count():
            collect_portraits(page)
            if event_id in ('first-kiss-christmas', 'new-year-2026', 'our-story-finale', 'school-first-feelings-17', 'first-valentine'):
                screenshot(page, ('mobile-' if touch else '') + event_id)
        finish_dialogue(page, touch)
        state = saved(page)
        if checkpoint and not reloaded and state['active'] and state['progress'][event_id]['cursor'] > 0:
            cursor = state['progress'][event_id]['cursor']
            clock = state['clock']
            page.reload(wait_until='networkidle')
            page.get_by_role('button', name='Welt betreten', exact=True).click()
            close_album(page, touch)
            assert saved(page)['active']['id'] == event_id
            assert saved(page)['progress'][event_id]['cursor'] == cursor
            assert saved(page)['clock'] == clock
            reloaded = True
    raise AssertionError(f'Sequence did not complete: {event_id}')


def play_encounter(page, touch=False):
    page.wait_for_function("document.querySelector('[data-testid=encounter-elias]').dataset.arriving==='false'")
    prior.walk_touch(page, .59, .63) if touch else page.evaluate(prior.WALK, [.59, .63])
    screenshot(page, 'mobile-chocolate' if touch else 'chocolate')
    for _ in range(8):
        if page.locator('main').get_attribute('data-chapter') != 'radegast-chocolate':
            return
        tap(page.locator('[data-testid="world-interact"]'), touch)
        finish_dialogue(page, touch)
    raise AssertionError('Chocolate encounter did not finish')


def next_story(page, event):
    close_album(page)
    for _ in range(6):
        if page.locator('main').get_attribute('data-chapter') == event['id']:
            return
        finish_dialogue(page)
        page.locator('.story-next-button').click()
        page.wait_for_timeout(100)
    raise AssertionError(f"Next event not launched: {event['id']}")


def play(page, event, masks, touch=False, checkpoint=False):
    scene = event['scene']
    if scene == 'chat':
        chat_episode(page, masks, touch)
    elif scene in ('confession', 'love', 'message'):
        scripted_phone(page, masks, touch, checkpoint)
    elif scene == 'encounter':
        play_encounter(page, touch)
    elif scene == 'sequence':
        play_sequence(page, event, masks, touch, checkpoint)
    else:
        raise AssertionError(f'Unsupported mainline scene: {scene}')


def expected_season(date):
    month = int(date[5:7])
    return 'Winter' if month in (12,1,2) else 'Frühling' if month in (3,4,5) else 'Sommer' if month in (6,7,8) else 'Herbst'


def full_run(browser, data):
    context = browser.new_context(viewport={'width':1366,'height':900})
    resume_file = os.environ.get('QA_RESUME_SAVE')
    resume_raw = Path(resume_file).read_text() if resume_file else None
    if resume_raw:
        checkpoint = json.loads(resume_raw)
        previous = json.loads((ROOT/'evidence.json').read_text())
        preserved_ids = {event_id for event_id,progress in checkpoint['progress'].items() if progress.get('completedAt')}
        evidence['events'] = [event for event in previous.get('events',[]) if event['id'] in preserved_ids]
        assert {event['id'] for event in evidence['events']} == preserved_ids, 'Resume requires evidence of every real UI completion'
        evidence['resumed_checkpoint'] = {'file':resume_file,'completed_events':len(preserved_ids),'active':checkpoint['active'],'generated_by_real_ui':True}
        record(f'Resumed the UI-generated checkpoint after {len(preserved_ids)} events; no completion was fabricated')
    page = tracked_page(context, resume_raw)
    if not resume_raw:
        assert saved(page)['clock']['date'] == '2025-11-01'
    events = [e for e in data['events'] if e['scene'] != 'legacy' and e.get('date') and e.get('chapterNumber')]
    assert {e['chapterNumber'] for e in events} == set(range(1,9))
    assert next(e for e in events if e['id']=='radegast-chocolate')['date'] == '2025-11-16'
    confession = next(e for e in events if e['scene']=='confession')
    assert confession['date']=='2025-11-24' and confession['staging']['start']==1040
    for index, event in enumerate(events):
        if resume_raw and saved(page)['progress'].get(event['id'],{}).get('completedAt'):
            continue
        next_story(page, event)
        state = saved(page)
        assert state['active']['id'] == event['id']
        assert state['clock']['date'] == event['date']
        assert state['clock']['season'] == expected_season(event['date'])
        if event['id'] == confession['id']:
            assert '17:20' in page.locator('.day-clock').inner_text()
        try:
            play(page, event, data['masks'], checkpoint=event['scene']=='sequence' and event['chapterNumber']==2 or event['id']==confession['id'])
        except Exception:
            screenshot(page, 'failure-'+event['id'])
            (ROOT/'failed-save.json').write_text(json.dumps(saved(page),ensure_ascii=False,indent=2))
            print(json.dumps({'failed':event['id'], 'state':saved(page), 'main':page.locator('main').evaluate('(e)=>e.dataset') if page.locator('main').count() else None, 'dialogs':page.locator('dialog[open]').count(), 'player':page.locator('[data-testid=felice-player]').evaluate('(e)=>e.dataset') if page.locator('[data-testid=felice-player]').count() else None},ensure_ascii=False),flush=True)
            raise
        state = saved(page)
        assert state['progress'][event['id']].get('completedAt'), event['id']
        assert state['progress'][event['id']]['visits'] == 1, 'Duplicate completion: '+event['id']
        assert state['active'] is None, event['id']
        assert state['clock']['season'] == expected_season(state['clock']['date'])
        evidence['events'].append({'id':event['id'],'date':event['date'],'chapter':event['chapterNumber'],'scene':event['scene'],'clock':state['clock']})
        record(f"{index+1}/{len(events)} completed {event['id']} ({event['date']})")
        (ROOT/'ui-checkpoint.json').write_text(json.dumps(state,ensure_ascii=False,indent=2))
        (ROOT/'evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2))
    assert saved(page)['clock']['date']=='2026-11-02'
    assert page.locator('.finale-curtain').is_visible()
    assert 'Unsere Geschichte ist noch lange nicht zu Ende. ❤️' in page.locator('.finale-curtain').inner_text()
    screenshot(page, 'finale-together')
    page.locator('.finale-curtain').wait_for(state='detached', timeout=10000)
    close_album(page)
    page.reload(wait_until='networkidle')
    page.get_by_role('button', name='Welt betreten', exact=True).click()
    page.get_by_role('button', name='Erinnerungsbuch öffnen', exact=True).click()
    assert page.locator('[data-chapter-number]').count() >= 8
    for event in events:
        card = page.locator(f'[data-event-id="{event["id"]}"]')
        assert card.get_attribute('data-status')=='abgeschlossen'
        if event.get('source') == 'staged':
            assert 'Inszenierung' in card.inner_text()
            if event.get('period'):
                assert event['period'] in card.inner_text()
        else:
            assert event['date'].split('-')[2]+'.'+event['date'].split('-')[1]+'.'+event['date'].split('-')[0] in card.inner_text()
            if event.get('until'):
                assert '.'.join(reversed(event['until'].split('-'))) in card.inner_text()
    for title in ('Ein persönlicher Brief von Elias', 'Die gefalteten Kraniche'):
        page.get_by_role('button', name=title, exact=False).click()
        assert page.locator('[data-testid=memory-artifact-description]').count() == 1
        page.get_by_role('button', name=title, exact=False).click()
    screenshot(page, 'year-album-completed')
    record('Fresh UI run: every event, all eight chapters, final date and reloaded album completed')
    raw = page.evaluate('(key)=>localStorage.getItem(key)', KEY)
    (ROOT/'final-save.json').write_text(raw)
    return context, page, raw, events


def replay_checks(browser, data, raw, events):
    context = browser.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
    page = context.new_page()
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(URL,wait_until='networkidle')
    page.evaluate('([key,value])=>localStorage.setItem(key,value)',[KEY,raw])
    page.reload(wait_until='networkidle')
    page.get_by_role('button', name='Welt betreten', exact=True).tap()
    original = saved(page)['clock']
    for scene in ('chat','encounter','confession','love','sequence'):
        event = next(e for e in events if e['scene']==scene and (scene != 'sequence' or e['chapterNumber']==2))
        page.get_by_role('button',name='Erinnerungsbuch öffnen',exact=True).tap()
        page.locator(f'[data-event-id="{event["id"]}"] .memory-play-button').tap()
        assert page.locator('main').get_attribute('data-replay')=='true'
        play(page,event,data['masks'],True)
        assert saved(page)['clock']==original
        assert saved(page)['progress'][event['id']]['visits']>=2
        assert page.evaluate('document.body.scrollWidth <= innerWidth')
        record(f"Touch replay preserves calendar: {event['id']}")
    phone_checks(page, touch=True)
    page.set_viewport_size({'width':390,'height':844})
    assert page.locator('.rotate-screen').is_visible()
    context.close()


def phone_checks(page, touch=False):
    close_album(page, touch)
    tap(page.locator('.world-phone-button'), touch)
    assert page.locator('dialog[open]').count() == 1
    tap(page.get_by_role('tab', name='Verlauf', exact=False), touch)
    assert page.locator('.phone-list .phone-event-row').count() >= 14
    tap(page.locator('.phone-list .phone-event-row').first, touch)
    assert page.locator('.phone-history-detail .chat-message').count() >= 6
    tap(page.get_by_role('tab', name='Kalender', exact=False), touch)
    assert page.locator('.phone-chapter-calendar li').count() == 8
    assert '02.11.2026' in page.locator('.phone-page').inner_text()
    tap(page.get_by_role('tab', name='Erinnerungen', exact=False), touch)
    assert page.locator('.phone-memory-card').count() >= 36
    tap(page.get_by_role('button', name='Das ganze Album öffnen', exact=False), touch)
    assert page.locator('.journal-modal').is_visible()
    assert page.locator('dialog[open]').count() == 1
    close_album(page, touch)
    record('Phone history, eight-chapter calendar, memory grid and album link are functional')


def migrate_old(browser):
    context = browser.new_context(viewport={'width':1366,'height':900})
    page = context.new_page(); page.goto(URL,wait_until='networkidle')
    ids = [f'chat-2025-11-{day}' for day in range(13,25)] + ['radegast-chocolate','first-i-love-you']
    progress = {event_id:{'cursor':2 if event_id=='first-i-love-you' else 4 if event_id=='radegast-chocolate' else 0,'topics':['space','collin'] if event_id.startswith('chat-') else [],'topic':None,'line':0,'visits':1,'completedAt':'2026-10-08T00:00:00Z'} for event_id in ids}
    old = {'version':1,'clock':{'version':1,'date':'2025-11-25','day':25,'minute':1210,'season':'Herbst'},'progress':progress,'active':None}
    page.evaluate('([key,value])=>localStorage.setItem(key,JSON.stringify(value))',[KEY,old])
    page.reload(wait_until='networkidle'); page.get_by_role('button',name='Welt betreten',exact=True).click()
    state = saved(page)
    for event_id in ids:
        assert state['progress'][event_id]['completedAt']==progress[event_id]['completedAt']
        assert state['progress'][event_id]['visits']==1
    assert state['clock']['date']=='2025-11-25'
    record('Version 1 migration preserves 14 existing completions and play clock; added events stay playable')
    context.close()


if __name__ == '__main__':
    data = catalog()
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
            context, page, raw, events = full_run(browser, data)
            replay_checks(browser, data, raw, events)
            migrate_old(browser)
            assert not errors, errors
            context.close(); browser.close()
            record('No JavaScript page errors during the UI runs')
    finally:
        evidence['errors']=errors
        # This is generated evidence, not a seeded game save.
        (ROOT/'evidence.json').write_text(json.dumps(evidence, ensure_ascii=False, indent=2))
