(function () {
  const results = [];
  function test(name, callback) {
    try { callback(); results.push({ name, pass: true }); }
    catch (error) { results.push({ name, pass: false, message: error.message }); }
  }
  function equal(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }
  const good = { type: "expense", amount: "5000", description: "Campus lunch", category: "Food", date: "2026-10-01", notes: "" };
  test("Accepts a valid transaction", () => equal(AppValidators.validateTransaction(good).length, 0));
  test("Rejects a negative amount", () => equal(AppValidators.validateTransaction({...good, amount: "-10"}).length > 0, true));
  test("Rejects a non-date value", () => equal(AppValidators.validateTransaction({...good, date: "yesterday"}).length > 0, true));
  test("Rejects a date that does not exist", () => equal(AppValidators.validateTransaction({...good, date: "2026-02-31"}).length > 0, true));
  test("Rejects unsupported transaction type", () => equal(AppValidators.validateTransaction({...good, type: "transfer"}).length > 0, true));
  test("Rejects non-array JSON import", () => equal(AppValidators.validateImportedData({}).valid, false));
  test("Accepts an array of valid records", () => equal(AppValidators.validateImportedData([good]).valid, true));
  test("Plain text search ignores case", () => equal(AppSearch.matches(good, AppSearch.parseSearch("LUNCH").regex), true));
  test("Regex search supports alternation", () => equal(AppSearch.matches(good, AppSearch.parseSearch("/food|transport/i").regex), true));
  test("Invalid regex gives an error", () => equal(Boolean(AppSearch.parseSearch("/[/").error), true));
  test("Totals calculate income, expense and balance", () => {
    const totals = AppState.getTotals([{type:"income",amount:100},{type:"expense",amount:30}]);
    equal([totals.income, totals.expense, totals.balance, totals.count], [100,30,70,2]);
  });
  test("Category totals include expenses only", () => {
    const totals = AppState.getCategoryTotals([{type:"expense",amount:20,category:"Food"},{type:"income",amount:100,category:"Salary"}]);
    equal(totals, [["Food",20]]);
  });
  const list = document.getElementById("test-results");
  results.forEach(result => {
    const li = document.createElement("li");
    li.textContent = (result.pass ? "PASS — " : "FAIL — ") + result.name + (result.message ? ": " + result.message : "");
    li.style.marginBottom = "8px";
    list.appendChild(li);
  });
  const passed = results.filter(result => result.pass).length;
  document.getElementById("test-summary").textContent = `${passed} of ${results.length} tests passed.`;
  document.getElementById("test-summary").style.fontWeight = "700";
})();
