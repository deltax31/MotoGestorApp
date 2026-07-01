import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Colores } from '@/constants/colores';
import { useGarageStore } from '@/store/garageStore';

export interface MaintenanceServiceInput {
  id?: string;
  type: string;
  cost: string;
}

export interface MaintenanceFormData {
  motorcycle_id: string;
  services: MaintenanceServiceInput[];
  date: string;
  km_at_service: string;
  workshop: string;
  notes: string;
  next_km: string;
}

interface MaintenanceFormProps {
  initialData?: Partial<MaintenanceFormData>;
  isLoading: boolean;
  onSave: (data: MaintenanceFormData, totalCost: number) => void;
  submitLabel: string;
}

const SERVICE_TYPES = [
  'Cambio de Aceite',
  'Ajuste de Frenos',
  'Limpieza de Cadena',
  'Sincronización',
  'Mantenimiento General',
  'Cambio de Llantas',
  'Otro'
];

export default function MaintenanceForm({ initialData, isLoading, onSave, submitLabel }: MaintenanceFormProps) {
  const { motorcycles, activeMotorcycleId } = useGarageStore();
  
  const [formData, setFormData] = useState<MaintenanceFormData>({
    motorcycle_id: initialData?.motorcycle_id || activeMotorcycleId || '',
    services: initialData?.services && initialData.services.length > 0 
      ? initialData.services.map(s => ({ ...s, _key: Math.random().toString(36).substr(2, 9) }))
      : [{ type: '', cost: '', _key: Math.random().toString(36).substr(2, 9) }],
    date: initialData?.date || new Date().toISOString().split('T')[0],
    km_at_service: initialData?.km_at_service?.toString() || '',
    workshop: initialData?.workshop || '',
    notes: initialData?.notes || '',
    next_km: initialData?.next_km?.toString() || '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  const totalCost = formData.services.reduce((sum, service) => sum + (parseFloat(service.cost) || 0), 0);

  const handleChange = (field: keyof MaintenanceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const handleServiceChange = (index: number, field: keyof MaintenanceServiceInput, value: string) => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData(prev => ({ ...prev, services: newServices }));
    setErrorMsg('');
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { type: '', cost: '', _key: Math.random().toString(36).substr(2, 9) }]
    }));
  };

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      const newServices = [...formData.services];
      newServices.splice(index, 1);
      setFormData(prev => ({ ...prev, services: newServices }));
    }
  };

  const handleSave = () => {
    if (!formData.motorcycle_id) {
      setErrorMsg('Debes seleccionar una moto.');
      return;
    }
    if (!formData.date || !formData.km_at_service) {
      setErrorMsg('Por favor completa la fecha y kilometraje (*)');
      return;
    }
    const hasInvalidService = formData.services.some(s => !s.type.trim());
    if (hasInvalidService) {
      setErrorMsg('Por favor selecciona un tipo para todos los servicios.');
      return;
    }
    onSave(formData, totalCost);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.col2}>
          <Text style={styles.label}>Moto *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.motorcycle_id}
              onValueChange={(val) => handleChange('motorcycle_id', val)}
              style={[styles.picker, Platform.OS === 'web' && { backgroundColor: 'transparent', outline: 'none' }]}
              dropdownIconColor={Colores.blanco}
            >
              <Picker.Item label="Selecciona una moto..." value="" color={Platform.OS === 'web' ? '#000000' : "rgba(255,255,255,0.5)"} />
              {motorcycles.map(moto => (
                <Picker.Item key={moto.id} label={`${moto.brand} ${moto.model} (${moto.plate})`} value={moto.id} color={Platform.OS === 'web' ? '#000000' : Colores.blanco} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Servicios Realizados *</Text>
        </View>

        {formData.services.map((service, index) => (
          <View key={(service as any)._key || index} style={styles.serviceRow}>
            <View style={styles.serviceTypeCol}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={service.type}
                  onValueChange={(val) => handleServiceChange(index, 'type', val)}
                  style={[styles.picker, Platform.OS === 'web' && { backgroundColor: 'transparent', outline: 'none' }]}
                  dropdownIconColor={Colores.blanco}
                >
                  <Picker.Item label="Tipo..." value="" color={Platform.OS === 'web' ? '#000000' : "rgba(255,255,255,0.5)"} />
                  {SERVICE_TYPES.map(type => (
                    <Picker.Item key={type} label={type} value={type} color={Platform.OS === 'web' ? '#000000' : Colores.blanco} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.serviceCostCol}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={[styles.input, { paddingLeft: 24 }]}
                  placeholder="Costo"
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255, 255, 255, 0.2)"
                  value={service.cost}
                  onChangeText={(t) => handleServiceChange(index, 'cost', t)}
                />
              </View>
            </View>
            <View style={styles.serviceActionCol}>
              <TouchableOpacity onPress={() => removeService(index)} disabled={formData.services.length === 1}>
                <MaterialIcons name="delete" size={24} color={formData.services.length === 1 ? "rgba(255,255,255,0.1)" : "#ef4444"} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addServiceBtn} onPress={addService}>
          <MaterialIcons name="add-circle" size={20} color={Colores.primario} />
          <Text style={styles.addServiceText}>AGREGAR OTRO SERVICIO</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.grid}>
          <View style={styles.col1}>
            <Text style={styles.label}>Fecha *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              value={formData.date}
              onChangeText={(t) => handleChange('date', t)}
            />
          </View>
          
          <View style={styles.col1}>
            <Text style={styles.label}>Km al servicio *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 15000"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              value={formData.km_at_service}
              onChangeText={(t) => handleChange('km_at_service', t)}
            />
          </View>

          <View style={styles.col1}>
            <Text style={styles.label}>Próximo servicio (km)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: 'rgba(255, 255, 255, 0.02)' }]}
              placeholder="Ej. 20000"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              value={formData.next_km}
              onChangeText={(t) => handleChange('next_km', t)}
            />
          </View>

          <View style={styles.col1}>
            <Text style={styles.label}>Costo Total (COP)</Text>
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputPrefix, { color: Colores.primario }]}>$</Text>
              <TextInput
                style={[styles.input, styles.totalCostInput]}
                value={totalCost.toString()}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.col2}>
            <Text style={styles.label}>Taller / Mecánico</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del taller"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              value={formData.workshop}
              onChangeText={(t) => handleChange('workshop', t)}
            />
          </View>

          <View style={styles.col2}>
            <Text style={styles.label}>Notas</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Observaciones generales..."
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              multiline
              numberOfLines={3}
              value={formData.notes}
              onChangeText={(t) => handleChange('notes', t)}
            />
          </View>
        </View>
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={Colores.fondoPrincipal} />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color={Colores.fondoPrincipal} />
              <Text style={styles.submitButtonText}>{submitLabel}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 100,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    height: 48,
    justifyContent: 'center',
  },
  picker: {
    color: Colores.blanco,
    height: 48,
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputPrefix: {
    position: 'absolute',
    left: 12,
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 12,
    zIndex: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    color: Colores.blanco,
    fontSize: 14,
  },
  totalCostInput: {
    backgroundColor: 'rgba(0, 200, 212, 0.05)',
    borderColor: 'rgba(0, 200, 212, 0.2)',
    color: Colores.blanco,
    fontWeight: 'bold',
    paddingLeft: 24,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  serviceTypeCol: {
    flex: 7,
  },
  serviceCostCol: {
    flex: 4,
  },
  serviceActionCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  addServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  addServiceText: {
    color: Colores.primario,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  col1: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  col2: {
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  formActions: {
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: Colores.acento,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colores.acento,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: Colores.fondoPrincipal,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
