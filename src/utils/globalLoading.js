let activeLoaders = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => {
    try {
      listener(activeLoaders);
    } catch (error) {
      console.error('globalLoading listener error:', error);
    }
  });
}

export function subscribeToGlobalLoading(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getGlobalLoadingCount() {
  return activeLoaders;
}

export function beginGlobalLoading() {
  activeLoaders += 1;
  emit();
}

export function endGlobalLoading() {
  activeLoaders = Math.max(0, activeLoaders - 1);
  emit();
}
