import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UPDATE_INTERVAL_MS, watchForUpdates } from './watchForUpdates';

const makeRegistration = () =>
  ({ update: vi.fn().mockResolvedValue(undefined) }) as unknown as ServiceWorkerRegistration;

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
}

function setOnline(online: boolean) {
  Object.defineProperty(navigator, 'onLine', { value: online, configurable: true });
}

let stop: () => void;

beforeEach(() => {
  vi.useFakeTimers();
  setOnline(true);
});

afterEach(() => {
  stop();
  vi.useRealTimers();
});

describe('watchForUpdates', () => {
  it('checks for a new version when the app comes back to the foreground', () => {
    // GIVEN
    const registration = makeRegistration();
    stop = watchForUpdates(registration);
    // WHEN
    setVisibility('visible');
    // THEN
    expect(registration.update).toHaveBeenCalledTimes(1);
  });

  it('does not check when the app goes to the background', () => {
    // GIVEN
    const registration = makeRegistration();
    stop = watchForUpdates(registration);
    // WHEN
    setVisibility('hidden');
    // THEN
    expect(registration.update).not.toHaveBeenCalled();
  });

  it('checks for a new version every hour', () => {
    // GIVEN
    const registration = makeRegistration();
    stop = watchForUpdates(registration);
    // WHEN
    vi.advanceTimersByTime(UPDATE_INTERVAL_MS * 2);
    // THEN
    expect(registration.update).toHaveBeenCalledTimes(2);
  });

  it('skips the check when offline', () => {
    // GIVEN
    const registration = makeRegistration();
    stop = watchForUpdates(registration);
    setOnline(false);
    // WHEN
    setVisibility('visible');
    // THEN
    expect(registration.update).not.toHaveBeenCalled();
  });
});
