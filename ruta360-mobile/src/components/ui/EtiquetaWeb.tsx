import { version } from 'expo/package.json';
import { Image } from 'expo-image';
import { useColorScheme, StyleSheet } from 'react-native';

import { TextoTema } from './TextoTema';
import { VistaTema } from './VistaTema';

import { Espaciado } from '@/constants/espaciado';

export function EtiquetaWeb() {
  const scheme = useColorScheme();

  return (
    <VistaTema style={styles.container}>
      <TextoTema type="code" themeColor="textoSecundario" style={styles.versionText}>
        v{version}
      </TextoTema>
      <Image
        source={
          scheme === 'dark'
            ? require('@/assets/images/expo-badge-white.png')
            : require('@/assets/images/expo-badge.png')
        }
        style={styles.badgeImage}
      />
    </VistaTema>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Espaciado.five,
    alignItems: 'center',
    gap: Espaciado.two,
  },
  versionText: {
    textAlign: 'center',
  },
  badgeImage: {
    width: 123,
    aspectRatio: 123 / 24,
  },
});


