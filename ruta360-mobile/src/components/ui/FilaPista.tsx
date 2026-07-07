import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

import { TextoTema } from './TextoTema';
import { VistaTema } from './VistaTema';

import { Espaciado } from '@/constants/espaciado';

type FilaPistaProps = {
  title?: string;
  hint?: ReactNode;
};

export function FilaPista({ title = 'Try editing', hint = 'app/index.tsx' }: FilaPistaProps) {
  return (
    <View style={styles.stepRow}>
      <TextoTema type="small">{title}</TextoTema>
      <VistaTema type="fondoAsfalto" style={styles.codeSnippet}>
        <TextoTema themeColor="textoSecundario">{hint}</TextoTema>
      </VistaTema>
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeSnippet: {
    borderRadius: Espaciado.two,
    paddingVertical: Espaciado.half,
    paddingHorizontal: Espaciado.two,
  },
});


