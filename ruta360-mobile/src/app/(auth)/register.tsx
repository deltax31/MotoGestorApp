import { View, Text, StyleSheet } from 'react-native';
import { Colores } from '@/constants/colores';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <Text style={styles.subtitle}>Crear una cuenta nueva</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colores.fondoPrincipal,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colores.textoPrimario,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colores.textoSecundario,
  },
});
