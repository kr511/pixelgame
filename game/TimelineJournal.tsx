import { STORY_END, STORY_EVENTS, STORY_START, eventStatus, historicalDate, nextEvent, type StoryEvent, type TimelineSave } from "./timeline";
import { RadegastPasture } from "./StoryWorldArt";

export function TimelineJournal({ save, busyId, draftActive, onSelect, onJump, onDraft, onCalendarEnd }: {
  save: TimelineSave; busyId?: string; draftActive: boolean; onSelect: (id: string) => void; onJump: () => void; onDraft: (event: StoryEvent) => void; onCalendarEnd: () => void;
}) {
  const next = nextEvent(save);
  const dated = STORY_EVENTS.filter(event => event.confirmed && event.date);
  const completed = dated.filter(event => save.progress[event.id]?.completedAt).length;
  return <>
    <section className="story-calendar" aria-label="Story-Kalender"><div><small>DER ZEITRAUM EURER GESCHICHTE</small><p>{historicalDate(STORY_START)} <span>—</span> {historicalDate(STORY_END)}</p><strong>{completed} von {dated.length} datierten Erinnerungen bewahrt</strong><progress value={completed} max={dated.length} aria-label="Story-Fortschritt"/></div><div className="calendar-next"><small>{next ? "ALS NÄCHSTES" : "KAPITEL 1 BEWAHRT"}</small><p>{next ? `${historicalDate(next.date)} · ${next.title}` : "Die übrigen Geschichten warten auf eure bestätigten Angaben."}</p>{next ? <button className="memory-primary" disabled={Boolean(busyId) || draftActive} onClick={eventStatus(save, next) === "verfügbar" ? () => onSelect(next.id) : onJump}>{eventStatus(save, next) === "verfügbar" ? "Nächste Erinnerung erleben" : "Zeit bis dahin weiterblättern"} →</button> : save.clock.date < STORY_END && <button className="memory-primary" disabled={Boolean(busyId) || draftActive} onClick={onCalendarEnd}>Zum 02.11.2026 weiterblättern →</button>}</div></section>
    <div className="story-section-heading"><small>KAPITEL 1</small><h2>Der Anfang</h2><p>Unsere Gespräche · 13.–24. November 2025<br/>Eine spielerische Einteilung der gemeinsamen Abende; die Originalnachrichten liegen nicht vor.</p></div>
    <div className="timeline-grid">{dated.map(event => {
      const status = eventStatus(save, event), active = busyId === event.id;
      return <article className={`timeline-card status-${status}${event.special ? " special-memory" : ""}`} key={event.id} data-event-id={event.id} data-status={status}>
        <div className="timeline-cover">{event.illustration === "pasture" ? <RadegastPasture preview/> : <div style={{ backgroundImage: `url(${event.illustration})` }}/>}<span aria-hidden="true">{event.special ? "♥" : event.scene === "encounter" ? "▦" : "☾"}</span><small>{status === "abgeschlossen" ? "✓ Abgeschlossen" : status === "verfügbar" ? "✦ Verfügbar" : "Gesperrt"}</small></div>
        <div className="timeline-card-body"><time dateTime={event.date ?? undefined}>{historicalDate(event.date)}</time><h3>{event.title}</h3><p>{event.description}</p><button disabled={status === "gesperrt" || draftActive || Boolean(busyId && !active)} onClick={() => onSelect(event.id)}>{active ? "Weiterspielen" : status === "abgeschlossen" ? "Erneut erleben" : status === "verfügbar" ? "Erinnerung erleben" : "Noch nicht freigeschaltet"}<span>{status !== "gesperrt" ? "→" : "◇"}</span></button>{status === "gesperrt" && <small>{event.requires.length && !event.requires.every(id => save.progress[id]?.completedAt) ? "Erlebe zuerst die vorherige Geschichte." : "Blättere im Kalender bis zu diesem Abend."}</small>}</div>
      </article>;
    })}</div>
    <div className="story-section-heading"><small>WEITERE GESCHICHTEN</small><h2>Platz für das, was noch kommt</h2><p>Historische Daten und Abläufe sind noch offen. Die vorhandenen Szenen bleiben als fiktionalisierte Entwürfe erhalten.</p></div>
    <div className="timeline-grid future-grid">{STORY_EVENTS.filter(event => !event.confirmed).map(event => <article className="timeline-card future-memory" key={event.id} data-event-id={event.id} data-status={eventStatus(save,event)}><div className="timeline-cover"><div style={{ backgroundImage: `url(${event.illustration})` }}/><small>{eventStatus(save,event) === "abgeschlossen" ? "✓ Vorhandener Abschluss bewahrt" : "Gesperrt · Angaben offen"}</small></div><div className="timeline-card-body"><time>{event.period ? `${event.period} · Genaues Datum offen` : historicalDate(event.date)}</time><h3>{event.title}</h3><p>{event.description}</p><button disabled={Boolean(busyId) || draftActive} onClick={() => onDraft(event)}>{save.progress[event.id]?.completedAt ? "Szenenentwurf erneut erleben" : "Undatierten Szenenentwurf spielen"} <span>→</span></button></div></article>)}</div>
  </>;
}
