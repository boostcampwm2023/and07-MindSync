export function omit<T, K extends keyof T>(
  object: T,
  exclude: K[],
): Omit<T, K> {
  return Object.keys(object).reduce(
    (result, key) => {
      if (!exclude.includes(key as K)) result[key] = object[key];
      return result;
    },
    {} as Omit<T, K>,
  );
}
