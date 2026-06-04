import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { MockClerkProvider } from '@/lib/mockAuth'
import { Colors } from '@/constants/theme'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MockClerkProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            contentStyle: { backgroundColor: Colors.background },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ title: 'Iniciar sesión', presentation: 'modal' }} />
          <Stack.Screen name="car/[id]" options={{ title: '', headerTransparent: true }} />
        </Stack>
      </MockClerkProvider>
    </GestureHandlerRootView>
  )
}
