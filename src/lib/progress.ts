import Storage from 'expo-sqlite/kv-store';
import { useSyncExternalStore } from 'react';
import { getLocales } from 'expo-localization';
import type { Lang } from './words';

/** Leitner box per learned word; higher box = longer gap before review. */
export type Card = { box: number; due: string };

export type Progress = {
  lang: Lang;
  nextLesson: number;
  cards: Record<number, Card>;
  /** ISO dates (YYYY-MM-DD) on which a lesson was completed. */
  lessonDays: string[];
  /** ISO date of the last free lesson used. */
  lastFreeLessonDay: string | null;
  premium: boolean;
};

const KEY = 'progress.v1';
const BOX_DAYS = [0, 1, 3, 7, 16, 35];

export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return today(d);
};

function defaultLang(): Lang {
  const code = getLocales()[0]?.languageCode;
  return code === 'ur' || code === 'id' ? code : 'en';
}

function load(): Progress {
  const raw = Storage.getItemSync(KEY);
  const base: Progress = {
    lang: defaultLang(),
    nextLesson: 0,
    cards: {},
    lessonDays: [],
    lastFreeLessonDay: null,
    premium: false,
  };
  if (!raw) return base;
  try {
    return { ...base, ...JSON.parse(raw) };
  } catch {
    return base;
  }
}

let state: Progress = load();
const listeners = new Set<() => void>();

function commit(next: Progress) {
  state = next;
  // Saved synchronously so progress survives an immediate app kill.
  Storage.setItemSync(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state
  );
}

export const getProgress = () => state;

export function setLang(lang: Lang) {
  commit({ ...state, lang });
}

export function setPremium(premium: boolean) {
  commit({ ...state, premium });
}

/** Free users get one new lesson per calendar day, with no waiting timer. */
export function canStartNewLesson(p: Progress = state): boolean {
  return p.premium || p.lastFreeLessonDay !== today();
}

export function completeLesson(lessonIndex: number, ranks: number[]) {
  const cards = { ...state.cards };
  for (const r of ranks) if (!cards[r]) cards[r] = { box: 1, due: addDays(BOX_DAYS[1]) };
  const day = today();
  commit({
    ...state,
    cards,
    nextLesson: Math.max(state.nextLesson, lessonIndex + 1),
    lessonDays: state.lessonDays.includes(day) ? state.lessonDays : [...state.lessonDays, day],
    lastFreeLessonDay: state.premium ? state.lastFreeLessonDay : day,
  });
}

export function dueRanks(p: Progress = state): number[] {
  const t = today();
  return Object.entries(p.cards)
    .filter(([, c]) => c.due <= t)
    .map(([r]) => Number(r));
}

export function gradeCard(rank: number, correct: boolean) {
  const card = state.cards[rank] ?? { box: 1, due: today() };
  const box = correct ? Math.min(card.box + 1, BOX_DAYS.length - 1) : 1;
  commit({ ...state, cards: { ...state.cards, [rank]: { box, due: addDays(BOX_DAYS[box]) } } });
}

/** Consecutive days with a completed lesson, ending today or yesterday. */
export function streak(p: Progress = state): number {
  const days = new Set(p.lessonDays);
  const d = new Date();
  if (!days.has(today(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(today(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
