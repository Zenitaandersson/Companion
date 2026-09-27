import Dexie, { type Table, type UpdateSpec } from 'dexie';
import {
  DEFAULT_PROFILE,
  type Acknowledgement,
  type Contact,
  type FrequentQuestion,
  type Memory,
  type PlannedEvent,
  type Profile,
  type RoutineStep,
} from './types';

/**
 * Local database. Everything lives on the device in IndexedDB.
 * Photos and recordings are stored as Blobs alongside their text.
 */
export class CompanionDB extends Dexie {
  profile!: Table<Profile, number>;
  contacts!: Table<Contact, number>;
  routineSteps!: Table<RoutineStep, number>;
  events!: Table<PlannedEvent, number>;
  questions!: Table<FrequentQuestion, number>;
  memories!: Table<Memory, number>;
  acknowledgements!: Table<Acknowledgement, number>;

  constructor(name = 'companion') {
    super(name);
    this.version(1).stores({
      profile: 'id',
      contacts: '++id, sortOrder',
      routineSteps: '++id, sortOrder, time',
      events: '++id, date',
      questions: '++id, sortOrder',
      memories: '++id, sortOrder',
      acknowledgements: '++id, kind, at',
    });
  }
}

export const db = new CompanionDB();

/** Returns the single profile row, creating it on first launch. */
export async function getProfile(database: CompanionDB = db): Promise<Profile> {
  const existing = await database.profile.get(1);
  if (existing) return existing;
  const now = Date.now();
  const fresh: Profile = { ...DEFAULT_PROFILE, createdAt: now, updatedAt: now };
  await database.profile.put(fresh);
  return fresh;
}

/** Merges a partial update into the profile row. Atomic, so two quick saves never overwrite each other. */
export function updateProfile(
  patch: Partial<Omit<Profile, 'id'>>,
  database: CompanionDB = db,
): Promise<Profile> {
  return database.transaction('rw', database.profile, async () => {
    const current = await getProfile(database);
    const next: Profile = { ...current, ...patch, id: 1, updatedAt: Date.now() };
    await database.profile.put(next);
    return next;
  });
}

/** Records a quiet usage event for the weekly summary. */
export async function acknowledge(
  kind: Acknowledgement['kind'],
  refId: number | null,
  database: CompanionDB = db,
): Promise<void> {
  await database.acknowledgements.add({ kind, refId, at: Date.now() });
}

/** Moves an item up or down inside an ordered table by swapping sortOrder values. */
export async function moveItem<T extends { id?: number; sortOrder: number }>(
  table: Table<T, number>,
  items: T[],
  index: number,
  direction: -1 | 1,
): Promise<void> {
  const target = index + direction;
  if (target < 0 || target >= items.length) return;
  const a = items[index];
  const b = items[target];
  if (a.id === undefined || b.id === undefined) return;
  await table.update(a.id, { sortOrder: b.sortOrder } as unknown as UpdateSpec<T>);
  await table.update(b.id, { sortOrder: a.sortOrder } as unknown as UpdateSpec<T>);
}

/** Next sortOrder value for appending to an ordered table. */
export async function nextSortOrder<T extends { sortOrder: number }>(
  table: Table<T, number>,
): Promise<number> {
  const last = await table.orderBy('sortOrder').last();
  return last ? last.sortOrder + 1 : 0;
}
