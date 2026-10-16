/* Input validation helpers. Regex patterns are documented in README.md. */
(function () {
  const patterns = {
    description: /^[A-Za-z0-9][A-Za-z0-9 '&.,()/-]{1,79}$/,
    category: /^[A-Za-z][A-Za-z ]{1,24}$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    positiveAmount: /^[1-9]\d*(\.\d{1,2})?$/
  };

  function isValidDate(value) {
    if (!patterns.date.test(value)) return false;
    const date = new Date(value + "T00:00:00");
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function validateTransaction(record) {
    const errors = [];
    if (!record || typeof record !== "object") return ["Record must be an object."];
    if (!["income", "expense"].includes(record.type)) errors.push("Choose income or expense.");
    if (!patterns.positiveAmount.test(String(record.amount)) || !Number.isFinite(Number(record.amount))) {
      errors.push("Amount must be a positive number.");
    }
    if (typeof record.description !== "string" || !patterns.description.test(record.description.trim())) {
      errors.push("Description must be 2–80 characters and use simple punctuation only.");
    }
    if (typeof record.category !== "string" || !patterns.category.test(record.category.trim())) {
      errors.push("Choose a valid category.");
    }
    if (typeof record.date !== "string" || !isValidDate(record.date)) errors.push("Enter a real date.");
    if (record.notes !== undefined && (typeof record.notes !== "string" || record.notes.length > 180)) {
      errors.push("Notes must be text with at most 180 characters.");
    }
    return errors;
  }

  function validateImportedData(data) {
    if (!Array.isArray(data)) return { valid: false, error: "The JSON file must contain an array of transactions." };
    if (data.length > 1000) return { valid: false, error: "Import is limited to 1,000 records." };
    for (let i = 0; i < data.length; i += 1) {
      const errors = validateTransaction(data[i]);
      if (errors.length) return { valid: false, error: "Record " + (i + 1) + ": " + errors.join(" ") };
    }
    return { valid: true, data: data };
  }

  window.AppValidators = { patterns, isValidDate, validateTransaction, validateImportedData };
})();
