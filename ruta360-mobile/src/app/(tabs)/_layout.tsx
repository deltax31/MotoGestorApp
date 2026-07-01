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
        },
        tabBarActiveTintColor: Colores.acento,
        tabBarInactiveTintColor: Colores.textoSecundario,
      }}
    >
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="garage" 
        options={{ 
          title: 'Garaje',
          tabBarIcon: ({ color }) => <FontAwesome name="motorcycle" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="ai" 
        options={{ 
          title: 'Asistente IA',
          tabBarIcon: ({ color }) => <FontAwesome name="magic" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="finances" 
        options={{ 
          title: 'Finanzas',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome name="credit-card" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />
        }} 
      />
    </Tabs>
  );
}
