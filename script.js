// ---------------------------------------------------------
// 1. THE SONG BANK
// Each song has a title and 10 clue words/phrases that hint
// at its story without ever using words from the title itself.
// Add as many more objects as you like — the game picks one
// at random every round.
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
let currentSong = null;
let triesLeft = 3;
let solved = false;

// ---------------------------------------------------------
// 3. DOM REFERENCES
// ---------------------------------------------------------
const braceletEl = document.getElementById("bracelet");
const formEl = document.getElementById("guess-form");
const inputEl = document.getElementById("guess-input");
const submitBtn = document.getElementById("submit-btn");
const feedbackEl = document.getElementById("feedback");
const newGameBtn = document.getElementById("new-game-btn");
const dotEls = Array.from(document.querySelectorAll(".bead-dot"));

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

function endRound(won) {
  solved = true;
  inputEl.disabled = true;
  submitBtn.disabled = true;
  newGameBtn.style.display = "inline-block";
  if (won) {
    setFeedback(`🎉 Yes! It was "${currentSong.title}".`, "good");
  } else {
    setFeedback(`Out of tries — it was "${currentSong.title}".`, "bad");
  }
}

// ---------------------------------------------------------
// 5. GAME FLOW
// ---------------------------------------------------------
function startNewGame() {
  currentSong = pickNewSong();
  triesLeft = 3;
  solved = false;

  renderClues(currentSong);
  resetDots();

  inputEl.value = "";
  inputEl.disabled = false;
  submitBtn.disabled = false;
  newGameBtn.style.display = "none";
  setFeedback("Ten words, one song — you've got three guesses.", "neutral");
  inputEl.focus();
}

function handleGuess(event) {
  event.preventDefault();
  if (solved) return;

  const guess = inputEl.value;
  if (!normalize(guess)) {
    setFeedback("Type a guess before submitting.", "neutral");
    return;
  }

  const isCorrect = normalize(guess) === normalize(currentSong.title);

  if (isCorrect) {
    endRound(true);
    return;
  }

  triesLeft -= 1;
  useOneDot();

  if (triesLeft <= 0) {
    endRound(false);
  } else {
    const triesWord = triesLeft === 1 ? "try" : "tries";
    setFeedback(`Not quite — ${triesLeft} ${triesWord} left.`, "bad");
    inputEl.value = "";
    inputEl.focus();
  }
}

// ---------------------------------------------------------
// 6. EVENTS
// ---------------------------------------------------------
formEl.addEventListener("submit", handleGuess);
newGameBtn.addEventListener("click", startNewGame);

// ---------------------------------------------------------
// 7. KICK OFF
// ---------------------------------------------------------
startNewGame();
