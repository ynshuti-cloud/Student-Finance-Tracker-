/* Input and import validation helpers. Every pattern is documented in README.md. */
(function () {
  const patterns = {
    description: /^(?!.*\s{2})(?=.{2,80}$)[A-Za-z0-9][A-Za-z0-9 '&.,()/-]*[A-Za-z0-9.)]$/,
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWord: /\b(\w+)\s+\1\b/i,
    id: /^tx-[a-z0-9-]{6,}$/i
  };

  function isValidDate(value) {
    if (!patterns.date.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }

  function isValidTimestamp(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value));
  }

  function validateTransaction(record, options) {
    const config = Object.assign({ requireMetadata: false }, options);
    const errors = [];
    if (!record || typeof record !== "object" || Array.isArray(record)) return [{ field: "record", message: "Record must be an object." }];
    if (!["income", "expense"].includes(record.type)) errors.push({ field: "type", message: "Choose income or expense." });
    const amount = String(record.amount ?? "");
    if (!patterns.amount.test(amount) || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      errors.push({ field: "amount", message: "Amount must be a positive number with up to two decimal places." });
    }
    if (typeof record.description !== "string" || !patterns.description.test(record.description)) {
      errors.push({ field: "description", message: "Description must be 2–80 characters with no leading, trailing, or repeated spaces." });
    } else if (patterns.duplicateWord.test(record.description)) {
      errors.push({ field: "description", message: "Description cannot contain the same word twice in a row." });
    }
    if (typeof record.category !== "string" || !patterns.category.test(record.category)) {
      errors.push({ field: "category", message: "Category may contain letters, single spaces, and hyphens only." });
    }
    if (typeof record.date !== "string" || !isValidDate(record.date)) errors.push({ field: "date", message: "Enter a real date in YYYY-MM-DD format." });
    if (record.notes !== undefined && (typeof record.notes !== "string" || record.notes.length > 180)) {
      errors.push({ field: "notes", message: "Notes must be text with at most 180 characters." });
    }
    if (config.requireMetadata) {
      if (typeof record.id !== "string" || !patterns.id.test(record.id)) errors.push({ field: "id", message: "Record must include a valid unique id." });
      if (!isValidTimestamp(record.createdAt)) errors.push({ field: "createdAt", message: "Record must include a valid createdAt timestamp." });
      if (!isValidTimestamp(record.updatedAt)) errors.push({ field: "updatedAt", message: "Record must include a valid updatedAt timestamp." });
    }
    return errors;
  }

  function fieldErrors(record, options) {
    return validateTransaction(record, options).reduce((result, error) => {
      if (!result[error.field]) result[error.field] = error.message;
      return result;
    }, {});
  }

  function validateCategory(value) {
    return typeof value === "string" && patterns.category.test(value);
  }

  function validateImportedData(data) {
    if (!Array.isArray(data)) return { valid: false, error: "The JSON file must contain an array of transactions." };
    if (data.length > 1000) return { valid: false, error: "Import is limited to 1,000 records." };
    const ids = new Set();
    for (let index = 0; index < data.length; index += 1) {
      const errors = validateTransaction(data[index], { requireMetadata: true });
      if (errors.length) return { valid: false, error: "Record " + (index + 1) + ": " + errors.map(error => error.message).join(" ") };
      if (ids.has(data[index].id)) return { valid: false, error: "Record " + (index + 1) + ": duplicate id '" + data[index].id + "'." };
      ids.add(data[index].id);
    }
    return { valid: true, data: data };
  }

  window.AppValidators = { patterns, isValidDate, isValidTimestamp, validateTransaction, fieldErrors, validateCategory, validateImportedData };
})();
