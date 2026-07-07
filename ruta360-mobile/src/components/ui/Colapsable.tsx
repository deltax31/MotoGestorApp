import { SymbolView } from 'expo-symbols';
import { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { TextoTema } from '@/components/ui/TextoTema';
import { VistaTema } from '@/components/ui/VistaTema';
import { Espaciado } from '@/constants/espaciado';
import { Colores } from '@/constants/colores';

export function Colapsable({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <VistaTema>
      <Pressable
        style={({ pressed }) => [styles.heading, pressed && styles.pressedHeading]}
        onPress={() => setIsOpen((value) => !value)}>
        <VistaTema type="fondoAsfalto" style={styles.button}>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={14}
            weight="bold"
            tintColor={Colores.textoPrimario}
            style={{ transform: [{ rotate: isOpen ? '-90deg' : '90deg' }] }}
          />
        </VistaTema>

        <TextoTema type="small">{title}</TextoTema>
      </Pressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <VistaTema type="fondoAsfalto" style={styles.content}>
            {children}
          </VistaTema>
        </Animated.View>
      )}
    </VistaTema>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.two,
  },
  pressedHeading: {
    opacity: 0.7,
  },
  button: {
    width: Espaciado.four,
    height: Espaciado.four,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: Espaciado.three,
    borderRadius: Espaciado.three,
    marginLeft: Espaciado.four,
    padding: Espaciado.four,
  },
});

