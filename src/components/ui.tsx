import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme, type ViewStyle } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import type { Word, Lang } from '../lib/words';

export const palette = {
  light: { bg: '#F7F5EF', card: '#FFFFFF', text: '#1B1F1D', muted: '#5E6B66', accent: '#0F6B4F', accentText: '#FFFFFF', border: '#E2DED3', good: '#2E7D32', bad: '#B3261E' },
  dark: { bg: '#101412', card: '#1A201D', text: '#EEF2EF', muted: '#9AA8A2', accent: '#3FB68B', accentText: '#0B110E', border: '#2A322E', good: '#66BB6A', bad: '#EF5350' },
};

export function useTheme() {
  return palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const c = useTheme();
  return <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  disabled,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const c = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: primary ? c.accent : 'transparent', borderColor: c.accent, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[styles.buttonText, { color: primary ? c.accentText : c.accent }]}>{title}</Text>
    </Pressable>
  );
}

/** Plays a word's recitation. Autoplays once when `autoPlay` is set. */
export function AudioButton({ url, autoPlay }: { url: string | null; autoPlay?: boolean }) {
  const c = useTheme();
  const player = useAudioPlayer(url ?? undefined);
  useEffect(() => {
    if (autoPlay && url) {
      player.seekTo(0);
      player.play();
    }
  }, [url, autoPlay, player]);
  if (!url) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Play recitation"
      onPress={() => {
        player.seekTo(0);
        player.play();
      }}
      style={[styles.audio, { borderColor: c.accent }]}
    >
      <Text style={{ color: c.accent, fontSize: 20 }}>▶</Text>
    </Pressable>
  );
}

export function WordFace({ word, lang, showMeaning }: { word: Word; lang: Lang; showMeaning: boolean }) {
  const c = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Text style={[styles.arabic, { color: c.text }]}>{word.ar}</Text>
      <Text style={{ color: c.muted, fontSize: 16 }}>{word.tr}</Text>
      {showMeaning && (
        <Text style={{ color: c.text, fontSize: 22, fontWeight: '600', textAlign: 'center' }}>{word.meaning[lang]}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 12 },
  button: { borderRadius: 12, borderWidth: 2, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  buttonText: { fontSize: 17, fontWeight: '700' },
  audio: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  arabic: { fontSize: 52, lineHeight: 90, textAlign: 'center', writingDirection: 'rtl' },
});
