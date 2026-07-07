import { Tabs } from 'expo-router';
import { Colores } from '@/constants/colores';
import { FontAwesome } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colores.fondoPrincipal },
        headerTintColor: Colores.textoPrimario,
        tabBarStyle: { 
          backgroundColor: Colores.fondoAsfalto,
          borderTopColor: Colores.borde,
          height: 60,
          paddingBottom: 5,
        },
        tabBarActiveTintColor: Colores.acento,
        tabBarInactiveTintColor: Colores.textoSecundario,
      }}
    >
      <Tabs.Screen 
        name="inicio" 
        options={{ 
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="garaje" 
        options={{ 
          title: 'Garaje',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome name="motorcycle" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="asistente" 
        options={{ 
          title: 'Asistente IA',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome name="magic" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="finanzas" 
        options={{ 
          title: 'Finanzas',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome name="credit-card" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="perfil" 
        options={{ 
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />
        }} 
      />
    </Tabs>
  );
}
