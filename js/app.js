MEMORIES.forEach(m => { if (m.img) m.img = new URL(encodeURI(String(m.img).trim().replace(/\\/g, "/")), document.baseURI).href; });
const $ = s => document.querySelector(s);
const letterText = () => CONFIG.letter.replaceAll("[YOUR NAME]", CONFIG.yourName).replaceAll("[HER NAME]", CONFIG.herName);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pad = n => String(n).padStart(2,"0");

/* ---------------- geometry helpers ---------------- */
const HEART = (() => {
  const raw = [], n = 240;
  for (let i = 0; i < n; i++) {
    const t = i / n * Math.PI * 2;
    raw.push([16*Math.pow(Math.sin(t),3), -(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))]);
  }
  const xs = raw.map(p=>p[0]), ys = raw.map(p=>p[1]);
  const x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys);
  return raw.map(p => [ (p[0]-x0)/(x1-x0)-.5, (p[1]-y0)/(y1-y0)-.5 ]);
})();

function poly(kind, w, h, ins){
  const W = Math.max(2, w-2*ins), H = Math.max(2, h-2*ins), pts = [];
  if (kind === "rect"){
    const hw=W/2, hh=H/2, s=4;
    for (let x=-hw; x<hw; x+=s) pts.push([x,-hh]);
    for (let y=-hh; y<hh; y+=s) pts.push([hw,y]);
    for (let x=hw; x>-hw; x-=s) pts.push([x,hh]);
    for (let y=hh; y>-hh; y-=s) pts.push([-hw,y]);
  } else if (kind === "oval"){
    for (let i=0;i<300;i++){ const a=i/300*Math.PI*2; pts.push([Math.sin(a)*W/2, -Math.cos(a)*H/2]); }
  } else {
    HEART.forEach(p => pts.push([p[0]*W, p[1]*H]));
  }
  return pts;
}
const pathD = (kind,w,h,ins) => "M" + poly(kind,w,h,ins).map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join("L") + "Z";

function resample(pts, gap){
  const out=[pts[0]]; let acc=0;
  for (let i=1;i<=pts.length;i++){
    const a=pts[i-1], b=pts[i%pts.length], d=Math.hypot(b[0]-a[0], b[1]-a[1]);
    acc += d;
    while (acc >= gap){ const k=(d-(acc-gap))/d; out.push([a[0]+(b[0]-a[0])*k, a[1]+(b[1]-a[1])*k]); acc -= gap; }
  }
  return out;
}

function cluster(x,y,rot,s){
  let g = `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(2)})">`;
  [-66,-33,0,33,66].forEach(a => {
    g += `<ellipse cx="0" cy="-13" rx="5.4" ry="13" transform="rotate(${a})" fill="url(#gold)" stroke="#4d340f" stroke-width=".8"/>`;
  });
  g += `<circle r="6.5" fill="url(#bead)" stroke="#4d340f" stroke-width=".8"/></g>`;
  return g;
}

/* ---------------- ornate frame ---------------- */
function frameMarkup(m, i){
  const {kind,w,h} = m, mn = Math.min(w,h), t = mn*(kind==="heart"?.19:.17);
  const P = ins => pathD(kind,w,h,ins);
  let gold = `<path d="${P(0)}" fill="url(#gold)" stroke="#4d340f" stroke-width="1.4" stroke-linejoin="round"/>`;
  gold += `<path d="${P(t*.24)}" fill="none" stroke="#5b3d12" stroke-opacity=".75" stroke-width="2.4"/>`;
  gold += `<path d="${P(t*.31)}" fill="none" stroke="#fff0b8" stroke-opacity=".5" stroke-width="1"/>`;
  resample(poly(kind,w,h,t*.55), t*.30).forEach(p => {
    gold += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(t*.115).toFixed(2)}" fill="url(#bead)" stroke="#5b3d12" stroke-width=".5"/>`;
  });
  gold += `<path d="${P(t*.8)}" fill="#b98f3d" stroke="#4d340f" stroke-width="1.2" stroke-linejoin="round"/>`;
  gold += `<path d="${P(t*.93)}" fill="none" stroke="#f6dc94" stroke-opacity=".65" stroke-width="1"/>`;
  const s = t/21;
  if (kind === "rect"){
    const hw=w/2-t*.2, hh=h/2-t*.2;
    gold += cluster(-hw,-hh,-45,s)+cluster(hw,-hh,45,s)+cluster(hw,hh,135,s)+cluster(-hw,hh,-135,s);
    gold += cluster(0,-h/2+t*.1,0,s*.9);
  } else if (kind === "oval"){
    gold += cluster(0,-h/2+t*.1,0,s*1.2)+cluster(0,h/2-t*.1,180,s*1.1)+cluster(-w/2+t*.1,0,-90,s*.9)+cluster(w/2-t*.1,0,90,s*.9);
  } else {
    const c = HEART[0], tip = HEART[HEART.length/2];
    let li=0, ri=0; HEART.forEach((p,k)=>{ if(p[0]<HEART[li][0]) li=k; if(p[0]>HEART[ri][0]) ri=k; });
    gold += cluster(c[0]*w, c[1]*h + t*.1, 0, s*1.05) + cluster(tip[0]*w, tip[1]*h - t*.05, 180, s);
    gold += cluster(HEART[li][0]*w + t*.15, HEART[li][1]*h, -90, s*.9) + cluster(HEART[ri][0]*w - t*.15, HEART[ri][1]*h, 90, s*.9);
  }
  const al = {top:"xMidYMin", center:"xMidYMid", bottom:"xMidYMax"}[m.pos] || "xMidYMid";
  const tone = CONFIG.photoTone==="warm" ? ' filter="url(#toneWarm)"' : CONFIG.photoTone==="bw" ? ' filter="url(#toneBW)"' : '';
  let photo = `<clipPath id="cp${i}"><path d="${P(t)}"/></clipPath><g clip-path="url(#cp${i})">`;
  photo += `<rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" fill="url(#paper)"/>`;
  const fs = mn*.1;
  photo += m.future
    ? `<text y="${-fs*.2}" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-style="italic" font-size="${fs*1.25}" fill="#8a7550">Reserved</text><text y="${fs*1.2}" text-anchor="middle" font-family="Inter,Arial" font-size="${fs*.6}" letter-spacing="1.5" fill="#9b8a68">FOR WHAT'S NEXT</text>`
    : `<text y="${fs*.5}" text-anchor="middle" font-size="${fs*2.2}" fill="#b49c6e" opacity=".7">♥</text>`;
  if (m.img) photo += `<image href="${esc(m.img)}" x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" preserveAspectRatio="${al} slice"${tone} onerror="this.remove()"/>`;
  photo += `<path d="${P(t)}" fill="none" stroke="rgba(25,12,0,.65)" stroke-width="12"/>`;
  photo += `<rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" fill="url(#sheen)"/></g>`;
  const label = `${m.num}: ${m.title}`;
  return `<g transform="translate(${m.cx} ${m.cy}) rotate(${m.rot||0})" filter="url(#fshadow)">
    <g class="fh" tabindex="0" role="button" aria-label="${esc(label)}" data-i="${i}">
      <path class="ring" d="${P(-7)}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 4"/>
      <g filter="url(#bevel)">${gold}</g>${photo}
    </g></g>`;
}

/* ---------------- cute wall clock ---------------- */
function clockMarkup(){
  let ticks = "";
  for (let i=0;i<12;i++){
    const long = i%3===0;
    ticks += `<line x1="0" y1="${long?-25:-24}" x2="0" y2="-21.5" stroke="#5b3d12" stroke-width="${long?2:1}" stroke-linecap="round" transform="rotate(${i*30})"/>`;
  }
  const heart = "M0,4 C-8,-2 -6,-8 0,-5 C6,-8 8,-2 0,4Z";
  return `<g transform="translate(795 216)">
   <g class="clk" id="clock" tabindex="0" role="button" aria-label="Open the clock that keeps our time together">
    <circle r="44" fill="transparent"/>
    <g class="vis">
    <circle r="37" fill="rgba(50,30,8,.3)" transform="translate(5 9)" filter="url(#blur3)"/>
    <g filter="url(#bevel)"><circle r="36" fill="url(#gold)" stroke="#4d340f" stroke-width="1.2"/>
      <circle r="31" fill="none" stroke="#5b3d12" stroke-opacity=".7" stroke-width="1.5"/></g>
    <circle r="29" fill="#fbf5e6" stroke="#4d340f" stroke-width="1"/>
    <circle r="29" fill="url(#sheen)"/>
    ${ticks}
    <path d="${heart}" transform="translate(0 -13) scale(.55)" fill="#c9506a"/>
    <text y="15" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-style="italic" font-size="8.5" fill="#8a6a35">us</text>
    <g id="hH"><line x1="0" y1="3" x2="0" y2="-13" stroke="#3a2a1a" stroke-width="3" stroke-linecap="round"/></g>
    <g id="hM"><line x1="0" y1="4" x2="0" y2="-20" stroke="#3a2a1a" stroke-width="2" stroke-linecap="round"/></g>
    <g id="hS"><line x1="0" y1="6" x2="0" y2="-19" stroke="#c9506a" stroke-width="1"/><path d="${heart}" transform="translate(0 -22) scale(.5)" fill="#c9506a"/></g>
    <circle r="3" fill="url(#bead)" stroke="#4d340f" stroke-width=".6"/>
    <text y="56" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-style="italic" font-size="13" fill="#6a5538">our time</text>
    </g>
   </g></g>`;
}

/* ---------------- miniature people ---------------- */
function person(x,y,o){
  const s=o.s||1, skin=o.skin||"#e2b796", bot=o.bot||"#2a2d36", hair=o.hair||"#2a1a12";
  let g = `<g transform="translate(${x} ${y}) scale(${s})">`;
  g += `<ellipse cx="0" cy="3" rx="28" ry="6.5" fill="rgba(30,16,4,.42)" filter="url(#blur3)"/>`;
  const shade = d => `<path d="${d}" fill="url(#fshade)"/>`;
  if (o.dress){
    g += `<rect x="-9" y="-34" width="7" height="31" fill="${skin}"/><rect x="2" y="-34" width="7" height="31" fill="${skin}"/>`;
    g += `<ellipse cx="-5.5" cy="-2" rx="7" ry="3.6" fill="#241a14"/><ellipse cx="5.5" cy="-2" rx="7" ry="3.6" fill="#241a14"/>`;
    const sk = "M-17,-96 L17,-96 L27,-30 Q0,-20 -27,-30 Z";
    g += `<path d="${sk}" fill="${o.dress}"/>${shade(sk)}`;
  } else {
    g += `<rect x="-12" y="-68" width="11" height="64" rx="2" fill="${bot}"/><rect x="1" y="-68" width="11" height="64" rx="2" fill="${bot}"/>`;
    g += `<rect x="-12" y="-68" width="11" height="64" rx="2" fill="url(#fshade)"/><rect x="1" y="-68" width="11" height="64" rx="2" fill="url(#fshade)"/>`;
    g += `<ellipse cx="-6.5" cy="-2" rx="7.5" ry="3.8" fill="#1d1511"/><ellipse cx="6.5" cy="-2" rx="7.5" ry="3.8" fill="#1d1511"/>`;
  }
  const bodiceBottom = o.dress ? -92 : -64;
  const tor = `M-20,-116 Q0,-123 20,-116 L${o.dress?17:19},${bodiceBottom} L${o.dress?-17:-19},${bodiceBottom} Z`;
  g += `<rect x="-30" y="-114" width="9.5" height="46" rx="4.5" fill="${o.top}" transform="rotate(3 -25 -114)"/>`;
  g += `<rect x="20.5" y="-114" width="9.5" height="46" rx="4.5" fill="${o.top}" transform="rotate(-3 25 -114)"/>`;
  g += `<circle cx="-26.5" cy="-66" r="4.6" fill="${skin}"/><circle cx="26.5" cy="-66" r="4.6" fill="${skin}"/>`;
  g += `<path d="${tor}" fill="${o.top}"/>${shade(tor)}`;
  g += `<rect x="-4.5" y="-126" width="9" height="11" fill="${skin}"/>`;
  g += `<circle cx="0" cy="-135" r="13.8" fill="${skin}"/>`;
  if (o.long) g += `<path d="M-15,-136 Q-16,-98 -9,-96 L9,-96 Q16,-98 15,-136 Z" fill="${hair}"/>`;
  g += `<circle cx="0" cy="-136" r="14.6" fill="${hair}"/><circle cx="-5" cy="-141" r="5" fill="rgba(255,255,255,.12)"/>`;
  return g + `</g>`;
}

/* ---------------- whole scene ---------------- */
function buildScene(){
  const defs = `<defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".22" stop-color="#e2b659"/><stop offset=".45" stop-color="#9a6d26"/><stop offset=".7" stop-color="#f0cf78"/><stop offset="1" stop-color="#a77a30"/></linearGradient>
    <radialGradient id="bead" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff3c4"/><stop offset=".5" stop-color="#d6a64d"/><stop offset="1" stop-color="#7d561b"/></radialGradient>
    <linearGradient id="brass" x1="0" x2="1"><stop offset="0" stop-color="#7a5719"/><stop offset=".45" stop-color="#f6df94"/><stop offset="1" stop-color="#8d6620"/></linearGradient>
    <linearGradient id="walnut" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#76503a"/><stop offset=".6" stop-color="#3f291d"/><stop offset="1" stop-color="#2a1a11"/></linearGradient>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efe3c8"/><stop offset="1" stop-color="#cdb98f"/></linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".30"/><stop offset=".42" stop-color="#fff" stop-opacity=".05"/><stop offset=".43" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="fshade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>
    <linearGradient id="boxG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f0ea"/><stop offset=".5" stop-color="#d4d1c8"/><stop offset="1" stop-color="#b7b3a8"/></linearGradient>
    <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6efe0"/><stop offset="1" stop-color="#ddd1b6"/></linearGradient>
    <linearGradient id="ceilG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a927f"/><stop offset="1" stop-color="#d8cfbb"/></linearGradient>
    <linearGradient id="slG" x1="0" x2="1"><stop offset="0" stop-color="#8c8472"/><stop offset="1" stop-color="#d1c7ae"/></linearGradient>
    <linearGradient id="srG" x1="1" x2="0"><stop offset="0" stop-color="#7f7766"/><stop offset="1" stop-color="#c8bea6"/></linearGradient>
    <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfa57a"/><stop offset=".5" stop-color="#dcc79d"/><stop offset="1" stop-color="#ecdcb8"/></linearGradient>
    <linearGradient id="edgeL" x1="0" x2="1"><stop offset="0" stop-color="#50380f" stop-opacity=".32"/><stop offset="1" stop-color="#50380f" stop-opacity="0"/></linearGradient>
    <linearGradient id="edgeR" x1="1" x2="0"><stop offset="0" stop-color="#50380f" stop-opacity=".32"/><stop offset="1" stop-color="#50380f" stop-opacity="0"/></linearGradient>
    <linearGradient id="edgeT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#50380f" stop-opacity=".38"/><stop offset="1" stop-color="#50380f" stop-opacity="0"/></linearGradient>
    <linearGradient id="edgeB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#50380f" stop-opacity=".30"/><stop offset="1" stop-color="#50380f" stop-opacity="0"/></linearGradient>
    <radialGradient id="pool"><stop offset="0" stop-color="#fff1c8" stop-opacity=".85"/><stop offset=".55" stop-color="#ffe3a0" stop-opacity=".25"/><stop offset="1" stop-color="#ffe3a0" stop-opacity="0"/></radialGradient>
    <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6a6" stop-opacity=".62"/><stop offset="1" stop-color="#ffe6a6" stop-opacity="0"/></linearGradient>
    <radialGradient id="vig" cx=".5" cy=".46" r=".72"><stop offset=".55" stop-color="#1a0d00" stop-opacity="0"/><stop offset="1" stop-color="#1a0d00" stop-opacity=".62"/></radialGradient>
    <radialGradient id="bulb" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#f4e8c6"/><stop offset="1" stop-color="#cdbf98"/></radialGradient>
    <linearGradient id="marble" x1="0" x2="1"><stop offset="0" stop-color="#e9e5da"/><stop offset=".5" stop-color="#fbf9f3"/><stop offset="1" stop-color="#c9c4b6"/></linearGradient>
    <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".3" stop-color="#fff" stop-opacity=".04"/><stop offset=".31" stop-color="#fff" stop-opacity="0"/><stop offset=".75" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".07"/></linearGradient>
    <filter id="bevel" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.7" result="b"/>
      <feSpecularLighting in="b" surfaceScale="4.5" specularConstant="1.15" specularExponent="24" lighting-color="#fff5d2" result="s"><fePointLight x="-130" y="-170" z="170"/></feSpecularLighting>
      <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
      <feComposite in="SourceGraphic" in2="si" operator="arithmetic" k1="0" k2="1" k3=".9" k4="0"/>
    </filter>
    <filter id="fshadow" x="-25%" y="-25%" width="160%" height="170%"><feDropShadow dx="7" dy="11" stdDeviation="6" flood-color="#3a230a" flood-opacity=".48"/></filter>
    <filter id="blur3" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="blur10" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .38  0 0 0 0 .3  0 0 0 0 .2  0 0 0 .55 0"/></filter>
    <filter id="toneWarm"><feColorMatrix values="1.05 .1 0 0 .02  .02 1 .03 0 0  0 .06 .82 0 0  0 0 0 1 0"/></filter>
    <filter id="toneBW"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="1.08" intercept="-.03"/><feFuncG type="linear" slope="1.08" intercept="-.03"/><feFuncB type="linear" slope="1.08" intercept="-.03"/></feComponentTransfer></filter>
  </defs>`;

  let shell = `<rect width="1000" height="1240" rx="10" fill="url(#boxG)"/>
    <rect x="3" y="3" width="994" height="1234" rx="8" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>
    <rect x="80" y="80" width="840" height="1030" fill="#cfc6b0"/>
    <polygon points="80,80 920,80 850,150 150,150" fill="url(#ceilG)"/>
    <polygon points="80,80 150,150 150,900 80,1110" fill="url(#slG)"/>
    <polygon points="920,80 850,150 850,900 920,1110" fill="url(#srG)"/>
    <polygon points="150,900 850,900 920,1110 80,1110" fill="url(#floorG)"/>`;
  for (let i=0;i<=7;i++){
    const bx=150+i*100, fx=80+i*120;
    shell += `<line x1="${bx}" y1="900" x2="${fx}" y2="1110" stroke="#6b4a1a" stroke-opacity=".16" stroke-width="2"/>`;
  }
  shell += `<rect x="150" y="150" width="700" height="750" fill="url(#wallG)"/>
    <ellipse cx="330" cy="300" rx="300" ry="260" fill="url(#pool)"/><ellipse cx="670" cy="300" rx="300" ry="260" fill="url(#pool)"/>
    <rect x="150" y="150" width="700" height="750" filter="url(#grain)" opacity=".4"/>
    <rect x="150" y="150" width="80" height="750" fill="url(#edgeL)"/><rect x="770" y="150" width="80" height="750" fill="url(#edgeR)"/>
    <rect x="150" y="150" width="700" height="90" fill="url(#edgeT)"/><rect x="150" y="820" width="700" height="80" fill="url(#edgeB)"/>
    <rect x="80" y="1110" width="840" height="3" fill="#8d8a80" opacity=".5"/>
    <rect x="80" y="80" width="840" height="1030" fill="none" stroke="#7d796e" stroke-width="3"/>`;

  const sconce = (x,y) => `<g transform="translate(${x} ${y})">
    <ellipse cx="0" cy="38" rx="9" ry="14" fill="rgba(60,38,10,.25)" transform="translate(7 5)"/>
    <ellipse cx="0" cy="40" rx="11" ry="16" fill="url(#brass)" stroke="#5b3d12" stroke-width=".8"/>
    <path d="M0,30 Q-18,18 0,6" fill="none" stroke="url(#brass)" stroke-width="5" stroke-linecap="round"/>
    <rect x="-9" y="14" width="18" height="10" rx="3" fill="url(#brass)" stroke="#5b3d12" stroke-width=".6"/>
    <circle cx="0" cy="-2" r="14" fill="url(#bulb)"/>
    <circle class="lt" cx="0" cy="-2" r="46" fill="url(#pool)"/></g>`;
  let wall = sconce(385,500) + sconce(615,500) + clockMarkup();
  wall += `<text x="500" y="808" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-style="italic" font-size="30" fill="#6a5538" opacity=".8">${esc(CONFIG.wallQuote)}</text>`;
  MEMORIES.forEach((m,i) => wall += frameMarkup(m,i));

  let props = "";
  [215,395,605,785].forEach(x => {
    props += `<ellipse cx="${x}" cy="950" rx="17" ry="5" fill="rgba(30,16,4,.4)" filter="url(#blur3)"/>
      <ellipse cx="${x}" cy="946" rx="15" ry="4.5" fill="url(#brass)"/><rect x="${x-2.8}" y="878" width="5.6" height="68" fill="url(#brass)"/>
      <circle cx="${x}" cy="876" r="7.5" fill="url(#bead)" stroke="#5b3d12" stroke-width=".6"/>`;
  });
  [[215,395],[605,785]].forEach(([a,b]) => {
    const d = `M${a},884 Q${(a+b)/2},${914} ${b},884`;
    props += `<path d="${d}" fill="none" stroke="#5a0d1a" stroke-width="8.5" stroke-linecap="round" transform="translate(0 2)" opacity=".55"/>
      <path d="${d}" fill="none" stroke="#b3182f" stroke-width="7" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="#e8505f" stroke-width="2" stroke-linecap="round" transform="translate(0 -1.8)" opacity=".7"/>`;
  });
  props += `<ellipse cx="190" cy="1012" rx="46" ry="8" fill="rgba(30,16,4,.4)" filter="url(#blur3)"/>
    <rect x="160" y="1000" width="60" height="12" rx="2" fill="url(#marble)"/><rect x="168" y="946" width="44" height="56" fill="url(#marble)"/>
    <rect x="160" y="934" width="60" height="14" rx="2" fill="url(#marble)"/>
    <path d="M172,934 Q168,914 176,906 L204,906 Q212,914 208,934 Z" fill="url(#brass)" stroke="#5b3d12" stroke-width=".8"/>
    <circle cx="180" cy="896" r="9" fill="#d8607a"/><circle cx="196" cy="892" r="10" fill="#e8809a"/><circle cx="188" cy="882" r="8" fill="#c94a68"/><circle cx="203" cy="900" r="7" fill="#d8607a"/>
    <ellipse cx="826" cy="1014" rx="34" ry="7" fill="rgba(30,16,4,.4)" filter="url(#blur3)"/>
    <path d="M800,982 L852,982 L846,1012 Q826,1018 806,1012 Z" fill="url(#marble)" stroke="#a8a291" stroke-width=".8"/>
    ${[[-52,20],[-26,26],[0,30],[26,26],[52,20]].map(([a,l])=>`<ellipse cx="826" cy="${982-l*.5}" rx="6.5" ry="${l}" fill="#3f7a3a" transform="rotate(${a} 826 982)"/>`).join("")}`;
  props += `<ellipse cx="500" cy="1020" rx="124" ry="10" fill="rgba(30,16,4,.42)" filter="url(#blur3)"/>
    <rect x="404" y="966" width="18" height="52" fill="url(#walnut)"/><rect x="578" y="966" width="18" height="52" fill="url(#walnut)"/>
    <rect x="388" y="946" width="224" height="22" rx="2" fill="url(#walnut)"/>
    <polygon points="398,934 602,934 612,946 388,946" fill="#8a6045"/>
    <rect x="388" y="946" width="224" height="3" fill="#b88a68" opacity=".5"/>`;
  props += `<g transform="translate(500 936) rotate(-4)">
    <g class="env" id="env" tabindex="0" role="button" aria-label="Open the letter">
      <rect x="-38" y="-34" width="76" height="54" rx="8" fill="transparent"/>
      <g class="vis">
        <rect class="glow" x="-34" y="-30" width="68" height="46" rx="8" fill="url(#pool)"/>
        <rect x="-24" y="-17" width="48" height="31" rx="2" fill="#f7efdb" stroke="#b9a577" stroke-width="1"/>
        <path d="M-24,-17 L0,2 L24,-17" fill="none" stroke="#b9a577" stroke-width="1.2"/>
        <path d="M-24,14 L-6,-3 M24,14 L6,-3" stroke="#d4c397" stroke-width="1"/>
        <path d="M0,-2 q-5,-6 -8,-1 q-2,5 8,10 q10,-5 8,-10 q-3,-5 -8,1z" transform="translate(0 -1) scale(.55)" fill="#a8302f"/>
      </g>
    </g></g>`;
  props += person(285,1068,{top:"#2d2f3a",bot:"#2a2d36",hair:"#1d130d"});
  props += person(338,1068,{top:"#c98a9a",dress:"#d9a3b0",hair:"#3a2316",long:true,s:.97});
  props += person(682,1066,{top:"#6f8f6a",bot:"#46433a",hair:"#5b4630"});
  props += person(742,1066,{top:"#d4788f",dress:"#c75d78",hair:"#241710",long:true,s:.96});
  props += person(815,1070,{top:"#7a8087",bot:"#3d3f46",hair:"#8a7a66",s:1.0});

  let light = "";
  [330,670].forEach(x => {
    light += `<polygon class="lt" points="${x-13},138 ${x+13},138 ${x+250},680 ${x-250},680" fill="url(#cone)" filter="url(#blur10)"/>`;
  });
  let fixtures = "";
  [330,670].forEach(x => {
    fixtures += `<rect x="${x-3}" y="82" width="6" height="22" fill="#6e6858"/>
      <rect x="${x-17}" y="102" width="34" height="34" rx="4" fill="url(#brass)" stroke="#4d340f" stroke-width=".8"/>
      <ellipse cx="${x}" cy="136" rx="15" ry="4.5" fill="#fff6d4"/>
      <ellipse class="lt" cx="${x}" cy="138" rx="30" ry="12" fill="url(#pool)"/>`;
  });

  const plaque = `<g>
    <rect x="270" y="1138" width="460" height="82" rx="4" fill="#3a2a10" opacity=".35" transform="translate(3 4)"/>
    <rect x="270" y="1138" width="460" height="82" rx="4" fill="url(#gold)" stroke="#4d340f" stroke-width="1.5"/>
    <rect x="278" y="1146" width="444" height="66" rx="2" fill="none" stroke="#5b3d12" stroke-opacity=".7" stroke-width="1.5"/>
    <text x="500" y="1174" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-weight="600" font-size="30" letter-spacing="6" fill="#2a1b08">MUSEUM OF US</text>
    <text x="500" y="1194" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="19" fill="#2a1b08">${esc(CONFIG.yourName)} &amp; ${esc(CONFIG.herName)}</text>
    <text x="500" y="1210" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" letter-spacing="1.5" fill="#3a280e">${esc(CONFIG.startDate)} — ${esc(CONFIG.anniversaryDate)}</text></g>`;

  const finish = `<rect x="80" y="80" width="840" height="1030" fill="url(#vig)"/>
    <polygon points="80,80 920,80 920,1110 80,1110" fill="url(#glassG)"/>
    <rect class="dk" width="1000" height="1240" rx="10" fill="#05030a"/>`;

  return defs + `<g class="layer" data-d="0">${shell}</g>
    <g class="layer" data-d="7">${wall}</g>${light}
    <g class="layer" data-d="14">${props}</g>${fixtures}${plaque}${finish}`;
}

/* ---------------- fit to screen ---------------- */
const svg = $("#scene"), stage = $("#stage");
function fit(){
  const W = stage.clientWidth, H = stage.clientHeight, r = 1000/1240;
  const w = Math.max(0, Math.min(W, H*r));
  svg.style.width = w + "px"; svg.style.height = (w/r) + "px";
}
new ResizeObserver(fit).observe(stage); addEventListener("resize", fit);

/* ---------------- our time ---------------- */
const START = (() => {
  const [y,m,d] = CONFIG.firstDate.split("-").map(Number);
  const [hh,mm] = (CONFIG.firstTime || "00:00").split(":").map(Number);
  return new Date(y, m-1, d, hh||0, mm||0, 0);
})();
function since(now){
  let y=now.getFullYear()-START.getFullYear(), mo=now.getMonth()-START.getMonth(), d=now.getDate()-START.getDate(),
      h=now.getHours()-START.getHours(), mi=now.getMinutes()-START.getMinutes(), s=now.getSeconds()-START.getSeconds();
  if (s<0){s+=60;mi--} if (mi<0){mi+=60;h--} if (h<0){h+=24;d--}
  if (d<0){d+=new Date(now.getFullYear(),now.getMonth(),0).getDate();mo--}
  if (mo<0){mo+=12;y--}
  return {y,mo,d,h,mi,s};
}
function nextAnniversary(now){
  let k = Math.max(1, now.getFullYear()-START.getFullYear());
  const mk = k => new Date(START.getFullYear()+k, START.getMonth(), START.getDate(), START.getHours(), START.getMinutes(), 0);
  while (mk(k) <= now) k++;
  return {k, t: mk(k)};
}
const ord = n => n + (["th","st","nd","rd"][(n%100>10&&n%100<14)?0:Math.min(n%10,4)%4] || "th");
function clockData(){
  const now = new Date(), s = since(now), nx = nextAnniversary(now);
  const ms = nx.t - now, cd = {d:Math.floor(ms/864e5), h:Math.floor(ms%864e5/36e5), m:Math.floor(ms%36e5/6e4), s:Math.floor(ms%6e4/1e3)};
  const days = Math.floor((now-START)/864e5);
  const isDay = now.getFullYear()>START.getFullYear() && now.getMonth()===START.getMonth() && now.getDate()===START.getDate();
  return {now,s,nx,cd,days,isDay};
}
function tick(){
  const c = clockData(), n = c.now;
  const hh = $("#hH"), mm = $("#hM"), ss = $("#hS");
  if (hh){
    hh.setAttribute("transform", `rotate(${((n.getHours()%12)+n.getMinutes()/60)*30})`);
    mm.setAttribute("transform", `rotate(${(n.getMinutes()+n.getSeconds()/60)*6})`);
    ss.setAttribute("transform", `rotate(${n.getSeconds()*6})`);
  }
  const s = c.s;
  $("#timeBtn").textContent = `♡ ${c.days} days ${pad(s.h)}h ${pad(s.mi)}m ${pad(s.s)}s together`;
  if (modal.classList.contains("open") && sheet.classList.contains("clockmode")) renderClock(c);
}
function renderClock(c){
  const s = c.s, cell = (v,l) => `<div class="cell"><b>${v}</b><span>${l}</span></div>`;
  const cd = c.cd;
  const next = c.isDay
    ? `<small>Today</small><em>Happy ${ord(c.nx.k-1)} anniversary ♥</em>`
    : `<small>Until our ${ord(c.nx.k)} anniversary</small><strong>${cd.d}d ${pad(cd.h)}h ${pad(cd.m)}m ${pad(cd.s)}s</strong>`;
  $("#m-clock").innerHTML = `<div class="cgrid">${cell(s.y,"years")}${cell(s.mo,"months")}${cell(s.d,"days")}${cell(pad(s.h),"hours")}${cell(pad(s.mi),"minutes")}${cell(pad(s.s),"seconds")}</div>
    <div style="text-align:center;font-family:var(--serif);font-size:1.05rem;color:#6b4a1c">${c.days.toLocaleString()} days since it all began</div>
    <div class="cd">${next}</div>`;
}

/* ---------------- start ---------------- */
svg.innerHTML = buildScene(); fit();
$("#tNames").textContent = `${CONFIG.yourName} & ${CONFIG.herName}`;
$("#soundNote").textContent = CONFIG.music ? "Best with sound 🎧 Music starts when you enter." : "";

/* ---------------- modal ---------------- */
const modal = $("#modal"), sheet = $("#sheet"); let lastFocus = null;
const posCss = {top:"center top", center:"center", bottom:"center bottom"};
function resetSheet(){
  sheet.classList.remove("letter","clockmode"); stopType(); stopVideo(); $("#nav").hidden = true; $("#againBox").hidden = true;
  $("#m-clock").style.display = "none"; $("#m-story").style.display = "";
  $("#m-pic").style.display = "flex"; $("#m-pic").style.removeProperty("--img");
}
function openMemory(m, trigger){
  lastFocus = trigger; resetSheet();
  const pic = $("#m-pic");
  if (m.img){ pic.textContent = ""; pic.style.setProperty("--img", `url("${m.img}")`); pic.style.backgroundPosition = posCss[m.pos] || "center";
    const t = new Image(); t.onerror = () => { pic.style.removeProperty("--img"); pic.textContent = "Photo not found: " + decodeURI(m.img); }; t.src = m.img; }
  else pic.textContent = m.future ? "Reserved" : "Your photo goes here";
  if (m.video) mountVideo(pic, m);
  $("#m-num").textContent = m.num; $("#m-title").textContent = m.title;
  $("#m-date").textContent = m.date; $("#m-story").textContent = m.story; cur = MEMORIES.indexOf(m); $("#nav").hidden = false; $("#navCount").textContent = `${cur+1} / ${MEMORIES.length}`; show();
}
function openLetter(){
  const env = $("#env"); lastFocus = env; env.classList.add("seen"); resetSheet(); sheet.classList.add("letter");
  $("#m-pic").style.display = "none"; $("#m-num").textContent = "A LETTER";
  $("#m-title").textContent = CONFIG.letterTitle; $("#m-date").textContent = CONFIG.anniversaryDate;
  typeText($("#m-story"), letterText()); show(); hearts(.5,.55);
}
function openClock(trigger){
  lastFocus = trigger || $("#clock"); resetSheet(); sheet.classList.add("letter","clockmode");
  $("#m-pic").style.display = "none"; $("#m-story").style.display = "none"; $("#m-clock").style.display = "block";
  $("#m-num").textContent = "OUR TIME TOGETHER"; $("#m-title").textContent = "Since the first date";
  $("#m-date").textContent = new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"long",year:"numeric"}).format(START);
  renderClock(clockData()); show();
}
function show(){ modal.classList.add("open"); setBg(true); sheet.scrollTop = 0; setTimeout(() => $("#close").focus(), 60); }
function hide(){ modal.classList.remove("open"); stopType(); stopVideo(); setBg(false); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
$("#close").onclick = hide;
modal.addEventListener("click", e => { if (e.target === modal) hide(); });
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (modal.classList.contains("open")) hide(); else if ($("#list").classList.contains("open")) closeList();
});
const bindBtn = (el, fn) => {
  el.addEventListener("click", fn);
  el.addEventListener("keydown", e => { if (e.key==="Enter" || e.key===" "){ e.preventDefault(); fn(); } });
};
svg.querySelectorAll(".fh").forEach(el => bindBtn(el, () => openMemory(MEMORIES[+el.dataset.i], el)));
bindBtn($("#env"), openLetter);
bindBtn($("#clock"), () => openClock($("#clock")));
$("#timeBtn").onclick = () => openClock($("#timeBtn"));

{ const c = clockData(); if (c.days > 0) $("#tStub").innerHTML = `Day<br><b style="font-size:1.7rem">${c.days}</b>`; }
tick(); setInterval(tick, 1000);

/* ---------------- music ---------------- */
const bgm = $("#bgm"), mb = $("#musicBtn");
let musicOn = false;
function setMusicUI(label){
  mb.textContent = label || (musicOn ? "♪ Music on" : "♪ Music off");
  mb.setAttribute("aria-pressed", String(musicOn));
}
async function playMusic(){
  try { await bgm.play(); musicOn = true; setMusicUI(); }
  catch (e) { musicOn = false; setMusicUI(bgm.error ? "♪ Audio file not found" : "♪ Tap to play music"); }
}
function pauseMusic(){ bgm.pause(); musicOn = false; setMusicUI(); }
if (CONFIG.music){
  bgm.src = encodeURI(CONFIG.music);
  bgm.loop = true; bgm.volume = CONFIG.musicVolume ?? 0.6;
  bgm.addEventListener("error", () => { musicOn = false; setMusicUI("♪ Audio file not found"); });
} else {
  mb.style.display = "none";
}
mb.onclick = () => musicOn ? pauseMusic() : playMusic();

/* ---------------- enter, light up ---------------- */
$("#enter").onclick = () => {
  if (CONFIG.music) playMusic();           /* the tap on "Enter" lets the browser start the music */
  $("#intro").classList.add("hide"); stage.classList.add("show");
  setTimeout(() => svg.classList.add("lit"), 400); $("#bar").classList.add("show");
};

/* ---------------- depth parallax (gentle) ---------------- */
const layers = [...svg.querySelectorAll(".layer")];
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
function shift(nx, ny){
  if (reduce) return;
  layers.forEach(l => { const d = +l.dataset.d; l.style.transform = `translate(${(-nx*d).toFixed(2)}px,${(-ny*d*.6).toFixed(2)}px)`; });
}
stage.addEventListener("pointermove", e => {
  const r = svg.getBoundingClientRect();
  shift((e.clientX-r.left)/r.width-.5, (e.clientY-r.top)/r.height-.5);
});
stage.addEventListener("pointerleave", () => shift(0,0));
addEventListener("deviceorientation", e => {
  if (e.gamma == null || e.beta == null) return;
  shift(Math.max(-1,Math.min(1,e.gamma/30))*.5, Math.max(-1,Math.min(1,(e.beta-45)/30))*.5);
});

/* ---------------- list view ---------------- */
function openList(){
  const box = $("#listItems"); box.innerHTML = "";
  const add = (title, meta, text, img) => {
    const a = document.createElement("article");
    const t = document.createElement("div"); t.className = "thumb"; if (img) t.style.setProperty("--img", `url("${img}")`);
    const d = document.createElement("div");
    const h = document.createElement("h3"); h.textContent = title;
    const s = document.createElement("small"); s.textContent = meta;
    const p = document.createElement("p"); p.textContent = text;
    d.append(h, s, p); a.append(t, d); box.appendChild(a);
  };
  MEMORIES.forEach(m => add(m.title, `${m.num} · ${m.date}`, m.story, m.img));
  add(CONFIG.letterTitle, "A letter", letterText(), "");
  $("#list").classList.add("open"); setBg(true); $("#listClose").focus();
}
function closeList(){ $("#list").classList.remove("open"); setBg(false); $("#listBtn").focus(); }
$("#listBtn").onclick = openList; $("#listClose").onclick = closeList;


/* =====================================================================
   ADDITIONS: celebrations, secret gate, reasons, exhibit navigation
   ===================================================================== */
const calm = () => matchMedia("(prefers-reduced-motion:reduce)").matches;
const COL = ["#f0d68e","#e8505f","#f4ebdd","#b68a45"];
const hasConf = () => typeof confetti === "function" && !calm();
function hearts(x, y){
  if (!hasConf()) return;
  const o = {particleCount:16, spread:80, startVelocity:24, scalar:1.5, origin:{x,y}, colors:COL, zIndex:100, ticks:120};
  if (confetti.shapeFromText) o.shapes = ["#e8505f","#f0d68e"].map(color => confetti.shapeFromText({text:"♥", scalar:1.5, color}));
  confetti(o);
}
function party(){
  if (!hasConf()) return;
  const end = Date.now() + 1600;
  (function f(){
    [[60,0],[120,1]].forEach(([angle,x]) => confetti({particleCount:3, angle, spread:62, origin:{x,y:.85}, colors:COL, zIndex:100}));
    if (Date.now() < end) requestAnimationFrame(f);
  })();
  hearts(.5,.5);
}
function setBg(on){ stage.inert = on; $("#bar").inert = on; }

/* typewriter */
let typeTimer = 0;
function stopType(){ clearInterval(typeTimer); $("#m-story").onclick = null; }
function typeText(el, text){
  stopType(); el.textContent = "";
  if (calm()){ el.textContent = text; return; }
  const a = document.createElement("span"), b = document.createElement("span");
  b.className = "ghost"; b.textContent = text; el.append(a, b);
  let i = 0;
  const done = () => { stopType(); el.textContent = text; };
  el.onclick = done;
  typeTimer = setInterval(() => { i += 2; if (i >= text.length) return done(); a.textContent = text.slice(0,i); b.textContent = text.slice(i); }, 28);
}

/* previous / next exhibit */
let cur = 0;
function go(d){ cur = (cur + d + MEMORIES.length) % MEMORIES.length; openMemory(MEMORIES[cur], lastFocus); }
$("#prev").onclick = () => go(-1); $("#next").onclick = () => go(1);
document.addEventListener("keydown", e => {
  if (!modal.classList.contains("open") || $("#nav").hidden) return;
  if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1);
});
let sx = null;
sheet.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, {passive:true});
sheet.addEventListener("touchend", e => {
  if (sx == null || $("#nav").hidden) return;
  const dx = e.changedTouches[0].clientX - sx; sx = null;
  if (Math.abs(dx) > 70) go(dx < 0 ? 1 : -1);
});

/* reasons */
let lastReason = -1;
function openReason(fromButton){
  const R = CONFIG.reasons; if (!R || !R.length) return;
  if (fromButton) lastFocus = $("#reasonBtn");
  resetSheet(); sheet.classList.add("letter"); $("#m-pic").style.display = "none";
  let n; do { n = Math.floor(Math.random()*R.length); } while (R.length > 1 && n === lastReason);
  lastReason = n;
  $("#m-num").textContent = `REASON ${n+1} OF ${R.length}`; $("#m-title").textContent = "Why I love you"; $("#m-date").textContent = "";
  typeText($("#m-story"), R[n]); $("#againBox").hidden = false; show(); hearts(.5,.6);
}
if (CONFIG.reasons && CONFIG.reasons.length) { $("#reasonBtn").onclick = () => openReason(true); $("#again").onclick = () => openReason(false); }
else $("#reasonBtn").hidden = true;

/* secret question on the ticket */
{
  const G = CONFIG.gate;
  if (G && G.question && G.answers && G.answers.length){
    const f = $("#gateForm"), norm = s => s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    $("#enter").hidden = true; f.hidden = false; $("#gateQ").textContent = G.question;
    f.addEventListener("submit", e => {
      e.preventDefault();
      if (G.answers.some(a => norm(a) === norm($("#gateIn").value))){
        f.hidden = true; $("#enter").hidden = false; $("#enter").focus(); hearts(.5,.5);
      } else {
        $("#gateErr").textContent = G.hint || "Not quite. Try again.";
        f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake");
      }
    });
  }
}

/* celebrations */
$("#enter").addEventListener("click", () => {
  if (typeof DeviceOrientationEvent !== "undefined" && DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().catch(() => {});
  setTimeout(party, 1100);
});
$("#clock").addEventListener("click", e => hearts(e.clientX/innerWidth, e.clientY/innerHeight));
let wasDay = clockData().isDay;
setInterval(() => { const d = clockData().isDay; if (d && !wasDay && stage.classList.contains("show")) party(); wasDay = d; }, 1000);

/* golden dust floating through the light */
(() => {
  if (calm()) return;
  const cv = $("#dust"), cx = cv.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2);
  let W, H, P = [];
  const size = () => {
    W = cv.width = innerWidth*dpr; H = cv.height = innerHeight*dpr;
    P = Array.from({length: Math.round(innerWidth/24)}, () => ({x:Math.random()*W, y:Math.random()*H, r:(Math.random()*1.5+.4)*dpr, v:(Math.random()*.25+.08)*dpr, a:Math.random()*6.28}));
  };
  size(); addEventListener("resize", size);
  (function f(t){
    cx.clearRect(0,0,W,H); cx.fillStyle = "#f0d68e";
    for (const p of P){
      p.y -= p.v; p.x += Math.sin(t/2200 + p.a)*.25*dpr;
      if (p.y < -5){ p.y = H+5; p.x = Math.random()*W; }
      cx.globalAlpha = .22 + .22*Math.sin(t/900 + p.a);
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
    }
    requestAnimationFrame(f);
  })(0);
})();


/* video inside an exhibit: add  video:"video/our-video.mp4"  to any memory in config.js */
let resumeMusic = false;
function mountVideo(pic, m){
  pic.textContent = ""; pic.style.removeProperty("--img");
  const v = document.createElement("video");
  v.src = new URL(encodeURI(String(m.video).trim()), document.baseURI).href;
  v.controls = true; v.playsInline = true; v.preload = "metadata";
  if (m.img) v.poster = m.img;
  v.style.cssText = "width:100%;height:100%;max-height:70vh;object-fit:contain;background:#000";
  v.onplay = () => { if (musicOn){ resumeMusic = true; pauseMusic(); } };
  v.onerror = () => { v.remove(); pic.textContent = "Video not found: " + m.video; };
  pic.append(v); v.play().catch(() => {});
}
function stopVideo(){
  const v = document.querySelector("#m-pic video"); if (v){ v.pause(); v.remove(); }
  if (resumeMusic){ resumeMusic = false; playMusic(); }
}

/* video exhibits with no img: show the video's first frame on the wall frame */
MEMORIES.forEach((m, i) => {
  if (!m.video || m.img) return;
  const g = document.querySelector(`#cp${i}`)?.nextElementSibling; if (!g) return;
  const al = {top:"xMidYMin", center:"xMidYMid", bottom:"xMidYMax"}[m.pos] || "xMidYMid";
  const tone = CONFIG.photoTone === "warm" ? ' filter="url(#toneWarm)"' : CONFIG.photoTone === "bw" ? ' filter="url(#toneBW)"' : "";
  const v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.preload = "auto";
  v.src = new URL(encodeURI(String(m.video).trim()), document.baseURI).href;
  v.addEventListener("loadedmetadata", () => { v.currentTime = Math.min(0.1, (v.duration || 1) / 2); });
  v.addEventListener("seeked", () => {
    const ref = g.children[g.children.length - 2];
    try {
      const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
      c.getContext("2d").drawImage(v, 0, 0);
      m.img = c.toDataURL("image/jpeg", 0.85);
      ref.insertAdjacentHTML("beforebegin", `<image href="${m.img}" x="${-m.w/2}" y="${-m.h/2}" width="${m.w}" height="${m.h}" preserveAspectRatio="${al} slice"${tone}/>`);
    } catch (err) {
      /* opened from a local file: the browser blocks reading pixels, so show the video itself */
      const fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
      fo.setAttribute("x", -m.w/2); fo.setAttribute("y", -m.h/2); fo.setAttribute("width", m.w); fo.setAttribute("height", m.h);
      fo.style.pointerEvents = "none";
      v.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;pointer-events:none";
      fo.append(v); g.insertBefore(fo, ref);
    }
  }, {once: true});
});