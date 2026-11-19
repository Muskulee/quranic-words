import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { QuizCard } from '../components/Quiz';
import { AudioButton, Button, Card, WordFace, useTheme } from '../components/ui';
import { t } from '../lib/i18n';
import { canStartNewLesson, completeLesson, useProgress } from '../lib/progress';
import { lessonWords, shuffle } from '../lib/words';

type Phase = 'learn' | 'quiz' | 'done';

export default function Lesson() {
  const c = useTheme();
  const p = useProgress();
  const s = t(p.lang);
  const index = Number(useLocalSearchParams<{ index: string }>().index ?? 0);
  const words = useMemo(() => lessonWords(index), [index]);
  const quizOrder = useMemo(() => shuffle(words), [words]);
  const [phase, setPhase] = useState<Phase>('learn');
  const [step, setStep] = useState(0);
  const score = useRef(0);
  // Checked once on entry, so finishing the lesson doesn't flip this screen to "locked".
  const [allowed] = useState(() => canStartNewLesson(p) || index < p.nextLesson);

  if (!allowed) {
    return (
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card>
          <Text style={{ color: c.text }}>{s.doneToday}</Text>
          <Button title={s.home} onPress={() => router.back()} />
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ color: c.muted, fontWeight: '700' }}>
        {s.lesson} {index + 1} · {phase === 'done' ? words.length : step + 1}/{words.length}
      </Text>

      {phase === 'learn' && (
        <Card>
          <WordFace word={words[step]} lang={p.lang} showMeaning />
          <AudioButton url={words[step].audio} autoPlay />
          <Text style={{ color: c.muted, textAlign: 'center' }}>{s.appearsTimes(words[step].count)}</Text>
          <Button
            title={s.next}
            onPress={() => {
              if (step + 1 < words.length) setStep(step + 1);
              else {
                setStep(0);
                setPhase('quiz');
              }
            }}
          />
        </Card>
      )}

      {phase === 'quiz' && (
        <QuizCard
          key={quizOrder[step].rank}
          word={quizOrder[step]}
          lang={p.lang}
          onAnswer={(ok) => {
            if (ok) score.current++;
            if (step + 1 < quizOrder.length) setStep(step + 1);
            else {
              completeLesson(index, words.map((w) => w.rank));
              setPhase('done');
            }
          }}
        />
      )}

      {phase === 'done' && (
        <Card>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '800' }}>{s.finished}</Text>
          <Text style={{ color: c.text }}>{s.finishedBody(score.current, words.length)}</Text>
          <Button title={s.home} onPress={() => router.back()} />
        </Card>
      )}
    </ScrollView>
  );
}
