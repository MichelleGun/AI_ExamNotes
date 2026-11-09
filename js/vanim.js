// Animation kit for the video lessons: a "stage" with actors that move at each narration step.
// Positions use data-p (see applyState in video.js): "k:x,y,opacity,scale,rotate" with x, y in % of the stage.
(function () {
  const K = window.VK;
  // {0:[x,y,o], 2:[x,y]} -> "0:x,y,o 2:x,y"
  const P = spec => Object.entries(spec).map(([k, v]) => k + ":" + v.join(",")).join(" ");
  const J = o => JSON.stringify(o).replace(/'/g, "&#39;");
  Object.assign(K, {
    P, J,
    // stage: a box with its own aspect ratio, revealed at step k
    stg: (k, items, ar = "16/5", cls = "") => K.at(k, `<div class="vk-stg ${cls}" style="aspect-ratio:${ar}">${items.join("")}</div>`, "stgw"),
    // an actor: any html moved by a position spec
    act: (html, spec, cls = "", attrs = "") => `<div class="a ${cls}" data-p="${P(spec)}" ${attrs}>${html}</div>`,
    // a static actor shown from step k at (x, y)
    fix: (html, x, y, k = 0, cls = "") => K.act(html, k > 0 ? { 0: [x, y, 0], [k]: [x, y, 1] } : { 0: [x, y, 1] }, cls),
    // text that changes at given steps: {0:"a", 3:"b"}
    say: (T, cls = "") => `<span class="${cls}" data-t='${J(T)}'>${T[Object.keys(T)[0]]}</span>`,
    // a person with a name and an optional badge (priority number)
    person: (label, c = 0, badge = "") => `<div class="ps c${c}"><svg viewBox="0 0 40 56"><circle cx="20" cy="11" r="8.5"/><path d="M5 55 v-15 a15 15 0 0 1 30 0 v15 z"/></svg><span>${label}</span>${badge !== "" ? `<b>${badge}</b>` : ""}</div>`,
    plate: (label, c = 0) => `<div class="pl c${c}">${label}</div>`,
    tag: (label, cls = "") => `<div class="tg ${cls}">${label}</div>`,
    zone: (label, w, h, cls = "") => `<div class="zn ${cls}" style="width:${w}cqw;height:${h}cqw"><span>${label}</span></div>`,
    // add extra svg markup into an svg string (e.g. a car on the map)
    inSvg: (svgStr, extra, under = false) => under ? svgStr.replace("</defs>", "</defs>" + extra) : svgStr.replace(/<\/svg>$/, extra + "</svg>"),
    // a car icon (svg group), travels along points with data-run {k: [[x,y],...]}
    car: (run, cls = "") => `<g class="mover car ${cls}" data-run='${J(run)}' style="opacity:0"><rect x="-13" y="-8" width="26" height="12" rx="4"/><rect x="-7" y="-14" width="14" height="8" rx="3"/><circle cx="-7" cy="5" r="3.5" class="w"/><circle cx="7" cy="5" r="3.5" class="w"/></g>`,
    crow: (run) => `<g class="mover crow" data-run='${J(run)}' style="opacity:0"><path d="M-14 0 Q-7 -9 0 0 Q7 -9 14 0"/></g>`,
    // a moving marker inside an svg, by step
    dot: (spec, cls = "", r = 9) => `<circle class="mover dot ${cls}" r="${r}" data-p="${P(spec)}" style="opacity:0"/>`,
    // horizontal bar that grows at steps: {k: pct}
    bar: (T, cls = "", label = "") => `<div class="br ${cls}" data-st='${J(Object.fromEntries(Object.entries(T).map(([k, v]) => [k, "width:" + v + "%"])))}' style="width:0%">${label}</div>`
  });
})();
