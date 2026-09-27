import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import type {
  Contact,
  FrequentQuestion,
  Memory,
  PlannedEvent,
  Profile,
  RoutineStep,
} from '../data/types';

/** Live profile row; undefined while loading or before App has created it. */
export function useProfile(): Profile | undefined {
  return useLiveQuery(() => db.profile.get(1), []);
}

export function useContacts(): Contact[] {
  return useLiveQuery(() => db.contacts.orderBy('sortOrder').toArray(), []) ?? [];
}

export function useRoutineSteps(): RoutineStep[] {
  return useLiveQuery(() => db.routineSteps.orderBy('sortOrder').toArray(), []) ?? [];
}

export function useEvents(): PlannedEvent[] {
  return useLiveQuery(() => db.events.toArray(), []) ?? [];
}

export function useQuestions(): FrequentQuestion[] {
  return useLiveQuery(() => db.questions.orderBy('sortOrder').toArray(), []) ?? [];
}

export function useMemories(): Memory[] {
  return useLiveQuery(() => db.memories.orderBy('sortOrder').toArray(), []) ?? [];
}
