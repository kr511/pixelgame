"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterArt } from "./WorldArt";
import { worldAudio } from "./audio";
import { CHAT_TOPICS, chatTopicForEvent, historicalDate, type EventProgress, type StoryEvent } from "./timeline";

export function StoryPhone({ event, state, replay, blocked, paused, onPause, onChange, onClose, onComplete }: {
  event: StoryEvent; state: EventProgress; replay: boolean; blocked: boolean;
  paused: boolean; onPause: () => void; onChange: (state: EventProgress) => void; onClose: () => void; onComplete: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const love = event.scene === "love";
  const [hidden, setHidden] = useState(document.hidden);
  const topic = state.topic ? chatTopicForEvent(state.topic, event) : undefined;
  useEffect(() => { const change = () => setHidden(document.hidden); document.addEventListener("visibilitychange", change); return () => document.removeEventListener("visibilitychange", change); }, []);
  useEffect(() => { const node = ref.current; node?.showModal(); return () => node?.close(); }, []);
  useEffect(() => {
    if (blocked || hidden) return;
    const next = love && state.cursor === 0 ? { ...state, cursor: 1 } : love && state.cursor === 1 && state.line === 0 ? { ...state, line: 1 } : !love && state.topic && state.line === 1 ? { ...state, line: 2 } : null;
    if (!next) return;
    const timer = window.setTimeout(() => {
      if (document.hidden) return;
      onChange(next); worldAudio.play("interact");
    }, love && state.cursor === 1 ? 1600 : 1100);
    return () => window.clearTimeout(timer);
  }, [state, event, love, blocked, hidden, onChange]);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" }); }, [state]);

  const messages = love ? event.dialogue.slice(0, state.cursor) : [
    ...state.topics.flatMap(id => chatTopicForEvent(id, event)?.lines ?? []),
    ...(topic?.lines.slice(0, state.line) ?? []),
  ];
  const time = love ? "Ruhiger Abend" : state.topics.length === 0 ? "ca. 17:00" : state.topics.length === 1 ? "Im Laufe des Abends" : "Bis ungefähr 23:00";

  return <dialog ref={ref} className={`story-modal story-phone${love ? " love-phone" : ""}`} aria-label={`Handy · ${event.title}`} onCancel={e => { e.preventDefault(); onClose(); }}>
    <header className="phone-header"><span className="phone-portrait"><CharacterArt id="elias" portrait/></span><div><small>{replay ? "ERINNERUNG ERNEUT ERLEBEN" : "UNSERE NACHRICHTEN"}</small><h2>Elias <span className="online-dot" aria-hidden="true"/></h2><time dateTime={event.date ?? undefined}>{historicalDate(event.date)} · {time}</time></div><button className="phone-pause" aria-label={paused ? "Chat fortsetzen" : "Chat pausieren"} onClick={onPause}>{paused ? "▶" : "Ⅱ"}</button><button className="modal-close" aria-label="Handy schließen" onClick={onClose}>×</button></header>
    <p className="reconstruction-note">{love ? "Die beiden Liebesnachrichten sind bestätigt. Uhrzeit, Pausen und Inszenierung sind spielerisch ergänzt." : "Fiktionalisierte Rekonstruktion · Keine Originalnachrichten. Episodeneinteilung, Themenzuordnung und szenische Uhrzeiten sind ergänzt."}</p>
    <div className="phone-chat" ref={logRef} role="log" aria-live="polite" aria-label="Chat mit Elias">
      {!love && <p className="chat-narration">{event.dialogue[0]?.text}</p>}
      {messages.map((line, index) => <div className={`chat-message from-${line.speaker.toLowerCase()}`} key={`${index}-${line.text}`}><small>{line.speaker === "Erzählung" ? "ERZÄHLUNG" : line.speaker}</small><p>{line.text}</p>{line.speaker === "Felice" && <span className="chat-delivered" aria-label="Gesendet">✓</span>}</div>)}
      {(love && state.cursor === 0 || topic && state.line === 1) && <span className="chat-typing" role="status">Elias schreibt<span>· · ·</span></span>}
      {love && state.cursor >= 2 && <div className="love-moment" role="status"><span aria-hidden="true">♥</span><p>Zwei Nachrichten. Ein gemeinsamer Anfang.</p><div className="heart-particles" aria-hidden="true"><i>♥</i><i>♥</i><i>♥</i></div></div>}
    </div>
    <footer className="phone-composer">
      {love ? <>{state.cursor === 1 && <button className="memory-primary love-send" disabled={state.line === 0 || blocked} onClick={() => { worldAudio.play("complete"); onChange({ ...state, cursor: 2 }); }}>„Ich liebe dich.“ senden <span>↗</span></button>}{state.cursor >= 2 && <button className="memory-primary" disabled={blocked} onClick={onComplete}>Diesen Moment bewahren ♥</button>}{state.cursor === 0 && <p>Dein Handy leuchtet auf …</p>}</> : <>
        {topic ? <button className="memory-primary" disabled={state.line < 2 || blocked} onClick={() => onChange({ ...state, topics: [...state.topics, topic.id], topic: null, line: 0 })}>{state.line < 2 ? "Eine Nachricht kommt …" : topic.lines[2].speaker === "Erzählung" ? "Gedanken stehen lassen" : "Antwort senden"}</button> : <>
          <p>Worüber möchtest du schreiben? <span>{state.topics.length}/2 Themen für diesen Abend</span></p>
          <div className="chat-topics">{CHAT_TOPICS.map(topic => <button key={topic.id} disabled={state.topics.includes(topic.id) || blocked} aria-pressed={state.topics.includes(topic.id)} onClick={() => onChange({ ...state, topic: topic.id, line: 1 })}><span>{topic.icon}</span>{topic.title}{state.topics.includes(topic.id) && <small>✓</small>}</button>)}</div>
          {state.topics.length >= 2 && <button className="memory-primary" disabled={blocked} onClick={onComplete}>Den Abend bewahren <span>→</span></button>}
        </>}
      </>}
    </footer>
  </dialog>;
}
