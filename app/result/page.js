'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PREFIX = 'hkd-typing:';
const PIN = '1234'; // ei PIN ta apnar moto change korun

function loadResults() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith(PREFIX)) { try { out.push(JSON.parse(localStorage.getItem(k))); } catch {} }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export default function ResultPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState(false);
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const all = loadResults();
    setLatest(all[0] || null);
    setHistory(all);
    setReady(true);
  }, []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  function submitPin() {
    if (pin === PIN) { setUnlocked(true); setPinErr(false); }
    else { setPinErr(true); setPin(''); }
  }

  function remove(id, name) {
    if (!window.confirm(`Delete result for ${name}?`)) return;
    localStorage.removeItem(PREFIX + id);
    const all = loadResults();
    setLatest(all[0] || null);
    setHistory(all);
  }

  function clearAll() {
    if (!window.confirm('Delete ALL saved results?')) return;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) localStorage.removeItem(k);
    }
    setLatest(null);
    setHistory([]);
  }

  if (!unlocked) {
    return (
      <main className="wrap">
        <header>
          <img src="/HKD_LOGO.png" alt="HKD" width="56" height="56" />
          <div>
            <h1>HKD Outdoor Innovations Ltd.</h1>
            <p>MIS Department · Examiner access</p>
          </div>
        </header>
        <section className="card">
          <h2>Enter PIN</h2>
          <div className="btnrow" style={{ margin: '16px 0' }}>
            <input
              type="password" inputMode="numeric" placeholder="PIN" value={pin} autoFocus
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitPin(); }}
            />
            <button className="finish" onClick={submitPin}>Unlock</button>
          </div>
          {pinErr && <p className="err" role="alert">Wrong PIN. Try again.</p>}
          <Link className="navlink" href="/">Back to test</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="wrap">
      <header>
        <img src="/HKD_LOGO.png" alt="HKD" width="56" height="56" />
        <div>
          <h1>HKD Outdoor Innovations Ltd.</h1>
          <p>MIS Department · Saved results</p>
        </div>
      </header>

      {!ready ? null : !latest ? (
        <section className="card">
          <h2>No result yet</h2>
          <p className="hint" style={{ margin: '12px 0 20px' }}>Take the typing test to see results here.</p>
          <Link className="finish" href="/">Go to test</Link>
        </section>
      ) : (
        <section className="card">
          <h2>{latest.name}</h2>
          <div className="big">{latest.wpm}<span> words/min</span></div>
          <dl>
            <dt>Words typed</dt><dd>{latest.words}</dd>
            <dt>Correct words</dt><dd>{latest.correct} ({latest.acc}%)</dd>
            <dt>Time</dt><dd>{fmt(latest.secs)}</dd>
            <dt>Saved</dt><dd>{new Date(latest.date).toLocaleString()}</dd>
          </dl>
          <div className="btnrow">
            <button className="finish" onClick={() => router.push('/')}>New examinee</button>
            <button className="del" onClick={() => remove(latest.id, latest.name)}>Delete this result</button>
          </div>
        </section>
      )}

      <section className="hist">
        <div className="hist-head">
          <h2>Saved results</h2>
          {history.length > 0 && <button className="del" onClick={clearAll}>Clear all</button>}
        </div>
        {history.length === 0 ? <p className="hint">No results saved yet.</p> : (
          <div className="scroll">
            <table>
              <thead><tr><th>Name</th><th>Date &amp; time</th><th>WPM</th><th>Words</th><th>Accuracy</th><th>Time</th><th>Action</th></tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{h.name}</td><td>{new Date(h.date).toLocaleString()}</td>
                    <td><b>{h.wpm}</b></td><td>{h.words}</td><td>{h.acc}%</td><td>{fmt(h.secs)}</td>
                    <td><button className="del" onClick={() => remove(h.id, h.name)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}