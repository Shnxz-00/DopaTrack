import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowRight, Check, Clock3, Compass, Plus, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { Link } from "wouter";
import Reveal from "@/components/Reveal";
import { SiteFrame, VaultAction } from "@/components/SiteChrome";
import { localDayKey, newLocalId, readableDate, useLocalState, type PersonalActivity, type UrgeCheckIn } from "@/lib/localState";

type Duration = "quick" | "medium" | "long";
type Activity = { id: string; name: string; minutes: number; duration: Duration; hint: string };
const builtIns: Activity[] = [
  { id: "water", duration: "quick", minutes: 2, name: "Refill a glass of water, slowly.", hint: "A tiny change of scene is still a change." },
  { id: "window", duration: "quick", minutes: 2, name: "Look out a window. Find five small details.", hint: "Let your eyes land somewhere further away." },
  { id: "breath", duration: "quick", minutes: 2, name: "Take three long breaths, phone face down.", hint: "Nothing to fix. Just a moment to notice." },
  { id: "stretch", duration: "medium", minutes: 10, name: "Put on one song and let your shoulders move.", hint: "No routine to follow. Just see what feels good." },
  { id: "wander", duration: "medium", minutes: 10, name: "Take a little walk with no destination.", hint: "A few outside minutes can reset the room in your head." },
  { id: "tidy", duration: "medium", minutes: 10, name: "Make one small corner feel easier to be in.", hint: "One shelf, not the whole day." },
  { id: "pages", duration: "long", minutes: 30, name: "Read a few pages of something you chose.", hint: "Let the story set the pace for a while." },
  { id: "cook", duration: "long", minutes: 30, name: "Make a snack with both hands free.", hint: "Notice the colours, the smell, the first bite." },
  { id: "outside", duration: "long", minutes: 30, name: "Go somewhere green and leave the phone behind.", hint: "A slower route is a good route." },
];
const durations: { id: Duration; label: string; minutes: string; description: string }[] = [
  { id: "quick", label: "A tiny pause", minutes: "2 min", description: "For the little in-between moments" },
  { id: "medium", label: "A small reset", minutes: "10 min", description: "For when you have a little more room" },
  { id: "long", label: "A proper detour", minutes: "30 min", description: "For time that belongs to you" },
];

export default function Menu() {
  const [urge, setUrge] = useState(4);
  const [duration, setDuration] = useState<Duration>("quick");
  const [activeId, setActiveId] = useState("water");
  const [turn, setTurn] = useState(0);
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [myActivities, setMyActivities] = useLocalState<PersonalActivity[]>("dopa:activities", []);
  const [checkins, setCheckins] = useLocalState<UrgeCheckIn[]>("dopa:checkins", []);
  const options = useMemo(() => [
    ...builtIns.filter(item => item.duration === duration),
    ...myActivities.filter(item => item.duration === duration).map(item => ({ id: item.id, name: item.name, duration: item.duration, minutes: duration === "quick" ? 2 : duration === "medium" ? 10 : 30, hint: "One small thing, chosen by you." })),
  ], [duration, myActivities]);
  const activity = options.find(item => item.id === activeId) ?? options[0];
  const selectedDuration = durations.find(item => item.id === duration)!;
  const urgeCopy = urge <= 3 ? "A passing thought. You can let it drift by." : urge <= 6 ? "A little pull. There’s room to choose." : urge <= 8 ? "A strong pull. Let’s make a little space." : "A big wave. One breath at a time.";

  const changeDuration = (next: Duration) => {
    setDuration(next);
    const first = [...builtIns.filter(item => item.duration === next), ...myActivities.filter(item => item.duration === next)];
    setActiveId(first[0]?.id ?? "");
    setTurn(0);
    setMessage("");
  };
  const another = () => {
    const withoutCurrent = options.filter(item => item.id !== activity?.id);
    if (!withoutCurrent.length) { setMessage("Add another idea in your own list, or try a different time window."); return; }
    setActiveId(withoutCurrent[turn % withoutCurrent.length].id);
    setTurn(value => value + 1);
    setMessage("");
  };
  const record = () => {
    if (!activity) return;
    const entry: UrgeCheckIn = { id: newLocalId(), urge, activity: activity.name, duration: selectedDuration.minutes, createdAt: Date.now() };
    setCheckins(current => [entry, ...current]);
    setMessage("A moment, noticed. Your check-in is saved on this device.");
  };
  const addCustom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = custom.trim();
    if (!name) return;
    const entry: PersonalActivity = { id: newLocalId(), name, duration };
    setMyActivities(current => [entry, ...current]);
    setCustom("");
    setActiveId(entry.id);
    setMessage("Added to your local activity list.");
  };
  const removeCheckin = (id: string) => setCheckins(current => current.filter(item => item.id !== id));
  const rangeStyle = { "--range-progress": `${urge * 10}%` } as CSSProperties;

  return (
    <SiteFrame>
      <main className="page-wrap tool-page">
        <Reveal className="tool-heading">
          <div>
            <span className="eyebrow"><span className="eyebrow-dot" />YOUR MOMENT, YOUR CHOICE</span>
            <h1>Pick your next <em>little thing.</em></h1>
            <p>No perfect routine. No gold stars. Just a few ideas for when the phone-pull shows up.</p>
          </div>
          <div className="tool-heading-mark"><span className="heading-mark-line" /><span>Notice <b>·</b> Choose <b>·</b> Return</span></div>
        </Reveal>

        <div className="menu-layout">
          <div className="menu-main-column">
            <Reveal delay={0.04}>
              <section className="urge-panel surface-card" aria-labelledby="menu-urge-title">
                <div className="panel-kicker"><span className="step-index">01</span><span>Pause</span><span className="panel-kicker-line" /><span className="live-pill"><i /> right now</span></div>
                <div className="urge-panel-head"><div><h2 id="menu-urge-title">How strong is the pull?</h2><p>There isn’t a wrong number. It just helps you notice.</p></div><div className="urge-number"><strong>{urge}</strong><span>/ 10</span></div></div>
                <label className="sr-only" htmlFor="menu-urge">Phone-checking urge from 0 to 10</label>
                <input id="menu-urge" className="urge-range" style={rangeStyle} type="range" min="0" max="10" value={urge} onChange={event => setUrge(Number(event.target.value))} />
                <div className="range-ends"><span>Just a thought</span><span>A big wave</span></div>
                <div className="gentle-response" aria-live="polite"><Sparkles size={16} /><span>{urgeCopy}</span></div>
              </section>
            </Reveal>

            <Reveal delay={0.1}>
              <section className="activity-section" aria-labelledby="activity-title">
                <div className="section-topline"><div><span className="eyebrow"><span className="step-index">02</span> A SMALL REDIRECT</span><h2 id="activity-title">What kind of pause fits?</h2></div><Compass size={20} className="quiet-icon" aria-hidden="true" /></div>
                <div className="duration-grid" role="group" aria-label="Choose a time window">
                  {durations.map(option => (
                    <button type="button" key={option.id} className={`duration-card${duration === option.id ? " is-selected" : ""}`} onClick={() => changeDuration(option.id)} aria-pressed={duration === option.id}>
                      <span className="duration-time">{option.minutes}</span><strong>{option.label}</strong><span>{option.description}</span>
                    </button>
                  ))}
                </div>
                <article className="suggestion-card">
                  <div className="suggestion-meta"><span className="suggestion-stamp"><Sparkles size={14} /> YOUR NEXT SMALL THING</span><span className="suggestion-time"><Clock3 size={14} /> {activity?.minutes ?? (duration === "quick" ? 2 : duration === "medium" ? 10 : 30)} MIN</span></div>
                  <h3>{activity?.name ?? "Add a little idea of your own."}</h3>
                  <p>{activity?.hint ?? "Make this space yours with one small activity."}</p>
                  <div className="suggestion-actions">
                    <button className="button button-outline" type="button" onClick={another}><RefreshCw size={15} /> Another idea</button>
                    <button className="button button-primary" type="button" onClick={record} disabled={!activity}><Check size={15} /> I’ll try this</button>
                  </div>
                </article>
                {message && <p className="inline-status" role="status">{message}</p>}
              </section>
            </Reveal>

            <Reveal delay={0.12}>
              <section className="custom-activity-card surface-card" aria-labelledby="custom-title">
                <div className="section-topline"><div><span className="eyebrow">MAKE IT YOURS</span><h2 id="custom-title">A thing you already like</h2><p>Add something that feels good to you—not what you think you should do.</p></div><span className="custom-icon"><Plus size={19} /></span></div>
                <form className="custom-activity-form" onSubmit={addCustom}>
                  <label className="sr-only" htmlFor="custom-activity">Name a quick, medium, or longer activity</label>
                  <input id="custom-activity" value={custom} onChange={event => setCustom(event.target.value)} maxLength={80} placeholder="e.g. water my little balcony garden" />
                  <button className="button button-secondary" type="submit" disabled={!custom.trim()}>Add to my menu <Plus size={14} /></button>
                </form>
                {myActivities.length > 0 && <div className="personal-list"><div className="personal-list-label">YOUR IDEAS · SAVED ON THIS DEVICE</div>{myActivities.slice(0, 3).map(item => <div className="personal-item" key={item.id}><span>{item.name}</span><span className="personal-duration">{item.duration === "quick" ? "2 MIN" : item.duration === "medium" ? "10 MIN" : "30 MIN"}</span><button type="button" aria-label={`Remove ${item.name}`} onClick={() => setMyActivities(current => current.filter(value => value.id !== item.id))}><Trash2 size={14} /></button></div>)}</div>}
              </section>
            </Reveal>
          </div>

          <aside className="menu-aside">
            <Reveal delay={0.09}>
              <section className="aside-card pause-note-card">
                <span className="aside-orbit" aria-hidden="true">✳</span>
                <span className="eyebrow">A NOTE TO SELF</span>
                <p>“A craving is a visitor. It doesn’t have to be the host.”</p>
                <span className="aside-underline" />
                <small>One breath is a beginning.</small>
              </section>
            </Reveal>
            <Reveal delay={0.13}>
              <section className="aside-card checkin-card" aria-labelledby="checkin-title">
                <div className="checkin-head"><span className="checkin-icon"><Check size={15} /></span><span className="checkin-count">{checkins.length} saved</span></div>
                <span className="eyebrow">THE MOMENTS YOU NOTICED</span>
                <h2 id="checkin-title">A little trail of pauses.</h2>
                {checkins.length === 0 ? <p className="aside-muted">When you try a small thing, your check-in will find a home here.</p> : <div className="checkin-list">{checkins.slice(0, 4).map(item => <div className="checkin-row" key={item.id}><div className="checkin-urge"><span>{item.urge}</span><small>/10</small></div><div className="checkin-copy"><strong>{item.activity}</strong><span>{readableDate(item.createdAt)} · {item.duration}</span></div><button type="button" aria-label={`Remove check-in ${item.activity}`} onClick={() => removeCheckin(item.id)}><Trash2 size={14} /></button></div>)}</div>}
                <span className="local-lock"><span aria-hidden="true">⌑</span> Private to this browser</span>
              </section>
            </Reveal>
            <Reveal delay={0.17}>
              <section className="aside-card vault-aside">
                <div className="vault-mini-icon">✳</div><span className="eyebrow">KEEP A NOTE, IF YOU LIKE</span>
                <h2>Let the moment live in your vault.</h2>
                <p>Your check-ins stay here unless you choose your Obsidian folder.</p>
                {activity && <VaultAction content={`DopaTrack check-in · urge ${urge}/10 · ${activity.name} (${localDayKey()})`} onStatus={setMessage} />}
                <Link href="/audit" className="aside-text-link">Reflect on your habits <ArrowRight size={14} /></Link>
              </section>
            </Reveal>
          </aside>
        </div>
      </main>
    </SiteFrame>
  );
}
