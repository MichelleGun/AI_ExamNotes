// Interactive widgets / animations. Each widget: function(el)
window.WIDGETS = (function () {
  const h = (html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; };
  const rd = (x, d = 3) => Math.round(x * 10 ** d) / 10 ** d;
  const num = (el, sel) => parseFloat(el.querySelector(sel).value);

  // ---------- Romania search ----------
  const RO = {
    pos: { Arad: [91, 492], Bucharest: [400, 327], Craiova: [253, 288], Drobeta: [165, 299], Eforie: [562, 293], Fagaras: [305, 449], Giurgiu: [375, 270], Hirsova: [534, 350], Iasi: [473, 506], Lugoj: [165, 379], Mehadia: [168, 339], Neamt: [406, 537], Oradea: [131, 571], Pitesti: [320, 368], Rimnicu: [233, 410], Sibiu: [207, 457], Timisoara: [94, 410], Urziceni: [456, 350], Vaslui: [509, 444], Zerind: [108, 531] },
    e: [["Arad", "Zerind", 75], ["Arad", "Sibiu", 140], ["Arad", "Timisoara", 118], ["Zerind", "Oradea", 71], ["Oradea", "Sibiu", 151], ["Timisoara", "Lugoj", 111], ["Lugoj", "Mehadia", 70], ["Mehadia", "Drobeta", 75], ["Drobeta", "Craiova", 120], ["Craiova", "Rimnicu", 146], ["Craiova", "Pitesti", 138], ["Sibiu", "Fagaras", 99], ["Sibiu", "Rimnicu", 80], ["Rimnicu", "Pitesti", 97], ["Fagaras", "Bucharest", 211], ["Pitesti", "Bucharest", 101], ["Bucharest", "Giurgiu", 90], ["Bucharest", "Urziceni", 85], ["Urziceni", "Hirsova", 98], ["Hirsova", "Eforie", 86], ["Urziceni", "Vaslui", 142], ["Vaslui", "Iasi", 92], ["Iasi", "Neamt", 87]],
    hs: { Arad: 366, Bucharest: 0, Craiova: 160, Drobeta: 242, Eforie: 161, Fagaras: 176, Giurgiu: 77, Hirsova: 151, Iasi: 226, Lugoj: 244, Mehadia: 241, Neamt: 234, Oradea: 380, Pitesti: 100, Rimnicu: 193, Sibiu: 253, Timisoara: 329, Urziceni: 80, Vaslui: 199, Zerind: 374 }
  };
  RO.adj = {}; RO.e.forEach(([a, b, c]) => { (RO.adj[a] = RO.adj[a] || []).push([b, c]); (RO.adj[b] = RO.adj[b] || []).push([a, c]); });
  Object.values(RO.adj).forEach(l => l.sort((x, y) => x[0].localeCompare(y[0])));

  function search(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Animation: search on the Romania map (goal Bucharest)</div>
      <div class="row"><label>Algorithm <select class="alg"><option>BFS</option><option>DFS</option><option>UCS</option><option>Greedy</option><option selected>A*</option></select></label>
      <label>Start <select class="start">${Object.keys(RO.pos).sort().filter(c => c !== "Bucharest").map(c => `<option ${c === "Arad" ? "selected" : ""}>${c}</option>`).join("")}</select></label>
      <button class="btn step">Step</button><button class="btn run">Run</button><button class="btn ghost reset">Reset</button></div>
      <div class="searchgrid"><div class="mapwrap"></div><div class="slog"></div></div>
      <p class="small">Graph search. Goal test when a node is removed from the frontier. Ties broken alphabetically. Orange = frontier, blue = expanded, green = final path.</p></div>`));
    const map = el.querySelector(".mapwrap"), log = el.querySelector(".slog");
    const X = x => x * 0.95 - 50, Y = y => (590 - y) * 0.95;
    let svg = `<svg viewBox="0 0 560 320" class="romania">`;
    RO.e.forEach(([a, b, c]) => { const [x1, y1] = RO.pos[a], [x2, y2] = RO.pos[b]; svg += `<line data-e="${[a, b].sort().join("-")}" x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}"/><text class="ec" x="${(X(x1) + X(x2)) / 2}" y="${(Y(y1) + Y(y2)) / 2 - 2}">${c}</text>`; });
    Object.entries(RO.pos).forEach(([n, [x, y]]) => { svg += `<g data-n="${n}"><circle cx="${X(x)}" cy="${Y(y)}" r="6"/><text x="${X(x) + 8}" y="${Y(y) + 4}">${n.slice(0, 4)} <tspan class="hval">h${RO.hs[n]}</tspan></text></g>`; });
    map.innerHTML = svg + "</svg>";
    let st = null, timer = null;
    const f = (alg, g, n, depth) => alg === "UCS" ? g : alg === "Greedy" ? RO.hs[n] : alg === "A*" ? g + RO.hs[n] : depth;
    function reset() {
      clearInterval(timer); timer = null;
      const alg = el.querySelector(".alg").value, s = el.querySelector(".start").value;
      st = { alg, frontier: [{ n: s, g: 0, d: 0, path: [s], order: 0 }], expanded: [], reached: { [s]: 0 }, done: false, cnt: 1, steps: [] };
      draw();
    }
    function popIdx() {
      const F = st.frontier, alg = st.alg;
      if (alg === "BFS") return 0;
      if (alg === "DFS") return F.length - 1;
      let bi = 0;
      F.forEach((x, i) => { const a = f(alg, x.g, x.n), b = f(alg, F[bi].g, F[bi].n); if (a < b || (a === b && x.n < F[bi].n)) bi = i; });
      return bi;
    }
    function step() {
      if (!st || st.done) return;
      if (!st.frontier.length) { st.done = true; st.steps.push("Frontier empty: failure"); draw(); return; }
      const node = st.frontier.splice(popIdx(), 1)[0];
      if (st.expanded.includes(node.n)) { st.steps.push(`Skip ${node.n} (already expanded)`); draw(); return; }
      const fv = st.alg === "BFS" || st.alg === "DFS" ? "" : ` f=${f(st.alg, node.g, node.n)}`;
      if (node.n === "Bucharest") { st.done = true; st.path = node.path; st.steps.push(`<b>Pop Bucharest${fv}. GOAL. Path cost ${node.g}</b>`); draw(); return; }
      st.expanded.push(node.n);
      const kids = (RO.adj[node.n] || []).map(([c, w]) => [c, w]);
      const order = st.alg === "DFS" ? kids.slice().reverse() : kids;
      const added = [];
      order.forEach(([c, w]) => {
        if (st.expanded.includes(c)) return;
        const g = node.g + w;
        if (st.alg === "BFS" || st.alg === "DFS") { if (c in st.reached) return; }
        else if (c in st.reached && st.reached[c] <= g) return;
        st.reached[c] = g; st.frontier = st.frontier.filter(x => x.n !== c || st.alg === "BFS" || st.alg === "DFS");
        st.frontier.push({ n: c, g, d: node.d + 1, path: [...node.path, c] }); added.push(c);
      });
      st.steps.push(`Expand <b>${node.n}</b>${fv} → add ${added.join(", ") || "nothing"}`);
      draw();
    }
    function draw() {
      map.querySelectorAll("g").forEach(g => { const n = g.dataset.n; g.setAttribute("class", st.path && st.path.includes(n) ? "path" : st.expanded.includes(n) ? "exp" : st.frontier.some(x => x.n === n) ? "fr" : ""); });
      map.querySelectorAll("line").forEach(l => l.classList.remove("path"));
      if (st.path) for (let i = 0; i < st.path.length - 1; i++) { const k = [st.path[i], st.path[i + 1]].sort().join("-"); const l = map.querySelector(`line[data-e="${k}"]`); if (l) l.classList.add("path"); }
      const alg = st.alg; const show = alg === "BFS" || alg === "DFS";
      const fr = st.frontier.map(x => `${x.n} (g=${x.g}${show ? "" : alg === "UCS" ? "" : `, h=${RO.hs[x.n]}`}${show ? "" : `, f=${f(alg, x.g, x.n)}`})`);
      log.innerHTML = `<div><b>Frontier</b> (${alg === "BFS" ? "FIFO: front first" : alg === "DFS" ? "LIFO: last is top" : "priority queue"}):<br>${fr.join("<br>") || "empty"}</div><div class="mt"><b>Steps</b><ol>${st.steps.map(s => `<li>${s}</li>`).join("")}</ol></div>` + (st.path ? `<div class="ok">Path: ${st.path.join(" → ")}</div>` : "");
    }
    el.querySelector(".step").onclick = step;
    el.querySelector(".run").onclick = () => { if (timer) { clearInterval(timer); timer = null; return; } timer = setInterval(() => { step(); if (st.done) { clearInterval(timer); timer = null; } }, 600); };
    el.querySelector(".reset").onclick = reset;
    el.querySelector(".alg").onchange = reset; el.querySelector(".start").onchange = reset;
    reset();
  }

  // ---------- n-queens cost ----------
  function queens(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Try it: 8-queens cost (attacking pairs)</div>
      <div class="row"><label>State (row of queen in each column) <input class="qs" value="2,4,7,4,8,5,5,2" size="18"></label><button class="btn go">Compute</button><button class="btn ghost hc">Hill-climb 1 step</button></div>
      <div class="qboard"></div><div class="out"></div></div>`));
    const cost = s => { let c = 0; for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) if (s[i] === s[j] || Math.abs(s[i] - s[j]) === j - i) c++; return c; };
    const parse = () => el.querySelector(".qs").value.split(/[ ,]+/).map(Number).filter(x => x > 0);
    function show() {
      const s = parse(), n = s.length; let b = `<div class="board" style="grid-template-columns:repeat(${n},1fr)">`;
      for (let r = n; r >= 1; r--) for (let c = 0; c < n; c++) b += `<div class="sq ${(r + c) % 2 ? "d" : ""}">${s[c] === r ? "♛" : ""}</div>`;
      el.querySelector(".qboard").innerHTML = b + "</div>";
      el.querySelector(".out").innerHTML = `Cost = <b>${cost(s)}</b> attacking pairs. Successors = ${n} × ${n - 1} = ${n * (n - 1)}.`;
    }
    el.querySelector(".go").onclick = show;
    el.querySelector(".hc").onclick = () => {
      const s = parse(), n = s.length; let best = s, bc = cost(s);
      for (let c = 0; c < n; c++) for (let r = 1; r <= n; r++) if (r !== s[c]) { const t = s.slice(); t[c] = r; const k = cost(t); if (k < bc) { bc = k; best = t; } }
      if (best === s) { el.querySelector(".out").innerHTML = `No better neighbour. <b>Stuck</b> (cost ${bc}). ${bc ? "This is a local minimum of cost." : "Goal reached!"}`; return; }
      el.querySelector(".qs").value = best.join(","); show();
    };
    show();
  }

  // ---------- SA probability ----------
  function sa(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Try it: SA acceptance probability p = e<sup>-ΔE/T</sup></div>
      <div class="row"><label>ΔE <input type="range" class="de" min="0" max="20" step="0.5" value="2"> <span class="dev"></span></label>
      <label>T <input type="range" class="t" min="0.5" max="40" step="0.5" value="10"> <span class="tv"></span></label></div>
      <div class="bar"><div class="fill"></div></div><div class="out"></div></div>`));
    const up = () => { const d = num(el, ".de"), t = num(el, ".t"), p = Math.exp(-d / t); el.querySelector(".dev").textContent = d; el.querySelector(".tv").textContent = t; el.querySelector(".fill").style.width = (p * 100) + "%"; el.querySelector(".out").innerHTML = `p = e^(-${d}/${t}) = <b>${rd(p, 4)}</b>. ${p > 0.5 ? "Likely to accept the worse move (exploring)." : p > 0.1 ? "Sometimes accepts." : "Almost never accepts (like hill climbing)."}`; };
    el.querySelectorAll("input").forEach(i => i.oninput = up); up();
  }

  // ---------- Decision tree calculator ----------
  function dtree(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Calculator: compare attributes (IG and Gini)</div>
      <p class="small">One line per branch: positives,negatives. Example below is Patrons.</p>
      <div class="row"><textarea class="br" rows="4">0,2\n4,0\n2,4</textarea><button class="btn go">Calculate</button></div><div class="out"></div></div>`));
    const lg = x => x ? Math.log2(x) : 0, H = (p, n) => { const t = p + n; if (!t) return 0; const a = p / t, b = n / t; return -(a * lg(a)) - (b * lg(b)); }, G = (p, n) => { const t = p + n; return t ? 1 - (p / t) ** 2 - (n / t) ** 2 : 0; };
    const go = () => {
      const k = el.querySelector(".br").value.trim().split(/\n+/).map(l => l.split(/[ ,]+/).map(Number));
      const P = k.reduce((s, c) => s + c[0], 0), N = k.reduce((s, c) => s + c[1], 0), T = P + N;
      const rem = k.reduce((s, c) => s + (c[0] + c[1]) / T * H(c[0], c[1]), 0), wg = k.reduce((s, c) => s + (c[0] + c[1]) / T * G(c[0], c[1]), 0);
      el.querySelector(".out").innerHTML = `<table class="tbl"><tr><th>Branch</th><th>+/-</th><th>Weight</th><th>Entropy</th><th>Gini</th></tr>` +
        k.map((c, i) => `<tr><td>${i + 1}</td><td>${c[0]}/${c[1]}</td><td>${c[0] + c[1]}/${T}</td><td>${rd(H(c[0], c[1]), 4)}</td><td>${rd(G(c[0], c[1]), 4)}</td></tr>`).join("") +
        `</table>Parent ${P}+/${N}-: H = ${rd(H(P, N), 4)}, Gini = ${rd(G(P, N), 4)}<br>Remainder = <b>${rd(rem, 4)}</b> → IG = <b>${rd(H(P, N) - rem, 4)}</b><br>Weighted Gini = <b>${rd(wg, 4)}</b> → Gini reduction = <b>${rd(G(P, N) - wg, 4)}</b>`;
    };
    el.querySelector(".go").onclick = go; go();
  }

  // ---------- MLP forward + backprop one step ----------
  function mlp(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Try it: forward pass + one backprop step (2-2-1, sigmoid, no bias)</div>
      <div class="row small">x1 <input class="v" data-k="x1" value="1" size="3"> x2 <input class="v" data-k="x2" value="0" size="3"> y <input class="v" data-k="y" value="1" size="3"> α <input class="v" data-k="a" value="0.5" size="3"></div>
      <div class="row small">w13 <input class="v" data-k="w13" value="0.5" size="3"> w23 <input class="v" data-k="w23" value="-0.5" size="3"> w14 <input class="v" data-k="w14" value="0.3" size="3"> w24 <input class="v" data-k="w24" value="0.8" size="3"> w35 <input class="v" data-k="w35" value="1" size="3"> w45 <input class="v" data-k="w45" value="-1" size="3"></div>
      <button class="btn go">Compute</button><div class="out"></div></div>`));
    const s = z => 1 / (1 + Math.exp(-z));
    const go = () => {
      const v = {}; el.querySelectorAll(".v").forEach(i => v[i.dataset.k] = parseFloat(i.value));
      const in3 = v.w13 * v.x1 + v.w23 * v.x2, a3 = s(in3), in4 = v.w14 * v.x1 + v.w24 * v.x2, a4 = s(in4), in5 = v.w35 * a3 + v.w45 * a4, y = s(in5);
      const L = (v.y - y) ** 2, d5 = -2 * (v.y - y) * y * (1 - y), d3 = a3 * (1 - a3) * v.w35 * d5, d4 = a4 * (1 - a4) * v.w45 * d5;
      el.querySelector(".out").innerHTML = `<b>Forward</b><br>in3 = ${rd(in3)}, a3 = σ = ${rd(a3, 4)}; in4 = ${rd(in4)}, a4 = ${rd(a4, 4)}<br>in5 = ${rd(in5, 4)}, ŷ = ${rd(y, 4)}, Loss = (y - ŷ)² = ${rd(L, 4)}<br>
      <b>Backward</b><br>Δ5 = -2(y - ŷ)ŷ(1 - ŷ) = ${rd(d5, 4)}<br>Δ3 = a3(1-a3)·w35·Δ5 = ${rd(d3, 4)}; Δ4 = ${rd(d4, 4)}<br>
      w35 ← ${v.w35} - α·a3·Δ5 = <b>${rd(v.w35 - v.a * a3 * d5, 4)}</b>; w45 ← <b>${rd(v.w45 - v.a * a4 * d5, 4)}</b><br>w13 ← ${v.w13} - α·x1·Δ3 = <b>${rd(v.w13 - v.a * v.x1 * d3, 4)}</b>`;
    };
    el.querySelector(".go").onclick = go; go();
  }

  // ---------- Grid world value iteration ----------
  function grid(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Animation: value iteration on the 4×3 grid world</div>
      <div class="row small"><label>γ <input class="g" value="1" size="3"></label><label>R (living) <input class="r" value="-0.04" size="5"></label><button class="btn step">1 iteration</button><button class="btn run">Run 20</button><button class="btn ghost reset">Reset</button><span class="it"></span></div>
      <div class="gw"></div><p class="small">0.8 intended, 0.1 each side, wall at (2,2). Arrows = best action (policy). Tap a square to see its Q-values.</p><div class="out"></div></div>`));
    const W = 4, Hh = 3, wall = "2,2", term = { "4,3": 1, "4,2": -1 }; const A = { U: [0, 1], D: [0, -1], L: [-1, 0], R: [1, 0] }; const side = { U: ["L", "R"], D: ["L", "R"], L: ["U", "D"], R: ["U", "D"] }; const arrow = { U: "↑", D: "↓", L: "←", R: "→" };
    let U = {}, it = 0;
    const states = []; for (let y = Hh; y >= 1; y--) for (let x = 1; x <= W; x++) states.push(x + "," + y);
    const move = (s, a) => { const [x, y] = s.split(",").map(Number); const nx = x + A[a][0], ny = y + A[a][1]; const k = nx + "," + ny; return nx < 1 || nx > W || ny < 1 || ny > Hh || k === wall ? s : k; };
    const Q = (s, a, g, R) => [[a, 0.8], [side[a][0], 0.1], [side[a][1], 0.1]].reduce((t, [b, p]) => { const s2 = move(s, b); return t + p * (R + g * U[s2]); }, 0);
    const best = (s, g, R) => Object.keys(A).reduce((b, a) => Q(s, a, g, R) > Q(s, b, g, R) ? a : b, "U");
    function reset() { states.forEach(s => U[s] = term[s] !== undefined ? term[s] : 0); it = 0; draw(); }
    function iter() { const g = num(el, ".g"), R = num(el, ".r"); const N = {}; states.forEach(s => { if (s === wall) return; N[s] = term[s] !== undefined ? term[s] : Math.max(...Object.keys(A).map(a => Q(s, a, g, R))); }); Object.assign(U, N); it++; draw(); }
    function draw() {
      const g = num(el, ".g"), R = num(el, ".r");
      el.querySelector(".gw").innerHTML = states.map(s => s === wall ? `<div class="cell wall"></div>` : `<div class="cell ${term[s] !== undefined ? (term[s] > 0 ? "win" : "lose") : ""}" data-s="${s}"><small>(${s})</small><b>${rd(U[s], 3)}</b>${term[s] === undefined && it ? `<span>${arrow[best(s, g, R)]}</span>` : ""}</div>`).join("");
      el.querySelector(".it").textContent = `iteration ${it}`;
      el.querySelectorAll(".cell[data-s]").forEach(c => c.onclick = () => { const s = c.dataset.s; if (term[s] !== undefined) return; el.querySelector(".out").innerHTML = `State (${s}): ` + Object.keys(A).map(a => `Q(${arrow[a]}) = ${rd(Q(s, a, g, R), 4)}`).join(", ") + `. U = max = ${rd(Math.max(...Object.keys(A).map(a => Q(s, a, g, R))), 4)}`; });
    }
    el.querySelector(".step").onclick = iter; el.querySelector(".run").onclick = () => { for (let i = 0; i < 20; i++) iter(); }; el.querySelector(".reset").onclick = reset; reset();
  }

  // ---------- Convolution animation ----------
  function conv(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Animation: 2D convolution (slide, multiply, sum)</div>
      <div class="row small"><label>Stride <select class="s"><option>1</option><option>2</option></select></label><label>Padding <select class="p"><option>0</option><option>1</option></select></label><label>Kernel <select class="k"><option value="diag">diagonal [1 0 0;0 1 0;0 0 1]</option><option value="ones">all ones</option><option value="edge">vertical edge [1 0 -1]</option></select></label>
      <button class="btn step">Next position</button><button class="btn run">Play</button><button class="btn ghost reset">Reset</button></div>
      <div class="convgrid"><div><small>Input (5×5)</small><div class="cin"></div></div><div><small>Kernel</small><div class="ck"></div></div><div><small>Output</small><div class="cout"></div></div></div><div class="out"></div></div>`));
    const K = { diag: [1, 0, 0, 0, 1, 0, 0, 0, 1], ones: [1, 1, 1, 1, 1, 1, 1, 1, 1], edge: [1, 0, -1, 1, 0, -1, 1, 0, -1] };
    let pos = -1, timer = null;
    const cfg = () => { const S = +el.querySelector(".s").value, P = +el.querySelector(".p").value, k = K[el.querySelector(".k").value]; const N = 5 + 2 * P; const O = Math.floor((5 + 2 * P - 3) / S) + 1; const inp = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const rr = r - P, cc = c - P; inp.push(rr < 0 || cc < 0 || rr > 4 || cc > 4 ? 0 : rr * 5 + cc + 1); } return { S, P, k, N, O, inp }; };
    function draw() {
      const { S, P, k, N, O, inp } = cfg(); const total = O * O; const pr = Math.floor(pos / O) * S, pc = (pos % O) * S;
      el.querySelector(".cin").innerHTML = `<div class="mat" style="grid-template-columns:repeat(${N},1fr)">` + inp.map((v, i) => { const r = Math.floor(i / N), c = i % N; const on = pos >= 0 && r >= pr && r < pr + 3 && c >= pc && c < pc + 3; const pad = r < P || c < P || r >= N - P || c >= N - P; return `<div class="${on ? "hl" : ""} ${pad ? "pad" : ""}">${v}</div>`; }).join("") + "</div>";
      el.querySelector(".ck").innerHTML = `<div class="mat" style="grid-template-columns:repeat(3,1fr)">` + k.map(v => `<div>${v}</div>`).join("") + "</div>";
      const outv = []; for (let i = 0; i < total; i++) { const r0 = Math.floor(i / O) * S, c0 = (i % O) * S; let s = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) s += inp[(r0 + a) * N + c0 + b] * k[a * 3 + b]; outv.push(s); }
      el.querySelector(".cout").innerHTML = `<div class="mat" style="grid-template-columns:repeat(${O},1fr)">` + outv.map((v, i) => `<div class="${i === pos ? "hl" : ""}">${i <= pos ? v : ""}</div>`).join("") + "</div>";
      if (pos >= 0) { let parts = []; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { const w = k[a * 3 + b]; if (w) parts.push(`${inp[(pr + a) * N + pc + b]}×${w}`); } el.querySelector(".out").innerHTML = `Position ${pos + 1}/${total}: ${parts.join(" + ")} = <b>${outv[pos]}</b>. Output size = (5 + 2×${P} - 3)/${S} + 1 = ${O}.`; }
      else el.querySelector(".out").innerHTML = `Output size = floor((5 + 2×${P} - 3)/${S}) + 1 = <b>${O}</b>. Press Next.`;
      return total;
    }
    const step = () => { const t = draw(); pos = (pos + 1) % t; draw(); };
    el.querySelector(".step").onclick = step;
    el.querySelector(".run").onclick = () => { if (timer) { clearInterval(timer); timer = null; return; } timer = setInterval(step, 700); };
    el.querySelector(".reset").onclick = () => { pos = -1; clearInterval(timer); timer = null; draw(); };
    el.querySelectorAll("select").forEach(s => s.onchange = () => { pos = -1; draw(); });
    draw();
  }

  // ---------- Receptive field ----------
  function rf(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Calculator: receptive field and output size</div>
      <p class="small">One layer per line: kernel,stride (e.g. 3,1). Pool 2×2 stride 2 = 2,2.</p>
      <div class="row"><textarea class="ls" rows="3">3,1\n2,2\n3,1</textarea><label>Input size <input class="n" value="32" size="4"></label><button class="btn go">Calculate</button></div><div class="out"></div></div>`));
    const go = () => { let r = 1, j = 1, n = num(el, ".n"); const rows = el.querySelector(".ls").value.trim().split(/\n+/).map(l => l.split(/[ ,]+/).map(Number)); const out = rows.map(([k, s], i) => { r = r + (k - 1) * j; j *= s; n = Math.floor((n - k) / s) + 1; return `<tr><td>${i + 1}</td><td>${k}×${k}, s${s}</td><td>${r}×${r}</td><td>${j}</td><td>${n}</td></tr>`; }); el.querySelector(".out").innerHTML = `<table class="tbl"><tr><th>Layer</th><th>K, stride</th><th>Receptive field</th><th>Jump</th><th>Output size (P=0)</th></tr>${out.join("")}</table>`; };
    el.querySelector(".go").onclick = go; go();
  }

  // ---------- IoU ----------
  function iou(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Try it: IoU of two boxes (corners)</div>
      <div class="row small">A: <input class="c" value="0" size="2"><input class="c" value="0" size="2"> to <input class="c" value="6" size="2"><input class="c" value="4" size="2"> &nbsp; B: <input class="c" value="2" size="2"><input class="c" value="0" size="2"> to <input class="c" value="8" size="2"><input class="c" value="4" size="2"> &nbsp; threshold <input class="th" value="0.4" size="3"></div>
      <div class="iousvg"></div><div class="out"></div></div>`));
    const go = () => {
      const c = [...el.querySelectorAll(".c")].map(i => +i.value); const [a1, a2, a3, a4, b1, b2, b3, b4] = c; const th = num(el, ".th");
      const iw = Math.max(0, Math.min(a3, b3) - Math.max(a1, b1)), ih = Math.max(0, Math.min(a4, b4) - Math.max(a2, b2)), I = iw * ih, A = (a3 - a1) * (a4 - a2), B = (b3 - b1) * (b4 - b2), U = A + B - I, io = U ? I / U : 0;
      const mx = Math.max(a3, b3, 10), my = Math.max(a4, b4, 6), s = 300 / Math.max(mx, my);
      const R = (x1, y1, x2, y2, cls) => `<rect class="${cls}" x="${x1 * s + 10}" y="${(my - y2) * s + 10}" width="${(x2 - x1) * s}" height="${(y2 - y1) * s}"/>`;
      el.querySelector(".iousvg").innerHTML = `<svg viewBox="0 0 ${mx * s + 20} ${my * s + 20}" class="iou">${R(a1, a2, a3, a4, "ba")}${R(b1, b2, b3, b4, "bb")}${iw && ih ? R(Math.max(a1, b1), Math.max(a2, b2), Math.min(a3, b3), Math.min(a4, b4), "bi") : ""}</svg>`;
      el.querySelector(".out").innerHTML = `Area A = ${A}, Area B = ${B}, Intersection = ${iw}×${ih} = ${I}, Union = ${U}<br>IoU = <b>${rd(io, 4)}</b>. If A has the higher score (same class) and the rule is IoU &gt; ${th}: <b>${io > th ? "suppress B" : "keep B"}</b>.`;
    };
    el.querySelectorAll("input").forEach(i => i.oninput = go); go();
  }

  // ---------- RNN ----------
  function rnn(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Try it: unroll a simple RNN over a sequence</div>
      <div class="row small"><label>inputs <input class="xs" value="2, 1, -1" size="10"></label><label>w<sub>x</sub> <input class="wx" value="0.5" size="3"></label><label>w<sub>h</sub> <input class="wh" value="0.25" size="3"></label><label>bias <input class="b" value="0" size="3"></label><label>h<sub>0</sub> <input class="h0" value="0.4" size="3"></label></div>
      <div class="out"></div></div>`));
    const go = () => { const xs = el.querySelector(".xs").value.split(/[ ,]+/).filter(Boolean).map(Number); let hh = num(el, ".h0"); const wx = num(el, ".wx"), wh = num(el, ".wh"), b = num(el, ".b"); const rows = xs.map((x, t) => { const s = wx * x + wh * hh + b; const n = Math.tanh(s); const r = `<tr><td>${t + 1}</td><td>${x}</td><td>${rd(hh, 3)}</td><td>${wx}×${x} + ${wh}×${rd(hh, 3)}${b ? " + " + b : ""} = ${rd(s, 3)}</td><td><b>${rd(n, 3)}</b></td></tr>`; hh = n; return r; }); el.querySelector(".out").innerHTML = `<table class="tbl"><tr><th>t</th><th>x<sub>t</sub></th><th>h<sub>t-1</sub></th><th>sum</th><th>h<sub>t</sub> = tanh(sum)</th></tr>${rows.join("")}</table><p class="small">Same weights at every step. The new state feeds into the next step.</p>`; };
    el.querySelectorAll("input").forEach(i => i.oninput = go); go();
  }

  // ---------- Attention ----------
  function attn(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Try it: attention from scores or weights</div>
      <div class="row small"><label>Scores (q·k) <input class="sc" value="0, 0.85" size="12"></label><label><input type="checkbox" class="isw"> these are already weights</label></div>
      <div class="row small"><label>Values (one per line) <textarea class="vs" rows="2">2,0\n0,2</textarea></label></div><div class="out"></div></div>`));
    const go = () => { let s = el.querySelector(".sc").value.split(/[ ,]+/).filter(Boolean).map(Number); const vs = el.querySelector(".vs").value.trim().split(/\n+/).map(l => l.split(/[ ,]+/).map(Number)); let w; if (el.querySelector(".isw").checked) w = s; else { const e = s.map(Math.exp); const t = e.reduce((a, b) => a + b, 0); w = e.map(x => x / t); } const d = vs[0] ? vs[0].length : 0; const o = []; for (let c = 0; c < d; c++) o.push(vs.reduce((a, v, i) => a + (w[i] || 0) * v[c], 0)); el.querySelector(".out").innerHTML = `Weights = [${w.map(x => rd(x, 3)).join(", ")}] (sum ${rd(w.reduce((a, b) => a + b, 0), 3)})<br>` + o.map((v, c) => `component ${c + 1}: ${vs.map((vv, i) => `${rd(w[i] || 0, 3)}×${vv[c]}`).join(" + ")} = <b>${rd(v, 3)}</b>`).join("<br>") + `<div class="bars">${w.map((x, i) => `<div><span style="width:${x * 100}%"></span>v${i + 1}</div>`).join("")}</div>`; };
    el.querySelectorAll("input,textarea").forEach(i => i.oninput = go); go();
  }

  // ---------- Truth table / model checking ----------
  function parseLogic(src) {
    const toks = src.replace(/<=>|<->|⇔/g, " ⇔ ").replace(/=>|->|⇒/g, " ⇒ ").replace(/[&∧]/g, " ∧ ").replace(/[|∨]/g, " ∨ ").replace(/[~!¬]/g, " ¬ ").replace(/\(/g, " ( ").replace(/\)/g, " ) ").split(/\s+/).filter(Boolean);
    let i = 0; const peek = () => toks[i], eat = t => { if (toks[i] !== t) throw new Error("Expected " + t); i++; };
    const syms = new Set();
    function prim() { const t = toks[i++]; if (t === "(") { const e = iff(); eat(")"); return e; } if (t === "¬") { const e = prim(); return v => !e(v); } if (!t || "∧∨⇒⇔)".includes(t)) throw new Error("Unexpected " + (t || "end")); if (t === "T" || t === "True") return () => true; if (t === "F" || t === "False") return () => false; syms.add(t); return v => v[t]; }
    function and() { let a = prim(); while (peek() === "∧") { i++; const b = prim(), x = a; a = v => x(v) && b(v); } return a; }
    function or() { let a = and(); while (peek() === "∨") { i++; const b = and(), x = a; a = v => x(v) || b(v); } return a; }
    function imp() { const a = or(); if (peek() === "⇒") { i++; const b = imp(); return v => !a(v) || b(v); } return a; }
    function iff() { let a = imp(); while (peek() === "⇔") { i++; const b = imp(), x = a; a = v => x(v) === b(v); } return a; }
    const f = iff(); if (i < toks.length) throw new Error("Unexpected " + toks[i]);
    return { f, syms };
  }
  function truth(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Tool: model checking (KB ⊨ query?)</div>
      <p class="small">Type with ~ (not), &amp; (and), | (or), =&gt; (implies), &lt;=&gt; (iff). One KB sentence per line. Symbols like B11, P12.</p>
      <div class="row"><textarea class="kb" rows="4">~P11\nB11 <=> (P12 | P21)\n~B11</textarea><label>Query <input class="qq" value="~P12" size="10"></label><button class="btn go">Check</button></div><div class="out"></div></div>`));
    const go = () => {
      try {
        const lines = el.querySelector(".kb").value.trim().split(/\n+/).filter(Boolean).map(parseLogic); const q = parseLogic(el.querySelector(".qq").value);
        const syms = [...new Set([...lines.flatMap(l => [...l.syms]), ...q.syms])].sort(); const n = syms.length; if (n > 12) throw new Error("Too many symbols");
        let rows = "", kbTrue = 0, ok = true;
        for (let m = 0; m < 2 ** n; m++) { const v = {}; syms.forEach((s, k) => v[s] = !!(m >> (n - 1 - k) & 1)); const kb = lines.every(l => l.f(v)); const qv = q.f(v); if (kb) { kbTrue++; if (!qv) ok = false; } if (n <= 5 || kb) rows += `<tr class="${kb ? (qv ? "good" : "bad") : ""}">${syms.map(s => `<td>${v[s] ? "T" : "F"}</td>`).join("")}<td>${kb ? "T" : "F"}</td><td>${qv ? "T" : "F"}</td></tr>`; }
        el.querySelector(".out").innerHTML = `${2 ** n} models, KB true in <b>${kbTrue}</b>. ${kbTrue === 0 ? "KB is unsatisfiable." : ok ? "<b class='okc'>KB ⊨ query</b> (query true in every KB-true model)." : "<b class='bad'>KB does not entail the query</b>."}${n > 5 ? " (Only KB-true rows shown.)" : ""}<div class="scrollx"><table class="tbl tt"><tr>${syms.map(s => `<th>${s}</th>`).join("")}<th>KB</th><th>Query</th></tr>${rows}</table></div>`;
      } catch (e) { el.querySelector(".out").innerHTML = `<span class="bad">${e.message}</span>`; }
    };
    el.querySelector(".go").onclick = go; go();
  }

  // ---------- Burglary BN enumeration ----------
  function bn(el) {
    el.appendChild(h(`<div class="wbox"><div class="wtitle">Tool: inference by enumeration, P(Burglary | evidence)</div>
      <div class="row small">${["E", "A", "J", "M"].map(v => `<label>${v} <select data-v="${v}"><option value="">unknown</option><option value="1" ${v === "J" || v === "M" ? "selected" : ""}>true</option><option value="0">false</option></select></label>`).join("")}</div><div class="out"></div></div>`));
    const PA = (b, e) => b ? (e ? 0.95 : 0.94) : (e ? 0.29 : 0.001);
    const go = () => {
      const ev = {}; el.querySelectorAll("select").forEach(s => { if (s.value !== "") ev[s.dataset.v] = s.value === "1"; });
      const vals = x => x in ev ? [ev[x]] : [true, false];
      const score = b => { let s = 0; for (const e of vals("E")) for (const a of vals("A")) for (const j of vals("J")) for (const m of vals("M")) s += (b ? 0.001 : 0.999) * (e ? 0.002 : 0.998) * (a ? PA(b, e) : 1 - PA(b, e)) * (j ? (a ? 0.9 : 0.05) : (a ? 0.1 : 0.95)) * (m ? (a ? 0.7 : 0.01) : (a ? 0.3 : 0.99)); return s; };
      const sb = score(true), snb = score(false);
      const hidden = ["E", "A", "J", "M"].filter(x => !(x in ev));
      el.querySelector(".out").innerHTML = `Evidence: ${Object.entries(ev).map(([k, v]) => (v ? "" : "¬") + k.toLowerCase()).join(", ") || "none"}. Hidden (summed out): ${hidden.join(", ") || "none"}.<br>s(b) = ${sb.toExponential(4)}, s(¬b) = ${snb.toExponential(4)}<br>α = 1/(s(b) + s(¬b)) → P(B | e) = <b>${rd(sb / (sb + snb), 4)}</b>, P(¬B | e) = ${rd(snb / (sb + snb), 4)}`;
    };
    el.querySelectorAll("select").forEach(s => s.onchange = go); go();
  }

  const all = { search, queens, sa, dtree, mlp, grid, conv, rf, iou, rnn, attn, truth, bn };
  return { mount(root) { root.querySelectorAll(".widget[data-widget]").forEach(w => { if (w.dataset.done) return; w.dataset.done = 1; try { all[w.dataset.widget](w); } catch (e) { w.textContent = "Widget error: " + e.message; } }); }, all };
})();
