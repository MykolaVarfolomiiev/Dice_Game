const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
const xss = require('xss');
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const io = socketio(server);
//Time interval 10s
const TIME_INTERVAL_MS = 10000;
const pending = new Set();


function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function playersArray() {
  return Array.from(players.values());
}

const players = new Map();
let lastRound = null;
let phase = "guessing";
let roundEndsAt = Date.now() + TIME_INTERVAL_MS;

function broadcastState() {
  io.emit("state", { players: playersArray(), lastRound, phase, roundEndsAt });
}

function startGame() {
  phase = "guessing";
  roundEndsAt = Date.now() + TIME_INTERVAL_MS;

  players.forEach((p) => {
    p.active = false;
    p.guessSum = 0;
  })

  broadcastState();

  setTimeout(() => {
    rollPhase();
    startGame();
  }, TIME_INTERVAL_MS);
}

function rollPhase() {
  phase = "rolling";

  const activePlayers = playersArray().filter((p) => p.active);
  const d1 = rollDie();
  const d2 = rollDie();
  const sum = d1 + d2;


  activePlayers.forEach(p => {
    p.roundsPlayed += 1;
  });

  const winners = [];
  activePlayers.forEach((p) => {
    if (p.guessSum === sum) {
      p.wins += 1;
      winners.push(p.id);
    }
  });

  lastRound = { d1, d2, sum, winners, time: Date.now() };

  io.emit("roundResult", lastRound);
  broadcastState();
}

startGame()

// Broadcast state every second to update the countdown
setInterval(() => {
  broadcastState();
}, 1000);


io.on("connection", (socket) => {
  const player = {
    id: socket.id,
    name: `Player-${socket.id.slice(-4)}`,
    guessSum: 0,
    roundsPlayed: 0,
    active: false,
    wins: 0
  };

  pending.add(socket.id);

  socket.emit("state", { players: playersArray(), lastRound, phase, roundEndsAt });
  broadcastState();

  socket.on("setName", (name) => {
    const rawName = String(name ?? "").trim();
    if (!rawName) return;

    const sanitizedName = xss(rawName);

    pending.delete(socket.id);

    let p = players.get(socket.id);
    if (!p) {
      p = {
        id: socket.id,
        name: sanitizedName,
        guessSum: 0,
        active: false,
        wins: 0,
        roundsPlayed: 0
      };
      players.set(socket.id, p);
    } else {
      p.name = sanitizedName;
    }

    broadcastState();
  });

  socket.on("setGuessSum", (guessSum) => {
    const p = players.get(socket.id);
    if (!p) return;

    if (phase !== "guessing") return;

    const n = Number(guessSum);
    if (!Number.isInteger(n) || n < 2 || n > 12) return;

    p.guessSum = n;
    broadcastState();
  });

  socket.on("joinRound", () => {
    const p = players.get(socket.id);
    if (!p) return;

    if (phase !== "guessing") return;

    if (!Number.isInteger(p.guessSum) || p.guessSum < 2 || p.guessSum > 12) return;

    p.active = true;
    broadcastState();
  });

  socket.on("leaveGame", () => {
    players.delete(socket.id);
    pending.add(socket.id);
    broadcastState();
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    pending.delete(socket.id);
    broadcastState();
  });
});

server.listen(PORT, () => console.log(`Running: http://localhost:${PORT}`));