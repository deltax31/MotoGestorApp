import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, RefreshControl, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';
import { useFinanceStore, UnifiedTransaction } from '@/store/financeStore';
import { useGarageStore } from '@/store/garageStore';
import { Picker } from '@react-native-picker/picker';

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('combustible')) return 'local-gas-station';
  if (cat.includes('mantenimiento')) return 'build';
  if (cat.includes('seguro')) return 'verified-user';
  if (cat.includes('repuesto')) return 'settings-suggest';
  if (cat.includes('peaje')) return 'toll';
  if (cat.includes('lavado')) return 'local-car-wash';
  return 'receipt-long';
};

const getCategoryColor = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('combustible')) return Colores.acento;
  if (cat.includes('mantenimiento')) return Colores.primario;
  if (cat.includes('seguro')) return '#22C55E'; // green-500
  if (cat.includes('repuesto')) return '#60A5FA'; // blue-400
  if (cat.includes('peaje')) return 'rgba(255,255,255,0.4)';
  return 'rgba(255,255,255,0.8)';
};

export default function FinancesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { motorcycles } = useGarageStore();
  const { transactions, isLoading, error, fetchTransactions, deleteExpense } = useFinanceStore();

  const [filterMotoId, setFilterMotoId] = useState<string>('ALL');

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions(filterMotoId === 'ALL' ? null : filterMotoId);
    }, [filterMotoId])
  );

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de eliminar este gasto?')) {
        deleteExpense(id).then(() => fetchTransactions(filterMotoId === 'ALL' ? null : filterMotoId));
      }
    } else {
      Alert.alert(
        'Eliminar Gasto',
        '¿Estás seguro de eliminar este gasto?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => {
              deleteExpense(id).then(() => fetchTransactions(filterMotoId === 'ALL' ? null : filterMotoId));
            }
          }
        ]
      );
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/finances/edit?id=${id}`);
  };

  // Calculations
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let monthTotal = 0;
    const categories: Record<string, number> = {
      'Combustible': 0,
      'Mantenimiento': 0,
      'Seguros': 0,
      'Repuestos': 0,
      'Otros': 0
    };

    let totalAllTime = 0;
    const byMoto: Record<string, number> = {};

    transactions.forEach(t => {
      totalAllTime += t.totalAmount;
      byMoto[t.motorcycle_id] = (byMoto[t.motorcycle_id] || 0) + t.totalAmount;

      const [y, m] = t.date.split('-');
      if (parseInt(y) === currentYear && parseInt(m) === currentMonth) {
        monthTotal += t.totalAmount;
        
        // Sum by category for the month
        if (t.type === 'MAINTENANCE') {
          categories['Mantenimiento'] += t.totalAmount;
        } else {
          t.items.forEach(item => {
            const cat = item.category;
            if (cat.includes('Combustible')) categories['Combustible'] += item.amount;
            else if (cat.includes('Seguro')) categories['Seguros'] += item.amount;
            else if (cat.includes('Repuesto')) categories['Repuestos'] += item.amount;
            else categories['Otros'] += item.amount;
          });
        }
      }
    });

    return { monthTotal, categories, totalAllTime, byMoto };
  }, [transactions]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>FINANZAS</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="notifications" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchTransactions(filterMotoId === 'ALL' ? null : filterMotoId)} tintColor={Colores.primario} />}
      >
        {/* Main Spending Display */}
        <View style={styles.glassCard}>
          <Text style={styles.glassCardLabel}>Gasto del Mes</Text>
          <Text style={styles.monthTotalText}>${stats.monthTotal.toLocaleString()}</Text>
          <View style={styles.chartBars}>
            <View style={[styles.chartBar, { height: '30%', backgroundColor: 'rgba(0, 200, 212, 0.2)' }]} />
            <View style={[styles.chartBar, { height: '55%', backgroundColor: 'rgba(0, 200, 212, 0.4)' }]} />
            <View style={[styles.chartBar, { height: '40%', backgroundColor: 'rgba(0, 200, 212, 0.2)' }]} />
            <View style={[styles.chartBar, { height: '70%', backgroundColor: 'rgba(0, 200, 212, 0.6)' }]} />
            <View style={[styles.chartBar, { height: '95%', backgroundColor: 'rgba(0, 200, 212, 1)' }]} />
            <View style={[styles.chartBar, { height: '20%', backgroundColor: 'rgba(0, 200, 212, 0.3)' }]} />
            <View style={[styles.chartBar, { height: '60%', backgroundColor: 'rgba(0, 200, 212, 0.5)' }]} />
          </View>
        </View>

        {/* Top Summary Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          <View style={styles.summaryCard}>
            <MaterialIcons name="local-gas-station" size={24} color={Colores.acento} style={{ marginBottom: 8 }} />
            <Text style={styles.summaryCardAmount}>${stats.categories['Combustible'].toLocaleString()}</Text>
            <Text style={styles.summaryCardLabel}>Combustible</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="build" size={24} color={Colores.primario} style={{ marginBottom: 8 }} />
            <Text style={styles.summaryCardAmount}>${stats.categories['Mantenimiento'].toLocaleString()}</Text>
            <Text style={styles.summaryCardLabel}>Mantenimiento</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="verified-user" size={24} color="#22C55E" style={{ marginBottom: 8 }} />
            <Text style={styles.summaryCardAmount}>${stats.categories['Seguros'].toLocaleString()}</Text>
            <Text style={styles.summaryCardLabel}>Seguro</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="settings-suggest" size={24} color="#60A5FA" style={{ marginBottom: 8 }} />
            <Text style={styles.summaryCardAmount}>${stats.categories['Repuestos'].toLocaleString()}</Text>
            <Text style={styles.summaryCardLabel}>Repuestos</Text>
          </View>
        </ScrollView>

        {/* Gastos por moto */}
        {motorcycles.length > 0 && (
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="motorcycle" size={16} color={Colores.blanco} />
              <Text style={styles.cardTitle}>Gastos por moto (Histórico)</Text>
            </View>
            <View style={styles.barsContainer}>
              {motorcycles.map((moto, index) => {
                const total = stats.byMoto[moto.id] || 0;
                const max = Math.max(...Object.values(stats.byMoto), 1);
                const percent = (total / max) * 100;
                const barColor = index === 0 ? Colores.acento : Colores.primario;
                return (
                  <View key={moto.id} style={{ marginBottom: 16 }}>
                    <View style={styles.motoBarHeader}>
                      <Text style={styles.motoBarName}>{moto.brand} {moto.model} • {moto.plate}</Text>
                      <Text style={[styles.motoBarAmount, { color: total > 0 ? barColor : 'rgba(255,255,255,0.4)' }]}>
                        ${total.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.motoBarTrack}>
                      <View style={[styles.motoBarFill, { width: `${percent}%`, backgroundColor: barColor }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Filter and Transactions */}
        <View style={styles.filterSection}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filterMotoId}
              onValueChange={(val) => setFilterMotoId(val)}
              style={[styles.picker, Platform.OS === 'web' && { backgroundColor: 'transparent', outline: 'none' }]}
              dropdownIconColor={Colores.primario}
            >
              <Picker.Item label="Todas las motos" value="ALL" color={Platform.OS === 'web' ? '#000000' : Colores.blanco} />
              {motorcycles.map(moto => (
                <Picker.Item key={moto.id} label={`${moto.brand} ${moto.model}`} value={moto.id} color={Platform.OS === 'web' ? '#000000' : Colores.blanco} />
              ))}
            </Picker>
          </View>
          
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Transacciones Recientes</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/finances/add')}>
              <MaterialIcons name="add" size={14} color={Colores.fondoPrincipal} style={{ fontWeight: 'bold' }} />
              <Text style={styles.addBtnText}>Registrar gasto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction List */}
        <View style={styles.transactionList}>
          {transactions.map(t => {
            const isMaint = t.type === 'MAINTENANCE';
            const icon = isMaint ? 'build' : getCategoryIcon(t.items[0]?.category || '');
            const color = isMaint ? Colores.primario : getCategoryColor(t.items[0]?.category || '');

            return (
              <View key={t.id} style={[styles.transactionCard, { borderLeftColor: color }]}>
                <View style={styles.transactionTop}>
                  <View style={styles.transactionLeft}>
                    <View style={[styles.transactionIconBg, { backgroundColor: `${color}1A` }]}>
                      <MaterialIcons name={icon as any} size={20} color={color} />
                    </View>
                    <View>
                      <Text style={styles.transactionItemTitle}>{t.title}</Text>
                      <Text style={styles.transactionItemSub}>{t.date} • {t.description}</Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>${t.totalAmount.toLocaleString()}</Text>
                    {!isMaint && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => handleEdit(t.id)} style={styles.actionBtn}>
                          <MaterialIcons name="edit" size={16} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(t.id)} style={styles.actionBtn}>
                          <MaterialIcons name="delete" size={16} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                      </View>
                    )}
                    {isMaint && (
                      <Text style={[styles.transactionItemSub, { fontStyle: 'italic', marginTop: 4, textAlign: 'right' }]}>Mantenimiento</Text>
                    )}
                  </View>
                </View>
                
                {t.items.length > 0 && (
                  <View style={styles.transactionItemsList}>
                    {t.items.map((item, idx) => (
                      <View key={idx} style={styles.transactionSubItem}>
                        <View style={styles.transactionSubItemLeft}>
                          <MaterialIcons name={getCategoryIcon(item.category) as any} size={12} color={getCategoryColor(item.category)} />
                          <Text style={styles.transactionSubItemLabel}>{item.category}</Text>
                        </View>
                        <Text style={styles.transactionSubItemAmount}>${item.amount.toLocaleString()}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {transactions.length === 0 && !isLoading && (
            <Text style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginTop: 32 }}>No hay transacciones registradas.</Text>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        activeOpacity={0.8}
        onPress={() => router.push('/finances/add')}
      >
        <MaterialIcons name="add" size={32} color={Colores.fondoPrincipal} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colores.fondoAsfalto,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colores.fondoAsfalto,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colores.primario,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    marginBottom: 16,
  },
  glassCardLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  monthTotalText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colores.blanco,
    marginBottom: 16,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 64,
    gap: 6,
  },
  chartBar: {
    flex: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  horizontalScroll: {
    paddingBottom: 16,
    gap: 12,
  },
  summaryCard: {
    width: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    marginRight: 12,
  },
  summaryCardAmount: {
    color: Colores.primario,
    fontWeight: 'bold',
    fontSize: 18,
  },
  summaryCardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colores.blanco,
  },
  barsContainer: {
    marginTop: 8,
  },
  motoBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  motoBarName: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  motoBarAmount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  motoBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  motoBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  filterSection: {
    marginTop: 16,
    gap: 16,
  },
  pickerWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  picker: {
    color: Colores.blanco,
    height: 40,
    width: '100%',
    fontSize: 14,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colores.blanco,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addBtn: {
    backgroundColor: Colores.acento,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colores.fondoPrincipal,
    textTransform: 'uppercase',
  },
  transactionList: {
    marginTop: 12,
    gap: 12,
  },
  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderLeftWidth: 2,
    padding: 16,
    gap: 12,
  },
  transactionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colores.blanco,
  },
  transactionItemSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colores.primario,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    padding: 4,
  },
  transactionItemsList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8,
    gap: 8,
  },
  transactionSubItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionSubItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionSubItemLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  transactionSubItemAmount: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colores.primario,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
