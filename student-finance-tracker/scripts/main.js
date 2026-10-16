/* Main application events and page updates. */
(function () {
  let records = AppStorage.readRecords();
  let settings = AppStorage.readSettings();
  let currentRegex = null;
  const form = document.getElementById("transaction-form");
  const formMessage = document.getElementById("form-message");

  function announce(message) { document.getElementById("app-announcement").textContent = message; }
  function today() { return new Date().toLocaleDateString("en-CA"); }
  function saveAll() { AppStorage.saveRecords(records); AppStorage.saveSettings(settings); }
  function refresh() {
    AppUI.renderStats(records, settings.currency);
    AppUI.renderRecords(records, settings.currency, currentRegex, document.getElementById("type-filter").value);
    AppUI.renderBudget(records, settings, settings.currency);
    AppUI.renderChart(records, settings.currency);
    document.getElementById("weekly-limit").value = settings.weeklyLimit;
    document.getElementById("currency").value = settings.currency;
    document.getElementById("compact-mode").value = settings.display;
    document.body.classList.toggle("compact-mode", settings.display === "compact");
  }
  function resetForm() {
    form.reset();
    document.getElementById("record-id").value = "";
    document.getElementById("date").value = today();
    document.getElementById("form-title").textContent = "New transaction";
    document.getElementById("save-button").textContent = "Save transaction";
    document.getElementById("cancel-edit").hidden = true;
    formMessage.textContent = "";
  }
  function startEdit(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;
    document.getElementById("record-id").value = record.id;
    document.getElementById("type").value = record.type;
    document.getElementById("amount").value = record.amount;
    document.getElementById("description").value = record.description;
    document.getElementById("category").value = record.category;
    document.getElementById("date").value = record.date;
    document.getElementById("notes").value = record.notes || "";
    document.getElementById("form-title").textContent = "Edit transaction";
    document.getElementById("save-button").textContent = "Save changes";
    document.getElementById("cancel-edit").hidden = false;
    formMessage.textContent = "Editing the selected transaction.";
    document.getElementById("type").focus();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(form);
    const record = {
      id: document.getElementById("record-id").value || undefined,
      type: formData.get("type"),
      amount: String(formData.get("amount")).trim(),
      description: String(formData.get("description")).trim(),
      category: String(formData.get("category")).trim(),
      date: String(formData.get("date")),
      notes: String(formData.get("notes") || "").trim()
    };
    const errors = AppValidators.validateTransaction(record);
    if (errors.length) { formMessage.textContent = errors.join(" "); return; }
    const normalised = AppState.normaliseRecord(record);
    const existingIndex = records.findIndex(item => item.id === normalised.id);
    if (existingIndex >= 0) records[existingIndex] = normalised;
    else records.push(normalised);
    saveAll(); refresh(); resetForm();
    announce(existingIndex >= 0 ? "Transaction updated." : "Transaction saved.");
  });

  document.getElementById("cancel-edit").addEventListener("click", resetForm);
  document.getElementById("transaction-list").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.action === "edit") startEdit(id);
    if (button.dataset.action === "delete") {
      const record = records.find(item => item.id === id);
      if (record && window.confirm("Delete this transaction: " + record.description + "?")) {
        records = records.filter(item => item.id !== id);
        saveAll(); refresh(); announce("Transaction deleted.");
      }
    }
  });

  document.getElementById("search").addEventListener("input", event => {
    const parsed = AppSearch.parseSearch(event.target.value);
    const message = document.getElementById("search-message");
    if (parsed.error) {
      currentRegex = null;
      message.textContent = parsed.error;
      message.style.color = "#a83333";
    } else {
      currentRegex = parsed.regex;
      message.style.color = "";
      refresh();
    }
  });
  document.getElementById("type-filter").addEventListener("change", refresh);
  document.getElementById("sort-by").addEventListener("change", refresh);

  document.getElementById("budget-form").addEventListener("submit", event => {
    event.preventDefault();
    const limit = Number(document.getElementById("weekly-limit").value);
    if (!Number.isFinite(limit) || limit <= 0) { announce("Weekly limit must be a positive number."); return; }
    settings.weeklyLimit = limit; saveAll(); refresh(); announce("Weekly limit updated.");
  });
  document.getElementById("currency").addEventListener("change", event => {
    settings.currency = event.target.value; saveAll(); refresh(); announce("Display currency updated. Amounts were not converted.");
  });
  document.getElementById("compact-mode").addEventListener("change", event => {
    settings.display = event.target.value; saveAll(); refresh(); announce("Display setting updated.");
  });

  document.getElementById("export-json").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "campus-wallet-transactions.json"; link.click();
    URL.revokeObjectURL(url);
    announce("Transactions exported as JSON.");
  });
  document.getElementById("import-file").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = AppValidators.validateImportedData(data);
      if (!result.valid) { window.alert("Import failed: " + result.error); return; }
      const imported = result.data.map(item => AppState.normaliseRecord(item));
      const merged = records.slice();
      imported.forEach(item => {
        if (!merged.some(old => old.id === item.id)) merged.push(item);
      });
      records = merged; saveAll(); refresh(); announce("JSON import completed.");
      window.alert("Imported " + imported.length + " valid transaction(s). Existing records were kept.");
    } catch (error) {
      window.alert("Import failed. Choose a valid JSON file exported by Campus Wallet.");
    } finally { event.target.value = ""; }
  });

  document.getElementById("load-sample").addEventListener("click", async () => {
    try {
      const response = await fetch("seed.json");
      if (!response.ok) throw new Error("Sample file not found");
      const sample = await response.json();
      const result = AppValidators.validateImportedData(sample);
      if (!result.valid) throw new Error(result.error);
      const mapped = result.data.map(item => AppState.normaliseRecord(item));
      const existing = new Set(records.map(item => item.id));
      records = records.concat(mapped.filter(item => !existing.has(item.id)));
      saveAll(); refresh(); announce("Sample data loaded.");
    } catch (error) {
      window.alert("Could not load sample data. Open this project with VS Code Live Server or another local web server.");
    }
  });

  document.getElementById("clear-all").addEventListener("click", () => {
    if (!records.length) { announce("There are no records to clear."); return; }
    if (window.confirm("This will permanently remove all saved transactions from this browser. Continue?")) {
      records = []; saveAll(); refresh(); resetForm(); announce("All transactions cleared.");
    }
  });

  document.addEventListener("keydown", event => {
    const target = event.target;
    const typing = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
    if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault(); document.getElementById("search").focus();
    }
    if (event.key === "Escape" && document.activeElement === document.getElementById("search")) {
      document.getElementById("search").value = ""; currentRegex = null; refresh();
    }
  });

  document.getElementById("date").value = today();
  refresh();
})();
