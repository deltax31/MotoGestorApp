import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { Colores } from '@/constants/colores';

export default function RootLayout() {
  const { session, isLoading, checkSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isRoot = segments.length === 0 || segments[0] === '(index)' || segments[0] === 'index';
    
    // Rutas que no requieren autenticación
    const isUnprotected = inAuthGroup || isRoot;

    if (session && isUnprotected) {
      // Si el usuario está logueado y está en auth o root, redirigir a tabs
      router.replace('/(tabs)/dashboard');
    } else if (!session && !isUnprotected) {
      // Si el usuario no está logueado e intenta ir a rutas protegidas, redirigir al landing
      router.replace('/');
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colores.fondoPrincipal }}>
        <ActivityIndicator size="large" color={Colores.primario} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}
