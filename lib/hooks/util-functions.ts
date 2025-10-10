// Utility to omit empty fields from an object
export function omitEmptyFields<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  ) as Partial<T>;
}
