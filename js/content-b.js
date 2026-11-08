// Topic notes: Lectures 7 to 12
window.TOPICS = window.TOPICS || [];

window.TOPICS.push({
  id: "l7", num: 7, title: "Computer Vision (CNN)",
  sub: "Convolution, stride, padding, parameters, pooling, receptive field, IoU, NMS",
  sections: [
    { h: "1. Focused problems", html: `
<ul>
<li><b class="kw">Image classification</b>: one label for the whole image (what is present, not where). Output = probability for each class.</li>
<li><b class="kw">Object detection</b>: for every object, a <b>box</b> (x, y, width, height) + <b>class label</b> + <b>confidence</b>. "What and where".</li>
<li>(Extra) <b>Semantic segmentation</b>: a class for <b>every pixel</b>.</li>
</ul>
<p>An image is a <b>tensor</b> of numbers. Colour image = 3 channels (R, G, B). Shape in PyTorch: <b>[batch, channels, height, width]</b>.</p>
<p><b>Why not a fully connected network?</b> Flattening <b>loses spatial structure</b> (neighbours) and needs <b>too many weights</b> (224 × 224 × 3 = 150,528 inputs × 1,000 units = 150,528,000 weights). Convolution fixes both: <b>local connections + shared weights</b>.</p>
<div class="svgwrap">${SVG.cnnPipe}<p class="figcap">A typical CNN for image classification.</p></div>
`},
    { h: "2. Convolution operation", html: `
<p>A <b class="kw">filter (kernel)</b> is a small grid of learned weights. <b>Slide</b> it over the input; at each position <b>multiply element-wise and sum</b> (+ bias). The result is one value in the <b>feature map</b>.</p>
<div class="formula">z[p, q] = Σ<sub>i</sub> Σ<sub>j</sub> w<sub>ij</sub> · x[p + i, q + j] + b</div>
<ul>
<li><b class="kw">Stride</b> S: how many pixels the filter moves each step. Bigger stride → smaller output.</li>
<li><b class="kw">Padding</b> P: add a border of zeros so the filter fits at the edges. "Same" padding keeps size.</li>
</ul>
<div class="svgwrap">${SVG.convCalc}<p class="figcap">One convolution step: multiply the highlighted 3 × 3 patch by the kernel and sum.</p></div>
<div class="formula"><b>Output size</b> = floor( (N + 2P - K) / S ) + 1<br>N = input size, K = kernel size, P = padding, S = stride</div>
<div class="example">5 × 5 input, 3 × 3 kernel, S = 1, P = 0: (5 - 3)/1 + 1 = <b>3 × 3</b>.<br>
32 × 32, K = 5, P = 2, S = 1: (32 + 4 - 5)/1 + 1 = <b>32</b>.<br>
7 × 7, K = 3, P = 0, S = 2: (7 - 3)/2 + 1 = <b>3</b>.</div>
<div class="widget" data-widget="conv"></div>
<p>Same weights are reused at every position = <b class="kw">parameter (weight) sharing</b>. A filter asks one local question ("is there a diagonal edge here?") everywhere.</p>
<div class="analogy"><b>Analogy:</b> a filter is a small stamp or magnifying glass you slide across a page, looking for one pattern. Different stamps find different patterns (edges, corners, textures).</div>
`},
    { h: "3. Filters and parameter count", html: `
<ul>
<li>Each standard filter spans <b>all input channels</b>. For RGB input, a 3 × 3 filter has 3 × 3 × 3 = <b>27 weights</b>.</li>
<li>Each filter makes <b>one output feature map</b>. Number of filters = <b>number of output channels</b>.</li>
<li>Image size and number of positions do <b>NOT</b> add parameters (weights are shared).</li>
</ul>
<div class="formula"><b>Parameters</b> = (K<sub>h</sub> × K<sub>w</sub> × C<sub>in</sub> + 1) × C<sub>out</sub> &nbsp; (the +1 is one bias per filter, only if biases are used)</div>
<div class="example">Two 3 × 3 filters on RGB input with bias: (3 × 3 × 3 + 1) × 2 = <b>56</b>.<br>
16 filters, 5 × 5, on 8-channel input, with bias: (5 × 5 × 8 + 1) × 16 = 201 × 16 = <b>3,216</b>.<br>
Same without bias: 200 × 16 = 3,200.</div>
<p class="warn">Common mistakes: forgetting input channels, adding image size, forgetting or double-counting bias.</p>
`},
    { h: "4. Pooling", html: `
<p>Pooling <b>shrinks</b> the feature map (downsampling), keeps important info, adds small shift tolerance. <b>No learned weights</b> (0 parameters).</p>
<ul><li><b class="kw">Max pooling</b>: take the <b>largest</b> value in each window.</li><li><b class="kw">Average pooling</b>: take the <b>mean</b> of each window.</li></ul>
<div class="formula">Output size = floor( (N - F) / S ) + 1 &nbsp; (F = pool size). 2 × 2, stride 2 halves the size.</div>
<div class="example">Window [1 3; 2 8] → max = <b>8</b>, average = (1+3+2+8)/4 = <b>3.5</b>.<br>512 × 512 with 2 × 2 max pool stride 2 → 256 × 256.</div>
<div class="svgwrap">${SVG.pool}<p class="figcap">Each coloured 2 × 2 window becomes one output value.</p></div>
<p>Typical block: <b>Conv → ReLU → Pool</b>. ReLU keeps positive evidence (sets negatives to 0).</p>
`},
    { h: "5. Receptive field", html: `
<p>The <b class="kw">receptive field</b> of a unit = the <b>region of the input image</b> that can affect that unit.</p>
<ul><li>First conv layer: receptive field = kernel size (3 × 3 kernel → 3 × 3).</li><li>It <b>grows with depth</b>. Deeper layers "see" bigger areas, so they detect bigger structures (edges → parts → objects).</li></ul>
<div class="formula">Layer by layer: r<sub>new</sub> = r<sub>old</sub> + (K - 1) × j<sub>old</sub>, &nbsp; j<sub>new</sub> = j<sub>old</sub> × S &nbsp; (start r = 1, j = 1; j = "jump", product of earlier strides)<br>
Stacked stride-1 K × K convs: r = 1 + L(K - 1). Two 3 × 3 → <b>5 × 5</b>, three 3 × 3 → <b>7 × 7</b>.</div>
<div class="example">3 × 3 conv (s1) → r = 3, j = 1. 2 × 2 pool (s2) → r = 3 + 1×1 = 4, j = 2. 3 × 3 conv (s1) → r = 4 + 2×2 = <b>8</b>.</div>
<div class="svgwrap">${SVG.rf}<p class="figcap">1D view of two stacked 3 × 3 convolutions. The top unit depends on 5 input pixels.</p></div>
<div class="widget" data-widget="rf"></div>
<div class="analogy"><b>Analogy:</b> a company. A worker sees only their desk (small receptive field). A manager sees reports from many workers (bigger area). The CEO sees the whole company.</div>
`},
    { h: "6. CNN architectures: AlexNet, VGGNet, ResNet", html: `
<p>All share: <b>convolutional feature extractor (backbone) → classifier head</b>. Layers learn a hierarchy: edges → textures → parts → objects. Spatial size shrinks, channels grow.</p>
<table class="tbl">
<tr><th>Network</th><th>Key idea</th></tr>
<tr><td><b>AlexNet</b> (2012)</td><td>Breakthrough on ImageNet. <b>GPU training</b>, ReLU, dropout. 8 layers.</td></tr>
<tr><td><b>VGGNet</b></td><td><b>Repeat small 3 × 3 filters</b>, very uniform, deeper (11 to 19 layers). Two 3 × 3 = receptive field of one 5 × 5 with fewer parameters.</td></tr>
<tr><td><b>ResNet</b></td><td><b>Identity shortcuts (skip connections)</b>. Block learns a correction F(x) and outputs <b>F(x) + x</b>. If F(x) = 0 it keeps x. Gives gradients a direct path, so very deep networks train (fights vanishing gradient).</td></tr>
</table>
<div class="svgwrap">${SVG.resblock}<p class="figcap">ResNet block: output = F(x) + x.</p></div>
<p><b>Fine-tuning / transfer learning</b>: reuse a pretrained backbone (e.g. ResNet) for a new task.</p>
`},
    { h: "7. Object detection: IoU and Non-max suppression", html: `
<p>Naive idea: classify many crops (sliding window) → far too many crops (e.g. 57,600) and repeated work. <b>YOLO</b>: run the CNN <b>once</b>, predict boxes + objectness + class scores at every grid location in one pass.</p>
<div class="formula">For boxes by corners (x1, y1) to (x2, y2):<br>
Intersection width = min(x2<sub>A</sub>, x2<sub>B</sub>) - max(x1<sub>A</sub>, x1<sub>B</sub>) (if negative, 0). Same for height.<br>
Intersection area = width × height<br>
Union = area A + area B - intersection<br>
<b>IoU = intersection / union</b> (0 = no overlap, 1 = identical)</div>
<div class="example">A: (0,0) to (6,4), B: (2,0) to (8,4). Areas 24 and 24. Overlap 4 × 4 = 16. Union 24 + 24 - 16 = 32. <b>IoU = 0.50</b>.</div>
<div class="svgwrap">${SVG.iou}<p class="figcap">The IoU worked example drawn to scale.</p></div>
<div class="box"><b class="kw">Non-max suppression (NMS)</b> removes duplicate boxes:
<ol><li>Sort boxes by <b>confidence</b>. Keep the highest one.</li><li>Remove (suppress) other boxes of the <b>same class</b> whose IoU with it is above the threshold.</li><li>Repeat with the next highest remaining box.</li></ol>
Read the threshold rule carefully: if it says IoU <b>strictly greater</b> than 0.5, then IoU = 0.5 is <b>not</b> suppressed. Boxes of a different class are not suppressed.</div>
<div class="svgwrap">${SVG.nms}<p class="figcap">NMS with threshold 0.5. Only same-class boxes that overlap the kept box are removed.</p></div>
<div class="widget" data-widget="iou"></div>
<div class="analogy"><b>Analogy:</b> NMS is like several friends taking photos of the same person. Keep the sharpest photo, delete the near-duplicates, but keep photos of other people.</div>
`}
  ]
});

window.TOPICS.push({
  id: "l8", num: 8, title: "Sequence Modelling and NLP",
  sub: "RNN hidden state, embeddings, n-grams, Naive Bayes, attention, Transformer",
  sections: [
    { h: "1. Sequences and RNNs", html: `
<p>A <b class="kw">sequence</b> = observations + meaningful <b>order</b>. Positions are not interchangeable; later steps depend on earlier ones. A model should: handle <b>variable length</b>, keep <b>order</b>, carry <b>context</b>, and <b>share parameters</b> across time.</p>
<p>A feedforward network has no state. An RNN has a <b class="kw">hidden state</b> h<sub>t</sub> = memory of earlier inputs.</p>
<div class="formula">h<sub>t</sub> = tanh( W<sub>hh</sub> h<sub>t-1</sub> + W<sub>xh</sub> x<sub>t</sub> + b ) &nbsp;&nbsp; ŷ<sub>t</sub> = W<sub>hy</sub> h<sub>t</sub><br>h<sub>0</sub> = zeros (or learned)</div>
<ul><li>The <b>same cell and same weights</b> are reused at every step. Unrolling copies the computation, not the parameters.</li></ul>
<div class="svgwrap">${SVG.seqTypes}<p class="figcap">Orange = inputs, purple = outputs, boxes = the same RNN cell at each time step.</p></div>
<table class="tbl">
<tr><th>Type</th><th>Example</th></tr>
<tr><td>One-to-many</td><td>Image captioning (one image → words), music from a seed</td></tr>
<tr><td>Many-to-one</td><td>Sentiment classification, ECG → diagnosis</td></tr>
<tr><td>Many-to-many</td><td>Machine translation</td></tr>
</table>
`},
    { h: "2. Calculation: simple RNN hidden-state update", html: `
<div class="box"><ol>
<li>Multiply the <b>current input</b> by the <b>input weight</b>.</li>
<li>Separately multiply the <b>previous hidden state</b> by the <b>recurrent weight</b>.</li>
<li>Add the two (add bias <b>only if given</b>).</li>
<li>Apply the activation (e.g. tanh) using the <b>supplied lookup value</b>. The sum before tanh is NOT the final answer.</li>
<li>Round as asked.</li></ol></div>
<div class="example">x = 2, w<sub>x</sub> = 0.5, h<sub>prev</sub> = 0.4, w<sub>h</sub> = 0.25, no bias.<br>Sum = 0.5 × 2 + 0.25 × 0.4 = 1.0 + 0.1 = 1.1. Given tanh(1.1) = 0.800 → <b>h<sub>t</sub> = 0.800</b>.</div>
<div class="svgwrap">${SVG.rnnCell}<p class="figcap">The worked example as a picture. Note tanh is applied after the sum.</p></div>
<p class="warn">Do not swap x and h<sub>prev</sub>. Keep each with its own weight.</p>
<div class="widget" data-widget="rnn"></div>
`},
    { h: "3. Training RNNs: BPTT, vanishing gradients, gates", html: `
<ul>
<li>Sum the losses over time → <b>backpropagate through time</b> → update shared weights.</li>
<li>Gradient for early steps involves <b>repeated multiplication</b> by W<sub>hh</sub> and tanh' → <b class="kw">vanishing</b> (small) or <b class="kw">exploding</b> (large) gradients. Long-range clues get lost.</li>
<li>Fix exploding: <b>gradient clipping</b>. Fix vanishing: <b>gated cells</b> (<b>LSTM</b>, <b>GRU</b>). A learned gate controls how much passes to the next step.</li>
</ul>`},
    { h: "4. Representing words", html: `
<ul>
<li><b class="kw">Tokenization</b>: raw text → tokens → <b>vocabulary</b> V.</li>
<li><b class="kw">One-hot</b>: vector of length |V| with a single 1. IDs have no magnitude meaning. All words are <b>equally distant</b> (no similarity info). New words grow |V|.</li>
<li><b class="kw">Word embeddings</b>: short dense learned vectors. Similar words are <b>close</b>. Offsets express relations: king - man + woman ≈ queen.</li>
<li><b class="kw">Word2Vec</b>: learn embeddings from a sliding window (no manual labels).<br><b>CBOW</b>: <b>context words predict the centre word</b>. <b>Skip-gram</b>: <b>centre word predicts each context word</b>. Loss = -log p(correct word), softmax over vocabulary.</li>
</ul>`},
    { h: "5. N-gram language model", html: `
<div class="formula">P(w | history) = count(history, w) / count(history)<br>Bigram uses last 1 word, <b>trigram uses last 2 words</b>.</div>
<div class="example">Corpus has "Mando protects" 5 times, followed by "Grogu" 3 times. P(Grogu | Mando protects) = <b>3/5</b>.</div>
<p>N-grams memorise local patterns, but do not learn meaning and fail on unseen word combinations.</p>
<div class="svgwrap">${SVG.embed}<p class="figcap">Embeddings place similar words close, and relations become directions.</p></div>
<div class="svgwrap">${SVG.w2v}<p class="figcap">Word2Vec training tasks with a window of 2.</p></div>
`},
    { h: "6. Naive Bayes text classifier", html: `
<div class="formula">P(c | text) ∝ P(c) × Π<sub>i</sub> P(x<sub>i</sub> | c) &nbsp; ("naive" = words independent given the class)<br>
Score S<sub>+</sub> = P(+) × Π P(x<sub>i</sub>|+), &nbsp; S<sub>-</sub> = P(-) × Π P(x<sub>i</sub>|-)<br>
<b>Laplace (add-one) smoothing</b>: P(x | c) = (count(x in c) + 1) / (T<sub>c</sub> + |V|)<br>
Normalise: P(+ | text) = S<sub>+</sub> / (S<sub>+</sub> + S<sub>-</sub>)</div>
<div class="example">11 positive, 9 negative reviews → P(+) = 0.55, P(-) = 0.45. "heartwarming" appears 6 times in positive (T<sub>+</sub> = 20, |V| = 6): (6 + 1)/(20 + 6) = 0.27.<br>
S<sub>+</sub> = 0.000328, S<sub>-</sub> = 0.000640 → P(+|text) = 0.000328 / 0.000968 ≈ <b>0.34</b> → predict negative.</div>
<p>Smoothing avoids a zero probability wiping out the whole product.</p>
`},
    { h: "7. Attention: weighted value aggregation", html: `
<p>Idea: each token <b>retrieves the context it needs</b> by attending to relevant tokens.</p>
<ul>
<li><b class="kw">Query (Q)</b>: what I am looking for.</li>
<li><b class="kw">Key (K)</b>: compact description used for <b>matching</b>.</li>
<li><b class="kw">Value (V)</b>: the full information <b>returned</b> after a match.</li>
</ul>
<div class="formula">score<sub>i</sub> = q · k<sub>i</sub> (dot product, scaled by √d<sub>k</sub>)<br>weights = softmax(scores) → <b>sum to 1</b><br>
<b>output = Σ<sub>i</sub> weight<sub>i</sub> × v<sub>i</sub></b> &nbsp;&nbsp; Attention(Q,K,V) = softmax(QK<sup>T</sup> / √d<sub>k</sub>) V</div>
<div class="box"><b>Calculation steps</b><ol>
<li>Multiply every component of value vector 1 by weight 1. Do the same for each other value vector.</li>
<li>Add corresponding components. The output has the <b>same length as each value vector</b>.</li>
<li>Use all weights. Do NOT just pick the biggest-weight vector, and do NOT add unweighted vectors.</li></ol></div>
<div class="example">Weights 0.3 and 0.7, values [2, 0] and [0, 2].<br>Output = [0.3×2 + 0.7×0, 0.3×0 + 0.7×2] = <b>[0.6, 1.4]</b>.</div>
<div class="svgwrap">${SVG.attention}<p class="figcap">The worked example: weights 0.3 and 0.7 blend the two value vectors.</p></div>
<div class="widget" data-widget="attn"></div>
<div class="analogy"><b>Analogy:</b> a library search. Your question is the query, book titles are keys, book contents are values. You read a bit of every book, more from the books whose titles match best, and blend what you read.</div>
`},
    { h: "8. Self-attention and Transformer", html: `
<ul>
<li><b class="kw">Self-attention</b>: Q, K and V all come from the <b>same sequence</b>, so every token builds a <b>context-aware</b> representation.</li>
<li>Question answering example: the <b>question</b> gives the query; the <b>document tokens</b> give keys (matching) and values (aggregation).</li>
<li><b class="kw">Multi-head attention</b>: several heads learn different attention patterns in parallel.</li>
<li><b class="kw">Positional encoding</b>: attention has no built-in order, so add position info to embeddings.</li>
<li><b class="kw">Transformer</b>: built from attention, no recurrence → processes all positions <b>in parallel</b>, handles long-range links. Basis of LLMs.</li>
</ul>`}
  ]
});

window.TOPICS.push({
  id: "l9", num: 9, title: "Generative AI",
  sub: "Discriminative vs generative vs reinforcement, Autoencoder, VAE, GAN",
  sections: [
    { h: "1. Three categories of models in ML", html: `
<table class="tbl">
<tr><th>Category</th><th>Learns</th><th>Examples</th></tr>
<tr><td><b class="kw">Discriminative</b></td><td>Boundary / mapping from x to label y, P(y | x). Needs labels (supervised).</td><td>Classification, regression, object detection</td></tr>
<tr><td><b class="kw">Generative</b></td><td>The <b>data distribution</b> P(x) itself, so it can <b>create new samples</b>. Often unsupervised.</td><td>AE, VAE, GAN, autoregressive, diffusion</td></tr>
<tr><td><b class="kw">Reinforcement</b></td><td>A policy (actions) from <b>rewards</b>.</td><td>Q-learning, game playing</td></tr>
</table>
<p><b>Why generative models?</b> Sample generation, <b>outlier detection</b>, <b>debiasing</b> datasets (find hidden features).</p>
<p><b class="kw">Latent variables</b> z: hidden factors that explain the observed data x (e.g. pose, lighting, smile). A generative model learns how z gives rise to x.</p>
<div class="analogy"><b>Analogy:</b> a discriminative model is an art critic who says "this is a Monet". A generative model is a painter who can paint a new Monet-style picture.</div>
`},
    { h: "2. Autoencoder (AE)", html: `
<div class="svgwrap">${SVG.ae}</div>
<ul>
<li><b class="kw">Encoder</b>: x → low-dimensional <b>latent code z</b>. <b class="kw">Decoder</b>: z → <b>reconstruction x̂</b>.</li>
<li>Train to make x̂ ≈ x. <b>Reconstruction loss</b> = ||x - x̂||². No labels needed (unsupervised).</li>
<li><b class="kw">Bottleneck</b>: z is smaller than x, so the network must <b>compress</b> and keep only important features. Smaller latent space = tighter bottleneck = more compression, usually worse reconstruction.</li>
<li>Uses: compact representations, <b>denoising</b>, <b>anomaly detection</b> (high reconstruction error = unusual input).</li>
<li>Limitation: not good at generating new samples from random z (latent space has gaps).</li>
</ul>
<div class="analogy"><b>Analogy:</b> summarising a movie in one sentence (encoder) and someone retelling the movie from your sentence (decoder).</div>
`},
    { h: "3. Variational Autoencoder (VAE)", html: `
<ul>
<li>Probabilistic twist on AE: the encoder outputs a <b>distribution</b>: a <b>mean μ</b> and <b>standard deviation σ</b> for each latent dimension.</li>
<li>Sample z from it. <b class="kw">Reparameterisation trick</b>: z = μ + σ · ε, with ε ~ N(0, 1). This lets gradients flow through the sampling.</li>
<li><b>Loss = reconstruction loss + KL regularisation</b>. KL pushes the latent distribution toward the prior <b>N(0, I)</b>.</li>
<li>Regularisation gives <b>continuity</b> (close z → similar output) and <b>completeness</b> (any sampled z → meaningful output).</li>
<li><b>Generate</b>: sample z from N(0, I), decode → a new sample.</li>
<li>β-VAE (β &gt; 1): stronger KL → <b>disentangled</b> latent factors.</li>
</ul>
<div class="svgwrap">${SVG.vae}<p class="figcap">VAE: the encoder outputs a distribution, z is sampled with the reparameterisation trick.</p></div>
<div class="analogy"><b>Analogy:</b> an AE stores each photo at an exact pin on a map. A VAE stores each photo as a fuzzy cloud, and the clouds overlap and fill the map, so any random spot gives a sensible picture.</div>
`},
    { h: "4. Generative Adversarial Network (GAN)", html: `
<div class="svgwrap">${SVG.gan}</div>
<ul>
<li><b class="kw">Generator G</b>: random noise z → <b>fake sample</b> G(z). Tries to fool D.</li>
<li><b class="kw">Discriminator D</b>: sample → probability it is <b>real</b>. Tries to tell real from fake.</li>
<li><b>Adversarial training</b>: a min-max game. Alternate: train D, then train G. G learns indirectly from D's feedback.</li>
<li>Objective: min<sub>G</sub> max<sub>D</sub> E<sub>x</sub>[log D(x)] + E<sub>z</sub>[log(1 - D(G(z)))]</li>
<li>Success: generated distribution matches the real one, D cannot tell (D ≈ 0.5).</li>
<li><b class="kw">Mode collapse</b>: G produces only one kind of output that fools D, missing diversity.</li>
<li>After training, keep <b>G</b> to create new data.</li>
</ul>
<div class="analogy"><b>Analogy:</b> a <b>forger</b> (G) and a <b>detective</b> (D). The detective gets better at spotting fakes, so the forger gets better at making them, until fakes look real.</div>
`},
    { h: "5. Other generators (extra)", html: `
<ul>
<li><b>Autoregressive</b>: generate one element at a time; p(x) = p(x<sub>1</sub>)p(x<sub>2</sub>|x<sub>1</sub>)...; e.g. next-token LLMs.</li>
<li><b>Diffusion</b>: forward process adds noise step by step; the model learns to <b>predict the noise</b>; generate by repeatedly <b>denoising</b> from random noise (can be guided by text prompt).</li>
</ul>`}
  ]
});

window.TOPICS.push({
  id: "l10", num: 10, title: "Logic and Reasoning",
  sub: "Propositional and first-order logic, KB ⊨ γ, model checking, theorem proving, resolution",
  sections: [
    { h: "1. Propositional logic: syntax and semantics", html: `
<p>A <b class="kw">proposition</b> = a statement that is either true or false (not a question or command). A <b class="kw">model</b> = an assignment of True/False to every symbol.</p>
<table class="tbl tt">
<tr><th>P</th><th>Q</th><th>¬P</th><th>P ∧ Q</th><th>P ∨ Q</th><th>P ⇒ Q</th><th>P ⇔ Q</th></tr>
<tr><td>F</td><td>F</td><td>T</td><td>F</td><td>F</td><td><b>T</b></td><td>T</td></tr>
<tr><td>F</td><td>T</td><td>T</td><td>F</td><td>T</td><td><b>T</b></td><td>F</td></tr>
<tr><td>T</td><td>F</td><td>F</td><td>F</td><td>T</td><td><b>F</b></td><td>F</td></tr>
<tr><td>T</td><td>T</td><td>F</td><td>T</td><td>T</td><td><b>T</b></td><td>T</td></tr>
</table>
<ul>
<li><b>P ⇒ Q</b> is false <b>only</b> when P true and Q false. False premise → <b>vacuously true</b> ("a promise never tested is kept").</li>
<li><b>P ⇔ Q</b> true when both have the <b>same value</b>. P ⇔ Q ≡ (P ⇒ Q) ∧ (Q ⇒ P).</li>
</ul>
<div class="formula"><b>Precedence</b> (highest first): <b>¬ , ∧ , ∨ , ⇒ , ⇔</b> &nbsp; (memory: "Not And Or Implies Iff")<br>¬P ∨ Q ∧ R ⇒ S means ((¬P) ∨ (Q ∧ R)) ⇒ S</div>
<p>Terms: <b>literal</b> = atom or negated atom; <b>conjunction</b> (∧, conjuncts); <b>disjunction</b> (∨, disjuncts); <b>implication</b> P ⇒ Q (P = premise/antecedent, Q = conclusion/consequent, a rule / if-then).</p>
<div class="widget" data-widget="truth"></div>
`},
    { h: "2. Standard logical equivalences", html: `
<table class="tbl">
<tr><td>Commutativity</td><td>α ∧ β ≡ β ∧ α, &nbsp; α ∨ β ≡ β ∨ α</td></tr>
<tr><td>Associativity</td><td>(α ∧ β) ∧ γ ≡ α ∧ (β ∧ γ) (same for ∨)</td></tr>
<tr><td>Double negation</td><td>¬(¬α) ≡ α</td></tr>
<tr><td><b>Contraposition</b></td><td>α ⇒ β ≡ ¬β ⇒ ¬α</td></tr>
<tr><td><b>Implication elimination</b></td><td>α ⇒ β ≡ ¬α ∨ β</td></tr>
<tr><td><b>Biconditional elimination</b></td><td>α ⇔ β ≡ (α ⇒ β) ∧ (β ⇒ α)</td></tr>
<tr><td><b>De Morgan</b></td><td>¬(α ∧ β) ≡ ¬α ∨ ¬β, &nbsp; ¬(α ∨ β) ≡ ¬α ∧ ¬β</td></tr>
<tr><td>Distributivity</td><td>α ∧ (β ∨ γ) ≡ (α ∧ β) ∨ (α ∧ γ), &nbsp; α ∨ (β ∧ γ) ≡ (α ∨ β) ∧ (α ∨ γ)</td></tr>
</table>
<div class="box"><b>Inference rules</b><br>
<b>Modus Ponens</b>: from α ⇒ β and α, infer β.<br>
<b>And-Elimination</b>: from α ∧ β, infer α.<br>
<b>Unit resolution</b>: from (l<sub>1</sub> ∨ ... ∨ l<sub>k</sub>) and ¬l<sub>i</sub>, infer the clause without l<sub>i</sub>.<br>
<b>Full resolution</b>: from (A ∨ P) and (¬P ∨ B), infer (A ∨ B). Remove the complementary pair.</div>
`},
    { h: "3. First-order logic (FOL)", html: `
<p>FOL adds <b>objects, relations, functions and quantifiers</b>, so one sentence can talk about many objects.</p>
<ul>
<li><b>Constant</b>: names one object (John, Sydney, 2).</li>
<li><b>Variable</b>: x, y (bound by a quantifier).</li>
<li><b>Predicate</b>: property or relation, returns True/False. Student(John), Brother(Richard, John). Number of arguments = <b>arity</b>.</li>
<li><b>Function</b>: names an object indirectly. Father(John). A <b>term</b> names an object; a <b>sentence</b> is true or false.</li>
<li><b>∀</b> "for all", <b>∃</b> "there exists". Order matters: ∀x ∃y Loves(x,y) ≠ ∃y ∀x Loves(x,y).</li>
</ul>
<div class="tip"><b>Rule of thumb:</b> ∀ goes with <b>⇒</b>; ∃ goes with <b>∧</b>.<br>
"All students study": ∀x Student(x) ⇒ Studies(x) ✓ &nbsp;(not ∀x Student(x) ∧ Studies(x), which says everything is a student).<br>
"Some student is enrolled in AI": ∃x Student(x) ∧ Enrolled(x, AI) ✓</div>
<div class="formula">Quantifier De Morgan: ∀x ¬P(x) ≡ ¬∃x P(x) &nbsp;&nbsp; ∃x ¬P(x) ≡ ¬∀x P(x)</div>
`},
    { h: "4. Inference problem KB ⊨ γ", html: `
<p><b class="kw">Entailment</b> α ⊨ β: in <b>every model where α is true, β is also true</b>. M(α) ⊆ M(β).</p>
<div class="svgwrap">${SVG.entail}<p class="figcap">Entailment: the KB's models sit inside the query's models.</p></div>
<p><b>KB ⊨ γ</b>: the knowledge base entails the query γ. Build the KB from the problem: only the sentences <b>relevant</b> to the query.</p>
<div class="box"><b>Wumpus world</b> (4 × 4 cave, pits cause <b>breeze</b> in adjacent rooms, Wumpus causes <b>stench</b>). Symbols: P<sub>x,y</sub> = pit in [x,y], B<sub>x,y</sub> = breeze in [x,y].<br>
R1: ¬P<sub>1,1</sub><br>R2: B<sub>1,1</sub> ⇔ (P<sub>1,2</sub> ∨ P<sub>2,1</sub>)<br>R3: B<sub>2,1</sub> ⇔ (P<sub>1,1</sub> ∨ P<sub>2,2</sub> ∨ P<sub>3,1</sub>)<br>R4: ¬B<sub>1,1</sub> (no breeze felt in [1,1])<br>R5: B<sub>2,1</sub><br>
Query: <b>KB ⊨ ¬P<sub>1,2</sub></b>? (Is [1,2] pit-free?)</div>
<div class="svgwrap">${SVG.wumpus}<p class="figcap">The Wumpus world facts used in every proof below.</p></div>
<p><b>Deductive</b> reasoning: general rule → certain conclusion. <b>Inductive</b>: patterns → probable conclusion.</p>
`},
    { h: "5. Method 1: Model checking", html: `
<ol><li>List all symbols in KB and query.</li><li>Generate <b>all models</b> (2<sup>n</sup> truth assignments).</li><li>Keep the models where <b>KB is true</b>.</li><li>Check γ in each kept model. If γ is true in all of them → KB ⊨ γ. If any KB-true model makes γ false → not entailed.</li></ol>
<div class="example">Wumpus: 7 symbols → 2<sup>7</sup> = <b>128 models</b>. KB is true in <b>3</b> models. ¬P<sub>1,2</sub> is true in all 3 → KB ⊨ ¬P<sub>1,2</sub>.<br>
Simple: KB = P ∧ (P ⇒ Q). 4 models, only P=T, Q=T makes KB true, Q is true there → KB ⊨ Q.</div>
<p>Sound and complete, but exponential in the number of symbols.</p>
`},
    { h: "6. Method 2: Theorem proving", html: `
<p>Apply <b>inference rules</b> and <b>equivalences</b> step by step to derive γ. No enumeration of models.</p>
<div class="example"><b>Proof of ¬P<sub>1,2</sub></b><br>
1. R2 + biconditional elimination: (B<sub>1,1</sub> ⇒ (P<sub>1,2</sub> ∨ P<sub>2,1</sub>)) ∧ ((P<sub>1,2</sub> ∨ P<sub>2,1</sub>) ⇒ B<sub>1,1</sub>)<br>
2. And-elimination: (P<sub>1,2</sub> ∨ P<sub>2,1</sub>) ⇒ B<sub>1,1</sub><br>
3. Contraposition: ¬B<sub>1,1</sub> ⇒ ¬(P<sub>1,2</sub> ∨ P<sub>2,1</sub>)<br>
4. Modus Ponens with R4 (¬B<sub>1,1</sub>): ¬(P<sub>1,2</sub> ∨ P<sub>2,1</sub>)<br>
5. De Morgan: ¬P<sub>1,2</sub> ∧ ¬P<sub>2,1</sub><br>
6. And-elimination: <b>¬P<sub>1,2</sub></b> ✓</div>
`},
    { h: "7. Method 3: Proof by contradiction with resolution", html: `
<div class="box"><b>Idea</b>: KB ⊨ γ if and only if <b>KB ∧ ¬γ is unsatisfiable</b>.
<ol><li>Choose only the <b>relevant</b> sentences as the KB in use.</li><li>Start from the target: add the <b>negated query</b> ¬γ.</li><li>Convert everything to <b>CNF</b> (conjunction of clauses).</li><li>Resolve complementary literals repeatedly. If you derive the <b>empty clause □</b> → contradiction → KB ⊨ γ.</li></ol></div>
<div class="formula"><b>CNF conversion</b><br>1. Eliminate ⇔: α ⇔ β → (α ⇒ β) ∧ (β ⇒ α)<br>2. Eliminate ⇒: α ⇒ β → ¬α ∨ β<br>3. Move ¬ inwards (De Morgan, double negation)<br>4. Distribute ∨ over ∧</div>
<div class="example"><b>Prove ¬P<sub>1,2</sub></b>. Negated query: <b>P<sub>1,2</sub></b>.<br>
R2 in CNF: (¬B<sub>1,1</sub> ∨ P<sub>1,2</sub> ∨ P<sub>2,1</sub>) ∧ (¬P<sub>1,2</sub> ∨ B<sub>1,1</sub>) ∧ (¬P<sub>2,1</sub> ∨ B<sub>1,1</sub>)<br>
Resolve P<sub>1,2</sub> with (¬P<sub>1,2</sub> ∨ B<sub>1,1</sub>) → <b>B<sub>1,1</sub></b><br>
Resolve B<sub>1,1</sub> with R4 ¬B<sub>1,1</sub> → <b>□ (empty clause)</b><br>
Contradiction, so KB ⊨ ¬P<sub>1,2</sub>.</div>
<div class="svgwrap">${SVG.resolution}<p class="figcap">Resolution tree for KB ⊨ ¬P₁,₂. Reaching □ proves it.</p></div>
<div class="example">Simple: KB = P, P ⇒ Q. Query Q. Clauses: P, ¬P ∨ Q, ¬Q. Resolve ¬P ∨ Q with ¬Q → ¬P. Resolve with P → □.</div>
<div class="analogy"><b>Analogy:</b> a detective says "suppose the butler is innocent", then shows this leads to an impossible situation. So the butler must be guilty.</div>
`},
    { h: "8. Inference in FOL", html: `
<ul>
<li><b class="kw">Universal Instantiation (UI)</b>: ∀v α → substitute <b>any ground term</b>. ∀x Student(x) ⇒ Studies(x) gives Student(Mia) ⇒ Studies(Mia). Can be used many times.</li>
<li><b class="kw">Existential Instantiation (EI)</b>: ∃v α → substitute a <b>new constant</b> (Skolem constant) not used anywhere else, e.g. Student(k) ∧ Enrolled(k). Applied once.</li>
<li><b class="kw">Propositionalisation</b>: remove quantifiers by instantiation, treat ground atoms as propositions, then use propositional methods. Can create very many instances.</li>
</ul>`}
  ]
});

window.TOPICS.push({
  id: "l11", num: 11, title: "Bayesian Networks",
  sub: "Probability rules, full joint table, Bayes rule, BN inference by enumeration",
  sections: [
    { h: "1. Why probability?", html: `
<p>Agents face <b>uncertainty</b>: <b>partially observable</b> environments (e.g. noisy GPS, hidden disease) and/or <b>non-deterministic</b> ones (same action, different outcomes, e.g. stock trading). Knowledge gives a <b>degree of belief</b> between 0 (certainly false) and 1 (certainly true).</p>
<p><b class="kw">Prior</b> probability: belief before evidence. <b class="kw">Posterior</b>: updated belief after evidence.</p>`},
    { h: "2. Key probability formulas", html: `
<div class="formula">
Complement (NOT): P(¬A) = 1 - P(A)<br>
Addition (OR): P(A ∨ B) = P(A) + P(B) - P(A ∧ B) &nbsp; (just add if mutually exclusive)<br>
Multiplication (AND, independent): P(A ∧ B) = P(A) × P(B)<br>
<b>Conditional</b> (GIVEN): P(A | B) = P(A ∧ B) / P(B)<br>
<b>Product rule</b>: P(A ∧ B) = P(A | B) P(B)<br>
<b>Bayes' rule</b>: P(B | A) = P(A | B) P(B) / P(A) &nbsp; (posterior = likelihood × prior / evidence)<br>
<b>Normalisation</b>: P(X | e) = α P(X, e), &nbsp; α = 1 / Σ<sub>x</sub> P(x, e)<br>
<b>Marginalisation</b>: P(X) = Σ<sub>y</sub> P(X, y)<br>
<b>Conditional independence</b>: P(X, Y | Z) = P(X | Z) P(Y | Z)
</div>
<div class="svgwrap">${SVG.condVenn}<p class="figcap">Conditional probability: B becomes the whole world.</p></div>
<div class="example"><b>Bayes</b>: disease rate 1%, test detects 90% of sick (P(+|D) = 0.9), false positive 5% (P(+|¬D) = 0.05).<br>
P(+) = 0.9 × 0.01 + 0.05 × 0.99 = 0.009 + 0.0495 = 0.0585.<br>
P(D | +) = 0.009 / 0.0585 = <b>0.154</b>. (Only 15%, because the disease is rare!)</div>
<p><b>Causal direction</b>: P(effect | cause), e.g. P(symptom | disease). <b>Diagnostic direction</b>: P(cause | effect), what we usually want; Bayes' rule converts causal to diagnostic.</p>
`},
    { h: "3. Full joint probability table", html: `
<p>Lists a probability for <b>every complete assignment</b> of all variables. Burglary case: 5 binary variables (B, E, A, J, M) → 2<sup>5</sup> = <b>32 rows</b>, sum = 1. Can be estimated from experiments: P(event) = occurrences / total experiments.</p>
<div class="box"><b>Answering a query with the table</b>
<ol><li><b>Filter</b>: keep rows matching the evidence.</li><li><b>Group</b>: by value of the query variable.</li><li><b>Sum</b> over the hidden variables (marginalise).</li><li><b>Normalise</b>: divide each by the total.</li></ol></div>
<div class="example">P(X = x<sub>1</sub>) = sum of all rows with X = x<sub>1</sub> = 0.06 + 0.09 + 0.14 + 0.11 = <b>0.40</b>.</div>
<p class="warn">Problem: the table <b>doubles</b> with each binary variable (20 variables → 1,048,576 rows). Hard to store and specify. → Use a Bayesian network.</p>
`},
    { h: "4. Bayesian network", html: `
<div class="svgwrap">${SVG.bn}</div>
<ul>
<li>A <b>directed acyclic graph</b>. <b>Node</b> = random variable. <b>Arrow</b> X → Y: X is a <b>parent</b> of Y (direct influence).</li>
<li>Each node has a <b class="kw">CPT</b>: P(Y | Parents(Y)). A node with no parents has a prior P(Y).</li>
<li>Each node is <b>conditionally independent of its non-descendants given its parents</b>.</li>
</ul>
<div class="formula"><b>Chain rule for BN</b>: P(x<sub>1</sub>, ..., x<sub>n</sub>) = Π<sub>i</sub> P(x<sub>i</sub> | parents(X<sub>i</sub>))<br>
Burglary: P(B, E, A, J, M) = P(B) P(E) P(A | B, E) P(J | A) P(M | A)</div>
<div class="example">P(j, m, a, ¬b, ¬e) = P(j|a) P(m|a) P(a|¬b,¬e) P(¬b) P(¬e) = 0.90 × 0.70 × 0.001 × 0.999 × 0.998 ≈ <b>0.000628</b></div>
<p><b>Construct a BN</b>: choose variables → order them (<b>causes before effects</b> gives a compact net) → for each node choose a minimal set of parents so P(X<sub>i</sub> | X<sub>i-1</sub>..X<sub>1</sub>) = P(X<sub>i</sub> | Parents(X<sub>i</sub>)).</p>
`},
    { h: "5. Exact inference by enumeration", html: `
<p>Variables: <b>query</b> X, <b>evidence</b> E = e (observed), <b>hidden</b> Y (everything else).</p>
<div class="formula">P(X | e) = α Σ<sub>y</sub> P(X, e, y)</div>
<div class="example"><b>P(B | j, m)</b>, hidden E and A.<br>
s<sub>B</sub> = P(b) Σ<sub>e</sub> P(e) Σ<sub>a</sub> P(a|b,e) P(j|a) P(m|a)<br>
= 0.001 × {0.002 [0.95·0.90·0.70 + 0.05·0.05·0.01] + 0.998 [0.94·0.90·0.70 + 0.06·0.05·0.01]} ≈ 0.000592<br>
s<sub>¬B</sub> = 0.999 × {0.002 [0.29·0.90·0.70 + 0.71·0.05·0.01] + 0.998 [0.001·0.90·0.70 + 0.999·0.05·0.01]} ≈ 0.001492<br>
P(B | j, m) = 0.000592 / (0.000592 + 0.001492) ≈ <b>0.284</b></div>
<div class="svgwrap">${SVG.enumTree}<p class="figcap">Enumeration tree for P(b, j, m): sum over hidden E and A.</p></div>
<table class="tbl"><tr><th>CPT</th><th>Values</th></tr>
<tr><td>P(B)</td><td>0.001</td></tr><tr><td>P(E)</td><td>0.002</td></tr>
<tr><td>P(A | B, E)</td><td>t,t: 0.95 &nbsp; t,f: 0.94 &nbsp; f,t: 0.29 &nbsp; f,f: 0.001</td></tr>
<tr><td>P(J | A)</td><td>a: 0.90 &nbsp; ¬a: 0.05</td></tr>
<tr><td>P(M | A)</td><td>a: 0.70 &nbsp; ¬a: 0.01</td></tr></table>
<div class="widget" data-widget="bn"></div>
<p>Enumeration is exact but <b>repeats calculations</b> (e.g. P(j|a)P(m|a) several times) and does not scale. Better exact: <b>variable elimination</b>. Big networks: <b>approximate inference</b> (direct sampling, rejection sampling, likelihood weighting, MCMC). Focus: exact inference in <b>static</b> worlds.</p>
<div class="analogy"><b>Analogy:</b> a BN is a family tree of causes. Instead of memorising every family photo (full joint table), you remember how each child resembles its parents (CPTs).</div>
`}
  ]
});

window.TOPICS.push({
  id: "l12", num: 12, title: "Hierarchical Knowledge",
  sub: "Semantic networks, ontologies, knowledge graphs, category reasoning",
  sections: [
    { h: "1. Structural knowledge and hierarchies", html: `
<p><b class="kw">Structural knowledge</b> = how concepts and objects relate. A <b>hierarchy</b> arranges knowledge from broad to specific (Entity → Living thing → Animal → ...).</p>
<div class="box"><b>Seven principles of a good classification</b>
<ul>
<li><b>Hierarchy</b>: one relation type between levels, the <b>is-a</b> relation.</li>
<li><b>Coverage / inclusiveness</b>: the top class includes all subclasses.</li>
<li><b>Necessary and sufficient criteria</b>: rules for membership.</li>
<li><b>Species / differentia</b>: consistent rules to associate and distinguish.</li>
<li><b>Mutual exclusivity</b>: siblings do not overlap.</li>
<li><b class="kw">Inheritance</b>: lower categories inherit properties of higher ones.</li>
<li><b class="kw">Transitivity</b>: A is-a B and B is-a C → A is-a C.</li>
</ul></div>
<p>Works best in <b>mature, well-understood domains</b> with <b>clear class boundaries</b>. Supports inference from incomplete evidence.</p>
<div class="formula">Membership: Basketball<sub>1</sub> ∈ Basketballs (object in category)<br>Subset: Basketballs ⊆ SportsBalls (sub-category, inherits properties)</div>
`},
    { h: "2. Semantic network", html: `
<p>A graph: <b>nodes</b> = concepts (categories) or objects; <b>labelled links</b> = relations. Represents <b>objects, categories of objects, and relations</b>.</p>
<div class="svgwrap">${SVG.semnet}</div>
<ul>
<li><b>SubsetOf</b> (subclass of): category → category. <b>MemberOf</b> (instance of): object → category.</li>
<li>Other relations: SisterOf, HasMother, hasPart, hasColour; property values like Legs = 2.</li>
</ul>
<div class="box"><b>Reasoning by inheritance</b>: start at the object, follow MemberOf and SubsetOf links <b>upwards</b> until you find the property. A <b>more specific value overrides</b> the general one (exception).<br>
• Tweety (Canary) → Bird → Animal: Tweety is an Animal, has Wings, can fly.<br>
• Pingu (Penguin): Penguin "cannot fly" overrides Bird "can fly".<br>
• Mary ∈ FemalePersons ⊆ Persons → Mary is a Person, has 2 legs (inherited). John has an explicit Legs = 1, which overrides 2.<br>
• HasMother links Persons to FemalePersons → Mary's mother is in FemalePersons.</div>
`},
    { h: "3. Ontology", html: `
<p>A <b class="kw">formal, explicit specification</b> of a domain: shared <b>concepts (classes)</b>, <b>properties / relations</b>, <b>individuals</b> and logical <b>axioms</b> (rules).</p>
<table class="tbl">
<tr><td>Classes and hierarchy</td><td>Student subclassOf Person</td></tr>
<tr><td>Properties</td><td>Student enrolledIn Course; Student age 21</td></tr>
<tr><td>Individuals</td><td>Alice instanceOf Student</td></tr>
<tr><td>Axioms</td><td>Every Student is a Person. enrolsIn(x, y) requires Student(x) and Course(y) (<b>domain</b> and <b>range</b>)</td></tr>
</table>
<div class="svgwrap">${SVG.ontology}<p class="figcap">Classes (top), individuals (green), properties (arrows) and an inferred fact.</p></div>
<div class="box"><b>Reasoning with an ontology</b> (a reasoner applies axioms to facts):
<ul>
<li><b>Infer class membership</b>: Student ⊑ Person and Student(Alice) → Person(Alice).</li>
<li><b>Infer properties (property chain)</b>: enrolsIn(Alice, DataAnalytics) ∧ includes(DataAnalytics, AIFoundations) ∧ ownedBy(AIFoundations, SchoolOfCS) → studiesInDepartment(Alice, SchoolOfCS).</li>
<li><b>Check rule compliance</b>: enrolsIn(CB11.07, ...) rejected, a Room is not a Student (domain violated).</li>
<li><b>Validate consistency</b>: scheduledIn(DataAnalytics, SchoolOfCS) inconsistent, range must be a Room.</li>
</ul></div>
<p>Purpose: shared vocabulary, knowledge reuse, data integration, automated reasoning.</p>
`},
    { h: "4. Knowledge graph", html: `
<p>Real-world <b>entities</b> as nodes and <b>relationships</b> as labelled edges, storing <b>facts</b>. Often organised by an ontology (schema).</p>
<div class="formula">Fact = <b>triple</b> (subject, predicate, object): (Student, enrolledIn, Course), (Douglas Adams, place of birth, Cambridge)</div>
<div class="svgwrap">${SVG.kg}<p class="figcap">Every edge is one (subject, predicate, object) triple.</p></div>
<p>Example: <b>Wikidata</b>. Each item has an ID (Douglas Adams = Q42). Stored as <b>RDF</b> triples, queried with <b>SPARQL</b>.</p>
<div class="example">SELECT ?item ?itemLabel ?pic WHERE { ?item wdt:P31 wd:Q146 . ?item wdt:P18 ?pic . }<br>
= find items that are an <b>instance of</b> (P31) <b>cat</b> (Q146) and have an <b>image</b> (P18). ?x = variable. Items without an image are not returned.</div>
<table class="tbl"><tr><th>Semantic network</th><th>Ontology</th><th>Knowledge graph</th></tr>
<tr><td>Informal graph of concepts and relations; inheritance reasoning</td><td>Formal model: classes, properties, axioms; reasoner checks and infers</td><td>Large graph of actual entities and facts (triples); queried (SPARQL)</td></tr></table>
`},
    { h: "5. Reasoning with categories", html: `
<div class="box"><b>Perceive → Classify → Predict</b><br>
Observe properties (green mottled skin, oval, red flesh, black seeds, in fruit aisle) → infer category <b>Watermelon</b> → predict "good for fruit salad".</div>
<p>Category membership lets the agent infer properties it has not directly observed.</p>
<div class="analogy"><b>Analogy:</b> once you know a new animal is a "bird", you already expect feathers, wings and eggs, without checking each one. Unless it is a penguin (exception)!</div>
`}
  ]
});
