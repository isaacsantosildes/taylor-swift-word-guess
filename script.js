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
  { title: "Lavender Haze", clues: ["hazy", "purple sky", "1950s", "gossip", "criticize", "stare", "careless", "crazy in love", "devoted", "get it off my chest"] },
  { title: "All Too Well", clues: ["scarf", "autumn", "maple", "photograph", "kitchen", "New York", "birthday", "car ride", "memory", "burning"] },
  { title: "The 1", clues: ["coffee", "vintage", "baseball", "cardigan", "roaring twenties", "wonderland", "ex", "missed chance", "golden", "what if"] },
  { title: "The Last Great American Dynasty", clues: ["Rebekah", "Rhode Island", "mansion", "wealth", "party", "divorce", "painting", "heiress", "neighbors", "legend"] },
  { title: "My Tears Ricochet", clues: ["ghost", "funeral", "ashes", "haunted", "betrayal", "grave", "memory", "soldier", "revenge", "tears"] },
  { title: "The Lakes", clues: ["poets", "lake", "mountains", "flowers", "writers", "England", "nature", "escape", "cliffs", "peace"] },
  { title: "Seven", clues: ["childhood", "Pennsylvania", "treehouse", "summer", "friendship", "ghost", "innocence", "river", "family", "secret"] },
  { title: "Invisible String", clues: ["gold", "thread", "destiny", "childhood", "green", "birthday", "park", "fate", "connection", "love"] },
  { title: "Mad Woman", clues: ["witch", "anger", "fire", "villain", "crazy", "society", "rage", "smile", "blame", "revenge"] },
  { title: "Exile", clues: ["balcony", "cold", "strangers", "goodbye", "mirror", "walking", "cinema", "warning", "distance", "divorce"] },
  { title: "Betty", clues: ["cardigan", "school", "dance", "summer", "apology", "James", "garden", "seventeen", "mistake", "classroom"] },
  { title: "Maroon", clues: ["wine", "burgundy", "streetlight", "rosé", "blood", "memories", "scarlet", "room", "love", "autumn"] },
  { title: "Snow on the Beach", clues: ["snow", "moon", "beach", "weird", "dream", "stars", "flight", "night", "impossible", "romance"] },
  { title: "You're On Your Own, Kid", clues: ["bedroom", "dreams", "friendship", "school", "success", "tears", "midnight", "lonely", "growth", "future"] },
  { title: "Midnight Rain", clues: ["city", "storm", "dreams", "sunshine", "change", "healing", "ghost", "midnight", "different", "memories"] },
  { title: "Mastermind", clues: ["strategy", "chess", "plan", "schemes", "destiny", "puzzle", "blue", "genius", "secret", "control"] },
  { title: "Bejeweled", clues: ["diamonds", "sparkle", "dress", "shimmer", "party", "queen", "heels", "night", "castle", "shine"] },
  { title: "Anti-Hero", clues: ["nightmare", "mirror", "monster", "fear", "dream", "therapy", "family", "ghost", "problem", "self"] },
  { title: "Question...?", clues: ["party", "kiss", "midnight", "friends", "memory", "dance", "photo", "rumor", "strangers", "wonder"] },
  { title: "Vigilante Shit", clues: ["revenge", "black", "crime", "dress", "karma", "weapon", "power", "enemy", "cold", "justice"] },
  { title: "Would've Could've Should've", clues: ["memory", "regret", "age", "prayer", "ghost", "scar", "childhood", "haunting", "mistake", "karma"] },
  { title: "Delicate", clues: ["reputation", "secret", "elevator", "bar", "dress", "phone", "nervous", "whisper", "glance", "beginning"] },
  { title: "Getaway Car", clues: ["escape", "crime", "car", "sirens", "devil", "gasoline", "driving", "prison", "partners", "betrayal"] },
  { title: "Look What You Made Me Do", clues: ["snake", "revenge", "grave", "old self", "diamonds", "phone", "villain", "fame", "karma", "enemy"] },
  { title: "I Did Something Bad", clues: ["witch", "fire", "danger", "bad girl", "gold", "men", "smoke", "game", "rules", "power"] },
  { title: "...Ready For It?", clues: ["vampire", "robbers", "island", "dream", "danger", "armor", "darkness", "killing", "hunter", "king"] },
  { title: "Gorgeous", clues: ["blue eyes", "whiskey", "baby", "party", "jealous", "drink", "beautiful", "girl", "baby voice", "crush"] },
  { title: "Call It What You Want", clues: ["castle", "rain", "island", "baby", "flowers", "love", "trust", "storm", "nickname", "home"] },
  { title: "New Year's Day", clues: ["party", "midnight", "cleaning", "kitchen", "friends", "snow", "hangover", "forever", "love", "morning"] },
  { title: "August", clues: ["summer", "salt air", "seaside", "seventeen", "sunset", "canvas", "wish", "car", "memory", "heartbreak"] },
  { title: "Illicit Affairs", clues: ["secret", "hotel", "perfume", "lover", "hidden", "whisper", "affair", "paper", "meeting", "betrayal"] },
  { title: "Mirrorball", clues: ["disco", "sparkle", "shatter", "perform", "stage", "crowd", "reflection", "clown", "shine", "fragile"] },
  { title: "Peace", clues: ["family", "wild", "love", "storm", "war", "protect", "baby", "forever", "quiet", "home"] },
  { title: "Hoax", clues: ["blue", "pain", "winter", "betrayal", "broken", "ghost", "love", "wound", "truth", "ashes"] },
  { title: "Right Where You Left Me", clues: ["restaurant", "table", "dust", "birthday", "frozen", "waiting", "corner", "dress", "memory", "time"] },
  { title: "Tolerate It", clues: ["dinner", "table", "painting", "books", "marriage", "ignored", "attention", "castle", "waiting", "love"] },
  { title: "No Body, No Crime", clues: ["murder", "sister", "car", "crime", "husband", "lake", "evidence", "detective", "revenge", "secret"] },
  { title: "Cowboy Like Me", clues: ["cowboy", "boots", "casino", "con artist", "hustle", "tent", "fortune", "western", "love", "gamble"] },
  { title: "Long Story Short", clues: ["battle", "castle", "war", "survive", "arrow", "enemy", "healing", "gold", "mistake", "victory"] },
  { title: "Evermore", clues: ["winter", "forest", "snow", "pain", "January", "ghost", "gray", "hope", "storm", "healing"] },
  { title: "Lavender Haze", clues: ["purple", "fog", "love", "1950s", "gossip", "critics", "devotion", "dream", "crazy", "haze"] },
  { title: "Red", clues: ["color", "car", "burning", "autumn", "scarlet", "love", "driving", "memory", "fire", "wild"] },
  { title: "Begin Again", clues: ["coffee", "Wednesday", "movie", "park", "dress", "French", "smile", "new love", "healing", "start"] },
  { title: "22", clues: ["friends", "party", "dancing", "happy", "free", "mistakes", "young", "night", "fun", "birthday"] },
  { title: "We Are Never Ever Getting Back Together", clues: ["again", "ex", "phone", "friends", "breakup", "record", "cool", "rumors", "relationship", "never"] },
  { title: "I Knew You Were Trouble", clues: ["danger", "red", "bad boy", "falling", "devil", "trouble", "cold", "rain", "hurt", "mistake"] },
  { title: "Everything Has Changed", clues: ["green eyes", "dress", "picture", "new", "hello", "summer", "stranger", "school", "beginning", "love"] },
  { title: "Holy Ground", clues: ["dance", "New York", "memory", "train", "gold", "love", "street", "summer", "laugh", "past"] },
  { title: "Treacherous", clues: ["road", "danger", "falling", "mountain", "car", "slow", "temptation", "blue", "risk", "desire"] },
  { title: "State of Grace", clues: ["red", "mosaic", "love", "battle", "armor", "sacred", "road", "wild", "heart", "grace"] },
  { title: "Sad Beautiful Tragic", clues: ["train", "love", "memory", "time", "distance", "silence", "lost", "photo", "tragic", "dream"] },
  { title: "The Moment I Knew", clues: ["birthday", "party", "dress", "door", "Christmas", "waiting", "alone", "gift", "rain", "disappointment"] },
  { title: "Speak Now", clues: ["wedding", "dress", "church", "bride", "interruption", "balcony", "secret", "love", "runaway", "speech"] },
  { title: "Mine", clues: ["kitchen", "childhood", "water", "river", "family", "forever", "dream", "love", "fight", "home"] },
  { title: "Back To December", clues: ["December", "snow", "apology", "winter", "taylor", "memory", "cold", "regret", "sweater", "goodbye"] },
  { title: "Mean", clues: ["words", "small town", "bullies", "coward", "success", "dreams", "music", "future", "critic", "revenge"] },
  { title: "The Story of Us", clues: ["book", "library", "stage", "silence", "chapter", "fight", "crowd", "ending", "distance", "story"] },
  { title: "Ours", clues: ["door", "smile", "hands", "crowd", "world", "love", "secret", "night", "laugh", "forever"] },
  { title: "Enchanted", clues: ["ballroom", "sparkle", "chandelier", "dress", "magic", "stranger", "fairytale", "spell", "wish", "wonder"] },
  { title: "Dear John", clues: ["letter", "older", "guitar", "girl", "blue", "pain", "warning", "lesson", "innocence", "manipulation"] },
  { title: "Last Kiss", clues: ["July", "photograph", "door", "sweater", "kiss", "silence", "memory", "rain", "goodbye", "letter"] },
  { title: "Blank Space", clues: ["new money", "mansion", "red dress", "nightmare", "dating", "crazy", "collection", "game", "danger", "name"] },
  { title: "Out of the Woods", clues: ["trees", "snowmobile", "necklace", "hospital", "danger", "woods", "accident", "January", "fear", "survival"] },
  { title: "Clean", clues: ["rain", "water", "drowning", "storm", "healing", "freedom", "glass", "addiction", "sunlight", "new beginning"] },
  { title: "Wildest Dreams", clues: ["Hollywood", "camera", "red lips", "car", "memory", "dream", "midnight", "fame", "goodbye", "remember"] },
  { title: "New Romantics", clues: ["party", "rebels", "lights", "music", "dreams", "youth", "crowd", "heartbeat", "freedom", "romance"] },
  { title: "This Love", clues: ["ocean", "waves", "return", "blue", "ships", "ghost", "night", "burning", "come back", "forever"] },
  { title: "Wonderland", clues: ["Alice", "rabbit", "forest", "madness", "maze", "falling", "chess", "danger", "magic", "dream"] },
  { title: "Right Where You Left Me", clues: ["restaurant", "table", "dust", "frozen", "waiting", "birthday", "corner", "time", "memory", "stranger"] },
  { title: "Marjorie", clues: ["grandmother", "ghost", "memory", "perfume", "family", "wisdom", "photograph", "winter", "voice", "legacy"] },
  { title: "Dorothea", clues: ["hometown", "Hollywood", "school", "movie", "friend", "small town", "dreams", "letters", "memory", "fame"] },
  { title: "Coney Island", clues: ["amusement park", "carousel", "winter", "bench", "fairground", "memories", "lost", "relationship", "lights", "cold"] },
  { title: "The Great War", clues: ["battle", "soldiers", "war", "armor", "flowers", "survival", "love", "wounds", "peace", "scar"] },
  { title: "High Infidelity", clues: ["April", "street", "marriage", "secret", "betrayal", "records", "wine", "guilt", "memory", "truth"] },
  { title: "The Alcott", clues: ["novel", "writing", "hotel", "family", "conversation", "love", "letters", "story", "fiction", "home"] },
  { title: "Fortnight", clues: ["two weeks", "neighbor", "town", "dreams", "house", "memory", "office", "ghost", "love", "medicine"] },
  { title: "But Daddy I Love Him", clues: ["father", "forbidden", "horse", "town", "romance", "rebellion", "rules", "freedom", "princess", "escape"] },
  { title: "Down Bad", clues: ["alien", "spaceship", "abduction", "blue", "sad", "love", "desert", "dream", "falling", "stranded"] },
  { title: "So Long, London", clues: ["London", "ship", "queen", "marriage", "goodbye", "castle", "rain", "leaving", "heartbreak", "city"] },
  { title: "The Black Dog", clues: ["pub", "dog", "street", "phone", "memory", "ex", "door", "music", "London", "ghost"] },
  { title: "I Can Do It With a Broken Heart", clues: ["stage", "smile", "performance", "sparkle", "pain", "dancing", "show", "crowd", "glitter", "heartbreak"] }
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