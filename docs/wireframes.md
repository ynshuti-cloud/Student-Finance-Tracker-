# M1 — Low-fidelity wireframes

These text wireframes show the planned information architecture before detailed styling.

## Desktop (1024 px and wider)

```text
+------------------------------------------------------------------+
| CW Campus Wallet  Dashboard Records Settings About [Sample data] |
+------------------------------------------------------------------+
| YOUR MONEY OVERVIEW                                               |
| Keep an eye on your money.                     [Personal dashboard]|
+-----------+-----------+-----------+-----------+------------------+
| Balance   | Income    | Expenses  | Top cat.  | Transactions     |
+-----------+-----------+-----------+-----------+------------------+
| New transaction                  | Weekly expense limit           |
| Type       Amount in RWF          | Limit input [Update limit]     |
| Description + live error          | Progress / remaining / overage |
| Editable category   Date          | Category chart                 |
| Notes                             | Last-7-days trend chart        |
| [Save transaction]               |                                 |
+------------------------------------------------------------------+
| Transactions   [Export JSON] [Import JSON]                        |
| Regex search + case toggle | Type filter | Sort                   |
| Date | Description | Category | Type | Amount | Inline actions     |
+------------------------------------------------------------------+
| Settings: display currency, USD/EUR manual rates, density         |
| Editable categories: Food, Books, Transport, Entertainment ...    |
+------------------------------------------------------------------+
| About: purpose, GitHub, email                                     |
+------------------------------------------------------------------+
```

## Tablet (768 px)

```text
+--------------------------------------------------+
| Campus Wallet  navigation links  [Sample data]   |
+--------------------------------------------------+
| Balance | Income | Expenses                      |
| Top category | Record count                      |
+--------------------------------------------------+
| New transaction                                 |
| Type / Amount                                   |
| Description + live validation                   |
| Category / Date / Notes  [Save]                 |
+--------------------------------------------------+
| Weekly expense limit                             |
| Progress / remaining message                     |
| Category chart / seven-day trend                 |
+--------------------------------------------------+
| Transactions, regex search, case toggle          |
| Type / sort / horizontally scrollable table      |
+--------------------------------------------------+
| Settings, categories, About                      |
+--------------------------------------------------+
```

## Mobile (360 px)

```text
+------------------------------+
| CW Campus Wallet [Sample]    |
| Dashboard Records Settings   |
+------------------------------+
| Balance       Income          |
| Expenses      Top category    |
| Records                      |
+------------------------------+
| New transaction              |
| Type                         |
| Amount in RWF                |
| Description + live error     |
| Category                     |
| Date                         |
| Notes                        |
| [Save transaction]           |
+------------------------------+
| Weekly limit / progress      |
| Category chart / trend       |
+------------------------------+
| Regex search / case toggle   |
| Filters / scrollable table   |
+------------------------------+
| Settings / categories / About|
+------------------------------+
```

## Design decisions

- Cards give students a quick financial snapshot before they interact with the form.
- The app remains one-column by default, then adds columns at 600px, 768px, and 1024px.
- Green represents positive actions and income; red represents destructive actions and errors.
- The table stays scrollable on narrow screens so column headings and inline editing remain understandable.
- Search, validation, budget, import, and save feedback are announced without moving keyboard focus unnecessarily.
