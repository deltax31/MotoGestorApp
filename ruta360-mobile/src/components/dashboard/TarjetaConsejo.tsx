import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';
import { useVehiculoStore } from '@/store/vehiculoStore';
import { getManualInsights } from '@/services/insforge/rag';

export function TarjetaConsejo() {
  const { motorcycles, activeMotorcycleId } = useVehiculoStore();
  const moto = motorcycles.find(m => m.id === activeMotorcycleId) || motorcycles[0];
  
  const [loading, setLoading] = useState(true);
  const [tipData, setTipData] = useState<{ tip_dashboard?: string } | null>(null);

  useEffect(() => {
    if (moto) {
      setLoading(true);
      getManualInsights(moto.id, moto.brand, moto.model, moto.current_km)
        .then(data => {
          setLoading(false);
          setTipData(data || null);
        });
    } else {
      setLoading(false);
    }
  }, [moto?.id, moto?.current_km]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tips del Manual</Text>
        <View style={styles.headerLine} />
      </View>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="menu-book" size={24} color={Colores.primario} />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
               {moto ? `Para tu ${moto.brand} ${moto.model}` : 'Tip Técnico General'}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>MANUAL</Text>
            </View>
          </View>
          
          {loading ? (
             <ActivityIndicator size="small" color={Colores.primario} style={{ alignSelf: 'flex-start', marginTop: 8 }} />
          ) : (
            <Text style={styles.description}>
              {tipData?.tip_dashboard 
                ? tipData.tip_dashboard 
                : "Asegúrate de revisar periódicamente tu motocicleta para un óptimo rendimiento en la ciudad."}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.2)',
    alignItems: 'flex-start',
  },
  iconContainer: {
    backgroundColor: 'rgba(0, 200, 212, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colores.blanco,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: Colores.acento,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  }
});
