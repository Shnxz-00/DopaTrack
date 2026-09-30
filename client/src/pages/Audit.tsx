import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowDownWideNarrow, ArrowRight, ArrowUpRight, Heart, Plus, Sparkles, Trash2 } from "lucide-react";
import { Link } from "wouter";
import Reveal from "@/components/Reveal";
import { SiteFrame } from "@/components/SiteChrome";
import { newLocalId, readableDate, useLocalState, type AuditEntry } from "@/lib/localState";

type SortMode = "recent" | "worst" | "best";
function scoreLabel(score: number) {
  if (score <= 2) return "Takes a lot from me";
  if (score <= 4) return "Leans draining";
  if (score === 5) return "About neutral";
  if (score <= 7) return "Leans nourishing";
  return "Genuinely good for me";
}
function scoreTone(score: number) {
  if (score <= 3) return "score-costly";
  if (score <= 5) return "score-neutral";
  return "score-helpful";
}

export default function Audit() {
  const [items, setItems] = useLocalState<AuditEntry[]>("dopa:audit", []);
  const [name, setName] = useState("");
  const [score, setScore] = useState(5);
  const [tip, setTip] = useState("");
  const [sort, setSort] = useState<SortMode>("recent");
  const [status, setStatus] = useState("");
  const rangeStyle = { "--range-progress": `${score * 10}%` } as CSSProperties;
  const sorted = useMemo(() => {
    const next = [...items];
    if (sort === "worst") return next.sort((a, b) => a.score - b.score || b.createdAt - a.createdAt);
    if (sort === "best") return next.sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);
    return next.sort((a, b) => b.createdAt - a.createdAt);
  }, [items, sort]);
  const average = items.length ? items.reduce((sum, item) => sum + item.score, 0) / items.length : 0;
  const mostHelpful = items.filter(item => item.score > 6).sort((a, b) => b.score - a.score)[0];
  const mostCostly = items.filter(item => item.score < 5).sort((a, b) => a.score - b.score)[0];
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = name.trim();
    if (!value) return;
    setItems(current => [{ id: newLocalId(), name: value, score, tip: tip.trim(), createdAt: Date.now() }, ...current]);
    setName(""); setTip(""); setScore(5);
    setStatus(`“${value}” added to your private inventory.`);
  };
  const remove = (id: string) => setItems(current => current.filter(item => item.id !== id));
  const summary = items.length === 0
    ? "After a few honest notes, a pattern might start to show. No verdicts—just a little more information."
    : mostHelpful
      ? `A bright spot: ${mostHelpful.name} feels good to you right now. Give it a little room in your week.`
      : mostCostly
        ? `One thing to stay curious about: ${mostCostly.name}. What would help you notice the moment sooner?`
        : "Most of what you have logged feels close to neutral. A few more notes may reveal the shape of it.";

  return (
    <SiteFrame>
      <main className="page-wrap tool-page audit-page">
        <Reveal className="tool-heading audit-heading">
          <div>
            <span className="eyebrow"><span className="eyebrow-dot" />GENTLE CURIOSITY, NOT JUDGEMENT</span>
            <h1>What gives you <em>something back?</em></h1>
            <p>Notice the habits, apps and little rituals that lift you up—or quietly leave you lower.</p>
          </div>
          <span className="audit-heading-stamp"><Heart size={17} /> Just data about you, for you</span>
        </Reveal>

        <div className="audit-layout">
          <div className="audit-main-column">
            <Reveal delay={0.04}>
              <section className="audit-form-card surface-card" aria-labelledby="audit-form-title">
                <div className="panel-kicker"><span className="step-index">01</span><span>Add to your inventory</span><span className="panel-kicker-line" /><span className="private-label">⌑ Private</span></div>
                <h2 id="audit-form-title">Pick one thing to notice.</h2>
                <p className="form-intro">An app, a habit, a person, that late-night scroll. The scale is yours.</p>
                <form onSubmit={submit}>
                  <label className="field-label" htmlFor="audit-name">What are you reflecting on?</label>
                  <input className="text-field" id="audit-name" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. a quiet walk, morning scrolling…" maxLength={100} required />
                  <div className="score-label-row"><label className="field-label" htmlFor="audit-score">Net effect on you</label><span className={`score-reading ${scoreTone(score)}`} aria-live="polite"><strong>{score}</strong> <small>/10</small> · {scoreLabel(score)}</span></div>
                  <input id="audit-score" className="urge-range audit-range" type="range" min="0" max="10" step="1" value={score} style={rangeStyle} onChange={event => setScore(Number(event.target.value))} aria-describedby="score-anchors" />
                  <div className="range-ends score-anchors" id="score-anchors"><span>Draining me</span><span>Somewhere in between</span><span>Giving back</span></div>
                  <label className="field-label reflection-label" htmlFor="audit-tip">A note to your future self <span>Optional</span></label>
                  <textarea className="text-field reflection-field" id="audit-tip" value={tip} onChange={event => setTip(event.target.value)} placeholder="If it's costing you, what might help you catch it earlier?" maxLength={240} rows={3} />
                  <button className="button button-primary save-audit" type="submit"><Plus size={16} /> Add to my inventory</button>
                </form>
                {status && <p className="inline-status" role="status">{status}</p>}
              </section>
            </Reveal>

            <Reveal delay={0.08}>
              <section className="inventory-section" aria-labelledby="inventory-title">
                <div className="inventory-heading"><div><span className="eyebrow">A PRIVATE LITTLE INVENTORY</span><h2 id="inventory-title">Your reflections <span className="entry-count">{items.length.toString().padStart(2, "0")}</span></h2></div><label className="sort-control"><span className="sr-only">Sort reflections</span><ArrowDownWideNarrow size={15} /><select value={sort} onChange={event => setSort(event.target.value as SortMode)}><option value="recent">Most recent</option><option value="worst">Costing me most</option><option value="best">Helping me most</option></select></label></div>
                {sorted.length === 0 ? (
                  <div className="audit-empty-state"><span className="empty-orbit"><span>✳</span></span><h3>One honest note is plenty to start.</h3><p>Your entries stay on this device. Add whatever feels true today, not what you think you should feel.</p><a href="#audit-name" className="aside-text-link">Add your first reflection <ArrowRight size={14} /></a></div>
                ) : (
                  <div className="audit-list">{sorted.map(item => (
                    <article className="audit-entry" key={item.id}>
                      <div className={`audit-entry-score ${scoreTone(item.score)}`}><strong>{item.score}</strong><span>/10</span></div>
                      <div className="audit-entry-copy"><div className="audit-entry-title-row"><h3>{item.name}</h3><span className="entry-date">{readableDate(item.createdAt)}</span></div><span className={`score-label ${scoreTone(item.score)}`}>{scoreLabel(item.score)}</span>{item.tip && <p className="entry-tip">“{item.tip}”</p>}</div>
                      <button className="remove-entry" type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`}><Trash2 size={16} /></button>
                    </article>
                  ))}</div>
                )}
              </section>
            </Reveal>
          </div>

          <aside className="audit-aside">
            <Reveal delay={0.1}>
              <section className="audit-summary-card">
                <div className="summary-top"><span className="eyebrow">THE BIG PICTURE, GENTLY</span><span className="summary-ornament" aria-hidden="true">◒</span></div>
                <p className="summary-number">{items.length ? average.toFixed(1) : "—"}<span>/ 10</span></p>
                <h2>Your overall balance</h2>
                <p className="summary-note">{items.length ? "The average of your notes. A prompt to reflect—not a grade." : "Add a few things to see your own average."}</p>
                <div className="summary-rule"><span style={{ width: `${items.length ? average * 10 : 0}%` }} /></div>
                <div className="summary-scale"><span>Taking more</span><span>Giving back</span></div>
                <div className="summary-divider" />
                <div className="summary-stat-row"><span><i className="stat-dot helpful-dot" />Gives back</span><strong>{items.filter(item => item.score >= 7).length}</strong></div>
                <div className="summary-stat-row"><span><i className="stat-dot costly-dot" />Feels costly</span><strong>{items.filter(item => item.score <= 3).length}</strong></div>
                <div className="summary-stat-row"><span><i className="stat-dot neutral-dot" />Logged, total</span><strong>{items.length}</strong></div>
              </section>
            </Reveal>
            <Reveal delay={0.14}>
              <section className="pattern-card"><div className="pattern-top"><span className="pattern-icon"><Sparkles size={16} /></span><span className="eyebrow">A REFLECTION, NOT AN ALGORITHM</span></div><p>{summary}</p><small>Based only on your saved entries. No AI, no uploads.</small></section>
            </Reveal>
            <Reveal delay={0.18}>
              <section className="audit-privacy-card"><span className="privacy-lock">⌑</span><span className="eyebrow">YOUR SPACE, YOURS</span><p>Your reflections live in this browser’s local storage. We don’t see them.</p><Link href="/menu" className="aside-text-link">Take a little pause <ArrowUpRight size={14} /></Link></section>
            </Reveal>
          </aside>
        </div>
      </main>
    </SiteFrame>
  );
}
