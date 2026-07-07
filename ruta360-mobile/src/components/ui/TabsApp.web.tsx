import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, View, StyleSheet } from 'react-native';

import { EnlaceExterno } from './EnlaceExterno';
import { TextoTema } from './TextoTema';
import { VistaTema } from './VistaTema';

import { Colores } from '@/constants/colores';
import { MaxAnchoContenido, Espaciado } from '@/constants/espaciado';

export default function TabsApp() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Inicio</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/" asChild>
            <TabButton>Explorar</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <VistaTema
        type={isFocused ? 'fondoAsfalto' : 'fondoPrincipal'}
        style={styles.tabButtonView}>
        <TextoTema type="small" themeColor={isFocused ? 'textoPrimario' : 'textoSecundario'}>
          {children}
        </TextoTema>
      </VistaTema>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <VistaTema type="fondoAsfalto" style={styles.innerContainer}>
        <TextoTema type="smallBold" style={styles.brandText}>
          Ruta 360
        </TextoTema>

        {props.children}

        <EnlaceExterno href="https://docs.expo.dev" asChild>
          <Pressable style={styles.externalPressable}>
            <TextoTema type="link">Docs</TextoTema>
            <SymbolView
              tintColor={Colores.textoPrimario}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </EnlaceExterno>
      </VistaTema>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Espaciado.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Espaciado.two,
    paddingHorizontal: Espaciado.five,
    borderRadius: Espaciado.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Espaciado.two,
    maxWidth: MaxAnchoContenido,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Espaciado.one,
    paddingHorizontal: Espaciado.three,
    borderRadius: Espaciado.three,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Espaciado.one,
    marginLeft: Espaciado.three,
  },
});
