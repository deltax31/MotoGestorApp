import { Stack } from 'expo-router';
import { Colores } from '@/constants/colores';

export default function MaintenanceLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colores.fondoPrincipal,
        },
        headerTintColor: Colores.blanco,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: Colores.fondoPrincipal,
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Mantenimientos',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="add" 
        options={{ 
          title: 'Registrar Servicio',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="[id]/edit" 
        options={{ 
          title: 'Editar Servicio',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
