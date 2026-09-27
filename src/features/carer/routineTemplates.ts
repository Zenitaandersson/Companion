import type { Language, RoutineStep } from '../../data/types';

type StepSeed = Omit<RoutineStep, 'id' | 'sortOrder'>;

const EN_GENTLE: StepSeed[] = [
  { title: 'Wake up', time: '08:00', spokenText: 'Good morning. It is a new day.', icon: '☀️', remind: false, repeatMinutes: 0 },
  { title: 'Breakfast', time: '08:30', spokenText: 'It is time for breakfast.', icon: '🥣', remind: true, repeatMinutes: 15 },
  { title: 'Medicine', time: '09:00', spokenText: 'It is time for your morning medicine. It is in the box on the table.', icon: '💊', remind: true, repeatMinutes: 15 },
  { title: 'Lunch', time: '12:30', spokenText: 'It is time for lunch.', icon: '🍲', remind: true, repeatMinutes: 15 },
  { title: 'Rest', time: '14:00', spokenText: 'This is a good time to rest.', icon: '🛋', remind: false, repeatMinutes: 0 },
  { title: 'Dinner', time: '17:30', spokenText: 'It is time for dinner.', icon: '🍽', remind: true, repeatMinutes: 15 },
  { title: 'Bedtime', time: '21:30', spokenText: 'It is evening. Time to get ready for bed.', icon: '🌙', remind: true, repeatMinutes: 20 },
];

const EN_FULL: StepSeed[] = [
  ...EN_GENTLE.slice(0, 3),
  { title: 'Walk', time: '10:30', spokenText: 'A short walk is nice now. Your shoes are by the door.', icon: '🚶', remind: true, repeatMinutes: 15 },
  ...EN_GENTLE.slice(3, 5),
  { title: 'Coffee', time: '15:00', spokenText: 'It is time for coffee.', icon: '☕', remind: true, repeatMinutes: 15 },
  ...EN_GENTLE.slice(5),
];

const SV_GENTLE: StepSeed[] = [
  { title: 'Vakna', time: '08:00', spokenText: 'God morgon. Det är en ny dag.', icon: '☀️', remind: false, repeatMinutes: 0 },
  { title: 'Frukost', time: '08:30', spokenText: 'Det är dags för frukost.', icon: '🥣', remind: true, repeatMinutes: 15 },
  { title: 'Medicin', time: '09:00', spokenText: 'Det är dags för din morgonmedicin. Den ligger i dosetten på bordet.', icon: '💊', remind: true, repeatMinutes: 15 },
  { title: 'Lunch', time: '12:30', spokenText: 'Det är dags för lunch.', icon: '🍲', remind: true, repeatMinutes: 15 },
  { title: 'Vila', time: '14:00', spokenText: 'Nu är det en bra stund att vila.', icon: '🛋', remind: false, repeatMinutes: 0 },
  { title: 'Middag', time: '17:30', spokenText: 'Det är dags för middag.', icon: '🍽', remind: true, repeatMinutes: 15 },
  { title: 'Läggdags', time: '21:30', spokenText: 'Det är kväll. Dags att göra sig redo för natten.', icon: '🌙', remind: true, repeatMinutes: 20 },
];

const SV_FULL: StepSeed[] = [
  ...SV_GENTLE.slice(0, 3),
  { title: 'Promenad', time: '10:30', spokenText: 'En kort promenad är skönt nu. Skorna står vid dörren.', icon: '🚶', remind: true, repeatMinutes: 15 },
  ...SV_GENTLE.slice(3, 5),
  { title: 'Kaffe', time: '15:00', spokenText: 'Det är dags för kaffe.', icon: '☕', remind: true, repeatMinutes: 15 },
  ...SV_GENTLE.slice(5),
];

export type TemplateName = 'gentle' | 'full';

export function routineTemplate(name: TemplateName, language: Language): StepSeed[] {
  if (language === 'sv') return name === 'gentle' ? SV_GENTLE : SV_FULL;
  return name === 'gentle' ? EN_GENTLE : EN_FULL;
}

export const STEP_ICONS = ['☀️', '🥣', '💊', '🚶', '🍲', '🛋', '☕', '🍽', '🌙', '📺', '🛁', '📞', '🧩', '🎵'];
