export const toCamelCase = (str: string): string => {
  if (!str) {
    return '';
  }

  return (
    str
      // Replace separators with a space
      .replace(/[-_]+/g, ' ')
      // Handle cases like `wordWord` -> `word Word`
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Remove any non-alphanumeric characters at the start or end
      .trim()
      // Lowercase the whole string
      .toLowerCase()
      // Find words
      .split(' ')
      // Filter out empty strings from multiple spaces
      .filter(word => word)
      // Capitalize the first letter of each word except the first
      .map((word, index) => {
        if (index === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      // Join back together
      .join('')
  );
};
