import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useVehiculoStore } from '@/store/vehiculoStore';
import { useFinanzasStore } from '@/store/finanzasStore';
import { ItemGasto } from '@/types/finanzas.types';

const CATEGORY_OPTIONS = [
  { label: '⛽ Combustible', value: 'Combustible' },
  { label: '🛠️ Repuestos', value: 'Repuestos' },
  { label: '🛡️ Seguros', value: 'Seguros' },
  { label: '🛣️ Peajes', value: 'Peajes' },
  { label: '🧼 Lavado', value: 'Lavado' },
  { label: '📦 Otros', value: 'Otros' }
];

export default function EditExpenseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  
  const { motorcycles } = useVehiculoStore();
  const { transactions, updateExpense } = useFinanzasStore();

  const [motoId, setMotoId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] || '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDate(formattedDate);
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ItemGasto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const transaction = transactions.find(t => t.id === id);
      if (transaction && transaction.type === 'EXPENSE') {
        const record = transaction.originalRecord;
        setMotoId(record.motorcycle_id);
        setDate(record.date);
        setDescription(record.description || '');
        setItems(transaction.items.length > 0 ? [...transaction.items] : [{ category: 'Otros', amount: record.amount }]);
      } else {
        alert('Registro no encontrado o no es editable desde aquí.');
        router.back();
      }
    }
  }, [id, transactions]);

  const addItem = () => {
    setItems([...items, { category: 'Otros', amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const updateItem = (index: number, field: keyof ItemGasto, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value } as ItemGasto;
    setItems(newItems);
  };

  const totalAmount = items.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleSubmit = async () => {
    if (!motoId) {
      alert('Debes seleccionar una moto');
      return;
    }

    if (items.some(i => i.amount <= 0)) {
      alert('Todos los montos deben ser mayores a cero.');
      return;
    }

    setIsSubmitting(true);

    const primaryCategory = items.length === 1 ? (items[0]?.category || 'Otros') : 'Múltiple';

    const { error } = await updateExpense(id as string, {
      motorcycle_id: motoId,
      date,
      description,
      amount: totalAmount,
      category: primaryCategory
    }, items);

    setIsSubmitting(false);

    if (error) {
      alert(`Error al actualizar: ${error}`);
    } else {
      router.back();
    }
  };

  if (!motoId) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colores.primario} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="edit" size={24} color={Colores.acento} />
          <Text style={styles.headerTitle}>EDITAR GASTO</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialIcons name="close" size={20} color={Colores.blanco} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        
        {/* Moto Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>MOTO *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={motoId}
              onValueChange={setMotoId}
              style={[styles.picker, Platform.OS === 'web' && { backgroundColor: 'transparent', outline: 'none', color: '#000000' }]}
              dropdownIconColor={Colores.primario}
              mode="dropdown"
            >
              <Picker.Item label="Selecciona una moto..." value="" color={Platform.OS === 'android' ? '#000000' : 'rgba(255,255,255,0.5)'} />
              {motorcycles.map(moto => (
                <Picker.Item key={moto.id} label={`${moto.brand} ${moto.model} (${moto.plate})`} value={moto.id} color={Platform.OS === 'android' ? '#000000' : Colores.blanco} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>CATEGORÍAS DE GASTO</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemRowContent}>
                <View style={styles.itemCategoryWrapper}>
                  <Picker
                    selectedValue={item.category}
                    onValueChange={(val) => updateItem(index, 'category', val)}
                    style={[styles.picker, Platform.OS === 'web' && { color: '#000000', backgroundColor: 'transparent', outline: 'none' }]}
                    dropdownIconColor={Colores.primario}
                    mode="dropdown"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <Picker.Item key={opt.value} label={opt.label} value={opt.value} color={Platform.OS === 'android' ? '#000000' : Colores.blanco} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.itemAmountWrapper}>
                  <TextInput
                    style={styles.itemAmountInput}
                    placeholder="Monto"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="numeric"
                    value={item.amount ? item.amount.toString() : ''}
                    onChangeText={(val) => updateItem(index, 'amount', parseFloat(val) || 0)}
                  />
                  <Text style={styles.currencyBadge}>COP</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.deleteBtn, items.length === 1 && { opacity: 0.5 }]} 
                onPress={() => removeItem(index)}
                disabled={items.length === 1}
              >
                <MaterialIcons name="delete" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
            <MaterialIcons name="add-circle" size={20} color={Colores.primario} />
            <Text style={styles.addItemBtnText}>Agregar otra categoría</Text>
          </TouchableOpacity>
        </View>

        {/* Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>FECHA *</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
            <View style={styles.inputWrapper} pointerEvents="none">
              <TextInput
                style={styles.input}
                value={date}
                editable={false}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
              <MaterialIcons name="calendar-today" size={20} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', right: 16 }} />
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date ? new Date(date + 'T12:00:00Z') : new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Total Cost Highlight */}
        <View style={styles.totalCard}>
          <View>
            <Text style={styles.totalCardLabel}>COSTO TOTAL</Text>
            <Text style={styles.totalCardValue}>$ {totalAmount.toLocaleString()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.totalCardLabel, { color: 'rgba(255,255,255,0.4)' }]}>MONEDA</Text>
            <Text style={styles.totalCardCurrency}>COP</Text>
          </View>
        </View>

        {/* Description / Notes */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Establecimiento / Notas</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top', padding: 16 }]}
            placeholder="Ej: Tanque lleno Terpel con gasolina extra..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colores.fondoPrincipal} />
          ) : (
            <Text style={styles.submitBtnText}>Actualizar Gasto</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colores.primario,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    gap: 24,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  pickerWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    height: 55,
  },
  picker: {
    color: Colores.blanco,
    height: 55,
    width: '100%',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  itemRowContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  itemCategoryWrapper: {
    flex: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    height: 55,
  },
  itemAmountWrapper: {
    flex: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
  },
  itemAmountInput: {
    flex: 1,
    height: 55,
    color: Colores.blanco,
    paddingLeft: 12,
    paddingRight: 32,
    fontSize: 14,
  },
  currencyBadge: {
    position: 'absolute',
    right: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.3)',
  },
  deleteBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 8,
  },
  addItemBtnText: {
    color: Colores.primario,
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    color: Colores.blanco,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  totalCard: {
    backgroundColor: 'rgba(0, 200, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.2)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalCardLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colores.primario,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalCardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colores.blanco,
    marginTop: 4,
  },
  totalCardCurrency: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: Colores.acento,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: Colores.acento,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: Colores.fondoPrincipal,
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
