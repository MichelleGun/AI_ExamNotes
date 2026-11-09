(function () {
  const { title, h, list, fx, card, big, flow, cols, split, tbl, svg, graph, at } = VK;
  // 4x3 grid world. f(c, r) returns [html, extraClass]
  const grid = (f, k = 0, cls = "") => at(k, `<div class="gw ${cls}">${[3, 2, 1].map(r => [1, 2, 3, 4].map(c => {
    if (c === 2 && r === 2) return `<div class="gc wall"></div>`;
    const [x, ec] = f(c, r) || ["", ""];
    const t = c === 4 && r === 3 ? "plus" : c === 4 && r === 2 ? "minus" : "";
    return `<div class="gc ${t} ${ec || ""}"><span class="gxy">(${c},${r})</span>${x}</div>`;
  }).join("")).join("")}</div>`);
  const sp = (k, t, cls = "") => at(k, t, cls, "span");
  const PI = { "1,3": "→", "2,3": "→", "3,3": "→", "1,2": "↑", "3,2": "↑", "1,1": "↑", "2,1": "←", "3,1": "←", "4,1": "←" };
  const UV = { "1,3": "0.812", "2,3": "0.868", "3,3": "0.918", "1,2": "0.762", "3,2": "0.660", "1,1": "0.705", "2,1": "0.655", "3,1": "0.611", "4,1": "0.388" };
  const term = (c, r) => c === 4 && r === 3 ? "+1" : c === 4 && r === 2 ? "−1" : null;
  const base = (c, r) => [term(c, r) ? `<b class="gt">${term(c, r)}</b>` : "", ""];
  const policyGrid = (k, ku) => grid((c, r) => term(c, r) ? base(c, r) : [sp(k, `<b class="ga">${PI[c + "," + r]}</b>`) + (ku != null ? sp(ku, `<span class="gu">${UV[c + "," + r]}</span>`) : ""), ""]);
  // Up transition from (3,1): 0.8 up, 0.1 left, 0.1 right
  const slipGrid = (k) => grid((c, r) => {
    if (c === 3 && r === 1) return [`<b class="ga">●</b>${sp(k, "<span class=\"gu\">intends ↑</span>")}`, "cur"];
    if (c === 3 && r === 2) return [sp(k + 1, "<b class=\"gp\">0.8</b>"), ""];
    if (c === 2 && r === 1) return [sp(k + 2, "<b class=\"gp\">0.1</b>"), ""];
    if (c === 4 && r === 1) return [sp(k + 2, "<b class=\"gp\">0.1</b>"), ""];
    return base(c, r);
  });

  const { stg, act, fix, tag, say, person, J } = VK;
  // svg 4x3 grid world with a robot that walks paths
  const CX = c => 35 + (c - 1) * 60, CY = r => 35 + (3 - r) * 60;
  const CELLS = []; for (let rr = 3; rr >= 1; rr--) for (let c = 1; c <= 4; c++) CELLS.push([c, rr]);
  const isT = (c, rr) => c === 4 && (rr === 3 || rr === 2);
  const sg = (cell = () => "", extra = "", cap = "", cls = "") => `<svg class="vk-g sg6 ${cls}" viewBox="0 0 250 ${cap ? 212 : 190}">${CELLS.map(([c, rr]) => {
      if (c === 2 && rr === 2) return `<rect class="sc6 wall" x="${CX(c) - 29}" y="${CY(rr) - 29}" width="58" height="58" rx="5"/>`;
      const t = isT(c, rr) ? (rr === 3 ? "pos" : "neg") : "";
      return `<rect class="sc6 ${t}" x="${CX(c) - 29}" y="${CY(rr) - 29}" width="58" height="58" rx="5" ${t ? "" : cell(c, rr)}/>` + (t ? `<text class="tt6" x="${CX(c)}" y="${CY(rr) + 7}" text-anchor="middle">${rr === 3 ? "+1" : "−1"}</text>` : "");
    }).join("")}${extra}${cap}</svg>`;
  const pth = (pts, dx = 0) => pts.map(([c, rr]) => [CX(c) + dx, CY(rr)]);
  const bot = (run, dur, cls = "") => `<g class="mover bot6 ${cls}" data-run='${J(run)}' ${dur ? `data-dur="${dur}"` : ""} style="opacity:0"><circle r="12"/><circle class="e" cx="-4" cy="-3" r="2.2"/><circle class="e" cx="4" cy="-3" r="2.2"/></g>`;
  const cap6 = T => `<text class="cap6" x="125" y="206" text-anchor="middle" data-t='${J(T)}'>${T[Object.keys(T)[0]]}</text>`;
  const gtx = (c, rr, t, k, cls = "pa6") => `<text class="${cls} ${k != null ? "vk-i" : ""}" ${k != null ? `data-s="${k}"` : ""} x="${CX(c)}" y="${CY(rr) + (cls === "pr6" ? -14 : 7)}" text-anchor="middle">${t}</text>`;
  const PATH_OPT = [[1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [4, 3]];
  // value iteration (R(s) form, gamma 1) for the heat map
  const VI = (n) => { const U = {}; CELLS.forEach(([c, rr]) => U[c + "," + rr] = isT(c, rr) ? (rr === 3 ? 1 : -1) : 0);
    const D = { U: [0, 1], D: [0, -1], L: [-1, 0], R: [1, 0] }, side = { U: ["L", "R"], D: ["L", "R"], L: ["U", "D"], R: ["U", "D"] };
    const mv = (c, rr, d) => { const nc = c + D[d][0], nr = rr + D[d][1]; return nc < 1 || nc > 4 || nr < 1 || nr > 3 || (nc === 2 && nr === 2) ? c + "," + rr : nc + "," + nr; };
    for (let i = 0; i < n; i++) { const V = { ...U }; CELLS.forEach(([c, rr]) => { if (isT(c, rr) || (c === 2 && rr === 2)) return;
      V[c + "," + rr] = -0.04 + Math.max(...Object.keys(D).map(d => 0.8 * U[mv(c, rr, d)] + 0.1 * U[mv(c, rr, side[d][0])] + 0.1 * U[mv(c, rr, side[d][1])])); }); Object.assign(U, V); }
    return U; };
  const VIS = { 1: VI(0), 2: VI(1), 3: VI(3), 4: VI(30) };
  const heat = (c, rr) => `data-st='${J(Object.fromEntries(Object.entries(VIS).map(([k, U]) => { const v = U[c + "," + rr]; return [k, v >= 0 ? `fill:var(--good);fill-opacity:${(0.08 + v * 0.8).toFixed(2)}` : `fill:var(--bad);fill-opacity:${(Math.min(1, -v) * 0.7).toFixed(2)}`]; })))}'`;
  const heatVal = (c, rr) => `<text class="hv6" x="${CX(c)}" y="${CY(rr) + 5}" text-anchor="middle" data-t='${J(Object.fromEntries(Object.entries(VIS).map(([k, U]) => [k, U[c + "," + rr].toFixed(2)])))}'>0.00</text>`;
  // nudge: move part way from old towards the target
  const nudge = (ks, lo, hi, old, tgt, nw, a) => { const X = v => 40 + (v - lo) / (hi - lo) * 520;
    return `<svg class="vk-g nd6" viewBox="0 0 600 96"><line class="trk6" x1="40" y1="50" x2="560" y2="50"/>
      <line class="vk-i err6" data-s="${ks[2]}" x1="${X(old)}" y1="50" x2="${X(tgt)}" y2="50"/><text class="vk-i lt6 bad" data-s="${ks[2]}" x="${(X(old) + X(tgt)) / 2}" y="76" text-anchor="middle">error ${+(tgt - old).toFixed(2)}</text>
      <line class="tk6" x1="${X(old)}" y1="38" x2="${X(old)}" y2="62"/><text class="lt6" x="${X(old)}" y="82" text-anchor="middle">old ${old}</text>
      <g class="vk-i" data-s="${ks[1]}"><path class="tg6" d="M${X(tgt)} 30 l-8 -14 h16 z"/><text class="lt6 ok" x="${X(tgt)}" y="82" text-anchor="middle">target ${tgt}</text></g>
      <g class="mover nb6" data-run='${J({ [ks[0]]: [[X(old), 50]], [ks[3]]: [[X(old), 50], [X(nw), 50]] })}' data-dur="1800" style="opacity:0"><circle r="9"/></g>
      <text class="vk-i lt6 acc" data-s="${ks[3]}" x="${X(nw)}" y="22" text-anchor="middle">new ${nw} (moved α = ${a} of the gap)</text></svg>`; };
  // restaurants: explore each a few times, then exploit the best
  const RS = [["Pho", 3.1], ["Pizza", 4.2], ["Sushi", 3.6], ["Tacos", 2.5]];
  const rest = RS.map(([n, v], i) => act(`<div class="tg rs6" data-on="${i === 1 ? "3:best6" : ""}"><b>${n}</b><br>${say({ 0: "rating ?", 1: "rating ? (assume 5)", 2: "rating " + v })}<br>${say({ 0: "tried 0×", 2: "tried 2×", 3: i === 1 ? "tried 9×" : "tried 2×" }, "sm")}</div>`, { 0: [14 + i * 24, 40] })).join("")
    + `<div class="a" data-run='${J({ 0: [[50, 84]], 2: [[50, 84], [14, 84], [38, 84], [62, 84], [86, 84]], 3: [[86, 84], [38, 84]] })}' data-dur="3200" style="opacity:0">${person("agent", 0)}</div>`
    + act(tag(say({ 2: "explore: try everything N<sub>e</sub> times", 3: "exploit: go back to the best", 5: "rating update = this meal + best next meal" }), "lbl"), { 0: [50, 4, 0], 2: [50, 4, 1] });

  VIDEO_LESSONS.l6 = {
    title: "L6: MDPs and Reinforcement Learning", chapters: [
      { t: "Sequential decisions and background", sec: [0], scenes: [
        { v: title("MDPs and Reinforcement Learning", "Week 6 lesson") + list([[1, "Why some problems need a <b>policy</b>, not a path"], [2, "<b>Markov Decision Processes</b> and the <b>4×3 grid world</b>"], [3, "The <b>Bellman equation</b>, U-values and Q-values"], [4, "<b>Value iteration</b> and <b>policy iteration</b>"], [5, "<b>Reinforcement learning</b>: direct utility, ADP, TD and <b>Q-learning</b>"]]),
          n: ["Welcome to week 6: Markov decision processes and reinforcement learning.",
            "First, why some problems can't be solved with a single path, and need a policy instead.",
            "Then the Markov decision process, or MDP, and the famous 4 by 3 grid world.",
            "Then the Bellman equation, which links the value of a state to its neighbours, for both U values and Q values.",
            "Then two algorithms that solve MDPs: value iteration and policy iteration.",
            "And finally reinforcement learning, for when the agent doesn't know the rules: direct utility estimation, adaptive dynamic programming, temporal difference learning, and Q-learning. There are lots of calculations this week, and we'll do each one step by step."] },
        { v: h("The agent-environment loop") + split(svg("rlLoop", 0), list([[1, "The environment is <b>stochastic</b>: the same action doesn't always give the same result."], [2, "Agent acts → environment returns a <b>new state</b> and a <b>reward</b> (can be negative, a penalty)."], [3, "Goal: the most reward <b>overall</b>, not just the best immediate reward."]], "tight") + card(4, "warn", "Week 2: one <b>fixed path</b>. Here: a rule for <b>every state</b> = a <b>sequential decision problem</b>."), "even"),
          n: ["Picture an agent in an environment, trying to complete a task. The agent takes an action, and the environment responds.",
            "The key word is stochastic. The agent's actions don't always have a predictable outcome. Do the same thing twice, and you might end up in different places.",
            "After each action, the environment hands back a new state and a reward. A reward can be negative, which is a penalty.",
            "The agent wants the most reward overall, across the whole sequence, not just the best reward right now.",
            "Compare this with week 2 search, where the answer was a single fixed path from start to goal. Here, because outcomes are random, a fixed path could go wrong at any step. The agent needs a rule for every state it might end up in. Problems like this, where a series of decisions each affect future states and rewards, are called sequential decision problems."] },
        { v: h("Probability recap") + cols(list([[0, "A <b>random variable</b> represents an event whose outcome is unknown."], [0, "A <b>distribution</b> gives each outcome a probability. All ≥ 0, and they <b>sum to 1</b>."], [1, "Traffic T ∈ {none, light, heavy}: P = 0.25, 0.50, 0.25."], [2, "<b>Conditional</b>: P(A | B) = P(A ∩ B) / P(B)"]], "tight"), fx(3, "<b>Expected value</b> = Σ outcome × probability<br><br>Trip: 20 min (25%), 30 min (50%), 60 min (25%)<br>E = 20(0.25) + 30(0.50) + 60(0.25) = <b>35 min</b>", "sm")) + list([[4, "<b>States and observations</b>: the world is a sequence of time slices. <b>E<sub>t</sub></b> = observed evidence at time t. <b>X<sub>t</sub></b> = hidden state variables. X<sub>0:t−1</sub> means X<sub>0</sub>, …, X<sub>t−1</sub>."]], "tight"),
          n: ["Some background first. A random variable represents an event whose outcome is unknown. A probability distribution gives each possible outcome a weight. Probabilities are never negative, and all outcomes together sum to one.",
            "For example, traffic on a freeway: none with probability 0.25, light with 0.5, heavy with 0.25.",
            "Conditional probability is how likely A is, given that B already happened: the probability of both, divided by the probability of B. We'll use it to define the transition model.",
            "The expected value is the average outcome, weighted by probability. If a trip takes 20 minutes a quarter of the time, 30 minutes half the time, and 60 minutes a quarter of the time, the expected time is 5 plus 15 plus 15, which is 35 minutes. This exact idea defines the utility of a state later.",
            "We treat the world as a sequence of time slices. At each time t, some variables are observed, the evidence E t, and the rest are hidden state variables, X t. The state sequence starts at time 0, and the first evidence arrives at time 1."] },
        { v: h("Transition and sensor models") + cols(card(0, "", "<b>Transition model</b>: how the state changes over time.<br>P(X<sub>t</sub> | X<sub>0:t−1</sub>)"), card(0, "ex", "<b>Sensor model</b>: how the evidence gets its value at each step.<br>P(E<sub>t</sub> | X<sub>t</sub>)")) + card(1, "ana", "<b>Umbrella world</b>: rain R<sub>t</sub> is hidden from an underground guard. Evidence U<sub>t</sub>: does the director carry an umbrella?") + cols(card(2, "tip", "<b>Markov</b> (first order): depends only on the <b>previous</b> state.<br>P(X<sub>t</sub> | X<sub>0:t−1</sub>) = P(X<sub>t</sub> | X<sub>t−1</sub>)"), card(3, "tip", "<b>Stationary</b>: the rules of change don't change. P(R<sub>t</sub> | R<sub>t−1</sub>) is the same for every t.")),
          n: ["A stochastic world is described by two models. The transition model says how the state evolves from one time step to the next: the probability of the current state given all the previous ones. The sensor model says how the evidence gets its values: the probability of the evidence given the current state.",
            "Here's the running example. A security guard works underground and can't see outside. Whether it's raining, R t, is hidden. Each morning, he sees whether the director brings an umbrella, U t. That's his evidence.",
            "To keep things manageable, we make two assumptions. First, the Markov assumption. Under the first-order version, the current state depends only on the state just before it, not the whole history. So whether it's raining today depends only on whether it rained yesterday. And the evidence depends only on the current state.",
            "Second, the stationary process assumption. The laws of change don't themselves change. The probability of rain given yesterday's weather is the same on every day."] }
      ] },
      { t: "Markov Decision Processes", sec: [0], scenes: [
        { v: h("MDP: the definition") + fx(0, "A sequential decision problem in a <b>fully observable</b>, <b>stochastic</b> environment, with a <b>Markovian transition model</b> and <b>additive rewards</b>.", "sm") + tbl(["Component", "Meaning"], [[1, "<b>States</b> S", "Grid squares. Start s<sub>0</sub>, terminal states."], [1, "<b>Actions</b> A(s)", "Up, Down, Left, Right"], [2, "<b>Transition model</b> P(s′ | s, a)", "Probability of reaching s′ by doing a in s. Depends <b>only on s</b> (Markov)."], [3, "<b>Reward</b> R(s, a, s′) or R(s)", "Immediate reward, e.g. −0.04 per step, +1 / −1 at terminals"], [4, "<b>Discount</b> γ (0 ≤ γ ≤ 1)", "Future rewards worth less. γ = 1: no discount."]]) + fx(5, "MDPs balance <b>risk and reward</b> (AI, operations research, economics, control theory).", "sm"),
          n: ["Now the formal definition. A Markov decision process is a sequential decision problem in an environment that's fully observable, so the agent always knows which state it's in, and stochastic, with a Markovian transition model and additive rewards.",
            "It has states, like the squares of a grid, including a start state and terminal states. And in each state, a set of actions, like up, down, left, right.",
            "The transition model, P of s prime given s and a, is the probability of reaching state s prime if you do action a in state s. It depends only on the current state and action, never on how you got there. That's the Markov part.",
            "The reward function gives the immediate reward for a transition, like minus 0.04 per step, and plus 1 or minus 1 at the terminal states. Some questions put the reward on states instead, R of s.",
            "And the discount factor gamma, between 0 and 1, makes future rewards worth less than immediate ones. Gamma equal to 1 means no discounting.",
            "Balancing risk against reward is the defining feature of MDPs. They're studied in AI, operations research, economics and control theory."] },
        { v: h("Policies: the solution of an MDP") + list([[0, "A <b>policy</b> π gives an action for <b>every state</b>. π(s) = the action to do in s."], [1, "Same policy, different runs → different histories. Judge a policy by its <b>expected utility</b>."], [2, "<b>Optimal policy</b> π*: highest expected utility. <b>Proper policy</b>: always reaches a terminal → γ = 1 is safe."]], "tight") + fx(3, "U<sup>π</sup>(s) = E[ Σ<sub>t</sub> γ<sup>t</sup> R(S<sub>t</sub>, π(S<sub>t</sub>), S<sub>t+1</sub>) ] &nbsp; &nbsp; π*<sub>s</sub> = argmax<sub>π</sub> U<sup>π</sup>(s)", "sm") + cols(fx(4, "<b>Discounted return</b><br>G = r<sub>1</sub> + γr<sub>2</sub> + γ²r<sub>3</sub> + …<br>Rewards −0.04, −0.04, +1, γ = 0.9:<br>−0.04 − 0.036 + 0.81 = <b>0.734</b>", "sm"), fx(5, "<b>MEU</b> (maximum expected utility)<br>Route A: 0.8(10) + 0.2(−10) = <b>6</b><br>Route B: 1.0(7) = <b>7</b><br>Choose <b>B</b>", "sm")),
          n: ["Because the environment is stochastic, the solution can't be a fixed list of actions. Instead, it's a policy, written pi. A policy gives an action for every state. Pi of s is what to do when you're in state s. With a complete policy, the agent always knows what to do next, whatever happens.",
            "Follow the same policy twice and you might get different histories. So we judge a policy by the expected utility of the histories it produces.",
            "The optimal policy, pi star, is the one with the highest expected utility. A policy that's guaranteed to reach a terminal state is called proper, and then it's safe to use gamma equal to 1.",
            "Formally, the utility of following pi from s is the expected sum of discounted rewards. The optimal policy maximises it. With discounting and an infinite horizon, the optimal policy doesn't depend on where you start.",
            "The discounted return adds rewards, each multiplied by one more power of gamma. Rewards minus 0.04, minus 0.04, then plus 1, with gamma 0.9, give minus 0.04, minus 0.036, plus 0.81. That's 0.734.",
            "And the core decision rule is maximum expected utility. Route A gives plus 10 with probability 0.8 and minus 10 with 0.2, so its expected utility is 6. Route B gives 7 for certain. Choose B, even though A has the bigger possible payoff."] }
      ] },
      { t: "The 4×3 grid world", sec: [0], scenes: [
        { v: h("The 4×3 grid world") + split(at(0, sg(() => "", gtx(1, 1, "START", null, "st6") + bot({ 0: [[CX(1), CY(1)]], 3: pth(PATH_OPT) }, 3500), cap6({ 0: "agent starts at (1,1)", 3: "5 steps × −0.04 = −0.2, then +1 → total 0.8" }))), list([[0, "Cells are (column, row). Wall at <b>(2,2)</b>. Agent starts at <b>(1,1)</b>."], [1, "Actions everywhere: Up, Down, Left, Right. Fully observable."], [2, "Terminal states: <b>(4,3) = +1</b>, <b>(4,2) = −1</b>. Entering one ends the episode."], [3, "<b>Living reward −0.04</b> for every step into a non-terminal state, so the agent doesn't wander forever."]], "tight"), "even"),
          n: ["Here's the classic example. A 4 by 3 grid. Each cell is named by column then row. There's a wall at 2 comma 2, and the agent starts at 1 comma 1.",
            "In every state, the agent can try up, down, left or right. It always knows exactly where it is, so it's fully observable.",
            "There are two terminal states. 4 comma 3 is worth plus 1, and 4 comma 2 is worth minus 1. Entering either one ends the episode.",
            "Every other step costs a small living reward of minus 0.04. That discourages the agent from wandering around forever."] },
        { v: h("Actions don't always go as planned") + split(at(0, sg(() => "", gtx(3, 2, "0.8", 1, "pr6") + gtx(2, 1, "0.1", 2, "pr6") + gtx(4, 1, "0.1", 2, "pr6")
      + bot({ 1: [[CX(3), CY(1)], [CX(3), CY(2) + 14]] }, 0, "gh6") + bot({ 2: [[CX(3), CY(1)], [CX(2) + 14, CY(1)]] }, 0, "gh6") + bot({ 2: [[CX(3), CY(1)], [CX(4) - 14, CY(1)]] }, 0, "gh6")
      + bot({ 0: [[CX(3), CY(1)]], 3: [[CX(3), CY(1)], [CX(3), CY(1) + 24], [CX(3), CY(1)]] }, 1400),
      cap6({ 0: "at (3,1), intends ↑", 1: "80%: goes where it meant", 2: "like walking on ice: 10% slide each side", 3: "trying ↓ into the edge: bump, stay put" }))), list([[0, "Transition model for every action:"], [1, "<b>0.8</b>: move in the <b>intended</b> direction."], [2, "<b>0.1</b>: slip at a right angle to the <b>left</b>. <b>0.1</b>: to the <b>right</b>."], [3, "Bump into a wall or the edge → <b>stay put</b>."], [4, "Depends only on (s, a), never on history. That's what makes it <b>Markovian</b>."]], "tight"), "even"),
          n: ["Now the stochastic part. Every action follows the same transition model. Say the agent is at 3 comma 1 and intends to go up.",
            "80 percent of the time, it moves in the intended direction, up to 3 comma 2.",
            "Like walking on ice: 10 percent of the time it slips at a right angle to the left, and 10 percent of the time at a right angle to the right. So from 3 comma 1, it might end up at 2 comma 1 or 4 comma 1.",
            "If a move would hit a wall or the edge of the grid, the agent just stays where it is.",
            "And these probabilities depend only on the current state and the action, never on the history. That's what makes the model Markovian."] },
        { v: h("The optimal policy") + split(at(0, sg(() => "", Object.entries(PI).map(([kk, a]) => { const [c, rr] = kk.split(",").map(Number); return gtx(c, rr, a, null); }).join("")
      + bot({ 0: pth(PATH_OPT) }, 3500) + bot({ 1: pth([[3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [4, 3]], 8) }, 5000, "b2"),
      cap6({ 0: "follow the arrows from (1,1)", 1: "from (3,1): the long, safe way round" }))), list([[0, "Each arrow = the best action in that state (R = −0.04)."], [1, "Near −1, the agent takes the <b>long safe way</b> round: from (3,1) it goes ← rather than risk slipping into −1."], [2, "At (3,2) it goes ↑: a slip right would hit −1, but going up is worth the 10% risk."], [3, "Change the living reward and the policy changes: very negative R → rush to any exit, even −1."]], "tight"), "even"),
          n: ["Here's an optimal policy for this grid, with the living reward of minus 0.04. Each arrow is the best action in that state.",
            "Look at the bottom row. From 3 comma 1, the agent goes left, the long way round, instead of going up past the minus 1 square. Going up from there risks slipping right, into trouble.",
            "At 3 comma 2, right next to the minus 1, it still goes up. A slip to the right would hit the minus 1, but that's only a 10 percent chance, and up leads quickly to the plus 1.",
            "The policy depends on the reward. If each step were very costly, the agent would rush to the nearest exit, even the minus 1, just to stop losing points."] },
        { v: h("The MDP search tree") + flow([[0, "<b>State</b> s"], [1, "choose <b>action</b> a"], [2, "<b>q-state</b> (s, a)"], [3, "chance: P(s′ | s, a)"], [4, "<b>Successor</b> s′, reward R(s, a, s′)"]]) + card(5, "tip", "Two kinds of node: the agent <b>chooses</b> at a state (max). Nature <b>rolls the dice</b> at a q-state (average). This picture is exactly the Bellman equation."),
          n: ["It helps to draw this as a tree. Start at a state s.",
            "The agent chooses an action a.",
            "That leads to a q-state, the pair s comma a. The decision is made, but the outcome isn't known yet.",
            "Then the transition function rolls the dice. Each successor s prime happens with probability P of s prime given s and a.",
            "And each transition comes with a reward, R of s, a, s prime, which the agent collects when the action is executed.",
            "So there are two kinds of node. At a state, the agent chooses, so we take the best, the max. At a q-state, chance decides, so we take the average. That's exactly the Bellman equation, coming up next."] }
      ] },
      { t: "Bellman equation: U and Q", sec: [1], scenes: [
        { v: h("Utility of a state, value of an action") + fx(0, "Q(s, a) = Σ<sub>s′</sub> P(s′ | s, a) [ R(s, a, s′) + γ U(s′) ]", "c") + fx(1, "U(s) = max<sub>a</sub> Q(s, a) = max<sub>a</sub> Σ<sub>s′</sub> P(s′ | s, a) [ R(s, a, s′) + γ U(s′) ]", "c") + fx(2, "π*(s) = argmax<sub>a</sub> Q(s, a)", "c ok") + tbl(["", "U(s)", "Q(s, a)"], [[3, "Meaning", "Expected utility of being in s, then acting optimally", "Expected utility of doing a in s, then acting optimally"]], "sm") + fx(4, "Rewards on states: U(s) = R(s) + γ max<sub>a</sub> Σ<sub>s′</sub> P(s′ | s, a) U(s′). Use whichever form the question gives.", "sm"),
          n: ["Here are the key equations. The Q value of taking action a in state s is the average, over all possible next states, of the reward for that transition plus the discounted utility of where you land.",
            "The utility of a state is the Q value of the best action. This is the Bellman equation, from 1957. In words: a state's utility is the expected reward of the next step, plus the discounted utility of the next state, assuming you act optimally from then on.",
            "And the optimal policy just picks the action with the highest Q value.",
            "So U of s is the expected utility of being in s and acting optimally. Q of s a is the expected utility of taking action a first, then acting optimally. They're linked by U equals the max over a of Q.",
            "Some questions put rewards on states. Then U of s equals R of s plus gamma times the max expected utility of the next state. Use whichever form the question gives you."] },
        { v: h("Worked example: one Q-value") + fx(0, "At state s, action Up (γ = 1, R = −0.04):<br>0.8 → A (U = 0.9), &nbsp; 0.1 → B (U = 0.6), &nbsp; 0.1 → stays in s (U = 0.5)", "sm") + fx(1, "Q = 0.8(−0.04 + 0.9) + 0.1(−0.04 + 0.6) + 0.1(−0.04 + 0.5)", "c") + fx(2, "= 0.8(0.86) + 0.1(0.56) + 0.1(0.46) = 0.688 + 0.056 + 0.046 = <b>0.79</b>", "c ok") + cols(card(3, "warn", "Don't forget the <b>bump and stay</b> outcome. Add R inside <b>each</b> outcome."), card(4, "ana", "U = how good is this restaurant? Q = how good is this dish here? The best dish decides.")),
          n: ["Let's compute one. At state s, the agent tries Up. Gamma is 1 and the step reward is minus 0.04. With probability 0.8 it reaches A, worth 0.9. With 0.1 it reaches B, worth 0.6. With 0.1 it bumps a wall and stays in s, worth 0.5.",
            "So Q is 0.8 times minus 0.04 plus 0.9, plus 0.1 times minus 0.04 plus 0.6, plus 0.1 times minus 0.04 plus 0.5.",
            "That's 0.8 times 0.86, which is 0.688, plus 0.056, plus 0.046. Total, 0.79.",
            "Two common mistakes: forgetting the outcome where the agent bumps into a wall and stays put, and messing up where the reward goes. Add it inside each outcome.",
            "Here's an analogy. U of s asks: how good is this restaurant for me? Q of s a asks: how good is it if I order this particular dish? The best dish decides how good the restaurant is."] }
      ] },
      { t: "Value iteration", sec: [2], scenes: [
        { v: h("Value iteration") + list([[0, "n states → n Bellman equations. The <b>max</b> makes them <b>non-linear</b> → solve <b>iteratively</b>."]], "tight") + split(at(1, sg(heat, CELLS.filter(([c, rr]) => !isT(c, rr) && !(c === 2 && rr === 2)).map(([c, rr]) => heatVal(c, rr)).join("") + gtx(1, 1, "", null), cap6({ 1: "iteration 0: all 0", 2: "iteration 1: only next to +1 changes", 3: "iteration 3: value spreads like heat", 4: "converged" }))),
      list([[1, "Start with arbitrary U (e.g. all 0)."], [2, "<b>Bellman update</b> every state at once."], [3, "Repeat until the biggest change is tiny."], [4, "Extract π: best action in each state."]], "tight") + fx(2, "U<sub>i+1</sub>(s) ← max<sub>a</sub> Σ<sub>s′</sub> P(s′ | s, a) [ R + γ U<sub>i</sub>(s′) ]", "sm") + fx(3, "Stop when max change < ε(1 − γ)/γ", "sm") + card(5, "tip", "Reaches a unique equilibrium → the <b>optimal</b> policy."), "even"),
          n: ["Value iteration computes the optimal policy in two stages: first the utility of every state, then the best action in each state. If there are n states, there are n Bellman equations with n unknowns. Because of the max, they're non-linear, so we can't solve them as a simple linear system. We solve them iteratively.",
            "Start with arbitrary utilities, say all zero.",
            "Then apply the Bellman update to every state at once: compute the right-hand side using the current utilities, and make that the new utility. Each state gets refreshed from its neighbours.",
            "Repeat. Information spreads outwards from the rewards, one step per iteration, like heat spreading from a fire across a cold room. Stop when the biggest change in any state's utility falls below a small threshold, which depends on gamma, the contraction factor.",
            "Finally, extract the policy: in each state, pick the action with the highest expected utility.",
            "Applied infinitely often, this is guaranteed to reach an equilibrium. The utilities there are the unique solution of the Bellman equations, and the policy is optimal."] },
        { v: h("One Bellman update, by hand") + split(grid((c, r) => c === 3 && r === 3 ? [`<b class="ga">●</b>${sp(3, "<span class=\"gu\">U₁ = 0.792</span>")}`, "cur"] : base(c, r), 0), fx(0, "Iteration 0: all U = 0. γ = 1. R = −0.04 per step, +1 for entering (4,3). Update (3,3).", "sm") + fx(1, "<b>Right</b>: 0.8 → (4,3): +1 &nbsp; 0.1 → bump up, stay: −0.04 &nbsp; 0.1 → (3,2): −0.04<br>Q = 0.8(1) + 0.1(−0.04) + 0.1(−0.04) = <b>0.792</b>", "sm") + fx(2, "<b>Up</b>: 0.8 → stay: −0.04 &nbsp; 0.1 → (4,3): +1 &nbsp; 0.1 → (2,3): −0.04<br>Q = −0.032 + 0.1 − 0.004 = <b>0.064</b>", "sm") + fx(3, "U<sub>1</sub>(3,3) = max = <b>0.792</b> (Right is best). Next iteration, (2,3) will \"see\" this value.", "sm ok")),
          n: ["Let's do one update by hand. Start with every utility at zero, gamma equal to 1. Each step into a normal square gives minus 0.04, and entering 4 comma 3 gives plus 1. We'll update 3 comma 3, next to the plus 1.",
            "Try Right. With 0.8 it reaches the plus 1, giving 1. With 0.1 it slips up into the wall and stays, giving minus 0.04. With 0.1 it slips down to 3 comma 2, also minus 0.04. So Q is 0.8, minus 0.004, minus 0.004, which is 0.792.",
            "Try Up. With 0.8 it hits the wall and stays, minus 0.04. With 0.1 it slips right into the plus 1. With 0.1 it slips left to 2 comma 3. That's minus 0.032 plus 0.1 minus 0.004, which is only 0.064.",
            "The new utility is the max, 0.792, and Right is the best action. In the next iteration, 2 comma 3 will pick up this value from its neighbour. That's how value flows backwards from the rewards."] },
        { v: h("After convergence (γ = 1, R = −0.04)") + split(policyGrid(0, 0), list([[0, "Utilities rise as you get <b>closer to +1</b>: 0.705 at the start, 0.918 next to the goal."], [1, "Each arrow points to the neighbour with the highest <b>expected</b> utility, slips included."], [2, "(4,1) is only 0.388: it's next to −1 and far from +1."]], "tight")),
          n: ["Here are the converged utilities, with the policy they produce. The values grow as you get closer to the plus 1: 0.705 at the start, up to 0.918 right next to the goal.",
            "Each arrow points towards the action with the highest expected utility, with slips taken into account. That's why it isn't always simply the biggest neighbour.",
            "The bottom right corner, 4 comma 1, is only worth 0.388. It's right below the minus 1 and far from the plus 1."] }
      ] },
      { t: "Policy iteration", sec: [3], scenes: [
        { v: h("Policy iteration: evaluate, improve, repeat") + flow([[0, "Start with any policy π<sub>0</sub>"], [1, "<b>Policy evaluation</b>: compute U<sup>π</sup>"], [2, "<b>Policy improvement</b>: one-step look-ahead"], [3, "Policy unchanged? <b>Stop</b>. It's optimal."]], "sm") + fx(1, "Evaluation (action <b>fixed</b>, no max): U<sub>i</sub>(s) = Σ<sub>s′</sub> P(s′ | s, π<sub>i</sub>(s)) [ R(s, π<sub>i</sub>(s), s′) + γ U<sub>i</sub>(s′) ] → <b>linear</b> equations", "sm") + fx(2, "Improvement (MEU): π<sub>i+1</sub>(s) = argmax<sub>a</sub> Σ<sub>s′</sub> P(s′ | s, a) [ R(s, a, s′) + γ U<sub>i</sub>(s′) ]", "sm") + cols(card(4, "tip", "Exam tip: compute Q(s, a) for <b>every</b> action with the current U. Pick the largest. Differs from π(s)? Change it."), card(5, "", "Often converges in <b>fewer iterations</b> than value iteration.")),
          n: ["Policy iteration attacks the problem from the other side. Start with any policy at all.",
            "Step 1, policy evaluation. Work out the utility of every state if you follow the current policy. Because the action in each state is fixed by the policy, there's no max. So the equations are linear, and can be solved directly or iteratively.",
            "Step 2, policy improvement. For each state, do a one-step look-ahead with maximum expected utility: which action would be best, given these utilities? Update the policy to that action.",
            "Repeat until the policy stops changing. At that point it's optimal.",
            "For the exam: to improve a state, compute Q for every action using the current utilities, and pick the largest. If it's different from the current policy's action, switch.",
            "In practice, policy iteration often needs fewer iterations than value iteration. And remember the trap: policy evaluation does not use the max operator."] }
      ] },
      { t: "Reinforcement learning overview", sec: [4], scenes: [
        { v: h("Learning from experience") + list([[0, "Supervised learning is handed labelled examples. <b>RL</b> learns from its <b>own experience</b>."], [1, "Occasional <b>rewards</b>. Goal: maximise the <b>expected sum of rewards</b>."], [2, "May <b>not know P or R</b>. Must act to find out."]], "tight") + card(3, "ex", "<b>Chess</b>: millions of grandmaster games ≈ 10<sup>8</sup> examples vs about <b>10<sup>40</sup></b> positions → supervised overfits. RL: play, get 1 for a win, 0 for a loss, 0.5 for a draw. A <b>reward signal</b> is much easier to specify than labels.") + cols(card(4, "warn", "<b>Sparse rewards</b> (only at the end) are hard to learn from."), card(5, "tip", "<b>Intermediate rewards</b> for progress help: points scored, progress round a track.")),
          n: ["When the agent doesn't know the transition model or the rewards, we need reinforcement learning. Supervised learning, from weeks 4 and 5, is passive: it's handed a set of labelled examples. Reinforcement learning lets an agent learn actively from its own experience, with no training set at all.",
            "The agent interacts with the world and occasionally receives rewards that reflect how well it's doing. Its goal is to maximise the expected sum of rewards.",
            "It may not know the transition model or the reward function in advance. It has to act in order to find out.",
            "Why bother? Take chess. Even a database of millions of grandmaster games gives about 10 to the 8 examples, against roughly 10 to the 40 possible positions. A supervised model would overfit and fail on new positions. With RL, the agent just plays, getting 1 for a win, 0 for a loss and a half for a draw, and learns to win. Designing a reward signal is much easier than collecting millions of labels.",
            "Reward design matters. Rewards that only come at the very end, like once per chess game, are called sparse, and they're hard to learn from.",
            "Agents learn better with intermediate rewards for progress, like points scored in a game, or distance travelled round a track."] },
        { v: h("The RL map") + tbl(["", "Model-based", "Model-free"], [[0, "Idea", "Learn / use a <b>transition model</b>. Usually learns U(s).", "No transition model. Learns <b>how to act</b> directly."], [1, "Examples", "<b>ADP</b>", "<b>TD</b>, <b>Q-learning</b> (learns Q(s, a)), <b>policy search</b> (learns π directly)"]]) + tbl(["", "Passive", "Active"], [[2, "Policy", "<b>Fixed</b>. Learn U<sup>π</sup>(s).", "Agent <b>chooses</b> its actions"], [2, "Methods", "Direct utility estimation, ADP, TD", "<b>Q-learning</b>"], [3, "Key issue", "Evaluating the policy", "<b>Exploration vs exploitation</b>"]]) + fx(4, "Applications: <b>games</b> (Samuel's checkers 1952 → DeepMind <b>AlphaGo</b>, DQN) and <b>robot control</b>.", "sm"),
          n: ["Here's the map of RL methods, along two dimensions. Model-based methods use a transition model, learning it from experience if needed, and usually learn a utility function U of s. Model-free methods never learn a transition model. They learn how to behave directly.",
            "Adaptive dynamic programming, ADP, is model-based. Temporal difference learning and Q-learning are model-free. Q-learning learns an action-utility function, Q of s a. Policy search learns a mapping from states to actions directly.",
            "The second dimension. In passive RL, the policy is fixed, and the agent just learns how good each state is under that policy. This week's passive methods are direct utility estimation, ADP and TD. In active RL, the agent has no fixed policy and must decide what to do. Our active method is Q-learning.",
            "Active learning raises a key issue: exploration versus exploitation. Exploration means trying new actions to learn about them. Exploitation means using the actions you already know are good. An agent must balance the two.",
            "RL applications fall into two areas: game playing, from Arthur Samuel's checkers program in 1952 to DeepMind's AlphaGo, which uses deep Q-networks, and robot control."] }
      ] },
      { t: "Passive RL: direct utility, ADP, TD", sec: [5], scenes: [
        { v: h("Learning from trials under a fixed policy") + split(at(0, sg(() => "", bot({ 0: pth([[1, 1], [1, 2], [1, 3], [1, 2], [1, 3], [2, 3], [3, 3], [4, 3]], -9) }, 5000) + bot({ 1: pth([[1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 2], [3, 3], [4, 3]], 0) }, 5000, "b2") + bot({ 2: pth([[1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 2], [4, 2]], 9) }, 4500, "b3"),
      cap6({ 0: "trial 1: reaches +1", 1: "trial 2: reaches +1", 2: "trial 3: slips into −1" }))), fx(0, "T1: (1,1)→(1,2)→(1,3)→(1,2)→(1,3)→(2,3)→(3,3)→(4,3) <b>+1</b>", "sm") + fx(1, "T2: (1,1)→(1,2)→(1,3)→(2,3)→(3,3)→(3,2)→(3,3)→(4,3) <b>+1</b>", "sm") + fx(2, "T3: (1,1)→(1,2)→(1,3)→(2,3)→(3,3)→(3,2)→(4,2) <b>−1</b>", "sm"), "even") + list([[1, "The agent follows a fixed π, but knows <b>neither P(s′ | s, π(s)) nor R</b>."], [2, "Each step it perceives the <b>state</b> and the <b>reward</b>. Goal: learn U<sup>π</sup>(s) = expected sum of discounted rewards from s (here γ = 1)."]], "tight"),
          n: ["In passive learning, the agent follows a fixed policy through the grid, over and over. Each run, from 1 comma 1 to a terminal, is called a trial. Here are three trials. Two end at plus 1, and one ends at minus 1 because of a slip.",
            "The agent doesn't know the transition model, or the reward function. It just follows the policy.",
            "On each step it perceives the state it reached and the reward it got. From these trials, it wants to learn U pi of s, the expected sum of rewards from each state onwards when following the policy. We'll use gamma equal to 1."] },
        { v: h("1. Direct utility estimation") + list([[0, "Utility = expected <b>reward-to-go</b>. Each visit in a trial gives one sample. Keep a <b>running average</b> per state. (Widrow and Hoff, late 1950s.)"]], "tight") + tbl(["State", "Trial 1", "Trial 2", "Trial 3", "Average"], [[1, "(1,1)", "−0.04×6 + 1 = 0.76", "0.76", "−0.04×5 − 1 = −1.2", "<b>0.11</b>"], [2, "(1,2)", "0.80 and 0.88 (2 visits)", "0.80", "−1.16", "<b>0.33</b>"], [3, "(1,3)", "0.84 and 0.92 (2 visits)", "0.84", "−1.12", "<b>0.37</b>"]], "sm") + fx(2, "(1,2): (0.80 + 0.88 + 0.80 − 1.16) / 4 = 1.32 / 4 = <b>0.33</b>. Every visit is a separate sample.", "sm") + card(4, "warn", "Converges to the true utility with enough trials, but it <b>ignores the Bellman links</b> between neighbouring states, so it converges <b>very slowly</b>."),
          n: ["Method 1, direct utility estimation, from Widrow and Hoff in the late 1950s. A state's utility is its expected reward-to-go, the total reward from that point to the end. Every time a trial visits a state, that's one sample. At the end of each trial, add the samples to a running average.",
            "For 1 comma 1 in trial 1, there are 6 steps of minus 0.04 and then plus 1: 0.76. Trial 2 also gives 0.76. Trial 3 has 5 steps and ends at minus 1, so minus 1.2. The average is about 0.11.",
            "Trial 1 visits 1 comma 2 twice, giving two samples, 0.8 and 0.88. With 0.8 from trial 2 and minus 1.16 from trial 3, that's four samples. They add to 1.32, and divided by 4 that's 0.33.",
            "1 comma 3 works the same way: 0.84, 0.92, 0.84 and minus 1.12, averaging 0.37.",
            "With enough trials, the average converges to the true utility. But it completely ignores the Bellman equations linking neighbouring states, so it converges very slowly."] },
        { v: h("2. Adaptive dynamic programming (ADP)") + split(tbl(["s", "s′", "Action", "Count"], [[0, "(1,1)", "(1,2)", "Up", "3"], [0, "(1,2)", "(1,3)", "Up", "4"], [0, "(1,3)", "(1,2)", "Right", "1"], [0, "(1,3)", "(2,3)", "Right", "3"], [0, "(2,3)", "(3,3)", "Right", "3"], [1, "(3,3)", "(4,3)", "Right", "<b>2</b>"], [1, "(3,3)", "(3,2)", "Right", "<b>2</b>"], [0, "(3,2)", "(4,2)", "Up", "1"]], "sm"), fx(1, "P(s′ | s, a) = N(s′ | s, a) / N(s, a)<br>P((4,3) | (3,3), Right) = 2/4 = <b>1/2</b>", "sm") + fx(2, "Then solve: U<sup>π</sup>(s) = Σ<sub>s′</sub> P(s′ | s, π(s)) [ R(s, π(s), s′) + γ U<sup>π</sup>(s′) ]", "sm") + list([[3, "Policy fixed → no max → <b>linear</b> equations. Any linear algebra package solves them."], [4, "<b>Model-based</b>: it learns P. Uses the links between states, so it learns much faster than direct estimation."]], "tight")),
          n: ["Method 2, adaptive dynamic programming, or ADP, fixes that weakness. It learns the transition model connecting the states. Every observed transition is counted in a table: from state s, doing action a, you reached s prime this many times.",
            "Then probabilities are just counts divided by totals. From 3 comma 3, Right was done four times: twice it reached 4 comma 3, and twice it slipped to 3 comma 2. So the estimated probability of reaching 4 comma 3 is 2 out of 4, a half.",
            "With the learned model and the observed rewards, it plugs everything into the Bellman equations for the fixed policy.",
            "Because the policy is fixed, there's no max, so the equations are linear, and any linear algebra package can solve them.",
            "ADP is model-based. Because it uses the connections between states, it learns much faster than direct utility estimation."] },
        { v: h("3. Temporal difference (TD) learning") + fx(0, "U(s) ← U(s) + α [ R(s, π(s), s′) + γ U(s′) − U(s) ]", "c") + list([[1, "<b>TD target</b> = R + γU(s′). <b>TD error</b> = target − U(s). Move U(s) a step α towards the target."], [2, "Updates after <b>every transition</b>. <b>No model</b> needed (model-free)."]], "tight") + fx(3, "U(s) = 0.5, U(s′) = 0.8, R = −0.04, γ = 0.9, α = 0.1. Target = −0.04 + 0.9(0.8) = 0.68. Error = 0.18. New U(s) = 0.5 + 0.1(0.18) = <b>0.518</b>", "sm") + at(3, nudge([3, 3, 3, 3], 0.4, 0.75, 0.5, 0.68, 0.518, 0.1)) + fx(4, "TD: the one <b>observed</b> successor. ADP: <b>all</b> successors by probability. Same final values.", "sm"),
          n: ["Method 3, temporal difference learning. It updates directly from each observed transition, from s to s prime.",
            "The TD target is the reward plus gamma times the utility of the next state. The TD error is how far the current estimate is from that target. Move U of s a fraction alpha of the way towards the target.",
            "It updates after every single transition, and needs no model at all. That makes it model-free.",
            "Example: U of s is 0.5, U of s prime is 0.8, the reward is minus 0.04, gamma 0.9 and alpha 0.1. The target is minus 0.04 plus 0.72, which is 0.68. The error is 0.68 minus 0.5, which is 0.18. So the new U of s is 0.5 plus 0.1 times 0.18, which is 0.518.",
            "Think of guessing your commute time. Each day you see what actually happened and move your guess a little towards it, not all the way. TD versus ADP. TD adjusts a state to agree with the one successor it actually saw. ADP adjusts it to agree with all possible successors, weighted by their probabilities. TD is a crude but efficient approximation of ADP, and both converge to the same values."] }
      ] },
      { t: "Active RL: Q-learning", sec: [6], scenes: [
        { v: h("Q-learning: learn Q(s, a) directly") + list([[0, "<b>Active</b>: the agent chooses its own actions. Learns <b>Q(s, a)</b> instead of U(s)."], [1, "Once Q is right, acting optimally is easy: π*(s) = argmax<sub>a</sub> Q(s, a), and U(s) = max<sub>a</sub> Q(s, a)."]], "tight") + fx(2, "Q(s, a) ← Q(s, a) + α [ R(s, a, s′) + γ max<sub>a′</sub> Q(s′, a′) − Q(s, a) ]", "c") + flow([[3, "Observe s"], [3, "Choose a (explore or exploit)"], [3, "Do it. See R and s′"], [3, "Update Q"], [3, "Repeat"]]) + cols(card(4, "tip", "<b>Model-free</b>: no P(s′ | s, a) needed, to learn or to choose actions."), card(5, "warn", "No look-ahead, so it struggles when rewards are <b>sparse</b>.")),
          n: ["Q-learning is our active method. The agent chooses its own actions, and instead of learning the utility of states, it learns Q of s a, the value of each action in each state.",
            "Once the Q values are right, acting optimally is easy: in each state, pick the action with the highest Q value. And the utility of a state is just its best Q value.",
            "Here's the update. It's a TD update, but the target is the reward plus gamma times the best Q value available in the next state.",
            "The loop: observe the state, choose an action, either exploring or exploiting, do it, observe the reward and the next state, update Q, and repeat until Q converges.",
            "Q-learning never needs a transition model, not to learn and not to choose actions. That's exactly why it's called model-free.",
            "Its weakness: it can't look ahead into the future, so it struggles when rewards are sparse."] },
        { v: h("Worked example: one Q-update") + fx(0, "Q(s, a) = 2, &nbsp; R = 1, &nbsp; γ = 0.9, &nbsp; max<sub>a′</sub> Q(s′, a′) = 3, &nbsp; α = 0.5", "c") + cols(fx(1, "Target = 1 + 0.9 × 3 = <b>3.7</b>", "c"), fx(2, "Error = 3.7 − 2 = 1.7", "c")) + fx(3, "New Q(s, a) = 2 + 0.5 × 1.7 = <b>2.85</b>", "c ok") + nudge([0, 1, 2, 3], 1.5, 4, 2, 3.7, 2.85, 0.5) + card(4, "warn", "Use the <b>max</b> over the next state's actions, not the Q of the action you happen to take next. And multiply the <b>whole</b> error by α."),
          n: ["Let's do one update. The current Q of s a is 2. The reward is 1, gamma is 0.9, the best Q value in the next state is 3, and alpha is 0.5.",
            "The target is 1 plus 0.9 times 3, which is 3.7.",
            "The error is 3.7 minus 2, which is 1.7.",
            "So the new Q is 2 plus 0.5 times 1.7, which is 2.85. With alpha 0.5, the estimate moves exactly halfway to the target.",
            "Two things to watch. Use the max over the next state's actions, not whichever action you happen to take next. And multiply the whole error by alpha, not just part of it."] },
        { v: h("Exploration: greed vs curiosity") + fx(0, "f(u, n) = R<sup>+</sup> if n < N<sub>e</sub>, &nbsp; otherwise u", "c") + list([[1, "u = estimated utility (greed). n = how many times this action was tried (curiosity)."], [2, "R<sup>+</sup> = an <b>optimistic</b> reward estimate. Untried actions look great, so the agent tries each one at least <b>N<sub>e</sub></b> times."], [3, "After that, it becomes <b>greedy</b> and exploits what it learned."], [4, "<b>DQN</b> = Q-learning with a deep neural network approximating Q."]], "tight") + stg(1, [rest], "16/2.2", "ex6"),
          n: ["The exploratory Q-learning agent uses an exploration function, f of u and n, to trade off greed against curiosity. It should increase with u and decrease with n.",
            "u is the estimated utility, which is greed. n is how many times the action has been tried, which drives curiosity. Picture a tourist in a new city with four restaurants and no ratings yet.",
            "A simple version: if an action has been tried fewer than N e times, pretend it's worth R plus, an optimistic estimate of the best possible reward. So untried actions look attractive, and the agent tries every state-action pair at least N e times. The tourist tries every restaurant a couple of times before trusting any rating.",
            "After that, it uses the real estimate u, and becomes greedy, exploiting what it has learned. The tourist keeps going back to the pizza place, the best one found.",
            "Deep Q-networks, or DQN, are Q-learning with a deep neural network approximating the Q function. That's what DeepMind used.",
            "Think of Q-learning as a tourist rating dishes at restaurants. After each meal, nudge the rating towards how good the meal was, plus how good the best next meal could be."] }
      ] },
      { t: "Recap and exam checklist", sec: [], scenes: [
        { v: h("Method summary") + tbl(["Method", "Type", "Learns", "Key formula"], [[0, "Value iteration", "Planning (P, R known)", "U", "U ← max<sub>a</sub> Σ P[R + γU′]"], [1, "Policy iteration", "Planning (P, R known)", "π, U<sup>π</sup>", "Evaluate (no max), improve (argmax)"], [2, "Direct utility", "Passive", "U<sup>π</sup>", "Average reward-to-go"], [3, "ADP", "Passive, model-based", "P, then U<sup>π</sup>", "P = counts / total, then Bellman"], [4, "TD", "Passive, model-free", "U<sup>π</sup>", "U ← U + α(R + γU′ − U)"], [5, "Q-learning", "Active, model-free", "Q", "Q ← Q + α(R + γ max Q′ − Q)"]], "sm"),
          n: ["Let's put it all together. Value iteration plans when the model is known, repeatedly applying the Bellman update with a max.",
            "Policy iteration also plans with a known model. It alternates evaluation, with no max, and improvement, with an argmax.",
            "Direct utility estimation is passive and averages the observed reward-to-go.",
            "ADP is passive and model-based. It estimates probabilities from counts, then solves the Bellman equations.",
            "TD is passive and model-free. It nudges U towards the reward plus gamma times the next state's utility.",
            "And Q-learning is active and model-free. It nudges Q towards the reward plus gamma times the best Q in the next state."] },
        { v: h("Exam checklist") + list([[0, "MDP = states, actions, P(s′ | s, a), R, γ. Solution = a <b>policy</b>. Grid: 0.8 intended, 0.1 each side, wall = stay."], [1, "Discounted return: r<sub>1</sub> + γr<sub>2</sub> + γ²r<sub>3</sub>. MEU: pick the highest Σ P × U."], [2, "Q(s, a) = Σ P [R + γU(s′)]. U(s) = max<sub>a</sub> Q(s, a). π* = argmax<sub>a</sub> Q."], [3, "Value iteration: Bellman update until converged. Policy evaluation has <b>no max</b>."], [4, "Direct utility = average of all visits' reward-to-go. ADP: P = N(s′|s,a) / N(s,a)."], [5, "TD and Q updates: <b>old + α(target − old)</b>. Q-learning is model-free."]]),
          n: ["Your checklist. An MDP has states, actions, a transition model, rewards and a discount. Its solution is a policy. In the grid world, 0.8 goes the intended way, 0.1 slips to each side, and a wall means you stay.",
            "Know the discounted return, and maximum expected utility.",
            "Know the Q value formula, that U is the max over Q, and that the optimal policy is the argmax of Q.",
            "Value iteration repeats the Bellman update until it converges. Policy evaluation has no max.",
            "Direct utility estimation averages the reward-to-go from every visit. ADP estimates probabilities by counting.",
            "And every TD and Q update has the same shape: old value plus alpha times target minus old value. Q-learning is model-free. Now try the MDP and Q-learning calculators in calc practice. Good luck."] }
      ] }
    ]
  };
})();
