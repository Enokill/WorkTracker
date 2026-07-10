import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { AppProvider } from '@/contexts/AppContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AppProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="entry/[date]"
              options={{
                headerShown: true,
                presentation: 'modal',
                title: 'Work Entry',
                headerStyle: { backgroundColor: '#2563EB' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '700', fontSize: 18 },
              }}
            />
          </Stack>
        </AppProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
