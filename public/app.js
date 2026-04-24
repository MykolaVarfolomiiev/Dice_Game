const socket = io();

const q = selector => { return document.querySelector(selector); }
const logo = q("#logo")
const userDiv = q("#user")
const gameDiv = q("#gameBody")
const gameLayout = q("#gameLayout")
const scoreDiv = q("#scoreboardWrapper")
const rulesDiv = q("#rules")
const titleElm = q("#title");
const playersOnline = q("#title2");
const countdown = q("#countdown")
const playersElm = q("#players");
const roundElm = q("#lastRound");
const guessBtn = q("#myGuessBtn");
const scoreBoard = q("#scoreboard")

const img1 = q(".img1");
const img2 = q(".img2");

const sumSelect = q("#sumSelect");
const rollBtn = q("#rollBtn");

const nameInput = q("#nameInput");
const saveNameBtn = q("#saveNameBtn");

let myId = null;
let latestState = null;
let joined = false;

const placeholder = document.createElement("option");
placeholder.value = "";
placeholder.textContent = "--";
sumSelect.appendChild(placeholder);

for (let s = 2; s <= 12; s++) {
  const opt = document.createElement("option");
  opt.value = String(s);
  opt.textContent = String(s);
  sumSelect.appendChild(opt);
}

guessBtn.addEventListener("click", () => {
  socket.emit("joinRound");
});

function renderPlayers(players) {
  const sorted = [...players].sort((a, b) => (b.id === myId) - (a.id === myId));

  playersElm.innerHTML = sorted.map(p => {
    const isMe = p.id === myId;
    return `
    <div class="card">
      <div class="bold">${p.name}${p.id === socket.id ? " (you)" : ""}</div>
      <div class="small">Current Guess: <span class="bold">${p.guessSum}</span></div>
      <div class="small">Total rounds: <span class="bold">${p.roundsPlayed}</span></div>
      <div class="small">Wins: <span class="bold">${p.wins}</span></div>
      <br/>
      <div class="small">Status: ${p.active ? "🟢 Joined this round" : "⚪ Not joined"}</div>
      ${isMe ? `<button class="leaveBtn">Leave Game</button>` : ``}
    </div>
  `;
  }).join("");
}

function renderScoreboard(players) {
  const sorted = [...players].sort((a, b) => b.wins - a.wins);

  scoreBoard.innerHTML = `
  <div class="card">
  ${sorted.map((p, i) => `
      <strong>#${i + 1} ${p.name}</strong>
      <div class="small">Wins: <span class="bold">${p.wins}</span></div>
      `).join("")}
  </div>`
}

function renderRound(round) {
  img1.src = `images/dice${round.d1}.png`;
  img2.src = `images/dice${round.d2}.png`;
}

function renderState(state) {
  latestState = state;

  const me = state.players.find(p => p.id === socket.id);
  const inGame = !!me;

  titleElm.textContent = "Dice Sum Guessing Game";
  playersOnline.textContent = `Players online: (${state.players.length})`;

  if (inGame) {
    const msLeft = state.roundEndsAt - Date.now();
    const secLeft = Math.max(0, Math.ceil(msLeft / 1000));
    countdown.textContent = `Round ends in: ${secLeft}s`;
    countdown.classList.remove("hide");
    gameDiv.classList.remove("hide");
    gameLayout.classList.remove("hide");
    scoreDiv.classList.remove("hide");
    rulesDiv.classList.add("hide");
    userDiv.classList.add("hide");
    logo.classList.add("hide")
  } else {
    countdown.classList.add("hide");
    gameDiv.classList.add("hide");
    gameLayout.classList.add("hide");
    scoreDiv.classList.add("hide");
  }

  const guessing = state.phase === "guessing";
  sumSelect.disabled = !guessing || !inGame;
  guessBtn.disabled = !guessing || !inGame;

  if (me.guessSum >= 2 && me.guessSum <= 12) {
    sumSelect.value = String(me.guessSum);
  } else {
    sumSelect.value = "";
  }

  if (!inGame) {
    joined = false;
    countdown.classList.add("hide");
    gameDiv.classList.add("hide");
    gameLayout.classList.add("hide");
    scoreDiv.classList.add("hide");
    rulesDiv.classList.remove("hide");
    userDiv.classList.remove("hide");
  }

  renderPlayers(state.players);
  renderScoreboard(state.players);
  renderRound(state.lastRound);
}

socket.on("connect", () => {
  myId = socket.id;
  titleElm.textContent = "Connected";
});

socket.on("state", renderState);

sumSelect.addEventListener("change", () => {
  socket.emit("setGuessSum", Number(sumSelect.value));
});

saveNameBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) {
    titleElm.textContent = "Please enter your name to join.";
    return;
  }

  socket.emit("setName", name);

  joined = true;

  userDiv.classList.add("hide");
  rulesDiv.classList.add("hide")
  gameDiv.classList.remove("hide");
  countdown.classList.remove("hide");
});

playersElm.addEventListener("click", (e) => {
  const btn = e.target.closest(".leaveBtn");
  if (!btn) return;

  socket.emit("leaveGame");

  joined = false;
  rulesDiv.classList.remove("hide");
  userDiv.classList.remove("hide");
  gameDiv.classList.add("hide");
  countdown.classList.add("hide");
  logo.classList.remove("hide");

  nameInput.value = "";
});
