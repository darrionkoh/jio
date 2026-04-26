const Format = {
  /**
   * Format number as SGD currency string.
   * @param {number} value
   * @returns {string} e.g. "$12.50"
   */
  currency(value) {
    return "$" + value.toFixed(2);
  },

  /**
   * Get initials from a name (up to 2 characters).
   * @param {string} name
   * @returns {string}
   */
  initials(name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  },
};
