export default function enumOptions<T extends string | number>(
  enumObject: Record<string, T> | T[]
): string[] {
  if (Array.isArray(enumObject)) {
    // Handle arrays/tuples of enum values
    return enumObject.map(value => String(value));
  } else {
    // Handle enum objects
    return Object.values(enumObject) as string[];
  }
}
