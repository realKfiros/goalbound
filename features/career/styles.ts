import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
:root {
  --ink: #f3f3ee;
  --muted: #989b96;
  --lime: #c7ff35;
  --orange: #ff6542;
  --panel: rgba(22, 24, 22, 0.76);
  --line: rgba(255, 255, 255, 0.12);
  --black: #090a09;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--black);
  color: var(--ink);
  font-family: Arial, Helvetica, sans-serif;
}
button, input { font: inherit; }
button { color: inherit; }

.site-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px),
    radial-gradient(circle at 70% 12%, rgba(199,255,53,.07), transparent 34%),
    #090a09;
  background-size: 62px 62px, 62px 62px, auto, auto;
}

.ambient { position: fixed; width: 420px; height: 420px; border-radius: 50%; filter: blur(120px); opacity: .08; pointer-events: none; }
.ambient-one { background: var(--lime); top: 20%; right: -220px; }
.ambient-two { background: var(--orange); bottom: -180px; left: -220px; }

.topbar {
  position: relative;
  z-index: 5;
  width: min(1440px, calc(100% - 64px));
  height: 88px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
}
.brand { background: none; border: 0; padding: 0; display: flex; align-items: center; gap: 12px; font-weight: 900; letter-spacing: -.04em; cursor: pointer; }
.brand-mark { width: 34px; height: 34px; display: grid; place-items: center; color: #090a09; background: var(--lime); border-radius: 50% 50% 50% 10%; font-size: 19px; transform: rotate(-5deg); }
.topbar-right { display: flex; align-items: center; gap: 24px; }
.save-status { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .09em; display: flex; align-items: center; gap: 8px; }
.save-status i { width: 6px; height: 6px; border-radius: 50%; background: var(--lime); box-shadow: 0 0 12px var(--lime); }
.quiet-button, .back-link { background: none; border: 0; color: var(--muted); cursor: pointer; padding: 8px; }
.quiet-button:hover, .back-link:hover { color: var(--ink); }
.trophy-nav { display: inline-flex; align-items: center; gap: 8px; }
.trophy-nav b { min-width: 23px; height: 23px; display: grid; place-items: center; color: #090a09; background: var(--lime); border-radius: 50%; font-size: 10px; }

.hero {
  position: relative;
  z-index: 1;
  width: min(1320px, calc(100% - 64px));
  min-height: 690px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  align-items: center;
  gap: 80px;
  padding: 70px 0 90px;
}
.hero-copy { position: relative; z-index: 2; }
.eyebrow { display: flex; align-items: center; gap: 10px; color: var(--lime); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .18em; }
.eyebrow span + span::before { content: "×"; margin-right: 10px; color: #5f625d; }
.hero h1, .page-heading h2, .summary-page h2 {
  margin: 22px 0 24px;
  font-size: clamp(58px, 7.4vw, 112px);
  line-height: .84;
  letter-spacing: -.075em;
  text-transform: uppercase;
}
.hero h1 em, .summary-page h2 em { color: var(--lime); font-style: normal; }
.hero-copy > p { max-width: 560px; margin: 0 0 34px; color: #b7bab4; font-size: 18px; line-height: 1.65; }
.hero-actions, .summary-actions { display: flex; align-items: center; gap: 12px; }
.primary-button, .secondary-button {
  min-height: 54px;
  padding: 0 22px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-weight: 800;
  cursor: pointer;
  transition: transform .2s ease, background .2s ease, border-color .2s ease;
}
.primary-button { background: var(--lime); color: #090a09; display: inline-flex; align-items: center; justify-content: space-between; gap: 42px; }
.primary-button:hover { background: #d7ff72; transform: translateY(-2px); }
.secondary-button { background: transparent; color: var(--ink); border-color: var(--line); }
.secondary-button:hover { border-color: rgba(255,255,255,.36); transform: translateY(-2px); }
.nation-strip { display: flex; flex-wrap: wrap; gap: 9px; max-width: 560px; margin-top: 38px; }
.nation-strip span { width: 32px; height: 32px; display: grid; place-items: center; background: rgba(255,255,255,.05); border: 1px solid var(--line); border-radius: 50%; font-size: 16px; }

.hero-card-wrap { position: relative; min-height: 540px; display: grid; place-items: center; }
.orbit { position: absolute; border: 1px solid rgba(199,255,53,.16); border-radius: 50%; }
.orbit-one { width: 500px; height: 500px; }
.orbit-two { width: 370px; height: 370px; border-style: dashed; animation: rotate 30s linear infinite; }
@keyframes rotate { to { transform: rotate(360deg); } }
.prospect-card {
  position: relative;
  z-index: 2;
  width: min(360px, 86vw);
  min-height: 490px;
  padding: 28px;
  background: linear-gradient(145deg, #1e211e, #111311);
  border: 1px solid rgba(199,255,53,.28);
  box-shadow: 0 35px 100px rgba(0,0,0,.55);
  clip-path: polygon(0 0, 91% 0, 100% 7%, 100% 100%, 9% 100%, 0 93%);
  transform: rotate(2deg);
}
.prospect-card::after { content: ""; position: absolute; inset: 12px; border: 1px solid rgba(255,255,255,.07); pointer-events: none; clip-path: inherit; }
.prospect-top { display: flex; align-items: center; gap: 10px; }
.rating-big { font-size: 54px; font-weight: 900; letter-spacing: -.08em; }
.prospect-top div { display: flex; flex-direction: column; font-size: 9px; color: var(--muted); letter-spacing: .1em; }
.prospect-top div strong { color: var(--lime); font-size: 13px; }
.card-flag { margin-left: auto; font-size: 24px; }
.shirt-graphic, .live-shirt, .mini-shirt {
  position: relative;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, #d8ff70, #97ca17);
  color: #141612;
  clip-path: polygon(20% 0, 37% 10%, 63% 10%, 80% 0, 100% 17%, 85% 36%, 77% 30%, 77% 100%, 23% 100%, 23% 30%, 15% 36%, 0 17%);
}
.shirt-graphic { width: 210px; height: 240px; margin: 28px auto 14px; }
.shirt-graphic::after { content: ""; position: absolute; width: 46px; height: 23px; top: 10px; border-radius: 0 0 40px 40px; background: #171917; }
.shirt-graphic span { font-size: 78px; font-weight: 900; letter-spacing: -.08em; }
.prospect-name { padding: 18px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); text-align: center; font-size: 25px; font-weight: 900; letter-spacing: -.03em; }
.card-data { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 18px; }
.card-data span { display: flex; flex-direction: column; color: var(--muted); font-size: 9px; letter-spacing: .08em; }
.card-data strong { margin-top: 4px; color: var(--ink); font-size: 13px; letter-spacing: 0; }
.floating-tag { position: absolute; z-index: 3; min-width: 132px; padding: 12px 15px; display: flex; flex-direction: column; background: #171917; border: 1px solid var(--line); box-shadow: 0 12px 40px rgba(0,0,0,.35); }
.floating-tag small { color: var(--muted); font-size: 8px; letter-spacing: .12em; }
.floating-tag strong { margin-top: 3px; font-size: 12px; }
.tag-left { left: 0; top: 33%; transform: rotate(-4deg); }
.tag-right { right: 0; bottom: 22%; transform: rotate(4deg); }

.manifesto {
  position: relative;
  z-index: 1;
  width: min(1320px, calc(100% - 64px));
  margin: 0 auto 80px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.manifesto > div { padding: 36px 42px 38px 0; }
.manifesto > div + div { padding-left: 42px; border-left: 1px solid var(--line); }
.step-number { color: var(--lime); font-family: monospace; font-size: 11px; }
.manifesto h3 { margin: 26px 0 10px; font-size: 20px; }
.manifesto p { margin: 0; max-width: 340px; color: var(--muted); font-size: 14px; line-height: 1.6; }

.setup-page, .career-page, .summary-page, .trophy-room-page { position: relative; z-index: 1; width: min(1280px, calc(100% - 64px)); margin: 0 auto; padding: 56px 0 110px; }
.page-enter { animation: pageIn .55s ease both; }
@keyframes pageIn { from { opacity: 0; transform: translateY(12px); } }
.page-heading { max-width: 620px; margin-bottom: 46px; }
.back-link { margin: 0 0 28px -8px; }
.page-heading h2 { margin: 14px 0; font-size: clamp(54px, 6vw, 88px); }
.page-heading p { color: var(--muted); font-size: 17px; }
.setup-grid { display: grid; grid-template-columns: 1.3fr .7fr; gap: 28px; align-items: start; }
.form-panel, .live-card, .timeline-panel, .achievements-panel { background: var(--panel); border: 1px solid var(--line); backdrop-filter: blur(18px); }
.form-panel { padding: 36px; }
.field-grid { display: grid; grid-template-columns: 1fr 150px; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 10px; }
.field span, legend { color: var(--muted); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }
.field input { width: 100%; height: 54px; padding: 0 16px; color: var(--ink); background: #0d0f0d; border: 1px solid var(--line); border-radius: 3px; outline: none; }
.field input:focus { border-color: var(--lime); box-shadow: 0 0 0 3px rgba(199,255,53,.09); }
fieldset { padding: 0; margin: 34px 0 0; border: 0; }
legend { margin-bottom: 13px; }
.country-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.country-option { min-height: 92px; padding: 12px 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; background: #0d0f0d; border: 1px solid var(--line); border-radius: 3px; cursor: pointer; }
.country-option span { font-size: 23px; }
.country-option strong { font-size: 11px; }
.country-option small { color: var(--muted); font-size: 8px; letter-spacing: .1em; }
.country-option:hover, .position-option:hover, .span-option:hover { border-color: rgba(199,255,53,.5); }
.country-option.selected, .position-option.selected, .span-option.selected { color: #0a0b0a; background: var(--lime); border-color: var(--lime); }
.country-option.selected small { color: #3a451b; }
.position-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; }
.position-option, .span-option { min-height: 42px; background: #0d0f0d; border: 1px solid var(--line); border-radius: 3px; font-size: 11px; font-weight: 800; cursor: pointer; }
.span-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.field-note { margin: 10px 0 0; color: #777b75; font-size: 11px; }
.live-card { position: sticky; top: 24px; padding: 28px; background: linear-gradient(145deg, rgba(32,35,31,.98), rgba(15,17,15,.97)); }
.live-card-top { display: flex; justify-content: space-between; color: var(--muted); font: 10px monospace; letter-spacing: .1em; }
.live-score { display: flex; align-items: center; gap: 12px; margin-top: 25px; }
.live-score strong { font-size: 72px; line-height: 1; letter-spacing: -.08em; }
.live-score span { color: var(--lime); font: 10px/1.5 monospace; }
.live-shirt { width: 190px; height: 220px; margin: 10px auto 26px; }
.live-shirt b { font-size: 70px; letter-spacing: -.08em; }
.live-shirt small { position: absolute; bottom: 17px; font-size: 22px; }
.live-name { padding: 18px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); font-size: 28px; font-weight: 900; text-align: center; text-transform: uppercase; letter-spacing: -.04em; }
.live-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 20px 0; }
.live-meta span { min-width: 0; display: flex; flex-direction: column; font-size: 11px; }
.live-meta small { margin-bottom: 4px; color: var(--muted); font-size: 8px; }
.full-button { width: 100%; }

.career-page { padding-top: 46px; }
.career-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 30px; }
.identity-block { display: flex; align-items: center; gap: 24px; }
.mini-shirt { width: 74px; height: 82px; font-size: 25px; font-weight: 900; }
.identity-block h2 { margin: 7px 0 3px; font-size: clamp(36px, 4.5vw, 66px); line-height: .92; text-transform: uppercase; letter-spacing: -.06em; }
.identity-block p { margin: 0; color: var(--muted); }
.rating-block { display: flex; align-items: flex-end; gap: 8px; }
.rating-block strong { font-size: clamp(70px, 9vw, 128px); line-height: .7; letter-spacing: -.09em; }
.rating-block span { color: var(--lime); font-weight: 900; font-size: 12px; }
.career-stats { display: grid; grid-template-columns: repeat(6, 1fr); border: 1px solid var(--line); background: rgba(255,255,255,.02); }
.career-stats > div { padding: 22px; display: flex; flex-direction: column; }
.career-stats > div + div { border-left: 1px solid var(--line); }
.career-stats small { margin-bottom: 8px; color: var(--muted); font-size: 9px; text-transform: uppercase; letter-spacing: .1em; }
.career-stats strong { font-size: 22px; }
.career-vitals { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 10px; }
.career-vitals > span { position: relative; min-height: 48px; padding: 10px 12px; overflow: hidden; display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,.035); border: 1px solid var(--line); }
.career-vitals > span i { position: absolute; left: 0; bottom: 0; height: 2px; background: var(--lime); }
.career-vitals small { color: var(--muted); font-size: 8px; text-transform: uppercase; letter-spacing: .1em; }
.career-vitals strong { margin-left: auto; font-size: 11px; }
.career-vitals .agent-pill { padding-left: 14px; }
.career-vitals .agent-pill strong { color: var(--lime); }
.career-vitals .contract-pill strong { color: #f3c667; }
.motion-screen { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 24px; background: rgba(4,5,4,.86); backdrop-filter: blur(14px); animation: motionFade .18s ease both; }
.motion-card { width: min(520px, 100%); padding: 42px; text-align: center; background: linear-gradient(145deg, #20231f, #101210); border: 1px solid rgba(199,255,53,.36); box-shadow: 0 36px 120px rgba(0,0,0,.7); animation: motionPop .28s ease both; }
.motion-card small { display: block; margin: 18px 0 9px; color: var(--lime); font: 9px monospace; text-transform: uppercase; letter-spacing: .18em; }
.motion-card h3 { margin: 0; font-size: clamp(30px, 5vw, 48px); line-height: 1; letter-spacing: -.05em; }
.motion-card p { margin: 16px auto 24px; max-width: 400px; color: var(--muted); font-size: 13px; line-height: 1.6; }
.motion-ball { width: 46px; height: 46px; margin: auto; display: block; border: 2px solid var(--lime); border-radius: 50%; box-shadow: inset 0 0 0 9px rgba(199,255,53,.1); animation: ballRoll .8s cubic-bezier(.4,0,.2,1) infinite; }
.motion-track { width: min(320px, 90%); height: 4px; margin: auto; display: flex; gap: 6px; overflow: hidden; }
.motion-track i { flex: 1; background: rgba(255,255,255,.12); transform-origin: left; animation: trackFill .9s ease-in-out infinite; }
.motion-track i:nth-child(2) { animation-delay: .13s; }
.motion-track i:nth-child(3) { animation-delay: .26s; }
@keyframes motionFade { from { opacity: 0; } }
@keyframes motionPop { from { opacity: 0; transform: translateY(16px) scale(.97); } }
@keyframes ballRoll { 50% { transform: rotate(180deg) scale(1.08); } to { transform: rotate(360deg); } }
@keyframes trackFill { 0%, 25% { transform: scaleX(.05); background: rgba(255,255,255,.12); } 70%, 100% { transform: scaleX(1); background: var(--lime); } }
.latest-season { margin-top: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 20px; background: rgba(199,255,53,.08); border-left: 3px solid var(--lime); font-size: 12px; }
.latest-season > span:last-child { color: #a8aca5; margin-left: auto; }
.latest-kicker { color: var(--lime); font: 9px monospace; text-transform: uppercase; letter-spacing: .1em; }
.decision-heading { margin: 64px 0 22px; display: flex; align-items: end; justify-content: space-between; }
.decision-heading h3 { margin: 8px 0 0; font-size: clamp(32px, 4vw, 54px); letter-spacing: -.05em; }
.season-control { display: flex; align-items: center; gap: 6px; }
.season-control span { margin-right: 8px; color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: .1em; }
.season-control button { width: 42px; height: 34px; background: transparent; border: 1px solid var(--line); border-radius: 3px; font-size: 10px; font-weight: 800; cursor: pointer; }
.season-control button.active { background: var(--lime); border-color: var(--lime); color: #090a09; }
.decision-dock { position: relative; width: min(1040px, 100%); min-height: 420px; margin: 38px auto 0; overflow: hidden; background: linear-gradient(145deg, rgba(31,34,30,.98), rgba(13,15,13,.98)); border: 1px solid rgba(199,255,53,.28); box-shadow: 0 26px 80px rgba(0,0,0,.3); }
.decision-dock::before { content: ""; position: absolute; width: 330px; height: 330px; top: -250px; right: -80px; border: 1px solid rgba(199,255,53,.15); border-radius: 50%; pointer-events: none; }
.decision-dock > * { position: relative; padding: 34px; animation: dockIn .28s ease both; }
@keyframes dockIn { from { opacity: 0; transform: translateY(9px); } }
.origin-reveal { min-height: 420px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
.origin-reveal h3, .dock-heading h3 { max-width: 820px; margin: 10px 0; font-size: clamp(34px, 5vw, 62px); line-height: .96; letter-spacing: -.055em; }
.origin-reveal > p, .dock-heading > div > p { max-width: 760px; margin: 6px 0 0; color: #b9bdb6; font-size: 15px; line-height: 1.6; }
.origin-reveal.gem { border-left: 4px solid #f3c667; }
.origin-reveal.gem .story-kicker { color: #f3c667; }
.origin-facts { width: min(720px, 100%); display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 26px; border: 1px solid var(--line); }
.origin-facts span { min-height: 72px; padding: 14px 16px; display: flex; flex-direction: column; justify-content: center; }
.origin-facts span + span { border-left: 1px solid var(--line); }
.origin-facts small { margin-bottom: 5px; color: var(--muted); font-size: 8px; letter-spacing: .1em; }
.origin-facts strong { font-size: 20px; }
.dock-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
.dock-heading .season-control { flex: 0 0 auto; margin-top: 4px; }
.club-options { display: grid; gap: 8px; }
.club-options > button { position: relative; min-height: 106px; padding: 16px 74px 16px 56px; display: flex; align-items: center; gap: 18px; text-align: left; background: rgba(255,255,255,.025); border: 1px solid var(--line); cursor: pointer; transition: transform .18s ease, background .18s ease, border-color .18s ease; }
.club-options > button:hover { transform: translateX(5px); background: rgba(199,255,53,.05); border-color: rgba(199,255,53,.5); }
.club-options .club-badge { width: 60px; height: 60px; }
.club-option-copy { min-width: 0; display: grid; grid-template-columns: minmax(170px, .85fr) 1.15fr; align-items: center; column-gap: 18px; flex: 1; }
.club-option-copy > small { grid-column: 1; color: var(--lime); font-size: 8px; text-transform: uppercase; letter-spacing: .12em; }
.club-option-copy > strong { grid-column: 1; font-size: 21px; line-height: 1.1; }
.club-option-copy > span { grid-column: 1; color: var(--muted); font-size: 10px; }
.club-option-copy > p { grid-column: 2; grid-row: 1 / 4; margin: 0; color: #bec1bb; font-size: 12px; line-height: 1.5; }
.club-options em { position: absolute; right: 18px; color: var(--lime); font-size: 9px; font-style: normal; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.decision-dock .season-stage { min-height: 420px; }
.decision-dock .season-club { margin-top: 24px; }
.decision-dock .season-club h3 { font-size: clamp(34px, 4.5vw, 58px); }
.decision-dock .season-stage blockquote { margin: 24px 0 20px; }
.decision-dock .scenario-stage { padding: 34px; }
.decision-dock .scenario-icon { width: 54px; height: 54px; margin-bottom: 16px; font-size: 26px; }
.decision-dock .scenario-stage h3 { font-size: clamp(34px, 4.5vw, 58px); }
.decision-dock .scenario-description { margin: 12px 0 22px; }
.decision-dock .scenario-options > button { min-height: 108px; }
.decision-dock .outcome-stage { min-height: 420px; padding: 34px; }
.offers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.offer-card { position: relative; min-height: 320px; padding: 25px; overflow: hidden; text-align: left; background: linear-gradient(150deg, rgba(29,32,28,.96), rgba(14,16,14,.96)); border: 1px solid var(--line); border-radius: 2px; cursor: pointer; transition: transform .25s ease, border-color .25s ease; }
.offer-card:hover { transform: translateY(-6px); border-color: rgba(199,255,53,.6); }
.offer-index { position: absolute; right: -4px; top: -23px; color: rgba(255,255,255,.035); font-size: 130px; font-weight: 900; letter-spacing: -.1em; }
.offer-top { position: relative; display: flex; align-items: center; justify-content: space-between; color: var(--lime); font-size: 9px; text-transform: uppercase; letter-spacing: .13em; }
.offer-flag { font-size: 24px; }
.club-badge { position: relative; z-index: 2; width: 54px; height: 54px; flex: 0 0 auto; display: grid; place-items: center; overflow: hidden; color: #0a0b0a; background: linear-gradient(145deg, var(--club-color, var(--lime)), color-mix(in srgb, var(--club-color, var(--lime)) 58%, #050605)); border: 1px solid rgba(255,255,255,.22); border-radius: 50%; box-shadow: 0 8px 25px rgba(0,0,0,.22); }
.club-badge img { width: 72%; height: 72%; object-fit: contain; }
.club-badge.has-image { background: rgba(255,255,255,.94); }
.club-badge.locked { color: #777a75; background: #242723; border-style: dashed; box-shadow: none; }
.club-badge.locked.has-image { background: rgba(255,255,255,.68); }
.club-badge b { max-width: 46px; overflow: hidden; font-size: 11px; letter-spacing: -.03em; text-align: center; }
.club-badge.small { width: 34px; height: 34px; box-shadow: none; }
.club-badge.small b { font-size: 8px; }
.offer-card h4 { position: relative; max-width: 260px; margin: 45px 0 8px; font-size: 30px; line-height: .95; letter-spacing: -.045em; }
.offer-card > p { position: relative; margin: 0; color: var(--muted); font-size: 12px; }
.offer-details { position: relative; display: grid; grid-template-columns: .7fr 1.3fr; gap: 10px; margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--line); }
.offer-details span { display: flex; flex-direction: column; font-size: 12px; }
.offer-details small { margin-bottom: 5px; color: var(--muted); font-size: 8px; }
.offer-action { position: absolute; left: 25px; right: 25px; bottom: 22px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.offer-action strong { color: var(--lime); font-size: 22px; }
.story-stage { position: relative; width: min(920px, 100%); min-height: 430px; margin: 58px auto 0; padding: 44px; overflow: hidden; background: linear-gradient(145deg, rgba(31,34,30,.98), rgba(13,15,13,.98)); border: 1px solid rgba(199,255,53,.28); box-shadow: 0 30px 90px rgba(0,0,0,.32); }
.story-stage::before { content: ""; position: absolute; width: 300px; height: 300px; top: -180px; right: -100px; border: 1px solid rgba(199,255,53,.13); border-radius: 50%; }
.story-kicker { color: var(--lime); font: 10px monospace; text-transform: uppercase; letter-spacing: .14em; }
.season-club { position: relative; display: flex; align-items: center; gap: 20px; margin-top: 34px; }
.season-club > .club-badge { width: 82px; height: 82px; }
.season-club div { display: flex; flex-direction: column; }
.season-club div > span { color: var(--muted); font-size: 9px; text-transform: uppercase; letter-spacing: .1em; }
.season-club h3, .scenario-stage h3, .outcome-stage h3 { max-width: 720px; margin: 5px 0 4px; font-size: clamp(38px, 5.2vw, 68px); line-height: .96; letter-spacing: -.06em; }
.season-club p { margin: 0; color: var(--muted); font-size: 12px; }
.season-stage blockquote { margin: 36px 0 28px; padding: 0; max-width: 760px; color: #d7d9d3; font-size: 20px; line-height: 1.5; border: 0; }
.season-numbers { display: grid; grid-template-columns: repeat(5, 1fr); border: 1px solid var(--line); }
.season-numbers span { min-height: 78px; padding: 16px; display: flex; flex-direction: column; justify-content: center; }
.season-numbers span + span { border-left: 1px solid var(--line); }
.season-numbers strong { font-size: 22px; }
.season-numbers small { margin-top: 4px; color: var(--muted); font-size: 8px; text-transform: uppercase; letter-spacing: .1em; }
.season-numbers .up strong { color: var(--lime); }
.season-numbers .down strong { color: var(--orange); }
.honours-board { margin-top: 22px; border: 1px solid var(--line); background: rgba(7, 8, 7, .45); }
.honours-board-heading { padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--line); }
.honours-board-heading span { color: var(--lime); font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; }
.honours-board-heading small { color: var(--muted); font-size: 10px; }
.annual-honours { padding: 18px; }
.annual-honours + .annual-honours { border-top: 1px solid var(--line); }
.annual-honours h4 { margin: 0 0 12px; color: #c4c7c0; font: 10px monospace; text-transform: uppercase; letter-spacing: .09em; }
.honour-results { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
.honour-result { min-width: 0; min-height: 98px; padding: 12px; display: flex; flex-direction: column; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); }
.honour-result small { color: var(--muted); font-size: 7px; font-weight: 800; text-transform: uppercase; letter-spacing: .09em; }
.honour-result strong { margin: 10px 0 5px; overflow-wrap: anywhere; font-size: 12px; line-height: 1.2; }
.honour-result span { margin-top: auto; color: #7e827c; font-size: 8px; line-height: 1.3; }
.honour-result.won { background: rgba(199,255,53,.1); border-color: rgba(199,255,53,.42); }
.honour-result.won small, .honour-result.won span { color: var(--lime); }
.player-honours-earned { margin-top: 9px; padding: 10px 12px; color: #090a09; background: var(--lime); font-size: 10px; font-weight: 900; }
.world-honours-roll { margin-top: 10px; border: 1px solid var(--line); }
.world-honours-roll summary { padding: 12px; color: #bfc2bc; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .09em; cursor: pointer; }
.world-honours-roll[open] summary { color: var(--lime); border-bottom: 1px solid var(--line); }
.world-honours-columns { padding: 14px; display: grid; grid-template-columns: 1.5fr 1fr; gap: 18px; }
.world-honours-columns h5 { margin: 0 0 8px; color: var(--muted); font: 8px monospace; text-transform: uppercase; letter-spacing: .1em; }
.world-honour-row { min-height: 44px; padding: 7px 0; display: grid; grid-template-columns: 24px 1fr; align-items: center; gap: 8px; border-bottom: 1px solid rgba(255,255,255,.06); }
.world-honour-row > span { font-size: 14px; }
.world-honour-row > div { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.world-honour-row strong { font-size: 10px; }
.world-honour-row small { color: var(--muted); font-size: 8px; line-height: 1.35; }
.standing-groups { padding: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 18px; }
.standing-group h5 { margin: 0 0 8px; color: var(--muted); font: 8px monospace; text-transform: uppercase; letter-spacing: .1em; }
.standing-rows { border-top: 1px solid rgba(255,255,255,.08); }
.standing-row { min-height: 38px; padding: 4px 8px; display: grid; grid-template-columns: 22px 28px minmax(0, 1fr) 24px; align-items: center; gap: 7px; border-bottom: 1px solid rgba(255,255,255,.06); }
.standing-row.active { background: rgba(199,255,53,.07); box-shadow: inset 2px 0 var(--lime); }
.standing-row .club-badge.small { width: 24px; height: 24px; font-size: 7px; }
.standing-position { color: #72766f; font: 9px monospace; }
.standing-row strong { min-width: 0; overflow: hidden; color: #c8cbc4; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.standing-marker { width: 19px; height: 19px; display: grid; place-items: center; justify-self: end; color: #090a09; border-radius: 50%; font: 8px monospace; font-weight: 900; }
.standing-marker.c, .standing-marker.p { background: var(--lime); }
.standing-marker.r { color: #fff; background: var(--orange); }
.standing-legend { padding: 0 14px 14px; display: flex; flex-wrap: wrap; gap: 14px; color: var(--muted); font-size: 8px; }
.standing-legend span { display: flex; align-items: center; gap: 5px; }
.standing-legend b { width: 16px; height: 16px; display: grid; place-items: center; color: #090a09; background: var(--lime); border-radius: 50%; font: 7px monospace; }
.standing-legend span:last-child b { color: #fff; background: var(--orange); }
.playoff-brackets { padding: 14px; display: grid; gap: 14px; }
.playoff-bracket { min-width: 0; padding: 12px; background: rgba(255,255,255,.018); border: 1px solid rgba(255,255,255,.07); }
.playoff-bracket-heading { margin-bottom: 12px; display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.playoff-bracket-heading h5 { margin: 0; color: #d0d3cc; font-size: 10px; }
.playoff-bracket-heading small { color: var(--muted); font: 8px monospace; }
.playoff-rounds { padding-bottom: 5px; display: flex; gap: 10px; overflow-x: auto; }
.playoff-round { min-width: 170px; flex: 1 0 170px; }
.playoff-round > span { display: block; margin-bottom: 7px; color: var(--lime); font: 7px monospace; text-transform: uppercase; letter-spacing: .08em; }
.playoff-tie { margin-bottom: 7px; background: rgba(0,0,0,.22); border: 1px solid rgba(255,255,255,.07); }
.playoff-tie > div { min-height: 27px; padding: 5px 7px; display: flex; align-items: center; justify-content: space-between; gap: 5px; color: #777b74; }
.playoff-tie > div + div { border-top: 1px solid rgba(255,255,255,.06); }
.playoff-tie strong { overflow: hidden; font-size: 8px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.playoff-tie .winner { color: #dfe2da; background: rgba(199,255,53,.055); }
.playoff-tie .winner b { color: var(--lime); }
.playoff-tie .active strong { color: var(--lime); }
.story-continue { margin-top: 28px; }
.scenario-stage { padding-top: 38px; }
.scenario-icon { width: 66px; height: 66px; margin-bottom: 24px; display: grid; place-items: center; background: rgba(199,255,53,.1); border: 1px solid rgba(199,255,53,.22); border-radius: 50%; font-size: 31px; }
.scenario-stage h3 { margin-top: 14px; }
.scenario-description { max-width: 760px; margin: 18px 0 30px; color: #b9bdb6; font-size: 16px; line-height: 1.65; }
.scenario-options { display: grid; gap: 10px; }
.scenario-options > button { position: relative; min-height: 126px; padding: 20px 68px 20px 62px; display: grid; grid-template-columns: .8fr 1.2fr; align-items: center; gap: 26px; text-align: left; background: rgba(255,255,255,.025); border: 1px solid var(--line); cursor: pointer; transition: border-color .2s ease, background .2s ease, transform .2s ease; }
.scenario-options > button:hover { background: rgba(199,255,53,.045); border-color: rgba(199,255,53,.5); transform: translateX(4px); }
.option-number { position: absolute; left: 18px; top: 18px; color: #5e625c; font: 10px monospace; }
.option-copy { display: flex; flex-direction: column; gap: 7px; }
.option-copy strong { font-size: 16px; line-height: 1.25; }
.option-copy small { color: var(--muted); font-size: 10px; }
.odds { display: flex; flex-direction: column; gap: 7px; }
.odds span { display: grid; grid-template-columns: 42px 1fr; gap: 8px; color: #aeb1ac; font-size: 10px; line-height: 1.35; }
.odds b { font-family: monospace; }
.odds .positive b { color: var(--lime); }
.odds .negative b { color: var(--orange); }
.scenario-options em { position: absolute; right: 18px; bottom: 16px; color: var(--lime); font-size: 9px; font-style: normal; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.outcome-stage { min-height: 470px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.outcome-stage.positive { border-color: rgba(199,255,53,.44); }
.outcome-stage.negative { border-color: rgba(255,101,66,.48); }
.fate-coin { width: 82px; height: 82px; margin-bottom: 22px; display: grid; place-items: center; border-radius: 50%; font-size: 42px; font-weight: 900; }
.outcome-stage.positive .fate-coin { color: #0a0b0a; background: var(--lime); }
.outcome-stage.negative .fate-coin { color: #0a0b0a; background: var(--orange); }
.outcome-stage h3 { margin: 16px auto 14px; max-width: 780px; }
.outcome-stage > p { max-width: 600px; margin: 0; color: var(--muted); line-height: 1.6; }
.career-lower { display: grid; grid-template-columns: 1fr 320px; gap: 12px; margin-top: 60px; }
.timeline-panel, .achievements-panel { padding: 24px; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; border-bottom: 1px solid var(--line); }
.panel-heading h3 { margin: 0; font-size: 17px; }
.panel-heading span { color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: .1em; }
.empty-state { margin: 28px 0 8px; color: var(--muted); font-size: 13px; }
.timeline { display: flex; flex-direction: column; }
.timeline-row { display: grid; grid-template-columns: 54px 34px 1fr auto; align-items: center; gap: 12px; min-height: 70px; border-bottom: 1px solid rgba(255,255,255,.07); }
.timeline-age { color: var(--muted); font: 10px monospace; }
.timeline-flag { font-size: 19px; }
.timeline-row div { display: flex; flex-direction: column; gap: 4px; }
.timeline-row strong { font-size: 13px; }
.timeline-row small { color: var(--muted); font-size: 10px; }
.rating-rise, .rating-fall { font: 11px monospace; }
.rating-rise { color: var(--lime); }
.rating-fall { color: var(--orange); }
.achievement-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
.achievement-list div { padding: 12px; display: flex; align-items: center; gap: 12px; background: rgba(199,255,53,.06); border: 1px solid rgba(199,255,53,.12); }
.achievement-list span { width: 24px; height: 24px; display: grid; place-items: center; color: #090a09; background: var(--lime); border-radius: 50%; font-size: 9px; font-weight: 900; }
.achievement-list strong { font-size: 11px; }

.trophy-room-page { min-height: 760px; }
.trophy-room-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; margin-bottom: 30px; }
.trophy-room-heading h2 { margin: 16px 0 12px; font-size: clamp(58px, 7vw, 100px); line-height: .86; letter-spacing: -.07em; text-transform: uppercase; }
.trophy-room-heading h2 em { color: var(--lime); font-style: normal; }
.trophy-room-heading p { max-width: 680px; margin: 0; color: var(--muted); font-size: 15px; line-height: 1.55; }
.collection-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border: 1px solid var(--line); background: rgba(255,255,255,.02); }
.collection-tabs > button { min-height: 92px; padding: 18px 22px; display: flex; align-items: center; gap: 14px; color: var(--muted); background: none; border: 0; cursor: pointer; text-align: left; }
.collection-tabs > button + button { border-left: 1px solid var(--line); }
.collection-tabs > button > span { font-size: 28px; filter: grayscale(1); opacity: .45; }
.collection-tabs > button div { display: flex; flex-direction: column; gap: 5px; }
.collection-tabs small { font-size: 9px; font-weight: 900; letter-spacing: .11em; text-transform: uppercase; }
.collection-tabs strong { color: var(--ink); font-size: 17px; }
.collection-tabs > button.active { color: var(--lime); background: rgba(199,255,53,.075); box-shadow: inset 0 -2px 0 var(--lime); }
.collection-tabs > button.active > span { filter: none; opacity: 1; }
.collection-tabs > button.active strong { color: var(--lime); }
.collection-toolbar { min-height: 66px; margin: 12px 0 34px; padding: 12px 14px 12px 20px; display: flex; align-items: center; justify-content: space-between; gap: 18px; background: rgba(255,255,255,.025); border: 1px solid var(--line); }
.collection-toolbar > div { display: flex; align-items: center; gap: 13px; color: var(--muted); font-size: 9px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
.collection-toolbar button { padding: 11px 15px; color: var(--muted); background: transparent; border: 1px solid var(--line); font-size: 9px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; }
.collection-toolbar button:hover, .collection-toolbar button.active { color: #090a09; background: var(--lime); border-color: var(--lime); }
.collection-progress { color: var(--muted); font: 11px monospace; white-space: nowrap; }
.collection-progress strong { color: var(--lime); font-size: 15px; }
.collection-cabinet, .club-album { display: grid; gap: 44px; }
.collection-section > header, .album-league > header { margin-bottom: 12px; padding-bottom: 12px; display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; border-bottom: 1px solid var(--line); }
.collection-section > header > div { display: flex; align-items: baseline; gap: 12px; }
.collection-section > header > div > span { color: #575a55; font: 10px monospace; }
.collection-section h3, .album-league h3 { margin: 0; font-size: 20px; letter-spacing: -.035em; text-transform: uppercase; }
.collection-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }
.collection-tile { position: relative; min-height: 142px; padding: 17px; display: flex; align-items: flex-start; gap: 13px; overflow: hidden; background: linear-gradient(145deg, rgba(28,31,27,.95), rgba(13,15,13,.95)); border: 1px solid var(--line); }
.collection-tile::after { content: ""; position: absolute; right: -30px; bottom: -38px; width: 90px; height: 90px; border: 1px solid rgba(255,255,255,.06); border-radius: 50%; }
.collection-icon { width: 42px; height: 42px; flex: 0 0 auto; display: grid; place-items: center; background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.08); border-radius: 50%; font-size: 20px; }
.collection-tile > div { min-width: 0; display: flex; flex-direction: column; }
.collection-tile small { color: var(--muted); font-size: 7px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
.collection-tile strong { margin-top: 8px; font-size: 12px; line-height: 1.3; }
.collection-tile p { margin: 10px 0 0; color: var(--muted); font-size: 8px; line-height: 1.4; }
.collection-tile.unlocked { background: linear-gradient(145deg, rgba(44,51,29,.98), rgba(16,20,13,.98)); border-color: rgba(199,255,53,.38); }
.collection-tile.unlocked .collection-icon { color: #090a09; background: var(--lime); border-color: var(--lime); box-shadow: 0 0 30px rgba(199,255,53,.14); }
.collection-tile.individual.unlocked { background: linear-gradient(145deg, rgba(48,40,23,.98), rgba(20,16,11,.98)); border-color: rgba(243,198,103,.42); }
.collection-tile.individual.unlocked .collection-icon { background: #f3c667; border-color: #f3c667; }
.collection-tile.locked { color: #7c7f79; filter: saturate(.15); opacity: .58; }
.collection-tile.locked .collection-icon { filter: grayscale(1); }
.duplicate-count { position: absolute; top: 10px; right: 10px; min-width: 25px; height: 25px; padding: 0 6px; display: grid; place-items: center; color: #090a09; background: var(--lime); border-radius: 20px; font-size: 9px; }
.lock-mark { position: absolute; top: 12px; right: 13px; color: #6d706b; font-size: 15px; }
.collection-filter-empty { min-height: 150px; display: grid; place-items: center; padding: 24px; color: var(--muted); background: rgba(255,255,255,.025); border: 1px dashed var(--line); font-size: 12px; text-align: center; }
.badge-source-note { padding: 14px 16px; display: flex; justify-content: space-between; gap: 18px; color: var(--muted); background: rgba(199,255,53,.045); border: 1px solid rgba(199,255,53,.16); font-size: 9px; line-height: 1.5; }
.badge-source-note span { color: #cbd0c6; }
.album-league > header > div { display: flex; align-items: center; gap: 12px; }
.album-league > header > div > span { font-size: 24px; }
.album-league > header small { display: block; margin-bottom: 4px; color: var(--muted); font-size: 7px; letter-spacing: .09em; text-transform: uppercase; }
.club-album-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 7px; }
.club-album-card { min-height: 154px; padding: 15px 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; text-align: center; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.075); }
.club-album-card > strong { max-width: 100%; overflow-wrap: anywhere; font-size: 10px; line-height: 1.25; }
.club-album-card > small { color: var(--muted); font-size: 7px; letter-spacing: .06em; text-transform: uppercase; }
.club-album-card.unlocked { background: linear-gradient(155deg, rgba(34,39,25,.96), rgba(14,16,13,.96)); border-color: rgba(199,255,53,.3); }
.club-album-card.locked { color: #70736e; opacity: .52; }
.club-album-card.locked .club-badge { filter: grayscale(1); }
.career-archive { margin-top: 48px; border: 1px solid var(--line); background: rgba(255,255,255,.02); }
.career-archive summary { min-height: 62px; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; cursor: pointer; list-style: none; }
.career-archive summary::-webkit-details-marker { display: none; }
.career-archive summary span { font-size: 10px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
.career-archive summary small { color: var(--muted); font-size: 9px; }
.career-archive[open] summary { color: var(--lime); border-bottom: 1px solid var(--line); }
.career-archive-grid { padding: 12px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
.career-archive-grid article { min-height: 72px; padding: 13px; display: grid; grid-template-columns: 30px 1fr auto; align-items: center; gap: 10px; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07); }
.career-archive-grid article > span { font-size: 20px; }
.career-archive-grid article > div { display: flex; flex-direction: column; gap: 5px; }
.career-archive-grid article strong { font-size: 11px; }
.career-archive-grid article small { color: var(--muted); font-size: 8px; }
.career-archive-grid article > b { width: 30px; height: 30px; display: grid; place-items: center; color: #090a09; background: var(--lime); border-radius: 50%; font-size: 9px; }

.summary-page { min-height: 710px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.summary-page h2 { margin: 18px 0 22px; font-size: clamp(58px, 8vw, 108px); }
.summary-lead { max-width: 560px; color: var(--muted); font-size: 16px; line-height: 1.6; }
.summary-score { width: 220px; height: 220px; margin: 34px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(199,255,53,.35); border-radius: 50%; box-shadow: 0 0 80px rgba(199,255,53,.08); }
.summary-score span, .summary-score small { color: var(--lime); font: 9px monospace; letter-spacing: .12em; }
.summary-score strong { font-size: 88px; line-height: .95; letter-spacing: -.09em; }
.summary-stats { width: min(760px, 100%); display: grid; grid-template-columns: repeat(5, 1fr); margin-bottom: 36px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.summary-stats div { padding: 18px; display: flex; flex-direction: column; }
.summary-stats div + div { border-left: 1px solid var(--line); }
.summary-stats strong { font-size: 26px; }
.summary-stats span { color: var(--muted); font-size: 9px; text-transform: uppercase; letter-spacing: .1em; }

footer { position: relative; z-index: 1; width: min(1320px, calc(100% - 64px)); margin: 0 auto; padding: 28px 0 36px; display: flex; justify-content: space-between; color: #646762; border-top: 1px solid var(--line); font-size: 9px; letter-spacing: .09em; text-transform: uppercase; }

@media (max-width: 1000px) {
  .hero { grid-template-columns: 1fr; text-align: center; gap: 30px; }
  .hero-copy > p { margin-left: auto; margin-right: auto; }
  .hero-actions, .nation-strip { justify-content: center; }
  .setup-grid { grid-template-columns: 1fr; }
  .live-card { position: relative; top: 0; max-width: 520px; margin: 0 auto; }
  .country-grid { grid-template-columns: repeat(5, 1fr); }
  .position-grid { grid-template-columns: repeat(5, 1fr); }
  .career-stats { grid-template-columns: repeat(3, 1fr); }
  .career-stats > div:nth-child(4) { border-left: 0; border-top: 1px solid var(--line); }
  .career-stats > div:nth-child(5), .career-stats > div:nth-child(6) { border-top: 1px solid var(--line); }
  .career-vitals { grid-template-columns: repeat(2, 1fr); }
  .career-vitals .agent-pill { grid-column: 1 / -1; }
  .offers-grid { grid-template-columns: 1fr; }
  .offer-card { min-height: 290px; }
  .career-lower { grid-template-columns: 1fr; }
  .honour-results { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .world-honours-columns { grid-template-columns: 1fr; }
  .collection-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .club-album-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (max-width: 680px) {
  .topbar, .hero, .manifesto, .setup-page, .career-page, .summary-page, .trophy-room-page, footer { width: min(100% - 32px, 1320px); }
  .topbar { height: 70px; }
  .save-status { display: none; }
  .topbar-right { gap: 4px; }
  .trophy-nav { font-size: 0; }
  .trophy-nav::before { content: "Trophies"; font-size: 12px; }
  .hero { min-height: auto; padding: 54px 0 80px; }
  .hero h1 { font-size: clamp(49px, 15vw, 76px); }
  .hero-copy > p { font-size: 15px; }
  .hero-actions, .summary-actions { flex-direction: column; align-items: stretch; }
  .hero-card-wrap { min-height: 450px; transform: scale(.88); margin: -30px 0; }
  .orbit-one { width: 430px; height: 430px; }
  .tag-left { left: -10px; }
  .tag-right { right: -10px; }
  .manifesto { grid-template-columns: 1fr; }
  .manifesto > div { padding: 26px 0; }
  .manifesto > div + div { padding-left: 0; border-left: 0; border-top: 1px solid var(--line); }
  .setup-page, .career-page { padding-top: 34px; }
  .page-heading h2 { font-size: 50px; }
  .form-panel { padding: 22px 16px; }
  .field-grid { grid-template-columns: 1fr 110px; }
  .country-grid { grid-template-columns: repeat(2, 1fr); }
  .position-grid { grid-template-columns: repeat(5, 1fr); }
  .career-head { align-items: flex-start; }
  .mini-shirt { width: 56px; height: 64px; }
  .identity-block { gap: 12px; }
  .identity-block .eyebrow { font-size: 8px; }
  .identity-block h2 { font-size: 34px; }
  .rating-block strong { font-size: 64px; }
  .career-stats { grid-template-columns: repeat(2, 1fr); }
  .career-stats > div:nth-child(odd) { border-left: 0; }
  .career-stats > div:nth-child(n+3) { border-top: 1px solid var(--line); }
  .career-vitals { grid-template-columns: 1fr 1fr; }
  .career-vitals .agent-pill { grid-column: 1 / -1; }
  .latest-season { align-items: flex-start; flex-direction: column; gap: 5px; }
  .latest-season > span:last-child { margin-left: 0; line-height: 1.5; }
  .decision-heading { margin-top: 48px; align-items: flex-start; flex-direction: column; gap: 18px; }
  .decision-dock { margin-top: 26px; }
  .decision-dock > *, .decision-dock .scenario-stage, .decision-dock .outcome-stage { padding: 24px 16px; }
  .dock-heading { flex-direction: column; gap: 16px; }
  .origin-facts { grid-template-columns: 1fr; }
  .origin-facts span + span { border-left: 0; border-top: 1px solid var(--line); }
  .club-options > button { min-height: 132px; padding: 16px 44px 16px 44px; gap: 12px; align-items: flex-start; }
  .club-options .club-badge { width: 46px; height: 46px; }
  .club-option-copy { grid-template-columns: 1fr; row-gap: 3px; }
  .club-option-copy > small, .club-option-copy > strong, .club-option-copy > span, .club-option-copy > p { grid-column: 1; grid-row: auto; }
  .club-option-copy > strong { font-size: 17px; }
  .club-option-copy > p { margin-top: 8px; font-size: 10px; }
  .club-options em { right: 10px; bottom: 10px; }
  .motion-card { padding: 32px 20px; }
  .offer-card h4 { margin-top: 38px; }
  .story-stage { margin-top: 38px; padding: 28px 18px; }
  .season-club > .club-badge { width: 64px; height: 64px; }
  .season-stage blockquote { font-size: 17px; }
  .season-numbers { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .season-numbers span { min-height: 66px; padding: 10px 4px; align-items: center; text-align: center; }
  .season-numbers strong { font-size: 17px; }
  .honours-board-heading { align-items: flex-start; flex-direction: column; }
  .honour-results { grid-template-columns: 1fr; }
  .scenario-options > button { padding: 20px 18px 42px 48px; grid-template-columns: 1fr; gap: 16px; }
  .scenario-stage h3, .outcome-stage h3 { font-size: 38px; }
  .career-lower { margin-top: 38px; }
  .timeline-row { grid-template-columns: 48px 28px 1fr; }
  .timeline-row > span:last-child { display: none; }
  .summary-stats { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .summary-stats div { padding: 12px 4px; }
  .summary-stats strong { font-size: 20px; }
  .trophy-room-page { padding-top: 42px; }
  .trophy-room-heading { align-items: stretch; flex-direction: column; }
  .trophy-room-heading h2 { font-size: 54px; }
  .collection-tabs > button { padding: 14px; }
  .collection-toolbar { align-items: stretch; flex-direction: column; }
  .collection-toolbar button { width: 100%; }
  .collection-grid { grid-template-columns: 1fr; }
  .club-album-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .badge-source-note { flex-direction: column; }
  .career-archive-grid { grid-template-columns: 1fr; }
  footer { flex-direction: column; gap: 10px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;
