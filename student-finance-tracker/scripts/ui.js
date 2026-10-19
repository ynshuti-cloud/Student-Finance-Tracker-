/* DOM rendering helpers. Dynamic user text is escaped before it is added to HTML. */
(function () {
  function money(amountInRwf, settings) {
    const currency = settings.currency || "RWF";
    const rate = Number(settings.exchangeRates && settings.exchangeRates[currency]) || 1;
    const amount = Number(amountInRwf || 0) / rate;
    const fractionDigits = currency === "RWF" ? 0 : 2;
    const formatted = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: fractionDigits }).format(amount);
    return currency + " " + formatted;
  }

  function renderStats(records, settings) {
    const totals = AppState.getTotals(records);
    document.getElementById("balance-total").textContent = money(totals.balance, settings);
    document.getElementById("income-total").textContent = money(totals.income, settings);
    document.getElementById("expense-total").textContent = money(totals.expense, settings);
    document.getElementById("record-count").textContent = String(totals.count);
    const topCategory = AppState.getCategoryTotals(records)[0];
    document.getElementById("top-category").textContent = topCategory ? topCategory[0] : "None yet";
    document.getElementById("top-category-note").textContent = topCategory ? money(topCategory[1], settings) + " spent" : "Add an expense to calculate it";
  }

  function sortRecords(records, sortBy) {
    const copy = records.slice();
    if (sortBy === "date-old") return copy.sort((first, second) => first.date.localeCompare(second.date));
    if (sortBy === "amount-high") return copy.sort((first, second) => second.amount - first.amount);
    if (sortBy === "amount-low") return copy.sort((first, second) => first.amount - second.amount);
    if (sortBy === "description") return copy.sort((first, second) => first.description.localeCompare(second.description));
    return copy.sort((first, second) => second.date.localeCompare(first.date));
  }

  function inlineEditRow(record, settings) {
    const safeId = AppSearch.escapeHTML(record.id);
    const safeDescription = AppSearch.escapeHTML(record.description);
    const safeCategory = AppSearch.escapeHTML(record.category);
    const safeNotes = AppSearch.escapeHTML(record.notes || "");
    const typeOptions = ["expense", "income"].map(type => `<option value="${type}"${record.type === type ? " selected" : ""}>${type[0].toUpperCase() + type.slice(1)}</option>`).join("");
    return `<tr class="editing-row" data-row-id="${safeId}">
      <td><label class="visually-hidden" for="edit-date-${safeId}">Date</label><input id="edit-date-${safeId}" data-field="date" type="date" value="${AppSearch.escapeHTML(record.date)}"></td>
      <td><label class="visually-hidden" for="edit-description-${safeId}">Description</label><input id="edit-description-${safeId}" data-field="description" type="text" maxlength="80" value="${safeDescription}"><label class="visually-hidden" for="edit-notes-${safeId}">Notes</label><input id="edit-notes-${safeId}" data-field="notes" type="text" maxlength="180" value="${safeNotes}" placeholder="Optional notes"></td>
      <td><label class="visually-hidden" for="edit-category-${safeId}">Category</label><input id="edit-category-${safeId}" data-field="category" list="category-options" maxlength="25" value="${safeCategory}"></td>
      <td><label class="visually-hidden" for="edit-type-${safeId}">Transaction type</label><select id="edit-type-${safeId}" data-field="type">${typeOptions}</select></td>
      <td class="amount-cell"><label class="visually-hidden" for="edit-amount-${safeId}">Amount in RWF</label><input id="edit-amount-${safeId}" data-field="amount" type="text" inputmode="decimal" value="${AppSearch.escapeHTML(record.amount)}"></td>
      <td><div class="row-actions"><button class="small-action" type="button" data-action="save-inline" data-id="${safeId}">Save</button><button class="small-action" type="button" data-action="cancel-inline" data-id="${safeId}">Cancel</button></div><p class="inline-error" data-inline-error role="status" aria-live="polite"></p></td>
    </tr>`;
  }

  function renderRecords(records, settings, regex, typeFilter, editingId) {
    const body = document.getElementById("transaction-list");
    const filtered = records.filter(record => (typeFilter === "all" || record.type === typeFilter) && AppSearch.matches(record, regex));
    const sorted = sortRecords(filtered, document.getElementById("sort-by").value);
    if (!sorted.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty-state">No matching transactions. Try another search or add a record.</td></tr>';
    } else {
      body.innerHTML = sorted.map(record => {
        if (record.id === editingId) return inlineEditRow(record, settings);
        const typeClass = record.type === "income" ? "income" : "expense";
        return `<tr data-row-id="${AppSearch.escapeHTML(record.id)}">
          <td>${AppSearch.highlight(record.date, regex)}</td>
          <td><strong>${AppSearch.highlight(record.description, regex)}</strong>${record.notes ? `<br><small>${AppSearch.highlight(record.notes, regex)}</small>` : ""}</td>
          <td>${AppSearch.highlight(record.category, regex)}</td>
          <td><span class="type-badge ${typeClass}">${AppSearch.highlight(record.type, regex)}</span></td>
          <td class="amount-cell"><span class="amount ${typeClass}">${record.type === "income" ? "+" : "−"}${money(record.amount, settings)}</span></td>
          <td><div class="row-actions"><button class="small-action" type="button" data-action="edit" data-id="${AppSearch.escapeHTML(record.id)}" aria-label="Edit ${AppSearch.escapeHTML(record.description)} inline">Edit</button><button class="small-action delete" type="button" data-action="delete" data-id="${AppSearch.escapeHTML(record.id)}" aria-label="Delete ${AppSearch.escapeHTML(record.description)}">Delete</button></div></td>
        </tr>`;
      }).join("");
    }
    document.getElementById("search-message").textContent = `Showing ${sorted.length} of ${records.length} transaction(s).`;
  }

  function renderBudget(records, settings) {
    const used = AppState.getWeeklyExpense(records, new Date());
    const limit = Math.max(0.01, Number(settings.weeklyLimit) || 0.01);
    const percent = Math.round((used / limit) * 100);
    const visiblePercent = Math.min(percent, 100);
    const remaining = limit - used;
    document.getElementById("budget-used-text").textContent = money(used, settings) + " used this week";
    document.getElementById("budget-percent").textContent = percent + "%";
    const progress = document.getElementById("budget-progress");
    progress.setAttribute("aria-valuenow", String(visiblePercent));
    progress.setAttribute("aria-valuetext", percent + "% of the weekly limit used");
    document.getElementById("budget-progress-fill").style.width = visiblePercent + "%";
    document.getElementById("budget-progress-fill").className = "progress-fill" + (percent >= 100 ? " over" : percent >= 80 ? " warning" : "");
    const message = document.getElementById("budget-message");
    if (percent >= 100) {
      message.textContent = "Over the weekly limit by " + money(Math.abs(remaining), settings) + ".";
      message.className = "budget-message over";
      message.setAttribute("aria-live", "assertive");
      message.setAttribute("role", "alert");
    } else if (percent >= 80) {
      message.textContent = money(remaining, settings) + " remaining before your weekly limit.";
      message.className = "budget-message warning";
      message.setAttribute("aria-live", "polite");
      message.setAttribute("role", "status");
    } else {
      message.textContent = money(remaining, settings) + " remaining in your weekly limit.";
      message.className = "budget-message";
      message.setAttribute("aria-live", "polite");
      message.setAttribute("role", "status");
    }
  }

  function renderChart(records, settings) {
    const target = document.getElementById("category-chart");
    const totals = AppState.getCategoryTotals(records);
    if (!totals.length) {
      target.innerHTML = '<p class="muted">Add expenses to see your spending breakdown.</p>';
      return;
    }
    const max = totals[0][1] || 1;
    target.innerHTML = totals.slice(0, 5).map(([category, amount]) => `<div class="chart-row" role="listitem"><span class="chart-label">${AppSearch.escapeHTML(category)}</span><div class="chart-track" aria-hidden="true"><div class="chart-fill" style="width:${Math.max(3, amount / max * 100)}%"></div></div><span class="chart-amount">${money(amount, settings)}</span></div>`).join("");
  }

  function renderTrend(records, settings) {
    const target = document.getElementById("trend-chart");
    const days = AppState.getLastSevenDayTotals(records, new Date());
    const max = Math.max(...days.map(day => day.amount), 1);
    const total = days.reduce((sum, day) => sum + day.amount, 0);
    target.setAttribute("aria-label", "Expenses in the last seven days total " + money(total, settings) + ".");
    target.innerHTML = days.map(day => {
      const height = day.amount ? Math.max(4, Math.round(day.amount / max * 100)) : 2;
      return `<div class="trend-column" title="${AppSearch.escapeHTML(day.date + ": " + money(day.amount, settings))}"><div class="trend-bar-wrap" aria-hidden="true"><div class="trend-bar" style="height:${height}%"></div></div><span class="trend-label">${AppSearch.escapeHTML(day.label)}</span></div>`;
    }).join("");
  }

  function renderCategoryOptions(categories) {
    const datalist = document.getElementById("category-options");
    datalist.innerHTML = categories.map(category => `<option value="${AppSearch.escapeHTML(category)}"></option>`).join("");
  }

  function renderCategorySettings(categories) {
    const target = document.getElementById("category-list");
    target.innerHTML = categories.map(category => `<li class="category-chip">${AppSearch.escapeHTML(category)}<button type="button" data-action="remove-category" data-category="${AppSearch.escapeHTML(category)}" aria-label="Remove ${AppSearch.escapeHTML(category)} category">×</button></li>`).join("");
  }

  window.AppUI = { money, renderStats, renderRecords, renderBudget, renderChart, renderTrend, renderCategoryOptions, renderCategorySettings };
})();
