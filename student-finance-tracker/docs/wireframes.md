# M1 — Low-fidelity wireframes

These text wireframes show the planned layout before styling. They are intentionally simple and can be used as the low-fidelity design deliverable.

## Desktop (1024 px and wider)

```text
+------------------------------------------------------------------+
| CW Campus Wallet                         [Load sample data]       |
+------------------------------------------------------------------+
| YOUR MONEY OVERVIEW                                               |
| Keep an eye on your money.                     [Personal dashboard]|
+---------------+---------------+---------------+------------------+
| Current       | Money         | Money         | Transactions     |
| balance       | received      | spent         | count            |
+---------------+---------------+---------------+------------------+
| New transaction                  | Weekly expense limit           |
| Type       Amount                | Limit input [Update limit]     |
| Description                      | Progress bar / warning         |
| Category    Date                 | Spending by category chart      |
| Notes                            |                                 |
| [Save transaction]               |                                 |
+------------------------------------------------------------------+
| Transactions   [Export JSON] [Import JSON]                        |
| Search          Type filter          Sort                         |
| Date | Description | Category | Type | Amount | Actions           |
| ...                                                            ...|
+------------------------------------------------------------------+
| Settings: currency label / comfortable or compact display         |
+------------------------------------------------------------------+
```

## Tablet (768 px)

```text
+-----------------------------------------------+
| Campus Wallet              [Load sample data]  |
+-----------------------------------------------+
| Balance       Income                           |
| Expenses      Transactions                     |
+-----------------------------------------------+
| New transaction                                |
| Type / Amount                                  |
| Description                                    |
| Category / Date                                |
| Notes                 [Save transaction]       |
+-----------------------------------------------+
| Weekly expense limit                           |
| Progress / warning / category chart            |
+-----------------------------------------------+
| Transactions                                   |
| Search                                         |
| Type filter / Sort                             |
| Horizontally scrollable table                  |
+-----------------------------------------------+
| Settings                                       |
+-----------------------------------------------+
```

## Mobile (360 px)

```text
+-----------------------------+
| CW Campus Wallet            |
| [Load sample data]          |
+-----------------------------+
| Keep an eye on your money.  |
+-----------------------------+
| Balance          Income     |
| Expenses         Count      |
+-----------------------------+
| New transaction             |
| Type                         |
| Amount                       |
| Description                  |
| Category                     |
| Date                         |
| Notes                        |
| [Save transaction]           |
+-----------------------------+
| Weekly limit                 |
| Progress / warning            |
| Category chart                |
+-----------------------------+
| Transactions                 |
| Search                       |
| Type                         |
| Sort                         |
| Scroll table sideways        |
+-----------------------------+
| Settings                     |
+-----------------------------+
```

## Design decisions
- Cards group related information so students can scan it quickly.
- Green is used for income and positive states; red is used for expenses and errors.
- The transaction form appears before the transaction list to make the main action easy to find.
- The table scrolls horizontally on narrow screens instead of squeezing every column into unreadable text.
