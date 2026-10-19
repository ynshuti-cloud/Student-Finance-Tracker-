/* Browser storage functions kept separate from page rendering. */
(function () {
  const RECORDS_KEY = "campusWallet.records.v2";
  const SETTINGS_KEY = "campusWallet.settings.v2";
  const DEFAULT_CATEGORIES = ["Food", "Books", "Transport", "Entertainment", "Fees", "Other"];
  const DEFAULT_SETTINGS = {
    currency: "RWF",
    weeklyLimit: 50000,
    display: "comfortable",
    exchangeRates: { RWF: 1, USD: 1400, EUR: 1550 },
    categories: DEFAULT_CATEGORIES
  };

  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  function migrateLegacyRecord(record) {
    if (!record || typeof record !== "object") return null;
    const fallbackTime = typeof record.date === "string" && AppValidators.isValidDate(record.date)
      ? record.date + "T12:00:00.000Z"
      : new Date().toISOString();
    return Object.assign({}, record, {
      id: typeof record.id === "string" && record.id.startsWith("tx-") ? record.id : "tx-legacy-" + Math.random().toString(36).slice(2, 10),
      createdAt: AppValidators.isValidTimestamp(record.createdAt) ? record.createdAt : fallbackTime,
      updatedAt: AppValidators.isValidTimestamp(record.updatedAt) ? record.updatedAt : fallbackTime
    });
  }

  function readRecords() {
    try {
      const raw = localStorage.getItem(RECORDS_KEY) || localStorage.getItem("campusWallet.records.v1") || "[]";
      const value = JSON.parse(raw);
      if (!Array.isArray(value)) return [];
      return value.map(migrateLegacyRecord).filter(record => record && AppValidators.validateTransaction(record, { requireMetadata: true }).length === 0);
    } catch (error) {
      return [];
    }
  }

  function saveRecords(records) {
    try {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
      return true;
    } catch (error) {
      return false;
    }
  }

  function readSettings() {
    const defaults = cloneDefaults();
    try {
      const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || localStorage.getItem("campusWallet.settings.v1") || "{}");
      const rates = Object.assign({}, defaults.exchangeRates, raw.exchangeRates || {});
      ["RWF", "USD", "EUR"].forEach(currency => {
        if (!Number.isFinite(Number(rates[currency])) || Number(rates[currency]) <= 0) rates[currency] = defaults.exchangeRates[currency];
        else rates[currency] = Number(rates[currency]);
      });
      const categories = Array.isArray(raw.categories)
        ? raw.categories.filter(AppValidators.validateCategory).filter((value, index, list) => list.indexOf(value) === index)
        : defaults.categories;
      return {
        currency: ["RWF", "USD", "EUR"].includes(raw.currency) ? raw.currency : defaults.currency,
        weeklyLimit: Number.isFinite(Number(raw.weeklyLimit)) && Number(raw.weeklyLimit) > 0 ? Number(raw.weeklyLimit) : defaults.weeklyLimit,
        display: raw.display === "compact" ? "compact" : defaults.display,
        exchangeRates: rates,
        categories: categories.length ? categories : defaults.categories
      };
    } catch (error) {
      return defaults;
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      return false;
    }
  }

  window.AppStorage = { readRecords, saveRecords, readSettings, saveSettings, DEFAULT_CATEGORIES };
})();
