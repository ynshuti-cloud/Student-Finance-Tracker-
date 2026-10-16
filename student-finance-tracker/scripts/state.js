/* Simple app state and calculations. */
(function () {
  function makeId() {
    return "tx-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }
  function normaliseRecord(record) {
    return {
      id: record.id || makeId(),
      type: record.type,
      amount: Number(record.amount),
      description: record.description.trim(),
      category: record.category.trim(),
      date: record.date,
      notes: (record.notes || "").trim()
    };
  }
  function getTotals(records) {
    const income = records.filter(r => r.type === "income").reduce((sum, r) => sum + Number(r.amount), 0);
    const expense = records.filter(r => r.type === "expense").reduce((sum, r) => sum + Number(r.amount), 0);
    return { income, expense, balance: income - expense, count: records.length };
  }
  function getStartOfWeek(date) {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = result.getDay();
    result.setDate(result.getDate() - ((day + 6) % 7));
    result.setHours(0, 0, 0, 0);
    return result;
  }
  function getWeeklyExpense(records, now) {
    const start = getStartOfWeek(now || new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return records.filter(r => r.type === "expense").filter(r => {
      const date = new Date(r.date + "T00:00:00");
      return date >= start && date < end;
    }).reduce((sum, r) => sum + Number(r.amount), 0);
  }
  function getCategoryTotals(records) {
    const totals = {};
    records.filter(r => r.type === "expense").forEach(r => {
      totals[r.category] = (totals[r.category] || 0) + Number(r.amount);
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }
  window.AppState = { makeId, normaliseRecord, getTotals, getWeeklyExpense, getCategoryTotals };
})();
