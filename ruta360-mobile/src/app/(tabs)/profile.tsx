import { View, Text, StyleSheet, Button } from 'react-native';
import { Colores } from '@/constants/colores';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const { logout } = useAuthStore();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil de Usuario</Text>
      <View style={{ marginTop: 20 }}>
        <Button title="Cerrar Sesión" color={Colores.acento} onPress={() => logout()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colores.fondoPrincipal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colores.textoPrimario,
  },
});
