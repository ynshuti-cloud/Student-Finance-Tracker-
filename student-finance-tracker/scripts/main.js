/* Application events and page updates. */
(function () {
  let records = AppStorage.readRecords();
  let settings = AppStorage.readSettings();
  let currentRegex = null;
  let searchError = "";
  let editingId = null;
  const form = document.getElementById("transaction-form");
  const formMessage = document.getElementById("form-message");
  const fieldIds = { type: "type", amount: "amount", description: "description", category: "category", date: "date" };

  function announce(message) {
    document.getElementById("app-announcement").textContent = message;
  }

  function today() {
    const now = new Date();
    return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  }

  function saveAll() {
    const recordsSaved = AppStorage.saveRecords(records);
    const settingsSaved = AppStorage.saveSettings(settings);
    const status = document.getElementById("storage-status");
    if (recordsSaved && settingsSaved) {
      status.textContent = "Saved locally on this device";
      return true;
    }
    status.textContent = "Could not save locally. Free storage space and try again.";
    announce("Your latest change could not be saved locally.");
    return false;
  }

  function setSearchMessage() {
    const message = document.getElementById("search-message");
    if (searchError) {
      message.textContent = searchError;
      message.style.color = "#9d2525";
    } else {
      message.style.color = "";
    }
  }

  function refresh() {
    AppUI.renderStats(records, settings);
    AppUI.renderRecords(records, settings, currentRegex, document.getElementById("type-filter").value, editingId);
    AppUI.renderBudget(records, settings);
    AppUI.renderChart(records, settings);
    AppUI.renderTrend(records, settings);
    AppUI.renderCategoryOptions(settings.categories);
    AppUI.renderCategorySettings(settings.categories);
    document.getElementById("weekly-limit").value = settings.weeklyLimit;
    document.getElementById("currency").value = settings.currency;
    document.getElementById("compact-mode").value = settings.display;
    document.getElementById("rate-usd").value = settings.exchangeRates.USD;
    document.getElementById("rate-eur").value = settings.exchangeRates.EUR;
    document.body.classList.toggle("compact-mode", settings.display === "compact");
    setSearchMessage();
  }

  function formRecord() {
    const data = new FormData(form);
    return {
      type: String(data.get("type") || ""),
      amount: String(data.get("amount") || ""),
      description: String(data.get("description") || ""),
      category: String(data.get("category") || ""),
      date: String(data.get("date") || ""),
      notes: String(data.get("notes") || "")
    };
  }

  function collapseDescriptionSpaces(value) {
    return value.replace(/\s{2,}/g, " ");
  }

  function showFormErrors(errors) {
    const byField = errors.reduce((result, error) => {
      if (!result[error.field]) result[error.field] = error.message;
      return result;
    }, {});
    Object.keys(fieldIds).forEach(field => {
      const input = document.getElementById(fieldIds[field]);
      const errorTarget = document.getElementById(field + "-error");
      const message = byField[field] || "";
      if (errorTarget) errorTarget.textContent = message;
      input.setAttribute("aria-invalid", message ? "true" : "false");
    });
    return byField;
  }

  function validateFormField(field) {
    const errors = AppValidators.validateTransaction(formRecord());
    showFormErrors(errors);
    return !errors.some(error => error.field === field);
  }

  function resetForm() {
    form.reset();
    document.getElementById("record-id").value = "";
    document.getElementById("date").value = today();
    document.getElementById("category").value = settings.categories[0] || "Food";
    formMessage.textContent = "";
    showFormErrors([]);
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const rawRecord = formRecord();
    rawRecord.description = collapseDescriptionSpaces(rawRecord.description);
    document.getElementById("description").value = rawRecord.description;
    const errors = AppValidators.validateTransaction(rawRecord);
    showFormErrors(errors);
    if (errors.length) {
      formMessage.textContent = "Please correct the highlighted fields before saving.";
      const first = errors.find(error => fieldIds[error.field]);
      if (first) document.getElementById(fieldIds[first.field]).focus();
      return;
    }
    records.push(AppState.normaliseRecord(rawRecord));
    saveAll();
    refresh();
    resetForm();
    announce("Transaction saved.");
  });

  ["type", "amount", "description", "category", "date"].forEach(field => {
    const input = document.getElementById(fieldIds[field]);
    input.addEventListener("input", () => validateFormField(field));
    input.addEventListener("blur", () => {
      if (field === "description") input.value = collapseDescriptionSpaces(input.value);
      validateFormField(field);
    });
  });

  document.getElementById("transaction-list").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.action === "edit") {
      editingId = id;
      refresh();
      const description = document.querySelector('tr[data-row-id="' + CSS.escape(id) + '"] [data-field="description"]');
      if (description) description.focus();
      announce("Editing transaction inline.");
    }
    if (button.dataset.action === "cancel-inline") {
      editingId = null;
      refresh();
      announce("Inline edit cancelled.");
    }
    if (button.dataset.action === "save-inline") {
      const row = button.closest("tr");
      const existingIndex = records.findIndex(record => record.id === id);
      if (!row || existingIndex < 0) return;
      const rawRecord = {
        id: id,
        type: row.querySelector('[data-field="type"]').value,
        amount: row.querySelector('[data-field="amount"]').value,
        description: row.querySelector('[data-field="description"]').value,
        category: row.querySelector('[data-field="category"]').value,
        date: row.querySelector('[data-field="date"]').value,
        notes: row.querySelector('[data-field="notes"]').value
      };
      rawRecord.description = collapseDescriptionSpaces(rawRecord.description);
      row.querySelector('[data-field="description"]').value = rawRecord.description;
      const errors = AppValidators.validateTransaction(rawRecord);
      row.querySelectorAll("[data-field]").forEach(input => input.setAttribute("aria-invalid", errors.some(error => error.field === input.dataset.field) ? "true" : "false"));
      const errorTarget = row.querySelector("[data-inline-error]");
      if (errors.length) {
        errorTarget.textContent = errors.map(error => error.message).join(" ");
        return;
      }
      records[existingIndex] = AppState.normaliseRecord(rawRecord, records[existingIndex]);
      editingId = null;
      saveAll();
      refresh();
      announce("Transaction updated.");
    }
    if (button.dataset.action === "delete") {
      const record = records.find(item => item.id === id);
      if (record && window.confirm("Delete this transaction: " + record.description + "?")) {
        records = records.filter(item => item.id !== id);
        if (editingId === id) editingId = null;
        saveAll();
        refresh();
        announce("Transaction deleted.");
      }
    }
  });

  function updateSearch() {
    const parsed = AppSearch.parseSearch(document.getElementById("search").value, document.getElementById("case-sensitive").checked);
    currentRegex = parsed.regex;
    searchError = parsed.error;
    refresh();
  }
  document.getElementById("search").addEventListener("input", updateSearch);
  document.getElementById("case-sensitive").addEventListener("change", updateSearch);
  document.getElementById("type-filter").addEventListener("change", refresh);
  document.getElementById("sort-by").addEventListener("change", refresh);

  document.getElementById("budget-form").addEventListener("submit", event => {
    event.preventDefault();
    const limit = Number(document.getElementById("weekly-limit").value);
    const error = document.getElementById("budget-input-error");
    if (!Number.isFinite(limit) || limit <= 0) {
      error.textContent = "Weekly limit must be a positive number.";
      document.getElementById("weekly-limit").setAttribute("aria-invalid", "true");
      return;
    }
    error.textContent = "";
    document.getElementById("weekly-limit").setAttribute("aria-invalid", "false");
    settings.weeklyLimit = limit;
    saveAll();
    refresh();
    announce("Weekly limit updated.");
  });

  document.getElementById("settings-form").addEventListener("submit", event => {
    event.preventDefault();
    const usd = Number(document.getElementById("rate-usd").value);
    const eur = Number(document.getElementById("rate-eur").value);
    const usdError = document.getElementById("rate-usd-error");
    const eurError = document.getElementById("rate-eur-error");
    usdError.textContent = Number.isFinite(usd) && usd > 0 ? "" : "Enter a positive USD rate.";
    eurError.textContent = Number.isFinite(eur) && eur > 0 ? "" : "Enter a positive EUR rate.";
    document.getElementById("rate-usd").setAttribute("aria-invalid", usdError.textContent ? "true" : "false");
    document.getElementById("rate-eur").setAttribute("aria-invalid", eurError.textContent ? "true" : "false");
    if (usdError.textContent || eurError.textContent) return;
    settings.currency = document.getElementById("currency").value;
    settings.display = document.getElementById("compact-mode").value;
    settings.exchangeRates = { RWF: 1, USD: usd, EUR: eur };
    saveAll();
    refresh();
    announce("Settings saved. Amounts now display in " + settings.currency + ".");
  });

  document.getElementById("category-form").addEventListener("submit", event => {
    event.preventDefault();
    const input = document.getElementById("new-category");
    const error = document.getElementById("new-category-error");
    const category = input.value.trim();
    if (!AppValidators.validateCategory(category)) {
      error.textContent = "Use letters, single spaces, and hyphens only.";
      input.setAttribute("aria-invalid", "true");
      return;
    }
    if (settings.categories.some(value => value.toLowerCase() === category.toLowerCase())) {
      error.textContent = "That category already exists.";
      input.setAttribute("aria-invalid", "true");
      return;
    }
    settings.categories.push(category);
    input.value = "";
    input.setAttribute("aria-invalid", "false");
    error.textContent = "";
    saveAll();
    refresh();
    announce(category + " category added.");
  });

  document.getElementById("category-list").addEventListener("click", event => {
    const button = event.target.closest('button[data-action="remove-category"]');
    if (!button) return;
    const category = button.dataset.category;
    if (!window.confirm("Remove the " + category + " category from future choices? Existing records will not change.")) return;
    settings.categories = settings.categories.filter(value => value !== category);
    saveAll();
    refresh();
    announce(category + " category removed.");
  });

  document.getElementById("export-json").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "campus-wallet-transactions.json";
    link.click();
    URL.revokeObjectURL(url);
    announce("Transactions exported as JSON.");
  });

  document.getElementById("import-file").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const result = AppValidators.validateImportedData(data);
      if (!result.valid) throw new Error(result.error);
      const merged = records.slice();
      result.data.forEach(item => {
        if (!merged.some(old => old.id === item.id)) merged.push(AppState.normaliseRecord(item));
      });
      records = merged;
      saveAll();
      refresh();
      announce("JSON import completed.");
      window.alert("Imported " + result.data.length + " valid transaction(s). Existing records were kept.");
    } catch (error) {
      window.alert("Import failed: " + (error.message || "Choose a valid Campus Wallet JSON file."));
      announce("JSON import failed.");
    } finally {
      event.target.value = "";
    }
  });

  document.getElementById("load-sample").addEventListener("click", async () => {
    try {
      const response = await fetch("seed.json");
      if (!response.ok) throw new Error("Sample file not found.");
      const sample = await response.json();
      const result = AppValidators.validateImportedData(sample);
      if (!result.valid) throw new Error(result.error);
      const existing = new Set(records.map(record => record.id));
      records = records.concat(result.data.filter(record => !existing.has(record.id)).map(record => AppState.normaliseRecord(record)));
      saveAll();
      refresh();
      announce("Sample data loaded.");
    } catch (error) {
      window.alert("Could not load sample data. Open this project using a local web server or GitHub Pages. " + error.message);
    }
  });

  document.getElementById("clear-all").addEventListener("click", () => {
    if (!records.length) {
      announce("There are no records to clear.");
      return;
    }
    if (window.confirm("This will permanently remove all saved transactions from this browser. Continue?")) {
      records = [];
      editingId = null;
      saveAll();
      refresh();
      resetForm();
      announce("All transactions cleared.");
    }
  });

  document.addEventListener("keydown", event => {
    const target = event.target;
    const typing = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
    if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      document.getElementById("search").focus();
    }
    if (event.key === "Escape" && document.activeElement === document.getElementById("search")) {
      document.getElementById("search").value = "";
      currentRegex = null;
      searchError = "";
      refresh();
      announce("Search cleared.");
    }
  });

  resetForm();
  refresh();
})();
