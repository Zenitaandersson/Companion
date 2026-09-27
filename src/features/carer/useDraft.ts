import { useEffect, useRef, useState } from 'react';

/**
 * Local text state that saves shortly after typing stops.
 * Keeps typing smooth on phones while the database and live queries catch up.
 */
export function useDraft(value: string, save: (next: string) => void, delayMs = 400): [string, (next: string) => void] {
  const [draft, setDraft] = useState(value);
  const dirty = useRef(false);
  const timer = useRef<number | null>(null);
  const latestSave = useRef(save);
  latestSave.current = save;
  const latestDraft = useRef(draft);
  latestDraft.current = draft;

  // Follow outside changes only while the user is not mid-edit.
  useEffect(() => {
    if (!dirty.current) setDraft(value);
  }, [value]);

  useEffect(
    () => () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        if (dirty.current) latestSave.current(latestDraft.current);
      }
    },
    [],
  );

  const update = (next: string) => {
    dirty.current = true;
    setDraft(next);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      dirty.current = false;
      latestSave.current(next);
    }, delayMs);
  };

  return [draft, update];
}
