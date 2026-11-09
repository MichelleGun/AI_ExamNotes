(function () {
  const { title, h, list, fx, card, big, flow, cols, split, tbl, svg, graph, at } = VK;
  // AND / XOR point plots
  const gate = (kind, k = 0, kl = 1) => {
    const P = [[0, 0], [0, 1], [1, 0], [1, 1]], pos = kind === "and" ? [[1, 1]] : [[0, 1], [1, 0]];
    const X = v => 40 + v * 120, Y = v => 160 - v * 120;
    const pts = P.map(([a, b]) => { const p = pos.some(([c, d]) => c === a && d === b); return p ? `<circle cx="${X(a)}" cy="${Y(b)}" r="9" class="ka"/>` : `<rect x="${X(a) - 9}" y="${Y(b) - 9}" width="18" height="18" class="kb"/>`; }).join("");
    const lab = P.map(([a, b]) => `<text x="${X(a) + (a ? 14 : -14)}" y="${Y(b) + 4}" text-anchor="${a ? "start" : "end"}">(${a},${b})</text>`).join("");
    const line = kind === "and" ? `<line class="vk-i sep" data-s="${kl}" x1="${X(0.5)}" y1="${Y(1.15)}" x2="${X(1.15)}" y2="${Y(0.5)}"/>` : `<line class="vk-i mg" data-s="${kl}" x1="${X(-0.15)}" y1="${Y(0.5)}" x2="${X(1.15)}" y2="${Y(0.5)}"/><text class="vk-i lt bad" data-s="${kl}" x="${X(0.5)}" y="${Y(0.5) - 8}" text-anchor="middle">no single line works</text>`;
    return at(k, `<svg class="vk-g sv" viewBox="-10 20 230 170"><text x="100" y="185" text-anchor="middle" class="lt2">${kind === "and" ? "AND" : "XOR"}</text>${pts}${lab}${line}</svg>`);
  };
  // 2-2-1 network
  const net = (on = {}, eon = {}) => graph(520, 250, {
    x1: [60, 65, "x₁", 0, "", "input = 1"], x2: [60, 185, "x₂", 0, "", "input = 0"],
    h3: [260, 65, "3", 0, "", "hidden"], h4: [260, 185, "4", 0, "", "hidden"], o5: [460, 125, "5", 0, "", "output ŷ"]
  }, [["x1", "h3", "0.5", 0, 1], ["x2", "h3", "0.4", 0, 1], ["x1", "h4", "−0.3", 0, 1], ["x2", "h4", "0.8", 0, 1], ["h3", "o5", "1.0", 0, 1], ["h4", "o5", "−1.0", 0, 1]], on, eon);

  const { stg, act, fix, tag, say, person, bar, J } = VK;
  // neuron as a bucket: drops pour in, it spills (fires) past the threshold line
  const bucket = [
    act(tag("+0.6", "chip"), { 0: [10, 20, 0], 1: [10, 20, 1], 2: [44, 50, 0, .4] }),
    act(tag("+0.3", "chip"), { 0: [10, 50, 0], 1: [10, 50, 1], 2: [44, 50, 0, .4] }),
    act(tag("+0.4", "chip"), { 0: [10, 80, 0], 1: [10, 80, 1], 2: [44, 50, 0, .4] }),
    fix(`<div class="bkt"><i data-st='${J({ 1: "height:0%", 2: "height:100%" })}' style="height:0%"></i><b></b><em>threshold 1.0</em></div>`, 44, 50, 1),
    fix(tag(say({ 1: "sum = 0", 2: "sum = <b>1.3</b>, over 1.0" })), 66, 30, 1),
    act(tag("<b>FIRES</b>", "ok"), { 0: [88, 50, 0], 2: [88, 50, 1] }),
    fix(tag("inputs (dendrites)", "lbl"), 12, 100, 1), fix(tag("bucket = cell body", "lbl"), 44, 100, 1), fix(tag("output (axon) → next neuron", "lbl"), 80, 75, 2)
  ];
  // feed-forward (one way) vs recurrent (loops back)
  const ffBox = (x, t) => `<rect class="bx5" x="${x}" y="50" width="70" height="34" rx="8"/><text class="lt5" x="${x + 35}" y="72" text-anchor="middle">${t}</text>`;
  const ffArr = (x) => `<line class="ar5" x1="${x}" y1="67" x2="${x + 36}" y2="67" marker-end="url(#l5ah)"/>`;
  const ffr = `<svg class="vk-g ffr5" viewBox="0 0 640 130"><defs><marker id="l5ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z"/></marker></defs>
    <g>${ffBox(15, "in")}${ffBox(121, "hidden")}${ffBox(227, "out")}${ffArr(85)}${ffArr(191)}<text class="cap5" x="156" y="120" text-anchor="middle">Feed-forward: one way, no memory</text></g>
    <g class="vk-i" data-s="1">${ffBox(345, "in")}${ffBox(451, "hidden")}${ffBox(557, "out")}${ffArr(415)}${ffArr(521)}<path class="ar5" d="M592 50 C592 12, 486 12, 486 48" marker-end="url(#l5ah)"/><text class="cap5" x="486" y="120" text-anchor="middle">Recurrent: loops back, so it remembers</text></g>
    <circle class="mover dot" r="8" data-run='{"0":[[50,67],[156,67],[262,67]]}' style="opacity:0"/>
    <circle class="mover dot hot" r="8" data-run='{"1":[[380,67],[486,67],[592,67],[592,30],[539,20],[486,30],[486,67],[592,67]]}' data-dur="4800" style="opacity:0"/></svg>`;
  // why non-linear: two straight layers stay straight, a bend fits the U
  const NX = x => 20 + x * 260, NY = y => 150 - y * 125;
  const UPTS = [[0.1, 0.76], [0.25, 0.41], [0.4, 0.28], [0.55, 0.2], [0.7, 0.33], [0.85, 0.55], [0.95, 0.79]];
  const ucurve = (() => { let d = ""; for (let i = 0; i <= 40; i++) { const x = 0.04 + i * 0.024, y = 0.22 + 2.9 * (x - 0.52) ** 2; d += (i ? "L" : "M") + NX(x).toFixed(1) + " " + NY(y).toFixed(1); } return d; })();
  const linPic = `<svg class="vk-g lin5" viewBox="0 0 300 176"><line class="ax" x1="20" y1="150" x2="285" y2="150"/><line class="ax" x1="20" y1="150" x2="20" y2="10"/>
    ${UPTS.map(([x, y]) => `<circle class="pt" cx="${NX(x)}" cy="${NY(y)}" r="5"/>`).join("")}
    <g class="vk-i" data-s="0" data-x="1"><line class="ly" x1="${NX(0)}" y1="${NY(0.1)}" x2="${NX(1)}" y2="${NY(0.9)}"/><line class="ly" x1="${NX(0)}" y1="${NY(0.9)}" x2="${NX(1)}" y2="${NY(0.25)}"/><text class="lt2" x="150" y="166" text-anchor="middle">layer 1 and layer 2: straight lines</text></g>
    <g class="vk-i" data-s="1" data-x="2"><line class="cmb" x1="${NX(0)}" y1="${NY(0.42)}" x2="${NX(1)}" y2="${NY(0.5)}"/><text class="lt bad" x="150" y="166" text-anchor="middle">combined: still one straight line. Misses the U</text></g>
    <g class="vk-i" data-s="2"><path class="crv" d="${ucurve}"/><text class="lt ok" x="150" y="166" text-anchor="middle">with a non-linear g: the line can bend</text></g></svg>`;
  // number line: the weighted sum lands left (0) or right (1) of zero
  const LX = v => 300 + v * 250;
  const sumLine = `<svg class="vk-g nl5" viewBox="0 -4 600 104"><line class="h0" data-on="3:lit5" x1="${LX(-1)}" y1="60" x2="${LX(0)}" y2="60"/><line class="h1" data-on="1:lit5 3:" x1="${LX(0)}" y1="60" x2="${LX(1)}" y2="60"/>
    ${[-1, -0.5, 0, 0.5, 1].map(v => `<line class="tk" x1="${LX(v)}" y1="53" x2="${LX(v)}" y2="67"/><text class="lt2" x="${LX(v)}" y="82" text-anchor="middle">${v < 0 ? "−" + -v : v}</text>`).join("")}
    <text class="lt2" x="${LX(-0.5)}" y="98" text-anchor="middle">sum &lt; 0 → output 0</text><text class="lt2" x="${LX(0.5)}" y="98" text-anchor="middle">sum ≥ 0 → output 1</text>
    <text class="lt5" x="300" y="12" text-anchor="middle" data-t='${J({ 0: "start at 0", 1: "+0.5, then −0.5, then +0.1 (bias) = 0.1", 3: "+0.6, then −0.2, then −0.5 (bias) = −0.1" })}'>start at 0</text>
    <g class="mover ptr5" data-run='${J({ 0: [[300, 0]], 1: [[300, 0], [425, 0], [300, 0], [325, 0]], 3: [[300, 0], [450, 0], [400, 0], [275, 0]] })}' data-dur="3000" style="opacity:0"><path d="M-8 34 L8 34 L0 48 Z"/><circle cx="0" cy="60" r="7"/></g></svg>`;
  // perceptron training: the decision line rotates after an update
  const pdl = `<svg class="vk-g pdl5" viewBox="0 0 270 225"><defs><clipPath id="l5clip"><rect x="40" y="10" width="225" height="190"/></clipPath></defs>
    <line class="ax" x1="40" y1="200" x2="262" y2="200"/><line class="ax" x1="40" y1="200" x2="40" y2="12"/><text class="lt2" x="258" y="216" text-anchor="end">x₁</text><text class="lt2" x="30" y="20" text-anchor="end">x₂</text>
    <text class="lt2" x="56" y="40">ŷ = 0 side</text><text class="lt2" x="255" y="185" text-anchor="end">ŷ = 1 side</text>
    <g clip-path="url(#l5clip)"><line class="dl5" x1="-190" y1="0" x2="190" y2="0" data-p="0:120,68,1,1,-54 4:136,141.3,1,1,-31.4"/></g>
    <circle class="pq5" data-on="0:bad5 5:ok5" cx="120" cy="90" r="8"/><text class="lt5" x="132" y="${90 - 14}" data-t='${J({ 0: "(1, 2) target 0, got 1", 5: "(1, 2) now 0. Fixed" })}'>(1, 2) target 0, got 1</text>
    <text class="vk-i lt ok" data-s="4" x="150" y="222" text-anchor="middle">update turns the line</text></svg>`;
  // team: blame passes back and shrinks (vanishing gradient)
  const team = [["Layer 1", 12, 1.6], ["Layer 2", 32, 6], ["Layer 3", 52, 25], ["Output", 72, 100]].map(([n, x, g], i) => fix(person(n, i), x, 42) + fix(`<div class="gw5">${bar({ 2: g }, "h")}</div>`, x, 86)).join("")
    + act(person("Coach = loss", 7), { 0: [92, 42, 0], 3: [92, 42, 1] })
    + `<div class="a blm5" data-run='${J({ 3: [[92, 6], [72, 6], [52, 6], [32, 6], [12, 6]] })}' data-dur="3200" style="opacity:0">${tag("blame", "bad")}</div>`
    + fix(tag("gradient left after each layer", "lbl"), 88, 86);
  // one-hot: a row of switches, exactly one on
  const oneHot = (lab, vals, on, y, k) => fix(tag(lab, "lbl"), 12, y, k) + vals.map((v, i) => fix(`<div class="oh5" ${i === on ? `data-on="${k}:on5"` : ""}><i></i><span>${v}</span><b>${i === on ? 1 : 0}</b></div>`, 36 + i * 15, y, k)).join("");
  // softmax: scores become slices that add to 1
  const smx = (rows, k) => at(k, `<div class="smx5">${rows.map(([n, sc, p, cls]) => `<div class="brow"><em>${n} <small>${sc}</small></em><div class="trk">${bar({ [k]: p }, cls || "g")}</div><i>${(p / 100).toFixed(2)}</i></div>`).join("")}</div>`);
  // universal approximation: more neurons, finer staircase
  const UF = x => 0.5 + 0.32 * Math.sin(2 * Math.PI * x) + 0.1 * Math.sin(5 * Math.PI * x), UX = x => 15 + x * 270, UY = y => 135 - y * 115;
  const ustep = n => { let d = ""; for (let i = 0; i < n; i++) { const a = i / n, b = (i + 1) / n, y = UY(UF((a + b) / 2)).toFixed(1); d += (i ? "L" : "M") + UX(a).toFixed(1) + " " + y + "L" + UX(b).toFixed(1) + " " + y; } return d; };
  const uap = (() => { let c = ""; for (let i = 0; i <= 60; i++) c += (i ? "L" : "M") + UX(i / 60).toFixed(1) + " " + UY(UF(i / 60)).toFixed(1);
    return `<svg class="vk-g uap5" viewBox="0 0 300 165"><line class="ax" x1="15" y1="140" x2="288" y2="140"/><path class="tgt" d="${c}"/><path class="vk-i stp" data-s="0" data-x="1" d="${ustep(3)}"/><path class="vk-i stp" data-s="1" data-x="2" d="${ustep(7)}"/><path class="vk-i stp" data-s="2" d="${ustep(24)}"/>
      <text class="lt5" x="150" y="160" text-anchor="middle" data-t='${J({ 0: "3 hidden neurons: rough", 1: "7 hidden neurons: closer", 2: "24 hidden neurons: almost exact" })}'>3 hidden neurons: rough</text></svg>`; })();
  // RNN gradient over time: shrink (w < 1) or blow up (w > 1)
  const vg = (w, k, cls) => `<div class="vg5 ${cls}">` + [0, 1, 2, 3, 4].map(t => { const hgt = w < 1 ? 100 * w ** (4 - t) : 100 / w ** t; return `<div><i data-st='${J({ [k]: "height:" + hgt.toFixed(1) + "%" })}' style="height:0%;transition-delay:${(4 - t) * 0.3}s"></i><span>${t === 4 ? "now" : "t−" + (4 - t)}</span></div>`; }).join("") + `</div>`;
  const WH = ["meet at 7, café", "meet at 7, café", "meat at 7?", "eat at 11?", "eat cake?"];
  const whisper = WH.map((m, i) => fix(person("", i), 10 + i * 20, 70) + act(tag(m, "wh5 " + (i < 2 ? "ok" : i === 4 ? "bad" : "")), { 0: [10 + i * 20, 18, 0], 3: [10 + i * 20, 18, 1] }, "", `style="transition-delay:${i * 0.5}s"`)).join("");
  // LSTM notebook: erase, write, read
  const nbook = at(1, `<div class="nb5"><div class="gts5"><span data-on="2:lit5 3:">forget = erase</span><span data-on="3:lit5 4:">input = write</span><span data-on="4:lit5">output = read</span></div>
    <p data-on="2:gone5">Tom is in the kitchen.</p><p class="vk-i" data-s="3" data-on="4:read5">Tom went to the garden.</p><p class="vk-i q5" data-s="4">Where is Tom? → <b>garden</b></p></div>`);

  VIDEO_LESSONS.l5 = {
    title: "L5: Neural Networks", chapters: [
      { t: "What is a neural network?", sec: [0, 1], scenes: [
        { v: title("Neural Networks", "Week 5 lesson") + list([[1, "From <b>biological neurons</b> to artificial ones"], [2, "The <b>neuron</b>: weights, bias, activation functions"], [3, "The <b>perceptron</b> and how it learns"], [4, "<b>Feedforward networks</b> and <b>backpropagation</b>, with real numbers"], [5, "Encoding, softmax, deep vs shallow, and <b>RNN / LSTM</b>"]]),
          n: ["Welcome to week 5: neural networks.",
            "We'll start from real neurons in the brain, and how they inspired artificial ones.",
            "Then the single neuron: its weights, its bias, and its activation function.",
            "Then the perceptron, the simplest neural network, and exactly how it learns.",
            "Then feedforward networks and backpropagation, worked through with real numbers so you can do it yourself.",
            "And finally how inputs and outputs are encoded, softmax, deep versus shallow networks, and recurrent networks with LSTM."] },
        { v: h("A computing system inspired by the brain") + card(0, "ana", "Many <b>simple, highly interconnected processing elements</b> that respond to inputs with a <b>dynamic state</b>. (Hecht-Nielsen)") + stg(1, bucket, "16/2.1", "tall") + list([[1, "Brain: mental activity = <b>electrochemical activity in networks of neurons</b>."], [2, "<b>McCulloch and Pitts (1943)</b>: a neuron <b>fires</b> when the weighted sum of its inputs passes a <b>threshold</b>."], [3, "Network = <b>units</b> joined by <b>directed links</b>. Behaviour depends on <b>topology</b> + neuron properties."]], "tight"),
          n: ["Here's the classic definition, from Robert Hecht-Nielsen, who built one of the first neurocomputers. A neural network is a computing system made of many simple, highly interconnected processing elements, which process information by their dynamic response to inputs.",
            "The idea comes from neuroscience. The hypothesis is that mental activity is mainly electrochemical activity in networks of neurons, the nerve cells in your brain.",
            "In 1943, McCulloch and Pitts made a simple mathematical model of a neuron. Roughly speaking, the neuron fires when a weighted combination of its inputs goes over some threshold, either a hard cut-off or a soft one. Picture a bucket collecting drops. Here 0.6, 0.3 and 0.4 pour in, the total is 1.3, and that passes the line at 1.0. The bucket spills over, and that spill is the neuron firing a signal to the next neuron.",
            "A neural network is a collection of these units, connected by directed links. Its properties are decided by its topology, meaning how the units are connected, and by the properties of the neurons themselves."] },
        { v: h("Two ways to connect neurons") + at(0, ffr) + cols(card(0, "", "<b>Feed-forward</b>: one way, <b>no loops</b>. Output depends on the <b>current inputs</b> only."), card(1, "ex", "<b>Recurrent</b>: outputs <b>fed back</b>. Has <b>short-term memory</b>. Can settle, oscillate or go chaotic.")) + cols(card(2, "tip", "<b>Strengths</b>: high-dimensional data, complex relations. Images, audio, text, risk scoring."), card(3, "warn", "<b>Weaknesses</b>: complex theory, hard to implement, heavy compute.")),
          n: ["There are two fundamentally different ways to wire neurons together. In a feed-forward network, connections only go one way. Each node takes inputs from upstream and sends outputs downstream, with no loops. So it's just a function of its current inputs, with no internal state other than its weights. Like an assembly line: each item moves forward once and the line forgets it.",
            "In a recurrent network, outputs are fed back into the network's own inputs. That makes it a dynamic system, which might settle into a stable state, oscillate, or even behave chaotically. It can hold short-term memory, which makes it more brain-like, but harder to understand. Watch the red signal loop back. It's like a conversation where you remember what was just said.",
            "Neural networks are one of the most popular and effective learning systems. They're strong on high-dimensional problems and complex relationships between variables, like labelling videos, audio and images, analysing text, or classifying security incidents by risk.",
            "Their weaknesses: they're theoretically complex, complicated to implement, and computationally heavy."] },
        { v: h("Which network for which problem?") + tbl(["Problem", "Technique"], [[0, "<b>Classification</b>", "Perceptron, feedforward NN (MLP)"], [1, "<b>Regression</b>", "Feedforward NN (MLP)"], [2, "<b>Time series forecasting</b>", "Recurrent NN (RNN), LSTM"]]) + card(3, "tip", "Exam favourite: <b>sequences / time series → RNN or LSTM</b>."),
          n: ["Here's the map for this week. For classification, use a perceptron if the classes can be split by a straight line, or a feedforward network, also called a multilayer perceptron, for harder cases.",
            "For regression, use a feedforward network.",
            "And for time series forecasting, where the order of the data matters, use a recurrent network or an LSTM.",
            "That last one is an exam favourite. Sequences and time series mean RNN or LSTM."] }
      ] },
      { t: "The neuron", sec: [1], scenes: [
        { v: h("Inside one unit") + split(svg("neuron", 0), fx(1, "in<sub>j</sub> = Σ<sub>i</sub> w<sub>i,j</sub> a<sub>i</sub> + b", "c") + fx(2, "a<sub>j</sub> = g(in<sub>j</sub>)", "c") + list([[3, "<b>w<sub>i,j</sub></b>: strength and sign of the link from unit i to unit j."], [4, "<b>Bias</b> (b or w<sub>0</sub>): shifts the activation curve left or right, like a threshold."], [5, "<b>Activation g</b>: adds <b>non-linearity</b>."]], "tight")),
          n: ["Let's zoom in on one unit, unit j. It receives inputs a i from other units, or from the data.",
            "First it computes its total input, in j: each input times the weight on its link, all added up, plus a bias.",
            "Then it passes that total through an activation function g. The result, a j, is the unit's output, also called its activation.",
            "A weight shows how strong a link is, and its sign. A big positive weight means that input pushes the unit to fire. A negative weight pushes it the other way.",
            "The bias, written b or w 0, shifts the activation curve left or right. It works like a threshold, deciding how easily the unit fires.",
            "The activation function adds non-linearity, which is what lets networks learn complex patterns."] },
        { v: h("Why we need non-linear activations") + fx(0, "W<sub>2</sub>(W<sub>1</sub>x) = (W<sub>2</sub>W<sub>1</sub>)x", "c") + split(linPic, list([[1, "Stack any number of <b>linear</b> layers: still <b>one linear function</b>. Depth wasted."], [2, "A <b>non-linear g</b> between layers lets each layer <b>bend</b> the representation."]], "tight"), "even") + card(3, "ana", "A neuron is a voter. Each input is a friend's opinion, the <b>weight</b> is how much the voter trusts that friend, the <b>bias</b> is the voter's own mood, and the <b>activation</b> decides: speak up, or stay quiet."),
          n: ["Why does the activation function need to be non-linear? Suppose both layers were purely linear. Layer 2 applied to layer 1 is W 2 times W 1 times x, which is just another single matrix times x. On the plot, the data makes a U shape, and our two layers are straight lines.",
            "So stacking any number of linear layers still gives one linear function. Combine them and you get, again, one straight line, which can never follow the U. All that depth would be wasted.",
            "With a non-linear activation between layers, each layer can bend and reshape the representation. That's where the power of a network comes from. Now the fitted line bends and follows the U.",
            "Here's an analogy. A neuron is a voter. Each input is a friend's opinion. The weight is how much the voter trusts that friend. The bias is the voter's own mood. And the activation decides whether to speak up or stay quiet."] },
        { v: h("Activation functions") + split(svg("activations", 0), tbl(["Name", "Formula", "Range / use"], [[1, "<b>Step</b> (hard threshold)", "1 if z ≥ 0, else 0", "{0, 1}. Perceptron."], [2, "<b>Sigmoid</b> (logistic)", "1 / (1 + e<sup>−z</sup>)", "(0, 1). Probabilities. g′ = g(1 − g)"], [3, "<b>Tanh</b>", "(e<sup>z</sup> − e<sup>−z</sup>) / (e<sup>z</sup> + e<sup>−z</sup>)", "(−1, 1). Zero-centred. g′ = 1 − g²"], [4, "<b>ReLU</b>", "max(0, z)", "[0, ∞). Fast, common in hidden layers"], [5, "<b>Softplus</b>", "ln(1 + e<sup>z</sup>)", "Smooth version of ReLU"]], "sm"), "even") + fx(6, "σ(0) = <b>0.5</b> &nbsp; σ(2) ≈ 0.881 &nbsp; σ(−2) ≈ 0.119 &nbsp; ReLU(−3) = <b>0</b> &nbsp; ReLU(2) = 2 &nbsp; tanh(0) = 0", "sm"),
          n: ["These are the activation functions you need to know. Here are their shapes.",
            "The step function, or hard threshold, outputs 1 if z is at least 0, and 0 otherwise. That's what the perceptron uses.",
            "The sigmoid, or logistic function, is 1 over 1 plus e to the minus z. It squashes any number into the range 0 to 1, so it's good for probabilities. Its derivative is g times 1 minus g, which we'll need for backpropagation.",
            "Tanh outputs between minus 1 and 1, so it's centred on zero. Its derivative is 1 minus g squared. Don't mix the two derivatives up.",
            "ReLU is just the maximum of 0 and z. Negative inputs give 0, positive inputs pass straight through. It's fast and very common in hidden layers.",
            "Softplus, the log of 1 plus e to the z, is a smooth version of ReLU.",
            "Some quick values worth memorising. Sigmoid of 0 is exactly 0.5. Sigmoid of 2 is about 0.881, and of minus 2 about 0.119. ReLU of minus 3 is 0. ReLU of 2 is 2. Tanh of 0 is 0."] }
      ] },
      { t: "The perceptron", sec: [2], scenes: [
        { v: h("A single neuron that can learn") + list([[0, "<b>1943</b>: McCulloch and Pitts show a unit can represent <b>AND, OR, NOT</b>, and argue big networks could do anything. But nobody knew how to <b>train</b> them."], [1, "<b>1962</b>: <b>Rosenblatt</b> gives the first perceptron training algorithm."], [2, "<b>Perceptron convergence theorem</b>: if the two classes are <b>linearly separable</b>, training places a hyperplane between them."], [3, "Structure: n inputs x<sub>1</sub>…x<sub>n</sub>, weights w<sub>1</sub>…w<sub>n</sub>, one neuron, one output ŷ."]]) + fx(4, "A perceptron = a single neuron with <b>adjustable weights and bias</b> and a <b>hard threshold</b> activation.", "sm"),
          n: ["The perceptron is one of the simplest and earliest neural network models. In 1943, McCulloch and Pitts showed that a single unit could represent the basic Boolean functions AND, OR and NOT, and argued that connecting many of them could achieve anything. The problem was that nobody knew how to train such networks.",
            "In 1962, Rosenblatt developed the first perceptron training algorithm.",
            "He proved that if the training patterns come from two linearly separable classes, the algorithm places a decision surface, a hyperplane, between them. This is the perceptron convergence theorem.",
            "Here's the structure. n inputs, x 1 to x n, each with a weight, feeding a single neuron with one output, y hat.",
            "Formally, a perceptron is a single neuron whose weights and bias can be adjusted, using a hard threshold activation: 1 if the sum is at least 0, otherwise 0."] },
        { v: h("Four parts of a perceptron") + flow([[0, "<b>Inputs</b><br><span class=\"sm\">real values, e.g. petal length, width</span>"], [1, "<b>Weights + bias</b><br><span class=\"sm\">importance of each input</span>"], [2, "<b>Weighted sum</b><br><span class=\"sm\">w · x</span>"], [3, "<b>Activation</b><br><span class=\"sm\">Setosa or Versicolor</span>"]]) + card(4, "tip", "<b>Bias trick</b>: add a dummy input <b>x<sub>0</sub> = 1</b> with weight <b>w<sub>0</sub></b>. The bias lets the boundary <b>shift away from the origin</b>, so it can separate data not centred at the origin.") + fx(5, "ŷ = g(w · x) = g(w<sub>0</sub> + w<sub>1</sub>x<sub>1</sub> + … + w<sub>n</sub>x<sub>n</sub>) &nbsp; → &nbsp; 1 if w · x ≥ 0, else 0", "c"),
          n: ["A perceptron has four parts. First, the inputs, which are real values. If we're classifying Iris flowers, two inputs could be the petal length and width.",
            "Second, the weights and bias. A weight says how important each input is to the decision.",
            "Third, the weighted sum: multiply each input by its weight and add them up into one value.",
            "Fourth, the activation function, which turns that sum into a decision, like Setosa or Versicolor.",
            "Here's a handy trick. Add a dummy input x 0 that's always 1, with weight w 0. That w 0 is the bias. It lets the decision boundary shift away from the origin, which is essential when the data isn't centred there.",
            "So the output is g of w dot x. If w dot x is at least zero, output 1. Otherwise output 0."] },
        { v: h("Worked example: forward pass") + fx(0, "x = (1, 2), &nbsp; w = (0.5, −0.25), &nbsp; b = 0.1", "c") + fx(1, "Sum = 0.5 × 1 + (−0.25) × 2 + 0.1 = 0.5 − 0.5 + 0.1 = <b>0.1</b> &nbsp; → &nbsp; 0.1 ≥ 0 → <b>ŷ = 1</b>", "c") + at(0, sumLine) + cols(card(3, "ex", "Quiz: x = (1, 1), w = (0.6, −0.2), b = −0.5. Sum = <b>−0.1</b> < 0 → <b>0</b>."), card(4, "warn", "Don't forget the bias. Exactly 0 gives <b>1</b> (≥ 0).")),
          n: ["Let's compute one. Input x is 1 comma 2. Weights are 0.5 and minus 0.25. The bias is 0.1.",
            "The weighted sum is 0.5 times 1, plus minus 0.25 times 2, plus 0.1. That's 0.5 minus 0.5 plus 0.1, which is 0.1.",
            "Watch the marker on the number line. Each term pushes it left or right, and it stops at 0.1. 0.1 is at least 0, so it lands on the right side: the output is 1.",
            "Here's one in quiz style. x is 1 comma 1, weights 0.6 and minus 0.2, bias minus 0.5. The sum is 0.6 minus 0.2 minus 0.5, which is minus 0.1. That's below zero, so the marker lands on the left side and the output is 0.",
            "Two classic slips: forgetting to add the bias, and getting the boundary case wrong. A sum of exactly zero gives 1."] },
        { v: h("Training: nudge the weights after each mistake") + split(list([[0, "Cycle through the samples. <b>Correct</b> → do nothing."], [1, "Should be <b>1</b>, got 0 → <b>add</b> αx to w."], [2, "Should be <b>0</b>, got 1 → <b>subtract</b> αx from w."]], "tight") + fx(3, "w<sub>i</sub> ← w<sub>i</sub> + α (y − ŷ) x<sub>i</sub><br><span class=\"sm\">bias: x<sub>0</sub> = 1</span>", "c"), pdl, "even") + fx(4, "Example: ŷ = 1 but y = 0, α = 0.1, x = (1, 2)<br>w<sub>1</sub> = 0.5 + 0.1(0 − 1)(1) = <b>0.4</b> &nbsp; w<sub>2</sub> = −0.25 + 0.1(−1)(2) = <b>−0.45</b> &nbsp; b = 0.1 + 0.1(−1)(1) = <b>0.0</b>", "sm") + fx(5, "New sum = 0.4 − 0.9 + 0 = −0.5 < 0 → now outputs <b>0</b>. Fixed.", "sm ok"),
          n: ["Training adjusts the weights, including the bias, to fit the data by reducing the loss. The algorithm cycles through the training samples, testing each one with the current weights. If a sample is classified correctly, it does nothing.",
            "If a sample should be class 1 but the output is 0, it adds the input vector, times the learning rate alpha, to the weights. That makes the sum bigger next time.",
            "If a sample should be class 0 but the output is 1, it subtracts alpha times the input vector. That makes the sum smaller.",
            "Both cases are captured by one rule: each weight goes up by alpha, times y minus y hat, times its input. When the answer is right, y minus y hat is zero, so nothing changes. The bias uses input 1.",
            "Back to our example. The output was 1 but suppose the target is 0, and alpha is 0.1. y minus y hat is minus 1. So w 1 becomes 0.5 minus 0.1 times 1, which is 0.4. w 2 becomes minus 0.25 minus 0.1 times 2, which is minus 0.45. And the bias becomes 0.1 minus 0.1, which is 0. On the plot, the decision line is the boundary where the sum is exactly zero. New weights mean a new boundary, so watch the line turn.",
            "Check it: the point is now on the zero side of the line. The new sum is 0.4 minus 0.9 plus 0, which is minus 0.5. Below zero, so it now outputs 0. The mistake is fixed. Training repeats until every training sample is right."] },
        { v: h("The limit: one straight line") + cols(gate("and", 0, 1), gate("xor", 2, 3)) + list([[1, "<b>AND</b> is linearly separable. e.g. w = (1, 1), b = −1.5 works."], [3, "<b>XOR</b> is not. No single line puts (0,1) and (1,0) on one side and (0,0), (1,1) on the other."], [4, "A perceptron solves only <b>linearly separable binary</b> problems. Fix: add <b>hidden layers</b>."]], "tight"),
          n: ["Here's the perceptron's big limitation. Look at AND. Only 1 comma 1 is positive.",
            "One straight line separates it from the others. For example, weights 1 and 1 with bias minus 1.5 fires only when both inputs are 1.",
            "Now XOR, exclusive or. 0 comma 1 and 1 comma 0 are positive, but 0 comma 0 and 1 comma 1 are negative.",
            "Try any straight line. You can't put the two circles on one side and the two squares on the other.",
            "So a single perceptron can only solve binary classification problems that are linearly separable. To go further, we need hidden layers. That's the feedforward network."] }
      ] },
      { t: "Feedforward neural networks", sec: [3], scenes: [
        { v: h("Multilayer perceptron (MLP)") + split(svg("mlp", 0), list([[1, "<b>Input layer</b> → one or more <b>hidden layers</b> → <b>output layer</b>. Information flows one way, no feedback."], [2, "Each layer turns the previous layer's output into a <b>new representation</b> of the input."], [3, "<b>Fully connected</b>: each node links to every node in the next layer. Each link has a <b>weight</b>."], [4, "Each layer also has a <b>dummy node</b> fixed at 1 (the bias)."]], "tight")),
          n: ["A feedforward neural network, also called a multilayer perceptron, has many nodes in each layer. Here's its general shape.",
            "Information flows from the input layer, through one or more hidden layers, to the output layer. Outputs are never fed back.",
            "The textbook puts it nicely. The values at each layer are a different representation of the input. Each layer transforms the previous representation into a new one.",
            "Every node is connected to every node in the next layer, and each link carries a numeric weight that sets the strength of the connection.",
            "Each layer also has a dummy node that's always on, fixed at 1. Its weights act as the biases."] },
        { v: h("The maths at every unit") + fx(0, "in<sub>j</sub> = Σ<sub>i</sub> w<sub>i,j</sub> a<sub>i</sub> &nbsp; (sum over units i in the previous layer, including the dummy 1)", "c") + fx(1, "a<sub>j</sub> = g(in<sub>j</sub>)", "c") + list([[2, "Notes' example: <b>2 inputs</b> (units 1, 2) → hidden layer (3, 4) → hidden layer (5, 6) → <b>output 7</b>. Sigmoid everywhere."], [3, "in<sub>3</sub> = w<sub>1,3</sub>a<sub>1</sub> + w<sub>2,3</sub>a<sub>2</sub>, &nbsp; a<sub>3</sub> = g(in<sub>3</sub>). Same for 4."], [4, "in<sub>5</sub> = w<sub>3,5</sub>a<sub>3</sub> + w<sub>4,5</sub>a<sub>4</sub>, &nbsp; a<sub>5</sub> = g(in<sub>5</sub>). Same for 6."], [5, "ŷ = a<sub>7</sub> = g(w<sub>5,7</sub>a<sub>5</sub> + w<sub>6,7</sub>a<sub>6</sub>): <b>nested</b> functions of the input."]], "tight") + fx(6, "Vector form: h<sub>w</sub>(x) = g<sup>(2)</sup>( W<sup>(2)</sup> g<sup>(1)</sup>( W<sup>(1)</sup> x ) )", "sm"),
          n: ["Every unit does the same two things. Its total input, in j, is the weighted sum of the activations from the previous layer, including the dummy unit at 1.",
            "Then its output is the activation function applied to that total.",
            "The notes use a network with two inputs, units 1 and 2, two hidden layers of two units, units 3 and 4, then 5 and 6, and one output, unit 7. Every unit uses the sigmoid. The inputs' activations are just the features, x 1 and x 2.",
            "So in 3 is w 1 3 times a 1 plus w 2 3 times a 2, and a 3 is g of in 3. Unit 4 works the same way.",
            "Then unit 5 combines a 3 and a 4 with its own weights, and so does unit 6.",
            "Finally the output, a 7, is g of the weighted sum of a 5 and a 6. Written out fully, the output is a nested function of nested functions of the input. That's why networks can be highly non-linear.",
            "In vector form, the whole network is g 2 of W 2 times g 1 of W 1 times x. Think of the network as a function h w of x, with the weights w as its parameters."] },
        { v: h("Forward pass with numbers") + split(net({ x1: "0:cur", x2: "0:cur", h3: "1:cur 2:ok", h4: "2:cur 3:ok", o5: "3:cur 4:ok" }, { "x1-h3": "1:hot", "x2-h3": "1:hot", "x1-h4": "2:hot", "x2-h4": "2:hot", "h3-o5": "3:hot", "h4-o5": "3:hot" }), list([[0, "x = (1, 0). Sigmoid at units 3, 4, 5. No biases (to keep it short)."], [1, "in<sub>3</sub> = 0.5(1) + 0.4(0) = 0.5 → a<sub>3</sub> = σ(0.5) ≈ <b>0.622</b>"], [2, "in<sub>4</sub> = −0.3(1) + 0.8(0) = −0.3 → a<sub>4</sub> = σ(−0.3) ≈ <b>0.426</b>"], [3, "in<sub>5</sub> = 1.0(0.622) − 1.0(0.426) = 0.197 → ŷ = σ(0.197) ≈ <b>0.549</b>"], [4, "Target y = 1. Loss = (1 − 0.549)² ≈ <b>0.203</b>"]], "tight")),
          n: ["Let's push real numbers through a small network: two inputs, two hidden units, one output, all sigmoid. The input is 1 comma 0. I've left out the biases to keep the arithmetic short.",
            "Unit 3 gets 0.5 times 1 plus 0.4 times 0, which is 0.5. Sigmoid of 0.5 is about 0.622.",
            "Unit 4 gets minus 0.3 times 1 plus 0.8 times 0, which is minus 0.3. Sigmoid of minus 0.3 is about 0.426.",
            "The output unit gets 1 times 0.622 plus minus 1 times 0.426, which is 0.197. Sigmoid of that is about 0.549. That's the prediction.",
            "If the true answer is 1, the squared error loss is 1 minus 0.549, squared, about 0.203. The forward phase is done. Now the error has to flow backwards."] }
      ] },
      { t: "Backpropagation", sec: [4], scenes: [
        { v: h("Training = forward, then backward") + split(svg("backprop", 0), list([[0, "<b>Forward</b>: layer by layer → ŷ."], [1, "Compare with y → <b>loss</b> (squared error)."], [2, "<b>Backward</b>: error flows output → input via the <b>chain rule</b> → gradient for every weight."], [3, "<b>Credit assignment</b>: change each weight by how much it <b>contributed</b>."], [4, "<b>Gradient descent</b> update. Repeat until weights converge."]], "tight"), "even"),
          n: ["Training has two phases. In the forward phase, each training sample goes in as a vector of features, one input node per feature. Every layer computes its outputs and passes them on, until the output layer produces y hat.",
            "Then we compare y hat with the true output and get an error, or loss. We use the squared error.",
            "In the backward phase, the error is sent backwards from the output layer towards the input, using the chain rule from calculus. This gives the gradient of the loss with respect to every single weight. Because it starts at the output and moves backwards, it's called backpropagation.",
            "The idea behind it is credit assignment. Each weight gets changed according to how much it contributed to the error.",
            "Then gradient descent updates the weights, a new forward phase starts, and this repeats over many iterations until the weights converge."] },
        { v: h("Backprop formulas (sigmoid, squared error)") + split(fx(0, "Output error: &nbsp; Err = y − ŷ", "") + fx(1, "Output unit k: &nbsp; Δ<sub>k</sub> = Err × g′(in<sub>k</sub>)<br>sigmoid: g′ = ŷ(1 − ŷ)", "") + fx(2, "Hidden unit j: &nbsp; Δ<sub>j</sub> = g′(in<sub>j</sub>) Σ<sub>k</sub> w<sub>j,k</sub> Δ<sub>k</sub>", "") + fx(3, "Update: &nbsp; w<sub>i,j</sub> ← w<sub>i,j</sub> + α × a<sub>i</sub> × Δ<sub>j</sub>", "ok"), card(4, "tip", "Memory hook: <b>sender's activation × receiver's Δ</b>. Gradient of the loss for w<sub>i,j</sub> is a<sub>i</sub>Δ<sub>j</sub> (up to sign).") + card(5, "warn", "Site version folds the minus sign and the 2 into Δ: Δ<sub>out</sub> = −2(y − ŷ)g′, update w ← w − α a<sub>i</sub>Δ<sub>j</sub>. Same direction, same idea."), "even"),
          n: ["Here are the formulas, for sigmoid units and squared error. At the output, the error is simply y minus y hat.",
            "The modified error, delta, at an output unit is that error times the derivative of the activation at its input. For the sigmoid, the derivative is y hat times 1 minus y hat.",
            "A hidden unit doesn't see the answer directly. Its delta is its own activation derivative times the weighted sum of the deltas of the units it feeds into. That's its share of the blame, passed back along its outgoing weights.",
            "Every weight is then updated by alpha times the activation of the unit sending along that link, times the delta of the unit receiving it.",
            "Remember it as: sender's activation times receiver's delta. That product is the gradient for that weight.",
            "The site notes write the same thing with the minus sign and a factor of 2 folded into delta, then subtract. It's the same direction and the same idea. Use whichever form your question uses."] },
        { v: h("Backward pass with numbers (α = 0.5)") + split(net({ o5: "0:cur", h3: "2:cur", h4: "2:cur" }, { "h3-o5": "1:hot", "h4-o5": "1:hot", "x1-h3": "3:hot", "x1-h4": "3:hot" }), list([[0, "Δ<sub>5</sub> = 0.451 × 0.549 × 0.451 ≈ <b>0.112</b>"], [1, "w<sub>3,5</sub> ≈ 1.0 + 0.5(0.622)(0.112) = <b>1.035</b><br>w<sub>4,5</sub> ≈ −1.0 + 0.5(0.426)(0.112) = <b>−0.976</b>"], [2, "Δ<sub>3</sub> = 0.622(0.378)(1.0)(0.112) ≈ <b>0.026</b><br>Δ<sub>4</sub> = 0.426(0.574)(−1.0)(0.112) ≈ <b>−0.027</b>"], [3, "w<sub>1,3</sub> ≈ <b>0.513</b>, w<sub>1,4</sub> ≈ <b>−0.314</b>. From x<sub>2</sub> = 0: no change."], [4, "All Δ use the <b>old</b> weights. Then update."]], "tight"), "even"),
          n: ["Let's backpropagate our example, with learning rate 0.5. The error is 1 minus 0.549, which is 0.451. The sigmoid derivative is 0.549 times 0.451, about 0.248. Multiply them: delta 5 is about 0.112.",
            "Update the weights into the output. w 3 5 goes up by 0.5 times a 3, 0.622, times 0.112, to about 1.035. w 4 5 goes up by 0.5 times 0.426 times 0.112, to about minus 0.976. Both changes push the output closer to 1.",
            "Now the hidden deltas. Delta 3 is a 3 times 1 minus a 3, times the weight to the output, 1, times delta 5. That's about 0.026. Delta 4 uses the weight minus 1, so it's about minus 0.027. Unit 4 gets negative blame because it was pulling the output down.",
            "Finally, the first layer weights. w 1 3 becomes 0.5 plus 0.5 times 1 times 0.026, about 0.513. w 1 4 becomes about minus 0.314. The weights from x 2 don't change at all, because x 2 was 0, so the sender's activation is 0.",
            "One detail: compute all the deltas using the old weights, then do the updates. Then the next forward pass begins."] },
        { v: h("BACK-PROP-LEARNING") + fx(0, "<b>repeat</b><br>&nbsp;set every w<sub>i,j</sub> to a small random number<br>&nbsp;<b>for each</b> example (x, y):<br>&nbsp;&nbsp;<i>forward</i>: a<sub>i</sub> ← x<sub>i</sub> for inputs. For layers 2..L: in<sub>j</sub> ← Σ w<sub>i,j</sub>a<sub>i</sub>, a<sub>j</sub> ← g(in<sub>j</sub>)<br>&nbsp;&nbsp;<i>backward</i>: output Δ<sub>j</sub> ← g′(in<sub>j</sub>)(y<sub>j</sub> − a<sub>j</sub>). Hidden Δ<sub>i</sub> ← g′(in<sub>i</sub>) Σ<sub>j</sub> w<sub>i,j</sub>Δ<sub>j</sub><br>&nbsp;&nbsp;<i>update</i>: w<sub>i,j</sub> ← w<sub>i,j</sub> + α a<sub>i</sub> Δ<sub>j</sub><br><b>until</b> a stopping criterion is met", "sm code") + list([[1, "In practice: <b>SGD</b> or the <b>Adam</b> optimiser."], [2, "<b>Vanishing gradient</b>: sigmoid g′ ≤ 0.25, so error shrinks every layer."]], "tight") + stg(2, [team], "16/2.1", "tall"),
          n: ["Here's the full algorithm. Start with small random weights. Then for each example, do the forward pass: set the input activations to x, and for each later layer compute in and a. Then do the backward pass: compute the output deltas, and propagate deltas back to the hidden units. Then update every weight with alpha times a i times delta j. Repeat until a stopping criterion is met.",
            "In practice, people use stochastic gradient descent, or an optimiser called Adam.",
            "One known problem is the vanishing gradient. The sigmoid's derivative is at most 0.25, so every layer the error passes back through shrinks it. In deep networks, the early layers learn very slowly.",
            "Think of a sports team after a lost match, shown here as the layers. The coach, who is the loss, tells the last player how wrong the result was. Blame is passed back along the chain, and each player adjusts in proportion to how much they contributed."] }
      ] },
      { t: "Encoding, outputs and depth", sec: [3], scenes: [
        { v: h("Encoding the inputs and outputs") + tbl(["Attribute type", "Encoding"], [[0, "<b>Boolean</b>", "n attributes → n input units. False → 0 (or −1), True → 1."], [1, "<b>Numeric</b>", "Use the value directly. Scale to a fixed range if needed. Use a <b>log scale</b> if magnitudes vary enormously."], [2, "<b>Categorical</b> (d values)", "<b>One-hot</b>: d input bits, one is 1. Type: French = [1, 0, 0, 0]"]]) + stg(2, [oneHot("Input: Type = French", ["French", "Italian", "Thai", "Burger"], 0, 25, 2), oneHot("Output: weather = rain", ["sun", "rain", "cloud", "snow"], 1, 72, 3)], "16/3", "tall"),
          n: ["How do we feed data into a network? It depends on the attribute type. For Boolean attributes, use one input unit each. False becomes 0, or sometimes minus 1, and True becomes 1.",
            "For numeric attributes, integers or reals, use the value directly. Sometimes you scale them to a fixed range, and if magnitudes vary enormously between examples, you can map them onto a log scale.",
            "For categorical attributes, use one-hot encoding. An attribute with d possible values becomes d input bits, and exactly one of them is 1. The restaurant Type has four values, so French is 1, 0, 0, 0. Think of a row of light switches where exactly one is on.",
            "Outputs are encoded the same way. To predict weather from sun, rain, cloud and snow, use four output units with one-hot targets. Rain is 0, 1, 0, 0."] },
        { v: h("Choosing the output activation") + split(tbl(["Task", "Output layer"], [[0, "<b>Multi-class</b>", "<b>Softmax</b>: d scores → probabilities over d classes. Minimise cross-entropy."], [1, "<b>Binary</b>", "<b>Sigmoid</b> = softmax with d = 2"], [2, "<b>Regression</b>", "<b>Linear</b>: ŷ = in (no g)"]], "sm"), smx([["cat", "score 2.0", 66], ["dog", "score 1.0", 24], ["bird", "score 0.1", 10]], 0) + smx([["spam", "score 1.4", 80], ["not spam", "", 20, "t"]], 1) + at(2, `<div class="tg big">house price ŷ = <b>$812k</b> (raw number)</div>`), "even") + list([[3, "1985 to 2010: hidden units used <b>sigmoid</b> and <b>tanh</b> almost exclusively."], [3, "From about 2010: <b>ReLU</b> and <b>softplus</b> became popular, partly because they avoid <b>vanishing gradients</b>."]], "tight"),
          n: ["The output activation depends on the task. For multi-class classification, we want the outputs to be probabilities, so we use softmax. It turns a vector of d values into a probability distribution over d classes, and training minimises the cross-entropy, also called negative log likelihood. Here, scores 2, 1 and 0.1 become 0.66, 0.24 and 0.10. Softmax is like cutting one pizza: the slices always add up to 1.",
            "For binary classification, the sigmoid is just softmax with two classes. Sigmoid units carry binary class information, and softmax units carry multi-class information.",
            "For regression, where the target is a continuous number, use a linear output layer. The output is just the weighted sum, with no activation function.",
            "A bit of history. From about 1985 to 2010, hidden units used sigmoid and tanh almost exclusively. Since around 2010, ReLU and softplus took over, partly because they avoid the vanishing gradient problem."] },
        { v: h("How powerful are they?") + card(0, "tip", "<b>Universal approximation</b>: one <b>non-linear</b> hidden layer + linear output can approximate <b>any continuous function</b>, given enough hidden neurons. (Cybenko 1989. Hornik 1990: the <b>multilayer architecture</b> matters.)") + split(at(0, uap), list([[1, "<b>Shallow</b> = 3 layers. <b>Deep</b> = 4+."], [2, "Nested functions = <b>non-linear regression</b>."], [3, "Pick <b>topology</b>: domain knowledge."], [4, "Set <b>weights</b>: backpropagation."], [5, "<b>Deep and narrow</b> often wins."]], "tight"), "even"),
          n: ["How powerful are feedforward networks? Very. In 1989, Cybenko showed that a network with one non-linear hidden layer and a linear output can approximate any continuous function, as long as the hidden layer has enough neurons. In 1990, Hornik showed the specific activation function doesn't matter much. It's the multilayer architecture that gives the power. The catch: for a particular structure, it's hard to say exactly which functions it can represent. Think of building a curve from Lego bricks. Each hidden neuron adds a brick. With 3 the shape is rough.",
            "With 7 bricks it's closer. Some names. A network with three layers, input, one hidden and output, is a shallow neural network. With four or more layers, it's a deep neural network.",
            "With 24 it almost matches. Because outputs are nested non-linear functions, a network is a tool for non-linear regression. With sigmoids, outputs are real values, usually between 0 and 1, or minus 1 and 1.",
            "There are two big challenges. First, choosing the topology: how many hidden layers, and how many neurons in each. Domain knowledge helps here.",
            "Second, setting the weights so the network gives the right outputs. That's solved by training with backpropagation.",
            "And a useful finding from the textbook: for a fixed total number of weights, deep and relatively narrow networks often learn better than shallow, wide ones."] }
      ] },
      { t: "Recurrent networks and LSTM", sec: [5], scenes: [
        { v: h("RNN: a network with memory") + split(svg("rnn", 0), list([[0, "Units take their <b>own output from the previous time step</b> as input → internal <b>state / memory</b>. Good for <b>sequences and time series</b>."], [1, "Hidden state: z<sub>t</sub> = g<sub>z</sub>(W<sub>z,z</sub> z<sub>t−1</sub> + W<sub>x,z</sub> x<sub>t</sub>)"], [2, "Output: ŷ<sub>t</sub> = g<sub>y</sub>(W<sub>z,y</sub> z<sub>t</sub>)"], [3, "<b>Markov assumption</b>: z<sub>t</sub> holds all the needed info from past inputs. <b>Same weights</b> at every time step."], [4, "<b>Unroll</b> it into a feedforward network and train with <b>backpropagation through time</b> (BPTT)."]], "tight"), "even"),
          n: ["A recurrent neural network has units that take their own output from the previous time step as an input. That gives it internal state, a kind of memory, which makes it good for sequences and time series.",
            "The hidden state at time t, z t, is an activation of the previous state times the recurrent weights, plus the current input times the input weights.",
            "The output at time t comes from the hidden state through its own weights and activation.",
            "We assume the Markov property: the hidden state carries everything needed from the past inputs. And the same weights are used at every time step.",
            "To train it, unroll the network over time. That gives an equivalent feedforward network, which we train with backpropagation through time."] },
        { v: h("Vanishing and exploding gradients") + fx(0, "Gradients contain repeated products like w<sub>z,z</sub><sup>T</sup> over T time steps", "c") + cols(card(1, "warn", "<b>w<sub>z,z</sub> = 0.5</b>: halves every step back → <b>vanishing</b>." + vg(0.5, 1, "")), card(2, "bad", "<b>w<sub>z,z</sub> = 2</b>: doubles every step back → <b>exploding</b>." + vg(2, 2, "ex5"))) + stg(3, [whisper], "16/1.9", "wsk5"),
          n: ["Training an RNN has a problem. The gradient is recursive, so it contains the recurrent weight multiplied by itself once per time step, w z z to the power T.",
            "If that weight is less than 1, the product shrinks towards zero. That's the vanishing gradient, and the network can't learn links between distant time steps. Watch the bars: each step back into the past, the signal halves, until there's almost nothing left.",
            "If it's greater than 1, the product blows up. That's the exploding gradient, and training becomes unstable. Here each step back doubles it, so the oldest steps get huge, wild updates.",
            "A simple RNN is like Chinese whispers. Early details fade as the message is passed along. Meet at 7 at the café ends up as eat cake."] },
        { v: h("LSTM: a notebook for the network") + split(svg("lstm", 0) + nbook, list([[1, "<b>Memory cell C<sub>t</sub></b>: long-term memory, copied from step to step and updated by <b>adding</b>, not multiplying → error flows almost unchanged."], [2, "<b>Forget gate f</b>: what to <b>remove</b> from memory (reset to 0)."], [3, "<b>Input gate i</b>: what <b>new info</b> to add to memory."], [4, "<b>Output gate o</b>: what part of memory goes to the short-term state z<sub>t</sub>."], [5, "Gates use <b>sigmoid</b> (0 to 1) and element-wise multiplication ⊙."]], "tight"), "even"),
          n: ["Long short-term memory, or LSTM, fixes the vanishing gradient. Here's the cell.",
            "The key is the memory cell, C t. It's long-term memory that's copied from step to step and updated by adding, not by multiplying. So the error signal can flow back through time almost unchanged.",
            "Three gates control it. The forget gate decides what to remove from memory, resetting parts of it to zero. In the notebook, the old fact, Tom is in the kitchen, gets crossed out.",
            "The input gate decides what new information to write into memory. So the notebook gets a new line: Tom went to the garden.",
            "The output gate decides which part of the memory is passed to the short-term hidden state, z t. When asked where Tom is, it reads just that line and answers: the garden.",
            "Each gate uses a sigmoid, giving values between 0 and 1, and multiplies element by element. If a simple RNN is Chinese whispers, an LSTM keeps a notebook. It can write, erase and read. The simple RNN hidden state calculation for the exam is covered in week 8."] }
      ] },
      { t: "Recap and exam checklist", sec: [], scenes: [
        { v: h("Exam checklist") + list([[0, "Unit: in = Σ w·a + b, a = g(in). Bias shifts the curve. Non-linearity is essential."], [1, "σ(0) = 0.5, σ′ = σ(1 − σ). tanh range (−1, 1), tanh′ = 1 − tanh². ReLU = max(0, z)."], [2, "Perceptron: output 1 if w·x + b ≥ 0. Update w ← w + α(y − ŷ)x. Only <b>linearly separable</b> (AND yes, XOR no)."], [3, "FNN: forward pass layer by layer. Loss = (y − ŷ)²."], [4, "Backprop: Δ<sub>out</sub> = (y − ŷ)g′. Hidden Δ = g′ Σ wΔ. Gradient = <b>a<sub>i</sub> × Δ<sub>j</sub></b>."], [5, "One-hot encoding. Softmax (multi-class), sigmoid (binary), linear (regression). Shallow = 3 layers, deep = 4+."], [6, "Time series → RNN / LSTM. w<sub>zz</sub> < 1 vanish, > 1 explode. LSTM gates: forget, input, output."]]),
          n: ["Let's finish with your checklist. A unit computes a weighted sum plus bias, then applies g. The bias shifts the curve, and non-linearity is essential.",
            "Know the activation values and derivatives: sigmoid of 0 is a half, sigmoid prime is sigmoid times 1 minus sigmoid, tanh prime is 1 minus tanh squared, ReLU is max of 0 and z.",
            "A perceptron outputs 1 when the weighted sum plus bias is at least zero. It learns with w plus alpha times y minus y hat times x, and it only handles linearly separable problems. AND yes, XOR no.",
            "A feedforward network passes values forward layer by layer, and we measure squared error.",
            "Backpropagation: the output delta is the error times g prime. A hidden delta is g prime times the weighted sum of the next deltas. The gradient for a weight is the sender's activation times the receiver's delta.",
            "Know one-hot encoding, and pick softmax for multi-class, sigmoid for binary, and a linear output for regression. Shallow means three layers, deep means four or more.",
            "And for time series, use an RNN or LSTM. A recurrent weight below 1 vanishes, above 1 explodes, and the LSTM's forget, input and output gates fix it. Try the neuron and backprop practice questions next. Good luck."] }
      ] }
    ]
  };
})();
