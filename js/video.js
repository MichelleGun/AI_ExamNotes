// Narrated, animated lesson player ("videos") for each lecture.
// Lessons live in js/videos/lN.js and register with VIDEO_LESSONS[id] = { title, chapters: [{ t, scenes: [{ v, n }] }] }.
// v = visual HTML. n = narration sentences. Any element with data-s="k" appears when sentence k starts.
// data-x="k" hides it again at sentence k. data-on="k:cls k2:cls2" swaps a class on at sentence k.
(function () {
  window.VIDEO_LESSONS = window.VIDEO_LESSONS || {};
  window.VIDEO_READY = ["l2"]; // lessons that have a video file in js/videos/
  const WPS = 2.75; // words per second at rate 1, used for timing estimates and silent mode
  const ST_KEY = "aiexam_vid";
  let st = {}; try { st = JSON.parse(localStorage.getItem(ST_KEY) || "{}"); } catch (e) { st = {}; }
  st.set = st.set || { rate: 1, voice: "", muted: false, cc: true }; st.pos = st.pos || {};
  const saveSt = () => { try { localStorage.setItem(ST_KEY, JSON.stringify(st)); } catch (e) { } };
  const hasTTS = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

  // ---------- authoring kit ----------
  const at = (k, html, cls = "", tag = "div") => `<${tag} class="vk-i ${cls}" data-s="${k}">${html}</${tag}>`;
  const K = {
    at,
    title: (h, sub, k = 0) => `<div class="vk-title"><div class="vk-kicker" data-s="${k}">${sub || ""}</div><h2 class="vk-i" data-s="${k}">${h}</h2></div>`,
    h: (h) => `<h3 class="vk-h">${h}</h3>`,
    list: (items, cls = "") => `<ul class="vk-list ${cls}">${items.map(([k, t]) => `<li class="vk-i" data-s="${k}">${t}</li>`).join("")}</ul>`,
    fx: (k, t, cls = "") => at(k, t, "vk-fx " + cls),
    card: (k, kind, t) => at(k, t, "vk-card " + kind),
    big: (k, t, cls = "") => at(k, t, "vk-big " + cls),
    flow: (items, cls = "") => `<div class="vk-flow ${cls}">${items.map(([k, t], i) => (i ? `<span class="vk-i vk-arrow" data-s="${k}">→</span>` : "") + `<div class="vk-i vk-step" data-s="${k}">${t}</div>`).join("")}</div>`,
    split: (a, b, cls = "") => `<div class="vk-split ${cls}"><div class="vk-main">${a}</div><div class="vk-side">${b}</div></div>`,
    cols: (...c) => `<div class="vk-cols n${c.length}">${c.map(x => `<div>${x}</div>`).join("")}</div>`,
    tbl: (head, rows, cls = "") => `<table class="vk-tbl ${cls}"><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr>${rows.map(([k, ...cells]) => `<tr class="vk-i" data-s="${k}">${cells.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`,
    svg: (key, k = 0) => at(k, (window.SVG && window.SVG[key]) || "", "vk-svg"),
    // Small graph: nodes {id: [x, y, label]}, edges [[a, b, label, k]], on: {id: "k:cls k:cls"}
    graph: (w, h, nodes, edges, on = {}, eon = {}) => {
      const N = nodes; const r = 17;
      const E = edges.map(([a, b, lab, k = 0, dir]) => {
        const [x1, y1] = N[a], [x2, y2] = N[b]; const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
        const sx = x1 + dx / L * r, sy = y1 + dy / L * r, ex = x2 - dx / L * (r + (dir ? 3 : 0)), ey = y2 - dy / L * (r + (dir ? 3 : 0));
        const id = a + "-" + b;
        return `<g class="vk-i vk-e" data-s="${k}" ${eon[id] ? `data-on="${eon[id]}"` : ""}><line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" ${dir ? 'marker-end="url(#vkah)"' : ""}/>${lab !== "" && lab != null ? `<text x="${(x1 + x2) / 2 - dy / L * 10}" y="${(y1 + y2) / 2 + dx / L * 10 + 4}" text-anchor="middle" class="vk-el">${lab}</text>` : ""}</g>`;
      }).join("");
      const V = Object.entries(N).map(([id, [x, y, lab, k = 0, cls = "", sub = ""]]) => `<g class="vk-i vk-n ${cls}" data-s="${k}" ${on[id] ? `data-on="${on[id]}"` : ""}><circle cx="${x}" cy="${y}" r="${r}"/><text x="${x}" y="${y + 4.5}" text-anchor="middle">${lab == null ? id : lab}</text>${sub ? `<text class="vk-sub" x="${x}" y="${y + r + 12}" text-anchor="middle">${sub}</text>` : ""}</g>`).join("");
      return `<svg class="vk-g" viewBox="0 0 ${w} ${h}"><defs><marker id="vkah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>${E}${V}</svg>`;
    }
  };
  window.VK = K;

  // ---------- player ----------
  const ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM9.5 12L18 18V6z"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>',
    vol: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 5V4L8 9zm12.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/></svg>',
    mute: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 5V4L8 9zm15.6 3l2.1-2.1-1.4-1.4-2.1 2.1-2.1-2.1-1.4 1.4 2.1 2.1-2.1 2.1 1.4 1.4 2.1-2.1 2.1 2.1 1.4-1.4z"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M5 5h5v2H7v3H5zm9 0h5v5h-2V7h-3zM5 14h2v3h3v2H5zm12 3v-3h2v5h-5v-2z"/></svg>',
    cc: '<svg viewBox="0 0 24 24"><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm6.5 5.5v-.5a1.5 1.5 0 0 0-1.5-1.5H8A1.5 1.5 0 0 0 6.5 10v4A1.5 1.5 0 0 0 8 15.5h1a1.5 1.5 0 0 0 1.5-1.5v-.5H9v.5H8v-4h1v.5zm7 0v-.5a1.5 1.5 0 0 0-1.5-1.5h-1a1.5 1.5 0 0 0-1.5 1.5v4a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-.5H16v.5h-1v-4h1v.5z"/></svg>'
  };
  const words = s => s.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  const fmt = sec => { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); };
  const plain = s => s.replace(/<[^>]+>/g, "");

  function flatten(L) {
    const seq = []; let t = 0;
    // each narration entry may hold several sentences: speak and caption them one at a time, same visual step k
    L.chapters.forEach((ch, ci) => ch.scenes.forEach((sc, si) => sc.n.forEach((s0, k) => {
      const parts = s0.split(/(?<=[.!?])\s+/);
      const merged = []; parts.map(x => x.trim()).filter(Boolean).forEach(x => { if (merged.length && (words(x) < 5 || words(merged[merged.length - 1]) < 5)) merged[merged.length - 1] += " " + x; else merged.push(x); });
      merged.forEach(s => { const d = words(s) / WPS + 0.3; seq.push({ ci, si, k, s, t, d }); t += d; });
    })));
    return { seq, total: t };
  }
  window.lessonLength = id => { const L = VIDEO_LESSONS[id]; return L ? flatten(L).total : 0; };

  let current = null;
  function stopAll() { if (current) current.pause(); }
  window.addEventListener("hashchange", stopAll);
  document.addEventListener("visibilitychange", () => { if (document.hidden && current && current.speaking()) { /* keep playing audio in background */ } });

  function pickVoice(pref) {
    if (!hasTTS) return null;
    const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
    if (!vs.length) return null;
    if (pref) { const v = vs.find(v => v.name === pref); if (v) return v; }
    const rank = v => (/natural/i.test(v.name) ? 0 : /google uk english female|google us english|aria|jenny|sonia|libby|natasha|samantha|karen|daniel/i.test(v.name) ? 1 : /en-(au|gb|us)/i.test(v.lang) ? 2 : 3);
    return vs.slice().sort((a, b) => rank(a) - rank(b))[0];
  }

  function mount(id, slot, startSec) {
    const L = VIDEO_LESSONS[id]; if (!L || !slot) return;
    const { seq, total } = flatten(L);
    const chStart = L.chapters.map((_, ci) => seq.find(x => x.ci === ci).t);
    const saved = st.pos[id] || {};
    let startCh = null;
    if (typeof startSec === "string" && startSec[0] === "c") startCh = Math.min(+startSec.slice(1) || 0, L.chapters.length - 1);
    else if (startSec != null) { startCh = L.chapters.findIndex(c => (c.sec || []).includes(startSec)); if (startCh < 0) startCh = 0; }
    let idx = startCh != null ? seq.findIndex(x => x.ci === startCh) : Math.min(saved.i || 0, seq.length - 1), playing = false, token = 0, timer = null, watchdog = null, sceneKey = "";
    slot.innerHTML = `<div class="vk" tabindex="0">
      <div class="vk-stage"><div class="vk-scene"></div><div class="vk-cap"></div>
        <button class="vk-poster" aria-label="Play lesson"><span class="vk-pbtn">${ICON.play}</span><span class="vk-ptitle">${L.title}</span><span class="vk-pmeta">${fmt(total)} · ${L.chapters.length} chapters${startCh != null ? "<br>Starts at chapter " + (startCh + 1) + ": " + L.chapters[startCh].t : saved.i ? " · resume from " + fmt(seq[idx].t) : ""}${saved.done ? " · watched" : ""}</span></button></div>
      <div class="vk-prog" role="slider" aria-label="Seek"><div class="vk-fill"></div>${chStart.map(t => `<span class="vk-tick" style="left:${t / total * 100}%"></span>`).join("")}</div>
      <div class="vk-ctrl">
        <button class="vk-b vk-prev" aria-label="Previous scene">${ICON.prev}</button><button class="vk-b vk-play" aria-label="Play">${ICON.play}</button><button class="vk-b vk-next" aria-label="Next scene">${ICON.next}</button>
        <button class="vk-b vk-mute" aria-label="Mute">${st.set.muted ? ICON.mute : ICON.vol}</button>
        <span class="vk-time">0:00 / ${fmt(total)}</span><span class="vk-chn"></span>
        <span class="vk-sp"></span>
        <button class="vk-b vk-cc ${st.set.cc ? "on" : ""}" aria-label="Captions">${ICON.cc}</button>
        <select class="vk-rate" aria-label="Speed">${[0.75, 0.9, 1, 1.15, 1.25, 1.5, 1.75, 2].map(r => `<option value="${r}" ${r == st.set.rate ? "selected" : ""}>${r}×</option>`).join("")}</select>
        <button class="vk-b vk-fs" aria-label="Fullscreen">${ICON.full}</button>
      </div>
      <details class="vk-more"><summary>Chapters and voice</summary>
        <ol class="vk-chs">${L.chapters.map((c, ci) => `<li><a href="javascript:void(0)" data-ci="${ci}"><span>${c.t}</span><span class="muted">${fmt(chStart[ci])}</span></a></li>`).join("")}</ol>
        <label class="small">Voice <select class="vk-voice"></select></label>
        <p class="small muted">The narration uses your device's built-in voice. On Windows, Microsoft Edge has the most natural voices. No sound? Turn on captions: the lesson still moves on by itself. Keys: space play/pause, ← → scene, M mute, F fullscreen.</p>
      </details></div>`;
    const R = slot.querySelector(".vk"), q = s => R.querySelector(s);
    const sceneEl = q(".vk-scene"), cap = q(".vk-cap"), fill = q(".vk-fill"), time = q(".vk-time"), chn = q(".vk-chn"), playB = q(".vk-play");
    R.classList.toggle("nocc", !st.set.cc);

    function fillVoices() {
      const sel = q(".vk-voice"); if (!hasTTS) { sel.innerHTML = "<option>No voice on this device</option>"; sel.disabled = true; return; }
      const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); const cur = pickVoice(st.set.voice);
      sel.innerHTML = vs.length ? vs.map(v => `<option ${cur && v.name === cur.name ? "selected" : ""}>${v.name}</option>`).join("") : "<option>Default</option>";
    }
    fillVoices(); if (hasTTS) speechSynthesis.addEventListener("voiceschanged", fillVoices);

    function applyState(sc, k) {
      sceneEl.querySelectorAll("[data-s]").forEach(el => { const s = +el.dataset.s, x = el.dataset.x != null ? +el.dataset.x : 1e9; el.classList.toggle("vk-v", s <= k && k < x); });
      sceneEl.querySelectorAll("[data-on]").forEach(el => {
        const steps = el.dataset.on.trim().split(/\s+/).map(p => { const [a, c] = p.split(":"); return [+a, c]; });
        steps.forEach(([, c]) => c && c.split(",").forEach(cc => el.classList.remove(cc)));
        let best = null; steps.forEach(([a, c]) => { if (a <= k) best = c; }); if (best) best.split(",").forEach(cc => el.classList.add(cc));
      });
    }
    function render(i, animate = true) {
      const x = seq[i]; const ch = L.chapters[x.ci], sc = ch.scenes[x.si]; const key = x.ci + "." + x.si;
      if (key !== sceneKey) { sceneKey = key; sceneEl.innerHTML = `<div class="vk-chip">${x.ci + 1}. ${ch.t}</div>` + sc.v; sceneEl.classList.remove("vk-in"); void sceneEl.offsetWidth; if (animate) sceneEl.classList.add("vk-in"); }
      applyState(sc, x.k);
      cap.textContent = plain(x.s);
      fill.style.width = (x.t / total * 100) + "%"; time.textContent = fmt(x.t) + " / " + fmt(total); chn.textContent = ch.t;
      R.querySelectorAll(".vk-chs a").forEach(a => a.classList.toggle("on", +a.dataset.ci === x.ci));
    }
    function remember(done) { st.pos[id] = { i: done ? 0 : idx, done: done || (st.pos[id] && st.pos[id].done) || false }; saveSt(); }
    function clear() { clearTimeout(timer); clearTimeout(watchdog); timer = watchdog = null; }
    function step() {
      clear(); const my = ++token; render(idx);
      const x = seq[idx]; const rate = +st.set.rate || 1; const dur = x.d / rate * 1000;
      const advance = () => { if (my !== token || !playing) return; clear(); if (idx >= seq.length - 1) { finish(); return; } const sceneChange = seq[idx + 1].si !== x.si || seq[idx + 1].ci !== x.ci; idx++; remember(); timer = setTimeout(step, sceneChange ? 650 : 120); };
      const v = !st.set.muted && pickVoice(st.set.voice);
      if (!v) { timer = setTimeout(advance, dur + 250); return; }
      try { speechSynthesis.cancel(); } catch (e) { }
      const u = new SpeechSynthesisUtterance(plain(x.s).replace(/→/g, " to ").replace(/×/g, " times ").replace(/≈/g, " approximately ").replace(/≤/g, " less than or equal to ").replace(/≥/g, " greater than or equal to ").replace(/¬/g, " not "));
      u.voice = v; u.lang = v.lang; u.rate = rate; u.onend = advance; u.onerror = e => { if (e.error === "interrupted" || e.error === "canceled") return; timer = setTimeout(advance, dur); };
      speechSynthesis.speak(u);
      watchdog = setTimeout(advance, dur * 2.6 + 4000);
    }
    function play() { if (current && current !== api) current.pause(); current = api; R.classList.add("started"); playing = true; playB.innerHTML = ICON.pause; playB.setAttribute("aria-label", "Pause"); step(); }
    function pause() { playing = false; token++; clear(); if (hasTTS) try { speechSynthesis.cancel(); } catch (e) { } playB.innerHTML = ICON.play; playB.setAttribute("aria-label", "Play"); remember(); }
    function finish() { pause(); remember(true); R.classList.add("ended"); cap.textContent = "Lesson complete. Now test yourself with the quiz and flashcards for this week."; if (window.toast) toast("Lesson finished"); }
    function seek(i) { idx = Math.max(0, Math.min(seq.length - 1, i)); R.classList.add("started"); R.classList.remove("ended"); if (playing) step(); else { render(idx); remember(); } }
    function sceneJump(dir) { const x = seq[idx]; let j = idx; if (dir < 0) { j = seq.findIndex(y => y.ci === x.ci && y.si === x.si); if (idx - j < 2 && j > 0) { const p = seq[j - 1]; j = seq.findIndex(y => y.ci === p.ci && y.si === p.si); } } else { while (j < seq.length && seq[j].ci === x.ci && seq[j].si === x.si) j++; } seek(j); }
    const api = { pause, speaking: () => playing, seek, seq };
    window.__vk = api;

    q(".vk-poster").onclick = () => play();
    playB.onclick = () => (playing ? pause() : play());
    q(".vk-prev").onclick = () => sceneJump(-1); q(".vk-next").onclick = () => sceneJump(1);
    q(".vk-mute").onclick = e => { st.set.muted = !st.set.muted; saveSt(); e.currentTarget.innerHTML = st.set.muted ? ICON.mute : ICON.vol; if (playing) step(); };
    q(".vk-cc").onclick = e => { st.set.cc = !st.set.cc; saveSt(); e.currentTarget.classList.toggle("on", st.set.cc); R.classList.toggle("nocc", !st.set.cc); };
    q(".vk-rate").onchange = e => { st.set.rate = +e.target.value; saveSt(); if (playing) step(); };
    q(".vk-voice").onchange = e => { st.set.voice = e.target.value; saveSt(); if (playing) step(); };
    q(".vk-fs").onclick = () => { const el = R; if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen(); else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); };
    R.querySelectorAll(".vk-chs a").forEach(a => a.onclick = () => seek(seq.findIndex(x => x.ci === +a.dataset.ci)));
    q(".vk-prog").onclick = e => { const r = e.currentTarget.getBoundingClientRect(); const t = (e.clientX - r.left) / r.width * total; let j = 0; while (j < seq.length - 1 && seq[j + 1].t <= t) j++; seek(j); };
    q(".vk-stage").addEventListener("click", e => { if (e.target.closest(".vk-poster")) return; if (R.classList.contains("started")) playing ? pause() : play(); });
    R.addEventListener("keydown", e => {
      if (e.target.tagName === "SELECT") return;
      if (e.key === " ") { e.preventDefault(); playing ? pause() : play(); } else if (e.key === "ArrowRight") sceneJump(1); else if (e.key === "ArrowLeft") sceneJump(-1);
      else if (e.key === "m" || e.key === "M") q(".vk-mute").click(); else if (e.key === "f" || e.key === "F") q(".vk-fs").click();
    });
    render(idx, false);
    return api;
  }

  // Load js/videos/<id>.js on demand, then mount
  window.mountVideo = function (id, slot, startSec) {
    if (!slot || !VIDEO_READY.includes(id)) return;
    if (VIDEO_LESSONS[id]) { mount(id, slot, startSec); return; }
    slot.innerHTML = `<div class="vk loading"><div class="vk-stage"><div class="vk-poster"><span class="vk-ptitle">Loading lesson...</span></div></div></div>`;
    const s = document.createElement("script"); s.src = "js/videos/" + id + ".js";
    s.onload = () => { if (VIDEO_LESSONS[id]) mount(id, slot, startSec); else slot.innerHTML = ""; };
    s.onerror = () => { slot.innerHTML = ""; };
    document.head.appendChild(s);
  };
})();
