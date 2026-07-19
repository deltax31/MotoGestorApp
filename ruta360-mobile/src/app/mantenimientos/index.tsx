import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';
import { useMantenimientoStore } from '@/store/mantenimientoStore';
import { useVehiculoStore } from '@/store/vehiculoStore';
import TarjetaMantenimiento from '@/components/mantenimiento/TarjetaMantenimiento';
import { Picker } from '@react-native-picker/picker';

type Tab = 'historial' | 'proximos';

export default function MaintenanceListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { activeMotorcycleId, setActiveMotorcycle, motorcycles } = useVehiculoStore();
  const { records, isLoading, fetchMaintenanceRecords } = useMantenimientoStore();

  const [activeTab, setActiveTab] = useState<Tab>('historial');
  const [newKm, setNewKm] = useState('');

  useEffect(() => {
    if (activeMotorcycleId) {
      fetchMaintenanceRecords(activeMotorcycleId);
    }
  }, [activeMotorcycleId]);

  const activeMoto = motorcycles.find(m => m.id === activeMotorcycleId);

  // Calculate monthly summary
  const monthlySummary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    let totalCost = 0;
    let serviceCount = 0;

    records.forEach(record => {
      if (!record.date) return;
      const parts = record.date.split('-');
      if (parts.length >= 2) {
        const recordYear = parseInt(parts[0] as string, 10);
        const recordMonth = parseInt(parts[1] as string, 10);
        
        if (recordYear === currentYear && recordMonth === currentMonth) {
          totalCost += record.cost || 0;
          serviceCount += 1;
        }
      }
    });

    return { totalCost, serviceCount };
  }, [records]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colores.blanco} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mantenimientos</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        <View style={styles.content}>
          
          {/* Active Motorcycle Picker */}
          <View style={styles.pickerWrapper}>
            <View style={styles.pickerInfo}>
              <View style={styles.motoIconBg}>
                <MaterialIcons name="motorcycle" size={20} color={Colores.primario} />
              </View>
              <View style={styles.pickerTextContainer}>
                <Text style={styles.pickerLabel}>VEHÍCULO ACTIVO</Text>
                <View style={styles.pickerInner}>
                  <Picker
                    selectedValue={activeMotorcycleId}
                    onValueChange={(val) => {
                      if (val) setActiveMotorcycle(val);
                    }}
                    style={[styles.picker, Platform.OS === 'web' && { backgroundColor: 'transparent', outline: 'none' }]}
                    dropdownIconColor={Colores.primario}
                    mode="dropdown"
                  >
                    <Picker.Item label="Selecciona una moto..." value="" color={Platform.OS === 'android' ? '#000000' : "rgba(255,255,255,0.5)"} />
                    {motorcycles.map(moto => (
                      <Picker.Item key={moto.id} label={`${moto.brand} ${moto.model} (${moto.plate})`} value={moto.id} color={Platform.OS === 'android' ? '#000000' : Colores.blanco} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.recordCountText}>{records.length} registros</Text>

          {/* Smart Reminder Placeholder */}
          <View style={styles.smartReminderContainer}>
            <View style={styles.smartReminderHeader}>
              <MaterialIcons name="warning" size={16} color={Colores.acento} />
              <Text style={styles.smartReminderTitle}>RECORDATORIOS INTELIGENTES</Text>
            </View>
            <View style={styles.smartReminderCard}>
              <View style={styles.smartReminderCardTop}>
                <Text style={styles.smartReminderItemName}>Filtro de aire</Text>
                <Text style={styles.smartReminderItemMoto}>{activeMoto?.model || 'Moto'}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '85%' }]} />
              </View>
              <Text style={styles.smartReminderDistance}>FALTAN 1000 KM</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'historial' && styles.tabButtonActive]}
              onPress={() => setActiveTab('historial')}
            >
              <Text style={[styles.tabText, activeTab === 'historial' && styles.tabTextActive]}>Historial</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'proximos' && styles.tabButtonActive]}
              onPress={() => setActiveTab('proximos')}
            >
              <Text style={[styles.tabText, activeTab === 'proximos' && styles.tabTextActive]}>Próximos</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'historial' ? (
            <View style={styles.tabContent}>
              {/* Update KM Widget */}
              <View style={styles.updateKmCard}>
                <View style={styles.updateKmHeader}>
                  <MaterialIcons name="speed" size={20} color={Colores.primario} />
                  <Text style={styles.updateKmTitle}>Actualizar kilometraje</Text>
                </View>
                <View style={styles.updateKmInputContainer}>
                  <View style={styles.plateBadge}>
                    <Text style={styles.plateText}>{activeMoto?.plate || '---'}</Text>
                  </View>
                  <TextInput 
                    style={styles.kmInput}
                    placeholder="12200"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="numeric"
                    value={newKm}
                    onChangeText={setNewKm}
                  />
                  <TouchableOpacity style={styles.checkButton}>
                    <MaterialIcons name="check" size={24} color={Colores.fondoPrincipal} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Service List */}
              <View style={styles.recentServicesHeader}>
                <Text style={styles.recentServicesTitle}>SERVICIOS RECIENTES</Text>
                <Text style={styles.currentYearText}>{new Date().getFullYear()}</Text>
              </View>

              {!activeMotorcycleId ? (
                <View style={styles.centerContainer}>
                  <MaterialIcons name="two-wheeler" size={48} color="rgba(255,255,255,0.2)" />
                  <Text style={styles.emptyText}>Selecciona una moto.</Text>
                </View>
              ) : isLoading ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color={Colores.primario} />
                </View>
              ) : records.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="build" size={48} color="rgba(255,255,255,0.2)" />
                  <Text style={styles.emptyText}>No hay mantenimientos registrados.</Text>
                </View>
              ) : (
                records.map(record => (
                  <TarjetaMantenimiento key={record.id} record={record} />
                ))
              )}

              {/* Monthly Summary */}
              <View style={styles.monthlySummaryCard}>
                <View style={styles.monthlySummaryHeader}>
                  <MaterialIcons name="analytics" size={24} color={Colores.primario} />
                  <Text style={styles.monthlySummaryTitle}>Resumen Mensual</Text>
                </View>
                <View style={styles.monthlySummaryStats}>
                  <View style={styles.monthlySummaryStatBlock}>
                    <Text style={styles.monthlySummaryStatLabel}>Total Gastado</Text>
                    <Text style={styles.monthlySummaryStatValue}>${monthlySummary.totalCost.toLocaleString()}</Text>
                  </View>
                  <View style={styles.monthlySummaryStatBlock}>
                    <Text style={styles.monthlySummaryStatLabel}>Servicios</Text>
                    <Text style={styles.monthlySummaryStatValue}>{monthlySummary.serviceCount < 10 ? `0${monthlySummary.serviceCount}` : monthlySummary.serviceCount}</Text>
                  </View>
                </View>
              </View>

            </View>
          ) : (
            /* Próximos Tab */
            <View style={styles.tabContent}>
              <View style={styles.emptyNextCard}>
                <View style={styles.emptyNextIcon}>
                  <MaterialIcons name="calendar-today" size={32} color="rgba(255,255,255,0.2)" />
                </View>
                <Text style={styles.emptyNextTitle}>No hay servicios programados</Text>
                <Text style={styles.emptyNextDesc}>Mantén tu moto en óptimas condiciones programando una revisión.</Text>
                <TouchableOpacity style={styles.scheduleButton}>
                  <Text style={styles.scheduleButtonText}>Programar Ahora</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* FAB */}
      {activeMotorcycleId && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
          activeOpacity={0.8}
          onPress={() => router.push('/mantenimientos/add')}
        >
          <MaterialIcons name="add" size={32} color={Colores.fondoPrincipal} />
        </TouchableOpacity>
      )}
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
  backButton: {
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
  content: {
    padding: 16,
  },
  pickerWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.3)',
    borderRadius: 12,
    marginBottom: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pickerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  motoIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 200, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pickerTextContainer: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  pickerInner: {
    height: 55,
    justifyContent: 'center',
    marginLeft: -8, // compensate for picker default padding
  },
  picker: {
    color: Colores.blanco,
    height: 55,
    width: '100%',
    fontWeight: 'bold',
  },
  recordCountText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    textAlign: 'right',
    marginBottom: 24,
  },
  smartReminderContainer: {
    marginBottom: 32,
  },
  smartReminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  smartReminderTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  smartReminderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderLeftWidth: 4,
    borderLeftColor: Colores.acento,
    borderRadius: 16,
    padding: 16,
  },
  smartReminderCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  smartReminderItemName: {
    color: Colores.blanco,
    fontWeight: 'bold',
    fontSize: 14,
  },
  smartReminderItemMoto: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colores.acento,
  },
  smartReminderDistance: {
    fontSize: 11,
    color: Colores.acento,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(0, 200, 212, 0.1)',
    borderColor: 'rgba(0, 200, 212, 0.2)',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
  },
  tabTextActive: {
    color: Colores.primario,
  },
  tabContent: {
    flex: 1,
  },
  updateKmCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  updateKmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  updateKmTitle: {
    color: Colores.blanco,
    fontWeight: 'bold',
    fontSize: 14,
  },
  updateKmInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  plateBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plateText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 'bold',
    fontSize: 12,
  },
  kmInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Colores.blanco,
    fontSize: 14,
  },
  checkButton: {
    width: 40,
    height: 40,
    backgroundColor: Colores.acento,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentServicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  recentServicesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentYearText: {
    fontSize: 12,
    color: Colores.primario,
    fontWeight: '500',
  },
  monthlySummaryCard: {
    marginTop: 24,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 200, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.2)',
  },
  monthlySummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  monthlySummaryTitle: {
    color: Colores.blanco,
    fontWeight: 'bold',
    fontSize: 16,
  },
  monthlySummaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthlySummaryStatBlock: {
    flex: 1,
  },
  monthlySummaryStatLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginBottom: 4,
  },
  monthlySummaryStatValue: {
    color: Colores.blanco,
    fontSize: 24,
    fontWeight: '900',
  },
  emptyNextCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyNextIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyNextTitle: {
    color: Colores.blanco,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  emptyNextDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  scheduleButton: {
    backgroundColor: Colores.primario,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  scheduleButtonText: {
    color: Colores.fondoPrincipal,
    fontWeight: 'bold',
    fontSize: 14,
  },
  centerContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#00C8D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
