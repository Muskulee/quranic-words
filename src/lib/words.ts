import data from '../data/words.json';

export type Lang = 'en' | 'ur' | 'id';

export type Word = {
  rank: number;
  ar: string;
  tr: string;
  count: number;
  meaning: Record<Lang, string>;
  audio: string | null;
  example: string;
};

export const WORDS: Word[] = (data as { words: Word[] }).words;
export const TOTAL_QURAN_WORDS: number = (data as { totalWords: number }).totalWords;

export const WORDS_PER_LESSON = 10;
export const LESSON_COUNT = Math.ceil(WORDS.length / WORDS_PER_LESSON);

export function lessonWords(lessonIndex: number): Word[] {
  const start = lessonIndex * WORDS_PER_LESSON;
  return WORDS.slice(start, start + WORDS_PER_LESSON);
}

export function wordByRank(rank: number): Word | undefined {
  return WORDS[rank - 1];
}

/** Share of all words in the Quran covered by the given learned ranks. */
export function coverage(learnedRanks: Iterable<number>): number {
  let sum = 0;
  for (const r of learnedRanks) sum += WORDS[r - 1]?.count ?? 0;
  return TOTAL_QURAN_WORDS ? sum / TOTAL_QURAN_WORDS : 0;
}

/** Deterministic word of the day, cycling through the top words (used by the widget too). */
export function wordOfTheDay(date = new Date()): Word {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  const pool = Math.min(WORDS.length, 365);
  return WORDS[day % pool];
}

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Three wrong meanings from nearby ranks, so choices are plausible. */
export function distractors(word: Word, lang: Lang, n = 3): string[] {
  const answer = word.meaning[lang].toLowerCase();
  const seen = new Set([answer]);
  const near: string[] = [];
  for (const w of shuffle(WORDS.slice(Math.max(0, word.rank - 40), word.rank + 40))) {
    const m = w.meaning[lang];
    if (m && !seen.has(m.toLowerCase())) {
      seen.add(m.toLowerCase());
      near.push(m);
    }
  }
  return near.slice(0, n);
}
