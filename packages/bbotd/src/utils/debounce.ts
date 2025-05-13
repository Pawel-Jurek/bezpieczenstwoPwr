export const debounce = <T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number,
) => {
  let timeoutTimer: ReturnType<typeof setTimeout>;

  return (...args: T) => {
    clearTimeout(timeoutTimer);

    timeoutTimer = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

export function throttleDebounce<T extends unknown[]>(
  fn: (...args: T) => void,
  debounceDelay = 500,
  throttleDelay = 5000,
) {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let throttleTimer: ReturnType<typeof setTimeout> | null = null;

  const call = (...args: T) => {
    fn(...args);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    if (throttleTimer) {
      clearTimeout(throttleTimer);
      throttleTimer = null;
    }

    throttleTimer = setTimeout(() => {
      throttleTimer = null;
    }, throttleDelay);
  };

  return (...args: T) => {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      call(...args);
    }, debounceDelay);

    if (!throttleTimer) {
      call(...args);
    }
  };
}
