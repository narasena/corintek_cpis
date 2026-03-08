/**
 * Search filter configuration
 */
interface ISearchFilterServiceConfig {
  /** Default debounce delay */
  defaultDebounceMs?: number;
  /** Default minimum query length */
  defaultMinQueryLength?: number;
}

/**
 * Global filter input parameters
 */
interface IGlobalFilterInput {
  /** Search query string */
  query: string;
  /** Column accessor keys to include (empty = all) */
  columnKeys?: string[];
  /** Enable case-insensitive matching */
  caseInsensitive?: boolean;
  /** Minimum query length before filtering */
  minQueryLength?: number;
}

/**
 * Filter operation result
 */
interface IFilterResult<TData> {
  /** Filtered data subset */
  filteredData: TData[];
  /** Total match count */
  matchCount: number;
  /** Whether filter was applied */
  isFiltered: boolean;
}

/**
 * Ranked filter result item
 */
interface IRankedResult<TData> {
  /** Original data item */
  item: TData;
  /** Match score (0-1, higher is better) */
  score: number;
  /** Match type */
  matchType: 'exact' | 'startsWith' | 'contains' | 'fuzzy';
}

/**
 * Service: SearchFilterService
 * Responsibility: Apply global text filtering to datasets
 * Pattern: Class-based service with constructor injection
 */
export class SearchFilterService {
  private readonly config: ISearchFilterServiceConfig;
  private readonly levenshteinCache = new Map<string, number>();
  private readonly CACHE_LIMIT = 1000;

  /**
   * Constructor with dependency injection
   * @param config - Service configuration
   */
  constructor(config: ISearchFilterServiceConfig) {
    this.config = {
      defaultDebounceMs: 300,
      defaultMinQueryLength: 1,
      ...config,
    };
  }

  /**
   * Apply global filter to dataset
   * @param data - Source dataset
   * @param filter - Filter configuration
   * @returns Filtered result with metadata
   */
  applyGlobalFilter<TData extends Record<string, unknown>>(
    data: TData[],
    filter: IGlobalFilterInput
  ): IFilterResult<TData> {
    const minLength =
      filter.minQueryLength ?? this.config.defaultMinQueryLength ?? 1;

    if (!filter.query || filter.query.length < minLength) {
      return { filteredData: data, matchCount: data.length, isFiltered: false };
    }

    const predicate = this.createFilterPredicate(filter);
    const filteredData = data.filter(predicate);

    return {
      filteredData,
      matchCount: filteredData.length,
      isFiltered: true,
    };
  }

  /**
   * Create filter predicate function for array filtering
   * @param filter - Filter configuration
   * @returns Predicate function for Array.filter()
   */
  createFilterPredicate<TData extends Record<string, unknown>>(
    filter: IGlobalFilterInput
  ): (item: TData) => boolean {
    const query =
      filter.caseInsensitive !== false
        ? filter.query.toLowerCase()
        : filter.query;

    return (item: TData) => {
      const values = this.extractSearchableValues(item, filter.columnKeys);
      return values.some(value => {
        const normalized =
          filter.caseInsensitive !== false ? value.toLowerCase() : value;
        return normalized.includes(query);
      });
    };
  }

  /**
   * Check if individual value matches query
   * @param value - Cell value to test
   * @param query - Search query
   * @param caseInsensitive - Whether to ignore case
   * @returns True if value matches query
   */
  valueMatchesQuery(
    value: unknown,
    query: string,
    caseInsensitive: boolean = true
  ): boolean {
    if (value === null || value === undefined) return false;

    const strValue = String(value);
    const normalizedValue = caseInsensitive ? strValue.toLowerCase() : strValue;
    const normalizedQuery = caseInsensitive ? query.toLowerCase() : query;

    return normalizedValue.includes(normalizedQuery);
  }

  /**
   * Extract searchable values from object
   * @param obj - Data object
   * @param keys - Keys to extract (empty = all string values)
   * @returns Array of searchable string values
   */
  extractSearchableValues<T extends Record<string, unknown>>(
    obj: T,
    keys?: string[]
  ): string[] {
    const targetKeys = keys?.length ? keys : Object.keys(obj);

    return targetKeys
      .map(key => obj[key])
      .filter(
        (v): v is string | number | boolean => v !== null && v !== undefined
      )
      .map(String);
  }

  /**
   * Calculate Levenshtein distance with caching and automatic limit
   * @param a - First string
   * @param b - Second string
   * @returns Edit distance
   */
  private levenshteinDistance(a: string, b: string): number {
    const cacheKey = `${a}|${b}`;
    const cached = this.levenshteinCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const result = this.calculateLevenshtein(a, b);

    // Self-cleaning: prevent unbounded growth
    if (this.levenshteinCache.size >= this.CACHE_LIMIT) {
      this.levenshteinCache.clear();
    }

    this.levenshteinCache.set(cacheKey, result);
    return result;
  }

  /**
   * Core Levenshtein calculation
   * @param a - First string
   * @param b - Second string
   * @returns Edit distance
   */
  private calculateLevenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] =
          b[i - 1] === a[j - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Check if value matches query with fuzzy tolerance
   * @param value - Cell value to test
   * @param query - Search query
   * @param tolerance - Max edit distance (default: 2)
   * @returns True if fuzzy match
   */
  fuzzyMatch(value: unknown, query: string, tolerance: number = 2): boolean {
    if (value === null || value === undefined) return false;

    const strValue = String(value).toLowerCase();
    const normalizedQuery = query.toLowerCase();

    // 1. Exact substring check (Fast path)
    if (strValue.includes(normalizedQuery)) return true;

    // 2. Tokenized check
    const tokens = strValue.split(/[\s.]+/).filter(t => t.length > 0);

    return tokens.some(token => {
      // Length optimization
      if (Math.abs(token.length - normalizedQuery.length) <= tolerance) {
        if (this.levenshteinDistance(token, normalizedQuery) <= tolerance) {
          return true;
        }
      }

      // Substring check within tokens
      return token.includes(normalizedQuery);
    });
  }

  /**
   * Highlight matching text with markers
   * @param text - Source text
   * @param query - Search query
   * @param caseInsensitive - Whether to ignore case
   * @returns Highlighted text with markers
   */
  highlightMatches(
    text: string,
    query: string,
    caseInsensitive: boolean = true
  ): Array<{ text: string; isMatch: boolean }> {
    if (!query) return [{ text, isMatch: false }];
    if (!text) return [{ text: '', isMatch: false }];

    const normalizedText = caseInsensitive ? text.toLowerCase() : text;
    const normalizedQuery = caseInsensitive ? query.toLowerCase() : query;
    const result: Array<{ text: string; isMatch: boolean }> = [];

    let lastIndex = 0;
    let index = normalizedText.indexOf(normalizedQuery, lastIndex);

    while (index !== -1) {
      if (index > lastIndex) {
        result.push({
          text: text.slice(lastIndex, index),
          isMatch: false,
        });
      }
      result.push({
        text: text.slice(index, index + query.length),
        isMatch: true,
      });
      lastIndex = index + query.length;
      index = normalizedText.indexOf(normalizedQuery, lastIndex);
    }

    if (lastIndex < text.length) {
      result.push({ text: text.slice(lastIndex), isMatch: false });
    }

    return result;
  }

  /**
   * Calculate match score for ranking (0-1, higher is better)
   * @param value - Value to score
   * @param query - Search query
   * @returns Score object with type and score
   */
  calculateMatchScore(
    value: unknown,
    query: string
  ): { score: number; matchType: IRankedResult<unknown>['matchType'] } {
    if (value === null || value === undefined) {
      return { score: 0, matchType: 'fuzzy' };
    }

    const strValue = String(value).toLowerCase();
    const normalizedQuery = query.toLowerCase();

    // Strategy Ranking
    if (strValue === normalizedQuery) {
      return { score: 1, matchType: 'exact' };
    }
    if (strValue.startsWith(normalizedQuery)) {
      return { score: 0.8, matchType: 'startsWith' };
    }
    if (strValue.includes(normalizedQuery)) {
      return { score: 0.6, matchType: 'contains' };
    }

    // Fuzzy Fallback
    const distance = this.levenshteinDistance(strValue, normalizedQuery);
    const maxDistance = Math.max(strValue.length, normalizedQuery.length);
    const score = Math.max(0, 1 - distance / maxDistance) * 0.4;

    return { score, matchType: 'fuzzy' };
  }

  /**
   * Apply filter with ranking - returns results sorted by relevance
   * @param data - Source dataset
   * @param filter - Filter configuration
   * @returns Ranked results sorted by score (highest first)
   */
  applyGlobalFilterWithRanking<TData extends Record<string, unknown>>(
    data: TData[],
    filter: IGlobalFilterInput & { maxResults?: number }
  ): IRankedResult<TData>[] {
    const minLength =
      filter.minQueryLength ?? this.config.defaultMinQueryLength ?? 1;

    if (!filter.query || filter.query.length < minLength) {
      return data.map(item => ({
        item,
        score: 0,
        matchType: 'exact' as const,
      }));
    }

    const ranked = data
      .map(item => this.rankDataItem(item, filter))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score);

    return filter.maxResults ? ranked.slice(0, filter.maxResults) : ranked;
  }

  /**
   * Rank a single data item based on best matching column
   */
  private rankDataItem<TData extends Record<string, unknown>>(
    item: TData,
    filter: IGlobalFilterInput
  ): IRankedResult<TData> {
    const values = this.extractSearchableValues(item, filter.columnKeys);
    let bestScore = 0;
    let bestMatchType: IRankedResult<TData>['matchType'] = 'fuzzy';

    for (const value of values) {
      const { score, matchType } = this.calculateMatchScore(
        value,
        filter.query
      );
      if (score > bestScore) {
        bestScore = score;
        bestMatchType = matchType;
      }
    }

    return { item, score: bestScore, matchType: bestMatchType };
  }

  /**
   * Clear the Levenshtein cache to free memory
   */
  clearCache(): void {
    this.levenshteinCache.clear();
  }
}
