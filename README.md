# Quranic Words

Learn the most frequent words of the Quran so you understand what you hear in salah and tarawih.

- 10 words per lesson, ordered by how often they appear in the Quran
- Word-by-word recitation audio, transliteration and example verse
- Meanings in English, Urdu and Indonesian
- Spaced review (Leitner boxes) so words stick
- One free new lesson every day, with no waiting timers. Premium unlocks unlimited lessons.
- Progress is saved on the device immediately (`expo-sqlite` key-value store)

## Run it

```bash
npm install
npx expo start
```

## Word data

`src/data/words.json` is generated from the [Quran.com API v4](https://api.quran.com) and committed, so the app works offline:

```bash
npm run build:words          # TOP_N=1000 by default
```

The script groups words by their unvoweled form, counts occurrences across all 6,236 verses, and keeps the most common meaning in each language. Responses are cached in `.cache/` (git-ignored).

## Roadmap

1. Lock-screen and home-screen "word of the day" widget (iOS WidgetKit, Android Glance)
2. Premium with RevenueCat ($6.99/month, $39.99/year)
3. Optional account and progress sync (Netlify Functions + Neon)
4. "Understand tarawih in 30 days" Ramadan course
