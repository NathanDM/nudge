export const UPDATE_INTERVAL_MS = 60 * 60 * 1000;

export function watchForUpdates(registration: ServiceWorkerRegistration): () => void {
  const check = () => {
    if (navigator.onLine) registration.update().catch(() => {});
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') check();
  };
  document.addEventListener('visibilitychange', onVisible);
  const timer = setInterval(check, UPDATE_INTERVAL_MS);
  return () => {
    document.removeEventListener('visibilitychange', onVisible);
    clearInterval(timer);
  };
}
