/* Search supports plain text and JavaScript regular expressions. */
(function () {
  function parseSearch(query) {
    const value = query.trim();
    if (!value) return { regex: null, error: "" };
    // A slash-delimited expression such as /food|transport/i can include flags.
    const match = value.match(/^\/([\s\S]*)\/([dgimsuvy]*)$/);
    try {
      if (match) return { regex: new RegExp(match[1], match[2]), error: "" };
      return { regex: new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), error: "" };
    } catch (error) {
      return { regex: null, error: "That regular expression is not valid. Check the brackets or slashes." };
    }
  }
  function matches(record, regex) {
    if (!regex) return true;
    const text = [record.description, record.category, record.type, record.date, record.notes || ""].join(" ");
    regex.lastIndex = 0;
    return regex.test(text);
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }
  function highlight(value, regex) {
    const safe = escapeHTML(value);
    if (!regex || !regex.source) return safe;
    try {
      const flags = regex.flags.replace("g", "") + "g";
      const globalRegex = new RegExp(regex.source, flags);
      return safe.replace(globalRegex, match => "<mark>" + match + "</mark>");
    } catch (error) {
      return safe;
    }
  }
  window.AppSearch = { parseSearch, matches, escapeHTML, highlight };
})();
