# M7 — 2–3 minute demo video script

Record the deployed GitHub Pages version with your own narration. Aim for about 2 minutes 30 seconds and use the final version of the app.

## 0:00–0:20 — Introduce the project

“Hi, this is Campus Wallet, a responsive student finance tracker I built with HTML, CSS, and JavaScript. It helps students record income and expenses, set a weekly limit, search their records, and keep data in their browser.”

Show the navigation, About section, GitHub/email contact, and mobile or desktop layout.

## 0:20–0:55 — Add and validate a transaction

“This form validates fields while I type. Amounts need to be positive with at most two decimal places. Descriptions cannot start or end with spaces, contain double spaces, or repeat a word, and categories accept letters, spaces, and hyphens.”

Show a rejected amount such as `12.345`, an impossible date, and `coffee coffee`. Then add a valid expense. Mention that the record receives a unique id and timestamps automatically.

## 0:55–1:20 — Dashboard and weekly cap

“The dashboard updates with my balance, income, expenses, record count, and top spending category. This category chart and last-seven-days chart update from the same records. The weekly limit tells me the remaining amount, and it announces an overage if I pass the limit.”

Set a low weekly limit to demonstrate the assertive overage message.

## 1:20–1:50 — Regex search and inline editing

“I can search with a regex pattern such as `food|transport`; matches are highlighted. The case-sensitive checkbox changes matching behavior, and an invalid pattern is handled safely. I can sort and filter records, then edit a transaction directly in the table row or delete it after a confirmation.”

Show the `/` keyboard shortcut, a search, an inline edit, and a delete confirmation.

## 1:50–2:15 — Settings, persistence, and JSON

“Settings include RWF as the base currency and manual USD/EUR rates, so totals can display in any of those currencies without an API. Categories are editable. Records and settings use localStorage, and JSON import checks the full record structure before loading it.”

Show a manual rate change, category change, export, and import. Reload once to demonstrate persistence.

## 2:15–2:30 — Accessibility and testing

“The app has a skip link, visible focus, keyboard navigation, live status messages, and responsive mobile, tablet, and desktop layouts. I also included a test page for validation, import checks, regex search, calculations, timestamps, and trends.”

Open `tests.html`, show the passing count, then finish.

## Before submitting

- Record the deployed GitHub Pages site rather than only the code editor.
- Keep browser text large enough to read and audio clear enough to hear.
- Confirm the video is 2–3 minutes and its unlisted/public link works when signed out.
- Add the final video URL and GitHub Pages URL to `README.md`.
