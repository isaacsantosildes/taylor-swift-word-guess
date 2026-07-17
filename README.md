# 🎤 Guess The Taylor Swift Song✨

A **Taylor Swift-inspired browser speed-round game** where your lyrical memory is put to the test.

You’ll get **10 clue words**. You’ll have **60 seconds** to name as many Taylor Swift songs as you can. Think fast, trust your Swiftie instincts, and see if you can make it onto the global leaderboard.

*"I had the time of my life fighting dragons with you..."* 🐉
(Except the dragon is the countdown timer.)

Scores are saved to a **global leaderboard** that everyone playing the game can see — on any device.

---

## 💿 Play It Locally

### 1. Clone or download this repo

```bash
git clone <your-repo-url>
```

### 2. Open the project with VS Code

This project uses Firebase, which requires the site to run through **HTTP** instead of opening the HTML file directly.

Using VS Code:

1. Install the **Live Server** extension.
2. Right-click `index.html`.
3. Select **Open with Live Server**.

The game will launch in your browser.

> ✨ Before scores can be saved or loaded, connect your own free Firebase project. Setup instructions are below.

---

# 🎲 How It Plays

### 1. Enter your name

Your name will appear on the leaderboard — choose wisely. Reputation is everything. 🐍

### 2. The clock starts

You have **60 seconds** to prove your Swiftie knowledge.

### 3. Guess the song

You’ll see:

```
10 clue words → Guess the Taylor Swift song
```

You get **3 attempts** per song.

* Answers are **not case-sensitive**
* Punctuation is ignored
* The next song automatically appears after a correct guess or failed attempts

Keep going until the countdown reaches zero.

### 4. See your score

When time runs out, your final score appears and is added to the leaderboard.

No friendship bracelet required — but highly encouraged. 🫶

---

# 🏆 Scoring

Every correct answer earns points based on how quickly you solve it:

| Guess         |    Points |
| ------------- | --------: |
| First try ✨   | 10 points |
| Second try 💎 |  7 points |
| Third try 🌙  |  4 points |

Wrong guesses don't remove points.

Your score is the total of every song you correctly identify during the round.

Can you go full **Mastermind** and recognize every era in seconds? 👀

---

# 🔥 Setting Up the Global Leaderboard (Firebase)

The leaderboard uses **Cloud Firestore**, Firebase's free database service.

You’ll need your own Firebase project so the game has somewhere to store scores.

---

## 1. Create a Firebase Project

1. Visit:

```
https://console.firebase.google.com
```

2. Sign in with your Google account.
3. Click **Add project**.
4. Name it something like:

```
taylor-swift-word-guess
```

5. Google Analytics is optional — it isn't needed for this project.

---

## 2. Register a Web App

From your Firebase dashboard:

1. Click the **</> Web icon**.
2. Create a new web app.
3. Give it a nickname.
4. Click **Register app**.

You’ll receive a Firebase configuration object.

Keep this open — you’ll need it soon.

---

## 3. Enable Firestore

In Firebase:

```
Build → Firestore Database
```

Then:

1. Click **Create database**
2. Choose a nearby location
3. Start in production mode

---

## 4. Add Firestore Security Rules

Go to:

```
Firestore Database → Rules
```

Replace the rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /scores/{scoreId} {

      allow read: if true;

      allow create:
        if request.resource.data.keys()
        .hasOnly(['name', 'points', 'createdAt'])

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

Click **Publish**.

These rules allow everyone to:

✅ View scores
✅ Submit new scores

But prevent:

❌ Editing scores
❌ Deleting scores

Think of it as protecting the leaderboard vault. 🔐

---

## 5. Add Your Firebase Config

Open:

```
firebase-config.js
```

Replace the placeholder values with your Firebase credentials:

```javascript
apiKey
authDomain
projectId
storageBucket
messagingSenderId
appId
```

Save the file, refresh the game, and play a round.

Your score should now appear on the leaderboard. 🎉

Share the site with friends and compare your Swiftie scorecards.

---

# 📂 Project Structure

```
taylor-swift-word-guess/

├── index.html            # Page structure
├── style.css             # Friendship bracelet-inspired design
├── script.js             # Game logic + song clue database
├── firebase-config.js    # Firebase connection settings
└── README.md
```

---

# ➕ Adding More Songs

Want to expand the playlist?

Open:

```
script.js
```

Find the `SONGS` array and add:

```javascript
{
  title: "Song Title",
  clues: [
    "word1",
    "word2",
    "word3",
    "word4",
    "word5",
    "word6",
    "word7",
    "word8",
    "word9",
    "word10"
  ]
}
```

Add your favorite songs from every era:

💚 Debut
💛 Fearless
💜 Speak Now
❤️ Red
🔵 1989
🖤 Reputation
💕 Lover
🤍 Folklore
🧡 Evermore
💙 Midnights
🤍 The Tortured Poets Department

---

# 🛠 Tech Stack

Built with:

* HTML
* CSS
* Vanilla JavaScript
* Firebase Firestore

No frameworks.
No build tools.
No npm install.

Just a simple static site that can be hosted for free with **GitHub Pages**.

---

# 💌 Credits

Fan-made project created for Swifties everywhere.

Not affiliated with Taylor Swift, Taylor Nation, or any record label.

Made with:

✨ clues
🎶 eras
🫶 friendship bracelet energy
and a dangerous amount of Taylor Swift references.

*"Long story short, I survived."* 💫
