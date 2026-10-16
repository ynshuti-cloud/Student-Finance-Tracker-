# Campus Wallet — Student Finance Tracker

A beginner-friendly finance tracker built with plain HTML, CSS and JavaScript. It is designed for students who want to record money received and money spent without needing an account or a server.

## 1. Run the project

1. Download and unzip the project folder.
2. Open the folder in Visual Studio Code.
3. Install the **Live Server** extension if you do not already have it.
4. Right-click `index.html` and choose **Open with Live Server**.
5. The app opens in your browser. Select **Load sample data** to add the 12 example transactions.

You can also open `index.html` directly for most features. Use Live Server for sample-data loading and testing because browsers can block `fetch()` when a page is opened as a local file.

## 2. Features implemented

- Add income and expense transactions.
- Edit and delete a transaction using the form and row action buttons.
- Validate type, positive amount, description, category, date and notes.
- Show balance, total income, total expenses and record count.
- Search with plain text or JavaScript regular expressions, and highlight matches.
- Filter by income/expense and sort by date, amount or description.
- Set a weekly expense limit with a progress bar and a live warning when nearing or passing the limit.
- Show the five highest expense categories in a small chart.
- Save records and settings in `localStorage`.
- Export records to JSON and import a JSON array after validation.
- Choose a display currency label and comfortable/compact spacing.
- Responsive layout for phone, tablet and desktop widths.
- Keyboard support: `/` focuses search when you are not typing in a field; `Escape` clears search when the search field is focused.

**Currency note:** The currency setting changes the label only. It does not convert saved values or use live exchange rates.

## 3. Project structure

```text
student-finance-tracker/
├── index.html
├── tests.html
├── seed.json
├── README.md
├── styles/
│   └── style.css
├── scripts/
│   ├── main.js
│   ├── validators.js
│   ├── storage.js
│   ├── state.js
│   ├── search.js
│   └── ui.js
├── tests/
│   └── tests.js
└── docs/
    ├── project-spec.md
    ├── wireframes.md
    ├── milestones.md
    └── demo-script.md
```

## 4. Regex catalogue

The main patterns are in `scripts/validators.js`.

| Name | Pattern | Purpose |
|---|---|---|
| Description | `^[A-Za-z0-9][A-Za-z0-9 '&.,()/-]{1,79}$` | Allows a readable description between 2 and 80 characters, beginning with a letter or number. |
| Category | `^[A-Za-z][A-Za-z ]{1,24}$` | Allows a category made from letters and spaces. |
| Date format | `^\d{4}-\d{2}-\d{2}$` | Checks the YYYY-MM-DD shape; JavaScript date checking also rejects impossible dates. |
| Positive amount | `^[1-9]\d*(\.\d{1,2})?$` | Allows a positive whole number or an amount with one or two decimal places. |
| Regex search | `/food|transport/i` | Finds records containing either word without case sensitivity. |
| Plain search | `lunch` | Searches for the literal text “lunch”; special regex characters are escaped automatically. |

Search examples:
- `/food|transport/i` — matches Food or Transport.
- `/^monthly/i` — description or other searchable text beginning with “monthly”.
- `/book|school/i` — matches records with book or school in the searchable text.
- `lunch` — normal text search.

If a slash-delimited regular expression is malformed, the app displays a message instead of crashing.

## 5. Accessibility notes

- The page uses semantic `header`, `main`, `section`, `form`, `table` and `footer` elements.
- Inputs have visible labels.
- A skip link lets keyboard users skip to the main content.
- Focus indicators are visible when navigating with a keyboard.
- Important messages use `role="alert"` or `aria-live`.
- The budget progress bar exposes its value through ARIA attributes.
- The table has a caption and column headers.
- Buttons have readable names, including names that identify the transaction being edited or deleted.
- The interface remains usable at narrow screen widths and the table can scroll horizontally if necessary.

## 6. Test plan

Open `tests.html` using Live Server. It runs 12 browser-based checks covering validation, invalid imports, search parsing and basic calculations. Then test these manual scenarios:

1. Add a valid expense and confirm the table and dashboard update.
2. Try an amount of `0`, a negative amount, a blank description and an impossible date.
3. Edit an existing record and confirm the changed values appear.
4. Delete a record and confirm totals change.
5. Search for `/food|transport/i`, then try an invalid pattern such as `/[/`.
6. Change the sort order and transaction type filter.
7. Set a low weekly limit and confirm the warning appears as expenses approach or pass it.
8. Export JSON, clear or change records, and import the exported file.
9. Reload the page and confirm records remain saved.
10. Resize the browser to around 360 px, 768 px and 1024 px.
11. Use Tab, Shift+Tab, Enter, `/` and Escape without a mouse.

## 7. Deploy to GitHub Pages

1. Create a GitHub repository named `student-finance-tracker`.
2. Put all project files in the repository root (not inside an extra nested project folder).
3. In VS Code terminal, run:

   ```bash
   git init
   git add .
   git commit -m "Build Campus Wallet student finance tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/student-finance-tracker.git
   git push -u origin main
   ```

4. Replace `YOUR-USERNAME` with your own GitHub username.
5. In the repository, open **Settings → Pages**.
6. Under build and deployment, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
7. Wait for the published link to appear in the Pages section.
8. Open the link and check the main features. Keep `seed.json` at the repository root so sample data can load.

## 8. Academic integrity and final checks

Make sure you understand each file and can explain the validation, search, storage and rendering functions. Adjust labels and styling in your own words if needed, and follow your course rules for disclosing assistance. The demo video and GitHub publication must be completed by you using the instructions in `docs/demo-script.md` and the deployment steps above.
