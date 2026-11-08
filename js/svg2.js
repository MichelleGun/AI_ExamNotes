// More inline SVG diagrams (theme-aware). Extends window.SVG from svg.js.
(function () {
  const f1 = n => (Math.round(n * 100) / 100).toString();
  const T = (x, y, t, cls = "", a = "middle") => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${a}">${t}</text>`;
  const R = (x, y, w, h, cls = "c", rx = 0) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
  const C = (x, y, r, cls = "c") => `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>`;
  const A = (x1, y1, x2, y2, lab = "", cls = "ln", dx = 4, dy = -5) =>
    `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#ah)"/>` +
    (lab ? T((x1 + x2) / 2 + dx, (y1 + y2) / 2 + dy, lab, "lbl") : "");
  const Ln = (x1, y1, x2, y2, cls = "ln") => `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const P = (d, cls = "ln", arrow = false) => `<path class="${cls}" d="${d}"${arrow ? ' marker-end="url(#ah)"' : ""}/>`;
  const B = (x, y, w, h, t, cls = "b", t2 = "") => `<g class="${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>` +
    (t2 ? T(x + w / 2, y + h / 2 - 3, t) + T(x + w / 2, y + h / 2 + 13, t2, "sm") : T(x + w / 2, y + h / 2 + 5, t)) + `</g>`;
  const N = (x, y, t, cls = "n", r = 20) => `<g class="${cls}"><circle cx="${x}" cy="${y}" r="${r}"/>${T(x, y + 5, t)}</g>`;
  const defs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ahp"/></marker></defs>`;
  const svg = (w, h, inner, title) => `<svg class="diagram" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}">${defs}${inner}</svg>`;
  const grid = (x, y, M, s, clsFn = () => "c", fmt = v => v) => M.map((row, i) => row.map((v, j) =>
    R(x + j * s, y + i * s, s, s, clsFn(i, j)) + T(x + j * s + s / 2, y + i * s + s / 2 + 5, fmt(v))).join("")).join("");
  const plot = (f, x0, x1, y0, y1, bx, cls) => {
    let d = "";
    for (let i = 0; i <= 120; i++) {
      const x = x0 + (x1 - x0) * i / 120;
      const y = Math.max(y0, Math.min(y1, f(x)));
      d += (i ? "L" : "M") + (bx.x + (x - x0) / (x1 - x0) * bx.w).toFixed(1) + "," + (bx.y + bx.h - (y - y0) / (y1 - y0) * bx.h).toFixed(1);
    }
    return P(d, cls);
  };
  const axes = (bx, xl, yl) => `<line class="ax" x1="${bx.x}" y1="${bx.y + bx.h}" x2="${bx.x + bx.w}" y2="${bx.y + bx.h}" marker-end="url(#ah)"/>` +
    `<line class="ax" x1="${bx.x}" y1="${bx.y + bx.h}" x2="${bx.x}" y2="${bx.y - 6}" marker-end="url(#ah)"/>` +
    (xl ? T(bx.x + bx.w, bx.y + bx.h + 18, xl, "lbl", "end") : "") + (yl ? T(bx.x + 6, bx.y - 4, yl, "lbl", "start") : "");
  const sx = (bx, x0, x1) => x => bx.x + (x - x0) / (x1 - x0) * bx.w;
  const sy = (bx, y0, y1) => y => bx.y + bx.h - (y - y0) / (y1 - y0) * bx.h;
  const arc = (cx, cy, r, a0, a1) => {
    const p = a => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z`;
  };

  const D = {};

  // ===== L2 Search =====
  D.frontier = svg(560, 200,
    T(95, 20, "BFS", "bold") + T(95, 37, "FIFO queue", "lbl") +
    ["A", "B", "C", "D"].map((t, i) => B(18 + i * 40, 70, 36, 34, t, i === 0 ? "b hl2" : "b")).join("") +
    A(36, 150, 36, 108) + T(36, 168, "pop front", "lbl") + A(154, 150, 154, 108) + T(154, 168, "push back", "lbl") +
    T(265, 20, "DFS", "bold") + T(265, 37, "LIFO stack", "lbl") +
    ["D", "C", "B", "A"].map((t, i) => B(220, 50 + i * 32, 70, 30, t, i === 0 ? "b hl2" : "b")).join("") +
    T(296, 70, "← push and", "lbl", "start") + T(296, 86, "pop at top", "lbl", "start") +
    T(465, 20, "UCS / Greedy / A*", "bold") + T(465, 37, "priority queue (sorted by f)", "lbl") +
    B(385, 50, 160, 30, "Sibiu  f = 393", "b hl2") + B(385, 84, 160, 30, "Timisoara  f = 447") + B(385, 118, 160, 30, "Zerind  f = 449") +
    T(465, 172, "pop the LOWEST f first", "lbl"),
    "Frontier data structures");

  D.heuristic = svg(560, 220,
    N(40, 110, "S", "n root") + N(180, 110, "n") + N(310, 110, "G", "n front") +
    `<line class="ln p1" x1="60" y1="110" x2="160" y2="110"/>` + T(110, 98, "g(n)", "ta bold") + T(110, 140, "cost so far", "lbl") +
    `<line class="ln dash p2" x1="200" y1="110" x2="290" y2="110"/>` + T(245, 98, "h(n)", "to bold") + T(245, 140, "estimate to goal", "lbl") +
    T(175, 185, "A*: f(n) = g(n) + h(n)", "bold") + T(175, 205, "Greedy: f = h,  UCS: f = g", "lbl") +
    N(385, 175, "n") + N(530, 175, "n'") + N(458, 50, "G", "n front") +
    A(405, 175, 508, 175) + T(458, 205, "c(n, a, n')", "lbl") +
    `<line class="ln dash p2" x1="397" y1="158" x2="446" y2="67"/>` + T(398, 108, "h(n)", "to", "end") +
    `<line class="ln dash p2" x1="519" y1="158" x2="470" y2="67"/>` + T(518, 108, "h(n')", "to", "start") +
    T(458, 18, "consistent: h(n) ≤ c + h(n')", "lbl"),
    "A star evaluation function and consistency triangle");

  // ===== L3 Local search =====
  const board = (x0, y0, rows, attack) => {
    let s = "";
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) s += R(x0 + c * 45, y0 + r * 45, 45, 45, (r + c) % 2 ? "c2" : "c");
    rows.forEach((row, c) => { const cx = x0 + c * 45 + 22.5, cy = y0 + (4 - row) * 45 + 22.5; s += C(cx, cy, 15, "qn") + T(cx, cy + 5, "Q", "qt"); });
    for (let c = 0; c < 4; c++) s += T(x0 + c * 45 + 22.5, y0 + 198, "x" + "₁₂₃₄"[c] + "=" + rows[c], "lbl");
    if (attack) s += `<line class="atk" x1="${x0 + attack[0] * 45 + 22.5}" y1="${y0 + (4 - rows[attack[0]]) * 45 + 22.5}" x2="${x0 + attack[1] * 45 + 22.5}" y2="${y0 + (4 - rows[attack[1]]) * 45 + 22.5}"/>`;
    return s;
  };
  D.queens = svg(560, 250,
    board(40, 10, [2, 4, 1, 3]) + T(130, 240, "goal (2, 4, 1, 3): cost = 0", "tg bold") +
    board(330, 10, [2, 4, 1, 1], [2, 3]) + T(420, 240, "(2, 4, 1, 1): cost = 1 (same row)", "tb bold"),
    "4-queens boards");

  (function () {
    const bx = { x: 60, y: 25, w: 420, h: 150 };
    D.saProb = svg(560, 215,
      axes(bx, "ΔE (how much worse)", "p = e^(-ΔE/T)") +
      [[10, "p1", "T = 10 (hot)"], [3, "p2", "T = 3"], [1, "p4", "T = 1 (cold)"]].map(([t, c, l], i) =>
        plot(x => Math.exp(-x / t), 0, 10, 0, 1, bx, c) + T(sx(bx, 0, 10)([7, 3.2, 1.2][i]) + 6, sy(bx, 0, 1)(Math.exp(-[7, 3.2, 1.2][i] / t)) - 8, l, c.replace("p", "tp"), "start")).join("") +
      T(52, 30, "1", "lbl", "end") + T(52, 178, "0", "lbl", "end") +
      T(270, 205, "Hot = accepts bad moves often (explore). Cold = almost never (like hill climbing).", "lbl"),
      "Simulated annealing acceptance probability");
  })();

  (function () {
    const fit = [24, 23, 20, 11], tot = 78, cls = ["sl1", "sl2", "sl3", "sl4"];
    let a = -Math.PI / 2, pie = "";
    fit.forEach((f, i) => {
      const a1 = a + 2 * Math.PI * f / tot, m = (a + a1) / 2;
      pie += P(arc(110, 120, 85, a, a1), cls[i]) + T(110 + 55 * Math.cos(m), 120 + 55 * Math.sin(m) + 5, "#" + (i + 1) + " " + Math.round(100 * f / tot) + "%", "bold");
      a = a1;
    });
    const bits = (x, y, s, hl) => s.split("").map((b, i) => R(x + i * 22, y, 22, 24, hl(i) ? "hl" : "c") + T(x + i * 22 + 11, y + 17, b)).join("");
    D.ga = svg(560, 240,
      T(110, 20, "1. Selection (roulette)", "bold") + pie + T(110, 228, "P = fitness / total (24, 23, 20, 11)", "lbl") +
      T(390, 20, "2. Crossover (cut after bit 5)", "bold") +
      T(250, 52, "P1", "lbl", "start") + bits(275, 35, "11010110", i => i >= 5) +
      T(250, 80, "P2", "lbl", "start") + bits(275, 63, "00111001", i => false) +
      `<line class="ln dash p4" x1="385" y1="30" x2="385" y2="150"/>` +
      T(250, 122, "C1", "lbl", "start") + bits(275, 105, "11010001", i => false) +
      T(250, 150, "C2", "lbl", "start") + bits(275, 133, "00111110", i => i >= 5) +
      T(390, 185, "3. Mutation (flip one bit)", "bold") +
      bits(275, 197, "11000001", i => i === 3) + T(460, 215, "← bit 4 flipped", "lbl", "start"),
      "Genetic algorithm operations");
  })();

  // ===== L4 Supervised learning =====
  D.dtree = svg(560, 230,
    B(195, 10, 170, 44, "Patrons?", "b", "6+ / 6-   H = 1") +
    A(250, 54, 85, 130, "None", "ln", -20, 0) + A(280, 54, 280, 130, "Some", "ln", 6, 0) + A(310, 54, 470, 130, "Full", "ln", 20, 0) +
    B(20, 130, 130, 44, "0+ / 2-", "b no", "H = 0  → No") +
    B(215, 130, 130, 44, "4+ / 0-", "b ok", "H = 0  → Yes") +
    B(405, 130, 140, 44, "2+ / 4-", "b or", "H = 0.918 → split") +
    T(280, 205, "Remainder = 2/12·0 + 4/12·0 + 6/12·0.918 = 0.459", "lbl") +
    T(280, 224, "IG(Patrons) = 1 - 0.459 = 0.541 bits (Type gives 0, so pick Patrons)", "bold"),
    "Decision tree split on Patrons");

  (function () {
    const bx = { x: 60, y: 25, w: 400, h: 150 };
    const H = q => q <= 0 || q >= 1 ? 0 : -(q * Math.log2(q) + (1 - q) * Math.log2(1 - q));
    D.impurity = svg(560, 215,
      axes(bx, "", "impurity") +
      plot(H, 0, 1, 0, 1, bx, "p1") + plot(q => 2 * q * (1 - q), 0, 1, 0, 1, bx, "p2") +
      T(470, sy(bx, 0, 1)(0.3) , "Entropy B(q)", "tp1", "start") + T(470, sy(bx, 0, 1)(0.15), "Gini 1 - Σp²", "tp2", "start") +
      `<line class="ln dash" x1="260" y1="25" x2="260" y2="175"/>` + T(260, 192, "0.5", "lbl") + T(60, 192, "0", "lbl") + T(460, 192, "1", "lbl") +
      T(52, 29, "1", "lbl", "end") + T(52, 104, "0.5", "lbl", "end") +
      T(265, 210, "q = fraction of positives. Pure node (q = 0 or 1) → 0. 50/50 → max.", "lbl"),
      "Entropy and Gini curves");
  })();

  (function () {
    const bx = { x: 40, y: 20, w: 210, h: 160 }, X = sx(bx, 0, 4), Y = sy(bx, 0, 7);
    const pts = [[0.5, 2.4], [1, 1.4], [1.5, 3.9], [2, 2.8], [2.5, 5.2], [3, 4.2], [3.5, 6.4]];
    const h = x => 0.8 + 1.4 * x;
    const bx2 = { x: 320, y: 20, w: 210, h: 160 }, X2 = sx(bx2, 0, 6), Y2 = sy(bx2, 0, 9);
    const L = w => (w - 3) * (w - 3);
    const steps = [0.3, 1.7, 2.6];
    D.linreg = svg(560, 230,
      axes(bx, "x", "y") + plot(h, 0, 4, 0, 7, bx, "p1") +
      pts.map(([x, y]) => `<line class="ln dash p4" x1="${X(x)}" y1="${Y(y)}" x2="${X(x)}" y2="${Y(h(x))}"/>` + C(X(x), Y(y), 4.5, "dot2")).join("") +
      T(150, 215, "h(x) = w₀ + w₁x, red = errors", "lbl") +
      axes(bx2, "weight w", "Loss") + plot(L, 0, 6, 0, 9, bx2, "p1") +
      steps.map((w, i) => C(X2(w), Y2(L(w)), 5, "dot2") + (i < steps.length - 1 ? `<line class="ln p2" x1="${X2(w)}" y1="${Y2(L(w))}" x2="${X2(steps[i + 1]) - 3}" y2="${Y2(L(steps[i + 1])) - 2}" marker-end="url(#ah)"/>` : "")).join("") +
      T(X2(3), Y2(0) - 8, "min", "lbl") +
      T(425, 215, "gradient descent: w ← w - α ∂L/∂w", "lbl"),
      "Linear regression and gradient descent");
  })();

  (function () {
    const bx = { x: 60, y: 25, w: 420, h: 150 };
    const sig = z => 1 / (1 + Math.exp(-z));
    D.logistic = svg(560, 215,
      R(260, 25, 220, 150, "zoneB") + R(60, 25, 200, 150, "zoneA") +
      axes(bx, "z = w·x", "ŷ = σ(z)") + plot(sig, -6, 6, 0, 1, bx, "p1") +
      `<line class="ln dash" x1="60" y1="100" x2="480" y2="100"/>` + T(486, 104, "0.5", "lbl", "start") +
      T(160, 60, "ŷ < 0.5 → class 0", "lbl") + T(370, 160, "ŷ ≥ 0.5 → class 1", "lbl") +
      T(52, 29, "1", "lbl", "end") + T(52, 178, "0", "lbl", "end") +
      T(270, 205, "Sigmoid squashes any number into a probability between 0 and 1.", "lbl"),
      "Logistic regression sigmoid");
  })();

  D.knn = svg(560, 230,
    [[70, 60], [110, 40], [60, 120], [130, 100], [190, 75], [100, 170]].map(([x, y]) => C(x, y, 8, "dot1")).join("") +
    [[380, 60], [440, 100], [420, 170], [480, 140], [340, 180], [312, 140]].map(([x, y]) => R(x - 8, y - 8, 16, 16, "dot2")).join("") +
    C(250, 120, 72, "ring") + C(250, 120, 9, "dot4") + T(250, 106, "?", "bold") +
    [[190, 75], [312, 140], [230, 165]].map(([x, y]) => `<line class="ln dash" x1="250" y1="120" x2="${x}" y2="${y}"/>`).join("") +
    C(230, 165, 8, "dot1") +
    C(30, 205, 7, "dot1") + T(42, 210, "class A", "lbl", "start") + R(112, 198, 14, 14, "dot2") + T(132, 210, "class B", "lbl", "start") +
    T(520, 30, "k = 3 nearest:", "bold", "end") + T(520, 50, "2 × A, 1 × B", "lbl", "end") + T(520, 70, "vote → predict A", "tg bold", "end"),
    "K nearest neighbours");

  D.svm = svg(560, 230,
    `<g transform="rotate(-18 280 115)">` +
    `<rect class="zoneA" x="235" y="-40" width="45" height="310"/><rect class="zoneB" x="280" y="-40" width="45" height="310"/>` +
    `<line class="p1" x1="280" y1="-40" x2="280" y2="270"/>` +
    `<line class="ln dash" x1="235" y1="-40" x2="235" y2="270"/><line class="ln dash" x1="325" y1="-40" x2="325" y2="270"/>` +
    [[235, 60], [235, 170], [190, 110], [150, 40], [170, 190], [120, 120]].map(([x, y], i) => C(x, y, 8, "dot1") + (i < 2 ? C(x, y, 14, "ring") : "")).join("") +
    [[325, 110], [370, 50], [390, 160], [430, 100], [360, 210]].map(([x, y], i) => R(x - 8, y - 8, 16, 16, "dot2") + (i < 1 ? C(x, y, 14, "ring") : "")).join("") +
    `<line class="ln" x1="237" y1="20" x2="321" y2="20" marker-end="url(#ah)" marker-start="url(#ah)"/>` +
    `</g>` +
    T(345, 22, "↔ margin (maximise)", "bold", "start") + T(390, 222, "w·x + b = 0", "ta bold") +
    T(10, 18, "ringed = support vectors", "tg", "start"),
    "SVM maximum margin");

  D.ensemble = svg(560, 270,
    T(10, 18, "Random forest (bagging, parallel)", "bold", "start") +
    B(10, 60, 60, 36, "Data") +
    [0, 1, 2].map(i => A(70, 78, 128, 40 + i * 38) + B(130, 26 + i * 38, 150, 30, "bootstrap → Tree " + (i + 1)) + A(280, 41 + i * 38, 338, 78)).join("") +
    B(340, 60, 110, 36, "vote / average", "b ok") + A(450, 78, 500, 78) + T(505, 83, "ŷ", "bold", "start") +
    T(10, 160, "Gradient boosting (sequential)", "bold", "start") +
    B(10, 190, 90, 36, "Tree 1") + A(100, 208, 150, 208, "error", "ln", 0, -8) +
    B(150, 190, 90, 36, "Tree 2") + A(240, 208, 290, 208, "error", "ln", 0, -8) +
    B(290, 190, 90, 36, "Tree 3") + A(380, 208, 420, 208) + B(420, 190, 130, 36, "sum of all trees", "b ok") +
    T(280, 258, "each new tree fits the remaining error (residual) of the trees before it", "lbl"),
    "Random forest vs boosting");

  D.confusion = svg(560, 210,
    T(210, 20, "Predicted", "bold") + T(160, 42, "+", "bold") + T(260, 42, "-", "bold") +
    T(40, 125, "Actual", "bold", "middle") + T(95, 87, "+", "bold") + T(95, 152, "-", "bold") +
    B(110, 50, 100, 64, "TP", "b ok", "true positive") + B(210, 50, 100, 64, "FN", "b no", "missed") +
    B(110, 114, 100, 64, "FP", "b no", "false alarm") + B(210, 114, 100, 64, "TN", "b ok", "true negative") +
    T(335, 70, "Precision = TP / (TP + FP)", "", "start") + T(335, 88, "of predicted +, how many right?", "lbl", "start") +
    T(335, 120, "Recall = TP / (TP + FN)", "", "start") + T(335, 138, "of real +, how many found?", "lbl", "start") +
    T(335, 170, "Accuracy = (TP + TN) / all", "", "start") +
    T(280, 202, "F1 = 2PR / (P + R)", "bold"),
    "Confusion matrix");

  (function () {
    const pts = [[0.5, 1.2], [1.2, 2.6], [1.9, 2.1], [2.6, 3.6], [3.3, 3.3], [4, 4.6]];
    const panel = (x0, f, title, cls) => {
      const bx = { x: x0, y: 20, w: 150, h: 120 };
      return axes(bx, "", "") + plot(f, 0, 4.5, 0, 5.5, bx, "p1") +
        pts.map(([x, y]) => C(sx(bx, 0, 4.5)(x), sy(bx, 0, 5.5)(y), 4.5, "dot2")).join("") + T(x0 + 75, 170, title, cls);
    };
    // interpolating polynomial for overfit
    const lag = x => pts.reduce((s, [xi, yi], i) => s + yi * pts.reduce((p, [xj], j) => j === i ? p : p * (x - xj) / (xi - xj), 1), 0);
    D.overfit = svg(560, 200,
      panel(20, () => 2.9, "Underfit (too simple)", "tb bold") +
      panel(205, x => 0.75 + 0.9 * x, "Good fit (generalises)", "tg bold") +
      panel(390, lag, "Overfit (fits noise)", "tb bold") +
      T(280, 192, "Ockham's razor: prefer the simplest model that fits.", "lbl"),
      "Underfitting vs overfitting");
  })();

  // ===== L5 Neural networks =====
  (function () {
    const mini = (x0, f, y0, y1, name, rng) => {
      const bx = { x: x0, y: 20, w: 115, h: 100 };
      const zy = sy(bx, y0, y1)(0);
      return R(x0, 20, 115, 100, "c") + Ln(x0, zy, x0 + 115, zy, "ax") + Ln(x0 + 57.5, 20, x0 + 57.5, 120, "ax") +
        plot(f, -4, 4, y0, y1, bx, "p1") + T(x0 + 57.5, 142, name, "bold") + T(x0 + 57.5, 160, rng, "lbl");
    };
    D.activations = svg(560, 170,
      mini(10, z => z >= 0 ? 1 : 0, -0.3, 1.3, "Step", "0 or 1") +
      mini(150, z => 1 / (1 + Math.exp(-z)), -0.3, 1.3, "Sigmoid", "(0, 1)") +
      mini(290, Math.tanh, -1.3, 1.3, "Tanh", "(-1, 1)") +
      mini(430, z => Math.max(0, z), -1, 4.2, "ReLU", "[0, ∞)"),
      "Activation functions");
  })();

  D.perceptron = svg(560, 210,
    T(130, 18, "AND: linearly separable", "tg bold") +
    R(30, 30, 200, 150, "c") + `<line class="p1" x1="95" y1="180" x2="230" y2="60"/>` +
    [[60, 160, 0], [60, 60, 0], [200, 160, 0], [200, 60, 1]].map(([x, y, v]) => v ? R(x - 8, y - 8, 16, 16, "dot2") : C(x, y, 8, "dot1")).join("") +
    T(130, 200, "one line w·x + b = 0 splits them", "lbl") +
    T(420, 18, "XOR: NOT linearly separable", "tb bold") +
    R(320, 30, 200, 150, "c") +
    [[350, 160, 0], [350, 60, 1], [490, 160, 1], [490, 60, 0]].map(([x, y, v]) => v ? R(x - 8, y - 8, 16, 16, "dot2") : C(x, y, 8, "dot1")).join("") +
    `<line class="ln dash p4" x1="320" y1="180" x2="520" y2="30"/>` + T(420, 200, "needs a hidden layer (MLP)", "lbl"),
    "Perceptron decision boundary");

  D.backprop = svg(560, 230,
    `<line class="ln blue" x1="40" y1="30" x2="520" y2="30" marker-end="url(#ah)"/>` + T(280, 22, "forward pass: compute in, a, ŷ", "tblue") +
    N(60, 110, "x") + A(80, 110, 178, 110, "w₁,₃") + N(200, 110, "a₃") + A(220, 110, 318, 110, "w₃,₅") + N(340, 110, "ŷ") +
    A(360, 110, 430, 110) + B(430, 90, 110, 40, "Loss (y - ŷ)²", "b or") +
    `<line class="ln red" x1="520" y1="170" x2="40" y2="170" marker-end="url(#ah)"/>` + T(280, 188, "backward pass: send error Δ back", "tred") +
    T(340, 150, "Δ₅ = -2(y - ŷ)g'(in₅)", "tred sm") + T(200, 150, "Δ₃ = g'(in₃) w₃,₅ Δ₅", "tred sm") +
    T(280, 215, "update: w₃,₅ ← w₃,₅ - α · a₃ · Δ₅", "bold"),
    "Backpropagation");

  D.lstm = svg(560, 260,
    T(20, 55, "C(t-1)", "lbl", "start") + `<line class="ln p1" x1="70" y1="50" x2="520" y2="50" marker-end="url(#ah)"/>` + T(530, 55, "C(t)", "lbl", "start") +
    T(300, 22, "cell state = long-term memory (changed by × and +)", "lbl") +
    C(160, 50, 12, "op") + T(160, 55, "×", "bold") + C(290, 50, 12, "op") + T(290, 55, "+", "bold") +
    `<line class="ln" x1="40" y1="205" x2="440" y2="205"/>` + T(240, 228, "inputs: h(t-1) and x(t)", "lbl") +
    B(130, 140, 60, 30, "f  σ", "b no") + Ln(160, 205, 160, 170) + A(160, 140, 160, 63) +
    B(222, 140, 50, 30, "i  σ", "b ok") + Ln(247, 205, 247, 170) +
    B(282, 140, 60, 30, "g tanh", "b ok") + Ln(312, 205, 312, 170) +
    C(290, 105, 11, "op") + T(290, 110, "×", "bold") + A(247, 140, 282, 113) + A(312, 140, 297, 114) + A(290, 94, 290, 63) +
    B(372, 140, 50, 30, "o  σ", "b or") + Ln(397, 205, 397, 170) +
    Ln(470, 50, 470, 80) + B(440, 80, 60, 26, "tanh") + A(470, 106, 470, 143) + C(470, 155, 11, "op") + T(470, 160, "×", "bold") +
    A(422, 155, 458, 155) + A(481, 155, 545, 155) + T(515, 145, "h(t)", "lbl") +
    T(100, 100, "forget gate:", "tb sm", "end") + T(100, 115, "erase memory", "lbl", "end") +
    T(280, 252, "f = forget (erase), i = input (write), g = candidate values, o = output (read)", "lbl"),
    "LSTM cell");

  // ===== L6 MDP and RL =====
  (function () {
    const V = [[0.812, 0.868, 0.918, "+1"], [0.762, null, 0.660, "-1"], [0.705, 0.655, 0.611, 0.388]];
    const pol = [["→", "→", "→", ""], ["↑", "", "↑", ""], ["↑", "←", "←", "←"]];
    let g = "";
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const x = 30 + c * 80, y = 20 + r * 65, v = V[r][c];
      const cls = v === null ? "wall" : v === "+1" ? "gd" : v === "-1" ? "bd" : "c";
      g += R(x, y, 80, 65, cls);
      if (v !== null) g += T(x + 40, y + (typeof v === "string" ? 40 : 28), typeof v === "string" ? v : v.toFixed(3), typeof v === "string" ? "lg bold" : "");
      if (pol[r][c]) g += T(x + 40, y + 52, pol[r][c], "ta lg bold");
    }
    for (let c = 0; c < 4; c++) g += T(70 + c * 80, 232, c + 1, "lbl");
    for (let r = 0; r < 3; r++) g += T(18, 58 + r * 65, 3 - r, "lbl");
    g += T(36, 164, "start", "lbl sm", "start");
    D.grid = svg(560, 245,
      g + T(465, 22, "action Up from a square", "bold") +
      C(465, 130, 16, "dot1") + A(465, 112, 465, 50) + T(475, 75, "0.8", "bold", "start") +
      A(447, 130, 385, 130) + T(415, 120, "0.1", "bold") + A(483, 130, 545, 130) + T(515, 120, "0.1", "bold") +
      T(465, 175, "intended 0.8, each side 0.1", "lbl") + T(465, 193, "wall = stay put", "lbl") +
      T(465, 220, "R = -0.04 per step, γ = 1", "lbl"),
      "4 by 3 grid world utilities and policy");
  })();

  D.qbackup = svg(560, 240,
    N(280, 30, "s", "n root") + T(310, 35, "U(s) = max over actions of Q(s, a)", "lbl", "start") +
    A(264, 44, 172, 92, "Up") + A(296, 44, 388, 92, "Left") +
    C(160, 100, 9, "dot1") + T(160, 125, "Q(s, Up)", "bold") + C(400, 100, 9, "dot2") + T(400, 125, "Q(s, Left)", "bold") +
    [[70, "0.8"], [160, "0.1"], [250, "0.1"]].map(([x, p]) => A(160, 132, x, 182, p, "ln", x < 160 ? -14 : x > 160 ? 14 : 8, 0) + N(x, 200, "s'", "n", 16)).join("") +
    T(160, 235, "Q = Σ P(s'|s,a) [R + γ U(s')]", "lbl") + A(400, 132, 400, 182, "...", "ln", 10, 0) + N(400, 200, "s'", "n", 16),
    "Bellman backup tree");

  D.rlLoop = svg(560, 180,
    B(30, 65, 140, 50, "Agent", "b", "policy π, learns Q or U") + B(390, 65, 140, 50, "Environment", "b or", "P(s'|s,a) maybe unknown") +
    P("M170,75 C240,20 320,20 390,75", "ln", true) + T(280, 30, "action a", "bold") +
    P("M390,105 C320,160 240,160 170,105", "ln", true) + T(280, 158, "next state s' and reward r", "bold"),
    "Agent environment loop");

  // ===== L7 CNN =====
  (function () {
    const I = [[1, 2, 0, 1], [0, 1, 3, 1], [2, 1, 0, 2], [1, 0, 1, 3]];
    const K = [[1, 0, 1], [0, 1, 0], [1, 0, 1]];
    const O = [0, 1].map(p => [0, 1].map(q => { let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += K[i][j] * I[p + i][q + j]; return s; }));
    const terms = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) terms.push(I[i][j] + "·" + K[i][j]);
    D.convCalc = svg(560, 230,
      T(92, 22, "input 4 × 4", "bold") + grid(20, 35, I, 36, (i, j) => i < 3 && j < 3 ? "hl" : "c") +
      T(200, 112, "*", "lg bold") +
      T(277, 22, "kernel 3 × 3", "bold") + grid(223, 53, K, 36, () => "wn") +
      T(372, 112, "=", "lg bold") +
      T(450, 22, "output 2 × 2", "bold") + grid(406, 63, O, 44, (i, j) => i === 0 && j === 0 ? "hl" : "c") +
      T(280, 200, terms.join(" + ") + " = " + O[0][0], "sm") +
      T(280, 222, "output size = (4 - 3)/1 + 1 = 2. Slide by stride, repeat.", "lbl"),
      "Convolution worked example");
  })();

  (function () {
    const I = [[1, 3, 2, 1], [2, 8, 0, 4], [5, 1, 7, 2], [0, 2, 3, 6]];
    const q = (i, j) => ["hl", "gd", "wn", "bd"][(i >> 1) * 2 + (j >> 1)];
    const win = (p, r) => [I[2 * p][2 * r], I[2 * p][2 * r + 1], I[2 * p + 1][2 * r], I[2 * p + 1][2 * r + 1]];
    const MX = [0, 1].map(p => [0, 1].map(r => Math.max(...win(p, r))));
    const AV = [0, 1].map(p => [0, 1].map(r => win(p, r).reduce((a, b) => a + b) / 4));
    D.pool = svg(560, 200,
      T(92, 20, "input 4 × 4", "bold") + grid(20, 30, I, 36, q) +
      A(175, 100, 240, 70) + A(175, 100, 240, 140) + T(205, 175, "2×2, stride 2", "lbl") +
      T(298, 26, "max pool", "bold") + grid(250, 34, MX, 48, (i, j) => q(2 * i, 2 * j)) +
      T(468, 26, "average pool", "bold") + grid(420, 34, AV, 48, (i, j) => q(2 * i, 2 * j), v => f1(v)) +
      T(380, 160, "4 × 4 → 2 × 2, no weights (0 parameters)", "lbl") +
      T(380, 182, "max of [1 3; 2 8] = 8, average = 14/4 = 3.5", "lbl"),
      "Max and average pooling");
  })();

  (function () {
    const cx = i => 100 + i * 40 + 20;
    let s = "";
    for (let i = 0; i < 9; i++) s += R(100 + i * 40, 165, 40, 30, i >= 2 && i <= 6 ? "hl" : "c");
    for (let i = 0; i < 9; i++) s += R(100 + i * 40, 95, 40, 30, i >= 3 && i <= 5 ? "hl" : "c");
    s += R(260, 25, 40, 30, "wn");
    for (let i = 3; i <= 5; i++) s += Ln(280, 55, cx(i), 95, "ln");
    for (let i = 3; i <= 5; i++) for (let d = -1; d <= 1; d++) s += Ln(cx(i), 125, cx(i + d), 165, "ln thin");
    D.rf = svg(560, 225,
      s + T(90, 45, "layer 2", "lbl", "end") + T(90, 115, "layer 1", "lbl", "end") + T(90, 185, "input", "lbl", "end") +
      T(470, 45, "1 unit", "bold", "start") + T(470, 115, "sees 3", "bold", "start") + T(470, 185, "sees 5", "bold", "start") +
      T(280, 215, "two 3×3 convs (stride 1): r = 1 + 2 × (3 - 1) = 5, so a 5 × 5 receptive field", "lbl"),
      "Receptive field growth");
  })();

  D.cnnPipe = svg(560, 150,
    [["image", "224×224×3", "b"], ["conv+ReLU", "edges", "b"], ["pool", "shrink", "b ok"], ["conv+ReLU", "parts", "b"], ["pool", "shrink", "b ok"], ["FC+softmax", "classes", "b or"]].map(([a, b, c], i) =>
      B(3 + i * 93, 44, 82, 56, a, c, b) + (i < 5 ? A(85 + i * 93, 72, 95 + i * 93, 72) : "")).join("") +
    T(280, 130, "spatial size shrinks and channels grow as you go deeper", "lbl"),
    "CNN pipeline");

  D.resblock = svg(560, 170,
    T(25, 115, "x", "lg bold") + A(40, 110, 90, 110) + B(90, 92, 80, 36, "conv") + A(170, 110, 200, 110) + B(200, 92, 70, 36, "ReLU") +
    A(270, 110, 300, 110) + B(300, 92, 80, 36, "conv") + A(380, 110, 418, 110) +
    C(430, 110, 13, "op") + T(430, 116, "+", "bold") + A(443, 110, 480, 110) + T(485, 115, "F(x) + x", "bold", "start") +
    P("M40,104 C60,20 400,20 430,96", "ln p2", true) + T(235, 38, "identity shortcut (skip connection): x", "to bold") +
    T(235, 150, "the block only learns the correction F(x); if F(x) = 0 it just passes x", "lbl"),
    "ResNet residual block");

  D.iou = svg(560, 220,
    (function () {
      let g = ""; for (let i = 0; i <= 8; i++) g += T(40 + i * 40, 212, i, "lbl sm"); for (let j = 0; j <= 4; j++) g += T(30, 194 - j * 40, j, "lbl sm", "end"); return g;
    })() +
    R(40, 30, 240, 160, "boxA") + R(120, 30, 240, 160, "boxB") + R(120, 30, 160, 160, "inter") +
    T(80, 55, "A", "lg bold") + T(330, 55, "B", "lg bold") + T(200, 115, "I = 4 × 4 = 16", "bold") +
    T(385, 50, "A: (0,0) to (6,4) → 24", "", "start") + T(385, 75, "B: (2,0) to (8,4) → 24", "", "start") +
    T(385, 100, "overlap: 4 wide × 4 high", "", "start") + T(385, 125, "Union = 24 + 24 - 16 = 32", "", "start") +
    T(385, 160, "IoU = 16 / 32 = 0.50", "ta lg bold", "start"),
    "IoU example");

  (function () {
    const a = [40, 40, 160, 130], b = [62, 58, 160, 122], c = [280, 60, 110, 110];
    const io = (p, q) => {
      const w = Math.max(0, Math.min(p[0] + p[2], q[0] + q[2]) - Math.max(p[0], q[0]));
      const h = Math.max(0, Math.min(p[1] + p[3], q[1] + q[3]) - Math.max(p[1], q[1]));
      const I = w * h; return I / (p[2] * p[3] + q[2] * q[3] - I);
    };
    const bx = (r, cls, lab) => R(...r, cls) + R(r[0], r[1] - 18, 74, 18, cls + " tagbg") + T(r[0] + 37, r[1] - 5, lab, "sm bold");
    D.nms = svg(560, 220,
      bx(b, "nmsBad", "cat 0.75") + bx(a, "nmsGood", "cat 0.92") + bx(c, "nmsGood", "cat 0.80") +
      T(410, 40, "1. keep top: cat 0.92", "tg", "start") +
      T(410, 70, "2. cat 0.75: IoU = " + io(a, b).toFixed(2), "tb", "start") + T(422, 88, "> 0.5 → remove", "tb", "start") +
      T(410, 118, "3. cat 0.80: IoU = " + io(a, c).toFixed(2), "tg", "start") + T(422, 136, "→ keep (other cat)", "tg", "start") +
      T(410, 170, "different class boxes", "lbl", "start") + T(410, 186, "are never compared", "lbl", "start"),
      "Non-max suppression");
  })();

  // ===== L8 Sequences and NLP =====
  D.rnnCell = svg(560, 200,
    B(10, 22, 100, 40, "h(t-1) = 0.4", "b") + B(10, 128, 100, 40, "x(t) = 2", "b or") +
    A(110, 42, 250, 92) + T(175, 50, "× wₕ 0.25 = 0.1", "bold") +
    A(110, 148, 250, 108) + T(175, 152, "× wₓ 0.5 = 1.0", "bold") +
    C(265, 100, 15, "op") + T(265, 106, "+", "lg bold") + A(280, 100, 330, 100, "1.1", "ln", 0, -8) +
    B(330, 82, 70, 36, "tanh") + A(400, 100, 440, 100) + B(440, 80, 115, 40, "h(t) = 0.800", "b ok") +
    T(280, 192, "h(t) becomes the next step's h(t-1). Same weights every step.", "lbl"),
    "Simple RNN hidden state update");

  (function () {
    const panel = (x0, ins, outs, t1, t2) => {
      let s = "";
      for (let i = 0; i < 3; i++) {
        const x = x0 + 20 + i * 50;
        s += R(x, 60, 34, 30, "hl", 5);
        if (i < 2) s += A(x + 34, 75, x + 50, 75);
        if (ins[i]) s += A(x + 17, 125, x + 17, 92) + C(x + 17, 133, 8, "dot2");
        if (outs[i]) s += A(x + 17, 60, x + 17, 30) + C(x + 17, 22, 8, "dot1");
      }
      return s + T(x0 + 87, 162, t1, "bold") + T(x0 + 87, 180, t2, "lbl");
    };
    D.seqTypes = svg(560, 190,
      panel(5, [1, 0, 0], [1, 1, 1], "one-to-many", "image captioning") +
      panel(190, [1, 1, 1], [0, 0, 1], "many-to-one", "sentiment") +
      panel(375, [1, 1, 1], [1, 1, 1], "many-to-many", "translation"),
      "RNN input output patterns");
  })();

  D.attention = svg(560, 240,
    B(5, 100, 70, 40, "query q", "b or") +
    B(110, 40, 60, 36, "k₁") + B(110, 164, 60, 36, "k₂") +
    A(75, 112, 108, 62) + A(75, 128, 108, 180) + T(92, 152, "q·k", "lbl") +
    T(240, 22, "softmax weights", "bold") +
    R(195, 46, 30, 24, "barw") + T(232, 63, "0.3", "bold", "start") +
    R(195, 170, 70, 24, "barw") + T(272, 187, "0.7", "bold", "start") +
    A(170, 58, 192, 58) + A(170, 182, 192, 182) +
    B(310, 40, 120, 36, "0.3 × [2, 0]", "b", "") + B(310, 164, 120, 36, "0.7 × [0, 2]", "b", "") +
    T(370, 92, "= [0.6, 0]", "lbl") + T(370, 216, "= [0, 1.4]", "lbl") +
    A(430, 58, 460, 108) + A(430, 182, 460, 132) +
    B(460, 100, 95, 40, "[0.6, 1.4]", "b ok") + T(507, 160, "output", "lbl") +
    T(240, 120, "weights sum to 1", "lbl") + T(370, 128, "values v", "lbl"),
    "Attention weighted sum");

  D.embed = svg(560, 230,
    axes({ x: 30, y: 20, w: 500, h: 180 }, "", "") +
    C(110, 170, 6, "dot1") + T(110, 190, "man", "", "middle") + C(110, 80, 6, "dot1") + T(110, 70, "woman") +
    C(280, 160, 6, "dot1") + T(280, 182, "king") + C(280, 70, 6, "dot1") + T(280, 60, "queen") +
    A(110, 164, 110, 88) + A(280, 154, 280, 78) + `<line class="ln dash" x1="116" y1="170" x2="272" y2="160"/>` + `<line class="ln dash" x1="116" y1="80" x2="272" y2="70"/>` +
    T(195, 122, "same offset", "lbl") +
    C(430, 160, 6, "dot2") + T(430, 182, "cat") + C(470, 140, 6, "dot2") + T(490, 136, "dog", "", "start") + C(455, 175, 6, "dot2") + T(462, 196, "puppy", "", "start") +
    C(460, 50, 6, "dot4") + T(470, 46, "car", "", "start") +
    T(280, 222, "king - man + woman ≈ queen. Similar words sit close together.", "lbl"),
    "Word embedding space");

  D.w2v = svg(560, 200,
    T(140, 18, "CBOW: context → centre", "bold") +
    ["the", "cat", "on", "mat"].map((w, i) => B(10, 30 + i * 36, 60, 28, w) + A(70, 44 + i * 36, 140, 100)).join("") +
    B(140, 82, 50, 36, "sum") + A(190, 100, 215, 100) + B(215, 82, 55, 36, "sat", "b ok") +
    T(420, 18, "Skip-gram: centre → context", "bold") +
    B(300, 82, 55, 36, "sat", "b or") +
    ["the", "cat", "on", "mat"].map((w, i) => A(355, 100, 478, 44 + i * 36) + B(480, 30 + i * 36, 60, 28, w, "b ok")).join("") +
    T(280, 190, "sentence: the cat [sat] on mat, window = 2 words each side", "lbl"),
    "CBOW vs skip-gram");

  // ===== L9 Generative =====
  D.vae = svg(560, 210,
    T(14, 105, "x", "lg bold") +
    `<polygon class="trap" points="25,30 120,65 120,135 25,170"/>` + T(70, 105, "Encoder", "lbl") +
    A(120, 85, 150, 60) + A(120, 115, 150, 140) + B(150, 42, 54, 34, "μ") + B(150, 124, 54, 34, "σ") +
    A(204, 59, 240, 90) + A(204, 141, 240, 110) + B(240, 78, 105, 44, "z = μ + σ·ε", "b ok") +
    A(292, 165, 292, 124) + T(292, 182, "ε ~ N(0, 1)", "lbl") +
    A(345, 100, 370, 100) + `<polygon class="trap" points="370,65 465,30 465,170 370,135"/>` + T(418, 105, "Decoder", "lbl") +
    T(478, 105, "x̂", "lg bold", "start") +
    T(280, 205, "loss = reconstruction ||x - x̂||² + KL( N(μ, σ) || N(0, I) )", "bold") +
    T(500, 30, "generate:", "lbl", "middle") + T(500, 47, "sample z,", "lbl") + T(500, 64, "decode", "lbl"),
    "Variational autoencoder");

  // ===== L10 Logic =====
  (function () {
    let g = "";
    const info = { "1,1": ["A", "no breeze", "gd"], "1,2": ["¬P", "safe", "gd"], "2,1": ["B", "breeze", "c"], "2,2": ["P?", "", "wn"], "3,1": ["P?", "", "wn"] };
    for (let x = 1; x <= 4; x++) for (let y = 1; y <= 4; y++) {
      const X = 40 + (x - 1) * 50, Y = 20 + (4 - y) * 50, k = x + "," + y, inf = info[k];
      g += R(X, Y, 50, 50, inf ? inf[2] : "c");
      if (inf) g += T(X + 25, Y + 24, inf[0], "bold") + (inf[1] ? T(X + 25, Y + 40, inf[1], "sm") : "");
    }
    for (let i = 1; i <= 4; i++) g += T(15 + i * 50, 238, i, "lbl") + T(30, 50 + (4 - i) * 50, i, "lbl", "end");
    D.wumpus = svg(560, 245,
      g + T(260, 40, "[x, y] = column x, row y", "lbl", "start") +
      T(260, 75, "No breeze in [1,1] (R4) and R2", "", "start") + T(260, 95, "→ no pit in [1,2] or [2,1]", "tg bold", "start") +
      T(260, 135, "Breeze in [2,1] (R5) and R3", "", "start") + T(260, 155, "→ pit in [2,2] or [3,1]", "to bold", "start") +
      T(260, 195, "Query: KB ⊨ ¬P₁,₂ ? Yes.", "bold", "start"),
      "Wumpus world");
  })();

  D.resolution = svg(560, 210,
    B(20, 15, 200, 36, "P₁,₂", "b or", "negated query") + B(250, 15, 180, 36, "¬P₁,₂ ∨ B₁,₁", "b", "from R2 in CNF") +
    A(120, 51, 210, 98) + A(340, 51, 250, 98) + B(170, 98, 120, 36, "B₁,₁", "b") +
    B(340, 98, 130, 36, "¬B₁,₁", "b", "R4") +
    A(230, 134, 270, 160) + A(405, 134, 320, 160) + B(220, 160, 140, 40, "□ empty clause", "b no") +
    T(380, 190, "contradiction → KB ⊨ ¬P₁,₂", "tg bold", "start") +
    T(160, 121, "P₁,₂ and ¬P₁,₂ cancel", "lbl", "end"),
    "Resolution proof tree");

  D.entail = svg(560, 200,
    R(20, 15, 330, 170, "c", 10) + T(35, 35, "all models", "lbl", "start") +
    `<ellipse class="zoneB" cx="185" cy="110" rx="140" ry="65"/>` + T(270, 75, "M(γ)", "bold") +
    `<ellipse class="zoneA" cx="140" cy="115" rx="65" ry="38"/>` + T(140, 120, "M(KB)", "bold") +
    T(370, 70, "KB ⊨ γ means:", "bold", "start") + T(370, 95, "every model where KB", "lbl", "start") +
    T(370, 113, "is true also makes γ true.", "lbl", "start") + T(370, 140, "M(KB) ⊆ M(γ)", "ta lg bold", "start"),
    "Entailment as model subsets");

  // ===== L11 Probability =====
  D.condVenn = svg(560, 200,
    R(20, 15, 320, 170, "c", 10) + T(35, 35, "all outcomes", "lbl", "start") +
    `<circle class="zoneA" cx="140" cy="105" r="65"/>` + `<circle class="zoneB" cx="225" cy="105" r="65"/>` +
    `<path class="inter" d="M182.5,55.6 A65,65 0 0 1 182.5,154.4 A65,65 0 0 1 182.5,55.6 Z"/>` +
    T(105, 110, "A", "lg bold") + T(262, 110, "B", "lg bold") + T(182, 110, "A∧B", "bold") +
    T(360, 70, "P(A | B) = P(A ∧ B) / P(B)", "bold", "start") + T(360, 95, "Zoom into B only.", "lbl", "start") +
    T(360, 113, "What fraction of B is", "lbl", "start") + T(360, 131, "also A?", "lbl", "start"),
    "Conditional probability Venn");

  D.enumTree = svg(560, 270,
    B(215, 8, 130, 30, "P(b) = .001", "b or") +
    A(250, 38, 150, 78, ".002", "ln", -12, 0) + A(310, 38, 410, 78, ".998", "ln", 12, 0) +
    N(140, 90, "e", "n", 15) + N(420, 90, "¬e", "n", 15) +
    A(132, 104, 75, 150, ".95", "ln", -12, 0) + A(148, 104, 205, 150, ".05", "ln", 12, 0) +
    A(412, 104, 355, 150, ".94", "ln", -12, 0) + A(428, 104, 485, 150, ".06", "ln", 12, 0) +
    [[70, "a"], [210, "¬a"], [350, "a"], [490, "¬a"]].map(([x, t]) => N(x, 162, t, "n", 15) + A(x, 177, x, 198)).join("") +
    [[70, ".90 × .70"], [210, ".05 × .01"], [350, ".90 × .70"], [490, ".05 × .01"]].map(([x, t]) => B(x - 50, 200, 100, 28, t, "b ok")).join("") +
    T(280, 245, "P(j|a) × P(m|a) at each leaf. Multiply along a path, add all paths.", "lbl") +
    T(280, 264, "P(b, j, m) ≈ 0.000592 → normalise with ¬b (0.001492) → P(b | j, m) ≈ 0.284", "bold"),
    "Enumeration tree");

  // ===== L12 Knowledge =====
  D.ontology = svg(560, 240,
    B(60, 15, 130, 34, "Person", "b") + B(60, 105, 130, 34, "Student", "b") + B(380, 105, 150, 34, "Course", "b") +
    B(60, 195, 130, 32, "Alice", "b obj") + B(380, 195, 150, 32, "DataAnalytics", "b obj") +
    A(125, 105, 125, 51, "subClassOf", "ln", 8, 0) + A(125, 195, 125, 141, "instanceOf", "ln", 8, 0) + A(455, 195, 455, 141, "instanceOf", "ln", 8, 0) +
    A(190, 211, 378, 211, "enrolsIn", "ln", 0, -6) +
    `<line class="ln dash" x1="190" y1="122" x2="378" y2="122" marker-end="url(#ah)"/>` + T(284, 112, "enrolsIn: domain Student,", "lbl") + T(284, 158, "range Course (axiom)", "lbl") +
    P("M60,211 C10,211 10,32 58,32", "ln dash grn", true) + T(8, 125, "inferred", "tg sm", "start") +
    T(380, 40, "reasoner infers:", "bold", "start") + T(380, 60, "Alice is a Person", "tg", "start"),
    "Ontology example");

  D.kg = svg(560, 250,
    B(195, 95, 170, 40, "Douglas Adams", "b or", "Q42") +
    B(15, 15, 140, 32, "Cambridge") + B(405, 15, 140, 32, "human (Q5)") +
    B(15, 185, 140, 32, "writer") + B(360, 185, 185, 32, "Hitchhiker's Guide") +
    A(225, 95, 120, 49, "place of birth", "ln", -8, -2) + A(335, 95, 440, 49, "instance of (P31)", "ln", 10, -2) +
    A(225, 135, 120, 183, "occupation", "ln", -40, 0) + A(335, 135, 440, 183, "notable work", "ln", 50, 0) +
    T(280, 244, "triple: (Douglas Adams, place of birth, Cambridge)", "lbl"),
    "Knowledge graph triples");

  Object.assign(window.SVG, D);
})();
