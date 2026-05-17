const sprite = document.querySelector("#sprite");
const bubble = document.querySelector("#bubble");
const summary = document.querySelector("#summary");
const agentList = document.querySelector("#agent-list");

const rowByAnimation = new Map();
let activeAnimation = "idle";
let frame = 0;
let pet = {
  cellWidth: 192,
  cellHeight: 208,
  columns: 8,
  rows: 9,
  scale: 1.35,
};

async function loadPetPackage() {
  const response = await fetch("/api/pet", { cache: "no-store" });
  pet = await response.json();
  sprite.style.setProperty("--spritesheet-url", `url("${pet.spritesheetUrl}")`);
  sprite.style.setProperty("--cell-width", `${pet.cellWidth}px`);
  sprite.style.setProperty("--cell-height", `${pet.cellHeight}px`);
  sprite.style.setProperty("--sheet-width", `${pet.cellWidth * pet.columns}px`);
  sprite.style.setProperty("--sheet-height", `${pet.cellHeight * pet.rows}px`);
  sprite.style.setProperty("--pet-scale", pet.scale);
  rowByAnimation.clear();
  for (const state of pet.mapping ?? []) {
    rowByAnimation.set(state.state, state);
  }
}

function setAnimation(animation) {
  activeAnimation = rowByAnimation.has(animation) ? animation : "idle";
  frame = 0;
}

function tickSprite() {
  const state = rowByAnimation.get(activeAnimation) ?? rowByAnimation.get("idle");
  const x = -pet.cellWidth * frame;
  const y = -pet.cellHeight * state.row;
  sprite.style.backgroundPosition = `${x}px ${y}px`;
  frame = (frame + 1) % state.frames;
}

function strongestPet(pets) {
  return pets.find((pet) => pet.priority === "urgent")
    ?? pets.find((pet) => pet.phase === "running")
    ?? pets[0];
}

function renderAgents(pets) {
  agentList.innerHTML = "";
  for (const pet of pets) {
    const progress = pet.progress ?? (pet.phase === "done" ? 100 : 0);
    const item = document.createElement("article");
    item.className = `agent ${pet.phase}`;
    item.innerHTML = `
      <div class="agent-head">
        <span class="agent-name">${pet.agent}</span>
        <span class="phase">${pet.phase.replace("_", " ")}</span>
      </div>
      <div class="integration">${pet.integration ?? "status file"}</div>
      <p class="agent-title"></p>
      <div class="meter" aria-label="${pet.agent} progress">
        <span style="--progress: ${progress}%"></span>
      </div>
    `;
    item.querySelector(".agent-title").textContent = pet.message;
    agentList.append(item);
  }
}

async function refresh() {
  const response = await fetch("/api/status", { cache: "no-store" });
  const payload = await response.json();
  const pets = payload.pets ?? [];
  const active = strongestPet(pets);

  summary.textContent = payload.attentionCount > 0
    ? `${payload.attentionCount} agent needs attention`
    : `${pets.length} agents connected`;

  if (active) {
    if (active.animation !== activeAnimation) {
      setAnimation(active.animation);
    }
    bubble.textContent = active.message;
    bubble.classList.toggle("urgent", active.priority === "urgent");
  }

  renderAgents(pets);
}

await loadPetPackage();
setAnimation("idle");
setInterval(tickSprite, 130);
await refresh();
setInterval(refresh, 1500);
