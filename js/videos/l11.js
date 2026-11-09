(function () {
  const { title, h, list, fx, card, flow, cols, split, tbl, at, stg, act, fix, say, tag, zone, bar, J } = VK;
  const sb = (t) => `<sub>${t}</sub>`;

  // ---- table with per-row reveal and class swaps: rows [k, on, ...cells] ----
  const rtab = (head, rows, cls = "") => `<table class="vk-tbl sm eqt ${cls}">${head ? `<tr>${head.map((c) => `<th>${c}</th>`).join("")}</tr>` : ""}${rows.map(([k, on, ...c]) => `<tr class="vk-i" data-s="${k}" ${on ? `data-on="${on}"` : ""}>${c.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</table>`;

  // ---- probability bar row: name, bar width by step, value text by step ----
  const pbar = (k, x, name, W, V, cls = "g", on = "") => `<div class="vk-i brow" data-s="${k}" ${x != null ? `data-x="${x}"` : ""} ${on ? `data-on="${on}"` : ""}><em>${name}</em><div class="trk">${bar(W, cls, "")}</div><i>${say(V)}</i></div>`;

  // ---- 32 possible worlds: square i appears once 2^n > i ----
  const worlds = (() => {
    let o = "";
    for (let i = 0; i < 32; i++) {
      const first = i < 2 ? 1 : i < 4 ? 2 : i < 8 ? 3 : i < 16 ? 4 : 5, T = {};
      for (let n = first; n <= 5; n++) T[n] = i.toString(2).padStart(n, "0").replace(/0/g, "T").replace(/1/g, "F");
      o += `<div class="vk-i md" data-s="${first}">${say(T)}</div>`;
    }
    return `<div class="mds">${o}</div>`;
  })();

  // ---- coffee / tea Venn ----
  const venn = `<svg class="vnv" viewBox="0 0 400 200">
    <rect class="all" x="2" y="2" width="396" height="196" rx="10"/><text class="lb" x="46" y="20">all students</text>
    <circle class="vk-i va" data-s="1" cx="160" cy="100" r="70"/><circle class="vk-i vb" data-s="2" cx="240" cy="100" r="70"/>
    <path class="vk-i vo" data-s="3" d="M200,42.6 A70,70 0 0 1 200,157.4 A70,70 0 0 1 200,42.6 Z"/>
    <text class="vk-i" data-s="1" x="128" y="96">coffee</text><text class="vk-i" data-s="1" x="128" y="114">0.6</text>
    <text class="vk-i" data-s="2" x="275" y="96">tea</text><text class="vk-i" data-s="2" x="275" y="114">0.3</text>
    <text class="vk-i" data-s="3" x="200" y="96">both</text><text class="vk-i" data-s="3" x="200" y="114">0.1</text>
    <text class="vk-i bad" data-s="3" data-x="4" x="200" y="190">counted twice!</text>
  </svg>`;

  // ---- 20 students as dots: B = attended every lab (left two columns), A = passed ----
  const dots = (() => {
    const passB = [0, 1, 2, 4, 5, 6], passN = [9, 12, 15, 18];
    let g = `<rect class="vk-i bz" data-s="1" x="28" y="14" width="132" height="182" rx="12"/><text class="vk-i bzt" data-s="1" x="94" y="210">B: every lab (8)</text>`;
    for (let c = 0; c < 5; c++) for (let r = 0; r < 4; r++) {
      const i = c * 4 + r, inB = c < 2, pass = inB ? passB.includes(i) : passN.includes(i);
      const on = inB ? (pass ? "2:pass" : "") : pass ? "2:pass 3:pass,fade" : "3:fade";
      g += `<circle class="d" ${on ? `data-on="${on}"` : ""} cx="${60 + c * 68}" cy="${40 + r * 44}" r="15"/>`;
    }
    return `<svg class="dtv" viewBox="0 0 400 220">${g}<text class="vk-i bzt ok" data-s="2" x="300" y="214">green = passed (10)</text></svg>`;
  })();

  // ---- the burglar alarm network ----
  const NP = { B: [150, 40], E: [450, 40], A: [300, 135], J: [150, 232], M: [450, 232] };
  const NAMES = { B: ["Burglary", 150, 84, "middle"], E: ["Earthquake", 450, 84, "middle"], A: ["Alarm", 262, 140, "end"], J: ["JohnCalls", 112, 237, "end"], M: ["MaryCalls", 488, 237, "start"] };
  const CPT = {
    B: [[110, 45, "end", "P(b) = 0.001"]],
    E: [[490, 45, "start", "P(e) = 0.002"]],
    A: [[530, 110, "middle", "<tspan class='hd'>P(a | B, E)</tspan>"], [530, 133, "middle", "b, e: 0.95"], [530, 153, "middle", "b, ¬e: 0.94"], [530, 173, "middle", "¬b, e: 0.29"], [530, 193, "middle", "¬b, ¬e: 0.001"]],
    J: [[150, 275, "middle", "<tspan class='hd'>P(j | A)</tspan>"], [105, 295, "middle", "a: 0.90"], [195, 295, "middle", "¬a: 0.05"]],
    M: [[450, 275, "middle", "<tspan class='hd'>P(m | A)</tspan>"], [405, 295, "middle", "a: 0.70"], [495, 295, "middle", "¬a: 0.01"]]
  };
  const ED = [["B", "A"], ["E", "A"], ["A", "J"], ["A", "M"]];
  const bnet = (o = {}) => {
    const ns = o.ns || {}, non = o.non || {}, cs = o.cs || {}, lit = o.lit || {}, es = o.es || {};
    let g = "";
    ED.forEach(([a, b]) => {
      const [x1, y1] = NP[a], [x2, y2] = NP[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
      g += `<line class="vk-i be" data-s="${es[a + b] ?? 0}" x1="${x1 + dx / L * 27}" y1="${y1 + dy / L * 27}" x2="${x2 - dx / L * 30}" y2="${y2 - dy / L * 30}" marker-end="url(#bnah)"/>`;
    });
    Object.entries(NP).forEach(([id, [x, y]]) => {
      const [nm, tx, ty, an] = NAMES[id];
      g += `<g class="vk-i bn" data-s="${ns[id] ?? 0}" ${non[id] ? `data-on="${non[id]}"` : ""}><circle cx="${x}" cy="${y}" r="25"/><text x="${x}" y="${y + 6}">${id}</text><text class="nm" x="${tx}" y="${ty}" style="text-anchor:${an}">${nm}</text></g>`;
    });
    Object.entries(CPT).forEach(([id, lines]) => {
      g += `<g class="vk-i bc" data-s="${cs[id] ?? 0}">${lines.map(([x, y, an, t], i) => `<text x="${x}" y="${y}" style="text-anchor:${an}" ${lit[id + i] ? `data-on="${lit[id + i]}"` : ""}>${t}</text>`).join("")}</g>`;
    });
    return `<svg class="bnv" viewBox="0 0 600 305"><defs><marker id="bnah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>${g}${o.extra || ""}</svg>`;
  };

  // ---- tree builder (same as L10) ----
  const rt = (w, hh, nodes, edges, extra = "") => {
    const E = edges.map(([a, b, k]) => { const A = nodes[a], Bn = nodes[b]; return `<line class="vk-i rtl" data-s="${k}" x1="${A[0]}" y1="${A[1] + 16}" x2="${Bn[0]}" y2="${Bn[1] - 16}"/>`; }).join("");
    const N = Object.values(nodes).map(([x, y, wd, lab, k, cls = "", on = "", note = ""]) => `<g class="vk-i rtn ${cls}" data-s="${k}" ${on ? `data-on="${on}"` : ""}><rect x="${x - wd / 2}" y="${y - 16}" width="${wd}" height="32" rx="8"/><text x="${x}" y="${y + 5}">${lab}</text>${note ? `<text class="lb" x="${x}" y="${y - 21}">${note}</text>` : ""}</g>`).join("");
    return `<svg class="rtv" viewBox="0 0 ${w} ${hh}">${E}${N}${extra}</svg>`;
  };
  const tx = (k, x, y, t, cls = "ev") => `<text class="vk-i ${cls}" data-s="${k}" x="${x}" y="${y}">${t}</text>`;

  // ---- 1000 patients: natural frequency tree ----
  const disease = rt(600, 250, {
    r: [300, 24, 150, "1000 people", 0],
    s: [150, 100, 120, "10 sick", 1, "", "", "1% have it"], w: [450, 100, 140, "990 healthy", 1, "", "", "99%"],
    sp: [75, 182, 110, "9 test +", 2, "", "4:win", "90% caught"], sn: [215, 182, 110, "1 test −", 2, "", "", "10% missed"],
    wp: [385, 182, 120, "49.5 test +", 3, "", "4:q", "5% false +"], wn: [525, 182, 120, "940.5 test −", 3, "", "", "95%"]
  }, [["r", "s", 1], ["r", "w", 1], ["s", "sp", 2], ["s", "sn", 2], ["w", "wp", 3], ["w", "wn", 3]],
    tx(5, 300, 238, "positives: 9 + 49.5 = 58.5 → sick and positive: 9 / 58.5 = <tspan class='big'>0.154</tspan>"));

  // ---- enumeration tree for one value of B ----
  const etree = (bv) => {
    const T = bv ? { pb: "P(b) = 0.001", a: [0.95, 0.05, 0.94, 0.06], p: ["0.5985", "0.000025", "0.5922", "0.00003"], s: ["0.598525", "0.59223"], w: ["0.001197", "0.591046"], tot: "s<tspan baseline-shift='sub' font-size='10'>B</tspan> = (0.001197 + 0.591046) × 0.001 = ", ans: "0.000592", c: "b" }
      : { pb: "P(¬b) = 0.999", a: [0.29, 0.71, 0.001, 0.999], p: ["0.1827", "0.000355", "0.00063", "0.0004995"], s: ["0.183055", "0.0011295"], w: ["0.000366", "0.001127"], tot: "s<tspan baseline-shift='sub' font-size='10'>¬B</tspan> = (0.000366 + 0.001127) × 0.999 = ", ans: "0.001492", c: "¬b" };
    const al = (i) => `P(${i % 2 ? "¬a" : "a"}|${T.c},${i < 2 ? "e" : "¬e"}) = ${T.a[i]}`;
    const X = [70, 222, 378, 530];
    const nodes = { r: [300, 22, 150, T.pb, 0, "q"], e: [150, 86, 140, "P(e) = 0.002", 0], ne: [450, 86, 140, "P(¬e) = 0.998", 0] };
    X.forEach((x, i) => { nodes["a" + i] = [x, 150, 146, al(i), 0, "", bv ? "" : "0:hot"]; nodes["l" + i] = [x, 214, 136, i % 2 ? "j,m | ¬a: 0.0005" : "j,m | a: 0.63", 0, "ok"]; });
    const edges = [["r", "e", 0], ["r", "ne", 0], ["e", "a0", 0], ["e", "a1", 0], ["ne", "a2", 0], ["ne", "a3", 0]].concat(X.map((_, i) => ["a" + i, "l" + i, 0]));
    let ex = X.map((x, i) => tx(1, x, 254, "× → " + T.p[i])).join("");
    ex += tx(2, 150, 284, "add: " + T.s[0]) + tx(2, 450, 284, "add: " + T.s[1]);
    ex += tx(3, 150, 306, "× 0.002 = " + T.w[0]) + tx(3, 450, 306, "× 0.998 = " + T.w[1]);
    ex += tx(4, 300, 334, T.tot + `<tspan class="big">${T.ans}</tspan>`, "ev tot");
    return rt(600, 344, nodes, edges, ex);
  };

  VIDEO_LESSONS.l11 = {
    title: "L11: Probabilistic Reasoning", chapters: [
      { t: "Why probability", sec: [0], scenes: [
        { v: title("Probabilistic Reasoning", "Week 11 lesson") + list([[1, "<b>Degrees of belief</b>: numbers between 0 and 1 instead of true or false"], [2, "The <b>rules</b>: NOT, AND, OR, conditional probability, <b>Bayes' rule</b>"], [3, "<b>Bayesian networks</b>: a whole world of uncertainty in a few small tables"], [4, "<b>Exact inference</b>: P(Burglary | John and Mary call), two ways"]]),
          n: ["Welcome to week 11: probabilistic reasoning. Last week the agent reasoned with logic, where every sentence is simply true or false. Real agents rarely get that kind of certainty.",
            "So this week we replace true or false with degrees of belief: probabilities between 0 and 1.",
            "We'll cover the rules for working with them, including conditional probability and Bayes' rule, which lets an agent update its beliefs when evidence arrives.",
            "Then Bayesian networks, a compact way to store all the uncertainty about a situation as a graph plus a few small tables.",
            "And finally exact inference. We'll work out the probability of a burglary given that both neighbours called, in two different ways, and get the same answer both times."] },
        { v: h("From true / false to a <b>degree of belief</b>") + stg(0, [
            fix(zone("", 70, .5, "bline"), 50, 62), fix(tag("0<br>certainly false", "lbl"), 15, 84), fix(tag("1<br>certainly true", "lbl"), 85, 84), fix(tag("0.5", "lbl"), 50, 84),
            act(tag(say({ 0: "logic: true", 1: "logic: false", 2: "rain tomorrow: 0.7", 3: "<b>prior</b> P(disease) = 0.01", 4: "<b>posterior</b> after a + test: 0.154" }), "hi"), { 0: [85, 30], 1: [15, 30], 2: [64, 30], 3: [16, 30], 4: [26, 30] }),
            act(`<div class="wk"></div>`, { 0: [85, 62], 1: [15, 62], 2: [64, 62], 3: [15.7, 62], 4: [25.8, 62] })
          ], "16/3.4", "tall") + cols(card(2, "", "<b>Partially observable</b>: you can't see everything. Noisy GPS, a hidden disease."), card(2, "", "<b>Non-deterministic</b>: same action, different outcomes. Stock trading."), card(4, "tip", "<b>Prior</b>: belief <b>before</b> evidence. <b>Posterior</b>: belief <b>after</b> evidence.")),
          n: ["In logic, a sentence sits at one end of this line. It's either true, which is 1,",
            "or false, which is 0. Nothing in between.",
            "Probability lets the agent sit anywhere on the line. A weather app that says 70 percent chance of rain is giving you a degree of belief of 0.7. The agent needs this because its environment is uncertain in two ways. It may be partially observable, so it can't see everything, like a noisy GPS or a disease hidden inside the body. Or it may be non-deterministic, where the same action can lead to different outcomes, like buying a stock.",
            "Before any evidence arrives, the agent holds a prior probability. Say 1 percent of people have a certain disease. The prior is 0.01.",
            "After evidence arrives, like a positive test result, the agent updates to a posterior probability. Here it moves up to about 0.154. Later in this video we'll see exactly where that number comes from, and why it's still so low."] },
        { v: h("Teaser: did someone break in?") + stg(0, [
            fix(tag("Alarm rings at home", "big"), 50, 18),
            act(tag("John calls", "ok"), { 0: [22, 62, 0], 2: [22, 62, 1] }), act(tag("Mary calls", "ok"), { 0: [78, 62, 0], 3: [78, 62, 1] }),
            act(tag("mixes up the <b>phone</b> and the alarm", "lbl"), { 0: [22, 88, 0], 2: [22, 88, 1] }), act(tag("<b>loud music</b>: often misses it", "lbl"), { 0: [78, 88, 0], 3: [78, 88, 1] })
          ], "16/2.5", "tall") + pbar(1, null, "no calls yet", { 1: 0.4 }, { 1: "0.001" }, "h") + pbar(2, null, "John only", { 2: 1.5 }, { 2: "0.005" }, "h") + pbar(3, null, "John + Mary", { 3: 28.4 }, { 3: "0.284" }, "h", "4:win") + card(4, "", "Two calls: belief up almost <b>300 times</b>, yet still <b>under 30%</b>."),
          n: ["Here's the example for the whole week. You're at work. Your house has a burglar alarm, which is good at detecting burglaries but can also be set off by small earthquakes. Two neighbours, John and Mary, have promised to phone you if they hear it.",
            "Before anyone calls, the chance of a burglary is tiny: 0.001, one in a thousand.",
            "John calls. But John sometimes confuses his phone ringing with the alarm. If only John calls and Mary doesn't, the probability barely moves, to about 0.005.",
            "If Mary also calls, things change. Mary often misses the alarm because she plays loud music, so when she does call, it means something. The probability jumps to about 0.284.",
            "That's almost 300 times the prior, but still under 30 percent. By the end of this video, you'll be able to compute every one of these numbers by hand."] }
      ] },
      { t: "The probability rules", sec: [1], scenes: [
        { v: h("NOT, AND, OR") + split(venn, list([[0, "<b>NOT</b>: P(¬A) = 1 − P(A). Rain 0.3 → no rain 0.7"], [1, "<b>OR</b>: P(A ∨ B) = P(A) + P(B) − P(A ∧ B)"], [4, "0.6 + 0.3 − 0.1 = <b>0.8</b>. If they can't overlap (<b>mutually exclusive</b>), just add"], [5, "<b>AND</b> (independent): P(A ∧ B) = P(A) × P(B). Coin heads × die six = ½ × ⅙ = <b>1/12</b>"]], "tight")),
          n: ["Three basic rules. NOT, or the complement: the probability that A doesn't happen is 1 minus the probability that it does. If the chance of rain is 0.3, the chance of no rain is 0.7.",
            "OR is the addition rule. Picture all the students in a class. 60 percent drink coffee.",
            "30 percent drink tea. So is the chance that a student drinks coffee or tea 0.6 plus 0.3?",
            "No. The students who drink both sit in the overlap, and they've been counted twice, once in each circle. 10 percent drink both.",
            "So we subtract the overlap once: 0.6 plus 0.3 minus 0.1 gives 0.8. If the two events can't happen together, they're mutually exclusive, the overlap is empty, and you just add.",
            "AND, for independent events, is multiplication. Flipping a coin doesn't affect a die, so heads and a six is a half times a sixth, which is one twelfth. Be careful: this shortcut only works when the events are independent."] },
        { v: h("Conditional probability: <b>B becomes the whole world</b>") + split(dots, fx(0, "P(A | B) = P(A ∧ B) / P(B)", "c") + list([[4, "P(A) = 10/20 = 0.5 &nbsp; but &nbsp; P(A | B) = 6/8 = <b>0.75</b>"], [5, "<b>Product rule</b>: P(A ∧ B) = P(A | B) P(B) = P(B | A) P(A)"], [5, "Check: 0.75 × 8/20 = 0.3 = 6/20 ✓"]], "tight")),
          n: ["Conditional probability, P of A given B, is the probability of A when you already know B is true. Here are 20 students.",
            "B is: attended every lab. 8 students did.",
            "A is: passed the exam. The green ones passed. 10 out of 20 passed overall.",
            "Now we're told a student attended every lab. Everyone outside the B box can be ignored. B becomes the whole world.",
            "Inside that world, 6 of the 8 passed. So P of A given B is 6 out of 8, which is 0.75, compared with 0.5 for a random student. That's the formula: the probability of both, 6 out of 20, divided by the probability of B, 8 out of 20.",
            "Rearrange it and you get the product rule: the probability of A and B equals P of A given B times P of B. It works either way round, P of B given A times P of A. Check: 0.75 times 8 twentieths is 0.3, which is exactly 6 out of 20. We'll use the product rule to build Bayes' rule next."] }
      ] },
      { t: "Bayes' rule", sec: [1], scenes: [
        { v: h("Two directions of reasoning") + stg(0, [
            fix(tag("<b>D</b>isease (cause)", "big"), 16, 50), fix(tag("<b>S</b>ymptom (effect)", "big"), 84, 50),
            fix(tag("causal ⟶ &nbsp;P(S | D): known from studies", "hi"), 50, 20, 1), fix(tag("⟵ diagnostic &nbsp;P(D | S): what the doctor needs", "ok"), 50, 80, 2)
          ], "16/2.7", "tall") + fx(3, say({ 3: "P(D | S) = P(S | D) P(D) / P(S)", 4: "<b>posterior</b> = <b>likelihood</b> × <b>prior</b> / evidence" }), "c") + cols(card(4, "", "P(S | D) <b>likelihood</b>, P(D) <b>prior</b>, P(S) via <b>normalisation</b>."), card(5, "warn", "<b>Trap</b>: P(D | S) ≠ P(S | D). Asked effect → cause? <b>Bayes</b>.")),
          n: ["Causes and effects can be linked in either direction. Take a disease and a symptom.",
            "The causal direction goes from cause to effect: P of S given D, how likely the symptom is if you have the disease. This is usually stable and known, from medical studies.",
            "The diagnostic direction goes from effect back to cause: P of D given S, how likely the disease is given the symptom. That's what a doctor actually needs to make a decision, but it's rarely written down anywhere.",
            "Bayes' rule converts the one you know into the one you want. Write the product rule both ways round, P of S given D times P of D equals P of D given S times P of S, then divide by P of S.",
            "Each part has a name. P of S given D is the likelihood, the causal knowledge. P of D is the prior, how common the disease is before any evidence. P of S is how common the symptom is overall, and in practice it's usually handled by normalisation. And P of D given S is the posterior.",
            "The classic exam trap: P of D given S and P of S given D are different numbers. If a question gives you how often the cause produces the effect, and asks how likely the cause is given the effect, you need Bayes' rule."] },
        { v: h("Bayes with 1000 people") + disease + cols(card(5, "", "Formula: P(+) = 0.9 × 0.01 + 0.05 × 0.99 = 0.0585. &nbsp;P(D | +) = 0.009 / 0.0585 = <b>0.154</b>"), card(5, "tip", "Rare disease → most positives are <b>false alarms</b>. Always check the <b>prior</b>.")),
          n: ["Here's Bayes' rule with real numbers. A disease affects 1 percent of people. The test catches 90 percent of sick people, and gives a false positive to 5 percent of healthy people. You test positive. How worried should you be? Imagine 1000 people.",
            "1 percent are sick, so 10 people. The other 990 are healthy.",
            "Of the 10 sick people, the test catches 90 percent: 9 test positive, 1 is missed.",
            "Of the 990 healthy people, 5 percent get a false positive. That's 49.5 people, against 940.5 who correctly test negative.",
            "Now look only at the positive tests. 9 are truly sick, and 49.5 are healthy people with a false alarm. The false alarms outnumber the real cases by more than 5 to 1.",
            "So out of 58.5 positives, only 9 are sick: 9 divided by 58.5 is 0.154. With the formula: P of a positive is 0.9 times 0.01 plus 0.05 times 0.99, which is 0.0585. Then P of disease given positive is 0.009 divided by 0.0585, the same 0.154. Only about 15 percent, because the disease is so rare. Remember this pattern, because the burglary example ends the same way."] }
      ] },
      { t: "The full joint table", sec: [2], scenes: [
        { v: h("Every possible world: 2<sup>n</sup> rows") + flow([[1, "<b>B</b>urglary"], [2, "<b>E</b>arthquake"], [3, "<b>A</b>larm"], [4, "<b>J</b>ohnCalls"], [5, "<b>M</b>aryCalls"]], "sm") + worlds + fx(5, say({ 5: "5 variables → <b>32 rows</b>, adding up to 1", 6: "20 variables → <b>1,048,576 rows</b>. Too big to store or estimate" }), "c"),
          n: ["A random variable is a feature of the world whose value is uncertain. Here every variable is Boolean, true or false. Lower case means a specific value: little b means Burglary is true, and not b means it's false. The full joint distribution gives a probability for every possible combination of values. Watch it grow.",
            "One variable, Burglary: 2 rows, true or false.",
            "Add Earthquake: each row splits in two. 4 rows.",
            "Add Alarm: 8 rows.",
            "Add JohnCalls: 16 rows.",
            "Add MaryCalls: 32 rows, and all 32 probabilities add up to 1. With this table, you can answer any question about these five variables.",
            "The catch: it doubles with every Boolean variable. With 20 variables you'd need over a million rows. That's too big to store, and far too many numbers to estimate. Bayesian networks solve this, as we'll see."] },
        { v: h("Where a joint table comes from: <b>counting</b>") + tbl(["J", "M", "A", "B", "E", "Occurrence", "Probability"], [[0, "F", "F", "F", "F", "F", "93,674,270,100", "0.936742701"], [0, "T", "F", "F", "F", "F", "4,930,224,700", "0.049302247"], [1, "F", "T", "F", "F", "F", "946,204,748", "0.009462047"], [1, "T", "T", "T", "T", "F", "59,101,560", "0.000591016"], [2, "T", "T", "F", "T", "T", "5", "0.00000000005"]], "sm") + cols(card(0, "", "P = occurrence ÷ <b>10<sup>11</sup></b> trials: a giant <b>tally chart</b>."), card(3, "warn", "Two counts are <b>stored rounded</b>. Use exact figures."), card(4, "ok", "CPTs estimated from it = <b>exactly</b> the network.")),
          n: ["Where does a full joint table come from? One way is counting. Class activity 2 runs the burglary world about 100 billion times, 10 to the 11, and counts how often each of the 32 combinations happens. Each row's probability is its count divided by the total. The nothing-happens row, where nobody calls and there's no alarm, burglary or earthquake, dominates at about 0.94. John calling by mistake comes next at about 0.049.",
            "Mary calling alone is rarer. And the row where both call, the alarm rings, and there's a real burglary without an earthquake, happened about 59 million times, a probability of 0.000591.",
            "Some rows are extremely rare. A burglary and an earthquake, no alarm, and both neighbours calling anyway happened only 5 times.",
            "One spreadsheet check. In the occurrence column, two counts are stored rounded: 93,670,000,000 instead of the exact value, and 4,930,000,000 instead of 4,930,224,700. The probability column uses the exact values, which is why it totals 1. If you compute from the raw counts, use the exact figures.",
            "And if you estimate each network table from this joint table, you get back exactly the numbers in the Bayesian network, like P of b equals 0.001. The 32-row table and the network describe the same distribution."] },
        { v: h("Marginalisation: <b>summing out</b>") + split(rtab(["X", "Y", "Z", "P(X, Y, Z)"], [[0, "1:hot", "x₁", "y₁", "z₁", "0.06"], [0, "1:hot", "x₁", "y₁", "z₂", "0.09"], [0, "1:hot", "x₁", "y₂", "z₁", "0.14"], [0, "1:hot", "x₁", "y₂", "z₂", "0.11"], [0, "", "x₂", "y₁", "z₁", "0.12"], [0, "", "x₂", "y₁", "z₂", "0.18"], [0, "", "x₂", "y₂", "z₁", "0.20"], [0, "", "x₂", "y₂", "z₂", "0.10"]]), fx(0, "P(X = x) = Σ<sub>y</sub> Σ<sub>z</sub> P(x, y, z)", "c") + fx(2, "P(x₁) = 0.06 + 0.09 + 0.14 + 0.11 = <b>0.40</b>", "c") + card(3, "ana", "Like a <b>shopping receipt</b>: to find what you spent on fruit, add every fruit line, whatever the brand or size.")),
          n: ["Marginalisation removes variables from a joint distribution by summing their probabilities. To get P of X equals x, sum over every value of the other variables, here Y and Z. This is the class exercise table.",
            "First, keep only the rows where X has the value you want, x 1. That's the top four rows.",
            "Then add them: 0.06 plus 0.09 plus 0.14 plus 0.11 gives 0.40. Y and Z have been summed out. The class exercise blanks: sum over Y and Z, keep rows where X has the required value, the fourth probability is 0.11, the total is 0.40, and marginalisation removes variables by summing.",
            "Think of a shopping receipt. To find how much you spent on fruit, you add every fruit line, whatever the brand or size. The brand and size are the variables you're summing out."] }
      ] },
      { t: "Bayesian networks", sec: [3], scenes: [
        { v: h("The burglar alarm network") + split(bnet({ ns: { B: 1, E: 1, A: 2, J: 3, M: 3 }, es: { BA: 2, EA: 2, AJ: 3, AM: 3 }, cs: { B: 4, E: 4, A: 5, J: 6, M: 6 } }), list([[0, "<b>Node</b> = random variable"], [2, "<b>Arrow</b> X → Y: X directly influences Y. X is a <b>parent</b>"], [3, "No cycles: a <b>DAG</b>"], [4, "<b>CPT</b> at each node: P(node | parents). No parents → a prior"], [5, "Only the <b>true</b> value is listed: P(¬a | b, ¬e) = 1 − 0.94 = 0.06"], [6, "John: false alarms 5%. Mary: misses 30% of real alarms"]], "tight")),
          n: ["A Bayesian network avoids the 2 to the n explosion by recording only the direct influences between variables. Each variable is a node.",
            "Burglary and Earthquake. Nothing causes these in our model, so they have no parents.",
            "Both can set off the Alarm. An arrow from X to Y means X directly influences Y, and X is called a parent of Y. So Alarm has two parents.",
            "The alarm makes John call, and makes Mary call. The arrows never loop back, so the graph is a directed acyclic graph, or DAG.",
            "Each node has a conditional probability table, a CPT, giving its probability for every combination of its parents' values. A node with no parents just has a prior. P of burglary is 0.001. P of earthquake is 0.002.",
            "The alarm has two parents, so its table has four rows. With a burglary and an earthquake, 0.95. Burglary only, 0.94. Earthquake only, 0.29. Neither, 0.001. Only the probability of true is listed, because false is 1 minus it. For example, P of no alarm given a burglary and no earthquake is 1 minus 0.94, which is 0.06.",
            "John calls 90 percent of the time when the alarm rings, but also 5 percent of the time when it doesn't, because of the phone. Mary calls 70 percent of the time when it rings, so she misses 30 percent, but only 1 percent of the time when it doesn't."] },
        { v: h("Factorisation: <b>one entry per node, multiply</b>") + split(bnet({ lit: { J1: "1:hot", M1: "2:hot", A4: "3:hot", B0: "4:hot", E0: "5:hot" } }), fx(0, "P(x₁, ..., xₙ) = Π<sub>i</sub> P(xᵢ | parents(Xᵢ))", "sm") + fx(0, "P(j, m, a, ¬b, ¬e) =", "sm") + fx(0, say({ 0: "?", 1: "0.90", 2: "0.90 × 0.70", 3: "0.90 × 0.70 × 0.001", 4: "0.90 × 0.70 × 0.001 × 0.999", 5: "0.90 × 0.70 × 0.001 × 0.999 × 0.998", 6: "≈ <b>0.000628</b>" }), "c") + card(6, "tip", "Same as the FFT row of the joint table: 0.00062811")),
          n: ["The key property of a Bayesian network: the joint probability of any full assignment equals the product of each variable's CPT entry, given its parents. For burglary, P of B, E, A, J, M is P of B times P of E times P of A given B and E, times P of J given A, times P of M given A. Let's compute: both neighbours call, the alarm rings, and there's no burglary and no earthquake.",
            "John calls, given the alarm: 0.90.",
            "Mary calls, given the alarm: 0.70.",
            "The alarm rings, given no burglary and no earthquake: 0.001.",
            "No burglary: 1 minus 0.001, which is 0.999.",
            "No earthquake: 1 minus 0.002, which is 0.998.",
            "Multiply: about 0.000628. That matches the corresponding row of the full joint table exactly. Read one entry per variable, multiply, done."] },
        { v: h("32 numbers vs <b>10</b>") + split(bnet({ non: { A: "4:hot", J: "5:ev", M: "5:ev" }, extra: tx(1, 60, 22, "1", "cnt") + tx(1, 540, 22, "1", "cnt") + tx(2, 585, 100, "4", "cnt") + tx(3, 45, 295, "2", "cnt") + tx(3, 555, 295, "2", "cnt") }), list([[0, "Full joint: <b>32</b> numbers (31 free)"], [3, "Network: 1 + 1 + 4 + 2 + 2 = <b>10</b>, yet it rebuilds all 32 rows"], [4, "<b>Conditional independence</b>: once A is known, J tells you nothing about M"], [5, "P(J, M | A) = P(J | A) P(M | A)"], [6, "Each node is independent of its <b>non-descendants</b> given its <b>parents</b>"]], "tight") + card(4, "ana", "John and Mary never talk. They both only <b>hear the alarm</b>.")),
          n: ["Why bother? The full joint table needs 32 numbers, or 31 free ones, since the last is fixed by summing to 1.",
            "The network needs 1 number for burglary, 1 for earthquake,",
            "4 for the alarm,",
            "and 2 each for John and Mary. That's 10 numbers in total, yet multiplying them rebuilds every one of the 32 rows. The saving grows enormously as networks get bigger.",
            "The structure also encodes conditional independence. Once you know whether the alarm rang, John's call tells you nothing more about whether Mary will call. John and Mary never talk to each other. They both only react to the alarm.",
            "In symbols: the probability of J and M given A equals P of J given A times P of M given A. That's why their tables only depend on A.",
            "In general, each node is conditionally independent of its non-descendants, given its parents."] },
        { v: h("Building a network") + flow([[0, "Choose the <b>variables</b>"], [1, "<b>Order</b> them: causes before effects"], [2, "For each node, pick a <b>minimal set of parents</b>"], [3, "Fill in the <b>CPTs</b>"]], "sm") + fx(2, "P(Xᵢ | Xᵢ₋₁, ..., X₁) = P(Xᵢ | Parents(Xᵢ))", "c") + cols(card(1, "ok", "Order B, E, A, J, M → <b>4 arrows</b>, compact."), card(1, "bad", "Order M, J, A, B, E → extra arrows and harder numbers to estimate."), card(4, "ana", "A BN is a <b>family tree of causes</b>. Instead of every family photo (the joint table), remember how each child resembles its <b>parents</b>.")),
          n: ["To construct a Bayesian network, first choose the variables.",
            "Then order them. Putting causes before effects gives a compact network. The order burglary, earthquake, alarm, John, Mary needs only four arrows. Start from the effects instead, Mary, John, alarm, burglary, earthquake, and you need extra arrows, with probabilities that are much harder to estimate.",
            "Then for each node, choose a minimal set of parents from the nodes before it, so that the probability of that node given everything before it equals its probability given just its parents.",
            "Finally fill in each CPT.",
            "Here's an analogy. A Bayesian network is a family tree of causes. Instead of memorising every family photo, which is the full joint table, you only remember how each child resembles its parents. That's the CPTs."] }
      ] },
      { t: "Setting up a query", sec: [4], scenes: [
        { v: h("Query, evidence, hidden") + split(bnet({ non: { B: "1:q", J: "2:ev", M: "2:ev", A: "3:hid", E: "3:hid" } }), rtab(["Role", "In P(B | j, m)"], [[1, "", "<b>Query</b> X", "Burglary"], [2, "", "<b>Evidence</b> E = e", "j = T, m = T"], [3, "", "<b>Hidden</b> Y", "Alarm, Earthquake"]]) + fx(4, "P(X | e) = α Σ<sub>y</sub> P(X, e, y)", "c") + flow([[5, "Factorise"], [5, "Apply evidence"], [5, "Sum out hidden"], [5, "Normalise"]], "sm")),
          n: ["Every exact inference problem splits the variables into three groups. Our question: how likely is a burglary, given that John and Mary both called?",
            "The query variable, X, is the one we want the posterior for: Burglary.",
            "The evidence variables are the observed ones, with their observed values: JohnCalls is true and MaryCalls is true.",
            "Everything else is hidden: Alarm and Earthquake. We haven't observed them, so they are not extra evidence. We don't know their values, so we sum over all of them.",
            "The general formula: P of X given e equals alpha times the sum, over every value of the hidden variables, of the joint probability of X, e and y.",
            "So the process has four steps. Factorise the joint, from the table or as a product of CPT entries. Apply the evidence by fixing the observed values. Sum out the hidden variables. And normalise so the answer adds to 1. Returning an unnormalised result is wrong."] }
      ] },
      { t: "Method 1: the full joint table", sec: [2, 4], scenes: [
        { v: h("Filter, group, sum, normalise") + split(at(1, rtab(["B", "E", "A", "P(B, E, A, j, m)"], [[1, "2:grT", "T", "T", "T", "0.000001197"], [1, "2:grT", "T", "T", "F", "0.00000000005"], [1, "2:grT", "T", "F", "T", "0.0005910156"], [1, "2:grT", "T", "F", "F", "0.00000002994"], [1, "2:grF", "F", "T", "T", "0.0003650346"], [1, "2:grF", "F", "T", "F", "0.00000070929"], [1, "2:grF", "F", "F", "T", "0.00062811126"], [1, "2:grF", "F", "F", "F", "0.0004980025"]], "mono jt")),
            at(0, `<div class="vk-i" data-s="0" data-x="1">${tag("32 rows: J and M take every value", "ghost")}</div>`) + fx(3, "s<sub>B</sub> = sum of the 4 B = T rows ≈ <b>0.000592</b>", "sm") + fx(3, "s<sub>¬B</sub> = sum of the 4 B = F rows ≈ <b>0.001492</b>", "sm")
            + pbar(4, null, "b", { 4: 5.92, 5: 28.4 }, { 4: "0.000592", 5: "<b>0.284</b>" }, "g") + pbar(4, null, "¬b", { 4: 14.92, 5: 71.6 }, { 4: "0.001492", 5: "0.716" }, "t") + card(6, "bad", "Don't pick the <b>biggest row</b> or the bigger score and call it the answer. <b>Add</b> all the relevant rows, then normalise.")),
          n: ["Method 1 works directly on the full joint table. We start with all 32 rows.",
            "Step 1, filter. Keep only the rows that match the evidence, j true and m true. That leaves 8 of the 32 rows. The spreadsheet sorts by J and M first, which makes this easy.",
            "Step 2, group. Split the 8 rows by the query variable: 4 rows where B is true, and 4 where B is false.",
            "Step 3, marginalise. In each group, add all 4 rows, covering every combination of E and A. The burglary group adds up to about 0.000592. The no-burglary group adds up to about 0.001492. These are unnormalised scores, s B and s not B. They are not probabilities yet.",
            "Step 4, normalise. Here are the two scores, drawn ten thousand times bigger so you can see them. Together they're only about 0.002, but the two answers must add to 1.",
            "Divide each by the total. 0.000592 divided by 0.002084 is 0.284. The other is 0.716. Normalising is like turning 2 votes against 5 votes into percentages: it keeps the ratio and rescales to a total of 1. That's why you never need P of the evidence directly. It drops out.",
            "Two classic mistakes the exercises test. Don't choose the single biggest row, and don't pick the larger score and call it 1. Marginalisation means adding all the relevant rows, then normalising."] },
        { v: h("Second example: John calls, Mary <b>doesn't</b>") + fx(0, "P(B | j, ¬m): filter J = T, M = F, group by B, sum", "c") + pbar(1, null, "B = T", { 1: 0.51, 3: 0.51 }, { 1: "0.000257", 3: "<b>0.0051</b>" }, "g") + pbar(1, null, "B = F", { 1: 99.5, 3: 99.5 }, { 1: "0.049798", 3: "0.9949" }, "t") + fx(2, "α = 1 / (0.000257 + 0.049798) ≈ <b>19.98</b>", "c") + card(4, "tip", "Only John calling is far more likely to be the <b>phone</b> than a burglar. Mary's silence pulls the belief back down."),
          n: ["The spreadsheet also works a second example: John calls, but Mary doesn't. Filter on J true and M false, group by B, and sum.",
            "The burglary group sums to 0.000257, and the no-burglary group to 0.049798. These bars show the scores in proportion to each other. Burglary is a sliver.",
            "The spreadsheet normalises by computing alpha, 1 divided by the sum of the two values. That's about 19.98.",
            "Multiply each value by alpha: 0.0051 for burglary and 0.9949 for no burglary.",
            "With only John calling, a burglary is still very unlikely. John's call is much more likely to be him mistaking the phone for the alarm, and Mary not calling makes a real alarm less likely too."] }
      ] },
      { t: "Method 2: enumeration", sec: [4], scenes: [
        { v: h("Build the enumeration expression") + fx(0, say({ 0: "P(B | j, m) = α Σ<sub>e</sub> Σ<sub>a</sub> P(B, j, m, e, a)", 1: "= α Σ<sub>e</sub> Σ<sub>a</sub> P(B) P(e) P(a | B, e) P(j | a) P(m | a)", 2: "= α <b>P(B)</b> Σ<sub>e</sub> Σ<sub>a</sub> P(e) P(a | B, e) P(j | a) P(m | a)", 3: "= α P(B) Σ<sub>e</sub> <b>P(e)</b> Σ<sub>a</sub> P(a | B, e) P(j | a) P(m | a)" }), "c") + cols(card(2, "ana", "Like <b>3a + 3b = 3(a + b)</b>: a factor that doesn't change inside the sum moves out."), card(3, "", "Sums run over the <b>hidden</b> E and A. B is the query, j and m are fixed.")) + fx(4, "Σ<sub>e</sub> P(e) Σ<sub>a</sub>(...) = <b>P(e)</b> Σ<sub>a</sub>(... e ...) + <b>P(¬e)</b> Σ<sub>a</sub>(... ¬e ...)", "sm") + fx(5, "Σ<sub>a</sub> P(a | ¬b, e) P(j | a) P(m | a) = P(<b>a</b> | ¬b, e) P(j | <b>a</b>) P(m | <b>a</b>) + P(<b>¬a</b> | ¬b, e) P(j | <b>¬a</b>) P(m | <b>¬a</b>)", "sm"),
          n: ["In practice you rarely have the full table. Inference by enumeration computes the same sums straight from the network's CPTs. Start from the general formula: alpha times the sum over the hidden variables e and a of the joint probability.",
            "Substitute the factorisation. The joint becomes P of B, times P of e, times P of a given B and e, times P of j given a, times P of m given a.",
            "P of B doesn't depend on e or a, so it moves outside both sums. It's like 3a plus 3b equals 3 times a plus b. A factor that stays the same in every term can be pulled out, and that saves work.",
            "P of e depends only on e, so it moves outside the sum over a. The sums run over E and A, the hidden variables. B is the query, and j and m are fixed evidence.",
            "Now expand. A sum over a Boolean variable becomes two branches, one per value, each weighted by its own probability. Over E: P of e times the inner sum with e, plus P of not e times the inner sum with not e.",
            "Then inside the e branch, expand over A. Careful here: the evidence factors must use the same value of A as the alarm factor in that branch. P of j given a and P of m given a go with the a term. P of j given not a and P of m given not a go with the not a term."] },
        { v: h("Enumeration tree, B = <b>true</b>: evaluate inside out") + etree(true),
          n: ["The expression can be drawn as a tree. The root is P of b, 0.001. It branches over Earthquake, with weights 0.002 and 0.998, then over Alarm, using the CPT rows with b. At the bottom are the evidence likelihoods: P of j given a times P of m given a is 0.9 times 0.7, which is 0.63. Given not a, 0.05 times 0.01 is 0.0005. We evaluate from the inside out.",
            "Step 1: along each path, multiply. 0.95 times 0.63 is 0.5985. 0.05 times 0.0005 is 0.000025. 0.94 times 0.63 is 0.5922. And 0.06 times 0.0005 is 0.00003.",
            "Step 2: within each E branch, add the a and not a paths, because they're alternative possibilities. 0.598525 on the earthquake side, 0.59223 on the other.",
            "Step 3: weight each E branch by its prior. 0.598525 times 0.002 is 0.001197. 0.59223 times 0.998 is 0.591046.",
            "Step 4: add the two branches and multiply by P of b. That gives s B, about 0.000592, exactly the same as the full joint method."] },
        { v: h("Enumeration tree, B = <b>false</b>") + etree(false),
          n: ["Now repeat with B false. The root becomes P of not b, 0.999. The only other change is the alarm CPT. Now we use the not b rows: 0.29 with an earthquake and 0.001 without. The evidence likelihoods at the bottom don't change.",
            "Multiply along each path. 0.29 times 0.63 is 0.1827. 0.71 times 0.0005 is 0.000355. 0.001 times 0.63 is 0.00063. And 0.999 times 0.0005 is 0.0004995.",
            "Add within each E branch: 0.183055 and 0.0011295.",
            "Weight by the earthquake priors: 0.000366 and 0.001127.",
            "Add and multiply by 0.999: s not B is about 0.001492. Normalise: 0.000592 divided by 0.000592 plus 0.001492 gives 0.284 again. Both methods give an identical, exact answer."] },
        { v: h("Comparing methods, and what scales") + tbl(["", "Full joint table", "Enumeration"], [[0, "Input", "All 2<sup>n</sup> probabilities", "Only the CPTs"], [0, "Joint values", "Read from the table", "Multiplied from CPT entries"], [0, "Steps", "Filter, group, sum, normalise", "Factorise, expand, inside out, normalise"], [0, "Answer", "Exact", "Exact (identical)"], [1, "Big networks?", "No, the table explodes", "Better, still exponential in hidden vars"]], "sm") + cols(card(2, "", "<b>Variable elimination</b>: P(j | a) P(m | a) is computed several times. Store it once and reuse it, like <b>caching</b>."), card(3, "", "<b>Approximate</b>: direct sampling, rejection sampling, likelihood weighting, MCMC. Like a <b>poll</b> of 1,000 people instead of a census.")),
          n: ["Comparing the two methods. The full joint method needs all 2 to the n probabilities and reads them from the table. Enumeration needs only the CPTs and multiplies them on the fly. Both give an exact, identical answer.",
            "Neither scales well. The table explodes, and enumeration is still exponential in the number of hidden variables.",
            "Look back at the trees. P of j given a times P of m given a was computed again and again. Variable elimination is a better exact method: it stores intermediate results and reuses them, a bit like caching.",
            "For really big networks, we use approximate inference: direct sampling, rejection sampling, likelihood weighting, and Markov chain Monte Carlo, or MCMC. It's like running a poll of a thousand people instead of asking the whole country. This module focuses on exact inference in static worlds."] }
      ] },
      { t: "Interpreting the answer", sec: [4], scenes: [
        { v: h("Why is it still only 28%?") + pbar(0, null, "prior", { 0: 0.4 }, { 0: "0.001" }, "h") + pbar(0, null, "John only", { 0: 1.5 }, { 0: "0.005" }, "h") + pbar(0, null, "John + Mary", { 0: 28.4 }, { 0: "0.284" }, "h") + list([[1, "<b>The prior is tiny</b>: burglaries happen 0.001 of the time, so most alarms are false"], [2, "<b>False alarms are common</b>: 0.001 without a cause, 0.29 with an earthquake"], [3, "<b>The neighbours are imperfect</b>: John calls 5% with no alarm, Mary misses 30%"], [4, "Mary's call is strong evidence: she calls without an alarm only <b>1%</b> of the time"]], "tight") + card(5, "tip", "Same lesson as the <b>rare disease</b>: strong evidence for a rare cause can still leave it unlikely. Always factor in the <b>base rate</b>."),
          n: ["Let's interpret the answer. The prior was 0.001. With John alone it's about 0.005. With both calls it's about 0.284. Two calls push it up almost 300 times, yet it's still under 30 percent. Why so low?",
            "First, the prior is tiny. Burglaries happen with probability 0.001, so most alarms are false alarms.",
            "Second, false alarms are common compared with burglaries. The alarm goes off with no burglary and no earthquake with probability 0.001, about as often as burglaries happen at all, and 0.29 when there's an earthquake.",
            "Third, the neighbours are imperfect. John calls 5 percent of the time with no alarm, and Mary misses 30 percent of real alarms.",
            "Mary's call adds strong evidence because she rarely calls without an alarm, only 1 percent of the time. That's why adding her call moves the answer so much.",
            "The takeaway is the same one as the rare disease. Strong-looking evidence for a rare cause can still leave that cause unlikely. Diagnostic conclusions depend heavily on the prior, so always factor in the base rate."] }
      ] },
      { t: "Exam recipe", sec: [5], scenes: [
        { v: h("Which formula?") + rtab(["You're given", "Do this"], [[0, "", "P(A), P(B), <b>independent</b>", "AND = multiply. OR = P(A) + P(B) − P(A)P(B). NOT = 1 − P"], [1, "", "A <b>full joint table</b>", "Marginal = add matching rows. Conditional = P(both) / P(given)"], [2, "", "P(effect | cause), asked P(cause | effect)", "<b>Bayes</b>. Bottom: P(e) = Σ<sub>c</sub> P(e | c) P(c)"], [3, "", "A <b>Bayesian network</b>, asked P(query | evidence)", "<b>Enumeration</b>"]]) + flow([[4, "Label Q / E / H"], [4, "Write s<sub>B</sub>"], [4, "Pull factors out"], [4, "Inside out"], [4, "Repeat ¬b, normalise"]], "sm"),
          n: ["Here's how to pick the right formula in the exam. If you're given P of A and P of B and told they're independent: AND is multiply, OR is P of A plus P of B minus their product, and NOT is 1 minus P.",
            "If you're given a full joint table: a marginal is the sum of the matching rows, and a conditional is P of both divided by P of the given.",
            "If you're given P of effect given cause, but asked P of cause given effect, use Bayes' rule. Find the bottom of the fraction with total probability: P of e is the sum over causes of P of e given c times P of c.",
            "If you're given a Bayesian network and asked P of a query given evidence, use enumeration.",
            "Enumeration in five steps. Label the variables: query B, evidence j and m, hidden E and A. Write s B as P of b, sum over e of P of e, sum over a of P of a given b and e, times P of j given a, times P of m given a. Move factors that don't contain a summed variable outside its sum. Work inside out: for each E value add the a and not a terms, weight by P of e and P of not e and add, then multiply by P of b. Repeat with not b, where only the alarm CPT changes, then normalise. The two answers must add to 1."] },
        { v: h("One false call: P(b | j, <b>¬m</b>)") + cols(card(0, "", "Mary <b>didn't</b> call: P(¬m | a) = 1 − 0.70 = <b>0.30</b>"), card(0, "", "P(¬m | ¬a) = 1 − 0.01 = <b>0.99</b>")) + fx(1, "s<sub>B</sub> = 0.001 × {0.002 [0.95·0.90·<b>0.30</b> + 0.05·0.05·<b>0.99</b>] + 0.998 [0.94·0.90·<b>0.30</b> + 0.06·0.05·<b>0.99</b>]} ≈ <b>0.000257</b>", "sm") + fx(2, "s<sub>¬B</sub> = 0.999 × {0.002 [0.29·0.90·0.30 + 0.71·0.05·0.99] + 0.998 [0.001·0.90·0.30 + 0.999·0.05·0.99]} ≈ <b>0.049798</b>", "sm") + fx(3, "P(b | j, ¬m) = 0.000257 / (0.000257 + 0.049798) ≈ <b>0.0051</b>", "c"),
          n: ["A common variation: one neighbour doesn't call. For P of b given j and not m, you need Mary's not-calling probabilities. P of not m given a is 1 minus 0.70, which is 0.30. P of not m given not a is 1 minus 0.01, which is 0.99.",
            "Everything else is the same. s B is 0.001 times the bracket: 0.002 times 0.95 times 0.90 times 0.30, plus 0.05 times 0.05 times 0.99, plus 0.998 times 0.94 times 0.90 times 0.30, plus 0.06 times 0.05 times 0.99. That's about 0.000257.",
            "s not B uses the not b alarm rows, 0.29 and 0.001, and comes to about 0.049798.",
            "Normalise: 0.000257 divided by the total is about 0.0051, matching the spreadsheet. Mary not calling makes a burglary much less likely."] },
        { v: h("Common mistakes") + list([[0, "Forgetting the <b>¬a branch</b>: P(¬a | b, e) = 1 − P(a | b, e)"], [1, "Using P(j | a) for a <b>false</b> call. Use <b>1 − P(j | a)</b>"], [2, "Stopping at <b>s<sub>B</sub></b>. Not a probability until you normalise"], [3, "<b>Rounding too early</b>. Keep 4 to 6 significant figures until the end"], [4, "Mixing up <b>P(D | S)</b> and <b>P(S | D)</b>"], [5, "Treating <b>hidden</b> variables as evidence. Sum them out"]], "tight") + card(6, "tip", "Calc practice has unlimited questions: BN enumeration, marginalising, probability rules, Bayes with several causes, Bayes with a negative result."),
          n: ["The common mistakes. One: forgetting the not a branch. Every sum over A has two terms, and P of not a given b and e is 1 minus P of a given b and e.",
            "Two: using P of j given a when John did not call. For a false call, use 1 minus P of j given a.",
            "Three: stopping at s B. It's not a probability until you normalise.",
            "Four: rounding too early. The numbers are tiny, so keep 4 to 6 significant figures until the last step.",
            "Five: mixing up P of D given S with P of S given D.",
            "Six: treating hidden variables as if they were observed. You don't know their values, so you sum over them.",
            "The calc practice page has unlimited questions on all of these: BN enumeration, marginalising a joint table, probability rules, Bayes with several causes, and Bayes with a negative result."] },
        { v: h("Exam checklist") + list([[0, "Probability = <b>degree of belief</b>. Prior before evidence, posterior after"], [1, "NOT 1 − P. OR subtract the overlap. AND multiply only if <b>independent</b>"], [2, "P(A | B) = P(A ∧ B) / P(B). Bayes: posterior = likelihood × prior / evidence"], [3, "Causal P(effect | cause) is known. Diagnostic P(cause | effect) is needed"], [4, "Joint table: 2<sup>n</sup> rows. <b>Marginalise</b> by adding, <b>normalise</b> by dividing by the total"], [5, "BN: DAG + CPTs. Joint = product of P(node | parents). 10 numbers vs 32"], [6, "Query / evidence / <b>hidden</b>. Filter, group, sum, normalise, or enumerate inside out"], [7, "P(b | j, m) ≈ <b>0.284</b>. P(b | j, ¬m) ≈ 0.0051. Low prior → low posterior"]], "tight"),
          n: ["Here's your checklist. Probability is a degree of belief. The prior comes before evidence, the posterior after.",
            "NOT is 1 minus P. OR adds and subtracts the overlap. AND multiplies, but only for independent events.",
            "Conditional probability is P of both divided by P of the given. Bayes' rule: posterior equals likelihood times prior divided by evidence.",
            "Causal probabilities, P of effect given cause, are usually known. Diagnostic ones, P of cause given effect, are what you need.",
            "A full joint table has 2 to the n rows. Marginalise by adding rows, normalise by dividing by the total.",
            "A Bayesian network is a DAG with a CPT at each node. The joint is the product of each node given its parents, so burglary needs 10 numbers instead of 32.",
            "For inference, label query, evidence and hidden variables. Then either filter, group, sum and normalise on the table, or enumerate over the network inside out.",
            "And know the answers: P of b given j and m is about 0.284, and P of b given j and not m is about 0.0051. A low prior keeps the posterior low. Now try the calc practice and this week's quiz."] }
      ] }
    ]
  };
})();
