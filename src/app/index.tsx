import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AudioButton, Button, Card, WordFace, useTheme } from '../components/ui';
import { LANG_LABELS, t } from '../lib/i18n';
import { canStartNewLesson, dueRanks, setLang, streak, useProgress } from '../lib/progress';
import { LESSON_COUNT, coverage, wordOfTheDay, type Lang } from '../lib/words';

export default function Home() {
  const c = useTheme();
  const p = useProgress();
  const s = t(p.lang);
  const wotd = wordOfTheDay();
  const learned = Object.keys(p.cards).map(Number);
  const due = dueRanks(p).length;
  const canStart = canStartNewLesson(p);
  const finishedAll = p.nextLesson >= LESSON_COUNT;
  const pct = (coverage(learned) * 100).toFixed(1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={{ gap: 4 }}>
          <Text style={{ color: c.text, fontSize: 30, fontWeight: '800' }}>{s.appName}</Text>
          <Text style={{ color: c.muted, fontSize: 15 }}>{s.tagline}</Text>
        </View>

        <Card>
          <Text style={{ color: c.muted, fontWeight: '700' }}>{s.wordOfDay}</Text>
          <WordFace word={wotd} lang={p.lang} showMeaning />
          <AudioButton url={wotd.audio} />
          <Text style={{ color: c.muted, textAlign: 'center' }}>{s.appearsTimes(wotd.count)}</Text>
        </Card>

        <Card>
          <Text style={{ color: c.text, fontSize: 20, fontWeight: '700' }}>
            {s.todaysLesson} · {s.lesson} {Math.min(p.nextLesson + 1, LESSON_COUNT)}
          </Text>
          {finishedAll ? (
            <Text style={{ color: c.muted }}>{s.allDone}</Text>
          ) : canStart ? (
            <Button title={s.start} onPress={() => router.push({ pathname: '/lesson', params: { index: String(p.nextLesson) } })} />
          ) : (
            <Text style={{ color: c.muted }}>{s.doneToday}</Text>
          )}
        </Card>

        <Card>
          <Text style={{ color: c.text, fontSize: 20, fontWeight: '700' }}>{s.review}</Text>
          <Text style={{ color: c.muted }}>{due ? s.reviewDue(due) : s.nothingDue}</Text>
          {due > 0 && <Button variant="secondary" title={s.review} onPress={() => router.push('/review')} />}
        </Card>

        <Card>
          <Text style={{ color: c.text, fontWeight: '700' }}>{s.streak(streak(p))}</Text>
          <Text style={{ color: c.text }}>{s.learned(learned.length)}</Text>
          <Text style={{ color: c.muted }}>{s.coverage(pct)}</Text>
        </Card>

        <Card>
          <Text style={{ color: c.muted, fontWeight: '700' }}>{s.language}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
              <Pressable
                key={l}
                accessibilityRole="button"
                accessibilityState={{ selected: p.lang === l }}
                onPress={() => setLang(l)}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: c.accent,
                  backgroundColor: p.lang === l ? c.accent : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: p.lang === l ? c.accentText : c.accent, fontWeight: '700' }}>{LANG_LABELS[l]}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
