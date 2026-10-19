(function () {
  const results = [];
  function test(name, callback) {
    try { callback(); results.push({ name, pass: true }); }
    catch (error) { results.push({ name, pass: false, message: error.message }); }
  }
  function equal(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }
  function truthy(value, message) {
    if (!value) throw new Error(message || "Expected a truthy value.");
  }

  const good = {
    id: "tx-test-001",
    type: "expense",
    amount: "5000",
    description: "Campus lunch",
    category: "Food",
    date: "2026-10-14",
    notes: "",
    createdAt: "2026-10-14T12:00:00.000Z",
    updatedAt: "2026-10-14T12:00:00.000Z"
  };

  test("Accepts a complete valid transaction", () => equal(AppValidators.validateTransaction(good, { requireMetadata: true }).length, 0));
  test("Rejects a zero amount", () => truthy(AppValidators.validateTransaction({ ...good, amount: "0" }).some(error => error.field === "amount")));
  test("Rejects more than two decimal places", () => truthy(AppValidators.validateTransaction({ ...good, amount: "12.345" }).some(error => error.field === "amount")));
  test("Rejects a non-date value", () => truthy(AppValidators.validateTransaction({ ...good, date: "yesterday" }).some(error => error.field === "date")));
  test("Rejects a date that does not exist", () => truthy(AppValidators.validateTransaction({ ...good, date: "2026-02-31" }).some(error => error.field === "date")));
  test("Rejects leading or trailing description spaces", () => truthy(AppValidators.validateTransaction({ ...good, description: " Campus lunch" }).some(error => error.field === "description")));
  test("Rejects repeated spaces in a description", () => truthy(AppValidators.validateTransaction({ ...good, description: "Campus  lunch" }).some(error => error.field === "description")));
  test("Rejects duplicate adjacent words with a back-reference", () => truthy(AppValidators.validateTransaction({ ...good, description: "Coffee coffee" }).some(error => error.field === "description")));
  test("Accepts a hyphenated category", () => equal(AppValidators.validateTransaction({ ...good, category: "School-Fees" }).length, 0));
  test("Rejects category double spaces", () => truthy(AppValidators.validateTransaction({ ...good, category: "School  Fees" }).some(error => error.field === "category")));
  test("Rejects imported records that lack timestamps", () => equal(AppValidators.validateImportedData([{ ...good, createdAt: undefined }]).valid, false));
  test("Rejects duplicate ids in imported JSON", () => equal(AppValidators.validateImportedData([good, { ...good }]).valid, false));
  test("Accepts an array of valid records", () => equal(AppValidators.validateImportedData([good]).valid, true));
  test("Regex search ignores case by default", () => equal(AppSearch.matches(good, AppSearch.parseSearch("LUNCH", false).regex), true));
  test("Case-sensitive regex search respects the toggle", () => equal(AppSearch.matches(good, AppSearch.parseSearch("LUNCH", true).regex), false));
  test("Regex search supports alternation", () => equal(AppSearch.matches(good, AppSearch.parseSearch("food|transport", false).regex), true));
  test("Invalid regex gives an error instead of throwing", () => equal(Boolean(AppSearch.parseSearch("[", false).error), true));
  test("Totals calculate income, expense, and balance", () => {
    const totals = AppState.getTotals([{ type: "income", amount: 100 }, { type: "expense", amount: 30 }]);
    equal([totals.income, totals.expense, totals.balance, totals.count], [100, 30, 70, 2]);
  });
  test("Category totals include expenses only", () => {
    const totals = AppState.getCategoryTotals([{ type: "expense", amount: 20, category: "Food" }, { type: "income", amount: 100, category: "Other" }]);
    equal(totals, [["Food", 20]]);
  });
  test("Seven-day trend contains seven calendar days", () => {
    const trend = AppState.getLastSevenDayTotals([{ type: "expense", amount: 50, date: "2026-10-16" }], new Date("2026-10-16T12:00:00"));
    equal([trend.length, trend[6].date, trend[6].amount], [7, "2026-10-16", 50]);
  });
  test("Normalising a new record adds timestamps", () => {
    const { id, createdAt, updatedAt, ...newRecord } = good;
    const record = AppState.normaliseRecord(newRecord);
    truthy(AppValidators.isValidTimestamp(record.createdAt));
    truthy(AppValidators.isValidTimestamp(record.updatedAt));
  });

  const list = document.getElementById("test-results");
  results.forEach(result => {
    const item = document.createElement("li");
    item.textContent = (result.pass ? "PASS — " : "FAIL — ") + result.name + (result.message ? ": " + result.message : "");
    item.style.marginBottom = "8px";
    list.appendChild(item);
  });
  const passed = results.filter(result => result.pass).length;
  document.getElementById("test-summary").textContent = `${passed} of ${results.length} tests passed.`;
  document.getElementById("test-summary").style.fontWeight = "700";
})();
