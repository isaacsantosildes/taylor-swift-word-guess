# Ten Words, One Song 🎤

A tiny browser game: you get 10 clue words, three guesses, and have to
name the Taylor Swift song they belong to. No frameworks, no build step,
no database — just HTML, CSS, and JavaScript.

## Play it locally

1. Clone or download this repo.
2. Open `index.html` in your browser (or use VS Code's **Live Server**
   extension for auto-reload while editing).

## Rules

- You're shown 10 clue words for a randomly chosen song.
- You have **3 guesses**.
- Guesses are **not case-sensitive** and ignore punctuation, so
  `anti hero`, `Anti-Hero`, and `ANTI HERO!!` all count the same.
- Click **New song** any time to restart with a different track.

## Project structure

```
taylor-swift-word-guess/
├── index.html   # page structure
├── style.css    # visual design (friendship-bracelet theme)
├── script.js    # game logic + the song/clue data
└── README.md
```

## Adding more songs

Open `script.js` and add a new object to the `SONGS` array at the top:

```js
{ title: "Song Title", clues: ["word1", "word2", "...", "word10"] }
```

## Tech

Vanilla HTML/CSS/JS — no dependencies, no build tools. Works as a static
site, so it can be hosted for free with GitHub Pages.

---
*Fan-made project, not affiliated with Taylor Swift or her label.*
