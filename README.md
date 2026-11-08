# AI Exam Revision

A static revision site for the AI final exam (Lectures 2 to 12). It has notes, flashcards, quizzes, calculation practice, animations, a cheat sheet, notes with PDF export, sign in and a leaderboard. It works on desktop and phone.

## Open it locally

Double click `index.html`, or run a tiny server in this folder:

```
python -m http.server 8067
```

Then open http://localhost:8067. Without Supabase keys the site runs in guest mode. Progress is saved in the browser only.

## Turn on sign in and the leaderboard (Supabase, free)

1. Go to https://supabase.com, create a free project.
2. Open SQL Editor, paste all of `supabase/setup.sql`, click Run.
3. Go to Authentication, Sign In / Providers, Email. Turn OFF "Confirm email". (Users sign in with a username. The site turns it into a fake email, so no email is sent.)
4. Go to Project Settings, API. Copy the Project URL and the anon public key.
5. Paste them into `js/config.js`:

```
SUPABASE_URL: "https://xxxx.supabase.co",
SUPABASE_ANON_KEY: "eyJ...",
```

The anon key is safe to put in a public site. Row level security in `setup.sql` stops users from editing other people's data, and points are capped per call.

## Share it with friends (free hosting)

Option A, GitHub Pages:
1. Push this folder to https://github.com/MichelleGun/AI_ExamNotes.
2. On GitHub, Settings, Pages, Source: Deploy from a branch, branch `main`, folder `/ (root)`.
3. The link will be https://michellegun.github.io/AI_ExamNotes/

Option B, Netlify: go to https://app.netlify.com/drop and drag this folder in.

## Print notes as PDF

Go to My notes + PDF, click Export PDF, tick what to include, then choose "Save as PDF" in the print window.

## Files

- `index.html` page shell
- `js/svg.js`, `js/svg2.js` diagrams (about 50, drawn in code so they follow light/dark mode)
- `css/style.css` light and dark theme, phone layout, print styles
- `js/content-a.js`, `js/content-b.js` lecture notes
- `js/cards.js` flashcards, `js/questions.js` quiz bank
- `js/gen.js` calculation generators (seed 67)
- `js/tools.js` animations and calculators
- `js/cheatsheet.js` one page formula sheet
- `js/app.js` app logic, sign in, leaderboard
- `supabase/setup.sql` database setup
