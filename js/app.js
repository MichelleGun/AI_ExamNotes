// Main app: routing, state, auth, leaderboard, notes, printing
(function () {
  const CFG = window.APP_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const TOP = window.TOPICS.sort((a, b) => a.num - b.num);
  const topicById = id => TOP.find(t => t.id === id);
  const rng = window.makeRng(CFG.SEED || 67);
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  // ---------- State ----------
  const KEY = "aiexam_v1";
  const blank = () => ({ points: 0, pending: { p: 0, q: 0, c: 0, k: 0 }, box: {}, saved: { cards: [], sections: [] }, notes: [], stats: {}, streak: { last: "", days: 0 }, onb: {}, updated: 0 });
  let S = blank();
  try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { }
  let saveTimer = null;
  function save() {
    S.updated = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
    clearTimeout(saveTimer); saveTimer = setTimeout(cloudSave, 2500);
  }
  function stat(topic) { return S.stats[topic] = S.stats[topic] || { right: 0, total: 0, cards: 0 }; }
  function award(points, kind) {
    S.points += points; S.pending.p += points;
    if (kind) S.pending[kind] = (S.pending[kind] || 0) + 1;
    const today = new Date().toISOString().slice(0, 10);
    if (S.streak.last !== today) { const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10); S.streak.days = S.streak.last === y ? S.streak.days + 1 : 1; S.streak.last = today; }
    save(); renderPoints(); if (points > 0) toast(`+${points} points`);
  }

  // ---------- Supabase ----------
  let sb = null, user = null, profile = null;
  const configured = CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY && window.supabase;
  if (configured) sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
  const emailOf = u => CFG.LOGIN_EMAIL_TEMPLATE ? CFG.LOGIN_EMAIL_TEMPLATE.replace("{username}", u.toLowerCase()) : `${u.toLowerCase()}@${CFG.USERNAME_DOMAIN || "aiexam-revision.app"}`;

  async function initAuth() {
    if (!sb) { renderAuth(); return; }
    const { data } = await sb.auth.getSession();
    user = data.session ? data.session.user : null;
    if (user) await afterLogin();
    renderAuth();
    sb.auth.onAuthStateChange((_e, sess) => { const was = user; user = sess ? sess.user : null; if (!was && user) afterLogin().then(renderAuth); else renderAuth(); });
  }
  async function afterLogin() {
    const { data: p } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    profile = p;
    const { data: d } = await sb.from("user_data").select("data").eq("id", user.id).maybeSingle();
    if (d && d.data && Object.keys(d.data).length) mergeRemote(d.data);
    if (profile) S.points = Math.max(profile.points + S.pending.p, S.points);
    if (tourDoneThisVisit) { S.onb[user.id] = true; cloudSave(); }
    save(); renderPoints(); route();
  }
  function mergeRemote(r) {
    S.saved.cards = [...new Set([...(r.saved?.cards || []), ...S.saved.cards])];
    S.saved.sections = [...new Set([...(r.saved?.sections || []), ...S.saved.sections])];
    const notes = {}; [...(r.notes || []), ...S.notes].forEach(n => { if (!notes[n.id] || notes[n.id].ts < n.ts) notes[n.id] = n; }); S.notes = Object.values(notes).filter(n => !n.deleted || true);
    Object.entries(r.box || {}).forEach(([k, v]) => { S.box[k] = Math.max(v, S.box[k] || 0); });
    Object.entries(r.stats || {}).forEach(([k, v]) => { const s = stat(k); s.right = Math.max(s.right, v.right || 0); s.total = Math.max(s.total, v.total || 0); s.cards = Math.max(s.cards, v.cards || 0); });
    if (r.streak && r.streak.last > S.streak.last) S.streak = r.streak;
    if (r.onboarded && user) S.onb[user.id] = true;
  }
  async function cloudSave() {
    if (!sb || !user) return;
    const data = { saved: S.saved, notes: S.notes, box: S.box, stats: S.stats, streak: S.streak, onboarded: !!(S.onb && S.onb[user.id]) };
    await sb.from("user_data").upsert({ id: user.id, data, updated_at: new Date().toISOString() });
  }
  async function flushPoints() {
    if (!sb || !user || S.pending.p <= 0 && !S.pending.q && !S.pending.c && !S.pending.k) return;
    const send = { p: Math.min(S.pending.p, 60), q: Math.min(S.pending.q || 0, 30), c: Math.min(S.pending.c || 0, 60), k: Math.min(S.pending.k || 0, 20) };
    const { data, error } = await sb.rpc("add_points", { p_points: send.p, p_quizzes: send.q, p_cards: send.c, p_calc: send.k });
    if (!error) { S.pending.p -= send.p; S.pending.q -= send.q; S.pending.c -= send.c; S.pending.k -= send.k; if (profile) profile.points = data; save(); }
  }
  setInterval(flushPoints, 12000);
  document.addEventListener("visibilitychange", () => { if (document.hidden) { flushPoints(); cloudSave(); } });

  function renderAuth() {
    const box = $("#authbox");
    if (!configured) { box.innerHTML = `<button class="btn small" id="signin">Sign in</button>`; $("#signin").onclick = () => openAuth(); return; }
    if (user) {
      const name = profile ? profile.username : (user.user_metadata && user.user_metadata.username) || "me";
      box.innerHTML = `<span class="who" title="Signed in">${esc(name)}</span><button class="btn small ghost" id="signout">Sign out</button>`;
      $("#signout").onclick = async () => { await flushPoints(); await cloudSave(); await sb.auth.signOut(); user = null; profile = null; renderAuth(); toast("Signed out. Progress stays on this device."); };
    } else { box.innerHTML = `<button class="btn small" id="signin">Sign in</button>`; $("#signin").onclick = () => openAuth(); }
  }
  function openAuth(mode = "in") {
    const m = modal(`<h2>${mode === "in" ? "Sign in" : "Create account"}</h2>
      ${configured ? "" : `<p class="warn">Sign in is not set up yet. The site owner must add Supabase keys in <code>js/config.js</code>. You can still study: progress is saved on this device.</p>`}
      <form id="authform"><label>Username<input name="u" autocomplete="username" required pattern="[A-Za-z0-9_]{3,20}" placeholder="3-20 letters, numbers or _"></label>
      <label>Password<input name="p" type="password" autocomplete="${mode === "in" ? "current-password" : "new-password"}" required minlength="6" placeholder="at least 6 characters"></label>
      <div class="err"></div><button class="btn" ${configured ? "" : "disabled"}>${mode === "in" ? "Sign in" : "Sign up"}</button></form>
      <p class="small">${mode === "in" ? `No account? <a href="#" id="swap">Create one</a>` : `Have an account? <a href="#" id="swap">Sign in</a>`}</p>
      <p class="small muted">Only your username, password (encrypted by Supabase) and study progress are stored. No email needed.</p>`);
    $("#swap", m).onclick = e => { e.preventDefault(); closeModal(); openAuth(mode === "in" ? "up" : "in"); };
    $("#authform", m).onsubmit = async e => {
      e.preventDefault(); const u = e.target.u.value.trim(), p = e.target.p.value; const err = $(".err", m); err.textContent = "Please wait...";
      try {
        if (mode === "up") {
          const { data: taken } = await sb.rpc("username_taken", { p_username: u });
          if (taken) { err.textContent = "That username is taken."; return; }
          const { error } = await sb.auth.signUp({ email: emailOf(u), password: p, options: { data: { username: u } } });
          if (error) throw error;
          const { error: e2 } = await sb.auth.signInWithPassword({ email: emailOf(u), password: p });
          if (e2) throw new Error(e2.message + " (Owner: turn off 'Confirm email' in Supabase Auth settings.)");
        } else {
          const { error } = await sb.auth.signInWithPassword({ email: emailOf(u), password: p });
          if (error) throw new Error(error.message === "Invalid login credentials" ? "Wrong username or password." : error.message);
        }
        closeModal(); toast("Welcome, " + u);
      } catch (x) { err.textContent = x.message; }
    };
  }

  // ---------- UI helpers ----------
  function modal(html) { const w = $("#modal"); w.innerHTML = `<div class="mcard"><button class="x" aria-label="Close">×</button>${html}</div>`; w.hidden = false; $(".x", w).onclick = closeModal; w.onclick = e => { if (e.target === w) closeModal(); }; return w; }
  function closeModal() { $("#modal").hidden = true; }
  let toastT; function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("on"), 1800); }
  function renderPoints() { $$(".pts").forEach(e => e.textContent = S.points); $$(".streak").forEach(e => e.textContent = S.streak.days); }
  const topicSelect = (sel, all = true) => `<select class="tsel">${all ? `<option value="all">All topics</option>` : ""}${TOP.map(t => `<option value="${t.id}" ${sel === t.id ? "selected" : ""}>L${t.num} ${t.title}</option>`).join("")}</select>`;

  // ---------- Theme ----------
  function setTheme(t) { document.documentElement.setAttribute("data-theme", t); try { localStorage.setItem("aiexam_theme", t); } catch (e) { } $("#theme").textContent = t === "dark" ? "Light" : "Dark"; }
  let th = null; try { th = localStorage.getItem("aiexam_theme"); } catch (e) { }
  setTheme(th || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  $("#theme").onclick = () => setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");

  // ---------- Pages ----------
  const main = $("#main");
  function route() {
    const [, page = "", a = "", b = ""] = (location.hash || "#/").split("/");
    $$(".nav a").forEach(x => x.classList.toggle("on", x.getAttribute("href").split("/")[1] === page));
    window.scrollTo(0, 0);
    ({ "": home, topic: topicPage, topics: topicsList, cards: cardsPage, quiz: quizPage, practice: practicePage, tools: toolsPage, sheet: sheetPage, notes: notesPage, board: boardPage }[page] || home)(a || undefined, b || undefined);
    WIDGETS.mount(main);
  }
  window.addEventListener("hashchange", route);

  function home() {
    const totalCards = Object.values(CARDS).reduce((s, a) => s + a.length, 0), totalQ = Object.values(QUESTIONS).reduce((s, a) => s + a.length, 0);
    main.innerHTML = `<section class="hero"><h1>AI Final Exam Revision</h1><p>Lectures 2 to 12 (Module 1 not examined). 120 minutes: MCQ, multiple answers, true/false, fill in blanks, matching. Bring a calculator and hard-copy notes.</p>
      <div class="stats"><div><b class="pts">${S.points}</b><span>points</span></div><div><b class="streak">${S.streak.days}</b><span>day streak</span></div><div><b>${Object.keys(S.box).filter(k => S.box[k] >= 3).length}/${totalCards}</b><span>cards mastered</span></div></div>
      <div class="cta"><a class="btn" href="#/quiz/mixed">Start a mixed exam quiz</a><a class="btn ghost" href="#/practice">Practise calculations</a><a class="btn ghost" href="#/sheet">Printable cheat sheet</a></div></section>
      <h2>Topics</h2><div class="grid">${TOP.map(t => { const s = stat(t.id); const pc = s.total ? Math.round(100 * s.right / s.total) : 0; return `<a class="tcard" href="#/topic/${t.id}"><span class="tn">L${t.num}</span><b>${t.title}</b><small>${t.sub}</small><div class="prog"><span style="width:${pc}%"></span></div><small class="muted">Quiz accuracy ${s.total ? pc + "%" : "not started"}</small></a>`; }).join("")}</div>
      <h2>Exam calculation checklist</h2><div class="checklist">${[["Search evaluation functions (UCS, Greedy, A*)", "l2", "astar"], ["Loss functions (squared error)", "l4", "sse"], ["Q-functions and utility functions", "l6", "qvalue"], ["Entropy, information gain, Gini", "l4", "ig"], ["Probability, conditional probability, Naive Bayes, BN", "l11", "bayes"], ["Convolution, pooling, receptive field, parameter count", "l7", "convsize"], ["IoU and non-max suppression", "l7", "iou"], ["Simple RNN hidden-state update", "l8", "rnn"], ["Attention: weighted value aggregation", "l8", "attn"]].map(([n, t, g]) => `<a href="#/practice/${g}" class="chk">${n}<span>Practise →</span></a>`).join("")}</div>
      <p class="muted small">${totalCards} flashcards, ${totalQ} bank questions, ${GENERATORS.length} unlimited calculation generators, 13 interactive tools.</p>`;
  }

  function topicsList() { home(); }

  function topicPage(id, sec) {
    const t = topicById(id) || TOP[0]; const i = TOP.indexOf(t);
    main.innerHTML = `<div class="crumbs"><a href="#/">Home</a> / L${t.num}</div><h1>L${t.num}: ${t.title}</h1><p class="muted">${t.sub}</p>
      <div class="vslot" id="vslot"></div>
      <div class="tabs"><a class="on">Notes</a><a href="#/cards/${t.id}">Flashcards (${(CARDS[t.id] || []).length})</a><a href="#/quiz/${t.id}">Quiz (${(QUESTIONS[t.id] || []).length})</a>${GENERATORS.some(g => g.topic === t.id) ? `<a href="#/practice/${GENERATORS.find(g => g.topic === t.id).id}">Calc practice</a>` : ""}</div>
      <div class="toc">${t.sections.map((s, k) => `<a href="javascript:void(0)" data-k="${k}">${s.h}</a>`).join("")}</div>
      ${t.sections.map((s, k) => { const sid = t.id + "-" + k; const sv = S.saved.sections.includes(sid); return `<section class="note" id="s${k}"><div class="nh"><h2>${s.h}</h2><button class="btn small ghost savesec ${sv ? "on" : ""}" data-id="${sid}">${sv ? "Saved" : "Save to my notes"}</button></div>${s.html}</section>`; }).join("")}
      <div class="pager">${i > 0 ? `<a class="btn ghost" href="#/topic/${TOP[i - 1].id}">← L${TOP[i - 1].num}</a>` : "<span></span>"}<a class="btn" href="#/quiz/${t.id}">Test yourself</a>${i < TOP.length - 1 ? `<a class="btn ghost" href="#/topic/${TOP[i + 1].id}">L${TOP[i + 1].num} →</a>` : "<span></span>"}</div>`;
    $$(".toc a").forEach(a => a.onclick = () => $("#s" + a.dataset.k).scrollIntoView({ behavior: "smooth" }));
    const vsec = !sec ? null : sec[0] === "v" ? +sec.slice(1) : sec[0] === "c" ? sec : null;
    if (window.mountVideo) mountVideo(t.id, $("#vslot"), vsec);
    if (vsec != null) setTimeout(() => { const v = $("#vslot"); if (v) v.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150);
    else if (sec != null && $("#s" + sec)) setTimeout(() => $("#s" + sec).scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    $$(".savesec").forEach(b => b.onclick = () => { const id = b.dataset.id; const k = S.saved.sections.indexOf(id); if (k >= 0) S.saved.sections.splice(k, 1); else S.saved.sections.push(id); b.classList.toggle("on"); b.textContent = k >= 0 ? "Save to my notes" : "Saved"; save(); toast(k >= 0 ? "Removed" : "Saved to My notes"); });
  }

  // ---------- Flashcards ----------
  function cardsPage(tid = "all", mode = "all") {
    let list = [];
    Object.entries(CARDS).forEach(([t, arr]) => { if (tid === "all" || tid === t) arr.forEach((c, i) => list.push({ id: t + "-" + i, t, f: c[0], b: c[1] })); });
    if (mode === "saved") list = list.filter(c => S.saved.cards.includes(c.id));
    if (mode === "weak") list = list.filter(c => (S.box[c.id] || 0) < 3);
    list = mode === "order" ? list : shuffle(list).sort((a, b) => (S.box[a.id] || 0) - (S.box[b.id] || 0));
    let i = 0;
    main.innerHTML = `<h1>Flashcards</h1><div class="row">${topicSelect(tid)}<select class="msel"><option value="all">Weakest first</option><option value="weak" ${mode === "weak" ? "selected" : ""}>Not mastered only</option><option value="saved" ${mode === "saved" ? "selected" : ""}>My saved cards</option><option value="order" ${mode === "order" ? "selected" : ""}>Lecture order</option></select></div>
      <div class="fcwrap"></div><p class="small muted">Tap the card to flip. Keys: space = flip, 1 = again, 2 = got it, S = save.</p>`;
    $(".tsel").onchange = e => location.hash = `#/cards/${e.target.value}/${$(".msel").value}`;
    $(".msel").onchange = e => location.hash = `#/cards/${$(".tsel").value}/${e.target.value}`;
    const wrap = $(".fcwrap");
    function show() {
      if (!list.length) { wrap.innerHTML = `<div class="empty">No cards here. ${mode === "saved" ? "Save cards with the star button." : "All mastered! Try another mode."}</div>`; return; }
      const c = list[i % list.length]; const sv = S.saved.cards.includes(c.id); const bx = S.box[c.id] || 0;
      wrap.innerHTML = `<div class="fcmeta"><span>${(i % list.length) + 1} / ${list.length}</span><span>L${topicById(c.t).num}</span><span>Level ${bx}/5</span></div>
        <div class="flash" tabindex="0"><div class="inner"><div class="face front">${esc(c.f)}</div><div class="face back"><div>${esc(c.b)}</div>${(window.CARD_FIGS || {})[c.id] && SVG[CARD_FIGS[c.id]] ? `<div class="cfig">${SVG[CARD_FIGS[c.id]]}</div>` : ""}</div></div></div>
        <div class="fcbtns"><button class="btn ghost again">Again</button><button class="btn star ${sv ? "on" : ""}" title="Save card">${sv ? "★ Saved" : "☆ Save"}</button><button class="btn good">Got it</button></div>`;
      const fl = $(".flash", wrap); fl.onclick = () => fl.classList.toggle("flip");
      $(".again", wrap).onclick = () => { S.box[c.id] = Math.max(0, bx - 1); stat(c.t).cards++; award(0); next(); };
      $(".good", wrap).onclick = () => { S.box[c.id] = Math.min(5, bx + 1); stat(c.t).cards++; award(1, "c"); next(); };
      $(".star", wrap).onclick = () => { const k = S.saved.cards.indexOf(c.id); if (k >= 0) S.saved.cards.splice(k, 1); else S.saved.cards.push(c.id); save(); show(); };
    }
    function next() { i++; show(); }
    document.onkeydown = e => { if (!$(".flash")) return; if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return; if (e.key === " ") { e.preventDefault(); $(".flash").classList.toggle("flip"); } if (e.key === "1") $(".again").click(); if (e.key === "2") $(".good").click(); if (e.key.toLowerCase() === "s") $(".star").click(); };
    show();
  }

  // ---------- Quiz ----------
  const norm = s => String(s).toLowerCase().replace(/\s+/g, " ").replace(/[()]/g, "").trim();
  function quizPage(tid = "mixed") {
    let pool = [];
    Object.entries(QUESTIONS).forEach(([t, arr]) => { if (tid === "mixed" || tid === "all" || tid === t) arr.forEach((q, i) => pool.push({ ...q, tp: t, id: t + "-" + i })); });
    let qs = shuffle(pool);
    if (tid === "mixed") { qs = qs.slice(0, 16); const gens = shuffle(GENERATORS).slice(0, 4); gens.forEach(g => { const x = g.make(rng); qs.push({ tp: g.topic, gen: true, type: "gen", ...x }); }); qs = shuffle(qs); }
    let i = 0, right = 0, answered = false;
    main.innerHTML = `<h1>Quiz</h1><div class="row"><select class="tsel"><option value="mixed">Mixed exam (20 Qs incl. calculations)</option><option value="all" ${tid === "all" ? "selected" : ""}>All bank questions</option>${TOP.map(t => `<option value="${t.id}" ${tid === t.id ? "selected" : ""}>L${t.num} ${t.title}</option>`).join("")}</select></div><div class="qwrap"></div>`;
    $(".tsel").onchange = e => location.hash = "#/quiz/" + e.target.value;
    const wrap = $(".qwrap");
    function show() {
      if (i >= qs.length) {
        const pc = Math.round(100 * right / qs.length); award(right >= qs.length * 0.8 ? 5 : 0, "q");
        wrap.innerHTML = `<div class="result"><h2>${right} / ${qs.length} (${pc}%)</h2><p>${pc >= 80 ? "Excellent. Bonus +5 points." : pc >= 50 ? "Good. Review the explanations and try again." : "Keep going. Read the notes, then retry."}</p><a class="btn" href="#/quiz/${tid}" onclick="setTimeout(()=>dispatchEvent(new HashChangeEvent('hashchange')),0)">Try again</a> <a class="btn ghost" href="#/cards/${tid === "mixed" || tid === "all" ? "all" : tid}/weak">Flashcards</a></div>`; return;
      }
      const q = qs[i]; answered = false;
      let body = "";
      if (q.type === "gen") body = `<div class="qtext">${q.q}</div>` + (q.labels || ["Answer"]).map((l, k) => `<label class="fin">${l} <input data-k="${k}" inputmode="decimal"></label>`).join("");
      else if (q.t === "mcq" || q.t === "tf" || q.t === "multi") {
        const opts = q.t === "tf" ? ["True", "False"] : q.o;
        body = `<div class="qtext">${esc(q.q)}</div>${q.t === "multi" ? `<p class="small muted">Select all that apply.</p>` : ""}<div class="opts">${opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join("")}</div>`;
      } else if (q.t === "fill") {
        let n = 0; body = `<div class="qtext">${esc(q.q).replace(/___/g, () => `<input class="blank" data-k="${n++}" size="8">`)}</div>`;
      } else if (q.t === "match") {
        const rights = shuffle(q.pairs.map(p => p[1]));
        body = `<div class="qtext">${esc(q.q)}</div><div class="match">${q.pairs.map((p, k) => `<label><span>${esc(p[0])}</span><select data-k="${k}"><option value="">choose...</option>${rights.map(r => `<option>${esc(r)}</option>`).join("")}</select></label>`).join("")}</div>`;
      }
      const tl = topicById(q.tp);
      wrap.innerHTML = `<div class="qmeta"><span>Question ${i + 1} / ${qs.length}</span><span>${tl ? "L" + tl.num : ""} ${q.type === "gen" ? "· calculation" : "· " + ({ mcq: "multiple choice", multi: "multiple answers", tf: "true / false", fill: "fill in the blank", match: "matching" }[q.t])}</span><span>Score ${right}</span></div>
        <div class="qcard">${body}<div class="fb"></div><div class="qbtns"><button class="btn check">Check</button><button class="btn ghost nextq" hidden>Next →</button></div></div>`;
      const sel = new Set();
      $$(".opt", wrap).forEach(b => b.onclick = () => { if (answered) return; const k = +b.dataset.k; if (q.t === "multi") { sel.has(k) ? sel.delete(k) : sel.add(k); b.classList.toggle("sel"); } else { sel.clear(); sel.add(k); $$(".opt", wrap).forEach(x => x.classList.remove("sel")); b.classList.add("sel"); check(); } });
      $(".check", wrap).onclick = check;
      $(".nextq", wrap).onclick = () => { i++; show(); };
      wrap.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); answered ? $(".nextq", wrap).click() : check(); } };
      function check() {
        if (answered) return; let ok = false, fb = "";
        if (q.type === "gen") {
          const ins = $$(".fin input", wrap); ok = q.answers.every((a, k) => { const v = parseFloat(ins[k].value); const good = Math.abs(v - a.n) <= (a.tol || 0) + 1e-9; ins[k].classList.add(good ? "good" : "bad"); return good; });
          fb = `Answer: ${q.answers.map(a => +a.n.toPrecision(6)).join(", ")}<div class="steps">${q.steps}</div>`;
        } else if (q.t === "mcq" || q.t === "tf") {
          const k = [...sel][0]; if (k === undefined) return; const correct = q.t === "tf" ? (q.a ? 0 : 1) : q.a; ok = k === correct;
          $$(".opt", wrap).forEach((b, j) => { if (j === correct) b.classList.add("good"); else if (j === k) b.classList.add("bad"); });
        } else if (q.t === "multi") {
          if (!sel.size) return; ok = sel.size === q.a.length && q.a.every(x => sel.has(x));
          $$(".opt", wrap).forEach((b, j) => { if (q.a.includes(j)) b.classList.add("good"); else if (sel.has(j)) b.classList.add("bad"); });
        } else if (q.t === "fill") {
          const ins = $$(".blank", wrap); ok = q.a.every((acc, k) => { const v = ins[k].value; let good; if (acc && acc.n !== undefined) good = Math.abs(parseFloat(v) - acc.n) <= acc.tol + 1e-9; else good = acc.some(x => norm(x) === norm(v)); ins[k].classList.add(good ? "good" : "bad"); return good; });
          fb = "Answer: " + q.a.map(acc => acc.n !== undefined ? acc.n : acc[0]).join(", ");
        } else if (q.t === "match") {
          const ss = $$(".match select", wrap); ok = ss.every((s, k) => { const g = s.value === q.pairs[k][1]; s.classList.add(g ? "good" : "bad"); return g; });
          fb = q.pairs.map(p => `${esc(p[0])} → ${esc(p[1])}`).join("<br>");
        }
        answered = true; if (ok) right++;
        const s = stat(q.tp); s.total++; if (ok) s.right++;
        award(ok ? (q.type === "gen" ? 3 : 2) : 0, q.type === "gen" ? "k" : null);
        $(".fb", wrap).innerHTML = `<div class="${ok ? "okc" : "bad"}"><b>${ok ? "Correct!" : "Not quite."}</b></div>${fb ? `<div>${fb}</div>` : ""}` + explainHTML(q, sel);
        $(".check", wrap).hidden = true; $(".nextq", wrap).hidden = false; $(".nextq", wrap).focus();
      }
    }
    show();
  }

  // Step-by-step explanation + learn-more links for a quiz question (data in js/explain.js)
  function explainHTML(q, sel) {
    const t = topicById(q.tp); if (!t) return q.e ? `<div class="expl">${esc(q.e)}</div>` : "";
    const qi = q.id ? +q.id.split("-")[1] : -1; const X = (window.QX && QX[q.tp] && QX[q.tp][qi]) || null;
    let h = "";
    if (X) {
      if (X.o && (q.t === "mcq" || q.t === "multi")) {
        const good = j => (q.t === "multi" ? q.a.includes(j) : q.a === j);
        h += `<div class="why"><b>Why each option is right or wrong</b><ul>${q.o.map((o, j) => `<li class="${good(j) ? "y" : "n"} ${sel && sel.has(j) ? "mine" : ""}"><span class="tag">${good(j) ? "Correct" : "Wrong"}${sel && sel.has(j) ? " · your pick" : q.t === "multi" && good(j) ? " · you missed this" : ""}</span> <b>${esc(o)}</b>: ${X.o[j] || ""}</li>`).join("")}</ul></div>`;
      }
      if (X.o && q.t === "match") h += `<div class="why"><b>Why each pair matches</b><ul>${q.pairs.map((p, j) => `<li class="y"><b>${esc(p[0])} → ${esc(p[1])}</b>: ${X.o[j] || ""}</li>`).join("")}</ul></div>`;
      if (X.st && X.st.length) h += `<div class="why"><b>Step by step</b><ol>${X.st.map(x => `<li>${x}</li>`).join("")}</ol></div>`;
      if (X.tip) h += `<div class="why tipq"><b>Exam tip:</b> ${X.tip}</div>`;
    } else if (q.e) h += `<div class="expl">${esc(q.e)}</div>`;
    const s = X && X.s != null ? X.s : null; const sh = s != null && t.sections[s] ? t.sections[s].h : null;
    h += `<div class="learn"><b>Learn more:</b> <a href="#/topic/${t.id}${s != null ? "/" + s : ""}">L${t.num} notes${sh ? ": " + esc(sh) : ""}</a>${(window.VIDEO_READY || []).includes(t.id) ? ` · <a href="#/topic/${t.id}/${X && X.vc != null ? "c" + X.vc : "v" + (s != null ? s : 0)}">Watch this in the L${t.num} lesson video</a>` : ""} · <a href="#/cards/${t.id}">L${t.num} flashcards</a></div>`;
    return h;
  }

  // ---------- Calculation practice ----------
  function practicePage(gid) {
    const g = GENERATORS.find(x => x.id === gid) || GENERATORS[0];
    main.innerHTML = `<h1>Calculation practice</h1><p class="muted">Unlimited random questions with worked steps. Random seed ${CFG.SEED || 67}. Use your calculator like in the exam.</p>
      <div class="row"><select class="gsel">${TOP.filter(t => GENERATORS.some(x => x.topic === t.id)).map(t => `<optgroup label="L${t.num} ${t.title}">${GENERATORS.filter(x => x.topic === t.id).map(x => `<option value="${x.id}" ${x.id === g.id ? "selected" : ""}>${x.name}</option>`).join("")}</optgroup>`).join("")}</select></div><div class="qwrap"></div>`;
    $(".gsel").onchange = e => location.hash = "#/practice/" + e.target.value;
    const wrap = $(".qwrap");
    function fresh() {
      const x = g.make(rng); let done = false;
      wrap.innerHTML = `<div class="qcard"><div class="qtext">${x.q}</div>${(x.labels || ["Answer"]).map((l, k) => `<label class="fin">${l} <input data-k="${k}" inputmode="decimal"></label>`).join("")}<div class="fb"></div>
        <div class="qbtns"><button class="btn check">Check</button><button class="btn ghost reveal">Show steps</button><button class="btn ghost newq">New question</button></div></div>`;
      const ins = $$(".fin input", wrap);
      const check = () => { if (done) return; const ok = x.answers.every((a, k) => { const v = parseFloat(ins[k].value); const good = Math.abs(v - a.n) <= (a.tol || 0) + 1e-9; ins[k].classList.add(good ? "good" : "bad"); return good; }); done = true; if (ok) award(3, "k"); $(".fb", wrap).innerHTML = `<div class="${ok ? "okc" : "bad"}"><b>${ok ? "Correct!" : "Not quite."}</b> Answer: ${x.answers.map(a => +a.n.toPrecision(6)).join(", ")}</div><div class="steps">${x.steps}</div>`; };
      $(".check", wrap).onclick = check; $(".reveal", wrap).onclick = () => { done = true; $(".fb", wrap).innerHTML = `<div class="steps">${x.steps}</div>`; };
      $(".newq", wrap).onclick = fresh; wrap.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); done ? fresh() : check(); } };
    }
    fresh();
  }

  // ---------- Tools ----------
  function toolsPage() {
    const list = [["search", "Search on the Romania map (BFS, DFS, UCS, Greedy, A*)", "l2"], ["queens", "8-queens cost + hill climbing", "l3"], ["sa", "Simulated annealing probability", "l3"], ["dtree", "Information gain and Gini", "l4"], ["mlp", "Neural net forward + backprop", "l5"], ["grid", "Grid world value iteration", "l6"], ["conv", "Convolution animation", "l7"], ["rf", "Receptive field", "l7"], ["iou", "IoU and NMS", "l7"], ["rnn", "RNN unrolled", "l8"], ["attn", "Attention", "l8"], ["truth", "Model checking / truth table", "l10"], ["bn", "Bayesian network enumeration", "l11"]];
    main.innerHTML = `<h1>Interactive tools and animations</h1><div class="toc">${list.map(([w, n], k) => `<a href="javascript:void(0)" data-k="${k}">${n}</a>`).join("")}</div>` + list.map(([w, n, t], k) => `<section class="note" id="w${k}"><h2>${n} <a class="small" href="#/topic/${t}">(L${topicById(t).num} notes)</a></h2><div class="widget" data-widget="${w}"></div></section>`).join("");
    $$(".toc a").forEach(a => a.onclick = () => $("#w" + a.dataset.k).scrollIntoView({ behavior: "smooth" }));
  }

  // ---------- Cheat sheet ----------
  function sheetHTML() { return window.CHEATSHEET; }
  function sheetPage() {
    main.innerHTML = `<div class="nh"><h1>Cheat sheet (all formulas)</h1><button class="btn" id="psheet">Print / Save as PDF</button></div><p class="muted">Bring this as your hard-copy notes. Print it double-sided on A4.</p><div class="sheet">${sheetHTML()}</div>`;
    $("#psheet").onclick = () => printDoc("AI Exam Cheat Sheet", `<div class="sheet">${sheetHTML()}</div>`);
  }

  // ---------- My notes ----------
  function notesPage() {
    const cards = S.saved.cards.map(id => { const [t, i] = id.split("-"); const c = (CARDS[t] || [])[+i]; return c ? { id, t, f: c[0], b: c[1] } : null; }).filter(Boolean);
    const secs = S.saved.sections.map(id => { const [t, i] = id.split("-"); const tp = topicById(t); const s = tp && tp.sections[+i]; return s ? { id, t: tp, s } : null; }).filter(Boolean);
    const notes = S.notes.filter(n => !n.deleted).sort((a, b) => b.ts - a.ts);
    main.innerHTML = `<div class="nh"><h1>My notes</h1><button class="btn" id="pdf">Export to PDF</button></div>
      <p class="muted">Save cards (☆) and note sections, write your own notes, then export a printable PDF for the exam. ${user ? "Synced to your account." : "Saved on this device. Sign in to sync."}</p>
      <div class="note"><h2>Write a note</h2><input id="ntitle" placeholder="Title (e.g. A* tips)"><textarea id="nbody" rows="5" placeholder="Your note. Plain text, keep it short."></textarea><select id="ntopic"><option value="">General</option>${TOP.map(t => `<option value="${t.id}">L${t.num} ${t.title}</option>`).join("")}</select> <button class="btn" id="nadd">Add note</button></div>
      <h2>My written notes (${notes.length})</h2>${notes.map(n => `<div class="mynote" data-id="${n.id}"><div class="nh"><b>${esc(n.title || "Untitled")}</b><span class="small muted">${n.topic ? "L" + topicById(n.topic).num : ""}</span></div><div class="nb">${esc(n.body).replace(/\n/g, "<br>")}</div><button class="btn small ghost del">Delete</button> <button class="btn small ghost edit">Edit</button></div>`).join("") || `<p class="empty">No notes yet.</p>`}
      <h2>Saved flashcards (${cards.length})</h2>${cards.map(c => `<div class="mini"><b>${esc(c.f)}</b><div>${esc(c.b)}</div><button class="btn small ghost uns" data-id="${c.id}">Remove</button></div>`).join("") || `<p class="empty">No saved cards. Use ☆ Save on a flashcard.</p>`}
      <h2>Saved note sections (${secs.length})</h2>${secs.map(x => `<div class="mini"><b>L${x.t.num}: ${x.s.h}</b> <a href="#/topic/${x.t.id}">open</a> <button class="btn small ghost unsec" data-id="${x.id}">Remove</button></div>`).join("") || `<p class="empty">No saved sections. Use "Save to my notes" on a topic page.</p>`}`;
    $("#nadd").onclick = () => { const title = $("#ntitle").value.trim(), body = $("#nbody").value.trim(); if (!body && !title) return; S.notes.push({ id: "n" + Date.now().toString(36), title, body, topic: $("#ntopic").value, ts: Date.now() }); save(); notesPage(); toast("Note added"); };
    $$(".mynote .del").forEach(b => b.onclick = () => { const n = S.notes.find(x => x.id === b.closest(".mynote").dataset.id); n.deleted = true; n.ts = Date.now(); save(); notesPage(); });
    $$(".mynote .edit").forEach(b => b.onclick = () => { const n = S.notes.find(x => x.id === b.closest(".mynote").dataset.id); $("#ntitle").value = n.title; $("#nbody").value = n.body; $("#ntopic").value = n.topic || ""; n.deleted = true; n.ts = Date.now(); save(); window.scrollTo(0, 0); });
    $$(".uns").forEach(b => b.onclick = () => { S.saved.cards = S.saved.cards.filter(x => x !== b.dataset.id); save(); notesPage(); });
    $$(".unsec").forEach(b => b.onclick = () => { S.saved.sections = S.saved.sections.filter(x => x !== b.dataset.id); save(); notesPage(); });
    $("#pdf").onclick = () => {
      const m = modal(`<h2>Export to PDF</h2><p class="small">Choose what to include. Then pick "Save as PDF" (or a printer) in the print window.</p>
        <label class="ck"><input type="checkbox" id="o1" checked> My written notes (${notes.length})</label><label class="ck"><input type="checkbox" id="o2" checked> Saved flashcards (${cards.length})</label><label class="ck"><input type="checkbox" id="o3" checked> Saved note sections (${secs.length})</label><label class="ck"><input type="checkbox" id="o4"> Full formula cheat sheet</label><label class="ck"><input type="checkbox" id="o5"> ALL flashcards (every topic)</label><button class="btn" id="go">Create PDF</button>`);
      $("#go", m).onclick = () => {
        let out = "";
        if ($("#o1", m).checked && notes.length) out += `<h2>My notes</h2>` + notes.map(n => `<div class="pnote"><b>${esc(n.title || "")}</b> ${n.topic ? `<i>(L${topicById(n.topic).num})</i>` : ""}<br>${esc(n.body).replace(/\n/g, "<br>")}</div>`).join("");
        if ($("#o2", m).checked && cards.length) out += `<h2>Saved flashcards</h2><table class="ptbl">` + cards.map(c => `<tr><td>${esc(c.f)}</td><td>${esc(c.b)}</td></tr>`).join("") + `</table>`;
        if ($("#o3", m).checked && secs.length) out += secs.map(x => `<h2>L${x.t.num}: ${x.s.h}</h2><div class="psec">${x.s.html}</div>`).join("");
        if ($("#o4", m).checked) out += `<h2>Cheat sheet</h2><div class="sheet">${sheetHTML()}</div>`;
        if ($("#o5", m).checked) out += TOP.map(t => `<h2>L${t.num} ${t.title}: flashcards</h2><table class="ptbl">` + (CARDS[t.id] || []).map(c => `<tr><td>${esc(c[0])}</td><td>${esc(c[1])}</td></tr>`).join("") + `</table>`).join("");
        closeModal(); printDoc("My AI exam notes", out || "<p>Nothing selected.</p>");
      };
    };
  }
  function printDoc(title, html) {
    const p = $("#print"); p.innerHTML = `<h1>${esc(title)}</h1>${html}`;
    p.querySelectorAll(".widget").forEach(w => w.remove());
    const old = document.title; document.title = title; setTimeout(() => { window.print(); document.title = old; }, 50);
  }

  // ---------- Leaderboard ----------
  async function boardPage() {
    main.innerHTML = `<h1>Leaderboard</h1><p class="muted">Earn points: flashcard "Got it" +1, correct quiz answer +2, correct calculation +3, quiz score 80%+ bonus +5.</p><div class="board-wrap">Loading...</div>`;
    const w = $(".board-wrap");
    if (!sb) { w.innerHTML = `<div class="empty">The leaderboard needs Supabase. Ask the site owner to add the keys in <code>js/config.js</code>. Your points on this device: <b>${S.points}</b>.</div>`; return; }
    await flushPoints();
    const { data, error } = await sb.from("profiles").select("username,points,quizzes_done,cards_done,calc_done").order("points", { ascending: false }).limit(100);
    if (error) { w.innerHTML = `<div class="empty bad">Could not load: ${esc(error.message)}</div>`; return; }
    const me = profile && profile.username;
    w.innerHTML = `${user ? "" : `<p><a href="#" id="jl">Sign in</a> to join the leaderboard.</p>`}<div class="scrollx"><table class="tbl lb"><tr><th>#</th><th>User</th><th>Points</th><th>Cards</th><th>Calcs</th></tr>${data.map((r, k) => `<tr class="${r.username === me ? "me" : ""}"><td>${k + 1}</td><td>${esc(r.username)}</td><td><b>${r.points}</b></td><td>${r.cards_done}</td><td>${r.calc_done}</td></tr>`).join("") || `<tr><td colspan="5">No one yet. Be first!</td></tr>`}</table></div>`;
    const jl = $("#jl"); if (jl) jl.onclick = e => { e.preventDefault(); openAuth(); };
  }

  // ---------- Feedback ----------
  function openFeedback() {
    const to = CFG.FEEDBACK_EMAIL || "";
    const name = user ? (profile ? profile.username : (user.user_metadata && user.user_metadata.username) || "") : "";
    const m = modal(`<h2>Send feedback</h2>
      <p class="small muted">Found a mistake, a bug, or want a feature? Tell me here.</p>
      <form id="fbform">
        <label>Type<select name="t"><option>Bug</option><option>Wrong content</option><option>Feature idea</option><option>Other</option></select></label>
        <label>Message<textarea name="m" required maxlength="3000" placeholder="What happened, and on which page?"></textarea></label>
        <label>Your name or contact (optional)<input name="c" maxlength="100" value="${esc(name)}" placeholder="so I can reply"></label>
        <input name="_honey" style="display:none" tabindex="-1" autocomplete="off">
        <div class="err"></div><button class="btn">Send</button>
      </form>`);
    const f = $("#fbform", m), err = $(".err", m);
    f.onsubmit = async e => {
      e.preventDefault();
      if (f._honey.value) return;
      const body = { type: f.t.value, message: f.m.value.trim(), contact: f.c.value.trim(), page: location.hash || "#/", _subject: "AI Exam Revision feedback: " + f.t.value, _template: "table", _captcha: "false" };
      if (!body.message) { err.textContent = "Please write a message."; return; }
      const mailto = "mailto:" + to + "?subject=" + encodeURIComponent(body._subject) + "&body=" + encodeURIComponent(body.message + "\n\nFrom: " + body.contact + "\nPage: " + body.page);
      if (!to) { err.textContent = "Feedback is not set up yet."; return; }
      err.textContent = "Sending...";
      try {
        const r = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(to), { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || String(j.success) === "false") throw new Error(j.message || "Send failed");
        closeModal(); toast("Thanks! Feedback sent.");
      } catch (x) {
        err.innerHTML = `Could not send (${esc(x.message)}). <a href="${mailto}">Send by email app instead</a>.`;
      }
    };
  }
  window.openFeedback = openFeedback;

  // ---------- Onboarding tour ----------
  // Shows on every load unless the signed-in user has already finished it (saved in their account).
  let tourDoneThisVisit = false;
  function tourSteps() {
    const nC = Object.values(window.CARDS).reduce((n, a) => n + a.length, 0);
    const nQ = Object.values(window.QUESTIONS).reduce((n, a) => n + a.length, 0);
    return [
      { h: "Welcome to AI Exam Revision", b: `<p>Everything for the final exam in one place: <b>Lectures 2 to 12</b>. Module 1 is not examined.</p><p>This 2 minute tour shows <b>what the exam wants</b> and <b>how to use every feature</b>.</p><div class="onbfig">${SVG.cnnPipe}</div>` },
      { h: "1. The exam format", b: `<ul class="onbl"><li><b>120 minutes</b>, final exam.</li><li>Question types: <b>multiple choice</b>, <b>multiple answers</b>, <b>true / false</b>, <b>fill in single or multiple blanks</b>, <b>matching</b>.</li><li><b>Calculator allowed</b>. <b>Hard-copy notes allowed</b>, so print your notes from this site.</li></ul><p class="tipline">Fill-in-the-blank answers must be exact numbers. Practise rounding the way the question asks.</p>` },
      { h: "2. What the exam is looking for", b: `<p>Two things: <b>understand the concepts</b> (what each method does, when to use it, its keywords) and <b>do the calculations step by step</b>.</p><p><b>Calculations you must be able to do:</b></p><ul class="onbl cols"><li>Search f(n): UCS, Greedy, A*</li><li>Loss functions</li><li>MDP Q-values and utilities</li><li>Entropy, info gain, Gini</li><li>Naive Bayes, Bayesian networks</li><li>Conv output, pooling, receptive field, parameters</li><li>IoU and NMS</li><li>Simple RNN hidden state</li><li>Attention weighted sum</li></ul>` },
      { h: "3. Lecture notes", b: `<p>Open any lecture from the menu. Each one has short notes with <b>keywords</b>, <b>formulas</b>, <b>worked examples</b>, <b>diagrams</b>, <b>analogies</b> and <b>exam tips</b>.</p><p>Tap <b>☆ Save section</b> to add a section to your printable notes.</p><div class="onbfig">${SVG.attention}</div>` },
      { h: "4. Flashcards", b: `<p><b>${nC}</b> cards. Tap a card to flip it. Many have a <b>diagram on the back</b>.</p><ul class="onbl"><li><b>Got it</b> moves a card up a level, <b>Again</b> moves it down. Weak cards come first.</li><li><b>☆ Save</b> keeps a card for your PDF notes.</li><li>Filter by lecture, "not mastered" or "my saved cards".</li><li>Keyboard: space = flip, 1 = again, 2 = got it, S = save.</li></ul>` },
      { h: "5. Quiz and calculation practice", b: `<ul class="onbl"><li><b>Quiz</b>: ${nQ} questions in all five exam formats, with explanations. "Mixed exam" = 20 questions including calculations.</li><li><b>Calc practice</b>: ${window.GENERATORS.length} calculation types with <b>unlimited new numbers</b>. Use your calculator, check, then read the worked steps.</li></ul><p class="tipline">Testing yourself beats rereading notes. Spend most of your time here.</p>` },
      { h: "6. Animations and tools", b: `<p>Interactive tools to <b>see</b> how things work: search on the Romania map (BFS, DFS, UCS, Greedy, A*), 8-queens hill climbing, simulated annealing, IG and Gini calculator, backprop, grid world value iteration, convolution animation, receptive field, IoU and NMS, RNN, attention, truth tables and Bayesian network inference.</p><div class="onbfig">${SVG.grid}</div>` },
      { h: "7. Cheat sheet, notes and PDF", b: `<ul class="onbl"><li><b>Cheat sheet</b>: every formula on one page, ready to print.</li><li><b>My notes + PDF</b>: write your own notes, see saved cards and sections, then <b>Export PDF</b> and choose "Save as PDF" or print it.</li></ul><p class="tipline">You can bring hard-copy notes into the exam. Build them here as you study.</p>` },
      { h: "8. Points, leaderboard and your account", b: `<ul class="onbl"><li>Earn points: card "Got it" +1, correct quiz answer +2, correct calculation +3, 80%+ quiz bonus +5.</li><li><b>Leaderboard</b>: compete with friends.</li><li><b>Create an account</b> (username and password, no email) to join the leaderboard, keep progress on every device, and stop this tour from showing again.</li><li>Light / dark mode button at the top. On a phone, use the bottom bar and the ☰ menu.</li></ul>`, last: true }
    ];
  }
  function openTour(start = 0) {
    const STEPS = tourSteps();
    let i = start; const w = $("#onb");
    const close = () => { w.hidden = true; document.removeEventListener("keydown", key); };
    const finish = () => { tourDoneThisVisit = true; if (user) { S.onb[user.id] = true; save(); cloudSave(); } close(); };
    const key = e => { if (w.hidden) return; if (e.key === "Escape") close(); else if (e.key === "ArrowRight" && i < STEPS.length - 1) { i++; draw(); } else if (e.key === "ArrowLeft" && i > 0) { i--; draw(); } };
    function draw() {
      const st = STEPS[i];
      w.innerHTML = `<div class="onbcard" role="dialog" aria-modal="true" aria-label="Site tour"><button class="x" aria-label="Close tour">×</button>
        <div class="onbdots">${STEPS.map((_, k) => `<span class="${k === i ? "on" : k < i ? "done" : ""}"></span>`).join("")}</div>
        <h2>${st.h}</h2><div class="onbbody">${st.b}</div>
        <div class="onbbtns">${i ? `<button class="btn ghost prevb">Back</button>` : `<button class="btn ghost skip">Skip for now</button>`}
        ${st.last ? (user ? `<button class="btn fin">Start studying</button>` : `<button class="btn ghost fin">Start as guest</button><button class="btn fin up">Create account</button>`) : `<button class="btn next">Next</button>`}</div>
        ${st.last && !user ? `<p class="small muted onbnote">Guests see this tour each time the site opens. Sign in to turn it off. <a href="#" class="si">I have an account</a></p>` : ""}</div>`;
      w.hidden = false;
      $(".x", w).onclick = close; const sk = $(".skip", w); if (sk) sk.onclick = close;
      const bk = $(".prevb", w); if (bk) bk.onclick = () => { i--; draw(); };
      const nx = $(".next", w); if (nx) nx.onclick = () => { i++; draw(); };
      $$(".fin", w).forEach(b => b.onclick = () => { finish(); if (b.classList.contains("up")) openAuth("up"); });
      const si = $(".si", w); if (si) si.onclick = e => { e.preventDefault(); finish(); openAuth("in"); };
      const f = $(".next, .fin.up, .fin", w); if (f) f.focus({ preventScroll: true });
    }
    document.addEventListener("keydown", key);
    draw();
  }
  window.openTour = openTour;
  function maybeTour() { if (user && S.onb && S.onb[user.id]) return; openTour(0); }

  // ---------- Boot ----------
  $("#menu").onclick = () => document.body.classList.toggle("navopen");
  $$(".nav a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("navopen")));
  if (!S.onb) S.onb = {};
  const tourLink = document.createElement("a"); tourLink.href = "javascript:void(0)"; tourLink.textContent = "Site tour"; tourLink.onclick = () => { document.body.classList.remove("navopen"); openTour(0); };
  const fbLink = document.createElement("a"); fbLink.href = "javascript:void(0)"; fbLink.textContent = "Send feedback"; fbLink.onclick = () => { document.body.classList.remove("navopen"); openFeedback(); };
  const navh = $(".nav.side .navh"); if (navh) { navh.before(tourLink); navh.before(fbLink); }
  renderPoints(); route();
  let tourShown = false; const showOnce = () => { if (!tourShown) { tourShown = true; maybeTour(); } };
  setTimeout(showOnce, 4000);
  initAuth().then(showOnce, showOnce);
})();
