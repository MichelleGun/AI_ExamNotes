// Topic notes: Lectures 2 to 6
window.TOPICS = window.TOPICS || [];

window.TOPICS.push({
  id: "l2", num: 2, title: "Classic Search",
  sub: "Navigational search: BFS, DFS, UCS, Greedy, A*",
  sections: [
    { h: "1. The search problem", html: `
<p>A <b class="kw">navigational search problem</b> asks: what is the best <b>path</b> from a start to a goal? Example: drive from <b>Arad</b> to <b>Bucharest</b> on the Romania map.</p>
<p>Assumption: the environment is <b>fully observable</b>, <b>deterministic</b> and <b>known</b>. So the answer is a fixed sequence of actions.</p>
<div class="box"><b>Components of a search problem</b>
<ol>
<li><b class="kw">State space</b>: all possible states (e.g. all cities).</li>
<li><b class="kw">Initial / start state</b>: e.g. Arad.</li>
<li><b class="kw">Goal state</b> + <b>goal test</b>: e.g. "is state = Bucharest?"</li>
<li><b class="kw">Actions</b> ACTIONS(s): what you can do in state s (e.g. drive to a neighbour).</li>
<li><b class="kw">Transition model</b> RESULT(s, a): the new state after action a.</li>
<li><b class="kw">Action (step) cost</b> COST(s, a): e.g. road distance.</li>
</ol></div>
<p><b class="kw">Solution</b> = a path from the <b>root (start) node</b> to a <b>goal node</b>.</p>
<p><b class="kw">Path cost</b> = sum of all <b>step costs</b> from the start node to the current (or goal) node. The <b class="kw">optimal solution</b> = the path with the <b>lowest path cost</b>.</p>
<div class="example">Arad → Sibiu → Rimnicu Vilcea → Pitesti → Bucharest = 140 + 80 + 97 + 101 = <b>418</b> (optimal).<br>Arad → Sibiu → Fagaras → Bucharest = 140 + 99 + 211 = 450.</div>
`},
    { h: "2. Search tree and frontier", html: `
<ul>
<li><b class="kw">Search (spanning) tree</b>: each <b>node</b> = a state, each <b>edge</b> = an action, the <b>root</b> = the start state.</li>
<li><b class="kw">Expanding a node</b>: find its children using the transition model and add them to the tree.</li>
<li><b class="kw">Frontier</b>: the set of <b>leaf nodes</b> waiting to be expanded. The search algorithm decides <b>which frontier node to expand next</b>. That choice is the whole difference between algorithms.</li>
<li><b class="kw">Tree search</b>: does NOT check if a node was expanded before (can loop / repeat).</li>
<li><b class="kw">Graph search</b>: does NOT expand a state that was already reached / expanded (keeps an explored set).</li>
</ul>
<div class="svgwrap">${SVG.searchTree}</div>
`},
    { h: "3. Two groups of techniques", html: `
<p class="note">The course groups them like this (not a strict rule, just a way to organise):</p>
<table class="tbl">
<tr><th>Group</th><th>Algorithm</th><th>Expands next</th><th>Frontier data structure</th></tr>
<tr><td rowspan="2"><b>Blind (uninformed)</b><br><small>no info outside the problem definition</small></td><td><b>BFS</b> Breadth-first</td><td>Shallowest node</td><td><b>FIFO queue</b></td></tr>
<tr><td><b>DFS</b> Depth-first</td><td>Deepest node</td><td><b>LIFO queue (stack)</b></td></tr>
<tr><td rowspan="3"><b>Informed</b><br><small>uses an evaluation function f(n)</small></td><td><b>UCS</b> Uniform-cost</td><td>Lowest <b>f(n) = g(n)</b></td><td><b>Priority queue</b></td></tr>
<tr><td><b>GBFS</b> Greedy best-first</td><td>Lowest <b>f(n) = h(n)</b></td><td><b>Priority queue</b></td></tr>
<tr><td><b>A*</b></td><td>Lowest <b>f(n) = g(n) + h(n)</b></td><td><b>Priority queue</b></td></tr>
</table>
<div class="svgwrap">${SVG.frontier}<p class="figcap">How each algorithm stores the frontier. The data structure decides which node is expanded next.</p></div>
<div class="formula">g(n) = path cost from start to n (known, real)<br>h(n) = estimated cost from n to the goal (heuristic, e.g. straight-line distance h<sub>SLD</sub>)<br>f(n) = evaluation function. Best-first search always expands the frontier node with the <b>minimum f(n)</b>.</div>
<div class="analogy"><b>Analogies</b><br>
<b>BFS</b> = ripples in a pond: explore level by level.<br>
<b>DFS</b> = a maze walker who follows one corridor to the end, then backs up.<br>
<b>UCS</b> = a taxi that always continues the cheapest trip so far.<br>
<b>Greedy</b> = following the smell of food: only "how close do I feel to the goal?", ignores how far you walked.<br>
<b>A*</b> = a GPS: km already driven + km still to go.</div>
`},
    { h: "4. How each technique works (frontier dynamics)", html: `
<ul>
<li><b>BFS</b>: expand root, then all its children, then their children... New nodes go to the <b>back</b> of the FIFO queue. Finds the solution with the <b>fewest actions</b> (not always the cheapest).</li>
<li><b>DFS</b>: always expand the <b>deepest</b> node. New nodes go on <b>top</b> of the stack. Goes deep, then <b>backs up</b> when a node has no children. Returns the <b>first</b> solution found, so <b>not cost-optimal</b>. Low memory.</li>
<li><b>UCS</b>: pop the node with lowest <b>g(n)</b>. Explores paths in order of increasing cost. <b>Complete and cost-optimal</b>. Never gets stuck down one infinite path.</li>
<li><b>Greedy best-first</b>: pop the node with lowest <b>h(n)</b>. Fast, but <b>ignores g(n)</b>, so not optimal (Romania: greedy finds Arad, Sibiu, Fagaras, Bucharest = 450, not 418).</li>
<li><b>A*</b>: pop the node with lowest <b>g + h</b>. Optimal if h is good (see section 6).</li>
</ul>
<div class="tip"><b>Exam tip:</b> In a calculation, write every frontier node with its g, h and f. Pick the lowest f. When the <b>goal is popped</b> (removed) from the frontier, stop. For UCS, f(goal) = total path cost.</div>
<div class="widget" data-widget="search"></div>
`},
    { h: "5. Four performance measures (meaning only)", html: `
<table class="tbl">
<tr><td><b class="kw">Completeness</b></td><td>Does it always find a solution if one exists?</td></tr>
<tr><td><b class="kw">Cost optimality</b></td><td>Does it return the lowest-cost solution?</td></tr>
<tr><td><b class="kw">Time complexity</b></td><td>How much computation (time) to find a solution?</td></tr>
<tr><td><b class="kw">Space complexity</b></td><td>How much memory is needed during the search?</td></tr>
</table>
<p class="note">Note from the course: you do NOT need to evaluate each technique with these measures. Just know what they mean.</p>
`},
    { h: "6. Important properties of A*", html: `
<div class="box">
<p><b class="kw">Admissible</b> heuristic: <b>never overestimates</b> the true cost to the goal. h(n) ≤ h*(n). Example: straight-line distance (a straight line is never longer than the road).</p>
<p><b class="kw">Consistent</b> heuristic: for every node n and successor n' (via action a):</p>
<div class="formula">h(n) ≤ c(n, a, n') + h(n')</div>
<p>(Like the triangle inequality. Consistency is <b>stronger / stricter</b> than admissibility.)</p>
</div>
<div class="svgwrap">${SVG.heuristic}<p class="figcap">Left: what g, h and f measure. Right: the consistency triangle inequality.</p></div>
<ul class="big">
<li><b>Tree-search A*</b> is optimal if h is <b>admissible</b>.</li>
<li><b>Graph-search A*</b> is optimal if h is <b>consistent</b>.</li>
<li>If h is <b>consistent</b> then it is <b>admissible</b> (but NOT the other way round).</li>
</ul>
<div class="analogy"><b>Analogy:</b> an admissible heuristic is an <b>optimistic friend</b>: "it is only 5 minutes away" when it is really 5 or more. Never too pessimistic, so A* never skips the best road.</div>
`},
    { h: "7. Worked example (Romania, A*)", html: `
<table class="tbl">
<tr><th>Step</th><th>Frontier (f = g + h)</th><th>Expand</th></tr>
<tr><td>1</td><td>Arad 0 + 366 = 366</td><td>Arad</td></tr>
<tr><td>2</td><td>Sibiu 140+253=<b>393</b>, Timisoara 118+329=447, Zerind 75+374=449</td><td>Sibiu</td></tr>
<tr><td>3</td><td>Rimnicu 220+193=<b>413</b>, Fagaras 239+176=415, Timisoara 447, Zerind 449, Arad 280+366=646, Oradea 291+380=671</td><td>Rimnicu Vilcea</td></tr>
<tr><td>4</td><td>Fagaras <b>415</b>, Pitesti 317+100=417, Timisoara 447, Craiova 366+160=526, Sibiu 300+253=553, ...</td><td>Fagaras</td></tr>
<tr><td>5</td><td>Pitesti <b>417</b>, Bucharest 450+0=450, Timisoara 447, ...</td><td>Pitesti</td></tr>
<tr><td>6</td><td>Bucharest 418+0=<b>418</b>, Timisoara 447, Bucharest(450), ...</td><td>Bucharest = GOAL, cost 418</td></tr>
</table>
<p><b>Greedy</b> (f = h): Arad 366 → Sibiu 253 → Fagaras 176 → Bucharest 0. Cost 450 (not optimal).</p>
<p><b>UCS</b> (f = g): Arad's children: Zerind 75 (expand first), Timisoara 118, Sibiu 140. g(Rimnicu) = 140 + 80 = 220 &lt; g(Fagaras) = 239. Goal popped with f = 418.</p>
`}
  ]
});

window.TOPICS.push({
  id: "l3", num: 3, title: "Local Search",
  sub: "Optimisation: Hill climbing, Simulated annealing, Genetic algorithm",
  sections: [
    { h: "1. Optimisation (local search) problems", html: `
<p>A <b class="kw">local search problem</b> = an <b class="kw">optimisation problem</b>: find the <b>best state</b> (best value of the objective function). We do <b>NOT care about the path</b>, only the final state.</p>
<div class="box"><b>Components</b>
<ul>
<li><b class="kw">State</b> = one candidate solution (one set of values of the <b>decision variables</b> x<sub>1</sub>...x<sub>n</sub>).</li>
<li><b class="kw">Objective function</b>: f = min(cost) or f = max(fitness). Called <b>cost</b>, <b>fitness</b> or <b>energy</b> function.</li>
<li><b class="kw">Successor / neighbour function</b>: how to get nearby states.</li>
<li><b class="kw">Constraints</b> (optional): e.g. low<sub>i</sub> ≤ x<sub>i</sub> ≤ high<sub>i</sub>.</li>
</ul></div>
<p><b>Discrete</b> problem: variables take discrete values (e.g. queen rows 1..8). <b>Continuous</b>: values from a range (e.g. minimise y = x² - 4x + 7 for -2 ≤ x ≤ 6).</p>
<div class="svgwrap">${SVG.landscape}</div>
<p><b class="kw">State-space landscape</b>: <b>global maximum</b> (best overall), <b>local maximum</b> (better than neighbours, not best), <b>plateau</b> (flat), <b>shoulder</b>, <b>ridge</b>.</p>
`},
    { h: "2. Examples: n-queens and TSP", html: `
<div class="box"><b>8-queen problem</b>
<ul>
<li>State: one queen per column, x<sub>i</sub> = row of queen i (1 ≤ x<sub>i</sub> ≤ 8).</li>
<li>Cost = number of <b>pairs of queens attacking each other</b> (same row, same column, or diagonal). Goal: cost = 0.</li>
<li>Successors: move one queen within its column: <b>8 × 7 = 56</b> successors.</li>
<li>92 goal states (12 fundamental). e.g. cost(2,4,7,4,8,5,5,2) = 4, cost(2,4,6,8,3,1,7,5) = 0.</li>
</ul></div>
<div class="box"><b>4-queen problem</b>: same idea on 4 × 4. Successors: 4 × 3 = <b>12</b>. Only <b>2</b> solutions: (2,4,1,3) and (3,1,4,2).</div>
<div class="svgwrap">${SVG.queens}<p class="figcap">A 4-queens goal state vs a state with one attacking pair (red line).</p></div>
<div class="box"><b>Four-city TSP</b> (Travelling Salesman): visit each city once, return to start, minimise total distance.
<ul><li>State = a route (tour order), e.g. A-B-C-D-A.</li><li>Neighbour = <b>swap two cities</b>.</li><li>Objective = minimise distance. Constraint = visit each city exactly once.</li><li>Distinct tours for n cities = (n-1)!/2, so 4 cities = 3 tours.</li></ul></div>
<div class="widget" data-widget="queens"></div>
`},
    { h: "3. Hill Climbing (HC)", html: `
<div class="box"><b>Update rule:</b> look at all neighbours, <b>move to the best neighbour only if it is better</b> than the current state. Otherwise <b>stop</b> (you are at a peak).</div>
<ol><li>Start anywhere (initial solution).</li><li>Generate neighbours.</li><li>Move to the best improving neighbour (steepest ascent).</li><li>Stop when no neighbour is better.</li></ol>
<p>Keeps only <b>one current state</b>. Memory is tiny. Objective often written f = max(-cost).</p>
<p class="warn"><b>Problem:</b> gets stuck at <b>local maxima</b>, <b>plateaus</b> and <b>ridges</b>. Fix: <b>random restart</b>.</p>
<div class="analogy"><b>Analogy:</b> climbing a mountain in thick fog. You only feel the ground around your feet and always step uphill. You might stop on a small hill and never see the real summit.</div>
`},
    { h: "4. Simulated Annealing (SA)", html: `
<p>Inspired by <b>annealing in metallurgy</b>: heat metal, then cool slowly so atoms settle into a low-energy, strong structure.</p>
<div class="box"><b>Key parameters</b>
<ul>
<li><b class="kw">Energy</b> E(s): the objective to <b>minimise</b>.</li>
<li><b class="kw">Energy change</b> ΔE = E(new) - E(current).</li>
<li><b class="kw">Temperature</b> T: controls how likely we accept a <b>worse</b> move.</li>
<li><b class="kw">Annealing (cooling) schedule</b>: how T decreases over time, e.g. T<sub>k+1</sub> = α·T<sub>k</sub> (α like 0.9).</li>
</ul></div>
<div class="formula"><b>Update rule</b> (minimising energy):<br>
If ΔE &lt; 0 (better): <b>always accept</b>.<br>
If ΔE ≥ 0 (worse): accept with probability <b>p = e<sup>-ΔE / T</sup></b>.<br>
In practice: draw random r in [0, 1). Accept if r &lt; p.</div>
<div class="svgwrap">${SVG.saProb}<p class="figcap">Acceptance probability for a worse move. Higher T or smaller ΔE means more likely to accept.</p></div>
<p>High T → p close to 1 → explores widely. Low T → p close to 0 → acts like hill climbing. Bigger ΔE (much worse) → smaller p.</p>
<p class="warn"><b>Tuning:</b> cooling <b>too fast</b> = behaves like HC, gets trapped. Cooling <b>too slow</b> = many iterations. Results are random, different runs can differ. SA can escape local optima but does not guarantee the best answer in one run.</p>
<div class="widget" data-widget="sa"></div>
<div class="analogy"><b>Analogy:</b> shaking a tray with a marble on a bumpy surface. Shake hard at first (high T) so the marble jumps out of small holes, then shake gently (low T) so it settles in the deepest hole.</div>
`},
    { h: "5. Genetic Algorithm (GA)", html: `
<p>A <b>population-based</b> evolutionary algorithm (Holland 1975). Many candidate solutions evolve over <b>generations</b>. A variant of <b>stochastic beam search</b> inspired by natural selection.</p>
<ul>
<li><b class="kw">Individual / chromosome</b> = a state as a string (often 0s and 1s, or an ordered route).</li>
<li><b class="kw">Fitness function</b> = score of each individual (higher = better).</li>
</ul>
<div class="box"><b>Three key operations</b>
<ol>
<li><b class="kw">Selection</b> (reproduction): choose parents. Fitter ones have a higher chance. <b>Roulette wheel</b>: P<sub>i</sub> = f<sub>i</sub> / Σf.</li>
<li><b class="kw">Crossover</b>: pick a cut point, swap the tails of two parents to make children.</li>
<li><b class="kw">Mutation</b>: randomly change a small part (e.g. flip one bit) to keep <b>diversity</b>.</li>
</ol>
Optional: <b class="kw">Elitism</b> = copy the best few straight into the next generation.</div>
<div class="svgwrap">${SVG.ga}<p class="figcap">The three GA operations on the lecture example.</p></div>
<div class="example"><b>Roulette example</b>: fitness 24, 23, 20, 11. Total 78. P = 24/78 = 0.31, 23/78 = 0.29, 20/78 = 0.26, 11/78 = 0.14. Cumulative (sorted small to big): 0.14, 0.40, 0.69, 1.0. A random number falls in one slice, that individual is selected.</div>
<div class="example"><b>Crossover example</b>: parents 11010|110 and 00111|001, cut after 5 → children 11010<b>001</b> and 00111<b>110</b>.</div>
<p><b>Factors affecting GA:</b> population size, representation, mixing number, selection process, recombination (crossover) procedure, mutation rate, makeup of next generation.</p>
<div class="analogy"><b>Analogy:</b> breeding dogs. Pick the best dogs (selection), mix their traits in puppies (crossover), and sometimes a random new trait appears (mutation).</div>
`}
  ]
});

window.TOPICS.push({
  id: "l4", num: 4, title: "Supervised Learning I",
  sub: "Decision trees, linear/logistic regression, KNN, SVM, random forest, boosting",
  sections: [
    { h: "1. Forms of learning and focused problems", html: `
<table class="tbl">
<tr><td><b class="kw">Supervised</b></td><td>Learn from <b>input-output pairs</b> (labelled). Learn function h(x) ≈ f(x).</td></tr>
<tr><td><b class="kw">Unsupervised</b></td><td>Find patterns in inputs with <b>no labels</b> (e.g. clustering).</td></tr>
<tr><td><b class="kw">Reinforcement</b></td><td>Learn from <b>rewards and punishments</b>.</td></tr>
</table>
<div class="two">
<div class="box"><b class="kw">Classification</b>: output is a <b>discrete class</b> from a finite set. e.g. sunny/cloudy/rainy, COVID positive/negative, iris species.</div>
<div class="box"><b class="kw">Regression</b>: output is a <b>number</b> from a continuous range. e.g. house price, temperature, exchange rate.</div>
</div>
<ul>
<li><b class="kw">i.i.d.</b> (stationary assumption): examples are <b>independent</b> and <b>identically distributed</b>; future data looks like past data.</li>
<li><b class="kw">Ockham's razor</b>: choose the <b>simplest</b> hypothesis consistent with the data.</li>
<li><b class="kw">Generalisation</b>: works on new unseen data. <b class="kw">Overfitting</b>: fits training data (and noise) too well, bad on test data.</li>
</ul>
<div class="svgwrap">${SVG.overfit}<p class="figcap">Same data, three models. Aim for the middle.</p></div>
<div class="box"><b>Classifier metrics</b> (confusion matrix TP, TN, FP, FN)<br>
Accuracy = (TP + TN) / All &nbsp; | &nbsp; Precision = TP / (TP + FP) &nbsp; | &nbsp; Recall = TP / (TP + FN)<br>
F1 = 2 × P × R / (P + R) &nbsp; | &nbsp; Specificity = TN / (TN + FP)<br>
<b>Regression metrics</b>: MAE, RMSE, R².</div>
<div class="svgwrap">${SVG.confusion}<p class="figcap">Confusion matrix. Precision reads down the predicted + column, recall reads across the actual + row.</p></div>
`},
    { h: "2. Decision tree learning", html: `
<p>A tree of <b>if/then</b> tests. <b>Root node</b> → <b>internal nodes</b> (attribute tests) → <b>leaf nodes</b> (class or value). A decision path goes root to leaf.</p>
<p>Build the tree by choosing, at each node, the attribute that makes the children <b>purest</b>. Repeat until a stop rule.</p>
<div class="formula">
<b>Entropy</b> (impurity, uncertainty): H = - Σ p<sub>k</sub> log<sub>2</sub> p<sub>k</sub><br>
Two classes: B(q) = -[q log<sub>2</sub> q + (1-q) log<sub>2</sub>(1-q)], with B(0) = B(1) = 0, B(0.5) = 1<br><br>
<b>Entropy remaining</b> (Remainder) after splitting on A: Remainder(A) = Σ<sub>k</sub> (|subset<sub>k</sub>| / |parent|) × H(subset<sub>k</sub>)<br>
<b>Information gain</b>: IG(A) = H(parent) - Remainder(A) &nbsp; → choose <b>largest IG</b><br><br>
<b>Gini index</b>: Gini = 1 - Σ p<sub>k</sub>²<br>
Weighted child Gini = Σ (|subset<sub>k</sub>| / |parent|) × Gini(subset<sub>k</sub>)<br>
<b>Gini reduction</b> = Gini(parent) - weighted child Gini &nbsp; → choose <b>lowest weighted Gini / largest reduction</b>
</div>
<div class="svgwrap">${SVG.impurity}<p class="figcap">Both impurity measures peak at 50/50 and are 0 for a pure node.</p></div>
<p>Pure node (all one class): entropy 0, Gini 0. 50/50 node: entropy 1 bit, Gini 0.5.</p>
<div class="example"><b>Restaurant (WillWait), 12 examples, 6+ / 6-</b><br>
H(parent) = 1, Gini(parent) = 0.5<br>
<b>Type</b>: French 1+/1-, Italian 1+/1-, Thai 2+/2-, Burger 2+/2-. All children H = 1 → Remainder = 1 → <b>IG = 0</b>. Weighted Gini 0.5 → reduction 0.<br>
<b>Patrons</b>: None 0+/2-, Some 4+/0-, Full 2+/4-.<br>
H(None) = 0, H(Some) = 0, H(Full) = -(1/3)log<sub>2</sub>(1/3) - (2/3)log<sub>2</sub>(2/3) = 0.9183<br>
Remainder = 2/12·0 + 4/12·0 + 6/12·0.9183 = 0.4591 → <b>IG = 0.5409 bits</b><br>
Gini(Full) = 1 - (1/3)² - (2/3)² = 0.4444 → weighted = 6/12 × 0.4444 = 0.2222 → reduction <b>0.2778</b><br>
<b>Choose Patrons</b> (by both IG and Gini).</div>
<div class="svgwrap">${SVG.dtree}<p class="figcap">Splitting the restaurant data on Patrons.</p></div>
<div class="widget" data-widget="dtree"></div>
<p><b>Algorithms:</b> <b>ID3</b> = information gain. <b>C4.5</b> = gain ratio + pruning. <b>CART</b> = Gini (classification) or MSE (regression), binary splits.</p>
<p class="warn">Deep trees <b>overfit</b>. Control with <b>pruning</b>, max_depth, min_samples_leaf.</p>
<div class="analogy"><b>Analogy:</b> the game "20 Questions". Ask the question that splits the possibilities best first ("Is it alive?") before narrow ones.</div>
`},
    { h: "3. Linear and logistic regression", html: `
<div class="box"><b class="kw">Linear regression</b> (regression): h<sub>w</sub>(x) = w<sub>0</sub> + w<sub>1</sub>x<br>
<b class="kw">Squared error loss</b> (L2): Loss = Σ<sub>j</sub> (y<sub>j</sub> - h<sub>w</sub>(x<sub>j</sub>))² &nbsp; (sometimes averaged = MSE)<br>
Training = an optimisation problem with decision variables (w<sub>0</sub>, w<sub>1</sub>). Loss is convex, so use <b>gradient descent</b>:<br>
<div class="formula">w<sub>i</sub> ← w<sub>i</sub> - α · ∂Loss/∂w<sub>i</sub> &nbsp;&nbsp; (α = <b>learning rate</b> / step size)</div></div>
<div class="svgwrap">${SVG.linreg}<p class="figcap">Left: the line and its errors (squared and summed = loss). Right: gradient descent steps down the loss bowl.</p></div>
<div class="example">Data (1, 3), (2, 5), model h = 1 + 1.5x. Predictions 2.5 and 4. Errors 0.5 and 1. Squared error = 0.25 + 1 = <b>1.25</b> (MSE = 0.625).</div>
<div class="box"><b class="kw">Logistic regression</b> (classification): pass the linear output through a <b>sigmoid (logistic)</b> function:<br>
<div class="formula">h<sub>w</sub>(x) = 1 / (1 + e<sup>-w·x</sup>) → probability between 0 and 1. Threshold (usually 0.5) gives the class.</div>
Loss = <b>binary cross-entropy</b>: -[y log ŷ + (1 - y) log(1 - ŷ)].</div>
<div class="svgwrap">${SVG.logistic}<p class="figcap">Logistic regression: the sigmoid turns w·x into a probability, then threshold at 0.5.</p></div>
<p>Linear: target continuous, evaluate MAE/RMSE/R². Logistic: target categorical, evaluate accuracy/precision/recall/F1.</p>
`},
    { h: "4. K-Nearest Neighbours (KNN)", html: `
<p>An <b>instance-based</b> (lazy) method. Store all training data. For a query x<sub>q</sub>:</p>
<ol><li>Measure distance from x<sub>q</sub> to every example.</li><li>Keep the <b>k closest</b>.</li><li><b>Classification</b>: <b>majority vote</b> of their labels. <b>Regression</b>: <b>average</b> (or distance-weighted average) of their values.</li></ol>
<div class="formula">Euclidean: √Σ(x<sub>i</sub> - y<sub>i</sub>)² &nbsp; | &nbsp; Manhattan: Σ|x<sub>i</sub> - y<sub>i</sub>| &nbsp; | &nbsp; Minkowski: (Σ|x<sub>i</sub> - y<sub>i</sub>|<sup>p</sup>)<sup>1/p</sup></div>
<p>Key choices: <b>k</b> (usually given), <b>distance metric</b>, weights. <b>Scale features</b> first (distance based). Slow on big data, sensitive to irrelevant features.</p>
<div class="svgwrap">${SVG.knn}<p class="figcap">The query takes the majority label of its k = 3 nearest points.</p></div>
<div class="example">k = 3, nearest neighbours have labels A, B, A → predict <b>A</b>. For regression with values 10, 12, 14 → predict <b>12</b>.</div>
<div class="analogy"><b>Analogy:</b> "Tell me who your neighbours are and I will tell you who you are." You guess a new house price from the 3 most similar houses nearby.</div>
`},
    { h: "5. Support Vector Machine (concept only, NO calculation)", html: `
<ul>
<li>Find a <b>linear separator</b> (hyperplane w·x + b = 0) that splits two classes in feature space (<b>linearly separable</b> data).</li>
<li>Choose the separator with the <b>maximum margin</b> = largest geometric distance between the separator and the closest points. Those closest points are the <b class="kw">support vectors</b>.</li>
<li>Formulate as an <b>optimisation problem</b>: min ½||w||² subject to y<sub>i</sub>(w·x<sub>i</sub> + b) ≥ 1.</li>
<li>Convert to the <b class="kw">dual problem</b> (in α<sub>i</sub>). It is easier to solve and allows the <b class="kw">kernel trick</b>.</li>
<li><b>Kernel trick</b>: for non-linearly separable data, act as if data were mapped to a <b>higher-dimensional space</b> where it is linearly separable, using only kernel similarity K(x, z) (linear, polynomial, RBF/Gaussian).</li>
<li>Solve to get w*, b*. Classify: <b>f(x) = sign(w*·x + b*)</b>.</li>
<li><b>Soft margin</b>: allows some errors. <b>C</b> = penalty: large C punishes errors more.</li>
</ul>
<div class="svgwrap">${SVG.svm}<p class="figcap">The widest street between the classes. Only the support vectors decide where it goes.</p></div>
<div class="analogy"><b>Analogy:</b> building the <b>widest road</b> between two villages. The houses touching the road edges are the support vectors.</div>
`},
    { h: "6. Ensembles: Random forest and gradient boosting", html: `
<p><b class="kw">Ensemble learning</b>: combine many weak learners into a strong one.</p>
<div class="two">
<div class="box"><b class="kw">Random forest</b> (bagging)<br>
• Draw <b>bootstrap samples</b> (sample rows with replacement).<br>
• Train <b>one tree per sample</b>.<br>
• At each split use a <b>random subset of features</b>.<br>
• Predict: <b>majority vote</b> (classification) or <b>average</b> (regression).<br>
• Reduces <b>variance</b> and overfitting. Trees are independent (parallel).</div>
<div class="box"><b class="kw">Gradient boosting</b> (boosting)<br>
• Build trees <b>sequentially</b>.<br>
• Each new tree fits the <b>remaining error</b> (gradient of the loss / residuals).<br>
• Final output = <b>sum</b> of all tree contributions, scaled by <b>learning rate</b>.<br>
• Strong on tabular data, but too many trees can overfit.</div>
</div>
<div class="svgwrap">${SVG.ensemble}<p class="figcap">Bagging builds trees in parallel and votes. Boosting builds trees one after another, each fixing the last.</p></div>
<div class="analogy"><b>Analogy:</b> Random forest = asking 100 independent friends and taking a vote. Boosting = a student who fixes the mistakes from the last test each time.</div>
`}
  ]
});

window.TOPICS.push({
  id: "l5", num: 5, title: "Neural Networks",
  sub: "Perceptron, MLP/FFN, backpropagation, RNN, LSTM",
  sections: [
    { h: "1. Focused problems and which network to use", html: `
<table class="tbl">
<tr><th>Problem</th><th>Technique</th></tr>
<tr><td><b>Classification</b></td><td><b>Perceptron</b>, <b>Feedforward NN (MLP)</b></td></tr>
<tr><td><b>Regression</b></td><td><b>Feedforward NN (MLP)</b></td></tr>
<tr><td><b>Time series forecasting</b></td><td><b>Recurrent NN (RNN)</b>, LSTM</td></tr>
</table>`},
    { h: "2. Neuron: weights, bias and activation", html: `
<div class="svgwrap">${SVG.neuron}</div>
<div class="formula">in<sub>j</sub> = Σ<sub>i</sub> w<sub>i,j</sub> a<sub>i</sub> + b &nbsp;&nbsp; (weighted sum)<br>a<sub>j</sub> = g(in<sub>j</sub>) &nbsp;&nbsp; (activation)</div>
<ul>
<li><b class="kw">Weight</b> w<sub>i,j</sub>: <b>strength and sign</b> of the link from unit i to unit j.</li>
<li><b class="kw">Bias</b> (w<sub>0</sub> or b): <b>shifts</b> the activation curve left/right (like a threshold).</li>
<li><b class="kw">Activation function</b> g: adds <b>non-linearity</b> so the network can learn complex patterns.</li>
</ul>
<table class="tbl">
<tr><th>Activation</th><th>Formula</th><th>Output range / use</th></tr>
<tr><td>Step (hard threshold)</td><td>1 if z ≥ 0 else 0</td><td>{0, 1}, perceptron</td></tr>
<tr><td>Sigmoid (logistic)</td><td>1 / (1 + e<sup>-z</sup>)</td><td>(0, 1), probability output. g' = g(1 - g)</td></tr>
<tr><td>Tanh</td><td>(e<sup>z</sup> - e<sup>-z</sup>)/(e<sup>z</sup> + e<sup>-z</sup>)</td><td>(-1, 1), zero-centred</td></tr>
<tr><td>ReLU</td><td>max(0, z)</td><td>[0, ∞), fast, common in hidden layers</td></tr>
<tr><td>Softplus</td><td>ln(1 + e<sup>z</sup>)</td><td>smooth version of ReLU</td></tr>
</table>
<div class="svgwrap">${SVG.activations}<p class="figcap">Shapes of the common activation functions (x axis = z).</p></div>
<div class="analogy"><b>Analogy:</b> a neuron is a voter. Each input is an opinion, the weight is how much the voter trusts that friend, the bias is the voter's own mood, and the activation decides "speak up or stay quiet".</div>
`},
    { h: "3. Perceptron", html: `
<p>A <b>single neuron</b>, multiple inputs, one output. For <b>binary classification</b> (linear boundary).</p>
<ol><li>Multiply each input by its weight.</li><li>Add them (+ bias) = weighted sum.</li><li>Apply activation (hard threshold) → 0 or 1.</li></ol>
<div class="formula"><b>Perceptron learning rule</b> (hard threshold): w<sub>i</sub> ← w<sub>i</sub> + α (y - h<sub>w</sub>(x)) x<sub>i</sub><br>
<b>Sigmoid unit, gradient descent</b> with Loss = (y - h)²: w<sub>i</sub> ← w<sub>i</sub> + α · 2(y - h) · h(1 - h) · x<sub>i</sub></div>
<div class="svgwrap">${SVG.perceptron}<p class="figcap">A perceptron draws one straight line. It can do AND but not XOR.</p></div>
<div class="example">x = (1, 2), w = (0.5, -0.25), b = 0.1. Sum = 0.5 - 0.5 + 0.1 = 0.1 ≥ 0 → output <b>1</b>. If target y = 0, α = 0.1: w<sub>1</sub> = 0.5 + 0.1(0 - 1)(1) = 0.4, w<sub>2</sub> = -0.25 + 0.1(-1)(2) = -0.45.</div>
`},
    { h: "4. Feedforward NN (MLP), forward propagation", html: `
<p>One <b>input layer</b>, N ≥ 1 <b>hidden layers</b>, one <b>output layer</b>. Signals flow one way (no loops). Each layer (except input) uses an activation g.</p>
<div class="svgwrap">${SVG.mlp}</div>
<div class="formula">in<sub>3</sub> = w<sub>1,3</sub>x<sub>1</sub> + w<sub>2,3</sub>x<sub>2</sub> + w<sub>0,3</sub> &nbsp;→ a<sub>3</sub> = g(in<sub>3</sub>)<br>
in<sub>4</sub> = w<sub>1,4</sub>x<sub>1</sub> + w<sub>2,4</sub>x<sub>2</sub> + w<sub>0,4</sub> &nbsp;→ a<sub>4</sub> = g(in<sub>4</sub>)<br>
in<sub>5</sub> = w<sub>3,5</sub>a<sub>3</sub> + w<sub>4,5</sub>a<sub>4</sub> + w<sub>0,5</sub> &nbsp;→ ŷ = g(in<sub>5</sub>)<br>
Vector form: h<sub>w</sub>(x) = g<sup>(2)</sup>(W<sup>(2)</sup> g<sup>(1)</sup>(W<sup>(1)</sup>x))</div>
<p><b class="kw">Universal approximation theorem</b>: a network with 2 layers of computational units (first <b>non-linear</b>, second <b>linear</b>) can approximate <b>any continuous function</b> to any accuracy.</p>
<p><b>Reading a computation graph</b>: each node = one operation (multiply, add, activation). Follow arrows from inputs to output.</p>
<div class="widget" data-widget="mlp"></div>
`},
    { h: "5. Backpropagation and gradient descent", html: `
<p><b>Training</b> = two phases repeated:</p>
<ol><li><b>Forward</b>: pass inputs layer by layer to get output ŷ.</li><li><b>Backward</b>: compute the loss, send the <b>error backwards</b> from output to input, update weights.</li></ol>
<div class="svgwrap">${SVG.backprop}<p class="figcap">Forward pass makes ŷ. Backward pass sends Δ from the loss to every weight.</p></div>
<div class="formula">
Loss = (y - ŷ)² &nbsp; (squared error)<br>
Output node error: Δ<sub>out</sub> = -2(y - ŷ) · g'(in<sub>out</sub>) &nbsp; (sigmoid: g' = ŷ(1 - ŷ))<br>
Hidden node "perceived error": Δ<sub>i</sub> = g'(in<sub>i</sub>) Σ<sub>j</sub> w<sub>i,j</sub> Δ<sub>j</sub><br>
Gradient for weight from i to j: ∂Loss/∂w<sub>i,j</sub> = a<sub>i</sub> Δ<sub>j</sub><br>
<b>Update</b>: w<sub>i,j</sub> ← w<sub>i,j</sub> - α · a<sub>i</sub> · Δ<sub>j</sub>
</div>
<p><b class="kw">Gradient descent</b>: move weights in the <b>negative gradient</b> direction to reduce the loss. <b>Chain rule</b> links each weight to the loss. In practice: SGD or <b>Adam</b> optimiser.</p>
<p class="warn"><b class="kw">Vanishing gradient</b>: error signals shrink as they go back through many layers (sigmoid g' ≤ 0.25), so early layers learn very slowly.</p>
<div class="analogy"><b>Analogy:</b> backprop is like a team after a lost match. The coach (loss) tells the last player how wrong the result was, and blame is passed back along the chain, each player adjusting in proportion to how much they contributed.</div>
`},
    { h: "6. Recurrent NN (RNN) and LSTM", html: `
<p>RNN units take as input their <b>own output from the previous time step</b>. They have <b>internal state / memory</b>. Good for <b>sequences</b> and <b>time series</b>.</p>
<div class="svgwrap">${SVG.rnn}</div>
<div class="formula">z<sub>t</sub> = g<sub>z</sub>(W<sub>z,z</sub> z<sub>t-1</sub> + W<sub>x,z</sub> x<sub>t</sub>) &nbsp;&nbsp; (hidden state)<br>ŷ<sub>t</sub> = g<sub>y</sub>(W<sub>z,y</sub> z<sub>t</sub>) &nbsp;&nbsp; (output)</div>
<ul>
<li><b>Markov assumption</b>: hidden state z<sub>t</sub> captures all needed info from previous inputs.</li>
<li>Same weights at every time step (time-homogeneous). <b>Unroll</b> the RNN to get an equivalent feedforward network.</li>
<li>Train with <b class="kw">backpropagation through time (BPTT)</b>. Gradient is recursive.</li>
<li>Gradients contain terms like w<sub>z,z</sub><sup>T</sup>: if w<sub>z,z</sub> &lt; 1 → <b>vanishing gradient</b>; if w<sub>z,z</sub> &gt; 1 → <b>exploding gradient</b>.</li>
</ul>
<div class="box"><b class="kw">LSTM</b> (Long Short-Term Memory) fixes vanishing gradients.
<ul>
<li><b>Memory cell</b> C<sub>t</sub>: long-term memory, copied step to step, updated by <b>adding</b> (not multiplying) → near-constant error flow.</li>
<li><b>Forget gate</b> f: what to remove (reset to 0) from memory.</li>
<li><b>Input gate</b> i: what new info to add to memory.</li>
<li><b>Output gate</b> o: what part of memory goes to the short-term state z<sub>t</sub>.</li>
<li>Gates use sigmoid and <b>elementwise multiplication</b> ⊙.</li>
</ul></div>
<div class="svgwrap">${SVG.lstm}<p class="figcap">LSTM cell: gates (σ) decide what to forget, write and read from the cell state.</p></div>
<div class="analogy"><b>Analogy:</b> a simple RNN is someone retelling a story by whispering (Chinese whispers): early details fade. An LSTM keeps a notebook: it can write (input gate), erase (forget gate) and read (output gate).</div>
<p>See <a href="#/topic/l8">Lecture 8</a> for the simple RNN hidden-state calculation used in the exam.</p>
`}
  ]
});

window.TOPICS.push({
  id: "l6", num: 6, title: "MDP and Reinforcement Learning",
  sub: "Utilities, Q-values, value/policy iteration, Direct utility, ADP, TD, Q-learning",
  sections: [
    { h: "1. MDP components", html: `
<p>A <b class="kw">Markov Decision Process</b> = a sequential decision problem in a <b>fully observable, stochastic</b> environment with a <b>Markovian</b> transition model and <b>additive rewards</b>.</p>
<table class="tbl">
<tr><td><b class="kw">States</b> S</td><td>e.g. grid squares, start state s<sub>0</sub>, terminal states</td></tr>
<tr><td><b class="kw">Actions</b> A(s)</td><td>e.g. Up, Down, Left, Right</td></tr>
<tr><td><b class="kw">Transition model</b> P(s' | s, a)</td><td>probability of reaching s' after doing a in s (Markov: depends only on current state)</td></tr>
<tr><td><b class="kw">Reward</b> R(s, a, s') or R(s)</td><td>immediate reward, e.g. -0.04 per step, +1 / -1 at terminals</td></tr>
<tr><td><b class="kw">Discount factor</b> γ</td><td>0 ≤ γ ≤ 1. Future rewards worth less. γ = 1 means no discount.</td></tr>
<tr><td><b class="kw">Policy</b> π(s)</td><td>the action to take in each state. The <b>solution</b> of an MDP. Optimal policy π* maximises expected utility.</td></tr>
</table>
<div class="formula">Discounted return: G = r<sub>1</sub> + γ r<sub>2</sub> + γ² r<sub>3</sub> + ...</div>
<div class="example">Rewards -0.04, -0.04, +1 with γ = 0.9: G = -0.04 + 0.9(-0.04) + 0.81(1) = -0.04 - 0.036 + 0.81 = <b>0.734</b>.</div>
<div class="box"><b>4 × 3 grid world</b>: move in intended direction with prob <b>0.8</b>, slip to each side (perpendicular) with <b>0.1</b>. Hitting a wall = stay. Living reward -0.04. Terminals (4,3) = +1, (4,2) = -1. Wall at (2,2).</div>
<div class="svgwrap">${SVG.grid}<p class="figcap">4 × 3 grid world: optimal utilities and policy arrows (R = -0.04, γ = 1), plus the 0.8 / 0.1 / 0.1 transition model.</p></div>
<p><b class="kw">MEU</b> (maximum expected utility): choose the action with highest Σ P(outcome) × U(outcome). Route A: 0.8(10) + 0.2(-10) = 6. Route B: 7. Choose B.</p>
`},
    { h: "2. U value vs Q value (Bellman equations)", html: `
<div class="formula">
<b>Q-value</b> (action value) of q-state (s, a):<br>
Q(s, a) = Σ<sub>s'</sub> P(s' | s, a) [ R(s, a, s') + γ U(s') ]<br><br>
<b>U-value</b> (state utility), Bellman equation:<br>
U(s) = max<sub>a</sub> Q(s, a) = max<sub>a</sub> Σ<sub>s'</sub> P(s' | s, a) [ R(s, a, s') + γ U(s') ]<br><br>
<b>Optimal policy</b>: π*(s) = argmax<sub>a</sub> Q(s, a)
</div>
<p class="note">If rewards are on states (R(s)): U(s) = R(s) + γ max<sub>a</sub> Σ<sub>s'</sub> P(s'|s,a) U(s'). Use the form given in the question.</p>
<table class="tbl">
<tr><th></th><th>U(s)</th><th>Q(s, a)</th></tr>
<tr><td>Meaning</td><td>Expected utility of being in <b>state s</b> and acting optimally after</td><td>Expected utility of taking <b>action a in state s</b>, then acting optimally</td></tr>
<tr><td>Link</td><td colspan="2">U(s) = max<sub>a</sub> Q(s, a)</td></tr>
</table>
<div class="svgwrap">${SVG.qbackup}<p class="figcap">Bellman backup: average over outcomes to get Q, then max over actions to get U.</p></div>
<div class="example"><b>Q example</b> (γ = 1, R = -0.04): at state s, action Up: 0.8 to A (U = 0.9), 0.1 to B (U = 0.6), 0.1 stays in s (U = 0.5).<br>
Q = 0.8(-0.04 + 0.9) + 0.1(-0.04 + 0.6) + 0.1(-0.04 + 0.5) = 0.688 + 0.056 + 0.046 = <b>0.79</b></div>
<div class="analogy"><b>Analogy:</b> U(s) = "how good is this restaurant location for me?" Q(s, a) = "how good is it if I order <i>this dish</i> here?" The best dish decides how good the place is.</div>
`},
    { h: "3. Value iteration", html: `
<ol><li>Initialise all utilities (e.g. 0).</li><li>Repeat the <b>Bellman update</b> for every state:<div class="formula">U<sub>i+1</sub>(s) ← max<sub>a</sub> Σ<sub>s'</sub> P(s'|s,a) [R(s,a,s') + γ U<sub>i</sub>(s')]</div></li><li>Stop when utilities <b>converge</b> (change very small).</li><li>Extract the policy: in each state pick the action with highest expected utility.</li></ol>
<p>n states → n Bellman equations. They are <b>non-linear</b> (because of max), so solve them iteratively.</p>
<div class="widget" data-widget="grid"></div>
`},
    { h: "4. Policy iteration", html: `
<p>Start with any policy π<sub>0</sub>, then alternate:</p>
<ol>
<li><b class="kw">Policy evaluation</b>: compute U<sup>π</sup> for the fixed policy. No max (action fixed):<div class="formula">U<sub>i</sub>(s) = Σ<sub>s'</sub> P(s'|s, π<sub>i</sub>(s)) [R(s, π<sub>i</sub>(s), s') + γ U<sub>i</sub>(s')]</div>(linear equations, can solve directly or iteratively)</li>
<li><b class="kw">Policy improvement</b>: one-step look-ahead with MEU:<div class="formula">π<sub>i+1</sub>(s) = argmax<sub>a</sub> Σ<sub>s'</sub> P(s'|s,a) [R(s,a,s') + γ U<sub>i</sub>(s')]</div></li>
<li>Stop when the policy <b>does not change</b>. That policy is optimal.</li>
</ol>
<div class="tip"><b>Exam tip, policy improvement:</b> for a state, compute Q(s, a) for every action using the current U values. Pick the largest. If it differs from the current π(s), change it.</div>
<p>Policy iteration often converges in fewer iterations than value iteration.</p>
`},
    { h: "5. Reinforcement learning overview", html: `
<p>Agent interacts with an environment, takes actions, gets <b>rewards</b>, learns a policy to maximise cumulative reward. Used when P (transition model) or the policy is <b>unknown</b>. MDP = describes the task. RL = learns how to act in it.</p>
<div class="svgwrap">${SVG.rlLoop}<p class="figcap">The RL loop. The agent learns only from what comes back.</p></div>
<ul>
<li><b class="kw">Exploration</b>: try new actions. <b class="kw">Exploitation</b>: use known good actions. Must balance.</li>
<li><b class="kw">Passive RL</b>: policy is <b>fixed</b>, learn the utilities U<sup>π</sup>(s). Methods: <b>Direct utility estimation, ADP, TD</b>.</li>
<li><b class="kw">Active RL</b>: agent must decide what to do. Method: <b>Q-learning</b>.</li>
<li><b>Model-based</b> (learns P, e.g. ADP) vs <b>model-free</b> (TD, Q-learning).</li>
</ul>
<p>Focused problems: calculate the <b>utility values of states</b>, and determine the <b>optimal policy</b>.</p>
`},
    { h: "6. Passive methods: Direct utility, ADP, TD", html: `
<div class="box"><b class="kw">Direct utility estimation</b>: U(s) = <b>average observed reward-to-go</b> from s over trials.<br>
Ignores links between states, learns only at the end of each trial, <b>converges slowly</b>.</div>
<div class="example">γ = 1, step reward -0.04, terminal +1. A trial visits s at 4 steps before the end: reward-to-go = 4(-0.04) + 1 = 0.84. Another trial gives 0.76. Estimate U(s) = (0.84 + 0.76)/2 = <b>0.80</b>.</div>
<div class="box"><b class="kw">ADP</b> (Adaptive Dynamic Programming): <b>learn the transition model</b> from counts, then solve the Bellman equations (policy fixed → linear).<br>
P(s' | s, a) = N(s, a, s') / N(s, a)<br>Steps: count transitions → estimate P → apply Bellman → update U → repeat.</div>
<div class="box"><b class="kw">TD</b> (Temporal Difference): update directly from each observed transition s → s'. <b>No model</b> needed.
<div class="formula">U(s) ← U(s) + α [ R(s, π(s), s') + γ U(s') - U(s) ]<br>TD target = R + γU(s'), TD error = target - U(s)</div></div>
<div class="example">U(s) = 0.5, U(s') = 0.8, R = -0.04, γ = 0.9, α = 0.1. Target = -0.04 + 0.72 = 0.68. Error = 0.18. New U(s) = 0.5 + 0.018 = <b>0.518</b>.</div>
<p><b>TD vs ADP:</b> TD adjusts a state to agree with its <b>one observed successor</b> (one update per transition). ADP adjusts to agree with <b>all possible successors weighted by probability</b>. TD is a crude, efficient approximation of ADP; both converge to the same values.</p>
`},
    { h: "7. Active: Q-learning", html: `
<p>Learn an <b>action-utility function Q(s, a)</b> instead of U(s). <b>Model-free</b>: no P(s'|s,a) needed for learning or action choice.</p>
<div class="formula">Q(s, a) ← Q(s, a) + α [ R(s, a, s') + γ max<sub>a'</sub> Q(s', a') - Q(s, a) ]</div>
<ol><li>Observe state s.</li><li>Choose action a (explore or exploit).</li><li>Do it, observe reward R and next state s'.</li><li>Update Q with the TD target R + γ max Q(s', a').</li><li>Repeat until Q converges.</li></ol>
<div class="example">Q(s,a) = 2, R = 1, γ = 0.9, max<sub>a'</sub> Q(s', a') = 3, α = 0.5. Target = 1 + 2.7 = 3.7. New Q = 2 + 0.5(1.7) = <b>2.85</b>.</div>
<p><b class="kw">Exploration function</b> f(u, n) = R<sup>+</sup> if n &lt; N<sub>e</sub>, else u. Tries each action at least N<sub>e</sub> times (curiosity), then becomes greedy. <b>DQN</b> = Q-learning with a deep neural network.</p>
<div class="analogy"><b>Analogy:</b> Q-learning is a tourist rating dishes at each restaurant: after each meal, nudge the rating toward "how good the meal was + how good the best next meal could be".</div>
`}
  ]
});
