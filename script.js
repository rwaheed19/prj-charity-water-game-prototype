const screens = {
  title: document.getElementById("title-screen"),
  mission: document.getElementById("mission-screen"),
  game: document.getElementById("game-screen"),
  results: document.getElementById("results-screen")
};

const startBtn = document.getElementById("startBtn");
const missionBackBtn = document.getElementById("missionBackBtn");
const difficultyButtons = document.querySelectorAll(".difficultyBtn");
const river = document.getElementById("river");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const difficultyLabel = document.getElementById("difficultyLabel");
const healthEl = document.getElementById("health");
const healthBar = document.getElementById("healthBar");
const riverStatus = document.getElementById("riverStatus");
const feedback = document.getElementById("feedback");
const goalTrash = document.getElementById("goalTrash");
const achievementList = document.getElementById("achievementList");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const homeBtn = document.getElementById("homeBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const confettiLayer = document.getElementById("confettiLayer");

const difficultySettings = {
  basic: {
    label: "Easy",
    targetTrash: 20,
    targetScore: 200,
    seconds: 60,
    spawnMs: 900,
    obstacleChance: 0.14
  },
  medium: {
    label: "Medium",
    targetTrash: 30,
    targetScore: 300,
    seconds: 60,
    spawnMs: 780,
    obstacleChance: 0.24
  },
  hard: {
    label: "Hard",
    targetTrash: 40,
    targetScore: 400,
    seconds: 60,
    spawnMs: 650,
    obstacleChance: 0.34
  }
};

const trashItems = [
  { icon: "🥤", label: "plastic cup" },
  { icon: "🧴", label: "plastic bottle" },
  { icon: "🥫", label: "soda can" },
  { icon: "🛍️", label: "plastic bag" },
  { icon: "📦", label: "cardboard box" }
];

const obstacleItems = [
  { icon: "⚡", label: "lightning obstacle" },
  { icon: "☁️", label: "pollution cloud" },
  { icon: "🪨", label: "river rock" }
];

let score = 0;
let timeLeft = 60;
let riverHealth = 0;
let trashRemoved = 0;
let cleanStreak = 0;
let difficulty = "basic";
let gameTimer = null;
let spawnTimer = null;
let isPaused = false;
let gameActive = false;

function showScreen(screenName, focusTarget) {
  Object.values(screens).forEach((screen) => {
    screen.hidden = true;
    screen.classList.remove("active");
  });

  screens[screenName].hidden = false;
  screens[screenName].classList.add("active");
  screens[screenName].scrollTop = 0;
  window.scrollTo(0, 0);

  if (focusTarget) {
    requestAnimationFrame(() => focusTarget.focus());
  }
}

function selectDifficulty(level) {
  difficulty = level;
  startGame();
}

function startGame() {
  const settings = difficultySettings[difficulty];
  score = 0;
  timeLeft = settings.seconds;
  riverHealth = 0;
  trashRemoved = 0;
  cleanStreak = 0;
  isPaused = false;
  gameActive = true;

  clearTimers();
  clearItems();
  confettiLayer.innerHTML = "";
  pauseBtn.textContent = "Pause";
  pauseBtn.setAttribute("aria-pressed", "false");
  difficultyLabel.textContent = settings.label;
  goalTrash.textContent = `Remove ${settings.targetTrash} trash items`;
  feedback.textContent = "Choose trash items to begin cleaning.";
  updateAchievements();
  updateUI();
  showScreen("game", document.getElementById("game-heading"));

  gameTimer = window.setInterval(tick, 1000);
  spawnTimer = window.setInterval(spawnItem, settings.spawnMs);
  spawnItem();
  spawnItem();
}

function tick() {
  if (isPaused || !gameActive) {
    return;
  }

  timeLeft -= 1;
  updateUI();

  if (timeLeft <= 0) {
    endGame();
  }
}

function spawnItem() {
  if (isPaused || !gameActive) {
    return;
  }

  const settings = difficultySettings[difficulty];
  const isObstacle = Math.random() < settings.obstacleChance;
  const source = isObstacle ? obstacleItems : trashItems;
  const itemData = source[Math.floor(Math.random() * source.length)];
  const item = document.createElement("button");
  item.type = "button";
  item.className = `item ${isObstacle ? "bad" : "good"}`;
  item.textContent = itemData.icon;
  item.setAttribute("aria-label", isObstacle ? `Avoid ${itemData.label}. Penalty item.` : `Collect ${itemData.label}. Adds ten points.`);

  const size = Math.max(54, Math.min(74, river.clientWidth * 0.08));
  const maxLeft = Math.max(0, river.clientWidth - size - 10);
  const maxTop = Math.max(0, river.clientHeight - size - 10);
  item.style.left = `${Math.random() * maxLeft}px`;
  item.style.top = `${Math.random() * maxTop}px`;

  item.addEventListener("click", () => collectItem(item, isObstacle));
  river.appendChild(item);

  window.setTimeout(() => {
    if (item.isConnected) {
      item.remove();
    }
  }, 2400);
}

function collectItem(item, isObstacle) {
  if (isPaused || !gameActive) {
    return;
  }

  const left = item.offsetLeft + item.offsetWidth / 2;
  const top = item.offsetTop + item.offsetHeight / 2;

  if (isObstacle) {
    score = Math.max(0, score - 15);
    cleanStreak = 0;
    feedback.textContent = "Obstacle hit. 15 points lost.";
    showPoints("-15", left, top, false);
  } else {
    trashRemoved += 1;
    cleanStreak += 1;
    score += cleanStreak > 0 && cleanStreak % 5 === 0 ? 20 : 10;
    feedback.textContent = cleanStreak > 0 && cleanStreak % 5 === 0 ? "Clean streak! 20 bonus points." : "Trash removed. 10 points earned.";
    showPoints(cleanStreak > 0 && cleanStreak % 5 === 0 ? "+20" : "+10", left, top, true);
  }

  item.remove();
  updateUI();
  updateAchievements();

  if (trashRemoved >= difficultySettings[difficulty].targetTrash) {
    winGame();
  }
}

function showPoints(text, left, top, positive) {
  const pop = document.createElement("span");
  pop.className = `points-pop ${positive ? "good-pop" : ""}`;
  pop.textContent = text;
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
  river.appendChild(pop);
  window.setTimeout(() => pop.remove(), 720);
}

function updateUI() {
  const settings = difficultySettings[difficulty];
  riverHealth = Math.min(100, Math.round((trashRemoved / settings.targetTrash) * 100));
  scoreEl.textContent = score;
  timerEl.textContent = Math.max(0, timeLeft);
  healthEl.textContent = riverHealth;
  healthBar.style.width = `${riverHealth}%`;

  river.classList.remove("very-polluted", "improving", "clean");

  if (riverHealth >= 75) {
    river.classList.add("clean");
    riverStatus.textContent = "Crystal Clear";
  } else if (riverHealth >= 35) {
    river.classList.add("improving");
    riverStatus.textContent = "Improving";
  } else {
    river.classList.add("very-polluted");
    riverStatus.textContent = "Very Polluted";
  }
}

function updateAchievements() {
  const achievements = [
    cleanStreak >= 5 ? "Clean Streak unlocked" : "Clean Streak locked",
    timeLeft >= 30 && trashRemoved >= 10 ? "Fast Responder unlocked" : "Fast Responder locked",
    riverHealth >= 75 ? "River Restorer unlocked" : "River Restorer locked"
  ];

  achievementList.innerHTML = achievements.map((item) => `<li>${item}</li>`).join("");
}

function togglePause() {
  if (!gameActive) {
    return;
  }

  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
  pauseBtn.setAttribute("aria-pressed", String(isPaused));
  feedback.textContent = isPaused ? "Game paused. Press Resume when you are ready." : "Game resumed. Keep cleaning.";
  document.querySelectorAll(".item").forEach((item) => {
    item.disabled = isPaused;
    item.classList.toggle("paused", isPaused);
  });
}

function clearTimers() {
  window.clearInterval(gameTimer);
  window.clearInterval(spawnTimer);
  gameTimer = null;
  spawnTimer = null;
}

function clearItems() {
  river.querySelectorAll(".item, .points-pop").forEach((item) => item.remove());
}

function endGame() {
  if (trashRemoved >= difficultySettings[difficulty].targetTrash) {
    winGame();
    return;
  }

  gameActive = false;
  clearTimers();
  showResults(false, "Time is up. Try again and watch out for obstacles.");
}

function winGame() {
  gameActive = false;
  clearTimers();
  clearItems();
  launchConfetti();
  showResults(true, "Mission complete. River restored and campus reward unlocked.");
}

function showResults(win, message) {
  const rewardBox = document.getElementById("rewardBox");
  document.getElementById("resultTitle").textContent = win ? "Mission Complete!" : "Mission Failed";
  document.getElementById("resultMessage").textContent = message;
  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalTrash").textContent = trashRemoved;
  document.getElementById("finalHealth").textContent = riverHealth;
  rewardBox.classList.toggle("locked", !win);
  rewardBox.querySelector("strong").textContent = win ? "Campus Reward Unlocked" : "Reward Locked";
  rewardBox.querySelector("span").textContent = win ? "Free campus cafe drink claim code: CLEAN" : "Complete the mission to unlock the campus reward.";
  showScreen("results", playAgainBtn);
}

function launchConfetti() {
  confettiLayer.innerHTML = "";
  const colors = ["#ffc907", "#2e9df7", "#172a88", "#12b7e8", "#ffffff"];

  for (let index = 0; index < 42; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    confettiLayer.appendChild(piece);
  }
}

function resetToTitle() {
  gameActive = false;
  isPaused = false;
  clearTimers();
  clearItems();
  feedback.textContent = "Choose trash items to begin cleaning.";
  showScreen("title", startBtn);
}

function playNextLevel() {
  const order = ["basic", "medium", "hard"];
  const currentIndex = order.indexOf(difficulty);
  difficulty = order[Math.min(currentIndex + 1, order.length - 1)];
  startGame();
}

startBtn.addEventListener("click", () => showScreen("mission", document.querySelector(".difficultyBtn")));
missionBackBtn.addEventListener("click", () => showScreen("title", startBtn));
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => selectDifficulty(button.dataset.level));
});
pauseBtn.addEventListener("click", togglePause);
resetBtn.addEventListener("click", startGame);
homeBtn.addEventListener("click", resetToTitle);
playAgainBtn.addEventListener("click", startGame);
nextLevelBtn.addEventListener("click", playNextLevel);

document.addEventListener("visibilitychange", () => {
  if (document.hidden && gameActive && !isPaused) {
    togglePause();
  }
});
