import { createClient } from '@insforge/sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

// Polyfill WebCrypto for React Native to support PKCE in InsForge SDK
if (Platform.OS !== 'web') {
  if (!globalThis.crypto) {
    (globalThis as any).crypto = {};
  }
  if (!globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues = Crypto.getRandomValues;
  }
  if (!globalThis.crypto.subtle) {
    (globalThis.crypto as any).subtle = {
      digest: async (algorithm: string, data: BufferSource) => {
        // InsForge requests "SHA-256", we map it to expo-crypto's enum
        return await Crypto.digest(
          Crypto.CryptoDigestAlgorithm.SHA256,
          data
        );
      }
    };
  }
}

// Para usar AsyncStorage explícitamente y evitar warnings
export const insforge = createClient({
  baseUrl: process.env.EXPO_PUBLIC_INSFORGE_URL || 'https://qy4t6j33.us-east.insforge.app',
  anonKey: process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY || 'anon_74c52d7649b684af088cf06a5bd2a8d0635bb37cf7f2b8624b0ae4beeaaa3e99',
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
