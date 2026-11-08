window.CHEATSHEET = `
<div class="cs"><h3>L2 Classic search</h3>
<p>Problem: states, start, goal test, ACTIONS(s), RESULT(s,a), step cost. Solution = path start→goal. Path cost = Σ step costs.</p>
<p>BFS: FIFO, shallowest. DFS: LIFO, deepest, not optimal. UCS f=g. Greedy f=h. A* f=g+h. UCS/Greedy/A*: priority queue, pop lowest f. Stop when goal is popped.</p>
<p>Admissible: h(n) ≤ true cost. Consistent: h(n) ≤ c(n,a,n') + h(n'). Tree A* optimal if admissible; graph A* optimal if consistent. Consistent ⇒ admissible.</p>
<p>Romania: A→S→R→P→B = 140+80+97+101 = 418. Greedy: A→S→F→B = 450. h: A366 S253 T329 Z374 R193 F176 P100 B0.</p>
<p>Measures: complete, cost-optimal, time, space.</p></div>

<div class="cs"><h3>L3 Local search</h3>
<p>Only final state matters. State, objective (cost/fitness/energy), neighbour fn, constraints.</p>
<p>8-queens: cost = attacking pairs; 56 successors (8×7). 4-queens: 12 successors, solutions 2413, 3142. TSP: swap 2 cities; (n-1)!/2 tours.</p>
<p>HC: move to best neighbour if better, else stop (local max, plateau, ridge).</p>
<p>SA: ΔE = E(new) - E(cur). ΔE&lt;0 accept. Else accept if r &lt; p = e<sup>-ΔE/T</sup>. Cool T (e.g. T←αT). Too fast = HC.</p>
<p>GA: selection (roulette P = f<sub>i</sub>/Σf), crossover (cut, swap tails), mutation (flip), elitism.</p></div>

<div class="cs"><h3>L4 Supervised learning</h3>
<p>Classification = discrete; regression = number. i.i.d. Ockham's razor. Overfitting.</p>
<p>H = -Σ p log<sub>2</sub>p. B(0.5)=1. Remainder(A) = Σ |S<sub>k</sub>|/|S| · H(S<sub>k</sub>). IG = H(parent) - Remainder. Max IG.</p>
<p>Gini = 1 - Σp². Reduction = Gini(parent) - Σ |S<sub>k</sub>|/|S| Gini(S<sub>k</sub>). Restaurant: IG(Patrons) 0.5409, Gini red. 0.2778; Type 0.</p>
<p>H(1/3,2/3) = 0.9183. H(1/4,3/4) = 0.8113. H(1/5,4/5)=0.7219. Gini(1/3,2/3)=0.4444.</p>
<p>Linear: h = w0 + w1x. Loss = Σ(y - h)². GD: w ← w - α ∂L/∂w. Logistic: σ(w·x), cross-entropy.</p>
<p>KNN: k nearest, vote / average. Euclid √Σ(Δ)², Manhattan Σ|Δ|. Scale features.</p>
<p>SVM (concept): max margin, support vectors, dual + kernel trick, sign(w·x+b), soft margin C.</p>
<p>RF: bootstrap + random features + vote/avg (bagging). Boosting: sequential trees on residuals, sum.</p>
<p>Precision TP/(TP+FP). Recall TP/(TP+FN). F1 = 2PR/(P+R). Acc (TP+TN)/all.</p></div>

<div class="cs"><h3>L5 Neural networks</h3>
<p>in<sub>j</sub> = Σ w<sub>ij</sub>a<sub>i</sub> + b; a<sub>j</sub> = g(in<sub>j</sub>). Bias shifts; activation = non-linearity.</p>
<p>σ = 1/(1+e<sup>-z</sup>) (0,1), σ' = σ(1-σ). tanh (-1,1). ReLU max(0,z). Step 0/1. Softplus ln(1+e<sup>z</sup>).</p>
<p>Perceptron: w ← w + α(y - h)x. Classification: perceptron/MLP; regression: MLP; time series: RNN.</p>
<p>Backprop: Δ<sub>out</sub> = -2(y-ŷ)g'(in); Δ<sub>i</sub> = g'(in<sub>i</sub>) Σ w<sub>ij</sub>Δ<sub>j</sub>; ∂L/∂w<sub>ij</sub> = a<sub>i</sub>Δ<sub>j</sub>; w ← w - α a<sub>i</sub>Δ<sub>j</sub>.</p>
<p>Universal approx: 2 layers (non-linear + linear). Vanishing gradient.</p>
<p>RNN: z<sub>t</sub> = g(W<sub>zz</sub>z<sub>t-1</sub> + W<sub>xz</sub>x<sub>t</sub>). BPTT. w&lt;1 vanish, w&gt;1 explode. LSTM: cell (additive), forget / input / output gates.</p></div>

<div class="cs"><h3>L6 MDP and RL</h3>
<p>MDP: S, A, P(s'|s,a), R, γ; solution = policy π. Grid: 0.8 / 0.1 / 0.1, R=-0.04, +1, -1.</p>
<p>Q(s,a) = Σ<sub>s'</sub> P(s'|s,a)[R(s,a,s') + γU(s')]. U(s) = max<sub>a</sub> Q(s,a). π*(s) = argmax<sub>a</sub> Q(s,a).</p>
<p>Return G = r<sub>1</sub> + γr<sub>2</sub> + γ²r<sub>3</sub> ... MEU: pick max Σ P × U.</p>
<p>Value iteration: repeat U ← max<sub>a</sub> Σ P[R + γU] until converge. Policy iteration: evaluate (no max) + improve (argmax), stop when π unchanged.</p>
<p>Direct utility: average reward-to-go. ADP: P = N(s,a,s')/N(s,a), solve Bellman. TD: U(s) ← U(s) + α[R + γU(s') - U(s)].</p>
<p>Q-learning: Q ← Q + α[R + γ max<sub>a'</sub>Q(s',a') - Q]. Model-free, active. Explore vs exploit; f(u,n) = R<sup>+</sup> if n&lt;N<sub>e</sub>.</p></div>

<div class="cs"><h3>L7 Computer vision</h3>
<p>Output = floor((N + 2P - K)/S) + 1. Pool: floor((N - F)/S) + 1, 0 params.</p>
<p>Params = (K×K×C<sub>in</sub> + 1)×C<sub>out</sub> (bias if given). Image size adds nothing. #filters = out channels. RGB 3×3 filter = 27 weights.</p>
<p>Max pool = max; avg pool = mean. Conv: slide, multiply, sum, +b. ReLU after.</p>
<p>Receptive field: r ← r + (K-1)·j; j ← j·S (start 1,1). Two 3×3 = 5, three = 7.</p>
<p>AlexNet: GPU, ReLU. VGG: repeated 3×3. ResNet: F(x)+x skip.</p>
<p>IoU = I/(A + B - I). NMS: keep top score, drop same-class boxes with IoU &gt; thr (check strict!), repeat. YOLO: one pass.</p></div>

<div class="cs"><h3>L8 Sequences and NLP</h3>
<p>RNN: h<sub>t</sub> = tanh(w<sub>x</sub>x<sub>t</sub> + w<sub>h</sub>h<sub>t-1</sub> + b). Sum, then use the tanh lookup. Same weights every step.</p>
<p>e.g. 0.5×2 + 0.25×0.4 = 1.1 → tanh = 0.800.</p>
<p>Attention: weights = softmax(q·k/√d), sum 1. Output = Σ w<sub>i</sub>v<sub>i</sub> per component. 0.3[2,0]+0.7[0,2] = [0.6,1.4]. Q = query, K = matching, V = returned info.</p>
<p>One-to-many: captioning. Many-to-one: sentiment. Many-to-many: translation.</p>
<p>One-hot: |V| long, no similarity. Embeddings: dense, similar = close. CBOW: context→centre. Skip-gram: centre→context.</p>
<p>N-gram: P(w|h) = C(h,w)/C(h). Naive Bayes: P(c)ΠP(x|c); Laplace (n+1)/(T+|V|); normalise.</p>
<p>Transformer: self-attention, multi-head, positional encoding, parallel.</p></div>

<div class="cs"><h3>L9 Generative AI</h3>
<p>Discriminative P(y|x); generative P(x), makes samples; reinforcement: rewards.</p>
<p>AE: encoder → z (bottleneck) → decoder → x̂; loss ||x - x̂||²; denoise, anomaly detection.</p>
<p>VAE: μ, σ; z = μ + σε; loss = recon + KL to N(0,I); sample z → decode.</p>
<p>GAN: G(noise) → fake; D: real or fake; min-max; alternate training; mode collapse.</p></div>

<div class="cs"><h3>L10 Logic</h3>
<p>Precedence ¬ ∧ ∨ ⇒ ⇔. P⇒Q false only T⇒F. P⇔Q true if same.</p>
<p>α⇒β ≡ ¬α∨β ≡ ¬β⇒¬α. α⇔β ≡ (α⇒β)∧(β⇒α). ¬(α∧β) ≡ ¬α∨¬β. ¬(α∨β) ≡ ¬α∧¬β.</p>
<p>Modus Ponens: α⇒β, α ⊢ β. And-elim. Resolution: (A∨P),(¬P∨B) ⊢ (A∨B).</p>
<p>KB ⊨ γ: γ true in every model of KB. Model checking: 2<sup>n</sup> models. Resolution: KB ∧ ¬γ → CNF → derive □.</p>
<p>CNF: remove ⇔, remove ⇒, push ¬ in, distribute ∨ over ∧.</p>
<p>Wumpus: R2 B11⇔(P12∨P21), R4 ¬B11 ⊢ ¬P12. Clause (¬P12∨B11) + P12 → B11; + ¬B11 → □.</p>
<p>FOL: ∀ with ⇒, ∃ with ∧. ¬∀x P ≡ ∃x ¬P. UI: any ground term. EI: new constant.</p></div>

<div class="cs"><h3>L11 Probability and BN</h3>
<p>P(A|B) = P(A∧B)/P(B). Bayes: P(B|A) = P(A|B)P(B)/P(A). P(¬A) = 1 - P(A).</p>
<p>P(X|e) = α Σ<sub>y</sub> P(X,e,y). Marginalise = sum out. Full joint: 2<sup>n</sup> rows.</p>
<p>BN: P(x<sub>1</sub>..x<sub>n</sub>) = Π P(x<sub>i</sub>|parents). Burglary: P(B)P(E)P(A|B,E)P(J|A)P(M|A).</p>
<p>P(B)=.001 P(E)=.002; P(a|B,E): tt .95, tf .94, ft .29, ff .001; P(j|a) .90/.05; P(m|a) .70/.01.</p>
<p>P(j,m,a,¬b,¬e) = .9×.7×.001×.999×.998 = 0.000628. P(B|j,m) = 0.284.</p>
<p>Causal P(effect|cause), diagnostic P(cause|effect).</p></div>

<div class="cs"><h3>L12 Hierarchical knowledge</h3>
<p>is-a hierarchy, inheritance, transitivity. ∈ member (object), ⊆ subset (category).</p>
<p>Semantic net: nodes + labelled links; inherit upward; specific overrides general (Penguin cannot fly; John Legs=1).</p>
<p>Ontology: classes, properties, individuals, axioms (domain/range). Reasoner: infer class, infer property chain, check rule, check consistency.</p>
<p>Knowledge graph: entity triples (subject, predicate, object); Wikidata, RDF, SPARQL (?var, P31 instance of, Q146 cat, P18 image).</p>
<p>Category reasoning: perceive → classify → predict.</p></div>
`;
