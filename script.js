import {
  db,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "./firebase-config.js";

// ---------------------------------------------------------
// 1. THE SONG BANK
// Each song has a title and 10 clue words/phrases that hint
// at its story without ever using words from the title itself.
// Add as many more objects as you like — the game picks one
// at random every time a new song is needed.
// ---------------------------------------------------------
const SONGS = [
  { title: "Love Story", clues: ["balcony", "Romeo", "scarlet letter", "secret", "father's approval", "ring", "fairytale", "small town", "hiding", "yes"] },
  { title: "Shake It Off", clues: ["haters", "dancers", "rumors", "playing it cool", "fake friends", "mean", "mirror", "heartbeat", "shake", "players"] },
  { title: "Blank Space", clues: ["new money", "long dress", "wrong name", "ring finger", "insane", "magic", "nightmare", "long list", "catch me", "king"] },
  { title: "Bad Blood", clues: ["rebuild", "war", "enemy now", "mad love", "band-aids", "salute", "remember", "trust broken", "vengeance", "grudge"] },
  { title: "Style", clues: ["highway", "denim", "tattoo", "red lip", "midnight", "James Dean", "car light", "stay", "good girl", "crash and burn"] },
  { title: "Cardigan", clues: ["favorite sweater", "drawer", "high school", "brakes", "sad", "chandelier", "marching band", "dive", "old tree", "jeans"] },
  { title: "Anti-Hero", clues: ["monster", "midnight", "shrink", "sun", "funeral", "casket", "daylight", "the problem", "mirror", "therapy"] },
  { title: "Willow", clues: ["crescent moon", "chase", "wit", "spell", "silver string", "wolves", "ribbon", "lost", "cross my river", "driveway"] },
  { title: "Lover", clues: ["porch", "ring", "slow dance", "wedding", "forever", "storm", "boat", "canopy", "the kids", "home team"] },
  { title: "Delicate", clues: ["reputation", "secret", "elevator", "phone", "dive bar", "glance", "nervous", "quiet", "this dress", "for real this time"] },
  { title: "You Belong With Me", clues: ["bleachers", "notebook", "glasses", "cheer captain", "headphones", "dreamer", "plaid shirt", "argue", "window", "prom"] },
  { title: "Cruel Summer", clues: ["hush", "cannonball", "secret", "snuck in", "devil", "screaming", "bad, bad", "ghost town", "fireworks", "blue skies"] },
  { title: "August", clues: ["salt air", "slipped away", "canvas", "wonder", "maybe", "seaside town", "sunset", "break my heart", "seventeen", "wish you'd chosen me"] },
  { title: "Enchanted", clues: ["ballroom", "wonderstruck", "sparkling", "staring across a room", "fairytale", "chandelier", "dress", "spell", "please don't be in love", "wish"] },
  { title: "22", clues: ["happy", "free", "confused", "lonely", "best friends", "party", "mistakes", "feels right", "another chance", "dancing till dawn"] },
  { title: "Fearless", clues: ["dance", "kitchen floor", "rain", "headlights", "our story", "spinning", "prince", "castle", "jump then fall", "wonderstruck stare"] },
  { title: "Wildest Dreams", clues: ["standing ovation", "camera roll", "red lip", "remember me", "midnight", "fast car", "forever", "his one condition", "he can't see", "dream"] },
  { title: "Champagne Problems", clues: ["proposal", "ring box", "piano", "family gathering", "panic", "timeline", "marriage", "your sweater", "downhill", "inside joke"] },
  { title: "Karma", clues: ["cat", "boyfriend", "comeback", "sunshine", "relaxing", "thunder", "poetic justice", "chameleon", "karma's a", "not a crime"] },
  { title: "Lavender Haze", clues: ["hazy", "purple sky", "1950s", "gossip", "criticize", "stare", "careless", "crazy in love", "devoted", "get it off my chest"] }
];

// ---------------------------------------------------------
// 2. STATE
// ---------------------------------------------------------
const ROUND_DURATION = 60; // total seconds per round

// Points for solving a song on the 1st / 2nd / 3rd try. No bonus added.
const POINTS_BY_ATTEMPT = [10, 7, 4];

// Short pause after each guess so the player can read the
// feedback before the next song's clues appear.
const ADVANCE_DELAY_MS = 650;

const SCORES_COLLECTION = "scores";
const LEADERBOARD_MAX = 10;

let currentSong = null;
let triesLeft = 3;
let playerName = "";

let roundActive = false;
let roundTimeLeft = ROUND_DURATION;
let roundTimerInterval = null;
let advanceTimeoutId = null;

let totalScore = 0;
let songsCorrect = 0;

// ---------------------------------------------------------
// 3. DOM REFERENCES
// ---------------------------------------------------------
const welcomeOverlay = document.getElementById("welcome-overlay");
const welcomeForm = document.getElementById("welcome-form");
const usernameInput = document.getElementById("username-input");
const stageEl = document.getElementById("stage");
const playerTagEl = document.getElementById("player-tag");

const roundoverOverlay = document.getElementById("roundover-overlay");
const roundoverSummaryEl = document.getElementById("roundover-summary");
const roundoverLeaderboardBtn = document.getElementById("roundover-leaderboard-btn");
const roundoverAgainBtn = document.getElementById("roundover-again-btn");

const braceletEl = document.getElementById("bracelet");
const formEl = document.getElementById("guess-form");
const inputEl = document.getElementById("guess-input");
const submitBtn = document.getElementById("submit-btn");
const feedbackEl = document.getElementById("feedback");
const dotEls = Array.from(document.querySelectorAll(".bead-dot"));

const roundTimerFillEl = document.getElementById("round-timer-fill");
const roundTimerLabelEl = document.getElementById("round-timer-label");
const scoreValueEl = document.getElementById("score-value");

const leaderboardSectionEl = document.getElementById("leaderboard-section");
const leaderboardListEl = document.getElementById("leaderboard-list");
const leaderboardEmptyEl = document.getElementById("leaderboard-empty");

// ---------------------------------------------------------
// 4. HELPERS
// ---------------------------------------------------------

// Makes comparisons fair: lowercase, trim spaces, and strip
// punctuation so "Anti Hero", "anti-hero!" and "Anti-Hero" all match.
function normalize(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

function pickNewSong() {
  let next = currentSong;
  // avoid repeating the same song twice in a row when possible
  while (SONGS.length > 1 && next === currentSong) {
    next = SONGS[Math.floor(Math.random() * SONGS.length)];
  }
  return next;
}

function renderClues(song) {
  braceletEl.innerHTML = "";
  song.clues.forEach((word, i) => {
    const bead = document.createElement("span");
    bead.className = "bead";
    bead.textContent = word;
    const tilt = (Math.random() * 8 - 4).toFixed(1);
    bead.style.setProperty("--tilt", `${tilt}deg`);
    bead.style.animationDelay = `${i * 45}ms`;
    braceletEl.appendChild(bead);
  });
}

function resetDots() {
  dotEls.forEach((dot) => dot.classList.remove("used"));
}

function useOneDot() {
  const remainingUsed = 3 - triesLeft;
  if (dotEls[remainingUsed]) {
    dotEls[remainingUsed].classList.add("used");
  }
}

function setFeedback(message, tone) {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${tone}`;
}

function updateScoreDisplay() {
  scoreValueEl.textContent = totalScore;
}

// --- Round-summary popup ---
function showRoundOver(summary) {
  roundoverSummaryEl.textContent = summary;
  roundoverOverlay.hidden = false;
}

function hideRoundOver() {
  roundoverOverlay.hidden = true;
}

function handleRoundOverLeaderboard() {
  hideRoundOver();
  leaderboardSectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleRoundOverAgain() {
  hideRoundOver();
  startRound();
}

// --- The 60-second round timer ---
function updateRoundTimerDisplay() {
  const pct = Math.max(0, (roundTimeLeft / ROUND_DURATION) * 100);
  roundTimerFillEl.style.width = `${pct}%`;
  roundTimerLabelEl.textContent = `${roundTimeLeft}s`;

  roundTimerFillEl.classList.remove("warn", "danger");
  if (roundTimeLeft <= 10) {
    roundTimerFillEl.classList.add("danger");
  } else if (roundTimeLeft <= 20) {
    roundTimerFillEl.classList.add("warn");
  }
}

function stopRoundTimer() {
  clearInterval(roundTimerInterval);
  roundTimerInterval = null;
}

function startRoundTimer() {
  stopRoundTimer();
  roundTimeLeft = ROUND_DURATION;
  updateRoundTimerDisplay();

  roundTimerInterval = setInterval(() => {
    roundTimeLeft -= 1;
    updateRoundTimerDisplay();
    if (roundTimeLeft <= 0) {
      finishRound();
    }
  }, 1000);
}

// ---------------------------------------------------------
// 5. LEADERBOARD
// Scores are stored in Firestore (a free cloud database), so
// every player on every device sees and adds to the same
// leaderboard. See firebase-config.js + README.md for setup.
// One entry is saved per completed 60-second round.
// ---------------------------------------------------------
function computePoints(attemptNumber) {
  return POINTS_BY_ATTEMPT[attemptNumber - 1] || 0;
}

async function addLeaderboardEntry(name, points) {
  try {
    await addDoc(collection(db, SCORES_COLLECTION), {
      name,
      points,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error("Could not save score:", err);
  }
  await renderLeaderboard();
}

async function fetchTopScores() {
  const q = query(
    collection(db, SCORES_COLLECTION),
    orderBy("points", "desc"),
    limit(LEADERBOARD_MAX)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
}

async function renderLeaderboard() {
  leaderboardListEl.innerHTML = `<li class="leaderboard-status">Loading scores…</li>`;
  leaderboardEmptyEl.hidden = true;

  let entries = [];
  try {
    entries = await fetchTopScores();
  } catch (err) {
    console.error("Could not load leaderboard:", err);
    leaderboardListEl.innerHTML =
      `<li class="leaderboard-status">Couldn't load the leaderboard. Check the Firebase setup in firebase-config.js.</li>`;
    return;
  }

  leaderboardListEl.innerHTML = "";
  leaderboardEmptyEl.hidden = entries.length > 0;

  entries.forEach((entry, i) => {
    const rank = i + 1;
    const row = document.createElement("li");
    row.className = `leaderboard-row top-${rank}`;
    row.style.animationDelay = `${i * 40}ms`;

    const rankEl = document.createElement("span");
    rankEl.className = "leaderboard-rank";
    rankEl.textContent = `#${rank}`;

    const nameEl = document.createElement("span");
    nameEl.className = "leaderboard-name";
    nameEl.textContent = entry.name;

    const metaEl = document.createElement("span");
    metaEl.className = "leaderboard-meta";
    metaEl.innerHTML = `<span class="leaderboard-points">${entry.points}</span> pts`;

    row.append(rankEl, nameEl, metaEl);
    leaderboardListEl.appendChild(row);
  });
}

// ---------------------------------------------------------
// 6. GAME FLOW
// A round lasts ROUND_DURATION seconds. Within that time, the
// player is shown one song at a time (3 tries each). A correct
// guess or a used-up set of tries both move on to the next song
// immediately — only the round timer running out ends the game.
// ---------------------------------------------------------
function startNewSongInRound() {
  currentSong = pickNewSong();
  triesLeft = 3;
  renderClues(currentSong);
  resetDots();
  inputEl.value = "";
  inputEl.disabled = false;
  submitBtn.disabled = false;
  inputEl.focus();
}

function startRound() {
  roundActive = true;
  totalScore = 0;
  songsCorrect = 0;
  updateScoreDisplay();

  hideRoundOver();
  setFeedback(`Go, ${playerName}! Name as many songs as you can in ${ROUND_DURATION} seconds.`, "neutral");

  startNewSongInRound();
  startRoundTimer();
}

// Pause briefly, then load the next song — used after both a
// correct guess and a fully-used-up set of tries.
function queueNextSong() {
  inputEl.disabled = true;
  submitBtn.disabled = true;
  clearTimeout(advanceTimeoutId);
  advanceTimeoutId = setTimeout(() => {
    if (!roundActive) return;
    startNewSongInRound();
  }, ADVANCE_DELAY_MS);
}

function handleGuess(event) {
  event.preventDefault();
  if (!roundActive) return;

  const guess = inputEl.value;
  if (!normalize(guess)) {
    setFeedback("Type a guess before submitting.", "neutral");
    return;
  }

  const isCorrect = normalize(guess) === normalize(currentSong.title);

  if (isCorrect) {
    const attemptNumber = (3 - triesLeft) + 1;
    const points = computePoints(attemptNumber);
    totalScore += points;
    songsCorrect += 1;
    updateScoreDisplay();
    setFeedback(`🎉 "${currentSong.title}" — +${points} pts!`, "good");
    queueNextSong();
    return;
  }

  triesLeft -= 1;
  useOneDot();

  if (triesLeft <= 0) {
    setFeedback(`Out of tries — it was "${currentSong.title}". Next song!`, "bad");
    queueNextSong();
  } else {
    const triesWord = triesLeft === 1 ? "try" : "tries";
    setFeedback(`Not quite — ${triesLeft} ${triesWord} left.`, "bad");
    inputEl.value = "";
    inputEl.focus();
  }
}

async function finishRound() {
  roundActive = false;
  stopRoundTimer();
  clearTimeout(advanceTimeoutId);
  inputEl.disabled = true;
  submitBtn.disabled = true;

  const songWord = songsCorrect === 1 ? "song" : "songs";
  showRoundOver(`You scored ${totalScore} points across ${songsCorrect} ${songWord}.`);

  await addLeaderboardEntry(playerName, totalScore);
}

// ---------------------------------------------------------
// 7. USERNAME GATE
// ---------------------------------------------------------
function handleWelcomeSubmit(event) {
  event.preventDefault();
  const typed = usernameInput.value.trim();
  playerName = typed || "Swiftie";

  playerTagEl.textContent = `playing as ${playerName}`;

  welcomeOverlay.hidden = true;
  stageEl.hidden = false;

  startRound();
}

// ---------------------------------------------------------
// 8. EVENTS
// ---------------------------------------------------------
welcomeForm.addEventListener("submit", handleWelcomeSubmit);
formEl.addEventListener("submit", handleGuess);
roundoverLeaderboardBtn.addEventListener("click", handleRoundOverLeaderboard);
roundoverAgainBtn.addEventListener("click", handleRoundOverAgain);

// ---------------------------------------------------------
// 9. KICK OFF
// ---------------------------------------------------------
// The round itself starts only after handleWelcomeSubmit runs,
// so there's nothing to call here — the welcome overlay is
// visible by default and grabs focus for the player. The
// leaderboard, though, loads right away so it's ready to view.
renderLeaderboard();
usernameInput.focus();