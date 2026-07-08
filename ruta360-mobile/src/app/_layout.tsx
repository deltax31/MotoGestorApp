import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAutenticacionStore } from '@/store/autenticacionStore';
import { View, ActivityIndicator } from 'react-native';
import { Colores } from '@/constants/colores';

export default function RootLayout() {
  const { session, isLoading, checkSession } = useAutenticacionStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const authSegments = ['(auth)', 'login', 'register'];
    const inAuthGroup = segments.length > 0 && authSegments.includes(segments[0] as string);
    const isRoot = !segments.length || (segments[0] as string) === '(index)' || (segments[0] as string) === 'index';
    
    // Rutas que no requieren autenticación
    const isUnprotected = inAuthGroup || isRoot;

    // Defer the navigation to the next tick to ensure Root Layout is mounted
    // This prevents the "Attempted to navigate before mounting the Root Layout component" error
    const timer = setTimeout(() => {
      if (session && isUnprotected) {
        // Si el usuario está logueado y está en auth o root, redirigir a tabs
        router.replace('/(tabs)/inicio');
      } else if (!session && !isUnprotected) {
        // Si el usuario no está logueado e intenta ir a rutas protegidas, redirigir al landing
        router.replace('/');
      }
    }, 1);

    return () => clearTimeout(timer);
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
