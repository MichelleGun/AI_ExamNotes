(function () {
  const { title, h, list, fx, card, big, flow, cols, split, tbl, svg, at } = VK;
  // wavy landscape: y value (higher = better) for x in [0, 600]
  const F = x => 150 - (55 * Math.sin(x / 48) + 38 * Math.sin(x / 23 + 1.3) + 0.00028 * (x - 330) * (x - 330) * -1 + 20);
  const P = []; for (let x = 0; x <= 600; x += 4) P.push(`${x + 20},${F(x).toFixed(1)}`);
  // find local peaks
  const peaks = []; for (let x = 4; x < 596; x += 2) if (F(x) < F(x - 2) && F(x) < F(x + 2)) peaks.push(x);
  const gx = peaks.reduce((a, b) => (F(b) < F(a) ? b : a), peaks[0]);
  const dot = (x, k, kx, cls = "") => `<circle class="vk-i ld ${cls}" data-s="${k}" ${kx != null ? `data-x="${kx}"` : ""} cx="${x + 20}" cy="${F(x) - 9}" r="8"/>`;
  const land = (extra = "", labels = true) => `<svg class="vk-g land" viewBox="0 40 640 222"><polyline points="${P.join(" ")}" class="lc"/>${labels ? `<text x="${gx + 20}" y="${F(gx) - 24}" text-anchor="middle" class="lt">global max</text>${peaks.filter(p => p !== gx).slice(0, 2).map(p => `<text x="${p + 20}" y="${F(p) - 24}" text-anchor="middle" class="lt2">local max</text>`).join("")}` : ""}${extra}<text x="630" y="256" text-anchor="end" class="lt2">state (location) →</text></svg>`;
  // climbing sequence starting left of first local peak
  const p1 = peaks[1];
  const hc = [p1 - 60, p1 - 40, p1 - 20, p1].map((x, i, a) => dot(x, i + 1, i < a.length - 1 ? i + 2 : null, i === a.length - 1 ? "stuck" : "")).join("");
  const board = (rows, k = 0, hi = []) => { let s = ""; for (let c = 0; c < 8; c++) for (let r = 0; r < 8; r++) s += `<rect x="${c * 24}" y="${(7 - r) * 24}" width="24" height="24" class="${(c + r) % 2 ? "sq1" : "sq0"}"/>`; rows.forEach((r, c) => { s += `<circle cx="${c * 24 + 12}" cy="${(8 - r) * 24 + 12}" r="8" class="qn ${hi.includes(c) ? "hot" : ""}"/>`; }); return at(k, `<svg class="vk-g qb" viewBox="0 0 192 192">${s}</svg>`); };
  const pie = (k) => { const v = [24, 23, 20, 11], cls = ["p1", "p2", "p3", "p4"]; let a0 = -Math.PI / 2, s = ""; v.forEach((x, i) => { const a1 = a0 + x / 78 * 2 * Math.PI; const L = a1 - a0 > Math.PI ? 1 : 0; s += `<path class="${cls[i]}" d="M90,90 L${90 + 80 * Math.cos(a0)},${90 + 80 * Math.sin(a0)} A80,80 0 ${L} 1 ${90 + 80 * Math.cos(a1)},${90 + 80 * Math.sin(a1)} Z"/><text x="${90 + 52 * Math.cos((a0 + a1) / 2)}" y="${94 + 52 * Math.sin((a0 + a1) / 2)}" text-anchor="middle">x${i + 1}</text>`; a0 = a1; }); return at(k, `<svg class="vk-g pie" viewBox="0 0 180 180">${s}<line x1="90" y1="90" x2="90" y2="6" class="spin"/></svg>`); };
  const chrom = (str, cut, cls = "", k = 0, x) => at(k, `<div class="chrom ${cls}">${str.split("").map((c, i) => `<span class="${i >= cut ? "tail" : ""}">${c}</span>`).join("")}</div>`, "", "div").replace('class="vk-i "', `class="vk-i" ${x != null ? `data-x="${x}"` : ""}`);

  VIDEO_LESSONS.l3 = {
    title: "L3: Local Search", chapters: [
      { t: "Optimisation problems", sec: [0], scenes: [
        { v: title("Local Search for Optimisation", "Week 3 lesson") + list([[1, "What an <b>optimisation problem</b> is and how to <b>formulate</b> it"], [2, "<b>Hill climbing</b>"], [3, "<b>Simulated annealing</b>"], [4, "<b>Genetic algorithms</b>"], [5, "Which one to use"]]),
          n: ["Welcome to week 3: local search for optimisation problems.",
            "First, what an optimisation problem is, and how to formulate one properly.",
            "Then three algorithms that solve them. Hill climbing,",
            "simulated annealing,",
            "and genetic algorithms.",
            "And finally, how to compare them and choose the right one."] },
        { v: h("Find the <b>best state</b>. The path doesn't matter.") + land(dot(gx, 2, null, "ok")) + cols(card(1, "", "An <b>optimisation problem</b> finds the best solution (a state) that satisfies any constraints."), card(3, "warn", "Week 2 search: the <b>path</b> is the answer. This week: only the <b>final state</b> and its value matter.")),
          n: ["Picture someone standing in a landscape, looking for the spot with the best value, like the lowest cost or the highest elevation.",
            "An optimisation problem is a problem where the goal is to find the best solution, a state, that satisfies the given constraints.",
            "We want that single best point.",
            "And here's the key contrast with week 2. In route finding, the path was the answer. In optimisation, we don't care how we got there. Only the final state and its value matter."] },
        { v: h("Task assumptions") + list([[0, "An <b>environment</b>: a state-space landscape containing all possible states"], [1, "An <b>evaluation function</b> that scores any state"], [2, "The agent knows its <b>current state</b>, how good it is, and which actions are possible"]]) + card(3, "tip", "Find the state with the optimal value of the evaluation function = a <b>local search problem</b>."),
          n: ["The task makes three assumptions. There is an environment, a state-space landscape, containing all possible states.",
            "There is an evaluation function that calculates the value of any state.",
            "And the agent knows which state it's in, how good that state is, and what actions are possible from there.",
            "Finding the state with the best value of the evaluation function is called a local search problem, and it's equivalent to an optimisation problem."] }
      ] },
      { t: "Formulating an optimisation problem", sec: [0, 1], scenes: [
        { v: h("Two categories") + cols(card(0, "", "<b>Discrete</b>: integer-like variables. One set of values = one state.<br><br><b>8-queens</b>: 8 variables (one row per queen). Cost = attacking pairs. Optimum = 0."), card(2, "", "<b>Continuous</b>: values from a continuous range.<br><br>Minimise y = x² − 4x + 7, with −2 ≤ x ≤ 6.<br>Optimum at <b>x = 2, y = 3</b>.")),
          n: ["Optimisation problems come in two categories, depending on their decision variables. Discrete problems use only discrete values, like integers, and one set of values is one state.",
            "The 8-queens problem is discrete: eight variables, one per queen, giving each queen's row. The cost is the number of attacking pairs, and the optimal solution has zero.",
            "Continuous problems use values from a continuous range. For example, minimise y equals x squared minus 4x plus 7, with x between minus 2 and 6. The optimum is at x equals 2, where y equals 3."] },
        { v: h("Four elements of a formulation") + tbl(["Element", "Meaning"], [[0, "<b>Search state space</b> (+ constraints)", "Discrete: states + how they connect (neighbourhood). Continuous: a feasible region."], [1, "<b>Evaluation function</b>", "Fitness (how good) or cost (how bad). Together: the <b>objective function</b>."], [2, "<b>Goal of the search</b>", "f = min(cost) or f = max(fitness)"], [3, "<b>Successor function</b> (optional)", "How to generate neighbours. Algorithm-specific."]]),
          n: ["A complete formulation has four elements. First, the search state space, including any constraints. In a discrete problem, that's the set of states and how they connect, their neighbourhood. In a continuous problem, it's a feasible region.",
            "Second, an evaluation function, also called a fitness function or a heuristic cost function. Fitness says how good a state is. Cost says how bad. Both are called the objective function.",
            "Third, the goal: either minimise the cost or maximise the fitness.",
            "And fourth, optionally, a successor function, which says how to generate the neighbours of a state. That one depends on the algorithm."] },
        { v: h("The <b>state-space landscape</b>") + land(dot(gx, 1, null, "ok") + dot(peaks[0], 2, null, "stuck")) + list([[0, "Horizontal = <b>location</b> (the state). Vertical = <b>elevation</b> (objective value)."], [1, "<b>Global maximum</b>: the single best point. <b>Local maximum</b>: better than its neighbours, not best overall (a trap)."], [3, "<b>Plateau / shoulder</b>: flat area, can't tell which way is uphill. For minimisation, think <b>valleys</b>."]], "tight"),
          n: ["We picture the problem as a landscape. Moving left to right is the location, the state. The height is the elevation, the objective value.",
            "The global maximum is the single best point in the whole landscape, the true optimum.",
            "A local maximum is better than all its immediate neighbours, but not the best overall. It's a trap for search algorithms.",
            "A plateau or shoulder is a flat area where neighbours have equal value, so it's hard to tell which way is uphill. For minimisation, flip it over: think valleys, local minima and a global minimum."] }
      ] },
      { t: "Worked example: 8-queens", sec: [1], scenes: [
        { v: h("8-queens: no two queens attack") + split(board([2, 4, 7, 4, 8, 5, 5, 2], 0, [1, 3, 5, 6]), list([[0, "Attack = same row, column or diagonal"], [1, "One queen per column, moves up/down only"], [2, "State = 8 digits, e.g. <b>16257483</b>: column 1 row 1, column 2 row 6..."], [3, "cost(2,4,7,4,8,5,5,2) = <b>4</b> attacking pairs"], [4, "cost(2,4,6,8,3,1,7,5) = <b>0</b>: a solution"]])),
          n: ["The 8-queens problem: place eight queens on a chessboard so that no two attack each other. A queen attacks anything in the same row, column or diagonal.",
            "Each queen is restricted to its own column and can only move up or down.",
            "So a state is a string of 8 digits. Position i is the column, and the digit is the row. 1 6 2 5 7 4 8 3 means column 1's queen is in row 1, column 2's is in row 6, and so on.",
            "The cost function counts attacking pairs. For the state 2 4 7 4 8 5 5 2, the cost is 4.",
            "And for 2 4 6 8 3 1 7 5, the cost is zero. That's a solution."] },
        { v: h("8-queens formulation") + tbl(["Element", "8-queens"], [[0, "State space", "8 rows per queen, one queen per column: 8<sup>8</sup> = <b>16,777,216</b> states"], [1, "Cost function", "Number of attacking pairs (direct or indirect)"], [2, "Goal", "Minimise cost, ideally the global minimum <b>0</b>"], [3, "Successors", "Move one queen within its column: <b>8 × 7 = 56</b>"]]) + cols(card(4, "", "<b>92</b> goal states = <b>12</b> fundamental solutions + rotations and reflections."), card(5, "tip", "We don't record the path, only the final state.")),
          n: ["Using the four elements: the state space has 8 possible rows for each of 8 queens, so 8 to the 8, about 16.8 million states.",
            "The cost function is the number of pairs of queens attacking each other.",
            "The goal is to minimise the cost, ideally to the global minimum of zero.",
            "The successors of a state come from moving one queen to a different row in its column. Each queen has 7 other rows, so 8 times 7 is 56 successors. That's a classic exam calculation.",
            "There are 92 goal states in total: 12 fundamental solutions, and the rest come from rotating and reflecting the board.",
            "And again: we don't care about the sequence of states visited, only the final state."] }
      ] },
      { t: "Local search: the general idea", sec: [0], scenes: [
        { v: h("How local search works") + list([[0, "Keeps a <b>single current state</b> and moves to a <b>neighbour</b>"], [1, "<b>Neighbourhood</b> = states one smallest change away (change one variable, or one small step)"], [2, "Repeat local changes until optimal / good enough, or out of time"], [3, "Doesn't keep the path, so it is <b>not systematic</b> (unlike week 2)"]]) + card(4, "tip", "<b>Advantages</b>: very little (constant) memory. Works in huge or infinite (continuous) spaces. Ideal when you only care about the final solution and don't know the goal state in advance."),
          n: ["Local search suits these problems perfectly. It keeps a single current state and generally moves only to a neighbour.",
            "The neighbourhood is the set of states that differ by the smallest possible change: changing one variable in a discrete problem, or one small step in a continuous one.",
            "It keeps making local changes until it finds an optimal or good enough solution, or runs out of time.",
            "It doesn't keep the path, so local search is described as not systematic. That's what separates it from the classic search algorithms of week 2.",
            "The advantages: it uses very little memory, usually a constant amount. It works in very large or even infinite continuous spaces, where systematic search is hopeless. And it's ideal for pure optimisation, where you want the best solution but don't know the goal state in advance."] },
        { v: h("Three algorithms this week") + flow([[0, "<b>Hill climbing</b><br>one state, always uphill"], [1, "<b>Simulated annealing</b><br>one state, sometimes accepts worse"], [2, "<b>Genetic algorithm</b><br>a population that evolves"]], "hl") + card(3, "", "A GA is technically an <b>evolutionary algorithm</b>, not strict local search, but it grew out of the local search idea."),
          n: ["We'll cover three algorithms. Hill climbing, which tracks one state and always moves uphill.",
            "Simulated annealing, which also tracks one state but sometimes accepts a worse move.",
            "And genetic algorithms, which evolve a whole population.",
            "Technically a genetic algorithm is an evolutionary algorithm rather than a strict local search, but it grew out of the local search idea, so it's included here."] }
      ] },
      { t: "Hill climbing", sec: [2], scenes: [
        { v: h("Hill climbing: always move to the best neighbour") + land(hc) + flow([[1, "Evaluate initial state"], [2, "Find a neighbour"], [3, "Better? Move there"], [4, "No better neighbour: <b>stop</b>"]]),
          n: ["Hill climbing is a heuristic search algorithm. It improves a solution step by step, guided by a heuristic or cost function. It doesn't guarantee the true optimum, but it often finds a good one quickly, with little memory.",
            "Step one: evaluate the initial state. If it's the goal, return it.",
            "Otherwise, find a neighbouring state and evaluate it.",
            "If it's better than the current state, move there. Then repeat.",
            "It stops when no neighbour is any higher. In plain words: keep walking uphill until you can't. Notice where it stopped: on a local maximum, not the global one."] },
        { v: h("Why it gets stuck") + cols(list([[0, "<b>No search tree</b>: knows only the current state"], [1, "<b>No lookahead</b>: only immediate neighbours"], [2, "<b>No backtracking</b>: can't go back"]]), list([[3, "Stuck at a <b>local maximum</b>"], [4, "Stuck on a <b>plateau</b> (all neighbours equal)"], [5, "Stuck on a <b>ridge</b> (a sequence of local maxima)"]])) + card(6, "tip", "Fix: allow a <b>limited</b> number of <b>sideways moves</b> (equal value) to cross a plateau. The limit prevents infinite loops."),
          n: ["Hill climbing has three limitations. It keeps no search tree, so it only knows the current state.",
            "It has no lookahead. It only looks at immediate neighbours and never plans further.",
            "And no backtracking. It can't go back, because it doesn't remember anything.",
            "So it can get permanently stuck at a local maximum, which looks best nearby but isn't the global best.",
            "On a plateau, a flat area where no neighbour is better, so it can't tell which way to go.",
            "Or on a ridge, a sequence of local maxima that's hard to navigate directly.",
            "One fix is to allow a limited number of sideways moves to neighbours of equal value. That lets it cross a plateau and find a new uphill path, and the limit prevents infinite loops."] },
        { v: h("Variations of hill climbing") + tbl(["Variant", "How it picks the next state"], [[0, "<b>Steepest ascent</b>", "Look at ALL neighbours, move to the single best (greedy)"], [1, "<b>Stochastic</b>", "Pick a <b>random</b> uphill neighbour"], [2, "<b>First-choice</b>", "Generate random successors until one is better. Good when there are many successors."], [3, "<b>Random-restart</b>", "If stuck, restart from a new random state. Simple and effective."]]) + fx(4, "loop: neighbour ← highest-valued successor; if neighbour.VALUE ≤ current.VALUE return current; current ← neighbour", "sm"),
          n: ["There are four variations. Steepest ascent looks at all neighbours and moves to the single best one. That's the greedy choice.",
            "Stochastic hill climbing picks a random neighbour among the uphill ones, not necessarily the best.",
            "First-choice hill climbing generates random successors one at a time until it finds a better one. That's efficient when a state has many successors.",
            "Random-restart hill climbing restarts from a new random state whenever it gets stuck, and repeats. It's a simple but effective way to escape local maxima.",
            "Here's the steepest ascent pseudocode. Take the highest valued successor. If it's no better than the current state, return the current state. Otherwise move to it. If you use a cost h instead of a value, look for the lowest h."] }
      ] },
      { t: "Simulated annealing", sec: [3], scenes: [
        { v: h("The idea comes from <b>metallurgy</b>") + cols(card(0, "", "<b>Annealing</b>: heat metal, then cool it gradually so it settles into a low-energy, stable crystal structure."), card(1, "bad", "<b>Fast cooling</b> (quenching in water): structure freezes badly = stuck in a <b>local optimum</b>."), card(2, "tip", "<b>Slow cooling</b> (in air): settles uniformly = the <b>global optimum</b>.")) + card(3, "", "SA uses a <b>temperature T</b> that starts high and slowly decreases."),
          n: ["Simulated annealing borrows an idea from metallurgy. Annealing means heating a metal, then cooling it gradually, so its internal structure settles into a stable, low-energy state.",
            "Cool it too fast, like quenching in water, and the structure freezes in a poor arrangement. That's like getting trapped in a local optimum.",
            "Cool it slowly, in air, and it has time to settle into a better arrangement. That's like reaching the global optimum.",
            "So simulated annealing uses a temperature, T, that starts high and gradually decreases."] },
        { v: h("SA algorithm (minimising energy E)") + list([[0, "Start: random state, energy E, temperature T"], [1, "Pick a <b>random</b> neighbour. ΔE = E(neighbour) − E(current)"], [2, "<b>Better</b> (ΔE &lt; 0): <b>always</b> move"], [3, "<b>Worse</b>: move only with probability"]]) + fx(3, "p = e<sup>−ΔE / T</sup> &nbsp;&nbsp;(or e<sup>−ΔE / kT</sup>)", "c") + cols(card(4, "", "Bigger ΔE (much worse) → <b>smaller</b> p"), card(5, "", "Lower T (later) → <b>smaller</b> p")),
          n: ["Here's the algorithm. Start with a random state, with energy E, the objective value, at temperature T.",
            "Perturb the state randomly to get a neighbour, and compute delta E, the neighbour's energy minus the current energy.",
            "If the neighbour is better, meaning lower energy, always move to it. That's the greedy, valley descending part, just like hill climbing.",
            "If it's worse, still move to it, but only with probability e to the minus delta E over T. The full version has a constant k: e to the minus delta E over k T.",
            "That probability shrinks the worse the move is. A big energy increase is unlikely to be accepted.",
            "And it shrinks as the temperature drops. Early on, bad moves are accepted freely. Later, they're barely accepted at all."] },
        { v: h("Worked numbers") + split(tbl(["ΔE", "T", "ΔE / T", "p"], [[0, "2", "4", "0.5", "<b>0.607</b>"], [1, "2", "1", "2", "<b>0.135</b>"], [2, "8", "4", "2", "<b>0.135</b>"], [3, "−3", "any", "better", "<b>1</b> (always accept)"]]), svg("saProb", 4), "wide"),
          n: ["Let's do the numbers. Delta E is 2 and T is 4. Delta E over T is 0.5, and e to the minus 0.5 is 0.607. About a 61 percent chance of accepting.",
            "Same move, but the temperature has cooled to 1. Now it's e to the minus 2, which is 0.135. Much less likely.",
            "A worse move, delta E of 8, at T equals 4, also gives e to the minus 2, 0.135. Worse moves are accepted less often.",
            "And if delta E is negative, the move is better, so it's always accepted.",
            "This chart shows it: the acceptance probability falls as delta E grows, and the curve drops faster at low temperature."] },
        { v: h("Characteristics of SA") + list([[0, "Hill climbing (efficient) + <b>random walk</b> (a chance at completeness)"], [1, "<b>Energy</b> = how far a state is from optimal. SA finds the <b>minimum</b> (valley descending)."], [2, "Cool <b>slowly enough</b> → finds the global optimum with probability approaching <b>1</b>"], [3, "Occasional worse moves → escapes local minima"]]) + fx(4, "for t = 1 to ∞: T ← schedule(t); if T = 0 return current; next ← random successor; ΔE ← next.VALUE − current.VALUE; if ΔE &lt; 0 current ← next else current ← next with probability e<sup>−ΔE/T</sup>", "sm") + card(5, "ex", "<b>TSP</b>: start with a random tour, perturb it (swap two cities), apply the acceptance rule. The final state is the route with minimal total cost."),
          n: ["Simulated annealing combines hill climbing, which is efficient, with a random walk, which gives it a chance of completeness.",
            "Energy measures how far a state is from optimal, and SA is designed to find the minimum. It's valley descending.",
            "If the temperature is lowered slowly enough, SA finds the global optimum with probability approaching 1.",
            "And by occasionally accepting worse moves, it avoids getting permanently trapped in local minima.",
            "In the pseudocode, the schedule sets T as a function of time t. When T reaches zero, return the current state. Worse moves are accepted readily early on, and less and less often as T falls.",
            "A classic application is the travelling salesman problem: find the shortest route that visits every city once and returns home. Start with a random route, perturb it by swapping two cities, and apply the acceptance rule. It has been shown to turn random routes over 120 points into much shorter ones."] }
      ] },
      { t: "Genetic algorithms", sec: [4], scenes: [
        { v: h("From beam search to evolution") + flow([[0, "<b>Local beam search</b><br>track k states, keep the k best successors"], [1, "<b>Stochastic beam search</b><br>choose successors with probability ∝ value"], [2, "<b>Evolutionary algorithms</b><br>a population, the fittest have offspring"]]) + card(3, "", "A <b>GA</b> (Holland, 1975) keeps a <b>population</b> of individuals. Each is a string over a finite alphabet, usually 0s and 1s: a <b>chromosome</b>."),
          n: ["To see where genetic algorithms come from, start with local beam search. It keeps track of k states instead of one. Each step, it generates all successors of all k states and keeps the k best.",
            "Stochastic beam search instead chooses successors with probability proportional to their value.",
            "Evolutionary algorithms are variants of stochastic beam search, inspired by natural selection. There's a population of individuals, and the fittest ones produce offspring that form the next generation.",
            "The genetic algorithm, introduced by Holland in 1975, is the most popular one. It keeps a population of individuals, each a string over a finite alphabet, usually zeros and ones, called a chromosome."] },
        { v: h("Factors that shape an evolutionary algorithm") + tbl(["Factor", "Notes"], [[0, "Population size", "How many individuals per generation"], [0, "Representation", "GA: string (often Boolean, like DNA over ACGT). Evolution strategies: real numbers. Genetic programming: a program."], [1, "Mixing number", "Parents per offspring, usually <b>2</b>"], [1, "Selection", "Usually probability ∝ fitness"], [2, "Recombination", "Usually <b>crossover</b>"], [2, "Mutation rate", "How often offspring mutate"], [3, "Next generation", "Only offspring, or + top parents (<b>elitism</b>: fitness never decreases)"]], "sm"),
          n: ["Several factors shape an evolutionary algorithm: the size of the population, and how each individual is represented. In GAs it's a string, often Boolean, like DNA over the letters A C G T. Evolution strategies use real numbers, and genetic programming evolves programs.",
            "The mixing number is how many parents combine to form offspring, usually two. Selection decides which individuals become parents, usually with probability proportional to fitness.",
            "Recombination is usually crossover, and the mutation rate is how often offspring get random changes.",
            "And the makeup of the next generation: either only new offspring, or offspring plus a few top-scoring parents. Keeping the best parents is called elitism, and it guarantees fitness never decreases."] },
        { v: h("1. Selection: roulette wheel") + split(pie(1), tbl(["Individual", "Fitness", "P(select)"], [[0, "x1", "24", "24/78 ≈ <b>31%</b>"], [0, "x2", "23", "23/78 ≈ <b>29%</b>"], [0, "x3", "20", "20/78 ≈ <b>26%</b>"], [0, "x4", "11", "11/78 ≈ <b>14%</b>"]]) + card(2, "", "Fitter = more likely, but weaker ones still have a chance: keeps <b>diversity</b>.") + card(3, "ex", "Four spins might pick x3, x2, x2, x1 (x2 twice).")),
          n: ["For 8-queens, fitness is the number of non-attacking pairs, with a maximum of 28. Selection picks individuals at random, with probability proportional to fitness. With fitness 24, 23, 20 and 11, the total is 78, so x1 is chosen with probability 24 over 78, about 31 percent. Then 29, 26 and 14 percent.",
            "Picture a roulette wheel with slices sized by these probabilities. Each spin picks one individual, weighted towards the fitter ones.",
            "Fitter candidates are less likely to be eliminated, but weaker ones still have some chance. That preserves useful diversity.",
            "For example, four spins might land on x3, x2, x2 and x1, so x2 is selected twice."] },
        { v: h("2. Crossover &nbsp; 3. Mutation") + cols(`<div>${chrom("32752411", 3, "a", 0)}${chrom("24748552", 3, "b", 0)}<div class="vk-i sm muted" data-s="1">Swap the tails after the cut ↓</div>${chrom("32748552", 3, "a mix", 1)}${chrom("24752411", 3, "b mix", 1)}</div>`, `<div>${chrom("32748552", 9, "a", 2)}<div class="vk-i sm muted" data-s="3">One digit replaced at random ↓</div><div class="vk-i chrom a" data-s="3"><span>3</span><span>2</span><span>7</span><span>4</span><span>8</span><span class="mut">1</span><span>5</span><span>2</span></div></div>`) + card(4, "tip", "Mutation is applied to each digit with a <b>small, independent</b> probability. Boolean: flip 0↔1. 8-queens: a new row from 1 to 8."),
          n: ["Crossover: the selected individuals are paired up. For each pair, a crossover point is chosen at random. Here it falls after position 3.",
            "Split both parents at that point and swap the second parts. That gives two offspring, each with a head from one parent and a tail from the other.",
            "Mutation: each digit in an offspring can be randomly changed, with a small, independent probability.",
            "Here, the sixth digit is replaced with a random row number.",
            "In a Boolean string, mutation flips a 0 to a 1 or back. For 8-queens, it replaces a digit with a new random row from 1 to 8. Mutation keeps diversity and helps escape local optima."] },
        { v: h("One generation to the next") + flow([[0, "Initial population"], [1, "Fitness evaluation → selection probabilities"], [2, "Selection (pairs)"], [3, "Crossover (offspring)"], [4, "Mutation → <b>new population</b>"]]) + cols(card(5, "warn", "Success depends heavily on engineering the <b>representation</b>. Exactly when GAs work well is still being researched."), card(6, "", "<b>Applications</b>: parameter tuning (e.g. neural network parameters), planning (economic dispatch, train timetabling), design and control.")),
          n: ["Putting it together. Start with an initial population, four individuals in the example.",
            "Evaluate the fitness of each one and turn the fitness values into selection probabilities.",
            "Select pairs according to those probabilities.",
            "Cross over each pair at a random point, producing offspring.",
            "Then apply mutation, which gives the new generation. The cycle repeats for as many generations as needed.",
            "One caveat: success depends heavily on carefully engineering the representation, and exactly when GAs work well is still being researched.",
            "GAs are used for parameter tuning, like a neural network's parameters, for planning, like economic dispatch and train timetabling, and for design and control problems."] }
      ] },
      { t: "Comparing the three", sec: [], scenes: [
        { v: h("Hill climbing vs SA vs GA") + tbl(["", "Hill climbing", "Simulated annealing", "Genetic algorithm"], [[0, "States tracked", "One", "One", "A <b>population</b>"], [1, "Mechanism", "Always the best / a better neighbour", "Better: always. Worse: with p that shrinks over time", "Selection, crossover, mutation"], [2, "Local optima risk", "<b>High</b> (local max, plateau, ridge)", "Lower, escapes early on", "Lower, diversity explores widely"], [3, "Global optimum?", "Not guaranteed", "Probability → 1 with slow cooling", "Not guaranteed, works well in practice"], [4, "Inspiration", "Greedy ascent", "Metal annealing", "Natural selection"], [4, "Memory", "Very low", "Very low", "Higher (a whole population)"]], "sm"),
          n: ["Here's the comparison. Hill climbing and simulated annealing track one state. A genetic algorithm tracks a whole population.",
            "Hill climbing always moves to the best or a better neighbour. Simulated annealing always takes better moves and sometimes takes worse ones, with a probability that shrinks over time. A GA evolves through selection, crossover and mutation.",
            "Hill climbing has a high risk of getting stuck at local maxima, plateaus or ridges. SA's controlled uphill moves help it escape, especially early. A GA's diversity helps it explore broadly.",
            "Only simulated annealing has a guarantee: probability approaching 1 if it cools slowly enough. Neither hill climbing nor a GA guarantees the global optimum, though GAs work well in practice.",
            "Hill climbing is simple greedy ascent, SA comes from metallurgy, and a GA from natural selection. Both single-state methods use very little memory. A GA needs more, for its population."] },
        { v: h("Exam checklist") + list([[0, "Optimisation: only the <b>final state</b> matters, not the path"], [1, "n-queens successors = <b>n × (n − 1)</b> (8-queens: 56). Cost = attacking pairs."], [2, "SA: p = <b>e<sup>−ΔE/T</sup></b>. Better moves always accepted. Higher T or smaller ΔE → more likely."], [3, "Roulette: P(i) = fitness<sub>i</sub> / total fitness"], [4, "Crossover: swap the <b>tails</b> after the cut → two children. Mutation keeps <b>diversity</b>."]]),
          n: ["Your exam checklist. Optimisation problems only care about the final state, not the path.",
            "n-queens has n times n minus 1 successors, so 56 for 8 queens, and the cost is the number of attacking pairs.",
            "In simulated annealing, p equals e to the minus delta E over T. Better moves are always accepted, and a higher temperature or smaller delta E makes a worse move more likely.",
            "Roulette wheel selection: an individual's probability is its fitness divided by the total fitness.",
            "And crossover swaps the tails after the cut point to make two children, while mutation keeps diversity. Now try the SA and roulette calculators in calc practice, and the hill climbing and annealing animations."] }
      ] }
    ]
  };
})();
