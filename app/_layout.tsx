import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function AppStack() {
  const { colors } = useTheme();
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="entry/[date]"
        options={{
          headerShown: true,
          presentation: 'modal',
          title: 'Work Entry',
          headerStyle: { backgroundColor: colors.gradientPrimaryStart },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppProvider>
            <AppStack />
          </AppProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
