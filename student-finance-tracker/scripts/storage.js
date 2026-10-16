/* Browser storage functions kept separate from the page interface. */
(function () {
  const RECORDS_KEY = "campusWallet.records.v1";
  const SETTINGS_KEY = "campusWallet.settings.v1";

  function readRecords() {
    try {
      const value = JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }
  function saveRecords(records) {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }
  function readSettings() {
    const defaults = { currency: "RWF", weeklyLimit: 50000, display: "comfortable" };
    try {
      return Object.assign(defaults, JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"));
    } catch (error) {
      return defaults;
    }
  }
  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
  window.AppStorage = { readRecords, saveRecords, readSettings, saveSettings };
})();
