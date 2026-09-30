import { useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Heart, Sparkles, Waves } from "lucide-react";
import { Link } from "wouter";
import { Brand, SiteFrame, useSite } from "@/components/SiteChrome";
import Reveal from "@/components/Reveal";

export default function Home() {
  const [urge, setUrge] = useState(3);
  const { openVault } = useSite();
  const response = urge <= 3 ? "Just a little tap. You can let it pass." : urge <= 6 ? "A little pull. There’s still room to choose." : urge <= 8 ? "That’s a strong one. Let’s make some space." : "A big wave. Stay with one breath at a time.";
  return (
    <SiteFrame>
      <main>
        <section className="home-hero">
          <div className="hero-ambient" aria-hidden="true" />
          <div className="page-wrap hero-grid">
            <div className="hero-copy">
              <span className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> A LITTLE SPACE FOR YOUR ATTENTION</span>
              <div className="hero-brand"><Brand /></div>
              <h1>Pause the pull.<br /><em>Find your next.</em></h1>
              <p className="hero-description">A softer way to notice the moment before you reach for your phone—and choose what feels good next.</p>
              <div className="hero-actions">
                <Link href="/menu" className="button button-primary">Take a small pause <ArrowRight size={16} /></Link>
                <a href="#how-it-works" className="text-link">How it works <ArrowDown size={15} /></a>
              </div>
              <div className="hero-footnote"><span className="tiny-check"><Heart size={13} /></span><span>No streaks. No shame. Just a little more you.</span></div>
            </div>
            <div className="hero-scene-wrap">
              <div className="hero-image-card">
                <img src="/manus-storage/async-images/X6h7RrexeTipiGpB33YadE/image-1.webp" alt="A phone resting face down beside an open notebook and a warm cup of tea." />
              </div>
              <div className="image-caption"><span className="caption-spark" aria-hidden="true">✳</span><span>A moment that belongs to you.</span><span className="caption-line" aria-hidden="true" /></div>
              <div className="scene-sticker scene-sticker-top"><span className="sticker-orbit"><Waves size={17} /></span><span><strong>Take a breath</strong><small>even just one</small></span></div>
              <div className="scene-sticker scene-sticker-bottom"><span className="online-dot" /><span>Private by design</span></div>
            </div>
            <div className="hero-scroll-hint"><span>SCROLL AT YOUR OWN PACE</span><span className="scroll-stroke" /></div>
          </div>
        </section>

        <section className="urge-story-section" id="how-it-works">
          <div className="page-wrap urge-story-grid">
            <Reveal className="urge-story-copy">
              <span className="eyebrow"><span className="step-index">01</span> THE PAUSE BEFORE</span>
              <h2>“I’ll just check…”<br /><em>Sound familiar?</em></h2>
              <p>We all get that little nudge. DopaTrack makes a gentle gap between the feeling and the tap—so your next move can feel like yours.</p>
              <div className="tiny-note"><span className="tiny-note-star">✳</span> No scores for screen time. Just a moment to notice.</div>
            </Reveal>
            <Reveal delay={0.1}>
              <article className="home-urge-card surface-card">
                <div className="home-card-top"><div className="mini-mark"><img src="/images/dopatrack-logo.png" alt="" /></div><span>RIGHT NOW · JUST YOU</span><span className="home-card-dots">···</span></div>
                <div className="home-urge-prompt">Right now, how strong is the urge to check your phone?</div>
                <div className="home-urge-value"><strong>{urge}</strong><span> / 10</span></div>
                <label className="sr-only" htmlFor="home-urge">Phone-checking urge from 0 to 10</label>
                <input className="urge-range" id="home-urge" type="range" min="0" max="10" value={urge} onChange={event => setUrge(Number(event.target.value))} style={{ "--range-progress": `${urge * 10}%` } as CSSProperties} />
                <div className="range-ends"><span>Just a thought</span><span>A big wave</span></div>
                <div className="home-urge-response" aria-live="polite"><Sparkles size={15} /><span>{response}</span></div>
                <Link href="/menu" className="button button-primary button-full">See what else you could do <ArrowRight size={15} /></Link>
                <div className="home-card-foot"><span className="green-dot" /> A check-in stays on your device</div>
              </article>
            </Reveal>
          </div>
        </section>

        <section className="how-section">
          <div className="page-wrap">
            <Reveal className="section-intro centered-intro">
              <span className="eyebrow">THREE GENTLE STEPS</span>
              <h2>A little more <em>room to be here.</em></h2>
              <p>Not a detox or a digital bootcamp. Just a small invitation to listen to yourself first.</p>
            </Reveal>
            <div className="steps-grid">
              <Reveal className="step-card" delay={0.02}><div className="step-card-top"><span className="step-index">01</span><span className="step-icon step-icon-amber"><span>◉</span></span></div><h3>Notice the pull.</h3><p>Check in with the feeling, without needing to fix it. A number can be a helpful place to start.</p><span className="step-card-line" /></Reveal>
              <Reveal className="step-card" delay={0.1}><div className="step-card-top"><span className="step-index">02</span><span className="step-icon step-icon-green"><Waves size={18} /></span></div><h3>Choose a small thing.</h3><p>Pick a two-minute reset, a little walk, or something you already enjoy doing.</p><span className="step-card-line" /></Reveal>
              <Reveal className="step-card" delay={0.18}><div className="step-card-top"><span className="step-index">03</span><span className="step-icon step-icon-coral"><BookOpen size={18} /></span></div><h3>Keep what you learn.</h3><p>Notice what gives you something back. Keep it private here, or add it to your Obsidian vault.</p><span className="step-card-line" /></Reveal>
            </div>
          </div>
        </section>

        <section className="preview-section">
          <div className="page-wrap preview-grid">
            <Reveal className="preview-copy">
              <span className="eyebrow"><span className="step-index">A QUIETER KIND OF TRACKING</span></span>
              <h2>A trail of tiny choices, <em>not a streak to keep.</em></h2>
              <p>Meet your Menu for small off-screen ideas and your Dopamine Audit for noticing the little things that fill you up—or quietly drain you.</p>
              <div className="preview-links"><Link href="/menu" className="aside-text-link">Explore your Menu <ArrowRight size={14} /></Link><Link href="/audit" className="aside-text-link">Meet the Dopamine Audit <ArrowRight size={14} /></Link></div>
              <div className="preview-privacy"><span className="privacy-lock">⌑</span><span>Nothing syncs. Your reflections are yours.</span></div>
            </Reveal>
            <Reveal className="product-window-wrap" delay={0.1}>
              <div className="product-window" aria-label="Example of a DopaTrack check-in">
                <div className="window-topbar"><div className="window-lights"><i /><i /><i /></div><span>YOUR DOPATRACK MENU</span><span className="window-private"><span /> LOCAL</span></div>
                <div className="window-inner">
                  <div className="window-greeting"><div><span className="eyebrow">A MOMENT FOR YOU</span><h3>What sounds kind?</h3></div><div className="window-day">TODAY<br /><strong>Just now</strong></div></div>
                  <div className="window-urge-bar"><span>urge to check in</span><strong>4 <small>/ 10</small></strong><div><i /></div></div>
                  <div className="window-suggestion"><div className="window-suggestion-icon"><Waves size={17} /></div><div><span>2 MIN · A TINY PAUSE</span><strong>Refill a glass of water, slowly.</strong><small>A small change of scene still counts.</small></div><ArrowUpRight size={15} /></div>
                  <div className="window-footer"><span><span className="green-dot" /> Saved on this device</span><span className="window-next">One thing at a time <ArrowRight size={13} /></span></div>
                </div>
                <span className="window-deco window-deco-one" aria-hidden="true">✳</span><span className="window-deco window-deco-two" aria-hidden="true">·</span>
              </div>
              <span className="window-caption">A little less “what was I doing?”</span>
            </Reveal>
          </div>
        </section>

        <section className="audit-teaser-section">
          <div className="page-wrap audit-teaser-grid">
            <Reveal className="audit-teaser-visual">
              <div className="teaser-paper"><span className="eyebrow">YOUR PRIVATE INVENTORY</span><div className="teaser-title-row"><div><strong>Sunday morning walk</strong><span>Small things that feel like yours.</span></div><span className="teaser-score teaser-score-good">8<span>/10</span></span></div><div className="teaser-meter"><i /></div><div className="teaser-title-row teaser-title-row-muted"><div><strong>Late-night scrolling</strong><span>Something to notice a little sooner.</span></div><span className="teaser-score teaser-score-hard">3<span>/10</span></span></div><div className="teaser-meter teaser-meter-muted"><i /></div><div className="teaser-endnote"><span>✳</span> No verdicts. Just noticing what you notice.</div></div>
              <div className="teaser-pin" aria-hidden="true">⌑</div>
            </Reveal>
            <Reveal className="audit-teaser-copy" delay={0.09}>
              <span className="eyebrow">A KINDER KIND OF AUDIT</span>
              <h2>Find what gives you <em>something back.</em></h2>
              <p>Take stock of the apps, habits and rituals in your day. Not to tally a life—but to make more room for the things that leave you feeling a little more like yourself.</p>
              <Link href="/audit" className="button button-outline">Explore the Dopamine Audit <ArrowRight size={15} /></Link>
            </Reveal>
          </div>
        </section>

        <section className="final-cta-section" id="get-started">
          <div className="cta-glow" aria-hidden="true" />
          <Reveal className="page-wrap final-cta-content">
            <div className="cta-orbit" aria-hidden="true"><span>✳</span><i /><i /></div>
            <span className="eyebrow">YOUR NEXT MOMENT IS YOURS</span>
            <h2>Maybe now is a good time <em>to begin.</em></h2>
            <p>Try one small pause. See how it feels. Keep the parts that fit.</p>
            <div className="cta-actions"><Link href="/menu" className="button button-primary">Get started <ArrowRight size={16} /></Link><button type="button" className="button button-light-outline" onClick={openVault}>Connect to your personal Obsidian vault <ArrowUpRight size={15} /></button></div>
            <span className="cta-reassurance"><span className="green-dot" />No account needed <span className="reassurance-separator">·</span> Your notes stay yours</span>
          </Reveal>
        </section>
      </main>
    </SiteFrame>
  );
}
