import { createClient } from '@insforge/sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const insforge = createClient({
  baseUrl: process.env.EXPO_PUBLIC_INSFORGE_URL || 'https://qy4t6j33.us-east.insforge.app',
  anonKey: process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY || 'anon_74c52d7649b684af088cf06a5bd2a8d0635bb37cf7f2b8624b0ae4beeaaa3e99',
  storage: AsyncStorage
});
