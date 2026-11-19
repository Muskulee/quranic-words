#!/usr/bin/env node
// Builds src/data/words.json: the most frequent Quran words with meanings in
// English, Urdu and Indonesian, word-by-word audio and an example verse.
// Source: Quran.com API v4 (https://api.quran.com). Run: node scripts/build-words.mjs
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const API = 'https://api.quran.com/api/v4';
const LANGS = ['en', 'ur', 'id'];
const TOP_N = Number(process.env.TOP_N || 1000);
const CACHE_DIR = new URL('../.cache/quran/', import.meta.url);
const OUT = new URL('../src/data/words.json', import.meta.url);

// Strip harakat, Quranic marks and tatweel so different vowelings group together.
const normalize = (s) =>
  s
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
    .replace(/[ٱأإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .trim();

async function fetchJson(url, attempt = 1) {
  const res = await fetch(url);
  if (!res.ok) {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      return fetchJson(url, attempt + 1);
    }
    throw new Error(`${res.status} ${url}`);
  }
  return res.json();
}

async function chapterVerses(chapter, lang) {
  const file = new URL(`${lang}-${chapter}.json`, CACHE_DIR);
  if (existsSync(file)) return JSON.parse(await readFile(file, 'utf8'));
  const verses = [];
  for (let page = 1; ; page++) {
    const url = `${API}/verses/by_chapter/${chapter}?words=true&per_page=50&page=${page}&language=${lang}&word_fields=text_uthmani`;
    const data = await fetchJson(url);
    for (const v of data.verses) {
      verses.push({
        key: v.verse_key,
        words: v.words
          .filter((w) => w.char_type_name === 'word')
          .map((w) => ({
            pos: w.position,
            ar: w.text_uthmani,
            tr: w.transliteration?.text ?? '',
            meaning: w.translation?.text ?? '',
            audio: w.audio_url,
          })),
      });
    }
    if (!data.pagination.next_page) break;
  }
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(file, JSON.stringify(verses));
  return verses;
}

const counts = new Map();
let totalWords = 0;

for (let ch = 1; ch <= 114; ch++) {
  const perLang = {};
  for (const lang of LANGS) perLang[lang] = await chapterVerses(ch, lang);
  perLang.en.forEach((verse, vi) => {
    verse.words.forEach((w, wi) => {
      totalWords++;
      const id = normalize(w.ar);
      let e = counts.get(id);
      if (!e) {
        e = { id, count: 0, forms: new Map(), meanings: { en: new Map(), ur: new Map(), id: new Map() }, first: null };
        counts.set(id, e);
      }
      e.count++;
      e.forms.set(w.ar, (e.forms.get(w.ar) || 0) + 1);
      for (const lang of LANGS) {
        const m = perLang[lang][vi]?.words[wi]?.meaning;
        if (m) e.meanings[lang].set(m, (e.meanings[lang].get(m) || 0) + 1);
      }
      if (!e.first) e.first = { verse: verse.key, tr: w.tr, audio: w.audio };
    });
  });
  process.stdout.write(`\rchapter ${ch}/114`);
}

const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
const words = [...counts.values()]
  .sort((a, b) => b.count - a.count)
  .slice(0, TOP_N)
  .map((e, i) => ({
    rank: i + 1,
    ar: top(e.forms),
    tr: e.first.tr,
    count: e.count,
    meaning: { en: top(e.meanings.en), ur: top(e.meanings.ur), id: top(e.meanings.id) },
    audio: e.first.audio ? `https://audio.qurancdn.com/${e.first.audio}` : null,
    example: e.first.verse,
  }));

let covered = 0;
words.forEach((w) => (covered += w.count));
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(
  OUT,
  JSON.stringify({ source: 'api.quran.com v4', totalWords, coverage: covered / totalWords, words }, null, 1)
);
console.log(`\n${words.length} words cover ${((100 * covered) / totalWords).toFixed(1)}% of ${totalWords} Quran words`);
