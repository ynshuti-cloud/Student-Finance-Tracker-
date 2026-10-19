# Campus Wallet — Student Finance Tracker

Campus Wallet is an accessible, responsive finance tracker built with vanilla HTML, CSS, and JavaScript. It helps students record income and expenses, search records with regular expressions, set a weekly spending limit, view a seven-day trend, and save a JSON backup.

**Theme:** Student Finance Tracker<br>
**Base currency:** RWF (Rwandan franc)<br>
**Contact:** [ynshuti-cloud on GitHub](https://github.com/ynshuti-cloud) · [y.nshuti@alustudent.com](mailto:y.nshuti@alustudent.com)

> GitHub Pages URL: publish this repository, then replace this line with the verified live URL (expected format: `https://ynshuti-cloud.github.io/student-finance-tracker/`).
>
> Demo video: record the required 2–3 minute demo and replace this line with its accessible unlisted URL before submission.

## Run the project

1. Download or clone the repository.
2. Open the `student-finance-tracker` folder in Visual Studio Code.
3. Start it with the **Live Server** extension, or run a local static web server in that folder.
4. Open `index.html` and select **Load sample data**.
5. Open `tests.html` from the same server to run the automated browser checks.

Opening `index.html` directly supports most features, but a web server is required for loading `seed.json` because browsers can block `fetch()` from local files.

## Features

- Add income and expense records with a unique `id`, `createdAt`, and `updatedAt` timestamp.
- Validate fields while typing and when submitting the form.
- Edit each transaction inline, confirm deletes, and update totals immediately.
- Search records with JavaScript regex patterns, toggle case sensitivity, and highlight visible matches with `<mark>`.
- Sort by date, amount, or description and filter by transaction type.
- See balance, income, expenses, record count, top spending category, category totals, and a seven-day spending trend.
- Set a weekly spending cap; the app announces the remaining balance politely and overages assertively.
- Store data and preferences in `localStorage`, including graceful recovery from malformed storage data.
- Export a complete JSON backup and import only structurally validated JSON records.
- Convert display amounts from the RWF base currency to USD or EUR with manual rates saved in Settings.
- Add and remove spending categories. Defaults are Food, Books, Transport, Entertainment, Fees, and Other.
- Switch between comfortable and compact density.

## Record data model

```js
{
  id: "tx-mgx7k82-f3q1r8",
  type: "expense",
  amount: 4500,
  description: "Campus lunch",
  category: "Food",
  date: "2026-10-16",
  notes: "Lunch after class",
  createdAt: "2026-10-16T11:30:00.000Z",
  updatedAt: "2026-10-16T11:30:00.000Z"
}
```

Amounts are stored in RWF. USD and EUR rates are entered manually in Settings; no external currency API is used.

## Regex catalogue

| Field or feature | Pattern | Example | Purpose |
|---|---|---|---|
| Description | `/^(?!.*\s{2})(?=.{2,80}$)[A-Za-z0-9][A-Za-z0-9 '&.,()/-]*[A-Za-z0-9.)]$/` | `Campus lunch` | Requires 2–80 valid characters and prevents leading/trailing spaces; the UI collapses repeated internal spaces on blur and save. |
| Amount | `/^(0|[1-9]\d*)(\.\d{1,2})?$/` | `5000`, `12.50` | Accepts a whole number or one/two decimal places; app logic additionally requires an amount above zero. |
| Date | `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` | `2026-10-16` | Checks the YYYY-MM-DD shape; JavaScript also rejects impossible calendar dates. |
| Category | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | `School-Fees` | Allows letters separated by one space or hyphen. |
| Advanced duplicate-word rule | `/\b(\w+)\s+\1\b/i` | `coffee coffee` | Uses a **back-reference** to reject a repeated adjacent word in a description. |
| Live regex search | `food|transport` | `/food|transport/i` | Finds either term. The checkbox controls whether matching is case-sensitive. |

An invalid search pattern—for example `[`—is caught with `try/catch`, announced to the user, and never crashes the page.

## Keyboard map

| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | Move forward/back through every interactive control. |
| `Enter` / `Space` | Activate focused buttons, links, checkboxes, and form controls. |
| `/` | Focus the regex search field when not already typing in a form control. |
| `Escape` | Clear the focused regex search field. |
| Skip link | The first keyboard focus lets a user jump directly to main content. |

## Accessibility notes

- Semantic `header`, `nav`, `main`, `section`, `form`, `table`, and `footer` landmarks are used with a heading hierarchy.
- Labels are explicitly associated with every input; inline edit inputs have accessible labels.
- Strong visible focus styles, a skip link, keyboard-only controls, and keyboard search shortcuts are provided.
- Validation, search, import, storage, and save messages use `role="status"`, `role="alert"`, or `aria-live`.
- The weekly cap is polite while under budget and assertive when over budget.
- The table has a caption, scoped column headers, descriptive action labels, and safely escaped rendered content.
- Text colors and focus styles use high-contrast values; the responsive layout is mobile-first at 360px, tablet at 768px, and desktop at 1024px.
- Search matches use native `<mark>` elements, which preserve readable text for assistive technology.

## Tests

Open `tests.html` using the same web server. It runs 21 browser tests for validation, timestamps, duplicate IDs, safe regex search, case sensitivity, totals, category totals, and the seven-day trend.

Also complete this manual test checklist before submitting:

1. Add an income and expense; confirm all dashboard values update.
2. Test zero, `12.345`, an impossible date, leading spaces, double spaces, and `coffee coffee`.
3. Edit a table row inline and verify `updatedAt` changes in an exported JSON file.
4. Delete a record and cancel a delete confirmation.
5. Search `food|transport`, enable case-sensitive mode, and search invalid `[`.
6. Change all sort choices and both type filters.
7. Set a low weekly limit and listen for the remaining/overage announcement.
8. Change to USD/EUR, set manual rates, and confirm displayed numbers convert.
9. Add and remove a category.
10. Export records, clear them, import the export, and reload the page.
11. Resize at approximately 360px, 768px, and 1024px; test with keyboard only.

## Project structure

```text
student-finance-tracker/
├── index.html
├── tests.html
├── seed.json
├── README.md
├── styles/style.css
├── scripts/
│   ├── main.js
│   ├── validators.js
│   ├── storage.js
│   ├── state.js
│   ├── search.js
│   └── ui.js
├── tests/tests.js
└── docs/
    ├── project-spec.md
    ├── wireframes.md
    ├── milestones.md
    └── demo-script.md
```

## Publish with GitHub Pages

1. Create a GitHub repository named `student-finance-tracker` under your own account.
2. Ensure the contents of this folder are at the repository root.
3. Commit your genuine development progress and push the `main` branch.
4. In GitHub, choose **Settings → Pages → Deploy from a branch → main → /(root)**.
5. Wait for GitHub Pages to report a live URL, open it, and test sample loading, import/export, and navigation.
6. Put the actual verified URL at the top of this README, record the 2–3 minute demo video, and add its accessible link too.

## Academic integrity

Review and understand every feature before presenting it. Use your own GitHub account as the only contributor, retain honest commits that reflect your work, and explain any permitted assistance according to your course policy.

You can find my site:  https://ynshuti-cloud.github.io/Student-Finance-Tracker-/

Report Image: <img width="1086" height="632" alt="image" src="https://github.com/user-attachments/assets/fddd187b-1094-4140-bdf1-040319a85c0f" />


