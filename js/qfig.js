// Context pictures for quiz questions. They show the setup (map, data, boxes, network), never the answer.
// QFIG_MAP["topic-index"] = figure key. app.js shows QFIG[key] above the question.
(function () {
  const T = (x, y, t, cls = "", a = "middle") => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${a}">${t}</text>`;
  const R = (x, y, w, h, cls = "c", rx = 0) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
  const C = (x, y, r, cls = "c") => `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>`;
  const L = (x1, y1, x2, y2, cls = "ln") => `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const A = (x1, y1, x2, y2, cls = "ln") => `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#qah)"/>`;
  const B = (x, y, w, h, t, cls = "b", t2 = "") => (/^(wn|bd|gd|hl)$/.test(cls) ? `<g><rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>` : `<g class="${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>`) +
    (t2 ? T(x + w / 2, y + h / 2 - 3, t) + T(x + w / 2, y + h / 2 + 13, t2, "sm") : T(x + w / 2, y + h / 2 + 5, t)) + `</g>`;
  const defs = `<defs><marker id="qah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ahp"/></marker></defs>`;
  const svg = (w, h, inner, title) => `<svg class="diagram" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}">${defs}${inner}</svg>`;
  const grid = (x, y, M, s, clsFn = () => "c") => M.map((row, i) => row.map((v, j) =>
    R(x + j * s, y + i * s, s, s, clsFn(i, j)) + (v === "" ? "" : T(x + j * s + s / 2, y + i * s + s / 2 + 5, v))).join("")).join("");
  const F = {};

  // ---------- L2 Romania ----------
  const cities = { Arad: [91, 492, 366], Zerind: [108, 531, 374], Oradea: [131, 571, 380], Timisoara: [94, 410, 329], Lugoj: [165, 379, 244],
    Sibiu: [207, 457, 253], Fagaras: [305, 449, 176], "Rimnicu Vilcea": [233, 410, 193], Pitesti: [320, 368, 100], Craiova: [253, 288, 160], Bucharest: [400, 327, 0] };
  const roads = [["Arad", "Zerind", 75], ["Arad", "Timisoara", 118], ["Arad", "Sibiu", 140], ["Zerind", "Oradea", 71], ["Oradea", "Sibiu", 151],
    ["Timisoara", "Lugoj", 111], ["Sibiu", "Fagaras", 99], ["Sibiu", "Rimnicu Vilcea", 80], ["Fagaras", "Bucharest", 211], ["Rimnicu Vilcea", "Pitesti", 97],
    ["Rimnicu Vilcea", "Craiova", 146], ["Pitesti", "Bucharest", 101], ["Craiova", "Pitesti", 138]];
  const cx = n => 96 + (cities[n][0] - 91) * 1.3, cy = n => 34 + (571 - cities[n][1]) * 1.15;
  const lblPos = { Arad: [-8, 0, "end"], Zerind: [-8, 0, "end"], Oradea: [-8, 0, "end"], Timisoara: [-8, 0, "end"], Lugoj: [8, 12, "start"],
    Sibiu: [0, -12, "middle"], Fagaras: [0, -12, "middle"], "Rimnicu Vilcea": [-8, 16, "end"], Pitesti: [10, -6, "start"], Craiova: [-10, 4, "end"], Bucharest: [0, 20, "middle"] };
  const roadLbl = { "Arad-Zerind": [10, 4], "Zerind-Oradea": [10, 4], "Arad-Timisoara": [-14, 4], "Arad-Sibiu": [0, -6], "Sibiu-Rimnicu Vilcea": [-12, 2], "Rimnicu Vilcea-Pitesti": [2, -8], "Craiova-Pitesti": [12, 6], "Pitesti-Bucharest": [0, -8] };
  F.romania = svg(650, 384,
    roads.map(([a, b, c]) => { const o = roadLbl[a + "-" + b] || [0, -5]; return L(cx(a), cy(a), cx(b), cy(b)) + T((cx(a) + cx(b)) / 2 + o[0] + 4, (cy(a) + cy(b)) / 2 + o[1], c, "lbl bold"); }).join("") +
    Object.keys(cities).map(n => { const p = lblPos[n]; return C(cx(n), cy(n), 6, n === "Arad" ? "hl" : n === "Bucharest" ? "gd" : "c2") + T(cx(n) + p[0], cy(n) + p[1] + 4, n, "sm", p[2]); }).join("") +
    R(500, 30, 140, 238, "c2", 8) + T(570, 50, "h(n) to Bucharest", "sm bold") +
    Object.keys(cities).map((n, i) => T(510, 72 + i * 18, n, "sm", "start") + T(630, 72 + i * 18, cities[n][2], "sm bold", "end")).join("") +
    T(325, 378, "Numbers on roads = step cost. Start Arad, goal Bucharest. h = straight-line distance.", "lbl"),
    "Romania road map with step costs and straight-line distances to Bucharest");
  F.gh2 = svg(420, 120, B(30, 30, 160, 56, "Node A", "wn", "g = 400 · h = 50") + B(230, 30, 160, 56, "Node B", "b", "g = 100 · h = 80") +
    T(210, 112, "g = cost so far, h = estimate to goal", "lbl"), "Two frontier nodes with g and h");

  // ---------- L3 ----------
  const qboard = (x, y, n, s, rows) => { let o = ""; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) o += R(x + j * s, y + i * s, s, s, (i + j) % 2 ? "c2" : "c");
    rows.forEach((r, j) => { o += C(x + j * s + s / 2, y + r * s + s / 2, s * 0.32, "dot1") + T(x + j * s + s / 2, y + r * s + s / 2 + 4, "Q", "wq"); });
    const j = 1, r = rows[1]; for (let i = 0; i < n; i++) if (i !== r) o += A(x + j * s + s / 2, y + r * s + s / 2 + (i > r ? 8 : -8), x + j * s + s / 2, y + i * s + s / 2 + (i > r ? -6 : 6), "ln blue thin");
    return o; };
  F.queens8 = svg(560, 270, qboard(30, 14, 8, 30, [3, 6, 2, 7, 1, 4, 0, 5]) + T(400, 80, "One queen per column.", "sm") + T(400, 100, "A move: slide ONE queen", "sm") + T(400, 118, "to another square in its column", "sm") + T(400, 136, "(blue arrows for column 2).", "sm") + T(400, 170, "Count the moves for all queens.", "lbl"), "8 by 8 board, one queen per column");
  F.queens4 = svg(460, 160, qboard(30, 14, 4, 32, [1, 3, 0, 2]) + T(310, 60, "One queen per column.", "sm") + T(310, 80, "A move: slide ONE queen", "sm") + T(310, 98, "within its column.", "sm") + T(310, 128, "Count the moves for all queens.", "lbl"), "4 by 4 board, one queen per column");
  F.roulette = svg(460, 150, [24, 23, 20, 11].map((f, i) => R(110, 18 + i * 30, f * 10, 22, ["hl", "wn", "gd", "bd"][i], 4) + T(100, 34 + i * 30, "#" + (i + 1), "sm", "end") + T(118 + f * 10, 34 + i * 30, "fitness " + f, "sm", "start")).join("") +
    T(230, 142, "Slice of the wheel is proportional to fitness", "lbl"), "Fitness of four individuals");
  const bits = (x, y, s, cut, cls) => s.split("").map((b, i) => R(x + i * 26, y, 26, 26, cls(i)) + T(x + i * 26 + 13, y + 18, b)).join("") + (cut ? L(x + cut * 26, y - 8, x + cut * 26, y + 34, "ln red") : "");
  F.crossover = svg(420, 120, T(40, 38, "P1", "sm bold") + bits(60, 20, "11110000", 4, i => i < 4 ? "hl" : "c") + T(40, 84, "P2", "sm bold") + bits(60, 66, "00001111", 4, i => i < 4 ? "wn" : "c") +
    T(330, 64, "cut after", "lbl", "start") + T(330, 80, "position 4", "lbl", "start"), "Two parents with a cut point after position 4");

  // ---------- L4 ----------
  const dots = (x, y, p, n, per = 6) => { let o = ""; for (let i = 0; i < p + n; i++) o += C(x + (i % per) * 16, y + Math.floor(i / per) * 16, 6, i < p ? "dot3" : "dot4"); return o; };
  const node = (x, y, w, p, n, lab) => R(x, y, w, 64, "c2", 8) + T(x + w / 2, y + 18, lab, "sm bold") + dots(x + w / 2 - (Math.min(p + n, 6) - 1) * 8, y + 34, p, n) + T(x + w / 2, y + 80, `${p}+ / ${n}−`, "sm");
  const legend = (x, y) => C(x, y, 6, "dot3") + T(x + 10, y + 4, "positive", "lbl", "start") + C(x + 80, y, 6, "dot4") + T(x + 90, y + 4, "negative", "lbl", "start");
  F.node33 = svg(300, 120, node(80, 10, 140, 3, 3, "node") + legend(80, 108), "Node with 3 positive and 3 negative");
  F.node60 = svg(300, 120, node(80, 10, 140, 6, 0, "pure node") + legend(80, 108), "Node with 6 positive");
  F.node24 = svg(300, 120, node(80, 10, 140, 2, 4, "node") + legend(80, 108), "Node with 2 positive and 4 negative");
  const split = (title, kids) => { const w = 560, kw = Math.min(118, (w - 20) / kids.length - 10); const gap = (w - kids.length * kw) / (kids.length + 1);
    return node(w / 2 - 80, 6, 160, 6, 6, "WillWait (12)") + kids.map((k, i) => { const x = gap + i * (kw + gap); return L(w / 2, 92, x + kw / 2, 130) + T((w / 2 + x + kw / 2) / 2 + (x + kw / 2 < w / 2 ? -6 : 6), 118, k[0], "lbl bold", x + kw / 2 < w / 2 ? "end" : "start") + node(x, 132, kw, k[1], k[2], title + " = " + k[0]); }).join("") + legend(w / 2 - 70, 236); };
  F.patrons = svg(560, 244, split("Patrons", [["None", 0, 2], ["Some", 4, 0], ["Full", 2, 4]]), "Restaurant data split on Patrons");
  F.type = svg(560, 244, split("Type", [["French", 1, 1], ["Italian", 1, 1], ["Thai", 2, 2], ["Burger", 2, 2]]), "Restaurant data split on Type");
  F.both = svg(560, 140, R(10, 10, 540, 120, "c2", 8) + T(140, 34, "Split on Type", "sm bold") + T(420, 34, "Split on Patrons", "sm bold") +
    ["French 1+/1−", "Italian 1+/1−", "Thai 2+/2−", "Burger 2+/2−"].map((t, i) => T(140, 58 + i * 18, t, "sm")).join("") +
    ["None 0+/2−", "Some 4+/0−", "Full 2+/4−"].map((t, i) => T(420, 58 + i * 18, t, "sm")).join("") + L(280, 24, 280, 122, "ln dash"), "Branch counts for Type and Patrons");
  F.knn = svg(420, 216, R(10, 10, 400, 180, "c2", 8) + C(210, 100, 7, "hl") + T(210, 84, "?", "bold") +
    [[150, 70, "A"], [270, 60, "B"], [250, 150, "B"], [160, 140, "A"], [290, 110, "B"]].map(([x, y, l]) => L(210, 100, x, y, "ln dash thin") + C(x, y, 11, l === "A" ? "dot1" : "dot2") + T(x, y + 4, l, "wq")).join("") +
    C(210, 100, 86, "ring") + T(210, 210, "query point and its 5 nearest neighbours", "lbl"), "Five nearest neighbours");
  const bx = { x: 50, y: 20, w: 220, h: 150 }, px = v => bx.x + v / 3 * bx.w, py = v => bx.y + bx.h - v / 6 * bx.h;
  F.sse = svg(420, 200, A(bx.x, bx.y + bx.h, bx.x + bx.w + 10, bx.y + bx.h, "ax") + A(bx.x, bx.y + bx.h, bx.x, bx.y - 6, "ax") +
    [1, 2, 3].map(v => T(px(v), bx.y + bx.h + 16, v, "lbl")).join("") + [2, 4, 6].map(v => T(bx.x - 8, py(v) + 4, v, "lbl", "end")).join("") +
    L(px(0), py(0), px(3), py(6), "p1") + C(px(1), py(3), 6, "dot2") + C(px(2), py(3), 6, "dot2") + T(px(1) + 8, py(3) - 8, "(1, 3)", "sm", "start") + T(px(2) + 8, py(3) + 18, "(2, 3)", "sm", "start") +
    T(330, 70, "line h(x) = 2x", "sm") + T(330, 92, "orange = data", "lbl") + T(330, 110, "error = y − h(x)", "lbl"), "Line h(x)=2x and two data points");
  const cm = (tp, fp, fn, tn) => T(170, 18, "Predicted", "sm bold") + T(120, 40, "+", "bold") + T(220, 40, "−", "bold") + T(40, 100, "Actual", "sm bold") + T(66, 78, "+", "bold") + T(66, 138, "−", "bold") +
    R(80, 50, 90, 56, "gd", 6) + T(125, 74, "TP", "sm") + T(125, 94, tp, "bold") + R(176, 50, 90, 56, "bd", 6) + T(221, 74, "FN", "sm") + T(221, 94, fn, "bold") +
    R(80, 110, 90, 56, "bd", 6) + T(125, 134, "FP", "sm") + T(125, 154, fp, "bold") + R(176, 110, 90, 56, "gd", 6) + T(221, 134, "TN", "sm") + T(221, 154, tn, "bold");
  F.conf = svg(300, 176, cm(40, 10, 20, "–"), "Confusion matrix with TP 40, FP 10, FN 20");

  // ---------- L5 ----------
  F.perc = svg(480, 150, B(20, 20, 90, 40, "x₁ = 1", "wn") + B(20, 90, 90, 40, "x₂ = 1", "wn") + C(250, 75, 22, "hl") + T(250, 81, "Σ", "bold") +
    A(110, 40, 228, 68) + T(160, 42, "w₁ = 0.6", "sm") + A(110, 110, 228, 82) + T(160, 120, "w₂ = −0.2", "sm") + A(250, 18, 250, 52) + T(250, 14, "bias = −0.5", "sm") +
    A(272, 75, 330, 75) + B(330, 55, 70, 40, "step") + A(400, 75, 440, 75) + T(455, 80, "?", "bold") + T(365, 120, "step: 1 if sum ≥ 0, else 0", "lbl"), "Perceptron with two inputs");

  // ---------- L6 ----------
  const gw = (x, y, s) => { let o = ""; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const cls = r === 1 && c === 1 ? "wall" : r === 0 && c === 3 ? "gd" : r === 1 && c === 3 ? "bd" : "c"; o += R(x + c * s, y + r * s, s, s, cls); }
    return o + T(x + 3 * s + s / 2, y + s / 2 + 5, "+1", "bold") + T(x + 3 * s + s / 2, y + s * 1.5 + 5, "−1", "bold") + T(x + s / 2, y + 2.5 * s + 5, "start", "lbl"); };
  F.grid = svg(480, 186, gw(20, 10, 50) + C(370, 85, 12, "dot1") + A(370, 70, 370, 24, "ln blue") + T(370, 18, "intended: Up", "sm") + A(355, 85, 300, 85, "ln dash") + A(385, 85, 440, 85, "ln dash") +
    T(300, 110, "slip?", "lbl") + T(440, 110, "slip?", "lbl") + T(240, 182, "4 × 3 grid world. Grey = wall. Moves are not always as intended.", "lbl"), "4 by 3 grid world");
  F.qtree = svg(460, 170, C(230, 24, 16, "hl") + T(230, 29, "s") + A(230, 40, 230, 62) + C(230, 70, 7, "dot1") + T(244, 66, "action a, R = 0, γ = 1", "sm", "start") +
    [[90, "0.8", "s1", "U = 1"], [230, "0.1", "s2", "U = 0"], [370, "0.1", "s3", "U = 0.5"]].map(([x, p, s, u]) => A(230, 76, x, 118) + T((230 + x) / 2 + (x < 230 ? -8 : x > 230 ? 8 : 10), 100, p, "sm bold", x < 230 ? "end" : "start") + C(x, 132, 14, "c2") + T(x, 137, s, "sm") + T(x, 162, u, "sm")).join(""), "One action with three outcomes");
  F.rewards = svg(420, 100, ["−1", "−1", "+10"].map((r, i) => C(70 + i * 140, 44, 22, i === 2 ? "gd" : "bd") + T(70 + i * 140, 50, r, "bold") + T(70 + i * 140, 88, "step " + i, "lbl") + (i < 2 ? A(94 + i * 140, 44, 186 + i * 140, 44) : "")).join(""), "Rewards -1, -1, +10 over three steps");
  F.meu = svg(460, 170, C(60, 85, 14, "hl") + A(74, 80, 170, 46) + A(74, 90, 170, 124) + B(170, 28, 90, 36, "Route A") + B(170, 106, 90, 36, "Route B") +
    A(260, 40, 340, 22) + T(300, 22, "80%", "sm", "end") + B(340, 6, 100, 30, "U = +10", "b obj") + A(260, 52, 340, 66) + T(300, 72, "20%", "sm", "end") + B(340, 54, 100, 30, "U = −10", "wn") +
    A(260, 124, 340, 124) + T(300, 118, "100%", "sm") + B(340, 110, 100, 30, "U = +7", "b obj"), "Two routes with outcomes");

  // ---------- L7 ----------
  const conv = (n, k, pad, stride, label) => { const shown = Math.min(n, 9), s = n > 9 ? 20 : 24, ps = pad ? s : 0, top = stride > 1 ? 22 : 0, x0 = 20 + ps, y0 = 16 + top + ps; let o = "";
    if (pad) for (let i = -1; i <= shown; i++) for (let j = -1; j <= shown; j++) if (i < 0 || j < 0 || (n <= 9 && (i === shown || j === shown))) o += R(x0 + j * s, y0 + i * s, s, s, "c2") + T(x0 + j * s + s / 2, y0 + i * s + s / 2 + 4, "0", "lbl");
    for (let i = 0; i < shown; i++) for (let j = 0; j < shown; j++) o += R(x0 + j * s, y0 + i * s, s, s, "c");
    const kx = pad ? x0 - s : x0, ky = pad ? y0 - s : y0; o += R(kx, ky, k * s, k * s, "hl") + `<rect x="${kx}" y="${ky}" width="${k * s}" height="${k * s}" class="hl" style="fill-opacity:.35"/>`;
    if (stride > 1) o += A(kx + k * s / 2, ky - 6, kx + k * s / 2 + stride * s, ky - 6, "ln blue") + T(kx + k * s / 2 + stride * s / 2, ky - 10, "jump " + stride, "sm");
    const W = 20 + 2 * ps + shown * s; o += T(20, 16 + top + 2 * ps + shown * s + 18, label, "sm bold", "start");
    const tx = W + 40; o += T(tx, 50, `input ${n} × ${n}`, "sm", "start") + T(tx, 72, `kernel ${k} × ${k} (blue)`, "sm", "start") + T(tx, 94, `padding ${pad}`, "sm", "start") + T(tx, 116, `stride ${stride}`, "sm", "start");
    return svg(Math.max(tx + 170, 420), 16 + top + 2 * ps + shown * s + 30, o, "Convolution setup"); };
  F.conv5 = conv(5, 3, 0, 1, "5 × 5 input");
  F.conv32 = conv(32, 3, 1, 1, "top-left corner of 32 × 32 (0 = padding)");
  F.conv9 = conv(9, 3, 0, 2, "9 × 9 input");
  const cube = (x, y, s, ch, cls) => { let o = ""; for (let c = ch - 1; c >= 0; c--) o += R(x + c * 7, y - c * 7, s, s, cls[c % cls.length]); return o; };
  F.filters2 = svg(520, 150, cube(30, 40, 80, 3, ["bd", "gd", "hl"]) + T(80, 140, "RGB input: 3 channels", "sm") +
    cube(230, 50, 42, 3, ["bd", "gd", "hl"]) + T(255, 120, "filter 1", "sm") + cube(330, 50, 42, 3, ["bd", "gd", "hl"]) + T(355, 120, "filter 2", "sm") +
    T(430, 60, "each 3 × 3,", "sm", "start") + T(430, 78, "covers all 3", "sm", "start") + T(430, 96, "channels,", "sm", "start") + T(430, 114, "+ 1 bias each", "sm", "start"), "Two 3 by 3 filters over RGB input");
  F.filters10 = svg(520, 150, cube(30, 40, 80, 3, ["bd", "gd", "hl"]) + T(80, 140, "input: 3 channels", "sm") +
    [0, 1, 2].map(i => cube(220 + i * 62, 50, 46, 3, ["bd", "gd", "hl"])).join("") + T(420, 80, "… × 10", "bold", "start") + T(300, 130, "ten 5 × 5 filters, + 1 bias each", "sm"), "Ten 5 by 5 filters over 3-channel input");
  F.pool = svg(320, 110, grid(30, 10, [["4", "1"], ["7", "2"]], 40, () => "hl") + T(70, 104, "2 × 2 window", "sm") + T(220, 50, "max = ?", "sm") + T(220, 72, "average = ?", "sm"), "Pooling window 4 1 7 2");
  F.patch = svg(460, 140, grid(20, 10, [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]], 34, () => "c") + T(71, 132, "patch", "sm") + T(150, 66, "⊙", "bold") +
    grid(180, 10, [["1", "0", "0"], ["0", "1", "0"], ["0", "0", "1"]], 34, (i, j) => i === j ? "hl" : "c") + T(231, 132, "kernel", "sm") + T(320, 58, "multiply matching cells,", "sm", "start") + T(320, 76, "then add all 9", "sm", "start"), "3 by 3 patch and diagonal kernel");
  const iouFig = (a, b, mx, my) => { const s = Math.min(240 / mx, 150 / my), ox = 40, oy = 20 + my * s, X = v => ox + v * s, Y = v => oy - v * s; let o = "";
    for (let v = 0; v <= mx; v++) o += L(X(v), oy, X(v), oy - my * s, "ln thin") + T(X(v), oy + 16, v, "lbl"); for (let v = 0; v <= my; v++) o += L(ox, Y(v), ox + mx * s, Y(v), "ln thin") + T(ox - 8, Y(v) + 4, v, "lbl", "end");
    o += `<rect class="boxA" x="${X(a[0])}" y="${Y(a[3])}" width="${(a[2] - a[0]) * s}" height="${(a[3] - a[1]) * s}"/>` + `<rect class="boxB" x="${X(b[0])}" y="${Y(b[3])}" width="${(b[2] - b[0]) * s}" height="${(b[3] - b[1]) * s}"/>`;
    o += T(X(a[0]) + 12, Y(a[3]) + 18, "A", "bold") + T(X(b[2]) - 12, Y(b[1]) - 8, "B", "bold");
    const tx = ox + mx * s + 30; o += T(tx, 50, `A: (${a[0]},${a[1]}) to (${a[2]},${a[3]})`, "sm", "start") + T(tx, 72, `B: (${b[0]},${b[1]}) to (${b[2]},${b[3]})`, "sm", "start") + T(tx, 100, "IoU = overlap ÷ union", "lbl", "start");
    return svg(tx + 170, oy + 26, o, "Two boxes on a grid"); };
  F.iou44 = iouFig([0, 0, 4, 4], [2, 2, 6, 6], 6, 6);
  F.iou64 = iouFig([0, 0, 6, 4], [2, 0, 8, 4], 8, 4);
  const det = (x, y, w, h, lab, cls) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="3" style="fill:none;stroke-width:2.5"/>` + R(x, y - 18, lab.length * 7 + 10, 18, cls + " tagbg", 3) + T(x + 5, y - 5, lab, "sm bold", "start");
  F.nmsSame = svg(460, 170, det(40, 34, 150, 110, "A: cat 0.9", "nmsGood") + det(110, 54, 150, 110, "B: cat 0.7", "nmsBad") + T(350, 70, "same class", "sm") + T(350, 92, "IoU(A, B) = 0.5", "sm") + T(350, 114, "rule: suppress if IoU > 0.5", "sm"), "Two same-class boxes");
  F.nmsDiff = svg(460, 170, det(40, 34, 150, 110, "A: car 0.9", "nmsGood") + det(70, 52, 150, 110, "B: person 0.8", "nmsBad") + T(350, 70, "different classes", "sm") + T(350, 92, "IoU(A, B) = 0.8", "sm") + T(350, 114, "threshold 0.5", "sm"), "Two different-class boxes");

  // ---------- L8 ----------
  const rnn = (x, wx, h, wh, b) => svg(520, 150, B(20, 14, 110, 40, `h(t−1) = ${h}`, "b") + B(20, 96, 110, 40, `x(t) = ${x}`, "wn") + C(280, 75, 18, "c2") + T(280, 81, "+", "bold") +
    A(130, 34, 262, 68) + T(196, 38, `× w_h = ${wh}`, "sm") + A(130, 116, 262, 82) + T(196, 122, `× w_x = ${wx}`, "sm") + (b !== undefined ? A(280, 12, 280, 56) + T(310, 16, `bias ${b}`, "sm", "start") : "") +
    A(298, 75, 350, 75) + T(324, 68, "sum", "lbl") + B(350, 55, 70, 40, "tanh") + A(420, 75, 460, 75) + B(460, 55, 50, 40, "h(t)", "b obj"), "RNN cell with given numbers");
  F.rnn1 = rnn(2, 0.5, 0.4, 0.25);
  F.rnn2 = rnn(1, 0.6, 0.5, 0.8, 0.1);
  const vec = (x, y, v, cls) => v.map((n, i) => R(x + i * 34, y, 34, 30, cls) + T(x + i * 34 + 17, y + 20, n)).join("");
  const att = (ws, vs) => svg(460, 40 + ws.length * 46, ws.map((w, i) => { const y = 20 + i * 46; return R(20, y + 6, w * 140, 18, "hl", 3) + T(30 + w * 140, y + 20, "weight " + w, "sm", "start") + T(250, y + 20, "×", "bold") + vec(275, y, vs[i], "c2") + T(275 + vs[i].length * 34 + 10, y + 20, "value " + (i + 1), "lbl", "start"); }).join("") +
    T(230, 30 + ws.length * 46, "output = add up (weight × value), component by component", "lbl"), "Attention weights and value vectors");
  F.att2 = att([0.3, 0.7], [[2, 0], [0, 2]]);
  F.att3 = att([0.5, 0.25, 0.25], [[4, 0], [0, 4], [8, 8]]);

  // ---------- L10 ----------
  F.wumpus = svg(420, 170, grid(30, 10, [["", ""], ["", ""]], 70, (i, j) => i === 1 && j === 0 ? "gd" : "c") + T(65, 130, "[1,1]", "lbl") + T(65, 112, "no breeze", "sm") + T(135, 130, "[2,1]", "lbl") + T(65, 60, "[1,2]", "lbl") + T(135, 60, "[2,1]".replace("2,1", "2,2"), "lbl") +
    T(65, 40, "P?", "bold") + T(135, 112, "P?", "bold") + T(290, 60, "Breeze = a pit next door", "sm") + T(290, 82, "[x,y] = column, row", "lbl"), "Wumpus corner with no breeze in 1,1");

  // ---------- L11 ----------
  const tbl = (x, y, head, rows, w) => { let o = R(x, y, w, 20 + rows.length * 17, "c2", 6); o += T(x + w / 2, y + 14, head, "sm bold"); rows.forEach((r, i) => { o += T(x + 8, y + 32 + i * 17, r[0], "sm", "start") + T(x + w - 8, y + 32 + i * 17, r[1], "sm bold", "end"); }); return o; };
  const node2 = (x, y, t, lab) => C(x, y, 20, "hl") + T(x, y + 5, t, "bold") + T(x, y + 36, lab, "lbl");
  F.burglary = svg(600, 330, node2(170, 40, "B", "Burglary") + node2(430, 40, "E", "Earthquake") + node2(300, 150, "A", "Alarm") + node2(170, 262, "J", "JohnCalls") + node2(430, 262, "M", "MaryCalls") +
    A(186, 52, 282, 138) + A(414, 52, 318, 138) + A(286, 166, 186, 246) + A(314, 166, 414, 246) +
    tbl(10, 20, "P(B)", [["b", "0.001"]], 110) + tbl(480, 20, "P(E)", [["e", "0.002"]], 110) +
    tbl(10, 108, "P(a | B, E)", [["b, e", "0.95"], ["b, ¬e", "0.94"], ["¬b, e", "0.29"], ["¬b, ¬e", "0.001"]], 130) +
    tbl(10, 200, "P(j | A)", [["a", "0.90"], ["¬a", "0.05"]], 110) + tbl(480, 200, "P(m | A)", [["a", "0.70"], ["¬a", "0.01"]], 110), "Burglary network with probability tables");
  F.bayesTree = svg(460, 170, C(40, 85, 10, "hl") + A(50, 80, 150, 40) + A(50, 90, 150, 130) + B(150, 22, 90, 36, "D", "bd") + T(100, 46, "0.01", "sm bold", "end") + B(150, 112, 90, 36, "¬D", "gd") + T(100, 132, "0.99", "sm bold", "end") +
    A(240, 40, 330, 22) + T(290, 22, "0.9", "sm bold", "end") + B(330, 6, 70, 30, "+", "wn") + A(240, 130, 330, 112) + T(290, 112, "0.05", "sm bold", "end") + B(330, 96, 70, 30, "+", "wn") +
    T(230, 166, "tree of P(D) then P(+ | D)", "lbl"), "Disease test probability tree");
  F.machines = svg(500, 170, C(40, 85, 10, "hl") + [["M1", "50%", "2%"], ["M2", "30%", "3%"], ["M3", "20%", "5%"]].map(([m, p, d], i) => { const y = 30 + i * 55; return A(50, 85, 160, y) + T(110, y + (i === 0 ? 30 : i === 2 ? -6 : -4), p, "sm bold") + B(160, y - 18, 80, 36, m) + A(240, y, 330, y) + T(285, y - 6, d, "sm bold") + B(330, y - 15, 110, 30, "defective", "bd"); }).join(""), "Three machines with defect rates");

  // ---------- L12 ----------
  F.chain = svg(460, 80, B(20, 22, 110, 36, "Canary") + A(130, 40, 170, 40) + T(150, 32, "is-a", "lbl") + B(170, 22, 110, 36, "Bird") + A(280, 40, 320, 40) + T(300, 32, "is-a", "lbl") + B(320, 22, 110, 36, "Animal"), "Canary is-a Bird is-a Animal");
  F.pingu = svg(460, 210, B(160, 14, 140, 44, "Bird", "b", "can fly") + A(230, 104, 230, 60) + T(242, 86, "is-a", "lbl", "start") + B(160, 104, 140, 44, "Penguin", "b", "cannot fly") + A(230, 190, 230, 150) + T(242, 174, "member", "lbl", "start") + B(170, 188 - 10, 120, 30, "Pingu", "b obj"), "Pingu is a Penguin, Penguin is a Bird");
  F.legs = svg(460, 140, B(160, 14, 140, 44, "Person", "b", "Legs = 2") + A(230, 100, 230, 60) + T(242, 84, "member", "lbl", "start") + B(160, 100, 140, 36, "John", "b obj", "Legs = 1") , "John is a Person with Legs = 1");

  window.QFIG = F;
  const M = {
    "l2-4": "romania", "l2-5": "romania", "l2-6": "romania", "l2-7": "romania", "l2-8": "romania", "l2-9": "gh2", "l2-18": "romania", "l2-20": "romania", "l2-21": "romania", "l2-22": "romania", "l2-23": "romania",
    "l3-1": "queens8", "l3-2": "queens4", "l3-10": "roulette", "l3-11": "crossover",
    "l4-1": "node33", "l4-2": "node60", "l4-3": "node24", "l4-4": "patrons", "l4-10": "knn", "l4-11": "sse", "l4-15": "conf", "l4-18": "type", "l4-19": "patrons", "l4-20": "both",
    "l5-5": "perc",
    "l6-1": "grid", "l6-2": "qtree", "l6-6": "rewards", "l6-15": "meu",
    "l7-0": "conv5", "l7-1": "conv32", "l7-2": "conv9", "l7-3": "filters2", "l7-4": "filters10", "l7-6": "pool", "l7-11": "iou44", "l7-12": "iou64", "l7-13": "nmsSame", "l7-14": "nmsDiff", "l7-17": "patch",
    "l8-0": "rnn1", "l8-1": "rnn1", "l8-2": "rnn2", "l8-4": "att2", "l8-5": "att3",
    "l10-16": "wumpus",
    "l11-1": "bayesTree", "l11-3": "burglary", "l11-4": "burglary", "l11-5": "burglary", "l11-6": "burglary", "l11-16": "burglary", "l11-17": "burglary", "l11-18": "burglary", "l11-19": "burglary",
    "l11-20": "burglary", "l11-21": "burglary", "l11-22": "burglary", "l11-24": "burglary", "l11-26": "burglary", "l11-29": "burglary", "l11-31": "machines",
    "l12-1": "chain", "l12-2": "pingu", "l12-3": "legs"
  };
  window.QFIG_MAP = M;
  window.qfigHTML = q => { const k = q.fig || (q.id && M[q.id]); if (!k || !F[k]) return ""; const w = +(F[k].match(/viewBox="0 0 (\d+)/) || [0, 0])[1];
    return `<div class="qfig${w >= 540 ? " wide" : ""}">${F[k]}</div>${w >= 540 ? `<div class="qfig-hint">Swipe the picture sideways to see all of it →</div>` : ""}`; };
})();
