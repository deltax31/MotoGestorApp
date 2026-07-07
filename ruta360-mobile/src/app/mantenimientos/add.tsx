import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';
import { useAutenticacionStore } from '@/store/autenticacionStore';
import { useMantenimientoStore } from '@/store/mantenimientoStore';
import FormularioMantenimiento, { FormularioMantenimientoData } from '@/components/mantenimiento/FormularioMantenimiento';

export default function AddMaintenanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { session } = useAutenticacionStore();
  const { addMaintenanceRecord } = useMantenimientoStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (formData: FormularioMantenimientoData, totalCost: number) => {
    if (!session?.id) {
      Alert.alert('Error', 'Faltan datos de sesión.');
      return;
    }

    setIsSubmitting(true);
    
    const record = {
      user_id: session.id,
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

    const { error } = await addMaintenanceRecord(record, validServices);
    
    setIsSubmitting(false);

    if (error) {
      console.error("Error adding maintenance:", error);
      Alert.alert('Error', error.message || 'No se pudo guardar el mantenimiento.');
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={Colores.blanco} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrar Servicio</Text>
        </View>
      </View>

      <FormularioMantenimiento
        isLoading={isSubmitting}
        onSave={handleSave}
        submitLabel="Guardar Servicio"
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colores.primario,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
