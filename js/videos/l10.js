(function () {
  const { title, h, list, fx, card, flow, cols, split, tbl, at, stg, act, fix, say, person, plate, tag, J } = VK;
  const sb = (t) => `<sub>${t}</sub>`;
  const P_ = (xy) => "P" + sb(xy), B_ = (xy) => "B" + sb(xy);

  // ---- light switches and bulbs: steps 1..4 = (P,Q) = TT, TF, FT, FF ----
  const ONS = (v) => v.map((b, i) => `${i + 1}:${b ? "on" : ""}`).join(" ");
  const TV = (v) => Object.assign({ 0: "?" }, Object.fromEntries(v.map((b, i) => [i + 1, b ? "T" : "F"])));
  const swc = (name, v) => `<div class="swc" data-on="${ONS(v)}"><b>${name}</b><i></i>${say(TV(v))}</div>`;
  const bl = (label, v, note) => `<div class="bl" data-on="${ONS(v)}"><i></i><b>${label}</b>${say(TV(v))}<small>${note}</small></div>`;

  // ---- the pizza promise: one card per case ----
  const pz = (k, p, q, verdict, cls) => `<div class="pz vk-i" data-s="${k}"><div class="pzv"><span class="tg ${p ? "ok" : "ghost"}">${p ? "passed" : "failed"}</span><span class="tg ${q ? "ok" : "ghost"}">${q ? "pizza" : "no pizza"}</span></div><div class="pzf">P = ${p ? "T" : "F"}, Q = ${q ? "T" : "F"}</div><div class="stamp ${cls}">${verdict}</div></div>`;

  // ---- models doubling: square i appears when 2^n > i, showing its T/F pattern ----
  const models = (() => {
    let o = "";
    for (let i = 0; i < 16; i++) {
      const first = i < 2 ? 1 : i < 4 ? 2 : i < 8 ? 3 : 4, T = {};
      for (let n = first; n <= 4; n++) T[n] = i.toString(2).padStart(n, "0").replace(/0/g, "T").replace(/1/g, "F");
      o += `<div class="vk-i md" data-s="${first}">${say(T)}</div>`;
    }
    return `<div class="mds">${o}</div>`;
  })();

  // ---- equivalence table with "most used" rows lighting up ----
  const eqt = (rows) => `<table class="vk-tbl sm eqt">${rows.map(([k, hot, name, f]) => `<tr class="vk-i" data-s="${k}" ${hot != null ? `data-on="${hot}:hot"` : ""}><td>${name}</td><td>${f}</td></tr>`).join("")}</table>`;

  // ---- who loves whom: quantifier order ----
  const qsvg = (() => {
    const L = 80, R = 330, Y = (i) => 40 + i * 46, ppl = ["Ann", "Ben", "Cat", "Dan"];
    let g = "";
    const ln = (a, b, k, x, cls) => `<line class="vk-i ql ${cls}" data-s="${k}" ${x != null ? `data-x="${x}"` : ""} x1="${L + 18}" y1="${Y(a)}" x2="${R - 21}" y2="${Y(b)}" marker-end="url(#qah)"/>`;
    [[0, 1], [1, 2], [2, 0], [3, 2]].forEach(([a, b]) => g += ln(a, b, 1, 2, "a"));
    [0, 1, 2, 3].forEach((a) => g += ln(a, 2, 2, null, "b"));
    ppl.forEach((n, i) => { g += `<g><circle cx="${L}" cy="${Y(i)}" r="16"/><text x="${L}" y="${Y(i) + 4}">${n}</text></g><g ${n === "Cat" ? 'data-on="2:star"' : ""}><circle cx="${R}" cy="${Y(i)}" r="16"/><text x="${R}" y="${Y(i) + 4}">${n}</text></g>`; });
    return `<svg class="qsv" viewBox="0 0 410 210"><defs><marker id="qah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><text class="qh" x="${L}" y="14">x: the one who loves</text><text class="qh" x="${R}" y="14">y: the one who is loved</text>${g}</svg>`;
  })();

  // ---- entailment: models as dots ----
  const ensvg = (() => {
    const inKB = [[130, 115], [172, 130], [150, 100]], inG = [[250, 80], [270, 150], [90, 168], [222, 58]], out = [[25, 30], [380, 190], [30, 205], [385, 205], [250, 210]];
    let g = `<rect class="all" x="2" y="2" width="396" height="216" rx="10"/><text class="lb" x="52" y="20">all models</text>`;
    g += `<ellipse class="vk-i eg" data-s="1" cx="190" cy="115" rx="150" ry="85"/><text class="vk-i" data-s="1" x="262" y="185" style="fill:var(--exp)">M(γ)</text>`;
    g += `<ellipse class="vk-i ek" data-s="2" cx="150" cy="120" rx="70" ry="42"/><text class="vk-i" data-s="2" x="150" y="152" style="fill:var(--good)">M(KB)</text>`;
    inKB.forEach(([x, y]) => g += `<circle class="m" data-on="3:kb" cx="${x}" cy="${y}" r="6"/>`);
    inG.concat(out).forEach(([x, y]) => g += `<circle class="m" cx="${x}" cy="${y}" r="6"/>`);
    g += `<ellipse class="vk-i ex2" data-s="4" cx="330" cy="60" rx="60" ry="30"/><circle class="vk-i m no" data-s="4" cx="378" cy="62" r="7"/><text class="vk-i bad" data-s="4" x="320" y="112">KB true, γ false</text>`;
    return `<svg class="ensv" viewBox="0 0 400 220">${g}</svg>`;
  })();

  // ---- small resolution / proof tree ----
  const rt = (w, hh, nodes, edges, extra = "") => {
    const E = edges.map(([a, b, k]) => { const A = nodes[a], Bn = nodes[b]; return `<line class="vk-i rtl" data-s="${k}" x1="${A[0]}" y1="${A[1] + 16}" x2="${Bn[0]}" y2="${Bn[1] - 16}"/>`; }).join("");
    const N = Object.values(nodes).map(([x, y, wd, lab, k, cls = "", on = "", note = ""]) => `<g class="vk-i rtn ${cls}" data-s="${k}" ${on ? `data-on="${on}"` : ""}><rect x="${x - wd / 2}" y="${y - 16}" width="${wd}" height="32" rx="8"/><text x="${x}" y="${y + 5}">${lab}</text>${note ? `<text class="lb" x="${x}" y="${y - 21}">${note}</text>` : ""}</g>`).join("");
    return `<svg class="rtv" viewBox="0 0 ${w} ${hh}">${E}${N}${extra}</svg>`;
  };

  // ---- Wumpus grid: cell (x, y), 56 units, row 4 at the top ----
  const WX = (x) => 22 + (x - 1) * 56, WY = (y) => 6 + (4 - y) * 56, CX = (x) => WX(x) + 28, CY = (y) => WY(y) + 28;
  const wgrid = (cells, extra = "") => {
    let g = "";
    for (let y = 4; y >= 1; y--) for (let x = 1; x <= 4; x++) {
      const c = cells[x + "," + y] || {};
      g += `<rect class="c" x="${WX(x)}" y="${WY(y)}" width="56" height="56" ${c.on ? `data-on="${c.on}"` : ""}/><text class="ax" x="${WX(x) + 3}" y="${WY(y) + 10}">${x},${y}</text>`;
      (c.t || []).forEach(([k, txt, cls = "", dy = 0, xk]) => g += `<text class="vk-i ${cls}" data-s="${k}" ${xk != null ? `data-x="${xk}"` : ""} x="${CX(x)}" y="${CY(y) + 4 + dy}">${txt}</text>`);
    }
    return `<svg class="wsv" viewBox="0 0 252 236">${g}${extra}</svg>`;
  };
  const agent = (run) => `<g class="ag mover" data-run='${J(run)}' style="opacity:0"><circle r="11"/><text y="4">A</text></g>`;

  // ---- the rain robot ----
  const robotSvg = `<svg class="rbsv" viewBox="0 0 600 205">
    <rect class="gnd" data-on="3:wet" x="0" y="168" width="600" height="37"/>
    <path class="rt" data-on="3:risky" d="M60 160 H540"/>
    <text class="vk-i bad" data-s="3" x="300" y="195">slippery outdoor route</text>
    <rect class="bld" x="170" y="52" width="260" height="56" rx="6"/><text x="300" y="75">covered walkway</text><text class="m" x="300" y="94">indoor route</text>
    <path class="rt" data-on="4:go" d="M60 160 L170 80 H430 L540 160"/>
    <path class="house" d="M540 168 V130 L570 108 L600 130 V168 Z"/><text class="m" x="570" y="150">deliver</text>
    <g class="vk-i cld" data-s="1"><path d="M60 46 a14 14 0 0 1 5-27 a19 19 0 0 1 36 5 a13 13 0 0 1 7 22 z"/><line x1="70" y1="54" x2="66" y2="64"/><line x1="82" y1="54" x2="78" y2="64"/><line x1="94" y1="54" x2="90" y2="64"/><line x1="106" y1="54" x2="102" y2="64"/></g>
    <g class="bot" data-run='${J({ 0: [[40, 138]], 4: [[40, 138], [170, 60], [430, 60], [545, 138]] })}' style="opacity:0"><rect x="-12" y="-14" width="24" height="17" rx="5"/><circle cx="-5" cy="-6" r="2.6"/><circle cx="5" cy="-6" r="2.6"/><rect x="-14" y="4" width="28" height="13" rx="4"/><circle class="w" cx="-8" cy="20" r="4"/><circle class="w" cx="8" cy="20" r="4"/></g>
  </svg>`;

  VIDEO_LESSONS.l10 = {
    title: "L10: Logic and Reasoning", chapters: [
      { t: "Why agents need knowledge", sec: [], scenes: [
        { v: title("Logic and Reasoning", "Week 10 lesson") + list([[1, "<b>Knowledge-based agents</b>: a knowledge base plus an inference engine"], [2, "<b>Propositional logic</b> and <b>first-order logic</b>: how to write knowledge down"], [3, "<b>Inference</b>: model checking, theorem proving, resolution"], [4, "The <b>Wumpus world</b>: logic that keeps an agent alive"]]),
          n: ["Welcome to week 10: logic and reasoning. An agent that only reacts to what it sees right now is limited. A knowledge-based agent stores facts and rules about its world, then reasons over them to work out things it can't observe directly.",
            "We'll start with what a knowledge-based agent is.",
            "Then the two halves of the idea. Representation: how to write knowledge down precisely, using propositional logic and first-order logic, or FOL.",
            "And inference: how to mechanically derive new facts that are guaranteed to be correct, using model checking, theorem proving and resolution.",
            "Finally the Wumpus world, a dangerous cave where the agent uses its knowledge base to work out which rooms are safe. Let's go."] },
        { v: h("A delivery robot in the rain") + robotSvg + cols(at(1, `<div class="kbx"><div class="kbr"><b>P</b><span>it is raining</span><span class="tg lbl">fact</span></div><div class="kbr vk-i" data-s="2"><b>P ⇒ Q</b><span>rain → ground is wet</span><span class="tg lbl">rule</span></div><div class="kbr vk-i" data-s="2"><b>Q ⇒ R</b><span>wet → take indoor route</span><span class="tg lbl">rule</span></div></div>`), flow([[3, "<b>Q</b><br>ground is wet"], [4, "<b>R</b><br>indoor route"]], "sm")),
          n: ["To act well, an agent has to interpret its situation before it acts. Here's a delivery robot. Its goal is to finish the delivery while keeping the risk low. There's an outdoor route and a covered indoor route.",
            "The robot notices that it's raining. That observation goes into its knowledge base as a fact, P: it is raining.",
            "But an observation alone doesn't say what to do. The robot also needs rules that connect observations to conclusions. Rule one: P implies Q, if it's raining, the ground is wet. Rule two: Q implies R, if the ground is wet, take the indoor route. A knowledge base, or KB, holds both: what's currently known, and the rules that link known facts to new ones.",
            "Now the inference engine takes over. It's the part that derives new sentences from the KB. From the fact P and the first rule, it derives Q: the ground is wet. The outdoor route is now risky.",
            "From Q and the second rule, it derives R: take the indoor route. And R becomes the robot's action. That's the whole point. The newly derived knowledge is what links the knowledge base to the agent's next action."] },
        { v: h("A language for knowledge") + cols(card(0, "", "<b>Syntax</b> (grammar): which strings are <b>legal sentences</b>."), card(1, "", "<b>Semantics</b>: what a sentence <b>means</b>, i.e. <b>when it is true</b>.")) + card(2, "ana", "Like English: <i>\"Dog the barks\"</i> breaks the <b>syntax</b>. <i>\"The dog barks\"</i> is legal, and its <b>semantics</b> decide if it's true right now.") + fx(3, "Choices: <b>propositional logic</b>, <b>first-order logic</b>, fuzzy logic. This module: the first two.", "c"),
          n: ["The knowledge base is written in a knowledge representation language, and a formal language is fully specified by two things. Syntax, or grammar: which strings count as legal sentences.",
            "And semantics: what each legal sentence means, which in logic means when it is true.",
            "Think of English. Dog the barks breaks the grammar, so it isn't even a sentence. The dog barks is legal, and its meaning decides whether it's true at this moment.",
            "Common choices of language are propositional logic, first-order logic and fuzzy logic. This module focuses on the first two."] }
      ] },
      { t: "Propositional logic", sec: [0], scenes: [
        { v: h("Propositions and the five connectives") + cols(list([[0, "<b>Proposition</b>: <b>true or false</b>, never both"], [1, "Not a question or a command"], [2, "Has a definite value, even if <b>unknown yet</b>"]], "tight"), card(3, "ana", "<b>LEGO</b>: atomic sentences (True, False, P) are the bricks. The five connectives snap them into <b>complex sentences</b>.")) + tbl(["Connective", "Name", "Example", "Read as"], [[4, "<b>¬P</b>", "Negation", "¬Rain", "It is not raining"], [4, "<b>P ∧ Q</b>", "Conjunction (and)", "Cold ∧ Windy", "Cold and windy"], [5, "<b>P ∨ Q</b>", "Disjunction (or)", "Cold ∨ Windy", "Cold or windy (or both)"], [5, "<b>P ⇒ Q</b>", "Implication", "Rain ⇒ WetRoad", "If it rains, the road is wet"], [5, "<b>P ⇔ Q</b>", "Biconditional", "Rain ⇔ Clouds", "Rains exactly when clouds form"]], "sm"),
          n: ["Propositional logic, also called Boolean logic, is built from propositions: statements that are either true or false, never both.",
            "A proposition can't be a question, like is it raining, or a command, like close the door. Neither of those is true or false.",
            "In classical logic every proposition has a definite truth value, even if the inference engine doesn't know that value yet.",
            "The grammar, written in a notation called BNF, says a sentence is either atomic or complex. Think of LEGO. Atomic sentences are the bricks: True, False, or a single symbol like P. Complex sentences are built from smaller ones using brackets and five connectives.",
            "Negation, not P: it is not raining. Conjunction, P and Q: it's cold and windy.",
            "Disjunction, P or Q: it's cold or windy, or both. Implication, P implies Q: if it rains, the road is wet. And the biconditional, P if and only if Q: it rains exactly when clouds form."] },
        { v: h("The connectives as <b>light switches</b>") + at(0, `<div class="swrow">${swc("P", [1, 1, 0, 0])}${swc("Q", [1, 0, 1, 0])}</div><div class="bls">${bl("¬P", [0, 0, 1, 1], "flips P")}${bl("P ∧ Q", [1, 0, 0, 0], "switches in series: both on")}${bl("P ∨ Q", [1, 1, 1, 0], "in parallel: at least one")}${bl("P ⇒ Q", [1, 0, 1, 1], "off only for T, F")}${bl("P ⇔ Q", [1, 0, 0, 1], "same value")}</div>`) + card(5, "tip", "A <b>model</b> = one full setting of every switch. Truth tables compute each sentence from its parts."),
          n: ["Semantics tells us when a sentence is true. Picture P and Q as two light switches, and each connective as a bulb wired in its own way. Watch which bulbs light up as we flip the switches.",
            "Both switches on: P true, Q true. Not P is off. And, or, implies and if-and-only-if all light up.",
            "P on, Q off. And goes dark, because it's like two switches in series: both must be on. Or stays lit, because it's like switches in parallel. Implies goes dark. This is the one case where P implies Q is false. If and only if goes dark too, because the values differ.",
            "P off, Q on. Not P lights up. Or is still on. Implies is back on, because the premise is false. If and only if is off, since the values differ.",
            "Both off. And and or are both dark. Implies is on, again because the premise is false. And if and only if is on, because both sides have the same value.",
            "Each full setting of the switches is called a model: one assignment of true or false to every proposition symbol. The truth table works out every complex sentence from its parts, in every model."] },
        { v: h("Implication is a <b>promise</b>") + fx(0, "“If you <b>pass</b> the exam (P), I'll buy you <b>pizza</b> (Q).”", "c") + `<div class="pzs">${pz(1, 1, 1, "kept: true", "ok")}${pz(2, 1, 0, "broken: false", "bad")}${pz(3, 0, 1, "not tested: true", "vac")}${pz(4, 0, 0, "not tested: true", "vac")}</div>` + cols(card(5, "warn", "P ⇒ Q says nothing about <b>cause</b>. It only promises a true premise never leads to a false conclusion."), card(6, "", "<b>Vacuous truth</b>: false premise → automatically true. <i>If 2 + 2 = 5 then x &gt; 3</i> is <b>true</b>.")),
          n: ["Implication is the tricky one, so let's make it a promise. If you pass the exam, I'll buy you pizza. When have I broken my promise?",
            "You passed, and you got pizza. Promise kept, so the implication is true.",
            "You passed, and no pizza. I broke my promise. This is the only case where P implies Q is false: premise true, conclusion false.",
            "You failed, but I bought you pizza anyway. Did I break the promise? No. I only promised something if you passed. So it's true.",
            "You failed, no pizza. Still not broken. The promise was never tested, so it was never broken. True again.",
            "Two things follow. First, implication says nothing about cause. It only promises that a true premise never leads to a false conclusion. If x is greater than 5, then x is greater than 3 is true, since any number above 5 is also above 3. If x is greater than 5, then x is less than 3 is false, because x equals 6 makes the premise true and the conclusion false.",
            "Second, if the premise is false, the implication is automatically true. This is called vacuous truth. If 2 plus 2 equals 5, then x is greater than 3, is true, because the premise is false."] },
        { v: h("Biconditional: a <b>two-way</b> street") + stg(0, [
            fix(tag("mark ≥ 50", "big"), 18, 50), fix(tag("pass", "big"), 82, 50),
            fix(tag("⟶ a 50+ mark guarantees a pass", "hi"), 50, 22, 1), fix(tag("⟵ a pass guarantees the mark was 50+", "hi"), 50, 78, 2),
            act(tag("⇔", "big ok"), { 0: [50, 50, 0, .5], 3: [50, 50, 1, 1.3] })
          ], "16/3.9") + cols(card(3, "", "P ⇔ Q is <b>true when both sides match</b> (both T or both F)."), card(4, "tip", "P ⇔ Q ≡ (P ⇒ Q) ∧ (Q ⇒ P). Each side is <b>necessary and sufficient</b> for the other.")),
          n: ["The biconditional, P if and only if Q. Take: you pass the subject if and only if your mark is at least 50.",
            "One direction: a mark of 50 or more guarantees a pass.",
            "The other direction: a pass guarantees the mark was 50 or more.",
            "Put both arrows together and you get if and only if. It's true when both sides have the same truth value, both true or both false.",
            "It's two implications at once, P implies Q and Q implies P. So each side is both necessary and sufficient for the other."] },
        { v: h("Operator precedence") + fx(0, say({ 0: "¬P ∨ Q ∧ R ⇒ S", 1: "<b>(¬P)</b> ∨ Q ∧ R ⇒ S", 2: "(¬P) ∨ <b>(Q ∧ R)</b> ⇒ S", 3: "<b>((¬P) ∨ (Q ∧ R))</b> ⇒ S", 4: "((¬P) ∨ (Q ∧ R)) <b>⇒ S</b>" }), "c") + flow([[0, "<b>¬</b> not"], [1, "<b>∧</b> and"], [2, "<b>∨</b> or"], [3, "<b>⇒</b> implies"], [4, "<b>⇔</b> iff"]], "sm") + cols(card(5, "ana", "Like <b>BODMAS</b>: 2 + 3 × 4 = 14, because × binds tighter than +."), card(5, "tip", "Memory: <b>N</b>ot, <b>A</b>nd, <b>O</b>r, <b>I</b>mplies, <b>I</b>ff.")),
          n: ["Without brackets, how do you read not P or Q and R implies S? Precedence decides, and it runs from tightest to loosest.",
            "Negation binds tightest. So the not attaches to P alone.",
            "Next comes and. So Q and R are grouped together.",
            "Then or joins not P with the Q and R group.",
            "Implication comes after that, so the whole left side is the premise, and S is the conclusion. The biconditional would be last of all.",
            "It's just like BODMAS in maths. 2 plus 3 times 4 is 14, because times binds tighter than plus. To remember the order: not, and, or, implies, iff."] },
        { v: h("Naming the parts") + stg(0, [
            ...[["(", 6], ["∧", 22], [")", 37], ["⇒", 46], ["(", 54], ["∨", 79], [")", 94]].map(([s, x]) => fix(tag(s, "big"), x, 50)),
            ...[["Rain", 14], ["¬Warm", 30], ["StayHome", 66], ["Read", 87]].map(([s, x]) => act(tag(s, "big"), { 0: [x, 50, 1] }, "", 'data-on="1:lit"')),
            fix(tag("<b>literals</b>: an atom or its negation", "lbl"), 50, 90, 1),
            fix(tag("<b>conjuncts</b>: Rain, ¬Warm", "ok"), 22, 22, 2),
            fix(tag("<b>disjuncts</b>: StayHome, Read", "ok"), 74, 22, 3),
            act(tag("premise (antecedent)", "hi"), { 0: [22, 78, 0], 4: [22, 74, 1] }), act(tag("conclusion (consequent)", "hi"), { 0: [74, 78, 0], 4: [74, 74, 1] })
          ], "16/4.6", "tall") + card(4, "", "An implication is also called a <b>rule</b> or an <b>if-then</b> statement."),
          n: ["Some terms you need. Here's a sentence: if it's raining and not warm, then I stay home or read.",
            "A literal is an atomic sentence or its negation. Rain, not Warm, StayHome and Read are all literals.",
            "Sentences joined by and form a conjunction. Each part, Rain and not Warm, is a conjunct.",
            "Sentences joined by or form a disjunction. Each part, StayHome and Read, is a disjunct.",
            "And in an implication, the left side is the premise, or antecedent, and the right side is the conclusion, or consequent. An implication is also called a rule, or an if-then statement."] },
        { v: h("Models: every way the world could be") + fx(1, say({ 1: "n = 1 symbol → <b>2</b> models", 2: "n = 2 → <b>4</b> models", 3: "n = 3 → <b>8</b> models", 4: "n = 4 → <b>16</b> models", 5: "n = 20 → <b>1,048,576</b> models" }), "c") + models + card(0, "", "A <b>model</b> = one full assignment of T or F to <b>every</b> symbol. With n symbols there are <b>2<sup>n</sup></b> models."),
          n: ["Let's look at models more closely. A model is one complete assignment of true or false to every proposition symbol. One possible world.",
            "With one symbol, P, there are two models. P true, or P false.",
            "Add a second symbol and every old model splits in two. Four models.",
            "Three symbols, eight models.",
            "Four symbols, sixteen. Each new symbol doubles the count, so n symbols give 2 to the n models.",
            "That grows fast. Twenty symbols already give over a million models. Keep that number in mind, because it's the big weakness of one of the inference methods later."] }
      ] },
      { t: "Logical equivalences", sec: [1], scenes: [
        { v: h("Standard equivalences (≡)") + card(0, "", "α ≡ β: <b>true in exactly the same models</b>. You can swap one for the other at any time.") + eqt([[1, null, "Commutativity", "α ∧ β ≡ β ∧ α, &nbsp; α ∨ β ≡ β ∨ α"], [1, null, "Associativity", "(α ∧ β) ∧ γ ≡ α ∧ (β ∧ γ), same for ∨"], [1, null, "Double negation", "¬(¬α) ≡ α"], [2, null, "Contraposition", "α ⇒ β ≡ ¬β ⇒ ¬α"], [3, 3, "Implication elimination", "α ⇒ β ≡ ¬α ∨ β"], [3, 3, "Biconditional elimination", "α ⇔ β ≡ (α ⇒ β) ∧ (β ⇒ α)"], [4, 4, "De Morgan", "¬(α ∧ β) ≡ ¬α ∨ ¬β, &nbsp; ¬(α ∨ β) ≡ ¬α ∧ ¬β"], [4, 4, "Distributivity", "α ∧ (β ∨ γ) ≡ (α ∧ β) ∨ (α ∧ γ), &nbsp; α ∨ (β ∧ γ) ≡ (α ∨ β) ∧ (α ∨ γ)"]]),
          n: ["Two sentences are logically equivalent if they're true in exactly the same models. Then you can always replace one with the other. Alpha, beta and gamma here stand for any sentences.",
            "Commutativity: order doesn't matter for and or or. Associativity: neither does grouping. Double negation: not not alpha is just alpha.",
            "Contraposition: alpha implies beta is the same as not beta implies not alpha. If it's a dog, it's a mammal, means the same as, if it's not a mammal, it's not a dog.",
            "The two you'll use most. Implication elimination: alpha implies beta becomes not alpha or beta. Biconditional elimination: alpha if and only if beta becomes two implications. These two are the first steps of every CNF conversion, so memorise them.",
            "Also heavily used: De Morgan, and distributivity. These four are the most important equivalences in this subject."] },
        { v: h("Check it: P ⇒ Q ≡ ¬P ∨ Q") + split(tbl(["P", "Q", "P ⇒ Q", "¬P ∨ Q", ""], [[1, "T", "T", "T", "T", "same ✓"], [2, "T", "F", "<b>F</b>", "<b>F</b>", "same ✓"], [3, "F", "T", "T", "T", "same ✓"], [3, "F", "F", "T", "T", "same ✓"]]), card(0, "", "An equivalence holds when both columns match in <b>every</b> model.") + card(4, "ana", "<b>De Morgan</b> in words: <i>not (tea and coffee)</i> = I skipped tea <b>or</b> skipped coffee.") + card(5, "tip", "<b>¬(α ∨ β)</b>: <i>not (tea or coffee)</i> = no tea <b>and</b> no coffee.")),
          n: ["You can prove any equivalence with a truth table. Let's check implication elimination: P implies Q against not P or Q.",
            "P true, Q true. Both columns are true.",
            "P true, Q false. Both columns are false. This is the broken promise, and not P or Q is false here too, since both parts are false.",
            "And in the last two rows, P is false, so both columns are true. They match in every model, so they're equivalent.",
            "De Morgan in plain words. I didn't have both tea and coffee, means I skipped tea, or I skipped coffee. The and flips to or when the not moves inside.",
            "And the other form. I didn't have tea or coffee, means no tea and no coffee. The or flips to and."] }
      ] },
      { t: "First-order logic", sec: [2], scenes: [
        { v: h("FOL: objects, relations, functions") + stg(0, [
            fix(tag("objects", "lbl"), 50, 6),
            act(person("John", 0), { 0: [36, 42, 1] }), act(person("Richard", 1), { 0: [56, 42, 1] }), fix(tag("Sydney", "big"), 78, 30), fix(tag("2", "big"), 92, 30),
            fix(tag("Brother(Richard, John): <b>T/F</b>", "ok"), 46, 72, 1),
            act(person("Mary", 3), { 0: [12, 42, 0], 2: [12, 42, 1] }), fix(tag("MotherOf(John) = Mary", "hi"), 15, 84, 2),
            fix(tag("Student(John): a <b>unary</b> predicate (a property)", "lbl"), 76, 90, 3)
          ], "16/4.2", "tall") + cols(card(1, "", "<b>Predicate</b>: property or relation → <b>T or F</b>. Arity = no. of arguments."), card(2, "", "<b>Function</b>: names an object <b>indirectly</b> → an <b>object</b>."), card(4, "", "<b>Quantifiers</b>: ∀ (for all), ∃ (there exists).")),
          n: ["Propositional logic only has whole true or false statements. First-order logic, FOL, talks about the world in a richer way. First, objects: the things in the world, like John, Richard, Sydney, or the number 2.",
            "Predicates are properties or relations. Brother of Richard and John is true or false. A predicate always returns true or false.",
            "Functions name an object by referring to another. Mother of John isn't true or false. It points to a person, Mary. A function returns an object.",
            "A predicate's arity is how many arguments it takes. Student of John is unary: one argument, a property. Brother of Richard and John is binary: a relation. Zero-ary predicates like Raining or GameOver take no arguments, and behave exactly like propositional symbols.",
            "And quantifiers make statements about whole groups: for all, and there exists. In FOL, a model supplies a domain of objects and says what every constant, function and predicate refers to."] },
        { v: h("Terms vs sentences") + cols(list([[0, "<b>Term</b> = names an object"], [1, "<b>Constant</b>: one specific object. John, Sydney, 2"], [1, "<b>Variable</b>: x, y, bound by a quantifier"], [2, "<b>Function of terms</b>: Father(John), Plus(2, 3)"], [3, "<b>Ground term</b>: no variables. Father(John) ✓, Father(x) ✗"]], "tight"), card(4, "warn", "Common confusion. <b>Parent(Henry, John)</b> is a predicate: true or false. <b>Father(John)</b> is a function: it <b>is</b> a person.")) + card(5, "ana", "A term is a <b>name tag</b>. A sentence is a <b>claim</b> you can check."),
          n: ["A term is anything that refers to an object.",
            "A constant names one specific object, like John, Sydney or 2. A variable, like x, stands for an unspecified object and is bound by a quantifier.",
            "And a function applied to terms names an object indirectly, like Father of John, or Plus of 2 and 3, which is just another name for 5.",
            "A ground term is a term with no variables. Father of John is ground. Father of x is not. You'll need this later for instantiation.",
            "A very common confusion: Parent of Henry and John is a predicate, so it's true or false. Father of John is a function, so it refers to a person.",
            "Think of a term as a name tag on an object, and a sentence as a claim you can check."] },
        { v: h("One sentence for the whole class") + stg(0, [
            fix(tag("Propositional logic", "lbl"), 26, 6), fix(tag("First-order logic", "lbl"), 76, 6),
            ...["StudiesMia", "StudiesLeo", "StudiesAva", "StudiesBen", "StudiesZoe", "StudiesKai"].map((s, i) => act(tag(s), { 0: [26, -10, 0], [i < 3 ? 1 : 2]: [i % 2 ? 36 : 16, 24 + Math.floor(i / 2) * 20, 1] })),
            fix(tag("… one symbol per student", "bad"), 26, 88, 2),
            act(tag("∀x Student(x) ⇒ Studies(x)", "big ok"), { 0: [76, 45, 0, .6], 3: [76, 45, 1, 1] }), fix(tag("one sentence, any number of students", "lbl"), 76, 66, 3)
          ], "16/3.8", "tall") + cols(card(4, "tip", "Rule of thumb: <b>∀ goes with ⇒</b>, <b>∃ goes with ∧</b>."), card(5, "bad", "∀x Student(x) <b>∧</b> Studies(x): <b>everything</b> is a studying student.")) + fx(6, "∃x Student(x) ∧ Enrolled(x, AI) &nbsp;·&nbsp; ∀x ∀y Parent(x, y) ⇒ Older(x, y) &nbsp;·&nbsp; ¬∃x Perfect(x)", "sm"),
          n: ["Why is FOL more expressive? Say you want: all students study. In propositional logic you need a separate symbol for each student: StudiesMia, StudiesLeo, StudiesAva.",
            "And it keeps going, one symbol for every single student.",
            "There's no way to say for every student.",
            "FOL says it in one sentence. For all x, Student of x implies Studies of x. Every student studies, however many there are.",
            "A rule of thumb that saves marks: for all goes with implies, and there exists goes with and.",
            "Here's why. For all x, Student of x and Studies of x, says everything in the world is a student who studies, including chairs and Sydney. Wrong.",
            "A few more examples. There exists x such that Student of x and Enrolled of x and AI: some student is enrolled in AI. For all x and y, Parent of x y implies Older of x y: parents are older than their children. And not there exists x, Perfect of x: nothing is perfect."] },
        { v: h("Quantifier order changes the meaning") + split(qsvg, fx(0, say({ 0: "∀x ∃y Loves(x, y)", 2: "∃y ∀x Loves(x, y)" }), "c") + card(1, "", say({ 1: "Everyone loves <b>somebody</b>, possibly different people.", 2: "<b>One particular person</b> (Cat) is loved by everyone." })) + card(3, "tip", "¬ <b>flips</b> it: ∀x ¬P(x) ≡ ¬∃x P(x), &nbsp; ∃x ¬P(x) ≡ ¬∀x P(x)") + card(4, "ex", "<b>No student failed</b>: ∀x ¬Failed(x) ≡ ¬∃x Failed(x)")),
          n: ["Universal, for all, means the property holds for every object. For all x, King of x implies Person of x: every king is a person. Existential, there exists, means at least one object has the property, without saying which. When you mix them, the order matters a lot.",
            "For all x, there exists y, x loves y. Each person on the left has an arrow to somebody. Ann loves Ben, Ben loves Cat, Cat loves Ann, Dan loves Cat. Everyone loves somebody, possibly different people.",
            "Now swap the order. There exists y, for all x, x loves y. Now there's one particular person who everyone loves. Here it's Cat. Every arrow points to the same person. A much stronger claim.",
            "Quantifiers also have their own De Morgan rules. Pushing a negation through a quantifier flips it. For all x not P is the same as not there exists x P. And there exists x not P is the same as not for all x P.",
            "Example: let P of x mean student x failed. No student failed can be written as every student did not fail, or as there is no student who failed. Same meaning."] },
        { v: h("Propositional logic vs FOL") + tbl(["", "Propositional logic", "First-order logic"], [[0, "Basic unit", "Whole propositions (P, Q)", "Objects, predicates, functions"], [1, "Quantifiers", "None", "∀ and ∃"], [1, "“All X are Y”", "One sentence <b>per object</b>", "<b>One</b> sentence with ∀"], [2, "Model", "A truth value for each symbol", "Domain of objects + meaning of every symbol"], [3, "Inference", "Directly decidable (finite models)", "Often <b>reduced to propositional</b> first"]]) + card(4, "", "FOL grammar adds <b>terms</b>, <b>predicates with arguments</b>, <b>equality</b> and <b>quantifiers</b> to the propositional one."),
          n: ["Let's compare. In propositional logic the basic unit is a whole proposition. In FOL it's objects, predicates and functions.",
            "Propositional logic has no quantifiers, so saying all X are Y needs one sentence per object. FOL needs one sentence with for all.",
            "A propositional model is just a truth value for each symbol. A FOL model is a domain of objects plus the meaning of every symbol.",
            "Propositional inference is directly decidable, since there are finitely many models. FOL inference is often reduced to propositional inference first. We'll see how at the end.",
            "And the FOL grammar adds terms, predicates with arguments, equality and quantifiers to the propositional grammar."] }
      ] },
      { t: "Reasoning, inference and entailment", sec: [3], scenes: [
        { v: h("Deductive vs inductive reasoning") + stg(0, [
            fix(tag("Deductive", "lbl"), 25, 5), fix(tag("Inductive", "lbl"), 75, 5),
            fix(tag("All students must submit", "big"), 25, 22, 1), fix(tag("↓", "big"), 25, 42, 1), act(person("Mia", 0), { 0: [25, 64, 0], 1: [25, 64, 1] }), fix(tag("Mia must submit: <b>certain</b>", "ok"), 25, 92, 1),
            ...[0, 1, 2, 3, 4].map((i) => act(person("", 2 + (i % 3), "✓"), { 0: [57 + i * 9, 24, 0], 2: [57 + i * 9, 24, 1] })),
            fix(tag("↓", "big"), 75, 46, 3), act(person("Leo", 1), { 0: [75, 66, 0], 3: [75, 66, 1] }), fix(tag("Leo will <b>probably</b> pass", "ghost"), 75, 92, 3)
          ], "16/4.4", "tall") + cols(card(4, "", "<b>Logical inference</b>: a rule applied to facts → a new fact <b>guaranteed</b> by the rules."), card(4, "", "<b>ML inference</b>: a trained model applied to new input → a <b>prediction</b> (e.g. Iris setosa).")),
          n: ["Reasoning means using known information to work through a problem and reach a conclusion supported by that information. There are two directions.",
            "Deductive reasoning applies a general rule to a specific case. All students must submit the assignment. Mia is a student. So Mia must submit it. That's certain, as long as the premises are true.",
            "Inductive reasoning goes the other way. The last five students who attended every lab passed.",
            "Leo attended every lab, so Leo will probably pass. Specific observations are generalised into a likely conclusion. Only probable, never certain.",
            "Inference is producing new information from what's already known, and the lecture contrasts two kinds. Logical inference applies a rule to known facts. Passing every assessment means passing the subject. Mia passed every assessment, so Mia passed the subject. The output is a new fact guaranteed by the rules. Machine learning inference applies a trained model to a new input. A flower classifier gets a new flower's measurements and predicts Iris setosa. The output is a prediction. The rest of this module is about logical, deductive inference, where conclusions are guaranteed."] },
        { v: h("Entailment: KB ⊨ γ") + split(ensvg, card(0, "", "<b>α ⊨ β</b>: in <b>every</b> model where α is true, β is also true. β <b>follows logically</b> from α.") + card(2, "tip", "<b>M(α) ⊆ M(β)</b>: α's models sit inside β's.") + card(4, "bad", "One model with α true and β false → <b>not</b> entailed.")),
          n: ["Now the key idea of the week: entailment. Alpha entails beta, written with a double turnstile, means in every model where alpha is true, beta is also true. You can also say beta follows logically from alpha. Each dot here is one model, one possible world.",
            "The blue region is M of gamma, the set of models where the query gamma is true.",
            "The green region is M of KB, the models where the knowledge base is true. Entailment just means this set sits inside the other one.",
            "Every model where the KB is true also makes gamma true. So KB entails gamma.",
            "And here's the test to remember. Entailment fails as soon as you find even one model where the KB is true and the query is false. One red dot outside the blue region is enough to break it."] },
        { v: h("The inference problem") + fx(0, "Given KB and query γ: <b>does KB ⊨ γ?</b>", "c") + cols(card(1, "", "<b>1. Model checking</b><br>List every model and check them all."), card(2, "", "<b>2. Theorem proving</b><br>Chain valid inference rules into a proof."), card(3, "", "<b>3. Resolution</b><br>Assume γ is false, reach a contradiction.")) + card(4, "ana", "Is the treasure in room 5? <b>1</b>: search every possible map. <b>2</b>: reason step by step from the clues. <b>3</b>: assume it isn't, and show the clues break."),
          n: ["The inference problem is always the same question. Given a knowledge base and a query gamma, does the KB entail gamma? To prove it, you show gamma is true in every model where the KB is true. The lecture covers three techniques.",
            "Model checking: enumerate the models and check them all.",
            "Theorem proving: apply valid inference rules to build a proof.",
            "And proof by contradiction with resolution: assume the query is false, and show that leads to a contradiction.",
            "Think of a treasure hunt. Is the treasure in room 5? You could check every possible map. You could reason step by step from the clues. Or you could assume it isn't there, and show the clues then contradict each other."] }
      ] },
      { t: "Method 1: Model checking", sec: [4], scenes: [
        { v: h("Model checking: is the ground wet?") + split(`<table class="vk-tbl mct"><tr><th>Model</th><th>P</th><th>Q</th><th>P ⇒ Q</th><th>KB true?</th><th>Q</th></tr>${[[1, "T", "T", "T", "T", "T", "keep"], [2, "T", "F", "F", "F", "F", "drop"], [3, "F", "T", "T", "F", "T", "drop"], [4, "F", "F", "T", "F", "F", "drop"]].map(([i, p, q, pq, kb, qq, cls]) => `<tr class="vk-i ${cls}" data-s="${i}"><td>${i}</td><td>${p}</td><td>${q}</td><td>${pq}</td><td><b>${kb}</b></td><td ${i === 1 ? 'data-on="5:win"' : ""}>${qq}</td></tr>`).join("")}</table>`, card(0, "", "KB: <b>P</b> (raining), <b>P ⇒ Q</b> (rain → wet). Query: <b>Q</b>.") + list([[0, "1. List the symbols: P, Q"], [1, "2. Generate all 2<sup>n</sup> models"], [2, "3. Keep the models where KB is true"], [5, "4. γ true in all kept models → <b>KB ⊨ γ</b>"]], "tight")) + card(6, "ana", "Like cracking a combination lock by <b>trying every combination</b>: certain to work, but 2<sup>n</sup> tries. That's why we want smarter methods."),
          n: ["Method one: model checking. The idea: list every possible model, keep the ones where the KB is true, and check whether the query is true in all of them. Our KB: P, it's raining, and P implies Q, rain makes the ground wet. Query: Q, is the ground wet? The algorithm needs the KB, the query, all the atomic symbols, here P and Q, and every truth assignment over them.",
            "Model 1: P true, Q true. P implies Q is true, so the whole KB is true. Keep it.",
            "Model 2: P true, Q false. P implies Q is false, so the KB is false. Cross it out.",
            "Model 3: P false. The KB needs P to be true, so the KB is false. Cross it out.",
            "Model 4: P false again, so the KB is false. Cross it out too.",
            "Only model 1 makes the KB true, and Q is true there. There's no model with the KB true and Q false, so the KB entails Q. Yes, the ground is wet.",
            "The limitation: with n symbols there are 2 to the n models. It's like cracking a combination lock by trying every combination. Guaranteed to work, but it blows up quickly. That's the motivation for theorem proving and resolution, which avoid listing every model."] }
      ] },
      { t: "Method 2: Theorem proving", sec: [5], scenes: [
        { v: h("Inference rules: build a proof") + stg(0, [
            fix(tag("Modus Ponens", "lbl"), 50, 6),
            act(plate("rule: P ⇒ Q", 0), { 0: [50, 30, 0], 1: [50, 30, 1] }),
            act(tag("P", "big hi"), { 0: [14, 30, 0], 1: [14, 30, 1], 2: [42, 30, 0, .5] }),
            act(tag("Q", "big ok"), { 0: [58, 30, 0, .5], 2: [86, 30, 1, 1] }),
            fix(tag("And-elimination", "lbl"), 50, 58, 3),
            act(plate("α ∧ β", 4), { 0: [50, 80, 0], 3: [50, 80, 1] }),
            act(tag("α", "big ok"), { 0: [50, 80, 0, .5], 4: [20, 80, 1, 1] }), act(tag("β", "big ok"), { 0: [50, 80, 0, .5], 4: [80, 80, 1, 1] })
          ], "16/4.2") + cols(card(2, "", "<b>Modus Ponens</b>: from α ⇒ β and α, conclude <b>β</b>."), card(4, "", "<b>And-elimination</b>: from α ∧ β, conclude <b>α</b> (or β)."), card(5, "warn", "Slide says “Add-elimination”: a <b>typo</b>. Write <b>And</b>-elimination.")),
          n: ["Method two: theorem proving. Instead of listing models, apply sound inference rules directly to the KB, building a chain of steps that ends at the query. Every step is justified, so the conclusion is guaranteed. Read each rule as: if you have what's above the line, you may write down what's below it.",
            "The first rule is Modus Ponens. Think of a rule as a machine. Here's the rule P implies Q, and here's the fact P.",
            "Feed P into the machine, and out comes Q. If you know a rule and its premise, you can conclude its conclusion. And that's the worked example done: our KB has P and P implies Q, so Modus Ponens gives Q in one step, with no truth table at all.",
            "The second rule is And-elimination.",
            "From alpha and beta, you can conclude either part on its own. Unpack the box and take out what you need.",
            "Watch out: the slide labels this rule Add-elimination. That's a typo. Use And-elimination in your answers. All the equivalences from earlier can also be used as proof steps, since replacing a sentence with an equivalent one never changes what's true."] }
      ] },
      { t: "Method 3: Resolution", sec: [6], scenes: [
        { v: h("Resolution vocabulary") + tbl(["Term", "Meaning", "Example"], [[0, "<b>Literal</b>", "An atom or its negation", "P, ¬Q"], [0, "<b>Complementary literals</b>", "A literal and its own negation", "P and ¬P"], [1, "<b>Clause</b>", "An OR of literals", "P ∨ ¬Q ∨ R"], [1, "<b>CNF</b>", "An AND of clauses (any sentence converts)", "(P ∨ Q) ∧ (¬P ∨ R)"], [2, "<b>Satisfiable</b>", "At least one assignment makes it true", "P ∧ ¬Q (P = T, Q = F)"], [2, "<b>Unsatisfiable</b>", "No assignment makes it true", "P ∧ ¬P"]], "sm") + cols(card(3, "ana", "<b>Clause</b>: options where <b>at least one</b> must hold. <b>CNF</b>: every clause at once."), card(4, "", "<b>SAT</b>: does <b>any</b> assignment make it true? Resolution <b>proves none exists</b>.")),
          n: ["Method three needs some vocabulary. A literal is an atomic proposition or its negation. Complementary literals are a literal and its own negation, like P and not P.",
            "A clause is a disjunction, an OR, of literals. CNF, conjunctive normal form, is an AND of clauses. Every sentence can be rewritten in CNF.",
            "A sentence is satisfiable if at least one assignment makes it true, and unsatisfiable if none does. P and not P is unsatisfiable.",
            "These build on each other: literals make clauses, clauses make a CNF sentence, and resolution tests whether that CNF sentence is satisfiable. Think of each clause as a list of options where at least one must hold. CNF means every list has to be satisfied at the same time.",
            "That's the satisfiability problem, SAT: is there at least one truth assignment that makes the sentence true? You can search for a satisfying assignment, or prove none exists. Resolution does the second. Many problems in computer science turn out to be SAT problems in disguise."] },
        { v: h("The resolution rule: opposites <b>cancel</b>") + stg(0, [
            fix(tag("clause A", "lbl"), 21, 6), fix(tag("clause B", "lbl"), 79, 6),
            act(tag("P", "big"), { 0: [14, 26, 1], 1: [45, 26, 1], 2: [48, 26, 0, .4] }, "", 'data-on="1:clash"'),
            act(tag("∨", "big"), { 0: [21, 26, 1], 1: [21, 26, 0] }),
            act(tag("Q", "big"), { 0: [28, 26, 1], 2: [42, 72, 1] }),
            act(tag("¬P", "big"), { 0: [72, 26, 1], 1: [55, 26, 1], 2: [52, 26, 0, .4] }, "", 'data-on="1:clash"'),
            act(tag("∨", "big"), { 0: [79, 26, 1], 1: [79, 26, 0] }),
            act(tag("R", "big"), { 0: [86, 26, 1], 2: [58, 72, 1] }),
            fix(tag("∨", "big"), 50, 72, 2), fix(tag("resolvent", "lbl"), 50, 92, 2),
            act(tag("□ empty clause = contradiction", "big bad"), { 0: [50, 72, 0, .6], 4: [50, 50, 1, 1] }, "", 'style="z-index:2"')
          ], "16/4.3") + cols(card(3, "", "<b>Unit resolution</b>: (l<sub>1</sub> ∨ … ∨ l<sub>k</sub>) with ¬l<sub>i</sub> → the clause <b>without l<sub>i</sub></b>."), card(4, "bad", "Resolve <b>P</b> with <b>¬P</b>: nothing is left. The <b>empty clause</b> □ (or {}) signals a <b>contradiction</b>.")),
          n: ["Here's the resolution rule. Take two clauses: P or Q, and not P or R.",
            "They contain a complementary pair: P in one, not P in the other.",
            "The pair cancels, and everything else from both clauses survives. The result, called the resolvent, is Q or R. That's full resolution: keep every literal from both clauses except the complementary pair.",
            "Unit resolution is the special case where one side is a single literal. A clause, plus the complement of one of its literals, gives the clause with that literal removed.",
            "And if you ever resolve two unit clauses, P and not P, nothing is left. That's the empty clause, written as a box or empty braces. It signals a contradiction."] },
        { v: h("Proof by contradiction") + split(card(0, "ana", "A detective: “<b>Suppose the butler is innocent.</b>” Then the clues lead somewhere <b>impossible</b>. So the butler must be guilty.") + fx(1, "KB ⊨ γ &nbsp;⇔&nbsp; <b>KB ∧ ¬γ is unsatisfiable</b>", "c"), list([[2, "1. Goal: KB ⊨ γ"], [2, "2. Add the <b>negated query</b>: KB ∧ ¬γ"], [3, "3. Convert everything to <b>CNF</b> clauses"], [4, "4. Resolve pairs with complementary literals, add each resolvent"], [5, "5. <b>Empty clause</b> → KB ⊨ γ. No new clauses → <b>not</b> entailed"]], "tight")) + card(6, "warn", "Negate <b>only the query</b>: KB ∧ ¬γ, never ¬(KB ∧ γ) and never KB ∧ γ."),
          n: ["Resolution proves entailment by contradiction. Picture a detective. Suppose the butler is innocent. Then follow the clues, and they lead somewhere impossible. So the butler must be guilty.",
            "In logic: to prove alpha entails beta, assume alpha is true and beta is false, and show that combination is impossible. If alpha and not beta can never be true, every model of alpha must make beta true. So KB entails gamma exactly when KB and not gamma is unsatisfiable.",
            "The workflow. Goal: KB entails gamma. Add the negated query, giving KB and not gamma.",
            "Convert everything to CNF clauses, because resolution only works on clauses.",
            "Resolve pairs of clauses that have complementary literals, and add each resolvent to the set.",
            "Stop when you derive the empty clause, which proves the entailment. Or stop when no new clauses can be produced, which means the entailment does not hold.",
            "A classic mistake: negate only the query. It's KB and not gamma, not KB and gamma."] },
        { v: h("Worked: is the ground wet?") + split(rt(420, 205, { C1: [70, 40, 70, "P", 1, "", "", "C1: fact"], C2: [210, 40, 110, "¬P ∨ Q", 1, "", "", "C2: P ⇒ Q in CNF"], C3: [350, 40, 80, "¬Q", 1, "q", "", "C3: negated query"], C4: [140, 115, 70, "Q", 2, "", "", "C4"], E: [245, 180, 70, "□", 3, "no"] }, [["C1", "C4", 2], ["C2", "C4", 2], ["C4", "E", 3], ["C3", "E", 3]]), card(0, "", "KB = P ∧ (P ⇒ Q). Query: <b>Q</b>.") + list([[1, "Add <b>¬Q</b>. Implication elimination: P ⇒ Q → <b>¬P ∨ Q</b>"], [2, "C1 + C2: P and ¬P cancel → <b>Q</b>"], [3, "Q + ¬Q → <b>□</b>"], [4, "KB ∧ ¬Q is unsatisfiable, so <b>KB ⊨ Q</b>"]], "tight")),
          n: ["Same example as before, now with resolution. The KB is P, and P implies Q. The query is Q.",
            "Add the negated query, not Q. Then use implication elimination to turn P implies Q into not P or Q. That gives three clauses: P, not P or Q, and not Q.",
            "Resolve clause 1 with clause 2. P and not P cancel, leaving Q.",
            "Now Q clashes with not Q, and we get the empty clause.",
            "The empty clause shows the KB and not Q is unsatisfiable. Assuming the ground is dry leads to a contradiction, so the KB entails Q."] },
        { v: h("Converting to CNF: four steps") + fx(0, say({ 0: "A ⇔ (B ∨ C)", 1: "<b>(A ⇒ (B ∨ C)) ∧ ((B ∨ C) ⇒ A)</b>", 2: "(<b>¬A ∨ B ∨ C</b>) ∧ (<b>¬(B ∨ C) ∨ A</b>)", 3: "(¬A ∨ B ∨ C) ∧ (<b>(¬B ∧ ¬C)</b> ∨ A)", 4: "(¬A ∨ B ∨ C) ∧ <b>(¬B ∨ A) ∧ (¬C ∨ A)</b>" }), "c") + flow([[1, "<b>1. Remove ⇔</b><br>α ⇔ β → (α ⇒ β) ∧ (β ⇒ α)"], [2, "<b>2. Remove ⇒</b><br>α ⇒ β → ¬α ∨ β"], [3, "<b>3. Move ¬ inwards</b><br>De Morgan, double negation"], [4, "<b>4. Distribute</b><br>∨ over ∧"]], "sm") + card(5, "ana", "Like rewriting an algebra expression into a <b>standard form</b> before you can use a formula. Same meaning, different shape."),
          n: ["Resolution needs clauses, so you must be able to convert any sentence to CNF. Let's convert A if and only if, B or C. Remember this shape, because the Wumpus world rule has exactly the same shape later.",
            "Step 1: remove the biconditional. It becomes A implies B or C, and B or C implies A.",
            "Step 2: remove the implications. Alpha implies beta becomes not alpha or beta. So we get not A or B or C, and not B or C, or A.",
            "Step 3: move the negations inwards using De Morgan and double negation. Not, B or C, becomes not B and not C.",
            "Step 4: distribute or over and. Not B and not C, or A, becomes not B or A, and not C or A. Now we have three clauses, ready for resolution.",
            "It's like rewriting an algebra expression into a standard form before you plug it into a formula. Same meaning, different shape."] }
      ] },
      { t: "Inference in first-order logic", sec: [7], scenes: [
        { v: h("Propositionalisation: remove the quantifiers") + stg(0, [
            fix(tag("Universal Instantiation (UI)", "lbl"), 26, 5),
            fix(tag("∀x Student(x) ⇒ Studies(x)", "big hi"), 26, 22),
            ...[["Mia", 1, 14], ["Leo", 2, 30], ["Ava", 2, 46]].map(([n, k, y]) => act(tag(`Student(${n}) ⇒ Studies(${n})`, "ok"), { 0: [26, 22, 0, .5], [k]: [74, y, 1, 1] })),
            fix(tag("Existential Instantiation (EI)", "lbl"), 26, 62, 3),
            fix(tag("∃x Student(x) ∧ Enrolled(x)", "big hi"), 26, 80, 3),
            act(tag("Student(<b>k</b>) ∧ Enrolled(<b>k</b>)", "ok"), { 0: [26, 80, 0, .5], 4: [74, 72, 1, 1] }),
            act(tag("Student(Mia) ∧ Enrolled(Mia) ✗", "bad"), { 0: [74, 92, 0], 5: [74, 92, 1] })
          ], "16/4.4") + cols(card(1, "", "<b>UI</b>: ∀v α ⊢ Subst({v/g}, α). g = <b>any ground term</b>, many times."), card(4, "", "<b>EI</b>: ∃v α ⊢ Subst({v/k}, α). k = <b>brand-new constant</b>, once.")),
          n: ["How do we do inference in first-order logic? One approach: turn the FOL problem into a propositional one, then reuse the methods we already have. This is called propositionalisation, and it works by removing quantifiers through instantiation. First, universal instantiation, UI. If something holds for every object, it holds for any specific object you choose.",
            "Replace the universally quantified variable with any ground term, a term with no variables, like a constant. Substitute Mia, and you get: Student of Mia implies Studies of Mia.",
            "And you can do it again and again, with different ground terms. Leo, Ava, as many consequences as you need. Like a rubber stamp that prints a copy for anyone.",
            "Second, existential instantiation, EI. If something exists, give it a name.",
            "Replace the existential variable with a brand-new constant k that appears nowhere else in the KB. It's called a Skolem constant. Think of a mystery: someone took the last cookie. Call them the cookie thief until you know who it is.",
            "What you must not do is reuse an existing constant. Writing Mia would wrongly claim Mia is that object. k names a specific object that exists but is unknown. It's not any object, which is why it must be new. EI is applied once per existential sentence, and after that the original sentence can be dropped."] },
        { v: h("UI vs EI, and the full process") + split(tbl(["", "UI", "EI"], [[0, "Removes", "∀", "∃"], [0, "Substitute", "Any ground term", "A <b>new</b> constant only"], [0, "How often", "As many times as needed", "Once, then discard"], [0, "Meaning", "An arbitrary object", "One specific, unnamed object"]], "sm"), list([[1, "1. Start with the FOL KB and query"], [1, "2. <b>EI</b>: fresh constant for each ∃"], [1, "3. <b>UI</b>: the ground instances you need"], [2, "4. Treat each ground atom, e.g. Student(Mia), as a <b>propositional symbol</b>"], [2, "5. Run model checking, theorem proving or resolution"]], "tight")) + cols(card(3, "ok", "<b>Good news</b>: entailment is <b>preserved</b>. A ground query follows from the propositional KB exactly when it follows from the FOL KB."), card(4, "bad", "<b>Bad news</b>: ground instances can <b>explode</b>: Father(John), Father(Father(John)), Father(Father(Father(John))), …")),
          n: ["Side by side. UI removes for all, EI removes there exists. UI can substitute any ground term, EI only a brand-new constant. UI can be used as many times as needed, EI once and then the original is discarded. And UI's substitute is an arbitrary object, while EI's is one specific but unnamed object.",
            "The full process. Start with the FOL knowledge base and query. Apply EI to replace each existential with a fresh constant. Apply UI to create the ground instances you need from each universal sentence.",
            "Then propositionalise: treat each resulting ground atom, like Student of Mia, as a propositional symbol. And run any complete propositional method: model checking, theorem proving or resolution.",
            "The good news: entailment is preserved. A ground query follows from the propositionalised KB exactly when it follows from the original FOL KB.",
            "The bad news: the number of ground instances can explode, especially with functions or large domains. Father of John, Father of Father of John, and so on forever. That can make this approach impractical."] }
      ] },
      { t: "The Wumpus world", sec: [], scenes: [
        { v: h("The Wumpus world: a cave of hidden danger") + split(wgrid({ "1,1": { t: [[0, "START", "", 18]] }, "1,3": { t: [[1, "Wumpus", "wm"]] }, "1,2": { t: [[1, "stench", "st"]] }, "1,4": { t: [[1, "stench", "st"]] }, "2,3": { t: [[1, "stench", "st", -14], [2, "breeze", "br"], [3, "GOLD", "gd", 15]] }, "3,1": { on: "2:pit", t: [[2, "PIT", "pt"]] }, "3,3": { on: "2:pit", t: [[2, "PIT", "pt"]] }, "4,4": { on: "2:pit", t: [[2, "PIT", "pt"]] }, "2,1": { t: [[2, "breeze", "br"]] }, "4,1": { t: [[2, "breeze", "br"]] }, "3,2": { t: [[2, "breeze", "br"]] }, "4,3": { t: [[2, "breeze", "br"]] }, "3,4": { t: [[2, "breeze", "br"]] } }, agent({ 0: [[CX(1), CY(1) - 6]] })), list([[0, "4×4 rooms [x, y]. Start at <b>[1,1]</b>, facing east"], [1, "<b>Wumpus</b> eats you. <b>Stench</b> in its room and next door"], [2, "<b>Pits</b>. <b>Breeze</b> in rooms next to a pit"], [3, "<b>Gold</b> glitters. One <b>arrow</b>. Grab the gold, get out alive"]], "tight") + card(4, "ana", "Like <b>Minesweeper</b>: hidden mines (pits), visible clues (breezes).")),
          n: ["Now the case study that ties everything together: the Wumpus world, from section 7.2 of the textbook. It's a small cave of 4 by 4 rooms, each labelled x, y. The agent starts in room 1 1, facing east.",
            "Somewhere there's a monster, the Wumpus, which eats anyone who enters its room. You can't see it, but you can smell it: there's a stench in the Wumpus's room and the rooms directly next to it.",
            "Some rooms contain bottomless pits. You feel a breeze in the rooms directly next to a pit.",
            "Somewhere there's a bag of gold, which glitters. The agent has one arrow that can kill the Wumpus. The aim is to grab the gold and climb out alive.",
            "It's a lot like Minesweeper. You can't see the mines, only clues in the squares around them. And just like in Minesweeper, logic tells you which squares are safe to step on."] },
        { v: h("PEAS for the Wumpus world") + tbl(["", "Details"], [[0, "<b>Performance</b>", "<b>+1000</b> climb out with the gold. <b>−1000</b> pit or eaten. <b>−1</b> per action. <b>−10</b> for the arrow. Ends when the agent dies or climbs out."], [1, "<b>Environment</b>", "4×4 grid, start [1,1] facing right. Gold and Wumpus random (not the start). Each other room is a pit with probability <b>0.2</b>."], [2, "<b>Actuators</b>", "Forward, TurnLeft, TurnRight (90°), <b>Grab</b>, <b>Shoot</b> (one arrow, straight line), <b>Climb</b> (only from [1,1]). Walking into a wall: stay put."], [3, "<b>Sensors</b>", "Five percepts: Stench, Breeze, Glitter, Bump, Scream"]], "sm"),
          n: ["As with any agent, describe it with PEAS. Performance: plus 1000 for climbing out with the gold. Minus 1000 for falling into a pit or being eaten. Minus 1 for each action, and minus 10 for using the arrow. The game ends when the agent dies or climbs out.",
            "Environment: a 4 by 4 grid of rooms. The agent starts at 1 1 facing right. The gold and the Wumpus are placed uniformly at random in any room except the start, and every non-start room is a pit with probability 0.2.",
            "Actuators: Forward, TurnLeft and TurnRight by 90 degrees, Grab to pick up gold in the same room, Shoot to fire the single arrow in a straight line until it hits the Wumpus or a wall, and Climb, which only works from 1 1. Walking into a wall leaves the agent in place. Entering a pit or a live Wumpus's room kills the agent.",
            "And sensors: five percepts. Let's look at those."] },
        { v: h("Five sensors, one percept list") + at(0, `<div class="slots">${[["Stench", "Wumpus here or next door"], ["Breeze", "next to a pit"], ["Glitter", "gold in this room"], ["Bump", "walked into a wall"], ["Scream", "Wumpus killed"]].map(([n, d], i) => `<div class="slot" data-on="${i}:lit 5:${i < 3 ? "on" : ""}"><small>slot ${i + 1}: ${d}</small><b>${say({ 0: n, 5: i < 3 ? n : "None" })}</b></div>`).join("")}</div>`) + fx(5, "Percept = <b>[Stench, Breeze, Glitter, None, None]</b>", "c") + card(5, "", "Always five symbols, <b>in this order</b>, with <b>None</b> where nothing is sensed."),
          n: ["Slot 1, stench: in the Wumpus's room and the rooms directly next to it.",
            "Slot 2, breeze: in rooms directly next to a pit.",
            "Slot 3, glitter: in the room with the gold.",
            "Slot 4, bump: when the agent walks into a wall.",
            "Slot 5, scream: when the Wumpus is killed. It's heard anywhere in the cave.",
            "A percept is a list of these five symbols in that order, with None where nothing is sensed. For example, Stench, Breeze, Glitter, None, None means the agent smells a stench, feels a breeze and sees glitter in its current room."] },
        { v: h("The first move") + split(wgrid({ "1,1": { on: "2:vis", t: [[0, "OK", "okt", 16], [2, "V", "b", -10]] }, "1,2": { on: "1:ok", t: [[1, "OK", "okt", 16]] }, "2,1": { on: "1:ok", t: [[1, "OK", "okt", 16], [3, "B", "b br", -10]] }, "2,2": { on: "3:mb", t: [[3, "P?", "mbt"]] }, "3,1": { on: "3:mb", t: [[3, "P?", "mbt"]] } }, agent({ 0: [[CX(1), CY(1)]], 2: [[CX(1), CY(1)], [CX(2), CY(1)]], 4: [[CX(2), CY(1)], [CX(1), CY(1)], [CX(1), CY(2)]] })), fx(0, say({ 0: "Percept at [1,1]: [None, None, None, None, None]", 3: "Percept at [2,1]: [None, <b>Breeze</b>, None, None, None]" }), "sm") + list([[1, "[1,1]: no breeze, no stench → <b>[1,2] and [2,1] are safe</b>"], [2, "Move to [2,1]"], [3, "Breeze → a pit in a neighbour. [1,1] is safe, so the pit is in <b>[2,2] or [3,1]</b>"], [4, "Can't tell which. Safe move: <b>go back and try [1,2]</b>"]], "tight")),
          n: ["Let's play. The agent is at 1 1, and its percept is all None. Nothing at all.",
            "No breeze means no neighbour has a pit. No stench means no neighbour has the Wumpus. So both neighbours, 1 2 and 2 1, are safe. They're marked OK.",
            "The agent moves to 2 1. Room 1 1 is now marked visited.",
            "In 2 1 it feels a breeze. So at least one neighbour has a pit. 1 1 is known to be safe, so the pit must be in 2 2 or 3 1. Both are marked P question mark.",
            "The agent can't yet tell which one has the pit. So the safe move is to go back and try 1 2, the other room already proven safe. This is exactly the logic from earlier, and next we'll write it down formally."] },
        { v: h("The Wumpus KB in propositional logic") + split(tbl(["Symbol", "True when"], [[0, P_("x,y"), "pit in [x,y]"], [0, "W" + sb("x,y"), "Wumpus in [x,y], dead or alive"], [0, B_("x,y"), "breeze felt in [x,y]"], [0, "S" + sb("x,y"), "stench felt in [x,y]"], [0, "G" + sb("x,y"), "gold in [x,y]"]], "sm"), at(1, `<div class="kbx">${[[1, "R1", "¬" + P_("1,1"), "game rule: start is safe"], [2, "R2", B_("1,1") + " ⇔ (" + P_("2,1") + " ∨ " + P_("1,2") + ")", "breeze rule"], [2, "R3", B_("2,1") + " ⇔ (" + P_("1,1") + " ∨ " + P_("2,2") + " ∨ " + P_("3,1") + ")", "breeze rule"], [3, "R4", "¬" + B_("1,1"), "percept at [1,1]"], [3, "R5", B_("2,1"), "percept at [2,1]"], [4, "R6", "¬" + P_("2,1"), "walked in, survived"]].map(([k, r, s, w]) => `<div class="kbr vk-i" data-s="${k}"><b>${r}</b><span>${s}</span><span class="tg lbl">${w}</span></div>`).join("")}</div>`)) + card(5, "", "General breeze rule: " + B_("x,y") + " ⇔ (" + P_("x−1,y") + " ∨ " + P_("x+1,y") + " ∨ " + P_("x,y−1") + " ∨ " + P_("x,y+1") + "). Neighbours outside the cave are left out."),
          n: ["To use logic, define a separate symbol for each room. P x y: there's a pit in x y. W x y: the Wumpus is in x y, dead or alive. B x y: the agent feels a breeze in x y. S x y: a stench. G x y: the gold.",
            "Here's the knowledge base after the first move. R1, not P 1 1: a game rule, the start room never has a pit.",
            "R2 and R3 are the game rule for breezes, written out for 1 1 and 2 1. B 1 1 if and only if P 2 1 or P 1 2. And B 2 1 if and only if P 1 1 or P 2 2 or P 3 1.",
            "R4 and R5 are percepts. Not B 1 1: no breeze in 1 1. And B 2 1: a breeze in 2 1.",
            "R6, not P 2 1: the agent walked into 2 1 and survived, so there's no pit there.",
            "R2 and R3 are both instances of one general rule: a room is breezy exactly when one of its four neighbours has a pit. Neighbours with an index below 1 lie outside the cave and are simply left out. And here's the weakness of propositional logic. This rule must be copied out separately for all 16 rooms, because propositional logic can't say for every room."] },
        { v: h("Theorem proving: is [1,2] pit-free?") + list([[1, `1. R2 + <b>biconditional elimination</b>: (${B_("1,1")} ⇒ (${P_("2,1")} ∨ ${P_("1,2")})) ∧ ((${P_("2,1")} ∨ ${P_("1,2")}) ⇒ ${B_("1,1")})`], [2, `2. <b>And-elimination</b>: (${P_("2,1")} ∨ ${P_("1,2")}) ⇒ ${B_("1,1")}`], [3, `3. <b>Contraposition</b>: ¬${B_("1,1")} ⇒ ¬(${P_("2,1")} ∨ ${P_("1,2")})`], [4, `4. <b>Modus Ponens</b> with R4 (¬${B_("1,1")}): ¬(${P_("2,1")} ∨ ${P_("1,2")})`], [5, `5. <b>De Morgan</b>: ¬${P_("2,1")} ∧ ¬${P_("1,2")}`], [6, `6. <b>And-elimination</b>: <b>¬${P_("1,2")}</b> ✓`]]) + card(0, "", "Query: KB ⊨ ¬" + P_("1,2") + "? Chain rules from R2 and R4.") + card(7, "ok", "Matches the <b>OK</b> mark on [1,2]: no pit there."),
          n: ["Now let's prove what the agent concluded. Is there no pit in 1 2? The query is not P 1 2. First, by theorem proving.",
            "Step 1: take R2 and apply biconditional elimination. B 1 1 implies, P 2 1 or P 1 2. And, P 2 1 or P 1 2, implies B 1 1.",
            "Step 2: And-elimination keeps the second half. P 2 1 or P 1 2 implies B 1 1.",
            "Step 3: contraposition. Not B 1 1 implies not, P 2 1 or P 1 2.",
            "Step 4: Modus Ponens with R4, which says not B 1 1. So we get: not, P 2 1 or P 1 2.",
            "Step 5: De Morgan pushes the not inside. Not P 2 1, and not P 1 2.",
            "Step 6: And-elimination. Not P 1 2. Proved.",
            "That matches the OK mark on 1 2. Six steps, every one justified, and no truth table."] },
        { v: h("Resolution: is [1,2] pit-free?") + fx(0, say({ 0: "R2: " + B_("1,1") + " ⇔ (" + P_("2,1") + " ∨ " + P_("1,2") + ")", 1: "CNF of R2: (¬" + B_("1,1") + " ∨ " + P_("2,1") + " ∨ " + P_("1,2") + ") ∧ (¬" + P_("2,1") + " ∨ " + B_("1,1") + ") ∧ <b>(¬" + P_("1,2") + " ∨ " + B_("1,1") + ")</b>" }), "c") + split(rt(420, 200, { Q: [80, 40, 90, "P₁,₂", 2, "q", "", "negated query"], C: [250, 40, 150, "¬P₁,₂ ∨ B₁,₁", 1, "", "", "from R2 in CNF"], B: [150, 110, 80, "B₁,₁", 3], R4: [330, 110, 90, "¬B₁,₁", 4, "", "", "R4"], E: [240, 175, 70, "□", 4, "no"] }, [["Q", "B", 3], ["C", "B", 3], ["B", "E", 4], ["R4", "E", 4]]), list([[1, "Convert R2 to CNF (the same 4 steps as A ⇔ (B ∨ C))"], [2, "Negated query: ¬(¬" + P_("1,2") + ") ≡ <b>" + P_("1,2") + "</b>"], [3, P_("1,2") + " + (¬" + P_("1,2") + " ∨ " + B_("1,1") + ") → <b>" + B_("1,1") + "</b>"], [4, B_("1,1") + " + ¬" + B_("1,1") + " (R4) → <b>□</b>, so KB ⊨ ¬" + P_("1,2")]], "tight")),
          n: ["Now the same query by resolution. This is the standard textbook example. Start with R2.",
            "Convert R2 to CNF, using exactly the four steps we did for A if and only if, B or C. We get three clauses. The one we need is the last: not P 1 2, or B 1 1.",
            "Add the negated query. Not, not P 1 2, is just P 1 2. In words: suppose there is a pit in 1 2.",
            "Resolve P 1 2 with not P 1 2 or B 1 1. The P 1 2 literals cancel, leaving B 1 1. A pit in 1 2 would force a breeze in 1 1.",
            "But R4 says there's no breeze in 1 1. B 1 1 and not B 1 1 give the empty clause. Contradiction. So the KB entails not P 1 2."] },
        { v: h("Where is the pit near [2,1]?") + split(rt(420, 205, { R5: [80, 40, 90, "B₂,₁", 1, "", "", "R5"], R3: [270, 40, 230, "B₂,₁ ⇔ (P₁,₁ ∨ P₂,₂ ∨ P₃,₁)", 1, "", "", "R3"], D: [180, 112, 170, "P₁,₁ ∨ P₂,₂ ∨ P₃,₁", 2], R1: [370, 112, 80, "¬P₁,₁", 3, "", "", "R1"], F: [250, 180, 120, "P₂,₂ ∨ P₃,₁", 3, "win"] }, [["R5", "D", 2], ["R3", "D", 2], ["D", "F", 3], ["R1", "F", 3]]), list([[2, "R5, R3 → " + P_("1,1") + " ∨ " + P_("2,2") + " ∨ " + P_("3,1") + " (biconditional elimination, then Modus Ponens)"], [3, "With R1 ¬" + P_("1,1") + " → <b>" + P_("2,2") + " ∨ " + P_("3,1") + "</b> (unit resolution)"], [4, "KB entails the <b>OR</b>, but <b>neither</b> room on its own"]], "tight") + card(5, "ana", "The Minesweeper <b>50/50</b>: one of two squares hides a mine, and you can't tell which. <b>Don't step on either yet.</b>")),
          n: ["Second worked example. Where's the pit near 2 1?",
            "Start from R5, the breeze in 2 1, and R3, the breeze rule for 2 1.",
            "Biconditional elimination on R3, then Modus Ponens with R5, gives P 1 1 or P 2 2 or P 3 1.",
            "R1 says not P 1 1. Unit resolution removes P 1 1, leaving P 2 2 or P 3 1.",
            "That's exactly the two P question mark marks in the picture. The KB entails the disjunction, but it entails neither P 2 2 nor P 3 1 on its own.",
            "It's the Minesweeper 50 50. One of two squares hides a mine and you can't tell which. So the agent shouldn't risk either room yet."] }
      ] },
      { t: "The Wumpus world in FOL", sec: [], scenes: [
        { v: h("Percepts and actions in FOL") + fx(0, "Percept([Stench, Breeze, Glitter, None, None], <b>5</b>)", "c") + card(0, "", "A binary predicate: the <b>percept list</b> and the <b>time step</b>. Here: at time 5, stench, breeze and glitter.") + fx(1, "Actions as terms: Turn(Right), Turn(Left), Forward, Shoot, Grab, Climb", "sm") + list([[2, "∀t, s, g, m, c &nbsp;Percept([s, <b>Breeze</b>, g, m, c], t) ⇒ <b>Breezy(t)</b>"], [3, "∀t, s, b, m, c &nbsp;Percept([s, b, <b>Glitter</b>, m, c], t) ⇒ <b>Glittering(t)</b>"], [4, "∀t, (x, y) &nbsp;G<sub>x,y</sub>(t) ⇒ <b>BestAction(Grab, t)</b> &nbsp;(a reflex rule)"]], "tight") + card(2, "tip", "∀t: <b>every time step</b> in one sentence. s, g, m, c = <b>whatever is in that slot</b>."),
          n: ["FOL lets the same knowledge be written far more compactly, and lets sentences include time, so the agent knows when each percept arrived. Time steps are integers. Percept is a binary predicate. Its first argument is the five-element percept list, and the second is the time step. Here: at time 5 the agent senses a stench, a breeze and glitter.",
            "Actions are written as terms: Turn of Right, Turn of Left, Forward, Shoot, Grab and Climb.",
            "A percept implies facts about the current situation. For all t, and any s, g, m, c: if the percept at time t has Breeze in the second slot, then Breezy of t. The quantifier ranges over time, so one sentence covers every time step. Propositional logic would need a copy for each step. The other variables mean whatever is in that slot, so only the relevant position matters.",
            "In the same way, Glitter in the third slot means Glittering of t.",
            "And a simple reflex rule: if the agent is in a room with gold at time t, the best action is Grab."] },
        { v: h("Location and adjacency") + fx(0, "<b>Adjacent</b>([x,y], [a,b]) ⇔ (x = a ∧ (y = b − 1 ∨ y = b + 1)) ∨ (y = b ∧ (x = a − 1 ∨ x = a + 1))", "sm") + split(wgrid({ "2,2": { on: "0:vis", t: [[0, "(x, y)", "b"]] }, "1,2": { on: "1:ok", t: [[1, "adjacent", "okt"]] }, "3,2": { on: "1:ok", t: [[1, "adjacent", "okt"]] }, "2,1": { on: "1:ok", t: [[1, "adjacent", "okt"]] }, "2,3": { on: "1:ok", t: [[1, "adjacent", "okt"]] } }), list([[1, "Same column, one row apart, or same row, one column apart. No diagonals"], [2, "<b>At(Agent, (x, y), t)</b>: agent in room (x, y) at time t"], [3, "One place at a time: two At facts at the same t ⇒ same (x, y)"], [4, "At(Agent, (x, y), t) ∧ Breezy(t) ⇒ <b>Breezy((x, y))</b>"]], "tight")) + card(5, "warn", "<b>Breezy(t)</b> = a <b>time step</b>. <b>Breezy((x, y))</b> = a <b>room</b>. Same name!"),
          n: ["Adjacency. Two rooms are adjacent when they share one coordinate and differ by exactly 1 in the other.",
            "Same column and one row apart, or same row and one column apart. These four rooms are adjacent to x y. Diagonals don't count.",
            "The agent's position is written with At. At of Agent, x y, t means the agent is in room x y at time t.",
            "And an object can only be in one place at a time. If the agent is at two locations at the same time, they must be the same location.",
            "Combining location with the percept lets the agent attach the breeze to a room rather than a moment in time. If the agent is in x y at time t, and it's breezy at t, then room x y is breezy.",
            "Watch the overloading. Breezy of t is about a time step, and Breezy of x y is about a room. The slides use the same name for both, so read the argument carefully."] },
        { v: h("Axioms: 16 copies become one") + stg(0, [
            fix(tag("propositional: one rule per room", "lbl"), 26, 5), fix(tag("FOL: one axiom", "lbl"), 74, 5, 1),
            ...Array.from({ length: 16 }, (_, i) => { const x = 1 + (i % 4), y = 4 - Math.floor(i / 4); return act(tag(`B${sb(x + "," + y)} ⇔ …`), { 0: [8 + (i % 4) * 12.5, 20 + Math.floor(i / 4) * 21, 1], 1: [74, 50, 0, .4] }); }),
            act(tag(`∀(x,y) Breezy(x,y) ⇔ ∃(o,p) Adjacent((o,p), (x,y)) ∧ P<sub>o,p</sub>`, "wrap big ok"), { 0: [74, 50, 0, .5], 1: [74, 50, 1, 1] })
          ], "16/3.9") + cols(card(0, "", "<b>Axiom</b>: taken as <b>given</b>, not derived."), card(2, "tip", "P<sub>o,p</sub> sits <b>inside</b> the ∃: some adjacent (o, p) has a pit."), card(3, "", "<b>Successor-state</b>: ∀t HaveArrow(t + 1) ⇔ (HaveArrow(t) ∧ ¬Action(Shoot, t))")),
          n: ["Axioms are sentences taken as given rather than derived. They supply the basic facts and rules everything else is built from. Remember the propositional breeze rule that needed 16 copies, one per room?",
            "In FOL it becomes a single axiom. For all x y, Breezy of x y if and only if there exists o p, such that o p is adjacent to x y, and there's a pit in o p. A room is breezy exactly when some adjacent room contains a pit.",
            "A reading tip: the pit condition, P o p, is meant to sit inside the scope of the there exists. There is some o p that is adjacent to x y and has a pit.",
            "State that changes over time is described with successor-state style axioms. For the arrow: for all t, the agent has the arrow at t plus 1 exactly when it had the arrow at t, and did not shoot at t."] }
      ] },
      { t: "Summary", sec: [], scenes: [
        { v: h("Comparing the three methods") + tbl(["", "Model checking", "Theorem proving", "Resolution refutation"], [[0, "Core idea", "Check γ in every KB-true model", "Chain sound rules from KB to γ", "Show <b>KB ∧ ¬γ</b> is unsatisfiable"], [1, "Needs CNF?", "No", "No", "<b>Yes</b>"], [1, "Main tool", "Truth table", "Modus Ponens, And-elimination, equivalences", "Resolution rule"], [2, "Success looks like", "No KB-true model makes γ false", "γ appears at the end of the proof", "<b>Empty clause</b> derived"], [3, "Weakness", "<b>2<sup>n</sup></b> models", "Choosing which rule to apply next", "CNF conversion can grow large"]], "sm"),
          n: ["Let's compare the three inference methods. Model checking checks gamma in every model where the KB is true. Theorem proving chains sound rules from the KB to gamma. Resolution refutation shows that KB and not gamma is unsatisfiable.",
            "Only resolution needs CNF. Model checking uses truth tables, theorem proving uses Modus Ponens, And-elimination and the equivalences, and resolution uses the resolution rule.",
            "Success looks different for each: no KB-true model makes gamma false, gamma appears at the end of the proof, or the empty clause is derived.",
            "And the weaknesses: model checking faces 2 to the n models, theorem proving has to choose which rule to apply next, and resolution's CNF conversion can grow large."] },
        { v: h("Exam checklist") + list([[0, "KB + <b>inference engine</b>. Syntax = legal sentences, semantics = when true"], [1, "<b>P ⇒ Q</b> is false only for T, F. False premise → <b>vacuously true</b>. Precedence ¬ ∧ ∨ ⇒ ⇔"], [2, "Memorise <b>implication</b> and <b>biconditional elimination</b>, De Morgan, distributivity"], [3, "FOL: term names an object, predicate is T/F. <b>∀ with ⇒, ∃ with ∧</b>. Order of ∀∃ matters"], [4, "<b>KB ⊨ γ</b>: every KB-true model makes γ true. One counterexample breaks it"], [5, "Resolution: add <b>¬γ only</b>, convert to CNF, resolve until <b>□</b>. It's <b>And</b>-elimination, not Add"], [6, "FOL → propositional: <b>EI</b> (new constant, once), then <b>UI</b> (any ground term, many times)"], [7, "Wumpus: breeze → pit next door. Prove ¬P<sub>1,2</sub> both ways. P<sub>2,2</sub> ∨ P<sub>3,1</sub>, but neither alone"]], "tight"),
          n: ["Here's your checklist. A knowledge-based agent pairs a knowledge base with an inference engine. Syntax says which sentences are legal, semantics says when they're true.",
            "Implication is false only when the premise is true and the conclusion false. A false premise makes it vacuously true. And precedence runs not, and, or, implies, iff.",
            "Memorise implication elimination and biconditional elimination, plus De Morgan and distributivity.",
            "In FOL, a term names an object and a predicate is true or false. For all goes with implies, there exists goes with and, and the order of mixed quantifiers changes the meaning.",
            "Entailment: KB entails gamma when every model that makes the KB true also makes gamma true. One counterexample breaks it.",
            "For resolution, add the negation of the query only, convert to CNF, and resolve until you reach the empty clause. And it's And-elimination, not Add-elimination.",
            "FOL inference can be reduced to propositional inference: apply EI with a new constant, once, then UI with any ground term, as many times as needed, then propositionalise.",
            "And in the Wumpus world, a breeze means a pit next door. Be able to prove not P 1 2 by theorem proving and by resolution, and explain why the agent knows P 2 2 or P 3 1, but neither one alone. Now try the model checking tool and the quiz for this week."] }
      ] }
    ]
  };
})();
