import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { QuizCard } from '../components/Quiz';
import { Button, Card, useTheme } from '../components/ui';
import { t } from '../lib/i18n';
import { dueRanks, getProgress, gradeCard, useProgress } from '../lib/progress';
import { shuffle, wordByRank, type Word } from '../lib/words';

export default function Review() {
  const c = useTheme();
  const p = useProgress();
  const s = t(p.lang);
  // Snapshot the due list on entry; grading moves cards out of "due".
  const queue = useMemo(
    () => shuffle(dueRanks(getProgress()).map(wordByRank).filter((w): w is Word => !!w)),
    []
  );
  const [step, setStep] = useState(0);

  if (step >= queue.length) {
    return (
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card>
          <Text style={{ color: c.text }}>{s.nothingDue}</Text>
          <Button title={s.home} onPress={() => router.back()} />
        </Card>
      </ScrollView>
    );
  }

  const word = queue[step];
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ color: c.muted, fontWeight: '700' }}>
        {s.review} · {step + 1}/{queue.length}
      </Text>
      <QuizCard
        key={word.rank}
        word={word}
        lang={p.lang}
        onAnswer={(ok) => {
          gradeCard(word.rank, ok);
          setStep(step + 1);
        }}
      />
    </ScrollView>
  );
}
