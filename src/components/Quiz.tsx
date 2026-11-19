import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AudioButton, Button, Card, WordFace, useTheme } from './ui';
import { t } from '../lib/i18n';
import { distractors, shuffle, type Lang, type Word } from '../lib/words';

/** One multiple-choice question: pick the meaning of the word. */
export function QuizCard({ word, lang, onAnswer }: { word: Word; lang: Lang; onAnswer: (correct: boolean) => void }) {
  const c = useTheme();
  const s = t(lang);
  const choices = useMemo(() => shuffle([word.meaning[lang], ...distractors(word, lang)]), [word, lang]);
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === word.meaning[lang];

  return (
    <Card>
      <Text style={{ color: c.muted, fontWeight: '700' }}>{s.chooseMeaning}</Text>
      <WordFace word={word} lang={lang} showMeaning={false} />
      <AudioButton url={word.audio} autoPlay />
      <View style={{ gap: 8 }}>
        {choices.map((choice) => {
          const isAnswer = choice === word.meaning[lang];
          const border = picked == null ? c.border : isAnswer ? c.good : choice === picked ? c.bad : c.border;
          return (
            <Pressable
              key={choice}
              accessibilityRole="button"
              disabled={picked != null}
              onPress={() => setPicked(choice)}
              style={{ borderWidth: 2, borderColor: border, borderRadius: 12, padding: 14 }}
            >
              <Text style={{ color: c.text, fontSize: 17 }}>{choice}</Text>
            </Pressable>
          );
        })}
      </View>
      {picked != null && (
        <>
          <Text style={{ color: correct ? c.good : c.bad, fontWeight: '700' }}>
            {correct ? s.correct : `${s.wrong} ${word.meaning[lang]}`}
          </Text>
          <Text style={{ color: c.muted }}>
            {s.example}: {word.example}
          </Text>
          <Button
            title={s.next}
            onPress={() => {
              onAnswer(correct);
              setPicked(null);
            }}
          />
        </>
      )}
    </Card>
  );
}
