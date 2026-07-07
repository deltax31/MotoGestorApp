import { Platform } from 'react-native';

export const Espaciado = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MargenInferiorTabs = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxAnchoContenido = 800;
