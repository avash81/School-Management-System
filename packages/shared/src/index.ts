export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}

export function range(size: number): number[] {
  return Array.from({ length: size }, (_, index) => index);
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
