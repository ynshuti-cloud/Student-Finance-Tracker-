# M1 — Project specification

## Project name
Campus Wallet — Student Finance Tracker

## Problem
Students receive money from different sources and spend it on food, transport, housing and school needs. When they do not record these transactions, it becomes difficult to see how much they have left or whether they are spending too much.

## Target users
Students who want a simple personal budget tracker that works in a browser and does not require an account.

## Goals
1. Let a student record income and expenses.
2. Make it easy to find, sort, edit and remove transactions.
3. Show a simple summary of money received, spent and remaining.
4. Help students compare weekly spending with a limit and a seven-day trend.
5. Keep data on the current device and allow a validated JSON backup.
6. Display the RWF base amount in RWF, USD, or EUR using manual rates.

## Main user stories
- As a student, I can add an income or expense with an amount, category, description and date.
- As a student, I can edit a transaction directly in its table row or delete it if I make a mistake.
- As a student, I can search using a regular expression and choose whether matching is case-sensitive.
- As a student, I can sort and filter records to find a transaction quickly.
- As a student, I can see my current balance, totals, top category, and seven-day spending trend.
- As a student, I can set a weekly expense limit and receive a remaining or overage message.
- As a student, I can export my data and import a valid JSON backup.
- As a student, I can reload the page without losing saved records.

## Functional requirements
- Required fields are validated while typing and before a record is saved, including a back-reference rule for duplicate adjacent words.
- Records receive unique ids and `createdAt`/`updatedAt` timestamps.
- Amount must be a positive number with no more than two decimal places.
- The date must be a real date in YYYY-MM-DD format.
- Imported JSON must be an array of complete valid records with unique ids and must not exceed 1,000 records.
- The dashboard recalculates when records change.
- Search results update as the user types and malformed regex patterns are handled safely.
- Settings, manual currency rates, categories, and records are stored using localStorage.

## Non-functional requirements
- Use beginner-friendly vanilla HTML, CSS and JavaScript.
- Use semantic HTML landmarks, an About/contact section, skip links, live regions, and visible keyboard focus.
- Support mobile-first phone, tablet, and desktop screen widths.
- Escape user-entered text before rendering it as HTML.
- Keep the app responsive and avoid external frameworks.

## Scope and limitations
The app is local to one browser and device. It does not have sign-in, cloud sync, bank integration, or live exchange-rate APIs. It does convert display values using rates the student enters manually in Settings. Records are not encrypted, so users should not use it to store sensitive financial account details.

## Success criteria
The user can add, inline edit, delete, search, sort, filter, export, and import complete transactions; dashboard totals, top category, and seven-day trend update; the weekly limit remaining/overage message works; manual currency conversion works; sample data loads; data persists after refresh; and the app is usable with a keyboard and on a small screen.
