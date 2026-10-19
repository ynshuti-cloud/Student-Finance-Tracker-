/* Safe regular-expression search and escaped result highlighting. */
(function () {
  function parseSearch(query, caseSensitive) {
    const value = query.trim();
    if (!value) return { regex: null, error: "" };
    const match = value.match(/^\/([\s\S]*)\/([dgimsuvy]*)$/);
    const source = match ? match[1] : value;
    let flags = match ? match[2].replace(/[gy]/g, "") : "";
    flags = flags.replace(/i/g, "");
    if (!caseSensitive) flags += "i";
    try {
      return { regex: new RegExp(source, flags), error: "" };
    } catch (error) {
      return { regex: null, error: "That regular expression is not valid. Check its brackets, flags, or escape characters." };
    }
  }

  function matches(record, regex) {
    if (!regex) return true;
    const text = [record.description, record.category, record.type, record.date, record.notes || ""].join(" ");
    regex.lastIndex = 0;
    return regex.test(text);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  function highlight(value, regex) {
    const raw = String(value);
    if (!regex || !regex.source) return escapeHTML(raw);
    try {
      const flags = regex.flags.replace(/[gy]/g, "") + "g";
      const globalRegex = new RegExp(regex.source, flags);
      let result = "";
      let previousEnd = 0;
      let match;
      while ((match = globalRegex.exec(raw)) !== null) {
        if (!match[0]) {
          globalRegex.lastIndex += 1;
          continue;
        }
        result += escapeHTML(raw.slice(previousEnd, match.index));
        result += "<mark>" + escapeHTML(match[0]) + "</mark>";
        previousEnd = match.index + match[0].length;
      }
      return result + escapeHTML(raw.slice(previousEnd));
    } catch (error) {
      return escapeHTML(raw);
    }
  }

  window.AppSearch = { parseSearch, matches, escapeHTML, highlight };
})();
