# Ten Words, One Song 🎤

A browser speed-round game: enter your name, then you've got **60
seconds** to name as many Taylor Swift songs as you can from their
clue words. Scores go on a **global leaderboard** that everyone
playing the game can see, on any device.

## Play it locally

1. Clone or download this repo.
2. This project uses Firebase, which requires being served over
   `http://` rather than opened directly as a file, so use VS Code's
   **Live Server** extension: right-click `index.html` → **Open with
   Live Server**.
3. Before scores will save or load, you need to connect your own
   free Firebase project — see below.

## How it plays

1. Enter a name — it's used on the leaderboard.
2. The 60-second round timer starts immediately.
3. You're shown 10 clue words for a song. You get **3 tries** to
   name it (not case-sensitive, punctuation ignored).
4. Whether you guess it right or run out of tries, the next song
   loads automatically — keep going until the clock hits zero.
5. When time's up, a popup shows your total score and how many
   songs you got, then saves that score to the leaderboard.

## Scoring

- Guessing a song right on the **1st try** is worth **10 points**.
- **2nd try**: 7 points.
- **3rd try**: 4 points.
- Running out of tries on a song adds nothing, but doesn't cost you
  anything either — it just moves to the next song.
- Your points add up across every song you get right in the 60
  seconds. That total is what gets saved to the leaderboard as one
  entry per completed round.

## Set up the global leaderboard (Firebase)

The leaderboard is stored in **Firestore**, a free database from
Google's Firebase platform. You need your own Firebase project (it's
free for a small game like this) so the game has somewhere to read
and write scores.

### 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and sign in with a Google account.
2. Click **Add project**, name it (e.g. `taylor-swift-word-guess`), and click through the setup (you can disable Google Analytics — not needed here).

### 2. Register a web app

1. On your new project's dashboard, click the **`</>`** (web) icon to add a web app.
2. Give it a nickname and click **Register app**. You do *not* need Firebase Hosting.
3. You'll see a code block with a `firebaseConfig` object containing `apiKey`, `authDomain`, `projectId`, etc. Keep this page open.

### 3. Turn on Firestore

1. In the left sidebar, go to **Build → Firestore Database**.
2. Click **Create database**, choose a location close to you, and start in **production mode**.

### 4. Set the security rules

Still in Firestore, go to the **Rules** tab and replace the contents with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{scoreId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['name', 'points', 'createdAt'])
                    && request.resource.data.name is string
                    && request.resource.data.name.size() <= 20
                    && request.resource.data.points is number
                    && request.resource.data.points >= 0
                    && request.resource.data.points <= 300;
      allow update, delete: if false;
    }
  }
}
```

Click **Publish**. This lets anyone read the leaderboard and add a
new score, but never edit or delete existing ones. The `points <= 300`
check is a generous ceiling — realistically nobody will score over
~150 in one 60-second round even guessing every song right on the
first try — so it mainly guards against an obviously fake score being
submitted directly.

### 5. Add your config to the project

Open `firebase-config.js` in this project and replace the placeholder
values with the real ones from Step 2, matching the format already in
the file (`apiKey`, `authDomain`, `projectId`, `storageBucket`,
`messagingSenderId`, `appId`).

Save the file, reload the game with Live Server, and play a round —
your score should appear in the leaderboard. Open the page on your
phone (or send the link to a friend once it's on GitHub Pages) and
you'll see the same scores.

## Project structure

```
taylor-swift-word-guess/
├── index.html          # page structure
├── style.css            # visual design (friendship-bracelet theme)
├── script.js            # game logic + the song/clue data
├── firebase-config.js   # your Firebase project keys + setup
└── README.md
```

## Adding more songs

Open `script.js` and add a new object to the `SONGS` array at the top:

```js
{ title: "Song Title", clues: ["word1", "word2", "...", "word10"] }
```

## Tech

Vanilla HTML/CSS/JS plus the Firebase Firestore SDK (loaded straight
from Google's CDN — no build tools, no `npm install`). Works as a
static site, so it can be hosted for free with GitHub Pages.

---
*Fan-made project, not affiliated with Taylor Swift or her label.*