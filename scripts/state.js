/* Record normalization and dashboard calculations. */
(function () {
  function makeId() {
    const random = Math.random().toString(36).slice(2, 10);
    return "tx-" + Date.now().toString(36) + "-" + random;
  }

  function normaliseRecord(record, existingRecord) {
    const now = new Date().toISOString();
    return {
      id: existingRecord ? existingRecord.id : (record.id || makeId()),
      type: record.type,
      amount: Number(record.amount),
      description: record.description.trim(),
      category: record.category.trim(),
      date: record.date,
      notes: (record.notes || "").trim(),
      createdAt: existingRecord ? existingRecord.createdAt : (record.createdAt || now),
      updatedAt: existingRecord ? now : (record.updatedAt || now)
    };
  }

  function getTotals(records) {
    const income = records.filter(record => record.type === "income").reduce((sum, record) => sum + Number(record.amount), 0);
    const expense = records.filter(record => record.type === "expense").reduce((sum, record) => sum + Number(record.amount), 0);
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
    return records.filter(record => record.type === "expense").filter(record => {
      const date = new Date(record.date + "T00:00:00");
      return date >= start && date < end;
    }).reduce((sum, record) => sum + Number(record.amount), 0);
  }

  function getCategoryTotals(records) {
    const totals = {};
    records.filter(record => record.type === "expense").forEach(record => {
      totals[record.category] = (totals[record.category] || 0) + Number(record.amount);
    });
    return Object.entries(totals).sort((first, second) => second[1] - first[1]);
  }

  function dateKey(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function getLastSevenDayTotals(records, now) {
    const current = now ? new Date(now) : new Date();
    current.setHours(0, 0, 0, 0);
    const totals = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date(current);
      day.setDate(current.getDate() - offset);
      const key = dateKey(day);
      const amount = records.filter(record => record.type === "expense" && record.date === key)
        .reduce((sum, record) => sum + Number(record.amount), 0);
      totals.push({
        date: key,
        label: day.toLocaleDateString("en-US", { weekday: "short" }),
        amount: amount
      });
    }
    return totals;
  }

  window.AppState = { makeId, normaliseRecord, getTotals, getWeeklyExpense, getCategoryTotals, getLastSevenDayTotals };
})();
