(function () {
  const { title, h, list, fx, card, flow, cols, split, tbl, at, stg, act, fix, say, tag, zone, dot, J } = VK;

  // ---- semantic network / ontology / graph builder ----
  // nodes: id -> [x, y, label, k, cls, on]   edges: [a, b, label, k, on, cls, bend, lx, ly]
  const plain = (s) => s.replace(/<[^>]+>/g, "");
  const RX = (lab) => Math.max(30, plain(lab).length * 4.7 + 16), RY = 17;
  const snet = (w, hh, nodes, edges, extra = "", cls = "") => {
    const E = edges.map(([a, b, lab = "", k = 0, on = "", ecls = "", bend = 0, lx = 0, ly = 0]) => {
      const [x1, y1, l1] = nodes[a], [x2, y2, l2] = nodes[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
      const t1 = 1 / Math.hypot(dx / RX(l1), dy / RY), t2 = 1 / Math.hypot(dx / RX(l2), dy / RY);
      const sx = x1 + dx * t1, sy = y1 + dy * t1, ex = x2 - dx * t2 - dx / L * 2, ey = y2 - dy * t2 - dy / L * 2;
      const nx = -dy / L, ny = dx / L, mx = (sx + ex) / 2, my = (sy + ey) / 2;
      const line = bend ? `<path d="M${sx},${sy} Q${mx + nx * bend * 2},${my + ny * bend * 2} ${ex},${ey}" marker-end="url(#snah)"/>` : `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" marker-end="url(#snah)"/>`;
      const tx = mx + nx * bend + lx, ty = my + ny * bend + ly + 4;
      return `<g class="vk-i se ${ecls}" data-s="${k}" ${on ? `data-on="${on}"` : ""}>${line}${lab ? `<text class="el" x="${tx}" y="${ty}">${lab}</text>` : ""}</g>`;
    }).join("");
    const N = Object.entries(nodes).map(([id, [x, y, lab, k = 0, ncls = "", on = ""]]) => `<g class="vk-i sn ${ncls}" data-s="${k}" ${on ? `data-on="${on}"` : ""}><ellipse cx="${x}" cy="${y}" rx="${RX(lab)}" ry="${RY}"/><text x="${x}" y="${y + 5}">${lab}</text></g>`).join("");
    return `<svg class="snv ${cls}" viewBox="0 0 ${w} ${hh}"><defs><marker id="snah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>${E}${N}${extra}</svg>`;
  };
  const stx = (k, x, y, t, cls = "inft", xk) => `<text class="vk-i ${cls}" data-s="${k}" ${xk != null ? `data-x="${xk}"` : ""} x="${x}" y="${y}">${t}</text>`;

  // ---- the bird network (slide 11) ----
  const BN = { An: [300, 28, "Animal"], Bi: [300, 108, "Bird"], Fl: [500, 108, "Fly"], Wi: [110, 108, "Wings"], Ca: [190, 192, "Canary"], Pe: [420, 192, "Penguin"], Ye: [50, 192, "Yellow"], Tw: [190, 272, "Tweety", 0, "obj"], Pi: [420, 272, "Pingu", 0, "obj"] };
  const BE = [["Bi", "An", "subclass of"], ["Bi", "Fl", "can"], ["Bi", "Wi", "has part"], ["Ca", "Bi", "subclass of"], ["Pe", "Bi", "subclass of"], ["Pe", "Fl", "cannot", 0, "", "bad"], ["Ca", "Ye", "has colour", 0, "", "", 0, 0, -12], ["Tw", "Ca", "member of"], ["Pi", "Pe", "member of"]];
  const birds = (nodeK = {}, nodeOn = {}, edgeK = {}, edgeOn = {}, extra = "") => {
    const n = {}; Object.entries(BN).forEach(([id, v]) => { n[id] = [v[0], v[1], v[2], nodeK[id] ?? 0, v[4] || "", nodeOn[id] || ""]; });
    const e = BE.map(([a, b, l, k, on, c, bend, lx, ly]) => [a, b, l, edgeK[a + b] ?? 0, edgeOn[a + b] || "", c || "", bend || 0, lx || 0, ly || 0]);
    return snet(600, 295, n, e, extra);
  };

  // ---- the persons network (slide 12) ----
  const PN = { Ma: [300, 28, "Mammals"], Pe: [300, 110, "Persons"], Fe: [160, 195, "Female Persons"], Mp: [440, 195, "Male Persons"], Mr: [160, 275, "Mary", 0, "obj"], Jo: [440, 275, "John", 0, "obj"], L2: [520, 110, "2", 0, "val"], L1: [565, 230, "1", 0, "val"] };
  const PE = [["Pe", "Ma", "SubsetOf"], ["Fe", "Pe", "SubsetOf"], ["Mp", "Pe", "SubsetOf"], ["Mr", "Fe", "MemberOf"], ["Jo", "Mp", "MemberOf"], ["Mr", "Jo", "SisterOf"], ["Pe", "Fe", "HasMother", 0, "", "rel", -40, -14, 0], ["Pe", "L2", "Legs"], ["Jo", "L1", "Legs"]];
  const persons = (nodeK = {}, nodeOn = {}, edgeK = {}, edgeOn = {}, extra = "") => {
    const n = {}; Object.entries(PN).forEach(([id, v]) => { n[id] = [v[0], v[1], v[2], nodeK[id] ?? 0, v[4] || "", nodeOn[id] || ""]; });
    const e = PE.map(([a, b, l, k, on, c, bend, lx, ly]) => [a, b, l, edgeK[a + b] ?? 0, edgeOn[a + b] || "", c || "", bend || 0, lx || 0, ly || 0]);
    return snet(600, 295, n, e, extra);
  };

  // ---- association check cards with a stamp ----
  const chk = (k, s, p, o, verdict, cls, why) => `<div class="pz akc vk-i" data-s="${k}"><div class="ckt"><span class="tg">${s}</span><i>${p}</i><span class="tg">${o}</span></div><div class="pzf">${why}</div><div class="stamp ${cls}">${verdict}</div></div>`;

  // ---- SPARQL code lines ----
  const code = (lines) => `<div class="vk-fx code spq">${lines.map(([t, on]) => `<div class="sl" ${on ? `data-on="${on}"` : ""}>${t}</div>`).join("")}</div>`;
  const cand = (name, info, on) => `<div class="cnd" ${on ? `data-on="${on}"` : ""}><b>${name}</b><small>${info}</small></div>`;

  VIDEO_LESSONS.l12 = {
    title: "L12: Knowledge Representation", chapters: [
      { t: "Structural knowledge", sec: [0], scenes: [
        { v: title("Hierarchical Knowledge and Reasoning", "Week 12 lesson") + list([[1, "<b>Hierarchies</b>: organising knowledge from broad to specific"], [2, "<b>Semantic networks</b> and <b>ontologies</b>: graphs of concepts with rules"], [3, "<b>Knowledge graphs</b> and querying them with <b>SPARQL</b>"], [4, "<b>Reasoning with categories</b>: inheritance, exceptions, inferred facts"]]),
          n: ["Welcome to week 12: hierarchical knowledge representation and reasoning. Last week was about uncertainty. This week is about structure: how concepts and objects relate to each other, and how an agent can reason over those relationships.",
            "We'll start with hierarchies, which organise knowledge from broad categories down to specific ones, and the principles that make a classification good.",
            "Then two ways to write that structure down: semantic networks, and the more formal ontologies.",
            "Then knowledge graphs, which store huge numbers of real-world facts, and how to query one with a language called SPARQL.",
            "And throughout, reasoning: how an agent uses categories to infer facts nobody told it directly, and how exceptions override general rules."] },
        { v: h("Structural knowledge: <b>broad → specific</b>") + snet(600, 215, { En: [300, 25, "Entity"], Li: [170, 105, "Living thing", 1], Ph: [430, 105, "Physical object", 1], An: [80, 190, "Animal", 2], Pl: [220, 190, "Plant", 2], Ve: [380, 190, "Vehicle", 3], Bu: [520, 190, "Building", 3] }, [["Li", "En", "", 1], ["Ph", "En", "", 1], ["An", "Li", "", 2], ["Pl", "Li", "", 2], ["Ve", "Ph", "", 3], ["Bu", "Ph", "", 3]], "", "tree") + cols(card(4, "ana", "Like a <b>supermarket</b>: Food → Fruit → Apples. You find things by going from aisle to shelf."), card(5, "", "<b>Semantic network</b>: nodes = concepts, edges = relations."), card(5, "", "<b>Ontology</b>: a <b>formal</b> spec of concepts, relations, properties and <b>rules</b>.")),
          n: ["Structural knowledge describes how concepts and objects in the world relate to each other. The hierarchical approach arranges it as a classification, from broad categories down to specific ones. At the top: Entity, everything.",
            "Entity splits into living things and physical objects.",
            "Living things split into animals and plants.",
            "Physical objects split into vehicles and buildings. And each of these could keep splitting further.",
            "Think of a supermarket. Food, then fruit, then apples. You find what you want by moving from broad to specific, and the layout tells you how things relate. The hierarchy makes relationships visible, and that supports structured reasoning.",
            "Two common ways to represent this. A semantic network, where nodes are concepts and edges are relations. And an ontology, a formal specification of the concepts, relationships, properties and rules for a particular domain."] },
        { v: h("Seven principles of a good hierarchy (1 to 4)") + split(snet(520, 250, { An: [260, 30, "Animal", 0, "", "3:hot"], Mm: [140, 120, "Mammal", 0, "", "3:hot"], Bd: [380, 120, "Bird"], Dg: [70, 210, "Dog", 0, "", "3:hot"], Ct: [210, 210, "Cat"], Cn: [380, 210, "Canary"] }, [["Mm", "An", "is-a", 0, "1:hot"], ["Bd", "An", "is-a", 0, "1:hot"], ["Dg", "Mm", "is-a", 0, "1:hot"], ["Ct", "Mm", "is-a", 0, "1:hot"], ["Cn", "Bd", "is-a", 0, "1:hot"], ["Dg", "An", "is-a (inferred)", 4, "", "inf", 60, -28, -10]], `<rect class="vk-i hull" data-s="2" x="6" y="6" width="508" height="236" rx="16"/>${stx(3, 330, 34, "breathes, eats", "prop")}${dot({ 0: [330, 4, 0], 3: [260, 4, 1], 4: [70, 184, 1] }, "hot pin", 6)}`), list([[1, "<b>Hierarchy / species</b>: only one link type between levels, <b>is-a</b>"], [2, "<b>Inclusiveness</b> (coverage): the top class includes <b>all</b> its sub-classes"], [3, "<b>Inheritance</b>: lower categories <b>inherit</b> properties of higher ones"], [4, "<b>Transitivity</b>: Dog is-a Mammal, Mammal is-a Animal ⇒ Dog is-a Animal"]], "tight")),
          n: ["The lecture lists seven principles for a classification that is complete, clear and logically consistent. Here are the first four, on a small animal hierarchy.",
            "One: hierarchy, also called species or differentia. There's only one type of relationship between a super-class and its sub-classes: the is-a relationship. A dog is a mammal. A canary is a bird. No other link types sneak in between levels.",
            "Two: inclusiveness, or coverage. The top class includes all its sub-classes and sub-sub-classes. Everything in this picture is an animal.",
            "Three: inheritance. Lower-level categories inherit the properties of their higher-level categories. If animals breathe and eat, then mammals do, and so do dogs, without anyone writing it down again.",
            "Four: transitivity. If A is a type of B, and B is a type of C, then A is also a type of C. Dog is a mammal, mammal is an animal, so dog is an animal. The dashed link was never stored. It was inferred."] },
        { v: h("Seven principles (5 to 7)") + stg(0, [
            fix(zone("Vehicles", 20, 9), 14, 42, 1), fix(zone("Red things", 20, 9), 38, 42, 1),
            act(tag("red car", "bad"), { 0: [26, 42, 0], 1: [26, 42, 1], 2: [26, 42, 1, 1, -8], 3: [26, 42, .35] }, "", ""),
            fix(tag("fits <b>both</b>!", "lbl"), 26, 78, 2),
            fix(zone("Cars", 18, 9), 64, 42, 3), fix(zone("Bikes", 18, 9), 87, 42, 3),
            act(tag("red car", "ok"), { 0: [76, 10, 0], 3: [76, 10, 1], 4: [64, 42, 1] })
          ], "16/3.3", "tall") + cols(card(2, "bad", "<b>Mutual exclusivity</b> broken: siblings overlap."), card(5, "", "<b>Necessary + sufficient</b>: square = 4 equal sides <b>and</b> 4 right angles."), card(6, "", "<b>Systematic rules</b>: the <b>same</b> rules every time.")),
          n: ["The other three principles. Five: mutual exclusivity. When each item must belong to only one category, sibling categories should not overlap. Here's a bad pair of sibling categories: vehicles, and red things.",
            "Where does a red car go?",
            "It fits both. The siblings overlap, because they were split using two different rules, one about what the thing is and one about its colour.",
            "Fix it by splitting siblings with one consistent rule, like cars and bikes.",
            "Now the red car has exactly one home.",
            "Six: necessary and sufficient criteria. Membership rules should state what must be true, and what is enough. For a square, having 4 equal sides is necessary, but not enough, since a rhombus has that too. 4 equal sides plus 4 right angles together are sufficient.",
            "Seven: systematic and predictable rules for association and distinction. The same explicit rules are used every time, so things inside a class are predictably similar, and different classes are predictably different."] },
        { v: h("When a hierarchy works best") + stg(0, [
            act(tag("feathers ✓", "ok"), { 0: [14, 18, 0], 1: [14, 18, 1], 2: [58, 50, 0, .6] }), act(tag("beak ✓", "ok"), { 0: [14, 40, 0], 1: [14, 40, 1], 2: [58, 50, 0, .6] }),
            act(tag("lays eggs ?", "ghost"), { 0: [14, 62, 0], 1: [14, 62, 1] }), act(tag("song ?", "ghost"), { 0: [14, 84, 0], 1: [14, 84, 1] }),
            fix(tag("Bird", "big hi"), 62, 50, 2), fix(tag("so it probably lays eggs too", "lbl"), 62, 78, 2)
          ], "16/3.2", "tall") + cols(card(1, "", "<b>Incomplete evidence</b>: shared traits still place it."), card(3, "", "<b>Mature domains</b>: entities and relations already known."), card(4, "", "<b>Clear boundaries</b>: criteria separate the classes.")) + fx(5, "Needs a <b>theory or model</b>: which entities, which rules, in what order", "sm"),
          n: ["When does hierarchical classification work best? The lecture gives three conditions.",
            "First, it supports inference from incomplete evidence. You glimpse an animal. You can see feathers and a beak, but you haven't seen it lay eggs, or heard it sing.",
            "The shared characteristics are enough to place it: it's a bird. And because it's a bird, you can now predict the traits you couldn't observe.",
            "Second, it fits mature, well-understood domains, where the entities and their meaningful relationships are already known and can be organised consistently. Biology's classification of living things is a good example.",
            "Third, it needs clear class boundaries. Entities should be well defined, with criteria that distinguish one class from another.",
            "In general, some theory or model is needed to guide which entities exist, the rules of association and distinction, and the order in which those rules are applied."] },
        { v: h("Categories, objects and inheritance") + stg(0, [
            fix(zone("CATEGORY: Sports balls", 62, 16, "top"), 50, 56, 1), fix(zone("Basketballs", 24, 10), 38, 54, 2),
            fix(tag("footballs", "ghost"), 72, 40, 1), fix(tag("tennis balls", "ghost"), 72, 64, 1),
            act(`<div class="ball"></div>`, { 0: [38, 0, 0], 3: [38, 52, 1] }),
            act(tag("round, used in sport", "hi"), { 0: [24, 14, 0], 4: [24, 14, 1], 5: [32, 72, 1, .85] })
          ], "16/3.1", "tall") + cols(card(3, "", "<b>Membership</b>: object in a category. &nbsp; Basketball₁ <b>∈</b> Basketballs"), card(2, "", "<b>Subset</b>: sub-category. &nbsp; Basketballs <b>⊆</b> SportsBalls")) + card(5, "tip", "Objects in the inner set are also in the <b>outer</b> set, and sub-categories <b>inherit</b> its properties."),
          n: ["Categories organise objects by shared properties. Sub-categories specialise them, and inherit their properties.",
            "Here's a category: sports balls. It contains footballs, tennis balls, and so on.",
            "Basketballs is a sub-category. Every basketball is a sports ball, so basketballs is a subset of sports balls, written with the subset symbol.",
            "Now one particular ball, basketball number 1. It's an individual object, and it's a member of the category basketballs. Membership links an object to its category, written with the element-of symbol.",
            "Sports balls have properties: they're round and used in sport.",
            "The sub-category takes on the properties of its super-category, and so does every object inside it. Objects in the inner set are also members of the outer set. Organising objects into categories like this is a vital part of structural knowledge representation."] }
      ] },
      { t: "Semantic networks", sec: [1], scenes: [
        { v: h("A semantic network") + split(birds({ An: 1, Bi: 1, Fl: 2, Wi: 2, Ca: 3, Pe: 3, Ye: 3, Tw: 4, Pi: 4 }, {}, { BiAn: 1, BiFl: 2, BiWi: 2, CaBi: 3, PeBi: 3, PeFl: 3, CaYe: 3, TwCa: 4, PiPe: 4 }), list([[0, "<b>Graph</b>: ovals = concepts or objects, arrows = <b>labelled relations</b>"], [1, "<b>subclass of</b>: category → category"], [2, "Properties: <b>can</b>, <b>has part</b>"], [4, "<b>member of</b>: object → category (green = individual)"], [5, "Used to infer an object's properties from its <b>category membership</b>"]], "tight")),
          n: ["A semantic network represents knowledge as a graph. Nodes are concepts or objects, drawn as ovals, and the arrows are labelled relationships. All the variants can represent individual objects, categories of objects, and relations among them. Categories are the primary building blocks.",
            "Bird is a subclass of Animal.",
            "Birds can fly, and birds have wings as a part.",
            "Canary and Penguin are both subclasses of Bird. Canaries have the colour yellow. And Penguin has its own link: penguins cannot fly.",
            "Tweety is a member of Canary, and Pingu is a member of Penguin. These two are individual objects, shown in green. The others are categories.",
            "The point of the network is reasoning: inferring properties of an object from the categories it belongs to."] },
        { v: h("Inheritance: what do we know about <b>Tweety</b>?") + split(birds({}, { Tw: "1:hot", Ca: "2:hot", Bi: "3:hot", An: "4:hot" }, {}, { TwCa: "1:hot", CaBi: "2:hot", BiAn: "4:hot", BiFl: "3:hot", BiWi: "3:hot", CaYe: "2:hot" }, dot({ 0: [190, 246, 0], 1: [190, 246, 1], 2: [190, 166, 1], 3: [300, 82, 1], 4: [300, 2, 1] }, "hot pin", 6)), list([[0, "Start at the <b>object</b>. Follow <b>member of</b> and <b>subclass of</b> links <b>upwards</b>"], [2, "Canary: colour <b>Yellow</b>"], [3, "Bird: <b>can Fly</b>, <b>has Wings</b>"], [4, "Animal: Tweety <b>is an Animal</b>"], [5, "Inferred: Tweety : Animal, Tweety : CanFly, (Tweety, Wings) : hasPart"]], "tight")),
          n: ["Reasoning by inheritance. Start at the object, then follow member-of and subclass-of links upwards until you find the property you want. Nobody told us anything directly about Tweety except one link. Let's see how much we can infer.",
            "Start at Tweety.",
            "Tweety is a member of Canary. Canaries are yellow, so Tweety is yellow.",
            "Canary is a subclass of Bird. Birds can fly and have wings. So Tweety can fly, and Tweety has wings.",
            "Bird is a subclass of Animal. So Tweety is an animal, because Canary leads to Bird, which leads to Animal.",
            "Written as facts: Tweety is an Animal, Tweety can fly, and Tweety has wings as a part. Three facts that were never stored, all inferred by following links."] },
        { v: h("Exceptions: <b>Pingu</b> the penguin") + split(birds({}, { Pi: "1:hot", Pe: "2:hot", Bi: "3:hot" }, {}, { PiPe: "1:hot", PeFl: "2:hot", PeBi: "3:hot", BiFl: "3:dim" }, dot({ 0: [420, 246, 0], 1: [420, 246, 1], 2: [420, 166, 1], 3: [300, 82, 1] }, "hot pin", 6) + stx(3, 400, 85, "can Fly: overridden", "bad")), list([[1, "Pingu → <b>Penguin</b>"], [2, "Penguin: <b>cannot Fly</b>. Found first, so use it"], [3, "Bird's <b>can Fly</b> is overridden. Wings, Animal still inherited"], [4, "<b>More specific wins</b>. Pingu : ¬CanFly"]], "tight") + card(4, "ana", "School allows sneakers, the <b>chem lab</b> says closed shoes. In the lab, the lab rule wins.")),
          n: ["Inheritance has to handle exceptions. Take Pingu.",
            "Start at Pingu, and go up to Penguin.",
            "Penguin has its own fact: penguins cannot fly. We searched upwards and found a value for flying first, at the most specific level. So we use it.",
            "Bird says birds can fly, but that general property is overridden. Pingu still inherits everything that isn't contradicted: Pingu has wings, and Pingu is an animal.",
            "The rule: a more specific value takes precedence over a general one. So Pingu does not fly. It's like school rules. The school may allow sneakers, but the chemistry lab requires closed shoes. In the lab, the more specific rule wins."] },
        { v: h("Another network: people") + split(persons({ Ma: 1, Pe: 1, Fe: 2, Mp: 2, Mr: 3, Jo: 3, L2: 5, L1: 5 }, {}, { PeMa: 1, FePe: 2, MpPe: 2, MrFe: 3, JoMp: 3, MrJo: 4, PeFe: 4, PeL2: 5, JoL1: 5 }), list([[1, "<b>SubsetOf</b>: Persons ⊆ Mammals"], [2, "Female Persons, Male Persons ⊆ Persons"], [3, "<b>MemberOf</b>: Mary ∈ Female Persons, John ∈ Male Persons"], [4, "<b>SisterOf</b>: Mary → John. <b>HasMother</b>: a Person's mother is in Female Persons"], [5, "Property values: Persons Legs = <b>2</b>. John has an explicit Legs = <b>1</b>"]], "tight")),
          n: ["Here's the second network from the lecture, about people. We'll build it in four layers: the category hierarchy, membership, other relationships, and property values.", "The category hierarchy first. Persons is a subset of Mammals.",
            "Female Persons and Male Persons are both subsets of Persons.",
            "Category membership. Mary is a member of Female Persons, and John is a member of Male Persons.",
            "Other relationships. Mary is the sister of John. And HasMother links Persons to Female Persons. It's a rule about the whole category: every person's mother is a member of Female Persons.",
            "And property values. Persons have 2 legs. But John has his own, explicit value: 1 leg."] },
        { v: h("Answering questions with the network") + split(persons({}, { Mr: "1:hot", Fe: "2:hot 6:", Pe: "3:hot 6:" }, {}, { MrFe: "2:hot 6:", FePe: "3:hot 6:", PeL2: "3:hot 6:", PeFe: "5:hot 6:", JoL1: "6:hot" }, dot({ 0: [160, 249, 0], 1: [160, 249, 1], 2: [160, 169, 1], 3: [300, 84, 1], 6: [440, 249, 1] }, "hot pin", 6)), fx(0, say({ 0: "Q1: How many legs does Mary have?", 4: "Q2: Is Mary a Person?", 5: "Q3: Susan is Mary's mother. Is Susan in Female Persons?", 6: "Q4: How many legs does John have?" }), "sm") + list([[3, "Q1: <b>2</b>, inherited from Persons via Female Persons. No exception for Mary"], [4, "Q2: <b>Yes</b>. Mary ∈ Female Persons ⊆ Persons"], [5, "Q3: <b>Yes</b>. Mary is a Person, and HasMother says a Person's mother ∈ Female Persons"], [6, "Q4: <b>1</b>. John's explicit value <b>overrides</b> the inherited 2"]], "tight")),
          n: ["Now let's use the network to answer questions. Question 1: how many legs does Mary have?",
            "Start at Mary. Nothing about legs is stored on Mary herself.",
            "Go up the member-of link to Female Persons. Still nothing about legs.",
            "Go up to Persons. Persons have 2 legs. So Mary has 2 legs, by default, inherited through Female Persons, and there's no exception for Mary.",
            "Question 2: is Mary a person? Yes. Mary is a member of Female Persons, and Female Persons is a subset of Persons.",
            "Question 3: if Susan is Mary's mother, is Susan a member of Female Persons? Yes. Mary is a person, and the HasMother link says that a person's mother belongs to Female Persons.",
            "Question 4: how many legs does John have? John has an explicit value, 1. It's more specific than the inherited 2, so it overrides it. John has 1 leg."] }
      ] },
      { t: "Ontologies", sec: [2], scenes: [
        { v: h("Ontology: a <b>formal</b> model of a domain") + rtabs() + cols(card(5, "ana", "An ontology is the <b>rulebook and dictionary</b> of a board game. A knowledge graph is the <b>record of actual games</b> played."), card(6, "", "<b>Purpose</b>: shared vocabulary, knowledge reuse, data integration, <b>automated reasoning</b>.")),
          n: ["An ontology is a formal, explicit model of a domain. It defines shared concepts, their properties and relationships, and logical axioms. It has four building blocks.",
            "Classes and their hierarchy. Student is a subclass of Person.",
            "Properties, which relate a class to another class or to a value. A student is enrolled in a course. A student has an age, like 21.",
            "Individuals, the actual instances. Alice is an instance of Student.",
            "And axioms, the logical rules. Every student is a person. And the property enrols-in needs a student on the left and a course on the right. Those are called the domain and the range of the property.",
            "Here's an analogy. An ontology is like the rulebook and dictionary of a board game: what pieces exist and what moves are legal. A knowledge graph, which we'll see next, is like the record of actual games played.",
            "Why build one? An ontology gives people and systems a shared vocabulary. It supports knowledge reuse and data integration, so different databases can be joined. And it enables automated reasoning, to infer new facts and check logical consistency."] },
        { v: h("A university ontology") + snet(640, 320, { Un: [320, 28, "University", 1], Pe: [90, 110, "Person", 1], Co: [250, 110, "Course", 1], De: [470, 110, "Department", 1], Ro: [590, 110, "Room", 1], St: [45, 205, "Student", 2], Ac: [165, 205, "Academic", 2], Su: [390, 205, "Subject", 2], Da: [250, 292, "Data Analytics", 4, "obj"], Sc: [470, 292, "School of CS", 4, "obj"], Cb: [595, 292, "CB11.07", 4, "obj"] },
          [["Un", "Pe", "has member", 1, "", "", 0, -14, -2], ["Un", "Co", "offers", 1, "", "", 0, -10, 0], ["Un", "De", "has unit", 1, "", "", 0, 12, 0], ["Un", "Ro", "has facility", 1, "", "", 0, 24, -6], ["St", "Pe", "subclass of", 2, "", "", 0, -26, 0], ["Ac", "Pe", "subclass of", 2, "", "", 0, 30, 0], ["Co", "Su", "includes", 3, "", "rel"], ["St", "Co", "enrols in", 3, "", "rel", 0, 14, 10], ["Ac", "Su", "teaches", 3, "", "rel", 0, 0, -6], ["Su", "De", "owned by", 3, "", "rel", 0, 18, 6], ["Su", "Ro", "scheduled in", 3, "", "rel", 0, 10, 14], ["Da", "Co", "example", 4, "", "inf", 0, 26, 0], ["Sc", "De", "example", 4, "", "inf", 0, 26, 0], ["Cb", "Ro", "example", 4, "", "inf", 0, 26, 0]], "", "wide") + flow([[1, "Classes"], [2, "Sub-classes"], [3, "Relationships"], [4, "Individuals"]], "sm"),
          n: ["Here's the university ontology from the lecture: classes, sub-classes, relationships, and individuals, in a university domain.", "Classes first. A university has members, who are persons. It offers courses, has departments as units, and has rooms as facilities.",
            "Sub-classes: Student and Academic are both subclasses of Person.",
            "Relationships between classes. A course includes subjects. A student enrols in a course. An academic teaches a subject. A subject is owned by a department, and is scheduled in a room.",
            "And individuals, the green ovals. Data Analytics is an example of a course. School of CS is an example of a department. And CB11.07 is an example of a room. The relationship labels define exactly how the entities in the ontology connect."] },
        { v: h("A reasoner at work (1): <b>class membership</b>") + split(snet(420, 230, { Pe: [210, 30, "Person", 0, "", "3:hot"], St: [110, 120, "Student", 0, "", "2:hot"], Ac: [320, 120, "Academic"], Al: [110, 205, "Alice", 0, "obj", "1:hot"] }, [["St", "Pe", "subclass of", 0, "2:hot"], ["Ac", "Pe", "subclass of"], ["Al", "St", "instance of", 0, "1:hot"], ["Al", "Pe", "inferred", 3, "", "inf", -55, 20, 0]]), flow([[0, "Ontology: classes, properties, axioms"], [0, "Facts: Alice is a Student"], [0, "<b>Reasoner</b> applies rules"]], "sm") + fx(2, "Student ⊑ Person &nbsp;∧&nbsp; Student(Alice) &nbsp;⇒&nbsp; <b>Person(Alice)</b>", "c") + fx(4, "Jobs: <b>class membership</b>, properties, rule compliance, consistency", "sm")),
          n: ["A reasoner is a program that applies the ontology's axioms to the facts about individuals. Its input is the ontology, with its classes, properties and axioms, plus instance facts, like Alice is a student.",
            "Alice is an instance of Student.",
            "The ontology says Student is a subclass of Person. The symbol is like subset, for classes.",
            "So the reasoner infers that Alice is also a person. Nobody stored that. It was derived from the class hierarchy.",
            "That's the first of a reasoner's four jobs: infer class membership. The others are inferring properties, checking rule compliance, and validating consistency. Let's see each."] },
        { v: h("(2) Inferring properties: a <b>property chain</b>") + snet(640, 235, { Al: [70, 60, "Alice", 0, "obj"], Da: [230, 140, "Data Analytics", 0, "obj"], Ai: [410, 60, "AI Foundations", 0, "obj"], Sc: [565, 140, "School of CS", 0, "obj"] }, [["Al", "Da", "enrols in", 1, "1:hot 4:"], ["Da", "Ai", "includes", 2, "2:hot 4:"], ["Ai", "Sc", "owned by", 3, "3:hot 4:"], ["Al", "Sc", "studiesInDepartment (inferred)", 4, "", "inf", 110, 0, 8]], stx(0, 130, 40, ": Student", "ty") + stx(0, 330, 145, ": Course", "ty") + stx(0, 512, 65, ": Subject", "ty") + stx(0, 565, 113, ": Department", "ty"), "wide") + fx(4, "enrolsIn(s, c) ∧ includes(c, u) ∧ ownedBy(u, d) ⇒ <b>studiesInDepartment(s, d)</b>", "sm") + card(5, "ana", "Like train connections: A to B, B to C, C to D, so you <b>can get from A to D</b>, even though no single line goes there."),
          n: ["Job two: inferring properties. Here are three stated facts, and we'll combine them.",
            "Alice enrols in Data Analytics.",
            "Data Analytics includes the subject AI Foundations.",
            "AI Foundations is owned by the School of CS.",
            "The ontology has a rule that chains the three: if s enrols in c, c includes u, and u is owned by d, then s studies in department d. So the reasoner infers: Alice studies in the School of CS.",
            "It's like train connections. A to B, B to C, and C to D means you can get from A to D, even though no single line goes there."] },
        { v: h("(3) Rule compliance and (4) consistency") + `<div class="pzs ckw">${chk(1, "Alice : Student", "enrols in", "Data Analytics : Course", "accepted", "ok", "domain Student ✓, range Course ✓")}${chk(2, "CB11.07 : Room", "enrols in", "Data Analytics : Course", "rejected", "bad", "a <b>Room</b> is not a Student: <b>domain</b> violated")}${chk(4, "Data Analytics", "scheduled in", "School of CS : Department", "inconsistent", "bad", "scheduled in needs a <b>Room</b>: <b>range</b> violated")}</div>` + cols(fx(0, "enrolsIn(x, y) requires Student(x) and Course(y)", "sm"), fx(3, "scheduledIn(x, y) requires Subject(x) and Room(y)", "sm")) + card(5, "ana", "Like a <b>web form</b> that rejects \"banana\" in the date-of-birth box. <b>Domain</b> = what may be the subject. <b>Range</b> = what may be the object."),
          n: ["Job three: check rule compliance. The rule says the enrols-in property requires a student on the left, its domain, and a course on the right, its range.",
            "Alice, a student, enrols in Data Analytics, a course. Both constraints are satisfied, so it's accepted.",
            "Now someone asserts that CB11.07 enrols in Data Analytics. But CB11.07 is a room, not a student. The domain constraint is violated, so it's rejected.",
            "Job four: validate consistency. Here the rule is that scheduled-in requires a subject on the left and a room on the right.",
            "Someone asserts that Data Analytics is scheduled in the School of CS. But the School of CS is a department, and scheduled-in requires a room, like CB11.07. The range is violated, so the reasoner flags it as inconsistent.",
            "Think of a web form that refuses the word banana in the date-of-birth box. The domain says what kind of thing may be the subject of a property, and the range says what kind of thing may be the object. Ontology reasoning derives hidden facts, and checks that the stated facts obey the rules."] }
      ] },
      { t: "Knowledge graphs", sec: [3], scenes: [
        { v: h("Knowledge graph: facts as <b>triples</b>") + stg(0, [
            act(tag("<b>Alice</b>", "big"), { 0: [30, 18], 1: [30, 18], 2: [15, 62] }, "", ""), act(tag("<b>enrolledIn</b>", "big hi"), { 0: [50, 18], 2: [50, 50] }), act(tag("<b>AI101</b>", "big"), { 0: [70, 18], 2: [85, 62] }),
            fix(tag("subject", "lbl"), 30, 36, 1), fix(tag("predicate", "lbl"), 50, 36, 1), fix(tag("object", "lbl"), 70, 36, 1),
            fix(tag("⟶", "big lbl"), 32, 58, 2), fix(tag("⟶", "big lbl"), 68, 58, 2),
            act(tag("offeredBy ⟶ UTS", "ok"), { 0: [85, 92, 0], 3: [85, 88, 1] }), act(tag("age ⟶ 21", "ghost"), { 0: [15, 92, 0], 3: [15, 88, 1] })
          ], "16/3.4", "tall") + cols(card(0, "", "<b>Nodes</b>: real-world entities or concepts. <b>Labelled edges</b>: relationships."), card(3, "", "<b>Properties</b>: descriptive facts like name, age, location."), card(4, "tip", "Often organised by an <b>ontology</b> (the schema). The KG holds the <b>actual facts</b>.")),
          n: ["A knowledge graph represents real-world entities and concepts as nodes, and their relationships as labelled edges. Every fact is stored as a sentence with three parts. Alice enrolled in AI101.",
            "The three parts have names. Alice is the subject. EnrolledIn is the predicate, the relationship. AI101 is the object. Together they're a triple.",
            "Pull the triple apart and it becomes a graph: two nodes and one labelled edge, pointing from subject to object.",
            "Add more triples and the graph grows. AI101 is offered by UTS. And Alice has the property age, 21. Properties like name, age and location are descriptive facts.",
            "A knowledge graph connects facts so information can be explored, integrated and reasoned over. It's often organised by an ontology, which acts as its schema, while the graph itself stores the actual entities and facts."] },
        { v: h("A real knowledge graph: <b>Wikidata</b>") + split(snet(520, 250, { Da: [260, 125, "Douglas Adams (Q42)", 0, "obj", "1:hot"], Hu: [90, 35, "Human", 2], Ca: [90, 220, "Cambridge", 3], Hg: [400, 220, "Hitchhiker's Guide", 4] }, [["Da", "Hu", "instance of", 2, "", "", 0, 30, 0], ["Da", "Ca", "place of birth", 3, "", "", 0, 34, 6], ["Da", "Hg", "author of", 4, "", "", 0, -30, 6]]), list([[0, "Collaboratively edited facts"], [1, "Persistent <b>Q-ID</b>: Douglas Adams = <b>Q42</b>"], [4, "<b>RDF</b> triples, queried with <b>SPARQL</b>"]], "tight") + card(1, "ana", "Q-IDs are like <b>student numbers</b>: names clash, numbers don't.")),
          n: ["The best-known public knowledge graph is Wikidata, a collaboratively edited knowledge base containing entities and structured facts.",
            "Each item has a persistent Q identifier. The writer Douglas Adams is Q42. Think of Q-IDs like student numbers. Two students can share a name, but never a number. There's a Cambridge in England and one in Massachusetts, with different IDs.",
            "Douglas Adams is an instance of Human.",
            "His place of birth is Cambridge.",
            "And he's the author of The Hitchhiker's Guide to the Galaxy. Every edge is one triple. The data is stored as RDF triples, and we query it with SPARQL. Let's look at both."] },
        { v: h("RDF: the triple format") + tbl(["Part", "What it is", "Written as"], [[0, "<b>Subject</b>", "The resource being described", "a <b>URI</b> (unique web identifier)"], [1, "<b>Predicate</b> (property)", "The relationship between subject and object", "a <b>URI</b>"], [2, "<b>Object</b>", "The value or target", "a <b>URI</b> or a <b>literal</b>: string, number, date"]], "sm") + fx(3, "wd:Q42 &nbsp; wdt:P19 &nbsp; wd:Q350 &nbsp; . &nbsp; &nbsp; (Douglas Adams, place of birth, Cambridge)", "c") + card(3, "tip", "<b>wd:</b> = an item (thing). <b>wdt:</b> = a property (relationship). P31 = instance of, P18 = image."),
          n: ["RDF, the Resource Description Framework, is the standard format for these triples. The subject is the resource being described, identified by a URI, a unique web identifier.",
            "The predicate, or property, describes the relationship between subject and object. It's also a URI.",
            "The object is the value or target of the relationship. It can be a URI, pointing at another resource, or a literal, like a string, number or date.",
            "In Wikidata, wd colon marks an item, a thing, and wdt colon marks a property, a relationship. So Douglas Adams' place of birth is written as Q42, P19, and Cambridge's ID. Two property IDs to remember: P31 means instance of, and P18 means image."] },
        { v: h("SPARQL: find <b>cats that have a picture</b>") + split(code([["<b>SELECT</b> ?item ?itemLabel ?pic", "1:on 2:"], ["<b>WHERE</b> {", "2:on 4:"], ["&nbsp; ?item wdt:<b>P31</b> wd:<b>Q146</b> .", "2:on 3:"], ["&nbsp; ?item wdt:<b>P18</b> ?pic .", "3:on 4:"], ["&nbsp; SERVICE wikibase:label { ... \"en\" }", "4:on 5:"], ["}", ""]]) + list([[1, "<b>SELECT</b>: which variables come back. <b>?</b> marks a variable"], [2, "P31 = instance of, Q146 = <b>cat</b>"], [3, "P18 = image. No image → <b>not returned</b>"], [4, "Label service turns IDs into readable names"]], "tight"),
            `<div class="cnds">${cand("Q…: a cat", "has image", "")}${cand("Q…: a cat", "no image", "3:fade")}${cand("Q…: a dog", "has image", "2:fade")}${cand("Q…: a cat", "has image", "")}</div>` + at(4, tbl(["?item", "?itemLabel", "?pic"], [[4, "wd:Q…", "Tibbles", "photo URL"], [4, "wd:Q…", "Felix", "photo URL"]], "sm")) + card(5, "", "Query types: <b>SELECT</b>, CONSTRUCT, DESCRIBE, ASK. Try it at query.wikidata.org")),
          n: ["SPARQL is the query language for RDF data. You describe a pattern of triples, and it returns everything that matches. This query, from the lecture, finds items that are domestic cats and have an image. On the right, imagine four candidate items in the graph.",
            "SELECT chooses which variables come back in the results: the item, its readable label, and its picture. A question mark marks a variable, a placeholder that gets filled in with actual values when the query runs.",
            "WHERE holds the triple patterns. The first one says: the item's instance-of property, P31, has the value Q146, which is cat. Anything that isn't an instance of cat, like the dog, drops out.",
            "The second pattern says the item must have an image, property P18, and binds it to the variable pic. A cat without an image does not match, so it is not returned.",
            "The label service fills in readable names, so we get Tibbles, not just an ID. The result is a table with one row per match: the item, its label, and its picture.",
            "SELECT is one of four query types. The others are CONSTRUCT, DESCRIBE and ASK. You can run this query yourself at query dot wikidata dot org."] },
        { v: h("Semantic network vs ontology vs knowledge graph") + tbl(["", "What it is", "Reasoning"], [[0, "<b>Semantic network</b>", "Informal graph of concepts and relations", "Inheritance by following links"], [1, "<b>Ontology</b>", "Formal model: classes, properties, axioms", "Reasoner infers facts and checks consistency"], [2, "<b>Knowledge graph</b>", "Large graph of actual entities and facts (triples)", "Queried with SPARQL"]], "sm") + card(3, "ana", "Semantic network = a <b>whiteboard sketch</b>. Ontology = the <b>official rulebook</b>. Knowledge graph = the <b>database</b> of everything that happened."),
          n: ["Let's compare the three. A semantic network is an informal graph of concepts and relations, and it reasons by inheritance, following links upwards.",
            "An ontology is a formal model, with classes, properties and axioms. A reasoner uses it to infer facts and check consistency.",
            "A knowledge graph is a large graph of actual entities and facts, stored as triples, and queried with SPARQL.",
            "One way to remember it. A semantic network is a whiteboard sketch. An ontology is the official rulebook. And a knowledge graph is the database of everything that actually happened."] }
      ] },
      { t: "Reasoning with categories", sec: [4], scenes: [
        { v: h("Perceive → classify → <b>predict</b>") + stg(0, [
            act(tag("green, mottled skin", "ok"), { 0: [16, 14, 0], 1: [16, 14, 1], 2: [50, 50, 0, .5] }), act(tag("oval shape", "ok"), { 0: [16, 38, 0], 1: [16, 38, 1], 2: [50, 50, 0, .5] }),
            act(tag("red flesh, black seeds", "ok"), { 0: [16, 62, 0], 1: [16, 62, 1], 2: [50, 50, 0, .5] }), act(tag("in the fruit aisle", "ok"), { 0: [16, 86, 0], 1: [16, 86, 1], 2: [50, 50, 0, .5] }),
            act(tag("Watermelon", "big hi"), { 0: [50, 50, 0, .6], 2: [50, 50, 1, 1.2] }),
            act(tag("good for a <b>fruit salad</b>", "big ok"), { 0: [84, 50, 0], 3: [84, 50, 1] })
          ], "16/2.9", "tall") + cols(card(1, "", "<b>1. Perceive</b>: detect an object, observe its properties."), card(2, "", "<b>2. Classify</b>: infer its category, Watermelon."), card(3, "", "<b>3. Predict</b>: use category knowledge for things you <b>didn't observe</b>.")) + card(4, "ana", "Told a new animal is a <b>bird</b>? You already expect feathers, wings and eggs. Unless it's a <b>penguin</b>!"),
          n: ["Finally, reasoning with categories, the reason we organise knowledge this way at all. An agent goes from perceptual evidence to a category, and from the category to predictions.",
            "Step one, perceive. The agent detects an object and observes its properties: green mottled skin, an oval shape, red flesh with black seeds, and it's in the supermarket's fruit aisle.",
            "Step two, classify. Those properties together point to one category: it's a watermelon.",
            "Step three, predict. Now the agent can use what it knows about the category: it's suitable for a fruit salad. Nobody tested that on this melon. Category membership lets the agent infer properties it has not directly observed.",
            "You do this all the time. If someone tells you a new animal is a bird, you already expect feathers, wings and eggs, without checking each one. Unless it's a penguin, which brings us back to exceptions."] },
        { v: h("Exam checklist") + list([[0, "Hierarchy: broad → specific. Seven principles: <b>is-a</b>, inclusiveness, inheritance, <b>transitivity</b>, mutual exclusivity, necessary and sufficient, systematic rules"], [1, "Works best: incomplete evidence, <b>mature</b> domains, <b>clear boundaries</b>"], [2, "<b>∈</b> membership (object → category). <b>⊆</b> subset (category → category)"], [3, "Semantic net: follow MemberOf / SubsetOf <b>upwards</b>. <b>Specific beats general</b> (Pingu, John)"], [4, "Ontology: classes, properties, individuals, <b>axioms</b>. Domain = subject type, range = object type"], [5, "Reasoner: class membership, property chain, rule compliance, consistency"], [6, "KG: <b>(subject, predicate, object)</b> triples in RDF. SPARQL: SELECT ?vars WHERE { patterns }"], [7, "Perceive → classify → predict"]], "tight"),
          n: ["Here's your checklist. A hierarchy goes from broad to specific, and a good one follows seven principles: one is-a relation between levels, inclusiveness, inheritance, transitivity, mutual exclusivity, necessary and sufficient criteria, and systematic rules.",
            "Hierarchies work best when evidence is incomplete, the domain is mature, and class boundaries are clear.",
            "Know the two symbols. Element-of is membership, from an object to its category. Subset is from a category to a broader category.",
            "In a semantic network, reason by following member-of and subset-of links upwards. A more specific value always beats a general one, like Pingu not flying, or John's one leg.",
            "An ontology has classes, properties, individuals and axioms. The domain of a property is the type of its subject, and the range is the type of its object.",
            "A reasoner does four jobs: infer class membership, infer properties through chains, check rule compliance, and validate consistency.",
            "A knowledge graph stores subject, predicate, object triples in RDF, and SPARQL queries it with SELECT, a list of variables, and WHERE with triple patterns.",
            "And category reasoning goes perceive, classify, predict. That's the end of the content. Now try this week's quiz, and good luck in the exam."] }
      ] }
    ]
  };

  // ontology building blocks table (defined after use via hoisting)
  function rtabs() {
    return `<table class="vk-tbl sm">${[[1, "Classes and hierarchy", "Student <b>subclass of</b> Person"], [2, "Properties", "Student <b>enrolledIn</b> Course &nbsp;·&nbsp; Student <b>age</b> 21"], [3, "Individuals", "Alice <b>instance of</b> Student"], [4, "Axioms (rules)", "Every Student is a Person &nbsp;·&nbsp; enrolsIn(x, y) needs Student(x), Course(y)"]].map(([k, a, b]) => `<tr class="vk-i" data-s="${k}"><td><b>${a}</b></td><td>${b}</td></tr>`).join("")}</table>`;
  }
})();
