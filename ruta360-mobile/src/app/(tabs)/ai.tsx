import { View, Text, StyleSheet } from 'react-native';
import { Colores } from '@/constants/colores';

export default function AIScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asistente IA</Text>
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
