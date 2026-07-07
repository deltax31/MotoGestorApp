import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Colores } from '@/constants/colores';

export default function TabsApp() {
  return (
    <NativeTabs
      backgroundColor={Colores.fondoPrincipal}
      indicatorColor={Colores.fondoAsfalto}
      labelStyle={{ selected: { color: Colores.textoPrimario } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explorar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
