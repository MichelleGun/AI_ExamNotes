// Random calculation practice generators (seeded, default seed 67)
window.makeRng = function (seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

(function () {
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const rd = (x, d = 4) => Math.round(x * 10 ** d) / 10 ** d;
  const lg = x => (x === 0 ? 0 : Math.log2(x));
  const H = (p, n) => { const t = p + n; if (!t) return 0; const a = p / t, b = n / t; return -(a ? a * lg(a) : 0) - (b ? b * lg(b) : 0); };
  const G = (p, n) => { const t = p + n; if (!t) return 0; return 1 - (p / t) ** 2 - (n / t) ** 2; };
  const N = (n, tol = 0.001) => ({ n, tol });
  // Step-by-step explanation: numbered steps, then an optional "watch out" trap.
  const ST = (lines, trap) => `<b>Step by step</b><ol class="gsteps">${lines.map(l => `<li>${l}</li>`).join("")}</ol>` + (trap ? `<div class="gtrap"><b>Watch out:</b> ${trap}</div>` : "");
  const term = (k, t) => k === 0 ? `0 (a zero count adds 0, since 0·log 0 = 0)` : k === t ? `−1·log₂1 = 0` : `−(${k}/${t})·log₂(${k}/${t}) = −${rd(k / t)}×(${String(rd(lg(k / t))).replace("-", "−")}) = ${rd(-(k / t) * lg(k / t))}`;
  const Hs = (p, n) => { const t = p + n; return `H(${p}+, ${n}−): ${term(p, t)}; ${term(n, t)} → <b>${rd(H(p, n))}</b>`; };
  const Gs = (p, n) => { const t = p + n; return `Gini(${p}+, ${n}−) = 1 − (${p}/${t})² − (${n}/${t})² = 1 − ${rd((p / t) ** 2)} − ${rd((n / t) ** 2)} = <b>${rd(G(p, n))}</b>`; };

  window.GENERATORS = [
  { id: "astar", topic: "l2", name: "A* / UCS / Greedy: pick next node", make(r) {
      const names = ["P", "Q", "R", "S"]; const alg = pick(r, ["A*", "UCS", "Greedy"]);
      const f = x => alg === "A*" ? x.g + x.h : alg === "UCS" ? x.g : x.h;
      let nodes, best;
      do {
        nodes = names.map(n => ({ n, g: ri(r, 50, 300), h: ri(r, 50, 300) }));
        best = nodes.reduce((a, b) => f(b) < f(a) ? b : a);
      } while (nodes.filter(x => f(x) === f(best)).length > 1);
      const idx = names.indexOf(best.n);
      return { q: `${alg} frontier contains: ${nodes.map(x => `<b>${x.n}</b> (g=${x.g}, h=${x.h})`).join(", ")}.<br>Which node is expanded next? Enter its f-value.`,
        answers: [N(f(best), 0)], hint: `Node ${best.n}`,
        steps: ST([
          `Pick the rule for ${alg}: ${alg === "A*" ? "<b>f = g + h</b> (cost so far + estimate to goal)" : alg === "UCS" ? "<b>f = g</b> (cost so far only, ignore h)" : "<b>f = h</b> (estimate to goal only, ignore g)"}.`,
          `Work out f for every node on the frontier:<br>` + nodes.map(x => `${x.n}: ${alg === "A*" ? `${x.g} + ${x.h} = ${f(x)}` : alg === "UCS" ? `g = ${x.g}` : `h = ${x.h}`}`).join("<br>"),
          `Sort them: ` + [...nodes].sort((a, b) => f(a) - f(b)).map(x => `${x.n} (${f(x)})`).join(" &lt; ") + `.`,
          `The frontier is a priority queue, so the <b>lowest f</b> is popped first: <b>${best.n}</b>, f = <b>${f(best)}</b>.`],
          alg === "A*" ? "add g and h. Picking the lowest h alone is greedy, picking the lowest g alone is UCS." : alg === "UCS" ? "UCS ignores h completely, even if it is given." : "greedy ignores g completely, even if a node has a huge g."), choice: idx  };
  }},
  { id: "entropy", topic: "l4", name: "Entropy and Gini of a node", make(r) {
      const p = ri(r, 0, 8), n = ri(r, 1, 8);
      return { q: `A node has <b>${p}</b> positive and <b>${n}</b> negative examples. Find the entropy (bits) and the Gini index (4 d.p.).`,
        labels: ["Entropy", "Gini"], answers: [N(rd(H(p, n)), 0.0006), N(rd(G(p, n)), 0.0006)],
        steps: ST([
          `Count: total = ${p} + ${n} = ${p + n}. p₊ = ${p}/${p + n} = ${rd(p / (p + n))}, p₋ = ${n}/${p + n} = ${rd(n / (p + n))}.`,
          `Entropy formula: H = −p₊·log₂(p₊) − p₋·log₂(p₋).`,
          `Positive part: ${term(p, p + n)}.`,
          `Negative part: ${term(n, p + n)}.`,
          `Add them: H = <b>${rd(H(p, n))}</b> bits.`,
          `Gini formula: Gini = 1 − p₊² − p₋².`,
          `Square: p₊² = ${rd(p / (p + n))}² = ${rd((p / (p + n)) ** 2)}, p₋² = ${rd(n / (p + n))}² = ${rd((n / (p + n)) ** 2)}.`,
          `Gini = 1 − ${rd((p / (p + n)) ** 2)} − ${rd((n / (p + n)) ** 2)} = <b>${rd(G(p, n))}</b>.`],
          "log₂ on a calculator: log₂(x) = ln(x) / ln(2). The minus signs make entropy positive. Check: 50/50 gives H = 1 and Gini = 0.5, a pure node gives 0 for both.") };
  }},
  { id: "ig", topic: "l4", name: "Information gain and Gini reduction of a split", make(r) {
      const k = ri(r, 2, 3); const kids = [];
      for (let i = 0; i < k; i++) kids.push([ri(r, 0, 5), ri(r, 0, 5)]);
      kids.forEach(c => { if (c[0] + c[1] === 0) c[0] = 1; });
      const P = kids.reduce((s, c) => s + c[0], 0), Nn = kids.reduce((s, c) => s + c[1], 0), T = P + Nn;
      const rem = kids.reduce((s, c) => s + (c[0] + c[1]) / T * H(c[0], c[1]), 0);
      const wg = kids.reduce((s, c) => s + (c[0] + c[1]) / T * G(c[0], c[1]), 0);
      const ig = H(P, Nn) - rem, gr = G(P, Nn) - wg;
      return { q: `Parent: ${P}+ / ${Nn}-. Splitting on attribute A gives branches: ${kids.map((c, i) => `<b>v${i + 1}</b>: ${c[0]}+ / ${c[1]}-`).join(", ")}.<br>Find IG(A) and the Gini reduction (4 d.p.).`,
        labels: ["IG", "Gini reduction"], answers: [N(rd(ig), 0.001), N(rd(gr), 0.001)],
        steps: ST([
          `Parent: ${P}+ / ${Nn}− (total ${T}). ${Hs(P, Nn)}.`,
          `${Gs(P, Nn)}.`,
          `Entropy of each branch:<br>` + kids.map((c, i) => `v${i + 1}: ${Hs(c[0], c[1])}`).join("<br>"),
          `Weight each branch by its share of the ${T} examples, then add (this is the remainder):<br>` + kids.map((c, i) => `v${i + 1}: ${c[0] + c[1]}/${T} × ${rd(H(c[0], c[1]))} = ${rd((c[0] + c[1]) / T * H(c[0], c[1]))}`).join("<br>") + `<br>Remainder = <b>${rd(rem)}</b>`,
          `IG = H(parent) − remainder = ${rd(H(P, Nn))} − ${rd(rem)} = <b>${rd(ig)}</b>.`,
          `Gini of each branch, weighted the same way:<br>` + kids.map((c, i) => `v${i + 1}: ${c[0] + c[1]}/${T} × ${rd(G(c[0], c[1]))} = ${rd((c[0] + c[1]) / T * G(c[0], c[1]))}`).join("<br>") + `<br>Weighted Gini = <b>${rd(wg)}</b>`,
          `Gini reduction = Gini(parent) − weighted Gini = ${rd(G(P, Nn))} − ${rd(wg)} = <b>${rd(gr)}</b>.`],
          "weight by branch SIZE (examples in the branch ÷ parent total), not by 1/number of branches. Pick the attribute with the largest IG or largest Gini reduction.") };
  }},
  { id: "sa", topic: "l3", name: "Simulated annealing acceptance", make(r) {
      const dE = ri(r, 1, 10), T = pick(r, [1, 2, 4, 5, 8, 10, 20]); const p = Math.exp(-dE / T); const rr = rd(r(), 2);
      return { q: `Minimising energy. Current E = ${20}, neighbour E = ${20 + dE}, temperature T = ${T}. Find the acceptance probability p (4 d.p.). The random number drawn is r = ${rr}. Enter 1 if the move is accepted, 0 if not.`,
        labels: ["p", "Accept (1/0)"], answers: [N(rd(p), 0.0006), N(rr < p ? 1 : 0, 0)],
        steps: ST([
          `ΔE = new energy − current energy = ${20 + dE} − 20 = <b>${dE}</b>.`,
          `ΔE > 0, so the move is <b>worse</b> (we are minimising). A worse move is accepted only with probability p.`,
          `Formula: p = e^(−ΔE / T).`,
          `ΔE / T = ${dE} / ${T} = ${rd(dE / T)}.`,
          `p = e^(−${rd(dE / T)}) = <b>${rd(p)}</b> (calculator: e^x with x = −${rd(dE / T)}).`,
          `Compare the random number: r = ${rr} ${rr < p ? "&lt;" : "≥"} p = ${rd(p)}, so the move is <b>${rr < p ? "accepted (enter 1)" : "rejected (enter 0)"}</b>.`],
          "accept when r &lt; p. A better move (ΔE ≤ 0) is always accepted. Higher T gives bigger p, so more bad moves are accepted early on.") };
  }},
  { id: "roulette", topic: "l3", name: "GA roulette wheel probability", make(r) {
      const f = [ri(r, 5, 30), ri(r, 5, 30), ri(r, 5, 30), ri(r, 5, 30)]; const T = f.reduce((a, b) => a + b); const i = ri(r, 0, 3);
      return { q: `Fitness values: x1 = ${f[0]}, x2 = ${f[1]}, x3 = ${f[2]}, x4 = ${f[3]}. Probability that <b>x${i + 1}</b> is selected by roulette wheel (4 d.p.)?`,
        answers: [N(rd(f[i] / T), 0.0006)], steps: ST([
          `Roulette wheel: each individual's slice = its fitness ÷ total fitness.`,
          `Total fitness = ${f.join(" + ")} = <b>${T}</b>.`,
          `x${i + 1} has fitness ${f[i]}.`,
          `P(x${i + 1}) = ${f[i]} / ${T} = <b>${rd(f[i] / T)}</b>.`,
          `Check: all four probabilities (` + f.map(v => rd(v / T, 3)).join(", ") + `) add up to 1.`],
          "divide by the TOTAL fitness, not by the largest or by 4.") };
  }},
  { id: "sse", topic: "l4", name: "Squared error loss and gradient step", make(r) {
      const w0 = ri(r, -2, 2), w1 = ri(r, 1, 3); const xs = [1, 2, 3]; const ys = xs.map(x => w0 + w1 * x + ri(r, -2, 2));
      const preds = xs.map(x => w0 + w1 * x); const L = xs.reduce((s, x, i) => s + (ys[i] - preds[i]) ** 2, 0);
      return { q: `Model h(x) = ${w0} + ${w1}x. Data: ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(", ")}. Find the sum of squared errors.`,
        answers: [N(L, 0)], steps: ST([
          `Loss = Σ (y − h(x))². Do it one data point at a time.`,
          ...xs.map((x, i) => `Point (${x}, ${ys[i]}): prediction h(${x}) = ${w0} + ${w1}×${x} = ${preds[i]}. Error = ${ys[i]} − ${preds[i]} = ${ys[i] - preds[i]}. Squared = ${(ys[i] - preds[i]) ** 2}.`),
          `Add the squared errors: ${xs.map((x, i) => (ys[i] - preds[i]) ** 2).join(" + ")} = <b>${L}</b>.`],
          "square each error BEFORE adding, so negative errors don't cancel positive ones.") };
  }},
  { id: "knn", topic: "l4", name: "KNN distance and vote", make(r) {
      const q = [ri(r, 0, 6), ri(r, 0, 6)]; const pts = []; const labs = ["A", "B"];
      for (let i = 0; i < 5; i++) pts.push({ x: ri(r, 0, 8), y: ri(r, 0, 8), l: pick(r, labs) });
      const d = pts.map(p => ({ ...p, d: Math.sqrt((p.x - q[0]) ** 2 + (p.y - q[1]) ** 2) })).sort((a, b) => a.d - b.d);
      const top = d.slice(0, 3); const cA = top.filter(p => p.l === "A").length;
      return { q: `Query point (${q[0]}, ${q[1]}). Training points: ${pts.map(p => `(${p.x}, ${p.y}) ${p.l}`).join("; ")}.<br>Using Euclidean distance and k = 3, how many of the 3 nearest neighbours are class A? (Then predict the class by majority.)`,
        answers: [N(cA, 0)], steps: ST([
          `Euclidean distance: d = √((x − ${q[0]})² + (y − ${q[1]})²).`,
          `Distance to every training point (sorted, nearest first):<br>` + d.map(p => `(${p.x}, ${p.y}) class ${p.l}: √(${(p.x - q[0]) ** 2} + ${(p.y - q[1]) ** 2}) = √${(p.x - q[0]) ** 2 + (p.y - q[1]) ** 2} = ${rd(p.d, 3)}`).join("<br>"),
          `k = 3, so keep the 3 smallest: ${top.map(p => `(${p.x}, ${p.y}) ${p.l}`).join(", ")}.`,
          `Count the classes: <b>${cA}</b> × A and ${3 - cA} × B.`,
          `Majority vote → predict <b>${cA >= 2 ? "A" : "B"}</b>.`],
          "you can compare squared distances without the square root, the order is the same. Odd k avoids ties.") };
  }},
  { id: "metrics", topic: "l4", name: "Precision, recall, F1", make(r) {
      const TP = ri(r, 20, 60), FP = ri(r, 2, 20), FN = ri(r, 2, 20), TN = ri(r, 20, 60);
      const P = TP / (TP + FP), R = TP / (TP + FN), F = 2 * P * R / (P + R), A = (TP + TN) / (TP + TN + FP + FN);
      return { q: `TP = ${TP}, FP = ${FP}, FN = ${FN}, TN = ${TN}. Find accuracy, precision, recall and F1 (3 d.p.).`, labels: ["Accuracy", "Precision", "Recall", "F1"],
        answers: [N(rd(A, 3), 0.0015), N(rd(P, 3), 0.0015), N(rd(R, 3), 0.0015), N(rd(F, 3), 0.0015)],
        steps: ST([
          `All = TP + TN + FP + FN = ${TP} + ${TN} + ${FP} + ${FN} = ${TP + TN + FP + FN}.`,
          `Accuracy = (TP + TN) / All = (${TP} + ${TN}) / ${TP + TN + FP + FN} = ${TP + TN} / ${TP + TN + FP + FN} = <b>${rd(A, 3)}</b>.`,
          `Precision = TP / (TP + FP) = ${TP} / (${TP} + ${FP}) = ${TP} / ${TP + FP} = <b>${rd(P, 3)}</b>. (Of everything predicted positive, how much was right?)`,
          `Recall = TP / (TP + FN) = ${TP} / (${TP} + ${FN}) = ${TP} / ${TP + FN} = <b>${rd(R, 3)}</b>. (Of all real positives, how many did we find?)`,
          `F1 = 2·P·R / (P + R) = 2 × ${rd(P, 3)} × ${rd(R, 3)} / (${rd(P, 3)} + ${rd(R, 3)}) = ${rd(2 * P * R, 3)} / ${rd(P + R, 3)} = <b>${rd(F, 3)}</b>.`],
          "precision uses FP, recall uses FN. Use unrounded P and R inside F1 if you can.") };
  }},
  { id: "perceptron", topic: "l5", name: "Perceptron output and update", make(r) {
      const x = [ri(r, 0, 2), ri(r, 0, 2)], w = [rd(ri(r, -10, 10) / 10, 1), rd(ri(r, -10, 10) / 10, 1)], b = rd(ri(r, -5, 5) / 10, 1);
      const s = rd(w[0] * x[0] + w[1] * x[1] + b, 3); const h = s >= 0 ? 1 : 0; const y = 1 - h; const a = 0.1;
      const nw1 = rd(w[0] + a * (y - h) * x[0], 3);
      return { q: `Perceptron, step activation (1 if sum ≥ 0). x = (${x}), w = (${w}), bias = ${b}. Find the output. Target is y = ${y}, α = 0.1: find the new w1.`,
        labels: ["Output", "New w1"], answers: [N(h, 0), N(nw1, 0.001)],
        steps: ST([
          `Weighted sum = w1·x1 + w2·x2 + bias = ${w[0]}×${x[0]} + ${w[1]}×${x[1]} + ${b}.`,
          `= ${rd(w[0] * x[0], 3)} + ${rd(w[1] * x[1], 3)} + ${b} = <b>${s}</b>.`,
          `Step activation: ${s} ${s >= 0 ? "≥" : "&lt;"} 0, so output h = <b>${h}</b>.`,
          `Error = target − output = ${y} − ${h} = ${y - h}.`,
          `Update rule: w1 ← w1 + α·(y − h)·x1 = ${w[0]} + 0.1 × ${y - h} × ${x[0]}.`,
          `= ${w[0]} + ${rd(0.1 * (y - h) * x[0], 3)} = <b>${nw1}</b>.`],
          x[0] === 0 ? "x1 = 0 here, so w1 does not change: a weight only learns when its input is non-zero." : "the update uses the INPUT x1, not the weight. If the output was already right, nothing changes.") };
  }},
  { id: "sigmoid", topic: "l5", name: "Forward pass through a small network", make(r) {
      const x = [ri(r, 0, 2), ri(r, 0, 2)]; const w13 = rd(ri(r, -5, 5) / 10, 1), w23 = rd(ri(r, -5, 5) / 10, 1), w35 = rd(ri(r, 5, 15) / 10, 1);
      const in3 = rd(w13 * x[0] + w23 * x[1], 3); const a3 = Math.max(0, in3); const out = 1 / (1 + Math.exp(-w35 * a3));
      return { q: `x1 = ${x[0]}, x2 = ${x[1]}. Hidden unit 3 uses ReLU with w1,3 = ${w13}, w2,3 = ${w23} (no bias). Output unit 5 uses sigmoid with w3,5 = ${w35} (no bias). Find a3 and the output (4 d.p.).`,
        labels: ["a3", "Output"], answers: [N(rd(a3, 4), 0.0006), N(rd(out), 0.0006)],
        steps: ST([
          `Hidden unit 3, weighted sum: in3 = w1,3·x1 + w2,3·x2 = ${w13}×${x[0]} + ${w23}×${x[1]} = <b>${in3}</b>.`,
          `ReLU: a3 = max(0, ${in3}) = <b>${rd(a3, 4)}</b>${in3 < 0 ? " (negative becomes 0)" : ""}.`,
          `Output unit 5, weighted sum: in5 = w3,5·a3 = ${w35} × ${rd(a3, 4)} = <b>${rd(w35 * a3)}</b>.`,
          `Sigmoid: σ(z) = 1 / (1 + e^(−z)). e^(−${rd(w35 * a3)}) = ${rd(Math.exp(-w35 * a3))}.`,
          `Output = 1 / (1 + ${rd(Math.exp(-w35 * a3))}) = <b>${rd(out)}</b>.`],
          "apply the activation at EVERY unit before passing the value on. σ(0) = 0.5, so an output of 0.5 means in5 was 0.") };
  }},
  { id: "qvalue", topic: "l6", name: "Q-value of a q-state", make(r) {
      const U = [rd(r(), 2), rd(r(), 2), rd(r(), 2)]; const R = pick(r, [0, -0.04, -0.1]); const g = pick(r, [1, 0.9, 0.5]);
      const Q = 0.8 * (R + g * U[0]) + 0.1 * (R + g * U[1]) + 0.1 * (R + g * U[2]);
      return { q: `Action a in state s: 0.8 → s1 (U = ${U[0]}), 0.1 → s2 (U = ${U[1]}), 0.1 → s3 (U = ${U[2]}). Reward per transition R = ${R}, γ = ${g}. Find Q(s, a) (4 d.p.).`,
        answers: [N(rd(Q), 0.0006)], steps: ST([
          `Formula: Q(s, a) = Σ P(s′) × [R + γ·U(s′)], one term per outcome.`,
          `Outcome s1 (0.8): R + γU = ${R} + ${g}×${U[0]} = ${rd(R + g * U[0])}. × 0.8 = ${rd(0.8 * (R + g * U[0]))}.`,
          `Outcome s2 (0.1): ${R} + ${g}×${U[1]} = ${rd(R + g * U[1])}. × 0.1 = ${rd(0.1 * (R + g * U[1]))}.`,
          `Outcome s3 (0.1): ${R} + ${g}×${U[2]} = ${rd(R + g * U[2])}. × 0.1 = ${rd(0.1 * (R + g * U[2]))}.`,
          `Add: Q = ${rd(0.8 * (R + g * U[0]))} + ${rd(0.1 * (R + g * U[1]))} + ${rd(0.1 * (R + g * U[2]))} = <b>${rd(Q)}</b>.`],
          "the probabilities must add to 1 (0.8 + 0.1 + 0.1). Apply γ to U only, not to R.") };
  }},
  { id: "policy", topic: "l6", name: "Policy improvement (pick best action)", make(r) {
      const acts = ["Up", "Right"]; const U = { A: rd(r(), 2), B: rd(r(), 2), C: rd(r(), 2) };
      const q1 = 0.8 * U.A + 0.1 * U.B + 0.1 * U.C, q2 = 0.8 * U.B + 0.1 * U.A + 0.1 * U.C;
      const best = q1 >= q2 ? 0 : 1;
      return { q: `γ = 1, R = 0. Up: 0.8 → A, 0.1 → B, 0.1 → C. Right: 0.8 → B, 0.1 → A, 0.1 → C. Current U: A = ${U.A}, B = ${U.B}, C = ${U.C}. Find Q(Up) and Q(Right) (3 d.p.). The improved policy picks the larger.`,
        labels: ["Q(Up)", "Q(Right)"], answers: [N(rd(q1, 3), 0.0015), N(rd(q2, 3), 0.0015)],
        steps: ST([
          `With R = 0 and γ = 1, Q(action) = Σ P(s′)·U(s′).`,
          `Q(Up) = 0.8×U(A) + 0.1×U(B) + 0.1×U(C) = 0.8×${U.A} + 0.1×${U.B} + 0.1×${U.C} = ${rd(0.8 * U.A, 3)} + ${rd(0.1 * U.B, 3)} + ${rd(0.1 * U.C, 3)} = <b>${rd(q1, 3)}</b>.`,
          `Q(Right) = 0.8×U(B) + 0.1×U(A) + 0.1×U(C) = 0.8×${U.B} + 0.1×${U.A} + 0.1×${U.C} = ${rd(0.8 * U.B, 3)} + ${rd(0.1 * U.A, 3)} + ${rd(0.1 * U.C, 3)} = <b>${rd(q2, 3)}</b>.`,
          `Policy improvement picks the action with the larger Q: ${rd(q1, 3)} vs ${rd(q2, 3)} → π(s) = <b>${acts[best]}</b>.`],
          "use the CURRENT U values. Policy improvement uses max (argmax), policy evaluation does not.") };
  }},
  { id: "td", topic: "l6", name: "TD and Q-learning updates", make(r) {
      const U = rd(r(), 2), U2 = rd(r(), 2), R = pick(r, [-0.04, 0, 1, -1]), g = pick(r, [0.9, 1, 0.5]), a = pick(r, [0.1, 0.5, 0.2]);
      const nu = U + a * (R + g * U2 - U); const Q = rd(r() * 3, 2), mq = rd(r() * 3, 2); const nq = Q + a * (R + g * mq - Q);
      return { q: `TD: U(s) = ${U}, U(s') = ${U2}, R = ${R}, γ = ${g}, α = ${a}. Find new U(s).<br>Q-learning: Q(s,a) = ${Q}, max Q(s',a') = ${mq}, same R, γ, α. Find new Q(s,a). (4 d.p.)`,
        labels: ["New U(s)", "New Q(s,a)"], answers: [N(rd(nu), 0.0006), N(rd(nq), 0.0006)],
        steps: ST([
          `TD update: U(s) ← U(s) + α × [R + γ·U(s′) − U(s)].`,
          `TD target = R + γ·U(s′) = ${R} + ${g}×${U2} = ${rd(R + g * U2)}.`,
          `TD error = target − old = ${rd(R + g * U2)} − ${U} = ${rd(R + g * U2 - U)}.`,
          `New U(s) = ${U} + ${a} × ${rd(R + g * U2 - U)} = ${U} + ${rd(a * (R + g * U2 - U))} = <b>${rd(nu)}</b>.`,
          `Q-learning update: Q(s,a) ← Q(s,a) + α × [R + γ·max Q(s′,a′) − Q(s,a)].`,
          `Target = ${R} + ${g}×${mq} = ${rd(R + g * mq)}. Error = ${rd(R + g * mq)} − ${Q} = ${rd(R + g * mq - Q)}.`,
          `New Q = ${Q} + ${a} × ${rd(R + g * mq - Q)} = ${Q} + ${rd(a * (R + g * mq - Q))} = <b>${rd(nq)}</b>.`],
          "α multiplies only the ERROR, not the whole target. The new value moves a fraction α of the way from old to target.") };
  }},
  { id: "sarsa", topic: "l6", name: "SARSA vs Q-learning update (Q(s,a))", make(r) {
      const Q = rd(r() * 2, 2), R = pick(r, [-1, 0, 1, 2]), g = pick(r, [0.9, 0.8, 0.5]), a = pick(r, [0.1, 0.2, 0.5]);
      const mq = rd(0.5 + r() * 2, 2), tq = rd(mq - 0.2 - r() * 0.8, 2);
      const ts = R + g * tq, tq2 = R + g * mq, ns = Q + a * (ts - Q), nq = Q + a * (tq2 - Q);
      return { q: `Q(s,a) = ${Q}, reward r = ${R}, γ = ${g}, α = ${a}. In s′ the agent actually takes a′ with Q(s′,a′) = ${tq}, but the best action in s′ has Q = ${mq}. Find the new Q(s,a) with SARSA and with Q-learning (4 d.p.).`,
        labels: ["SARSA", "Q-learning"], answers: [N(rd(ns), 0.0006), N(rd(nq), 0.0006)],
        steps: ST([
          `Both use Q(s,a) ← Q(s,a) + α [r + γ·Q(next) − Q(s,a)]. Only Q(next) is different.`,
          `SARSA (on-policy) uses the action it TOOK: Q(next) = ${tq}. Target = ${R} + ${g}×${tq} = ${rd(ts)}. Error = ${rd(ts)} − ${Q} = ${rd(ts - Q)}.`,
          `SARSA new Q = ${Q} + ${a}×${rd(ts - Q)} = <b>${rd(ns)}</b>.`,
          `Q-learning (off-policy) uses the BEST action: Q(next) = ${mq}. Target = ${R} + ${g}×${mq} = ${rd(tq2)}. Error = ${rd(tq2)} − ${Q} = ${rd(tq2 - Q)}.`,
          `Q-learning new Q = ${Q} + ${a}×${rd(tq2 - Q)} = <b>${rd(nq)}</b>.`],
          "SARSA = State, Action, Reward, State, Action: it needs the NEXT action actually chosen. Q-learning always takes the max.") };
  }},
  { id: "qtable", topic: "l6", name: "Q-table: V(s), greedy action, ε-greedy probabilities", make(r) {
      const acts = ["Up", "Down", "Left", "Right"]; const qv = acts.map(() => rd(r() * 2 - 0.5, 2));
      const best = qv.indexOf(Math.max(...qv)); const eps = pick(r, [0.1, 0.2, 0.3, 0.4]); const n = 4;
      const pg = 1 - eps + eps / n, po = eps / n;
      return { q: `Q-table row for state s: ${acts.map((x, k) => `Q(s,${x}) = ${qv[k]}`).join(", ")}. Find V(s). Then with ε-greedy, ε = ${eps} (the random pick is over all 4 actions), find P(greedy action) and P(one specific other action).`,
        labels: ["V(s)", "P(greedy)", "P(other)"], answers: [N(qv[best], 0.0006), N(rd(pg), 0.0006), N(rd(po), 0.0006)],
        steps: ST([
          `V(s) = max over a of Q(s,a). Biggest of ${qv.join(", ")} is <b>${qv[best]}</b>, so the greedy action is <b>${acts[best]}</b> (argmax).`,
          `ε-greedy: with prob 1 − ε = ${rd(1 - eps)} take the greedy action. With prob ε = ${eps} pick at random, each action getting ε/4 = ${rd(po)}.`,
          `P(greedy) = ${rd(1 - eps)} + ${rd(po)} = <b>${rd(pg)}</b>.`,
          `P(one other action) = ε/4 = <b>${rd(po)}</b>. Check: ${rd(pg)} + 3×${rd(po)} = 1.`],
          "max = the value V(s), argmax = the action. If the random pick excludes the greedy action, use 1 − ε and ε/3 instead.") };
  }},
  { id: "qstoch", topic: "l6", name: "Q(s,a) with transition rewards: compare two actions", make(r) {
      const g = pick(r, [0.9, 0.8, 1]);
      const mk = () => { const p = pick(r, [0.6, 0.7, 0.8]); return [[p, ri(r, -2, 3), ri(r, 0, 10)], [rd(1 - p, 1), ri(r, -3, 1), ri(r, 0, 10)]]; };
      const A = mk(), B = mk(); const q = o => o.reduce((s, [p, R, V]) => s + p * (R + g * V), 0);
      const qa = q(A), qb = q(B); const desc = o => o.map(([p, R, V], k) => `${p} → s${k + 1} (R = ${R}, V = ${V})`).join(", ");
      const line = o => o.map(([p, R, V]) => `${p}(${R} + ${g}×${V}) = ${p}×${rd(R + g * V)} = ${rd(p * (R + g * V))}`).join("; ");
      return { q: `γ = ${g}. Action a1: ${desc(A)}. Action a2: ${desc(B)}. Use Q(s,a) = Σ P(s′)[R + γV(s′)]. Find Q(s,a1) and Q(s,a2) (4 d.p.). Which action is optimal?`,
        labels: ["Q(s,a1)", "Q(s,a2)"], answers: [N(rd(qa), 0.0006), N(rd(qb), 0.0006)],
        steps: ST([
          `One bracket per outcome: P × (R + γ·V(s′)), then add.`,
          `a1: ${line(A)}. Sum = <b>${rd(qa)}</b>.`,
          `a2: ${line(B)}. Sum = <b>${rd(qb)}</b>.`,
          `Optimal action = argmax → <b>${qa >= qb ? "a1" : "a2"}</b>, and V(s) = ${rd(Math.max(qa, qb))}.`],
          "the reward is inside the bracket, so it is weighted by P too. γ only multiplies V(s′).") };
  }},
  { id: "qchain", topic: "l6", name: "Q-learning over episodes (values flow backwards)", make(r) {
      const R = pick(r, [10, 5, 8, 4]), a = pick(r, [0.5, 0.2, 0.1]), g = pick(r, [1, 0.9, 0.5]);
      const b1 = a * R, a2 = a * (g * b1), b2 = b1 + a * (R - b1);
      return { q: `All Q values start at 0. α = ${a}, γ = ${g}. Every episode: A --right, r = 0--> B --right, r = +${R}--> Goal (terminal). Update in the order visited. Find Q(B,right) after episode 1, then Q(A,right) and Q(B,right) after episode 2 (4 d.p.).`,
        labels: ["Q(B,right) ep 1", "Q(A,right) ep 2", "Q(B,right) ep 2"], answers: [N(rd(b1), 0.0006), N(rd(a2), 0.0006), N(rd(b2), 0.0006)],
        steps: ST([
          `Rule: Q ← Q + α [r + γ max Q(next) − Q]. After a terminal state, max Q(next) = 0.`,
          `Ep 1, (A,right): target = 0 + ${g}×max Q(B,·) = 0 + ${g}×0 = 0, so Q(A,right) stays 0.`,
          `Ep 1, (B,right): target = ${R} (terminal). Q = 0 + ${a}(${R} − 0) = <b>${rd(b1)}</b>.`,
          `Ep 2, (A,right): now max Q(B,·) = ${rd(b1)}. Target = 0 + ${g}×${rd(b1)} = ${rd(g * b1)}. Q = 0 + ${a}(${rd(g * b1)} − 0) = <b>${rd(a2)}</b>.`,
          `Ep 2, (B,right): Q = ${rd(b1)} + ${a}(${R} − ${rd(b1)}) = <b>${rd(b2)}</b>.`],
          "update A BEFORE B within an episode, using B's OLD value. The reward reaches A one episode later.") };
  }},
  { id: "return", topic: "l6", name: "Discounted return", make(r) {
      const rs = [ri(r, -2, 2), ri(r, -2, 2), ri(r, -2, 5), ri(r, 0, 10)]; const g = pick(r, [0.5, 0.9, 0.8]);
      const G = rs.reduce((s, x, i) => s + x * g ** i, 0);
      return { q: `Rewards r1..r4 = ${rs.join(", ")}, γ = ${g}. Discounted return G = r1 + γr2 + γ²r3 + γ³r4 (4 d.p.)?`, answers: [N(rd(G), 0.0006)],
        steps: ST([
          `Formula: G = r1 + γ·r2 + γ²·r3 + γ³·r4. Reward number k is multiplied by γ^(k−1).`,
          `Powers of γ: γ⁰ = 1, γ¹ = ${g}, γ² = ${rd(g ** 2)}, γ³ = ${rd(g ** 3)}.`,
          ...rs.map((x, i) => `r${i + 1} = ${x} × ${rd(g ** i)} = ${rd(x * g ** i)}`),
          `Add: ${rs.map((x, i) => rd(x * g ** i)).join(" + ")} = <b>${rd(G)}</b>.`],
          "the FIRST reward is not discounted (γ⁰ = 1).") };
  }},
  { id: "convsize", topic: "l7", name: "Conv output size and parameter count", make(r) {
      const Nn = pick(r, [7, 9, 28, 32, 64, 227]), K = pick(r, [1, 3, 5]), P = pick(r, [0, 1, 2]), S = pick(r, [1, 2]); const Cin = pick(r, [1, 3, 8, 16]), Cout = pick(r, [2, 4, 8, 16, 32]); const bias = r() < 0.7;
      const out = Math.floor((Nn + 2 * P - K) / S) + 1; const params = (K * K * Cin + (bias ? 1 : 0)) * Cout;
      return { q: `Input ${Nn}×${Nn}×${Cin}. Conv layer: ${Cout} filters of size ${K}×${K}, stride ${S}, padding ${P}, ${bias ? "one bias per filter" : "no bias"}. Find output width and number of trainable parameters.`,
        labels: ["Output width", "Parameters"], answers: [N(out, 0), N(params, 0)],
        steps: ST([
          `Output width formula: ⌊(W + 2P − K) / S⌋ + 1.`,
          `Plug in W = ${Nn}, P = ${P}, K = ${K}, S = ${S}: (${Nn} + ${2 * P} − ${K}) / ${S} = ${Nn + 2 * P - K} / ${S} = ${rd((Nn + 2 * P - K) / S, 2)}.`,
          `Round down${(Nn + 2 * P - K) % S ? "" : " (already whole)"}: ${Math.floor((Nn + 2 * P - K) / S)}. Add 1: output width = <b>${out}</b> (depth = number of filters = ${Cout}).`,
          `Weights in ONE filter = K × K × input channels = ${K} × ${K} × ${Cin} = ${K * K * Cin}.`,
          bias ? `Add 1 bias per filter: ${K * K * Cin} + 1 = ${K * K * Cin + 1} per filter.` : `No bias, so ${K * K * Cin} per filter.`,
          `× ${Cout} filters = <b>${params}</b> parameters.`],
          "the image size does NOT change the parameter count, weights are shared across positions. Each filter covers ALL input channels.") };
  }},
  { id: "convval", topic: "l7", name: "One convolution output value", make(r) {
      const patch = [...Array(9)].map(() => ri(r, 0, 5)); const ker = [...Array(9)].map(() => ri(r, -1, 1)); const b = pick(r, [0, 0, 1]);
      const v = patch.reduce((s, x, i) => s + x * ker[i], 0) + b;
      const m = a => `[${a.slice(0, 3).join(" ")}; ${a.slice(3, 6).join(" ")}; ${a.slice(6).join(" ")}]`;
      return { q: `Patch ${m(patch)}, kernel ${m(ker)}, bias ${b}. Find the output value at this position, then apply ReLU.`, labels: ["Conv value", "After ReLU"],
        answers: [N(v, 0), N(Math.max(0, v), 0)], steps: ST([
          `Lay the kernel on the patch and multiply matching cells (row by row):<br>${patch.map((x, i) => `${x}×${ker[i]} = ${x * ker[i]}`).join(", ")}.`,
          `Add the 9 products: ${patch.map((x, i) => x * ker[i]).join(" + ")} = ${v - b}.`,
          `Add the bias ${b}: ${v - b} + ${b} = <b>${v}</b>.`,
          `ReLU = max(0, ${v}) = <b>${Math.max(0, v)}</b>.`],
          "this is element-wise multiply then sum, not matrix multiplication. Add the bias before ReLU.") };
  }},
  { id: "pool", topic: "l7", name: "Max and average pooling", make(r) {
      const m = [...Array(16)].map(() => ri(r, 0, 9)); const g = (i, j) => m[i * 4 + j];
      const blocks = [[0, 0], [0, 2], [2, 0], [2, 2]].map(([i, j]) => [g(i, j), g(i, j + 1), g(i + 1, j), g(i + 1, j + 1)]);
      const k = ri(r, 0, 3); const names = ["top-left", "top-right", "bottom-left", "bottom-right"];
      return { q: `4×4 feature map (rows): ${[0, 1, 2, 3].map(i => `[${m.slice(i * 4, i * 4 + 4).join(" ")}]`).join(" ")}.<br>2×2 pooling, stride 2. Find the <b>${names[k]}</b> output for max pooling and average pooling.`,
        labels: ["Max", "Average"], answers: [N(Math.max(...blocks[k]), 0), N(blocks[k].reduce((a, b) => a + b) / 4, 0.001)],
        steps: ST([
          `2×2 windows with stride 2 split the 4×4 map into 4 blocks that do not overlap.`,
          `The ${names[k]} block: rows ${k < 2 ? "1–2" : "3–4"}, columns ${k % 2 ? "3–4" : "1–2"} → values ${blocks[k].join(", ")}.`,
          `Max pooling keeps the largest: max(${blocks[k].join(", ")}) = <b>${Math.max(...blocks[k])}</b>.`,
          `Average pooling: (${blocks[k].join(" + ")}) / 4 = ${blocks[k].reduce((a, b) => a + b)} / 4 = <b>${blocks[k].reduce((a, b) => a + b) / 4}</b>.`],
          "pooling has no weights, so 0 trainable parameters.") };
  }},
  { id: "rf", topic: "l7", name: "Receptive field of stacked layers", make(r) {
      const L = []; const n = ri(r, 2, 4);
      for (let i = 0; i < n; i++) L.push(pick(r, [["conv", 3, 1], ["conv", 3, 1], ["conv", 5, 1], ["pool", 2, 2], ["conv", 3, 2]]));
      let rf = 1, j = 1; const st = [];
      L.forEach(([t, k, s]) => { rf = rf + (k - 1) * j; j = j * s; st.push(`${t} ${k}×${k} s${s}: r = ${rf}, jump = ${j}`); });
      return { q: `Layers in order: ${L.map(([t, k, s]) => `${t} ${k}×${k} stride ${s}`).join(" → ")}. What is the receptive field (width) of one unit in the last layer?`,
        answers: [N(rf, 0)], steps: ST([
          `Start with one output unit: r = 1, jump j = 1 (j = how far apart neighbouring units are, in input pixels).`,
          `For each layer: r = r + (K − 1) × j, then j = j × stride.`,
          ...L.map(([t, k, s2], i) => `Layer ${i + 1} (${t} ${k}×${k}, stride ${s2}): ${st[i]}`),
          `Receptive field after the last layer = <b>${rf}</b> (so ${rf} × ${rf}).`],
          "use the jump from BEFORE the layer when you grow r, then update the jump.") };
  }},
  { id: "iou", topic: "l7", name: "IoU and NMS decision", make(r) {
      const A = [ri(r, 0, 3), ri(r, 0, 3)]; A.push(A[0] + ri(r, 3, 6), A[1] + ri(r, 3, 6));
      const B = [ri(r, 1, 5), ri(r, 1, 5)]; B.push(B[0] + ri(r, 3, 6), B[1] + ri(r, 3, 6));
      const iw = Math.max(0, Math.min(A[2], B[2]) - Math.max(A[0], B[0])), ih = Math.max(0, Math.min(A[3], B[3]) - Math.max(A[1], B[1]));
      const I = iw * ih, aA = (A[2] - A[0]) * (A[3] - A[1]), aB = (B[2] - B[0]) * (B[3] - B[1]), U = aA + aB - I, iou = I / U; const th = pick(r, [0.3, 0.4, 0.5]);
      return { q: `Box A: (${A[0]},${A[1]}) to (${A[2]},${A[3]}), score 0.9. Box B: (${B[0]},${B[1]}) to (${B[2]},${B[3]}), score 0.7, same class. Find IoU (4 d.p.). NMS suppresses B if IoU > ${th}: enter 1 if B is suppressed, else 0.`,
        labels: ["IoU", "Suppress B (1/0)"], answers: [N(rd(iou), 0.0006), N(iou > th ? 1 : 0, 0)],
        steps: ST([
          `Area A = (${A[2]} − ${A[0]}) × (${A[3]} − ${A[1]}) = ${A[2] - A[0]} × ${A[3] - A[1]} = ${aA}.`,
          `Area B = (${B[2]} − ${B[0]}) × (${B[3]} − ${B[1]}) = ${B[2] - B[0]} × ${B[3] - B[1]} = ${aB}.`,
          `Overlap width = min(right edges) − max(left edges) = min(${A[2]}, ${B[2]}) − max(${A[0]}, ${B[0]}) = ${Math.min(A[2], B[2]) - Math.max(A[0], B[0])}${iw === 0 ? " → 0 (no overlap)" : ""}.`,
          `Overlap height = min(${A[3]}, ${B[3]}) − max(${A[1]}, ${B[1]}) = ${Math.min(A[3], B[3]) - Math.max(A[1], B[1])}${ih === 0 ? " → 0 (no overlap)" : ""}.`,
          `Intersection = ${iw} × ${ih} = <b>${I}</b>.`,
          `Union = A + B − intersection = ${aA} + ${aB} − ${I} = <b>${U}</b>.`,
          `IoU = ${I} / ${U} = <b>${rd(iou)}</b>.`,
          `NMS: same class, A has the higher score so A is kept. Is IoU ${rd(iou)} &gt; ${th}? ${iou > th ? "Yes → <b>suppress B (1)</b>" : "No → <b>keep B (0)</b>"}.`],
          "subtract the overlap in the union, or it is counted twice. Boxes of a different class are never suppressed.") };
  }},
  { id: "rnn", topic: "l8", name: "Simple RNN hidden-state update", make(r) {
      const x = ri(r, -2, 3), wx = rd(ri(r, 1, 9) / 10, 1), h = rd(ri(r, -5, 9) / 10, 1), wh = pick(r, [0.25, 0.5, 0.75, 0.2]), b = pick(r, [0, 0, 0.1]);
      const s = rd(wx * x + wh * h + b, 3); const t = rd(Math.tanh(s), 3);
      return { q: `Current input x = ${x}, input weight = ${wx}, previous hidden state = ${h}, recurrent weight = ${wh}, bias = ${b}. Activation tanh, and tanh(${s}) = ${t} (lookup). Find the sum before activation and the new hidden state.`,
        labels: ["Sum", "New h"], answers: [N(s, 0.001), N(t, 0.001)],
        steps: ST([
          `Input part: input weight × x = ${wx} × ${x} = ${rd(wx * x, 3)}.`,
          `Memory part: recurrent weight × previous state = ${wh} × ${h} = ${rd(wh * h, 3)}.`,
          `Add both, plus bias ${b}: ${rd(wx * x, 3)} + ${rd(wh * h, 3)} + ${b} = <b>${s}</b>. This is the sum BEFORE activation.`,
          `Apply tanh using the given lookup: h = tanh(${s}) = <b>${t}</b>.`],
          "the sum is not the answer for the new hidden state. Keep x and h(t−1) with their own weights.") };
  }},
  { id: "attn", topic: "l8", name: "Attention weighted value aggregation", make(r) {
      const n = ri(r, 2, 3); let w = [...Array(n)].map(() => ri(r, 1, 6)); const s = w.reduce((a, b) => a + b); w = w.map(x => rd(x / s, 2));
      w[n - 1] = rd(1 - w.slice(0, -1).reduce((a, b) => a + b, 0), 2);
      const V = [...Array(n)].map(() => [ri(r, 0, 5), ri(r, 0, 5)]);
      const o = [0, 1].map(c => rd(V.reduce((acc, v, i) => acc + w[i] * v[c], 0), 3));
      return { q: `Attention weights: ${w.join(", ")}. Value vectors: ${V.map(v => `[${v}]`).join(", ")}. Find the output vector.`,
        labels: ["Component 1", "Component 2"], answers: [N(o[0], 0.002), N(o[1], 0.002)],
        steps: ST([
          `Output = Σ weightᵢ × valueᵢ, done for each component separately.`,
          ...[0, 1].map(c => `Component ${c + 1}: ` + V.map((v, i) => `${w[i]}×${v[c]}`).join(" + ") + ` = ` + V.map((v, i) => rd(w[i] * v[c], 3)).join(" + ") + ` = <b>${o[c]}</b>.`),
          `Output vector = [<b>${o[0]}</b>, <b>${o[1]}</b>]. It has the same length as each value vector.`],
          "use ALL the weights. Don't just pick the vector with the biggest weight, and don't add the values without weights.") };
  }},
  { id: "softmax", topic: "l8", name: "Softmax attention weights", make(r) {
      const sc = [ri(r, 0, 3), ri(r, 0, 3)]; const e = sc.map(Math.exp); const w = e.map(x => x / (e[0] + e[1]));
      return { q: `Two attention scores (already scaled): ${sc.join(" and ")}. Find the softmax weight of the first (4 d.p.).`, answers: [N(rd(w[0]), 0.0006)],
        steps: ST([
          `Softmax: wᵢ = e^(scoreᵢ) / Σ e^(score).`,
          `e^${sc[0]} = ${rd(e[0])}, e^${sc[1]} = ${rd(e[1])}.`,
          `Sum = ${rd(e[0])} + ${rd(e[1])} = ${rd(e[0] + e[1])}.`,
          `w1 = ${rd(e[0])} / ${rd(e[0] + e[1])} = <b>${rd(w[0])}</b>. (w2 = ${rd(w[1])}, and they add to 1.)`],
          "exponentiate first, then divide. Dividing the raw scores by their sum is NOT softmax.") };
  }},
  { id: "nb", topic: "l8", name: "Naive Bayes with Laplace smoothing", make(r) {
      const Tp = ri(r, 15, 30), Tn = ri(r, 15, 30), V = 6, cp = ri(r, 0, 8), cn = ri(r, 0, 8), npos = ri(r, 8, 12), nneg = ri(r, 8, 12);
      const pp = (cp + 1) / (Tp + V), pn = (cn + 1) / (Tn + V); const Sp = npos / (npos + nneg) * pp, Sn = nneg / (npos + nneg) * pn;
      return { q: `${npos} positive and ${nneg} negative reviews. Word "great" appears ${cp} times in positive (T+ = ${Tp}) and ${cn} times in negative (T- = ${Tn}). |V| = ${V}. Text = "great". Find P(great|+) with add-one smoothing and P(+|text) (4 d.p.).`,
        labels: ["P(great|+)", "P(+|text)"], answers: [N(rd(pp), 0.0006), N(rd(Sp / (Sp + Sn)), 0.0006)],
        steps: ST([
          `Add-one (Laplace) smoothing: P(word | class) = (count + 1) / (total words in class + |V|).`,
          `P(great | +) = (${cp} + 1) / (${Tp} + ${V}) = ${cp + 1} / ${Tp + V} = <b>${rd(pp)}</b>.`,
          `P(great | −) = (${cn} + 1) / (${Tn} + ${V}) = ${cn + 1} / ${Tn + V} = ${rd(pn)}.`,
          `Priors: P(+) = ${npos}/${npos + nneg} = ${rd(npos / (npos + nneg))}, P(−) = ${nneg}/${npos + nneg} = ${rd(nneg / (npos + nneg))}.`,
          `Scores: S₊ = P(+)·P(great|+) = ${rd(npos / (npos + nneg))} × ${rd(pp)} = ${rd(Sp, 5)}. S₋ = ${rd(nneg / (npos + nneg))} × ${rd(pn)} = ${rd(Sn, 5)}.`,
          `Normalise: P(+ | text) = S₊ / (S₊ + S₋) = ${rd(Sp, 5)} / ${rd(Sp + Sn, 5)} = <b>${rd(Sp / (Sp + Sn))}</b>.`],
          "add |V| (vocabulary size) to the denominator, not 1. Smoothing stops a zero count wiping out the whole product.") };
  }},
  { id: "bayes", topic: "l11", name: "Bayes' rule (test and disease)", make(r) {
      const pD = pick(r, [0.01, 0.02, 0.05, 0.1]), sens = pick(r, [0.8, 0.9, 0.95, 0.99]), fp = pick(r, [0.02, 0.05, 0.1]);
      const pp = sens * pD + fp * (1 - pD); const post = sens * pD / pp;
      return { q: `P(D) = ${pD}, P(+|D) = ${sens}, P(+|¬D) = ${fp}. Find P(+) and P(D|+) (4 d.p.).`, labels: ["P(+)", "P(D|+)"],
        answers: [N(rd(pp), 0.0006), N(rd(post), 0.0006)], steps: ST([
          `Total probability of a positive test: P(+) = P(+|D)·P(D) + P(+|¬D)·P(¬D).`,
          `P(¬D) = 1 − ${pD} = ${rd(1 - pD, 2)}.`,
          `True positives: ${sens} × ${pD} = ${rd(sens * pD)}. False positives: ${fp} × ${rd(1 - pD, 2)} = ${rd(fp * (1 - pD))}.`,
          `P(+) = ${rd(sens * pD)} + ${rd(fp * (1 - pD))} = <b>${rd(pp)}</b>.`,
          `Bayes: P(D|+) = P(+|D)·P(D) / P(+) = ${rd(sens * pD)} / ${rd(pp)} = <b>${rd(post)}</b>.`],
          "P(D|+) is usually much lower than P(+|D) when the disease is rare (the base rate).") };
  }},
  { id: "bnjoint", topic: "l11", name: "Burglary network joint probability", make(r) {
      const b = r() < 0.5, e = r() < 0.5, a = r() < 0.6, j = r() < 0.6, m = r() < 0.6;
      const PA = { "true,true": 0.95, "true,false": 0.94, "false,true": 0.29, "false,false": 0.001 };
      const pb = b ? 0.001 : 0.999, pe = e ? 0.002 : 0.998, pa0 = PA[b + "," + e], pa = a ? pa0 : 1 - pa0;
      const pj = a ? (j ? 0.9 : 0.1) : (j ? 0.05 : 0.95), pm = a ? (m ? 0.7 : 0.3) : (m ? 0.01 : 0.99);
      const v = pb * pe * pa * pj * pm; const L = (n, t) => (t ? "" : "¬") + n;
      return { q: `Burglary network (P(B)=0.001, P(E)=0.002, P(A|B,E)=.95/.94/.29/.001, P(J|A)=.90/.05, P(M|A)=.70/.01). Find P(${[L("b", b), L("e", e), L("a", a), L("j", j), L("m", m)].join(", ")}). Give it in scientific style, e.g. 0.000628 (3 significant figures).`,
        answers: [{ n: v, tol: Math.abs(v) * 0.01 }], steps: ST([
          `A full joint entry is the product of each node given its parents: P(B)·P(E)·P(A|B,E)·P(J|A)·P(M|A).`,
          `P(${L("b", b)}) = ${pb}${b ? "" : " (1 − 0.001)"}.`,
          `P(${L("e", e)}) = ${pe}${e ? "" : " (1 − 0.002)"}.`,
          `P(${L("a", a)} | ${L("b", b)}, ${L("e", e)}) = ${a ? pa0 : `1 − ${pa0} = ${rd(pa, 3)}`}.`,
          `P(${L("j", j)} | ${L("a", a)}) = ${pj}${j ? "" : " (1 minus the table value)"}.`,
          `P(${L("m", m)} | ${L("a", a)}) = ${pm}${m ? "" : " (1 minus the table value)"}.`,
          `Multiply: ${pb} × ${pe} × ${rd(pa, 3)} × ${pj} × ${pm} = <b>${v.toPrecision(3)}</b>.`],
          "for a FALSE value use 1 minus the table entry. Use the A row that matches the given B and E.") };
  }},
  { id: "cond", topic: "l11", name: "Conditional probability from a joint table", make(r) {
      let v = [ri(r, 5, 30), ri(r, 5, 30), ri(r, 5, 30), ri(r, 5, 30)]; const s = v.reduce((a, b) => a + b); v = v.map(x => x / s); v = v.map(x => rd(x, 3)); v[3] = rd(1 - v[0] - v[1] - v[2], 3);
      const pAB = v[0], pB = v[0] + v[2];
      return { q: `Joint table: P(a, b) = ${v[0]}, P(a, ¬b) = ${v[1]}, P(¬a, b) = ${v[2]}, P(¬a, ¬b) = ${v[3]}. Find P(b) and P(a | b) (4 d.p.).`, labels: ["P(b)", "P(a|b)"],
        answers: [N(rd(pB), 0.0006), N(rd(pAB / pB), 0.0006)], steps: ST([
          `Marginalise to get P(b): add every row where b is true: P(a, b) + P(¬a, b).`,
          `P(b) = ${v[0]} + ${v[2]} = <b>${rd(pB)}</b>.`,
          `Conditional: P(a | b) = P(a, b) / P(b).`,
          `= ${v[0]} / ${rd(pB)} = <b>${rd(pAB / pB)}</b>.`],
          "divide by P(b), the condition, not by P(a).") };
  }},
  { id: "bnenum", topic: "l11", name: "BN enumeration: P(B | calls) with α normalisation", make(r) {
      const pB = pick(r, [0.001, 0.01, 0.02, 0.05]), pE = pick(r, [0.002, 0.01, 0.02]);
      const A = { tt: pick(r, [0.95, 0.9]), tf: pick(r, [0.94, 0.9, 0.85]), ft: pick(r, [0.29, 0.3, 0.2]), ff: pick(r, [0.001, 0.01, 0.05]) };
      const Ja = pick(r, [0.9, 0.8, 0.95]), Jn = pick(r, [0.05, 0.1]), Ma = pick(r, [0.7, 0.6, 0.8]), Mn = pick(r, [0.01, 0.02, 0.05]);
      const ev = pick(r, [[1, 1], [1, 1], [1, 0], [0, 1]]), jv = ev[0], mv = ev[1];
      const pj = a => (a ? (jv ? Ja : 1 - Ja) : (jv ? Jn : 1 - Jn)), pm = a => (a ? (mv ? Ma : 1 - Ma) : (mv ? Mn : 1 - Mn));
      const pa = (b, e) => A[(b ? "t" : "f") + (e ? "t" : "f")];
      const f = x => +x.toFixed(3);
      const inner = (b, e) => pa(b, e) * pj(1) * pm(1) + (1 - pa(b, e)) * pj(0) * pm(0);
      const score = b => (b ? pB : 1 - pB) * (pE * inner(b, 1) + (1 - pE) * inner(b, 0));
      const sB = score(1), sN = score(0), post = sB / (sB + sN);
      const jl = jv ? "j" : "¬j", ml = mv ? "m" : "¬m";
      const line = (b, e) => `${f(pa(b, e))}·${f(pj(1))}·${f(pm(1))} + ${f(1 - pa(b, e))}·${f(pj(0))}·${f(pm(0))}`;
      const show = b => `s<sub>${b ? "B" : "¬B"}</sub> = ${f(b ? pB : 1 - pB)} × { ${pE} [${line(b, 1)}] + ${f(1 - pE)} [${line(b, 0)}] }<br>= ${f(b ? pB : 1 - pB)} × { ${pE} × ${inner(b, 1).toPrecision(4)} + ${f(1 - pE)} × ${inner(b, 0).toPrecision(4)} } = <b>${(b ? sB : sN).toPrecision(4)}</b>`;
      return { q: `Burglary network with CPTs: P(b) = ${pB}, P(e) = ${pE}, P(a | B,E): t,t ${A.tt} &nbsp;t,f ${A.tf} &nbsp;f,t ${A.ft} &nbsp;f,f ${A.ff}, P(j | a) = ${Ja}, P(j | ¬a) = ${Jn}, P(m | a) = ${Ma}, P(m | ¬a) = ${Mn}.<br>Evidence: <b>${jl}, ${ml}</b>. Use enumeration to find the unnormalised scores s<sub>B</sub>, s<sub>¬B</sub> (3 significant figures, e.g. 0.000592) and P(b | ${jl}, ${ml}) (4 d.p.).`,
        labels: ["s<sub>B</sub>", "s<sub>¬B</sub>", `P(b | ${jl}, ${ml})`],
        answers: [{ n: sB, tol: sB * 0.01 }, { n: sN, tol: sN * 0.01 }, N(rd(post), 0.0006)],
        steps: ST([
          `Query P(B | ${jl}, ${ml}). Hidden variables (not query, not evidence): <b>E and A</b>, so sum them out.`,
          `s<sub>B</sub> = P(b) Σ<sub>e</sub> P(e) Σ<sub>a</sub> P(a | b, e) P(${jl} | a) P(${ml} | a). Same for ¬b with P(¬b) and the ¬b rows of the A table.`,
          `Evidence factors: P(${jl} | a) = ${f(pj(1))}, P(${jl} | ¬a) = ${f(pj(0))}, P(${ml} | a) = ${f(pm(1))}, P(${ml} | ¬a) = ${f(pm(0))}.`,
          `Inner sum over A for B = true:<br>e: ${line(1, 1)} = ${inner(1, 1).toPrecision(4)}<br>¬e: ${line(1, 0)} = ${inner(1, 0).toPrecision(4)}`,
          `${show(1)}`,
          `Inner sum over A for B = false:<br>e: ${line(0, 1)} = ${inner(0, 1).toPrecision(4)}<br>¬e: ${line(0, 0)} = ${inner(0, 0).toPrecision(4)}`,
          `${show(0)}`,
          `Normalise (α = 1 / sum): P(b | ${jl}, ${ml}) = ${sB.toPrecision(4)} / (${sB.toPrecision(4)} + ${sN.toPrecision(4)}) = ${sB.toPrecision(4)} / ${(sB + sN).toPrecision(4)} = <b>${rd(post)}</b>.`],
          (jv && mv ? "" : `for a false call use 1 minus the table value, e.g. P(¬m | a) = 1 − ${Ma} = ${f(1 - Ma)}. `) + "In the second term of each inner sum EVERY factor with A switches to ¬a.") };
  }},
  { id: "marg", topic: "l11", name: "Marginalise and condition from a 3-variable joint table", make(r) {
      let w = Array.from({ length: 8 }, () => ri(r, 3, 20)); const s = w.reduce((a, b) => a + b);
      let v = w.map(x => Math.round(x / s * 100)); const big = v.indexOf(Math.max(...v)); v[big] += 100 - v.reduce((a, b) => a + b); v = v.map(x => x / 100);
      const rows = []; let k = 0; for (const x of [1, 2]) for (const y of [1, 2]) for (const z of [1, 2]) rows.push({ x, y, z, p: v[k++] });
      const qx = ri(r, 1, 2), qz = ri(r, 1, 2);
      const sel = fn => rows.filter(fn), sum = a => rd(a.reduce((t, o) => t + o.p, 0), 4), lst = a => a.map(o => o.p).join(" + ");
      const rX = sel(o => o.x === qx), rZ = sel(o => o.z === qz), rXZ = sel(o => o.x === qx && o.z === qz);
      const pX = sum(rX), pZ = sum(rZ), pXZ = sum(rXZ);
      const tbl = `<table class="tbl"><tr><th>X</th><th>Y</th><th>Z</th><th>P</th></tr>${rows.map(o => `<tr><td>x${o.x}</td><td>y${o.y}</td><td>z${o.z}</td><td>${o.p}</td></tr>`).join("")}</table>`;
      return { q: `Full joint table:${tbl}Find P(X = x${qx}), P(Z = z${qz}) and P(X = x${qx} | Z = z${qz}) (4 d.p.).`,
        labels: [`P(x${qx})`, `P(z${qz})`, `P(x${qx} | z${qz})`], answers: [N(pX, 0.0006), N(pZ, 0.0006), N(rd(pXZ / pZ), 0.0006)],
        steps: ST([
          `Marginalise: keep the rows with the value you want, then add over every other variable.`,
          `P(x${qx}): rows with X = x${qx} → ${lst(rX)} = <b>${pX}</b>.`,
          `P(z${qz}): rows with Z = z${qz} → ${lst(rZ)} = <b>${pZ}</b>.`,
          `Joint P(x${qx}, z${qz}): rows with BOTH → ${lst(rXZ)} = ${pXZ}.`,
          `Conditional: P(x${qx} | z${qz}) = P(x${qx}, z${qz}) / P(z${qz}) = ${pXZ} / ${pZ} = <b>${rd(pXZ / pZ)}</b>.`],
          "for the conditional, divide by the probability of the GIVEN part (z), not the whole table.") };
  }},
  { id: "probrules", topic: "l11", name: "Probability rules: NOT, AND, OR, GIVEN", make(r) {
      const pA = pick(r, [0.2, 0.3, 0.4, 0.5, 0.6]), pB = pick(r, [0.1, 0.25, 0.3, 0.45, 0.7]);
      const and = pA * pB, or = pA + pB - and;
      return { q: `A and B are <b>independent</b>. P(A) = ${pA}, P(B) = ${pB}. Find P(¬A), P(A ∧ B), P(A ∨ B) and P(A | B) (4 d.p.).`,
        labels: ["P(¬A)", "P(A ∧ B)", "P(A ∨ B)", "P(A | B)"], answers: [N(rd(1 - pA)), N(rd(and)), N(rd(or)), N(rd(pA))],
        steps: ST([
          `NOT: P(¬A) = 1 − P(A) = 1 − ${pA} = <b>${rd(1 - pA)}</b>.`,
          `AND: A and B are independent, so multiply: P(A ∧ B) = ${pA} × ${pB} = <b>${rd(and)}</b>.`,
          `OR: add, then subtract the overlap so it isn't counted twice: P(A ∨ B) = ${pA} + ${pB} − ${rd(and)} = <b>${rd(or)}</b>.`,
          `GIVEN: P(A | B) = P(A ∧ B) / P(B) = ${rd(and)} / ${pB} = <b>${rd(pA)}</b>.`,
          `This equals P(A), which is exactly what independence means: knowing B tells you nothing about A.`],
          "multiply for AND only when the events are independent. Subtract the overlap for OR.") };
  }},
  { id: "bayes3", topic: "l11", name: "Bayes with several causes (total probability)", make(r) {
      let sh = pick(r, [[0.5, 0.3, 0.2], [0.6, 0.3, 0.1], [0.4, 0.35, 0.25], [0.45, 0.35, 0.2]]);
      const df = [pick(r, [0.01, 0.02, 0.03]), pick(r, [0.02, 0.04, 0.05]), pick(r, [0.05, 0.06, 0.08])];
      const k = ri(r, 0, 2); const parts = sh.map((s, i) => s * df[i]); const pD = parts.reduce((a, b) => a + b);
      return { q: `Machines M1, M2, M3 make ${sh.map(x => Math.round(x * 100) + "%").join(", ")} of all parts. Their defect rates are ${df.map(x => Math.round(x * 100) + "%").join(", ")}. A random part is defective. Find P(defective) and P(M${k + 1} | defective) (4 d.p.).`,
        labels: ["P(defective)", `P(M${k + 1} | defective)`], answers: [N(rd(pD), 0.0006), N(rd(parts[k] / pD), 0.0006)],
        steps: ST([
          `Each machine's share of defective parts = P(Mᵢ) × P(D | Mᵢ):<br>` + sh.map((x, i) => `M${i + 1}: ${x} × ${df[i]} = ${rd(parts[i], 4)}`).join("<br>"),
          `Total probability (add every cause): P(D) = ${parts.map(x => rd(x, 4)).join(" + ")} = <b>${rd(pD)}</b>.`,
          `Bayes for M${k + 1}: P(M${k + 1} | D) = P(D | M${k + 1}) P(M${k + 1}) / P(D).`,
          `= ${rd(parts[k], 4)} / ${rd(pD)} = <b>${rd(parts[k] / pD)}</b>.`,
          `Check: the three P(Mᵢ | D) values (` + parts.map(x => rd(x / pD, 3)).join(", ") + `) add up to 1.`],
          "the numerator is that machine's own share, the denominator is the total from step 2.") };
  }},
  { id: "bayesneg", topic: "l11", name: "Bayes: diagnostic direction with a negative result", make(r) {
      const pD = pick(r, [0.05, 0.1, 0.2, 0.3]), sens = pick(r, [0.8, 0.85, 0.9]), spec = pick(r, [0.9, 0.95, 0.97]);
      const pNeg = (1 - sens) * pD + spec * (1 - pD), post = (1 - sens) * pD / pNeg;
      return { q: `Disease prior P(d) = ${pD}. Symptom test: P(s | d) = ${sens}, P(¬s | ¬d) = ${spec}. A patient shows <b>no symptom</b> (¬s). Find P(¬s) and P(d | ¬s) (4 d.p.).`,
        labels: ["P(¬s)", "P(d | ¬s)"], answers: [N(rd(pNeg), 0.0006), N(rd(post), 0.0006)],
        steps: ST([
          `We are given the causal direction P(s | d) and want the diagnostic one P(d | ¬s). Use Bayes.`,
          `Turn the given values into the ones for ¬s: P(¬s | d) = 1 − ${sens} = ${rd(1 - sens, 3)}. P(¬s | ¬d) = ${spec} (given). P(¬d) = 1 − ${pD} = ${rd(1 - pD, 3)}.`,
          `Total probability: P(¬s) = P(¬s | d)P(d) + P(¬s | ¬d)P(¬d) = ${rd(1 - sens, 3)}×${pD} + ${spec}×${rd(1 - pD, 3)} = ${rd((1 - sens) * pD, 5)} + ${rd(spec * (1 - pD), 5)} = <b>${rd(pNeg)}</b>.`,
          `Bayes: P(d | ¬s) = P(¬s | d)P(d) / P(¬s) = ${rd((1 - sens) * pD, 5)} / ${rd(pNeg)} = <b>${rd(post)}</b>.`],
          "for a NEGATIVE observation use 1 − P(s | d), not P(s | d) itself.") };
  }},
  { id: "logic", topic: "l10", name: "Evaluate a logic sentence", make(r) {
      const P = r() < 0.5, Q = r() < 0.5, R = r() < 0.5; const imp = (a, b) => !a || b;
      const forms = [
        ["¬P ∨ Q ∧ R ⇒ R", () => imp((!P) || (Q && R), R), "((¬P) ∨ (Q ∧ R)) ⇒ R"],
        ["P ⇒ Q ⇔ ¬Q ⇒ ¬P", () => imp(P, Q) === imp(!Q, !P), "(P ⇒ Q) ⇔ (¬Q ⇒ ¬P)"],
        ["P ∧ ¬Q ⇒ R", () => imp(P && !Q, R), "(P ∧ (¬Q)) ⇒ R"],
        ["¬(P ∨ Q) ⇔ ¬P ∧ ¬Q", () => (!(P || Q)) === ((!P) && (!Q)), "(¬(P ∨ Q)) ⇔ ((¬P) ∧ (¬Q))"],
        ["P ⇒ Q ∧ R", () => imp(P, Q && R), "P ⇒ (Q ∧ R)"]];
      const f = pick(r, forms); const v = f[1]();
      const T = x => x ? "T" : "F";
      return { q: `P = ${T(P)}, Q = ${T(Q)}, R = ${T(R)}. Is <b>${f[0]}</b> true? Enter 1 for true, 0 for false.`, answers: [N(v ? 1 : 0, 0)],
        steps: ST([
          `Precedence, highest first: ¬, ∧, ∨, ⇒, ⇔. Add brackets: <b>${f[2]}</b>.`,
          `Substitute P = ${T(P)}, Q = ${T(Q)}, R = ${T(R)} and work from the innermost brackets out.`,
          `Rules: ¬ flips. ∧ is T only if both are T. ∨ is T if either is T. A ⇒ B is F only when A = T and B = F. A ⇔ B is T when both sides match.`,
          `Result: <b>${v ? "True (enter 1)" : "False (enter 0)"}</b>.`],
          "⇒ with a false left side is always TRUE.") };
  }}
  ];
})();
