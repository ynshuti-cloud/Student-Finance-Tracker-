/* DOM rendering helpers. Dynamic user text is escaped before it is added to HTML. */
(function () {
  function money(amount, currency) {
    const value = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(amount) || 0);
    return (currency || "RWF") + " " + value;
  }
  function renderStats(records, currency) {
    const totals = AppState.getTotals(records);
    document.getElementById("balance-total").textContent = money(totals.balance, currency);
    document.getElementById("income-total").textContent = money(totals.income, currency);
    document.getElementById("expense-total").textContent = money(totals.expense, currency);
    document.getElementById("record-count").textContent = String(totals.count);
  }
  function sortRecords(records, sortBy) {
    const copy = records.slice();
    if (sortBy === "date-old") return copy.sort((a, b) => a.date.localeCompare(b.date));
    if (sortBy === "amount-high") return copy.sort((a, b) => b.amount - a.amount);
    if (sortBy === "amount-low") return copy.sort((a, b) => a.amount - b.amount);
    if (sortBy === "description") return copy.sort((a, b) => a.description.localeCompare(b.description));
    return copy.sort((a, b) => b.date.localeCompare(a.date));
  }
  function renderRecords(records, currency, regex, typeFilter) {
    const body = document.getElementById("transaction-list");
    const filtered = records.filter(record => (typeFilter === "all" || record.type === typeFilter) && AppSearch.matches(record, regex));
    const sorted = sortRecords(filtered, document.getElementById("sort-by").value);
    if (!sorted.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty-state">No matching transactions. Try another search or add a record.</td></tr>';
    } else {
      body.innerHTML = sorted.map(record => {
        const typeClass = record.type === "income" ? "income" : "expense";
        return `<tr data-row-id="${AppSearch.escapeHTML(record.id)}">
          <td>${AppSearch.escapeHTML(record.date)}</td>
          <td><strong>${AppSearch.highlight(record.description, regex)}</strong>${record.notes ? `<br><small>${AppSearch.escapeHTML(record.notes)}</small>` : ""}</td>
          <td>${AppSearch.highlight(record.category, regex)}</td>
          <td><span class="type-badge ${typeClass}">${record.type}</span></td>
          <td class="amount-cell"><span class="amount ${typeClass}">${record.type === "income" ? "+" : "−"}${money(record.amount, currency)}</span></td>
          <td><div class="row-actions"><button class="small-action" type="button" data-action="edit" data-id="${AppSearch.escapeHTML(record.id)}" aria-label="Edit ${AppSearch.escapeHTML(record.description)}">Edit</button><button class="small-action delete" type="button" data-action="delete" data-id="${AppSearch.escapeHTML(record.id)}" aria-label="Delete ${AppSearch.escapeHTML(record.description)}">Delete</button></div></td>
        </tr>`;
      }).join("");
    }
    document.getElementById("search-message").textContent = `Showing ${sorted.length} of ${records.length} transaction(s).`;
  }
  function renderBudget(records, settings, currency) {
    const used = AppState.getWeeklyExpense(records, new Date());
    const limit = Math.max(1, Number(settings.weeklyLimit) || 1);
    const percent = Math.round((used / limit) * 100);
    const visiblePercent = Math.min(percent, 100);
    document.getElementById("budget-used-text").textContent = money(used, currency) + " used this week";
    document.getElementById("budget-percent").textContent = percent + "%";
    const progress = document.getElementById("budget-progress");
    progress.setAttribute("aria-valuenow", String(visiblePercent));
    document.getElementById("budget-progress-fill").style.width = visiblePercent + "%";
    document.getElementById("budget-progress-fill").className = "progress-fill" + (percent >= 100 ? " over" : percent >= 80 ? " warning" : "");
    const message = document.getElementById("budget-message");
    if (percent >= 100) { message.textContent = "You have reached or passed your weekly limit."; message.className = "budget-message over"; }
    else if (percent >= 80) { message.textContent = "You are getting close to your weekly limit."; message.className = "budget-message warning"; }
    else { message.textContent = "You are within your weekly limit."; message.className = "budget-message"; }
  }
  function renderChart(records, currency) {
    const target = document.getElementById("category-chart");
    const totals = AppState.getCategoryTotals(records);
    if (!totals.length) {
      target.innerHTML = '<p class="muted">Add expenses to see your spending breakdown.</p>';
      return;
    }
    const max = totals[0][1] || 1;
    target.innerHTML = totals.slice(0, 5).map(([category, amount]) => `<div class="chart-row"><span class="chart-label">${AppSearch.escapeHTML(category)}</span><div class="chart-track" aria-hidden="true"><div class="chart-fill" style="width:${Math.max(3, amount / max * 100)}%"></div></div><span class="chart-amount">${money(amount, currency)}</span></div>`).join("");
  }
  window.AppUI = { money, renderStats, renderRecords, renderBudget, renderChart };
})();
