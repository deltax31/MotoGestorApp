import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';
import { MaintenanceRecord } from '@/store/mantenimientoStore';
import { useRouter } from 'expo-router';

interface TarjetaMantenimientoProps {
  record: MaintenanceRecord;
}

export default function TarjetaMantenimiento({ record }: TarjetaMantenimientoProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/mantenimientos/${record.id}/edit`);
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handlePress}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="build" size={20} color={Colores.primario} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {record.services && record.services.length > 0 
              ? record.services.length === 1 
                ? (record.services[0]?.type || 'Servicio Múltiple')
                : `${record.services[0]?.type || 'Varios'} y ${record.services.length - 1} más`
              : 'Servicio Múltiple'}
          </Text>
          <Text style={styles.date}>{record.date}</Text>
        </View>
        <View style={styles.costContainer}>
          <Text style={styles.cost}>${record.cost || 0}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.infoPill}>
          <MaterialIcons name="speed" size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.infoText}>{record.km_at_service} km</Text>
        </View>
        
        {record.workshop ? (
          <View style={styles.infoPill}>
            <MaterialIcons name="store" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.infoText}>{record.workshop}</Text>
          </View>
        ) : null}
        
        <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.3)" style={{ marginLeft: 'auto' }} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 200, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: Colores.blanco,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  costContainer: {
    alignItems: 'flex-end',
  },
  cost: {
    color: Colores.acento,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
    gap: 12,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});
