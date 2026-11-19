import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../components/ui';
import { useProgress } from '../lib/progress';
import { syncWidgets } from '../widget/sync';

export default function RootLayout() {
  const c = useTheme();
  const { lang } = useProgress();
  // Keep the widgets in the user's meaning language, and refresh them on launch.
  useEffect(() => {
    syncWidgets();
  }, [lang]);
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.bg },
          headerTintColor: c.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="lesson" options={{ title: '' }} />
        <Stack.Screen name="review" options={{ title: '' }} />
      </Stack>
    </>
  );
}
