const STAGES = ["spark","manifesto","due-diligence","specs","build",
                "testing","live","evolving","inactive","inert"];

function freshness(d){
  if(!d) return {label:"no repo", cls:"none"};
  const days = (Date.now() - new Date(d)) / 86400000;
  if(days < 14) return {label:"fresh",  cls:"fresh"};
  if(days < 60) return {label:"recent", cls:"recent"};
  return {label:"stale", cls:"stale"};
}

async function main(){
  const data = await (await fetch("projects.json")).json();
  const board = document.getElementById("board");
  for(const stage of STAGES){
    const items = data.filter(p => (p.stage || "").toLowerCase() === stage);
    if(!items.length) continue;
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `<h2>${stage}</h2>`;
    for(const p of items){
      const fr = freshness(p.last_commit_date);
      const chips = ["energy_focus","energy_motivation","energy_scope"]
        .filter(k => p[k]).map(k => `<span class="chip">${p[k]}</span>`).join("");
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="id">${p.id || ""}</div>
        <div class="name">${p.name || ""}</div>
        <div class="chips">${chips}</div>
        <div class="meta"><span class="fresh ${fr.cls}">${fr.label}</span>${
          p.branch ? ` · <code>${p.branch}</code>` : ""}${
          p.last_commit_date ? ` · ${p.last_commit_date}` : ""}</div>`;
      col.appendChild(card);
    }
    board.appendChild(col);
  }
}
main();
