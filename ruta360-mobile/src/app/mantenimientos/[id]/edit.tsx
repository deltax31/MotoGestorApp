import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';
import { useMantenimientoStore } from '@/store/mantenimientoStore';
import FormularioMantenimiento, { FormularioMantenimientoData } from '@/components/mantenimiento/FormularioMantenimiento';

export default function EditMaintenanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { records, updateMaintenanceRecord, deleteMaintenanceRecord } = useMantenimientoStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [record, setRecord] = useState(records.find(r => r.id === id));
  
  if (!record) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colores.blanco, marginBottom: 20 }}>Registro no encontrado</Text>
        <TouchableOpacity 
          style={{ backgroundColor: Colores.primario, padding: 12, borderRadius: 8 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: Colores.fondoPrincipal, fontWeight: 'bold' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async (formData: FormularioMantenimientoData, totalCost: number) => {
    setIsSubmitting(true);
    
    const updatedData = {
      motorcycle_id: formData.motorcycle_id,
      date: formData.date,
      km_at_service: parseInt(formData.km_at_service) || 0,
      cost: totalCost,
      workshop: formData.workshop || null,
      notes: formData.notes || null,
      next_km: formData.next_km ? parseInt(formData.next_km) : null,
    };

    const validServices = formData.services.map(s => ({
      type: s.type,
      cost: parseFloat(s.cost) || 0
    }));

    const { error } = await updateMaintenanceRecord(record.id, updatedData, validServices);
    
    setIsSubmitting(false);

    if (error) {
      console.error("Error updating maintenance:", error);
      Alert.alert('Error', error.message || 'No se pudo actualizar el mantenimiento.');
    } else {
      router.back();
    }
  };

  const executeDelete = async () => {
    setIsSubmitting(true);
    const { error } = await deleteMaintenanceRecord(record.id);
    setIsSubmitting(false);
    if (error) {
      Alert.alert('Error', 'No se pudo eliminar el registro.');
    } else {
      router.back();
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este evento de mantenimiento?');
      if (confirmed) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Eliminar Registro',
        '¿Estás seguro de que deseas eliminar este evento de mantenimiento?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: executeDelete
          }
        ]
      );
    }
  };

  // Convert saved services back to string format for the form state
  const initialServices = record.services && record.services.length > 0
    ? record.services.map(s => ({ type: s.type, cost: s.cost.toString() }))
    : [{ type: '', cost: '' }];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={Colores.blanco} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Servicio</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <FormularioMantenimiento
        initialData={{
          motorcycle_id: record.motorcycle_id,
          services: initialServices,
          date: record.date,
          km_at_service: record.km_at_service?.toString(),
          workshop: record.workshop || '',
          notes: record.notes || '',
          next_km: record.next_km?.toString() || '',
        }}
        isLoading={isSubmitting}
        onSave={handleSave}
        submitLabel="Actualizar Servicio"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colores.fondoPrincipal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colores.fondoPrincipal,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colores.primario,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
