import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';

import { useRouter } from 'expo-router';

export function CuadriculaAcciones({ activeMotorcycleId }: { activeMotorcycleId?: string }) {
  const router = useRouter();

  const handleGaragePress = () => {
    if (activeMotorcycleId) {
      router.push(`/(tabs)/garaje/${activeMotorcycleId}?from=dashboard`);
    } else {
      router.push('/(tabs)/garaje');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión</Text>
        <View style={styles.headerLine} />
      </View>
      <View style={styles.grid}>
        {/* Mi Garaje */}
        <TouchableOpacity style={styles.card} onPress={handleGaragePress}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="motorcycle" size={24} color={Colores.primario} />
          </View>
          <View>
            <Text style={styles.title}>Mi Garaje</Text>
            <Text style={styles.subtitle}>2 Vehículos registrados</Text>
          </View>
        </TouchableOpacity>

        {/* Mantenimientos */}
        <TouchableOpacity style={styles.card} onPress={() => router.push('/mantenimientos')}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="history" size={24} color={Colores.primario} />
          </View>
          <View>
            <Text style={styles.title}>Mantenimientos</Text>
            <Text style={styles.subtitle}>Próximo: Cambio Aceite</Text>
          </View>
        </TouchableOpacity>

        {/* Finanzas */}
        <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/finanzas')}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="account-balance-wallet" size={24} color={Colores.primario} />
          </View>
          <View>
            <Text style={styles.title}>Finanzas</Text>
            <Text style={styles.subtitle}>Gastos del mes: $450k</Text>
          </View>
        </TouchableOpacity>

        {/* Asistente IA */}
        <TouchableOpacity style={[styles.card, styles.aiCard]}>
          <View style={styles.aiIconContainer}>
            <MaterialIcons name="auto-awesome" size={24} color={Colores.acento} />
          </View>
          <View>
            <Text style={styles.title}>Asistente IA</Text>
            <Text style={styles.aiSubtitle}>¿Necesitas ayuda técnica?</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colores.blanco,
    marginRight: 8,
  },
  headerLine: {
    height: 2,
    width: 32,
    backgroundColor: 'rgba(0, 200, 212, 0.3)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.1)',
  },
  aiCard: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  aiIconContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colores.blanco,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  aiSubtitle: {
    fontSize: 10,
    color: 'rgba(245, 158, 11, 0.8)',
    fontWeight: '500',
  }
});
