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
        steps: `${alg}: f = ${alg === "A*" ? "g + h" : alg === "UCS" ? "g" : "h"}.<br>` + nodes.map(x => `${x.n}: f = ${f(x)}`).join("<br>") + `<br>Lowest: <b>${best.n}</b>, f = ${f(best)}.`, choice: idx };
  }},
  { id: "entropy", topic: "l4", name: "Entropy and Gini of a node", make(r) {
      const p = ri(r, 0, 8), n = ri(r, 1, 8);
      return { q: `A node has <b>${p}</b> positive and <b>${n}</b> negative examples. Find the entropy (bits) and the Gini index (4 d.p.).`,
        labels: ["Entropy", "Gini"], answers: [N(rd(H(p, n)), 0.0006), N(rd(G(p, n)), 0.0006)],
        steps: `p+ = ${p}/${p + n} = ${rd(p / (p + n))}, p- = ${rd(n / (p + n))}<br>H = -p+ log2 p+ - p- log2 p- = <b>${rd(H(p, n))}</b><br>Gini = 1 - p+² - p-² = <b>${rd(G(p, n))}</b>` };
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
        steps: `H(parent) = ${rd(H(P, Nn))}, Gini(parent) = ${rd(G(P, Nn))}<br>` + kids.map((c, i) => `v${i + 1}: weight ${c[0] + c[1]}/${T}, H = ${rd(H(c[0], c[1]))}, Gini = ${rd(G(c[0], c[1]))}`).join("<br>") +
          `<br>Remainder = ${rd(rem)} → IG = ${rd(H(P, Nn))} - ${rd(rem)} = <b>${rd(ig)}</b><br>Weighted Gini = ${rd(wg)} → reduction = <b>${rd(gr)}</b>` };
  }},
  { id: "sa", topic: "l3", name: "Simulated annealing acceptance", make(r) {
      const dE = ri(r, 1, 10), T = pick(r, [1, 2, 4, 5, 8, 10, 20]); const p = Math.exp(-dE / T); const rr = rd(r(), 2);
      return { q: `Minimising energy. Current E = ${20}, neighbour E = ${20 + dE}, temperature T = ${T}. Find the acceptance probability p (4 d.p.). The random number drawn is r = ${rr}. Enter 1 if the move is accepted, 0 if not.`,
        labels: ["p", "Accept (1/0)"], answers: [N(rd(p), 0.0006), N(rr < p ? 1 : 0, 0)],
        steps: `ΔE = ${20 + dE} - 20 = ${dE} (worse)<br>p = e^(-ΔE/T) = e^(-${dE}/${T}) = <b>${rd(p)}</b><br>r = ${rr} ${rr < p ? "<" : "≥"} p → <b>${rr < p ? "accept" : "reject"}</b>` };
  }},
  { id: "roulette", topic: "l3", name: "GA roulette wheel probability", make(r) {
      const f = [ri(r, 5, 30), ri(r, 5, 30), ri(r, 5, 30), ri(r, 5, 30)]; const T = f.reduce((a, b) => a + b); const i = ri(r, 0, 3);
      return { q: `Fitness values: x1 = ${f[0]}, x2 = ${f[1]}, x3 = ${f[2]}, x4 = ${f[3]}. Probability that <b>x${i + 1}</b> is selected by roulette wheel (4 d.p.)?`,
        answers: [N(rd(f[i] / T), 0.0006)], steps: `Total = ${T}. P = ${f[i]}/${T} = <b>${rd(f[i] / T)}</b>` };
  }},
  { id: "sse", topic: "l4", name: "Squared error loss and gradient step", make(r) {
      const w0 = ri(r, -2, 2), w1 = ri(r, 1, 3); const xs = [1, 2, 3]; const ys = xs.map(x => w0 + w1 * x + ri(r, -2, 2));
      const preds = xs.map(x => w0 + w1 * x); const L = xs.reduce((s, x, i) => s + (ys[i] - preds[i]) ** 2, 0);
      return { q: `Model h(x) = ${w0} + ${w1}x. Data: ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(", ")}. Find the sum of squared errors.`,
        answers: [N(L, 0)], steps: xs.map((x, i) => `x=${x}: h = ${preds[i]}, error = ${ys[i]} - ${preds[i]} = ${ys[i] - preds[i]}, squared = ${(ys[i] - preds[i]) ** 2}`).join("<br>") + `<br>Loss = <b>${L}</b>` };
  }},
  { id: "knn", topic: "l4", name: "KNN distance and vote", make(r) {
      const q = [ri(r, 0, 6), ri(r, 0, 6)]; const pts = []; const labs = ["A", "B"];
      for (let i = 0; i < 5; i++) pts.push({ x: ri(r, 0, 8), y: ri(r, 0, 8), l: pick(r, labs) });
      const d = pts.map(p => ({ ...p, d: Math.sqrt((p.x - q[0]) ** 2 + (p.y - q[1]) ** 2) })).sort((a, b) => a.d - b.d);
      const top = d.slice(0, 3); const cA = top.filter(p => p.l === "A").length;
      return { q: `Query point (${q[0]}, ${q[1]}). Training points: ${pts.map(p => `(${p.x}, ${p.y}) ${p.l}`).join("; ")}.<br>Using Euclidean distance and k = 3, how many of the 3 nearest neighbours are class A? (Then predict the class by majority.)`,
        answers: [N(cA, 0)], steps: d.map(p => `(${p.x},${p.y}) ${p.l}: d = ${rd(p.d, 3)}`).join("<br>") + `<br>3 nearest: ${top.map(p => p.l).join(", ")} → ${cA} A → predict <b>${cA >= 2 ? "A" : "B"}</b>` };
  }},
  { id: "metrics", topic: "l4", name: "Precision, recall, F1", make(r) {
      const TP = ri(r, 20, 60), FP = ri(r, 2, 20), FN = ri(r, 2, 20), TN = ri(r, 20, 60);
      const P = TP / (TP + FP), R = TP / (TP + FN), F = 2 * P * R / (P + R), A = (TP + TN) / (TP + TN + FP + FN);
      return { q: `TP = ${TP}, FP = ${FP}, FN = ${FN}, TN = ${TN}. Find accuracy, precision, recall and F1 (3 d.p.).`, labels: ["Accuracy", "Precision", "Recall", "F1"],
        answers: [N(rd(A, 3), 0.0015), N(rd(P, 3), 0.0015), N(rd(R, 3), 0.0015), N(rd(F, 3), 0.0015)],
        steps: `Accuracy = (TP+TN)/All = ${rd(A, 3)}<br>Precision = TP/(TP+FP) = ${rd(P, 3)}<br>Recall = TP/(TP+FN) = ${rd(R, 3)}<br>F1 = 2PR/(P+R) = ${rd(F, 3)}` };
  }},
  { id: "perceptron", topic: "l5", name: "Perceptron output and update", make(r) {
      const x = [ri(r, 0, 2), ri(r, 0, 2)], w = [rd(ri(r, -10, 10) / 10, 1), rd(ri(r, -10, 10) / 10, 1)], b = rd(ri(r, -5, 5) / 10, 1);
      const s = rd(w[0] * x[0] + w[1] * x[1] + b, 3); const h = s >= 0 ? 1 : 0; const y = 1 - h; const a = 0.1;
      const nw1 = rd(w[0] + a * (y - h) * x[0], 3);
      return { q: `Perceptron, step activation (1 if sum ≥ 0). x = (${x}), w = (${w}), bias = ${b}. Find the output. Target is y = ${y}, α = 0.1: find the new w1.`,
        labels: ["Output", "New w1"], answers: [N(h, 0), N(nw1, 0.001)],
        steps: `Sum = ${w[0]}×${x[0]} + ${w[1]}×${x[1]} + ${b} = ${s} → output <b>${h}</b><br>w1 ← w1 + α(y - h)x1 = ${w[0]} + 0.1×(${y} - ${h})×${x[0]} = <b>${nw1}</b>` };
  }},
  { id: "sigmoid", topic: "l5", name: "Forward pass through a small network", make(r) {
      const x = [ri(r, 0, 2), ri(r, 0, 2)]; const w13 = rd(ri(r, -5, 5) / 10, 1), w23 = rd(ri(r, -5, 5) / 10, 1), w35 = rd(ri(r, 5, 15) / 10, 1);
      const in3 = rd(w13 * x[0] + w23 * x[1], 3); const a3 = Math.max(0, in3); const out = 1 / (1 + Math.exp(-w35 * a3));
      return { q: `x1 = ${x[0]}, x2 = ${x[1]}. Hidden unit 3 uses ReLU with w1,3 = ${w13}, w2,3 = ${w23} (no bias). Output unit 5 uses sigmoid with w3,5 = ${w35} (no bias). Find a3 and the output (4 d.p.).`,
        labels: ["a3", "Output"], answers: [N(rd(a3, 4), 0.0006), N(rd(out), 0.0006)],
        steps: `in3 = ${w13}×${x[0]} + ${w23}×${x[1]} = ${in3} → a3 = ReLU = <b>${rd(a3, 4)}</b><br>in5 = ${w35}×${rd(a3, 4)} = ${rd(w35 * a3)} → σ = 1/(1+e^-in5) = <b>${rd(out)}</b>` };
  }},
  { id: "qvalue", topic: "l6", name: "Q-value of a q-state", make(r) {
      const U = [rd(r(), 2), rd(r(), 2), rd(r(), 2)]; const R = pick(r, [0, -0.04, -0.1]); const g = pick(r, [1, 0.9, 0.5]);
      const Q = 0.8 * (R + g * U[0]) + 0.1 * (R + g * U[1]) + 0.1 * (R + g * U[2]);
      return { q: `Action a in state s: 0.8 → s1 (U = ${U[0]}), 0.1 → s2 (U = ${U[1]}), 0.1 → s3 (U = ${U[2]}). Reward per transition R = ${R}, γ = ${g}. Find Q(s, a) (4 d.p.).`,
        answers: [N(rd(Q), 0.0006)], steps: `Q = Σ P [R + γU(s')]<br>= 0.8(${R} + ${g}×${U[0]}) + 0.1(${R} + ${g}×${U[1]}) + 0.1(${R} + ${g}×${U[2]})<br>= <b>${rd(Q)}</b>` };
  }},
  { id: "policy", topic: "l6", name: "Policy improvement (pick best action)", make(r) {
      const acts = ["Up", "Right"]; const U = { A: rd(r(), 2), B: rd(r(), 2), C: rd(r(), 2) };
      const q1 = 0.8 * U.A + 0.1 * U.B + 0.1 * U.C, q2 = 0.8 * U.B + 0.1 * U.A + 0.1 * U.C;
      const best = q1 >= q2 ? 0 : 1;
      return { q: `γ = 1, R = 0. Up: 0.8 → A, 0.1 → B, 0.1 → C. Right: 0.8 → B, 0.1 → A, 0.1 → C. Current U: A = ${U.A}, B = ${U.B}, C = ${U.C}. Find Q(Up) and Q(Right) (3 d.p.). The improved policy picks the larger.`,
        labels: ["Q(Up)", "Q(Right)"], answers: [N(rd(q1, 3), 0.0015), N(rd(q2, 3), 0.0015)],
        steps: `Q(Up) = 0.8×${U.A} + 0.1×${U.B} + 0.1×${U.C} = ${rd(q1, 3)}<br>Q(Right) = 0.8×${U.B} + 0.1×${U.A} + 0.1×${U.C} = ${rd(q2, 3)}<br>π(s) = <b>${acts[best]}</b>` };
  }},
  { id: "td", topic: "l6", name: "TD and Q-learning updates", make(r) {
      const U = rd(r(), 2), U2 = rd(r(), 2), R = pick(r, [-0.04, 0, 1, -1]), g = pick(r, [0.9, 1, 0.5]), a = pick(r, [0.1, 0.5, 0.2]);
      const nu = U + a * (R + g * U2 - U); const Q = rd(r() * 3, 2), mq = rd(r() * 3, 2); const nq = Q + a * (R + g * mq - Q);
      return { q: `TD: U(s) = ${U}, U(s') = ${U2}, R = ${R}, γ = ${g}, α = ${a}. Find new U(s).<br>Q-learning: Q(s,a) = ${Q}, max Q(s',a') = ${mq}, same R, γ, α. Find new Q(s,a). (4 d.p.)`,
        labels: ["New U(s)", "New Q(s,a)"], answers: [N(rd(nu), 0.0006), N(rd(nq), 0.0006)],
        steps: `TD: ${U} + ${a}(${R} + ${g}×${U2} - ${U}) = <b>${rd(nu)}</b><br>Q: ${Q} + ${a}(${R} + ${g}×${mq} - ${Q}) = <b>${rd(nq)}</b>` };
  }},
  { id: "return", topic: "l6", name: "Discounted return", make(r) {
      const rs = [ri(r, -2, 2), ri(r, -2, 2), ri(r, -2, 5), ri(r, 0, 10)]; const g = pick(r, [0.5, 0.9, 0.8]);
      const G = rs.reduce((s, x, i) => s + x * g ** i, 0);
      return { q: `Rewards r1..r4 = ${rs.join(", ")}, γ = ${g}. Discounted return G = r1 + γr2 + γ²r3 + γ³r4 (4 d.p.)?`, answers: [N(rd(G), 0.0006)],
        steps: rs.map((x, i) => `${x}×${g}^${i} = ${rd(x * g ** i)}`).join(" + ") + ` = <b>${rd(G)}</b>` };
  }},
  { id: "convsize", topic: "l7", name: "Conv output size and parameter count", make(r) {
      const Nn = pick(r, [7, 9, 28, 32, 64, 227]), K = pick(r, [1, 3, 5]), P = pick(r, [0, 1, 2]), S = pick(r, [1, 2]); const Cin = pick(r, [1, 3, 8, 16]), Cout = pick(r, [2, 4, 8, 16, 32]); const bias = r() < 0.7;
      const out = Math.floor((Nn + 2 * P - K) / S) + 1; const params = (K * K * Cin + (bias ? 1 : 0)) * Cout;
      return { q: `Input ${Nn}×${Nn}×${Cin}. Conv layer: ${Cout} filters of size ${K}×${K}, stride ${S}, padding ${P}, ${bias ? "one bias per filter" : "no bias"}. Find output width and number of trainable parameters.`,
        labels: ["Output width", "Parameters"], answers: [N(out, 0), N(params, 0)],
        steps: `Output = floor((${Nn} + 2×${P} - ${K})/${S}) + 1 = <b>${out}</b> (output depth ${Cout})<br>Params = (${K}×${K}×${Cin}${bias ? " + 1" : ""}) × ${Cout} = <b>${params}</b>` };
  }},
  { id: "convval", topic: "l7", name: "One convolution output value", make(r) {
      const patch = [...Array(9)].map(() => ri(r, 0, 5)); const ker = [...Array(9)].map(() => ri(r, -1, 1)); const b = pick(r, [0, 0, 1]);
      const v = patch.reduce((s, x, i) => s + x * ker[i], 0) + b;
      const m = a => `[${a.slice(0, 3).join(" ")}; ${a.slice(3, 6).join(" ")}; ${a.slice(6).join(" ")}]`;
      return { q: `Patch ${m(patch)}, kernel ${m(ker)}, bias ${b}. Find the output value at this position, then apply ReLU.`, labels: ["Conv value", "After ReLU"],
        answers: [N(v, 0), N(Math.max(0, v), 0)], steps: `Σ patch × kernel = ${patch.map((x, i) => `${x}×${ker[i]}`).join(" + ")} + ${b} = <b>${v}</b><br>ReLU → <b>${Math.max(0, v)}</b>` };
  }},
  { id: "pool", topic: "l7", name: "Max and average pooling", make(r) {
      const m = [...Array(16)].map(() => ri(r, 0, 9)); const g = (i, j) => m[i * 4 + j];
      const blocks = [[0, 0], [0, 2], [2, 0], [2, 2]].map(([i, j]) => [g(i, j), g(i, j + 1), g(i + 1, j), g(i + 1, j + 1)]);
      const k = ri(r, 0, 3); const names = ["top-left", "top-right", "bottom-left", "bottom-right"];
      return { q: `4×4 feature map (rows): ${[0, 1, 2, 3].map(i => `[${m.slice(i * 4, i * 4 + 4).join(" ")}]`).join(" ")}.<br>2×2 pooling, stride 2. Find the <b>${names[k]}</b> output for max pooling and average pooling.`,
        labels: ["Max", "Average"], answers: [N(Math.max(...blocks[k]), 0), N(blocks[k].reduce((a, b) => a + b) / 4, 0.001)],
        steps: `${names[k]} window: ${blocks[k].join(", ")}<br>Max = <b>${Math.max(...blocks[k])}</b>, Average = <b>${blocks[k].reduce((a, b) => a + b) / 4}</b>` };
  }},
  { id: "rf", topic: "l7", name: "Receptive field of stacked layers", make(r) {
      const L = []; const n = ri(r, 2, 4);
      for (let i = 0; i < n; i++) L.push(pick(r, [["conv", 3, 1], ["conv", 3, 1], ["conv", 5, 1], ["pool", 2, 2], ["conv", 3, 2]]));
      let rf = 1, j = 1; const st = [];
      L.forEach(([t, k, s]) => { rf = rf + (k - 1) * j; j = j * s; st.push(`${t} ${k}×${k} s${s}: r = ${rf}, jump = ${j}`); });
      return { q: `Layers in order: ${L.map(([t, k, s]) => `${t} ${k}×${k} stride ${s}`).join(" → ")}. What is the receptive field (width) of one unit in the last layer?`,
        answers: [N(rf, 0)], steps: `Start r = 1, jump = 1. r += (K - 1) × jump; jump ×= stride.<br>` + st.join("<br>") + `<br>Answer <b>${rf}</b>` };
  }},
  { id: "iou", topic: "l7", name: "IoU and NMS decision", make(r) {
      const A = [ri(r, 0, 3), ri(r, 0, 3)]; A.push(A[0] + ri(r, 3, 6), A[1] + ri(r, 3, 6));
      const B = [ri(r, 1, 5), ri(r, 1, 5)]; B.push(B[0] + ri(r, 3, 6), B[1] + ri(r, 3, 6));
      const iw = Math.max(0, Math.min(A[2], B[2]) - Math.max(A[0], B[0])), ih = Math.max(0, Math.min(A[3], B[3]) - Math.max(A[1], B[1]));
      const I = iw * ih, aA = (A[2] - A[0]) * (A[3] - A[1]), aB = (B[2] - B[0]) * (B[3] - B[1]), U = aA + aB - I, iou = I / U; const th = pick(r, [0.3, 0.4, 0.5]);
      return { q: `Box A: (${A[0]},${A[1]}) to (${A[2]},${A[3]}), score 0.9. Box B: (${B[0]},${B[1]}) to (${B[2]},${B[3]}), score 0.7, same class. Find IoU (4 d.p.). NMS suppresses B if IoU > ${th}: enter 1 if B is suppressed, else 0.`,
        labels: ["IoU", "Suppress B (1/0)"], answers: [N(rd(iou), 0.0006), N(iou > th ? 1 : 0, 0)],
        steps: `Areas: A = ${aA}, B = ${aB}<br>Overlap = ${iw} × ${ih} = ${I}<br>Union = ${aA} + ${aB} - ${I} = ${U}<br>IoU = ${I}/${U} = <b>${rd(iou)}</b> → ${iou > th ? "suppress B" : "keep B"}` };
  }},
  { id: "rnn", topic: "l8", name: "Simple RNN hidden-state update", make(r) {
      const x = ri(r, -2, 3), wx = rd(ri(r, 1, 9) / 10, 1), h = rd(ri(r, -5, 9) / 10, 1), wh = pick(r, [0.25, 0.5, 0.75, 0.2]), b = pick(r, [0, 0, 0.1]);
      const s = rd(wx * x + wh * h + b, 3); const t = rd(Math.tanh(s), 3);
      return { q: `Current input x = ${x}, input weight = ${wx}, previous hidden state = ${h}, recurrent weight = ${wh}, bias = ${b}. Activation tanh, and tanh(${s}) = ${t} (lookup). Find the sum before activation and the new hidden state.`,
        labels: ["Sum", "New h"], answers: [N(s, 0.001), N(t, 0.001)],
        steps: `Sum = ${wx}×${x} + ${wh}×${h} + ${b} = <b>${s}</b><br>h = tanh(${s}) = <b>${t}</b>` };
  }},
  { id: "attn", topic: "l8", name: "Attention weighted value aggregation", make(r) {
      const n = ri(r, 2, 3); let w = [...Array(n)].map(() => ri(r, 1, 6)); const s = w.reduce((a, b) => a + b); w = w.map(x => rd(x / s, 2));
      w[n - 1] = rd(1 - w.slice(0, -1).reduce((a, b) => a + b, 0), 2);
      const V = [...Array(n)].map(() => [ri(r, 0, 5), ri(r, 0, 5)]);
      const o = [0, 1].map(c => rd(V.reduce((acc, v, i) => acc + w[i] * v[c], 0), 3));
      return { q: `Attention weights: ${w.join(", ")}. Value vectors: ${V.map(v => `[${v}]`).join(", ")}. Find the output vector.`,
        labels: ["Component 1", "Component 2"], answers: [N(o[0], 0.002), N(o[1], 0.002)],
        steps: [0, 1].map(c => `c${c + 1}: ` + V.map((v, i) => `${w[i]}×${v[c]}`).join(" + ") + ` = <b>${o[c]}</b>`).join("<br>") };
  }},
  { id: "softmax", topic: "l8", name: "Softmax attention weights", make(r) {
      const sc = [ri(r, 0, 3), ri(r, 0, 3)]; const e = sc.map(Math.exp); const w = e.map(x => x / (e[0] + e[1]));
      return { q: `Two attention scores (already scaled): ${sc.join(" and ")}. Find the softmax weight of the first (4 d.p.).`, answers: [N(rd(w[0]), 0.0006)],
        steps: `w1 = e^${sc[0]} / (e^${sc[0]} + e^${sc[1]}) = ${rd(e[0])}/${rd(e[0] + e[1])} = <b>${rd(w[0])}</b>` };
  }},
  { id: "nb", topic: "l8", name: "Naive Bayes with Laplace smoothing", make(r) {
      const Tp = ri(r, 15, 30), Tn = ri(r, 15, 30), V = 6, cp = ri(r, 0, 8), cn = ri(r, 0, 8), npos = ri(r, 8, 12), nneg = ri(r, 8, 12);
      const pp = (cp + 1) / (Tp + V), pn = (cn + 1) / (Tn + V); const Sp = npos / (npos + nneg) * pp, Sn = nneg / (npos + nneg) * pn;
      return { q: `${npos} positive and ${nneg} negative reviews. Word "great" appears ${cp} times in positive (T+ = ${Tp}) and ${cn} times in negative (T- = ${Tn}). |V| = ${V}. Text = "great". Find P(great|+) with add-one smoothing and P(+|text) (4 d.p.).`,
        labels: ["P(great|+)", "P(+|text)"], answers: [N(rd(pp), 0.0006), N(rd(Sp / (Sp + Sn)), 0.0006)],
        steps: `P(great|+) = (${cp}+1)/(${Tp}+${V}) = ${rd(pp)}; P(great|-) = (${cn}+1)/(${Tn}+${V}) = ${rd(pn)}<br>S+ = ${rd(npos / (npos + nneg))}×${rd(pp)} = ${rd(Sp, 5)}, S- = ${rd(nneg / (npos + nneg))}×${rd(pn)} = ${rd(Sn, 5)}<br>P(+|text) = S+/(S+ + S-) = <b>${rd(Sp / (Sp + Sn))}</b>` };
  }},
  { id: "bayes", topic: "l11", name: "Bayes' rule (test and disease)", make(r) {
      const pD = pick(r, [0.01, 0.02, 0.05, 0.1]), sens = pick(r, [0.8, 0.9, 0.95, 0.99]), fp = pick(r, [0.02, 0.05, 0.1]);
      const pp = sens * pD + fp * (1 - pD); const post = sens * pD / pp;
      return { q: `P(D) = ${pD}, P(+|D) = ${sens}, P(+|¬D) = ${fp}. Find P(+) and P(D|+) (4 d.p.).`, labels: ["P(+)", "P(D|+)"],
        answers: [N(rd(pp), 0.0006), N(rd(post), 0.0006)], steps: `P(+) = ${sens}×${pD} + ${fp}×${rd(1 - pD, 2)} = ${rd(pp)}<br>P(D|+) = ${rd(sens * pD)}/${rd(pp)} = <b>${rd(post)}</b>` };
  }},
  { id: "bnjoint", topic: "l11", name: "Burglary network joint probability", make(r) {
      const b = r() < 0.5, e = r() < 0.5, a = r() < 0.6, j = r() < 0.6, m = r() < 0.6;
      const PA = { "true,true": 0.95, "true,false": 0.94, "false,true": 0.29, "false,false": 0.001 };
      const pb = b ? 0.001 : 0.999, pe = e ? 0.002 : 0.998, pa0 = PA[b + "," + e], pa = a ? pa0 : 1 - pa0;
      const pj = a ? (j ? 0.9 : 0.1) : (j ? 0.05 : 0.95), pm = a ? (m ? 0.7 : 0.3) : (m ? 0.01 : 0.99);
      const v = pb * pe * pa * pj * pm; const L = (n, t) => (t ? "" : "¬") + n;
      return { q: `Burglary network (P(B)=0.001, P(E)=0.002, P(A|B,E)=.95/.94/.29/.001, P(J|A)=.90/.05, P(M|A)=.70/.01). Find P(${[L("b", b), L("e", e), L("a", a), L("j", j), L("m", m)].join(", ")}). Give it in scientific style, e.g. 0.000628 (3 significant figures).`,
        answers: [{ n: v, tol: Math.abs(v) * 0.01 }], steps: `= P(${L("b", b)}) P(${L("e", e)}) P(${L("a", a)}|${L("b", b)},${L("e", e)}) P(${L("j", j)}|${L("a", a)}) P(${L("m", m)}|${L("a", a)})<br>= ${pb} × ${pe} × ${rd(pa, 3)} × ${pj} × ${pm} = <b>${v.toPrecision(3)}</b>` };
  }},
  { id: "cond", topic: "l11", name: "Conditional probability from a joint table", make(r) {
      let v = [ri(r, 5, 30), ri(r, 5, 30), ri(r, 5, 30), ri(r, 5, 30)]; const s = v.reduce((a, b) => a + b); v = v.map(x => x / s); v = v.map(x => rd(x, 3)); v[3] = rd(1 - v[0] - v[1] - v[2], 3);
      const pAB = v[0], pB = v[0] + v[2];
      return { q: `Joint table: P(a, b) = ${v[0]}, P(a, ¬b) = ${v[1]}, P(¬a, b) = ${v[2]}, P(¬a, ¬b) = ${v[3]}. Find P(b) and P(a | b) (4 d.p.).`, labels: ["P(b)", "P(a|b)"],
        answers: [N(rd(pB), 0.0006), N(rd(pAB / pB), 0.0006)], steps: `P(b) = ${v[0]} + ${v[2]} = ${rd(pB)}<br>P(a|b) = ${v[0]}/${rd(pB)} = <b>${rd(pAB / pB)}</b>` };
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
        steps: `With precedence (¬, ∧, ∨, ⇒, ⇔): ${f[2]}<br>Result: <b>${v ? "True" : "False"}</b>` };
  }}
  ];
})();
