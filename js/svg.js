// Inline SVG diagrams (theme-aware via CSS variables)
window.SVG = (function () {
  const node = (x, y, t, cls = "n") => `<g class="${cls}"><circle cx="${x}" cy="${y}" r="20"/><text x="${x}" y="${y + 5}" text-anchor="middle">${t}</text></g>`;
  const box = (x, y, w, h, t, cls = "b") => `<g class="${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/><text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle">${t}</text></g>`;
  const line = (x1, y1, x2, y2, label = "") => `<line class="ln" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#ah)"/>` + (label ? `<text class="lbl" x="${(x1 + x2) / 2 + 4}" y="${(y1 + y2) / 2 - 4}">${label}</text>` : "");
  const defs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ahp"/></marker></defs>`;
  const svg = (w, h, inner, title) => `<svg class="diagram" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}">${defs}${inner}</svg>`;

  return {
    searchTree: svg(520, 230,
      line(260, 40, 120, 110, "140") + line(260, 40, 260, 110, "118") + line(260, 40, 400, 110, "75") +
      line(120, 130, 60, 195, "99") + line(120, 130, 180, 195, "80") +
      node(260, 30, "Arad", "n root") + node(120, 120, "Sibiu") + node(260, 120, "Tim.") + node(400, 120, "Zer.") +
      node(60, 200, "Fag.", "n front") + node(180, 200, "Rim.", "n front") +
      `<text class="lbl" x="300" y="200">root = start state</text><text class="lbl" x="300" y="220">orange = frontier (leaf nodes)</text>`,
      "Search tree from Arad"),

    landscape: svg(560, 220,
      `<path class="curve" d="M10,190 C60,180 70,120 110,120 C150,120 150,170 190,165 C230,160 230,150 260,150 L320,150 C350,150 360,40 400,40 C440,40 460,150 500,170 L550,180"/>` +
      `<text class="lbl" x="88" y="110">local max</text><text class="lbl" x="250" y="140">plateau</text><text class="lbl" x="370" y="30">global max</text>` +
      `<text class="lbl" x="10" y="212">state space →</text><text class="lbl" x="470" y="212">objective ↑</text>`,
      "State-space landscape"),

    neuron: svg(560, 200,
      node(50, 40, "x₁") + node(50, 100, "x₂") + node(50, 160, "1") +
      line(70, 40, 250, 92, "w₁") + line(70, 100, 250, 100, "w₂") + line(70, 160, 250, 108, "b") +
      `<g class="b"><circle cx="290" cy="100" r="38"/><text x="290" y="96" text-anchor="middle">Σ wᵢxᵢ+b</text><text x="290" y="114" text-anchor="middle">= in</text></g>` +
      line(328, 100, 400, 100) + box(400, 78, 70, 44, "g(in)") + line(470, 100, 540, 100) + `<text class="lbl" x="490" y="90">a</text>`,
      "Single neuron"),

    mlp: svg(560, 230,
      line(70, 60, 255, 60, "w₁,₃") + line(70, 60, 255, 165) + line(70, 170, 255, 70) + line(70, 170, 255, 170, "w₂,₄") +
      line(300, 60, 455, 110, "w₃,₅") + line(300, 170, 455, 120, "w₄,₅") +
      node(50, 60, "x₁") + node(50, 170, "x₂") + node(280, 60, "3") + node(280, 170, "4") + node(480, 115, "5") +
      `<text class="lbl" x="20" y="222">input layer</text><text class="lbl" x="240" y="222">hidden layer</text><text class="lbl" x="440" y="222">output ŷ</text>`,
      "Feedforward network 2-2-1"),

    rnn: svg(560, 210,
      box(20, 80, 70, 44, "RNN") + `<path class="ln" d="M90,90 C130,40 -20,40 30,80" marker-end="url(#ah)"/>` + `<text class="lbl" x="40" y="35">z(t-1)</text>` +
      `<text class="lbl" x="110" y="108">= unroll →</text>` +
      [0, 1, 2].map(i => {
        const x = 200 + i * 120;
        return box(x, 80, 70, 44, "z" + ["₁", "₂", "₃"][i]) + line(x + 35, 175, x + 35, 126) + `<text class="lbl" x="${x + 28}" y="195">x${["₁", "₂", "₃"][i]}</text>` +
          line(x + 35, 80, x + 35, 35) + `<text class="lbl" x="${x + 28}" y="25">ŷ${["₁", "₂", "₃"][i]}</text>` + (i < 2 ? line(x + 70, 102, x + 118, 102, "W") : "");
      }).join(""),
      "RNN unrolled"),

    ae: svg(560, 190,
      `<polygon class="trap" points="20,20 170,65 170,125 20,170"/><text class="lbl" x="55" y="100">Encoder</text>` +
      box(190, 70, 60, 50, "z") + `<text class="lbl" x="180" y="140">bottleneck</text>` +
      `<polygon class="trap" points="270,65 420,20 420,170 270,125"/><text class="lbl" x="305" y="100">Decoder</text>` +
      `<text class="lbl" x="0" y="15">x</text><text class="lbl" x="430" y="100">x̂ ≈ x</text>` +
      `<text class="lbl" x="400" y="186">loss = ||x - x̂||²</text>`,
      "Autoencoder"),

    gan: svg(560, 190,
      box(10, 70, 80, 44, "noise z") + line(90, 92, 130, 92) + box(130, 70, 100, 44, "Generator G") + line(230, 92, 290, 120, "fake") +
      box(130, 140, 100, 40, "real data") + line(230, 160, 290, 132, "real") +
      box(290, 100, 120, 50, "Discriminator D") + line(410, 125, 450, 125) + box(450, 103, 100, 44, "real / fake?") +
      `<path class="ln dash" d="M350,100 C350,30 180,30 180,68" marker-end="url(#ah)"/><text class="lbl" x="230" y="40">feedback (gradients)</text>`,
      "GAN"),

    bn: svg(560, 230,
      node(140, 35, "B") + node(420, 35, "E") + node(280, 115, "A") + node(160, 200, "J") + node(400, 200, "M") +
      line(158, 46, 262, 104) + line(402, 46, 298, 104) + line(266, 130, 176, 186) + line(294, 130, 384, 186) +
      `<text class="lbl" x="40" y="30">Burglary</text><text class="lbl" x="448" y="30">Earthquake</text><text class="lbl" x="306" y="112">Alarm</text><text class="lbl" x="40" y="205">JohnCalls</text><text class="lbl" x="428" y="205">MaryCalls</text>`,
      "Burglary Bayesian network"),

    semnet: svg(560, 250,
      box(220, 10, 110, 36, "Animal") + box(220, 90, 110, 36, "Bird") + box(90, 170, 110, 36, "Canary") + box(350, 170, 110, 36, "Penguin") +
      box(90, 215, 110, 30, "Tweety", "b obj") + box(350, 215, 110, 30, "Pingu", "b obj") + box(420, 90, 110, 36, "Wings") +
      line(275, 90, 275, 48, "subclass of") + line(150, 170, 245, 128, "subclass") + line(400, 170, 305, 128, "subclass") +
      line(330, 108, 418, 108, "has part") + `<text class="lbl" x="10" y="120">Bird: can fly</text><text class="lbl" x="440" y="160">cannot fly</text>` +
      `<text class="lbl" x="205" y="236">member of ↑</text>`,
      "Semantic network")
  };
})();
