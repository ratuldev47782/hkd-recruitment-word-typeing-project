'use client';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EN, XEN } from '../lib/text';

const PREFIX = 'hkd-typing:';
const W = /[^\s.,;:!?()"'\-]*$/;
const words = (s) => s.split(/[\s.,;:!?()"'\-]+/).filter((w) => w.length > 2);

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [caret, setCaret] = useState(0);
  const [start, setStart] = useState(null);
  const [now, setNow] = useState(0);
  const [err, setErr] = useState('');
  const ta = useRef(null), sel = useRef(null), dict = useRef(null);
  if (!dict.current) dict.current = new Set([...words(EN), ...XEN]);

  const cur = text.slice(0, caret).match(W)[0];
  const sugg = cur
    ? [...dict.current].filter((w) => w.length > cur.length && w.toLowerCase().startsWith(cur.toLowerCase()))
        .sort((a, b) => a.length - b.length).slice(0, 5)
    : [];

  useLayoutEffect(() => {
    const t = ta.current;
    if (sel.current != null) { t.setSelectionRange(sel.current, sel.current); sel.current = null; }
    setCaret(t.selectionStart);
  }, [text]);

  useEffect(() => {
    if (!start) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [start]);

  const begin = () => { if (!start) { setStart(Date.now()); setNow(Date.now()); } };
  const learn = () => { const t = ta.current; const w = t.value.slice(0, t.selectionStart).match(W)[0]; if (w.length > 2) dict.current.add(w); };

  function accept(w) {
    const t = ta.current, c = t.selectionStart, v = t.value, p = v.slice(0, c).match(W)[0];
    begin();
    sel.current = c - p.length + w.length + 1;
    setText(v.slice(0, c - p.length) + w + ' ' + v.slice(c));
    t.focus();
  }

  function onKeyDown(e) {
    if (e.key === 'Tab' && sugg.length) { e.preventDefault(); accept(sugg[0]); }
    else if (e.key === ' ' || e.key === 'Enter') learn();
  }

  function finish() {
    if (!name.trim()) { setErr('Enter the examinee name first.'); return; }
    setErr('');
    const ws = text.trim().split(/\s+/).filter(Boolean);
    const secs = start ? Math.max(1, (Date.now() - start) / 1000) : 0;
    const rw = EN.split(/\s+/);
    const correct = ws.filter((w, i) => w === rw[i]).length;
    const r = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(), date: new Date().toISOString(),
      words: ws.length, correct, secs: Math.round(secs),
      wpm: secs ? Math.round(ws.length / (secs / 60)) : 0,
      acc: ws.length ? Math.round((correct / ws.length) * 100) : 0,
    };
    try { localStorage.setItem(PREFIX + r.id, JSON.stringify(r)); } catch {}
    router.push('/result');
  }

  function reset() { setText(''); setStart(null); setNow(0); setName(''); setErr(''); }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const elapsed = start ? Math.floor((now - start) / 1000) : 0;

  return (
    <main className="wrap">
      <header>
        <img src="/HKD_LOGO.png" alt="HKD" width="56" height="56" />
        <div>
          <h1>HKD Outdoor Innovations Ltd.</h1>
          <p>MIS Department · Typing test</p>
        </div>
        <Link className="navlink" href="/result">Results</Link>
      </header>

      <section className="bar">
        <input placeholder="Examinee name" value={name} onChange={(e) => setName(e.target.value)} />
        <output className="timer">{fmt(elapsed)}</output>
      </section>
      {err && <p className="err" role="alert">{err}</p>}

      <section className="ref">{EN}</section>

      <textarea
        ref={ta} value={text} spellCheck={false}
        placeholder="Start typing here. The timer starts with your first key."
        onKeyDown={onKeyDown} onPaste={(e) => e.preventDefault()}
        onChange={(e) => { setText(e.target.value); setCaret(e.target.selectionStart); if (e.target.value) begin(); }}
      />

      <div className="sugg" aria-label="Word suggestions">
        {sugg.map((w, i) => (
          <button key={w} onMouseDown={(e) => e.preventDefault()} onClick={() => accept(w)}>
            {w}{i === 0 && <small> Tab</small>}
          </button>
        ))}
      </div>

      <div className="actions">
        <button className="finish" onClick={finish}>Finish</button>
        <button className="ghost" onClick={reset}>Restart</button>
      </div>
    </main>
  );
}
