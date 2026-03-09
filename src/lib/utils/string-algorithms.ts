/**
 * @fileoverview Shared string algorithms for search, filtering, and highlighting.
 * @module lib/utils/string-algorithms
 */

/**
 * Result part for text highlighting
 */
export interface IHighlightPart {
  text: string;
  isMatch: boolean;
}

/**
 * Calculate the Levenshtein distance between two strings.
 * Core edit distance algorithm used for fuzzy matching.
 * 
 * @param a - First string
 * @param b - Second string
 * @returns The minimum number of single-character edits required to change one word into the other.
 */
export function calculateLevenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Segments a text into matching and non-matching parts based on a query.
 * Useful for rendering highlighted search results in the UI.
 * 
 * @param text - The source text to segment
 * @param query - The search query to find
 * @param caseInsensitive - Whether to ignore case during matching (default: true)
 * @returns An array of text segments with match status
 */
export function highlightMatches(
  text: string,
  query: string,
  caseInsensitive: boolean = true
): IHighlightPart[] {
  if (!query) return [{ text, isMatch: false }];
  if (!text) return [{ text: '', isMatch: false }];

  const normalizedText = caseInsensitive ? text.toLowerCase() : text;
  const normalizedQuery = caseInsensitive ? query.toLowerCase() : query;
  const result: IHighlightPart[] = [];

  let lastIndex = 0;
  let index = normalizedText.indexOf(normalizedQuery, lastIndex);

  while (index !== -1) {
    // Add prefix (non-match)
    if (index > lastIndex) {
      result.push({
        text: text.slice(lastIndex, index),
        isMatch: false,
      });
    }

    // Add match
    result.push({
      text: text.slice(index, index + query.length),
      isMatch: true,
    });

    lastIndex = index + query.length;
    index = normalizedText.indexOf(normalizedQuery, lastIndex);
  }

  // Add remaining suffix
  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex), isMatch: false });
  }

  return result;
}
