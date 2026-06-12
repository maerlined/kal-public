/* ===== kaleidoscope · project observatory ===== */

const CATEGORIES = [
  { slug:"experimentation", label:"Fun Experimentation" },
  { slug:"tools",           label:"Tools & Useful Stuff" },
  { slug:"creative",        label:"Creative Work" },
  { slug:"other",           label:"Other" },
];

const STAGES = ["spark","manifesto","due diligence","specs","build",
                "testing","live","evolving","inactive","inert"];
const DEAD = new Set(["inactive","inert"]);

// each scale's 3-point spectrum, ordered activating -> neutral -> draining
const SCALES = [
  { key:"energy_focus",      label:"Focus",   vals:["random","fragmented","immersive"] },
  { key:"energy_motivation", label:"Motiv.",  vals:["whimsy","stack","business"] },
  { key:"energy_scope",      label:"Scope",   vals:["creative","productive","technical"] },
  { key:"energy_exposure",   label:"Exposure",vals:["private","public","broadcast"] },
  { key:"energy_cost",       label:"Cost",    vals:["rewarding","balanced","tedious"] },
];
const POS = [{left:"8%",  c:"var(--act)"},
             {left:"50%", c:"var(--neu)"},
             {left:"92%", c:"var(--dra)"}];

const esc = s => (s||"").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function segs(stage){
  const idx = STAGES.indexOf((stage||"").toLowerCase());
  const dead = DEAD.has((stage||"").toLowerCase());
  let html = "";
  for(let i=0;i<STAGES.length;i++){
    let cls = "seg";
    if(idx>=0 && i<=idx) cls += dead ? " dead" : " on";
    if(i===idx) cls += dead ? " dead" : " cur";
    html += `<span class="${cls}" style="--s:${i}"></span>`;
  }
  const pos = idx>=0 ? `${idx+1} / ${STAGES.length}` : "—";
  return { html, label:(stage||"unknown"), pos };
}

function energyRows(p){
  return SCALES.map(s=>{
    const v = p[s.key];
    const i = s.vals.indexOf(v);
    if(i<0) return `<div class="escale blank"><span class="elabel">${s.label}</span>
      <div style="display:flex;align-items:center"><span class="etrack"><span class="edot" style="left:50%;background:var(--faint)"></span></span><span class="evalue">—</span></div></div>`;
    return `<div class="escale"><span class="elabel">${s.label}</span>
      <div style="display:flex;align-items:center">
        <span class="etrack"><span class="edot" style="left:${POS[i].left};background:${POS[i].c};box-shadow:0 0 10px -1px ${POS[i].c}"></span></span>
        <span class="evalue">${esc(v)}</span>
      </div></div>`;
  }).join("");
}

function projectEl(p, i){
  const s = segs(p.stage);
  const el = document.createElement("article");
  el.className = "proj";
  el.style.setProperty("--i", i);

  const chips = [p.type, p.domain].filter(Boolean)
    .map(c=>`<span class="chip">${esc(c)}</span>`).join("");

  const gitline = p.last_commit_date
    ? `<span>last commit <b>${esc(p.last_commit_date)}</b></span>${p.branch?`<span>on <b>${esc(p.branch)}</b></span>`:""}`
    : `<span>no local repo</span>`;
  const lastwork = p.last_work
    ? `<p class="lw-line">${esc(p.last_work)}</p>` : `<p class="lw-line" style="color:var(--mut)">No manual note yet.</p>`;

  const links = [
    p.manifesto_url   ? `<a href="${esc(p.manifesto_url)}" target="_blank" rel="noopener">manifesto ↗</a>`:"",
    p.kaleidoscope_url? `<a href="${esc(p.kaleidoscope_url)}" target="_blank" rel="noopener">project board ↗</a>`:"",
  ].join("");

  el.innerHTML = `
    <div class="proj-head" role="button" tabindex="0" aria-expanded="false">
      <div class="card">
        <p class="name">${esc(p.name||p.id||"untitled")}</p>
        <div class="meta-row"><span class="pid">${esc(p.id||"")}</span>${chips}</div>
        ${p.flavour?`<p class="flav">“${esc(p.flavour)}”</p>`:""}
      </div>
      <div class="progress">
        <div class="segs">${s.html}</div>
        <div class="stage-row"><span class="stg">${esc(s.label)}</span><span class="pos">${s.pos}</span></div>
      </div>
      <div class="chev"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
    </div>
    <div class="detail">
      <div class="detail-in"><div class="detail-grid">
        <div>
          <h3>Context</h3>
          <p class="ctx">${esc(p.context)||"<span style='color:var(--mut)'>No context written yet.</span>"}</p>
          <h3>Last work</h3>
          <div class="lastwork">${lastwork}<div class="lw-git">${gitline}</div></div>
          <div class="links">${links}</div>
        </div>
        <div>
          <h3>Energy</h3>
          <div class="energy">${energyRows(p)}</div>
          <div class="energy-legend">
            <span class="ek ek-act">activating</span>
            <span class="ek ek-neu">neutral</span>
            <span class="ek ek-dra">draining</span>
          </div>
        </div>
      </div></div>
    </div>`;

  const head = el.querySelector(".proj-head");
  const toggle = ()=>{
    const open = el.classList.toggle("open");
    head.setAttribute("aria-expanded", open ? "true":"false");
  };
  head.addEventListener("click", toggle);
  head.addEventListener("keydown", e=>{
    if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggle(); }
  });
  return el;
}

async function main(){
  let data;
  try{ data = await (await fetch("projects.json",{cache:"no-store"})).json(); }
  catch(e){ document.getElementById("board").innerHTML =
    `<p style="color:var(--mut);padding:40px 0">Could not load projects.json.</p>`; return; }

  const board = document.getElementById("board");
  let i = 0;
  for(const cat of CATEGORIES){
    const items = data.filter(p => (p.category||"other") === cat.slug);
    if(!items.length) continue;
    const sec = document.createElement("section");
    sec.className = "cat"; sec.dataset.cat = cat.slug;
    sec.innerHTML = `<div class="cat-head">
        <span class="glyph"></span>
        <h2>${cat.label}</h2>
        <span class="n">${items.length}</span>
        <span class="rule"></span>
      </div>`;
    items.forEach(p => sec.appendChild(projectEl(p, i++)));
    board.appendChild(sec);
  }

  const dates = data.map(p=>p.last_commit_date).filter(Boolean).sort();
  const latest = dates[dates.length-1];
  if(latest) document.getElementById("updated").textContent = `latest activity · ${latest}`;
  document.getElementById("count").textContent = `${data.length} projects tracked`;
}
main();
