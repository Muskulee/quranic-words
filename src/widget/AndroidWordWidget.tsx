import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { Word, Lang } from '../lib/words';

/** Home-screen widget for Android. Rendered headlessly by the widget task handler. */
export function AndroidWordWidget({ word, lang, dark }: { word: Word; lang: Lang; dark: boolean }) {
  const bg = dark ? '#101412' : '#F7F5EF';
  const text = dark ? '#EEF2EF' : '#1B1F1D';
  const muted = dark ? '#9AA8A2' : '#5E6B66';
  const accent = dark ? '#3FB68B' : '#0F6B4F';
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: bg,
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <TextWidget text="Word of the day" style={{ fontSize: 12, color: muted }} />
      <TextWidget text={word.ar} style={{ fontSize: 34, color: text, fontWeight: '600' }} />
      <TextWidget text={word.tr} style={{ fontSize: 13, color: muted }} />
      <TextWidget
        text={word.meaning[lang] || word.meaning.en}
        style={{ fontSize: 16, color: accent, fontWeight: '700', textAlign: 'center' }}
        maxLines={2}
        truncate="END"
      />
    </FlexWidget>
  );
}
