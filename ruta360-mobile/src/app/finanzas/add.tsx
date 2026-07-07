import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';
import { Picker } from '@react-native-picker/picker';
import { useVehiculoStore } from '@/store/vehiculoStore';
import { useFinanzasStore } from '@/store/finanzasStore';
import { ItemGasto } from '@/types/finanzas.types';
import { useAutenticacionStore } from '@/store/autenticacionStore';

const CATEGORY_OPTIONS = [
  { label: '⛽ Combustible', value: 'Combustible' },
  { label: '🛠️ Repuestos', value: 'Repuestos' },
  { label: '🛡️ Seguros', value: 'Seguros' },
  { label: '🛣️ Peajes', value: 'Peajes' },
  { label: '🧼 Lavado', value: 'Lavado' },
  { label: '📦 Otros', value: 'Otros' }
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { motorcycles, activeMotorcycleId } = useVehiculoStore();
  const { addExpense } = useFinanzasStore();

  const [motoId, setMotoId] = useState<string>(activeMotorcycleId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] || '');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ItemGasto[]>([
    { category: 'Combustible', amount: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeMotorcycleId && !motoId) {
      setMotoId(activeMotorcycleId);
    }
  }, [activeMotorcycleId]);

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

    // Validate amounts
    if (items.some(i => i.amount <= 0)) {
      alert('Todos los montos deben ser mayores a cero.');
      return;
    }

    setIsSubmitting(true);
    const user = useAutenticacionStore.getState().session;

    if (!user) {
      alert('Error de autenticación');
      setIsSubmitting(false);
      return;
    }

    const primaryCategory = items.length === 1 ? (items[0]?.category || 'Otros') : 'Múltiple';

    const { error } = await addExpense({
      motorcycle_id: motoId,
      user_id: user.id,
      date,
      description: description || '',
      amount: totalAmount,
      category: primaryCategory
    }, items);

    setIsSubmitting(false);

    if (error) {
      alert(`Error al guardar: ${error}`);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="payments" size={24} color={Colores.acento} />
          <Text style={styles.headerTitle}>REGISTRAR GASTO</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialIcons name="close" size={20} color={Colores.blanco} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        
        {/* AI Scan Placeholder */}
        <TouchableOpacity style={styles.aiScanCard}>
          <View style={styles.aiScanIconBg}>
            <MaterialIcons name="photo-camera" size={32} color={Colores.primario} />
          </View>
          <Text style={styles.aiScanTitle}>Escanear factura con IA</Text>
          <Text style={styles.aiScanSub}>Sube una foto del recibo y la IA llenará los campos automáticamente</Text>
        </TouchableOpacity>

        {/* Moto Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>MOTO *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={motoId}
              onValueChange={setMotoId}
              style={[styles.picker, Platform.OS === 'web' && { backgroundColor: 'transparent', outline: 'none', color: '#000000' }]}
              dropdownIconColor={Colores.primario}
            >
              <Picker.Item label="Selecciona una moto..." value="" color={Platform.OS === 'web' ? '#000000' : 'rgba(255,255,255,0.5)'} />
              {motorcycles.map(moto => (
                <Picker.Item key={moto.id} label={`${moto.brand} ${moto.model} (${moto.plate})`} value={moto.id} color={Platform.OS === 'web' ? '#000000' : Colores.blanco} />
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
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <Picker.Item key={opt.value} label={opt.label} value={opt.value} color={Platform.OS === 'web' ? '#000000' : Colores.blanco} />
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
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
            <MaterialIcons name="calendar-today" size={20} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', right: 16 }} />
          </View>
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
            <Text style={styles.submitBtnText}>Guardar Gasto</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
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
  aiScanCard: {
    borderWidth: 2,
    borderColor: 'rgba(0, 200, 212, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    backgroundColor: 'rgba(0, 200, 212, 0.05)',
    alignItems: 'center',
  },
  aiScanIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 200, 212, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  aiScanTitle: {
    color: Colores.blanco,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  aiScanSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 240,
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
    height: 48,
  },
  picker: {
    color: Colores.blanco,
    height: 48,
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
    height: 48,
  },
  itemAmountWrapper: {
    flex: 4,
    justifyContent: 'center',
  },
  itemAmountInput: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    color: Colores.blanco,
    paddingLeft: 12,
    paddingRight: 36,
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
