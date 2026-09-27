/**
 * Optional location sharing, used only from the Help screen and only when the carer
 * has switched it on. Permission is requested in carer mode, never in person mode.
 */
export interface SharedLocation {
  latitude: number;
  longitude: number;
  at: number;
}

const KEY = 'companion.lastSharedLocation';

export function isLocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/** Asks for permission by requesting a single position. Resolves true when allowed. */
export function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isLocationSupported()) {
      resolve(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { timeout: 15000 },
    );
  });
}

/** True only when the browser reports permission already granted. Unknown counts as not granted. */
async function isPermissionGranted(): Promise<boolean> {
  try {
    if (!('permissions' in navigator)) return false;
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state === 'granted';
  } catch {
    return false;
  }
}

/**
 * Captures the current position and stores it locally for the carer to see. Never throws and
 * never prompts: if permission was not granted in carer mode, nothing happens.
 */
export async function captureLocation(): Promise<SharedLocation | null> {
  if (!isLocationSupported()) return null;
  if (!(await isPermissionGranted())) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: SharedLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          at: Date.now(),
        };
        try {
          localStorage.setItem(KEY, JSON.stringify(loc));
        } catch {
          /* ignore */
        }
        resolve(loc);
      },
      () => resolve(null),
      { timeout: 15000, maximumAge: 60000 },
    );
  });
}

export function lastSharedLocation(): SharedLocation | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SharedLocation) : null;
  } catch {
    return null;
  }
}
