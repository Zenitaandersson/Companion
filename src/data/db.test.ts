import { beforeEach, describe, expect, it } from 'vitest';
import { CompanionDB, acknowledge, getProfile, moveItem, nextSortOrder, updateProfile } from './db';

let database: CompanionDB;

beforeEach(async () => {
  database = new CompanionDB(`test-${Math.random()}`);
  await database.open();
});

describe('profile', () => {
  it('is created on first read with defaults', async () => {
    const p = await getProfile(database);
    expect(p.id).toBe(1);
    expect(p.language).toBe('en');
    expect(p.carerPinHash).toBeNull();
    expect(p.onboardingDone).toBe(false);
  });

  it('merges updates and bumps updatedAt', async () => {
    const before = await getProfile(database);
    const after = await updateProfile({ name: 'Erik', homeLabel: 'at home' }, database);
    expect(after.name).toBe('Erik');
    expect(after.homeLabel).toBe('at home');
    expect(after.updatedAt).toBeGreaterThanOrEqual(before.updatedAt);
    expect((await database.profile.count())).toBe(1);
  });
});

describe('ordered tables', () => {
  it('appends with increasing sortOrder and swaps on move', async () => {
    const base = { relationship: '', sentence: '', photo: null, greetingAudio: null, phone: '', callMethod: 'phone' as const };
    await database.contacts.add({ ...base, firstName: 'Anna', sortOrder: await nextSortOrder(database.contacts) });
    await database.contacts.add({ ...base, firstName: 'Martin', sortOrder: await nextSortOrder(database.contacts) });
    let list = await database.contacts.orderBy('sortOrder').toArray();
    expect(list.map((c) => c.firstName)).toEqual(['Anna', 'Martin']);
    await moveItem(database.contacts, list, 1, -1);
    list = await database.contacts.orderBy('sortOrder').toArray();
    expect(list.map((c) => c.firstName)).toEqual(['Martin', 'Anna']);
  });
});

describe('acknowledgements', () => {
  it('records quiet usage events', async () => {
    await acknowledge('question', 3, database);
    const all = await database.acknowledgements.toArray();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ kind: 'question', refId: 3 });
  });
});
