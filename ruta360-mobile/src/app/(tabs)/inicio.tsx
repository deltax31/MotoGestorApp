import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';
import { useAutenticacionStore } from '@/store/autenticacionStore';
import { useVehiculoStore } from '@/store/vehiculoStore';

import { Encabezado } from '@/components/dashboard/Encabezado';
import { CarruselMotos } from '@/components/dashboard/CarruselMotos';
import { TarjetaEstado } from '@/components/dashboard/TarjetaEstado';
import { TarjetaConsejo } from '@/components/dashboard/TarjetaConsejo';
import { CuadriculaAcciones } from '@/components/dashboard/CuadriculaAcciones';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session, profile } = useAutenticacionStore();
  const { motorcycles, fetchMotorcycles, isLoading, activeMotorcycleId, setActiveMotorcycle } = useVehiculoStore();

  useEffect(() => {
    if (session?.id) {
      fetchMotorcycles(session.id);
    }
  }, [session?.id, fetchMotorcycles]);

  // Si hay motos, tomar la activa. Si no, usar mock vacío para el diseño.
  let activeMoto = motorcycles.find(m => m.id === activeMotorcycleId);
  if (!activeMoto) {
    activeMoto = motorcycles[0] || {
      id: 'empty',
      brand: 'Aún',
      model: 'sin moto',
      year: new Date().getFullYear(),
      plate: '---',
      current_km: 0,
      soat_status: 'unknown',
      tecno_status: 'unknown',
    } as any;
  }

  const formattedMotosForCarousel = motorcycles.length > 0 
    ? motorcycles.map(m => ({
        id: m.id,
        name: `${m.brand} ${m.model}`,
        plate: m.plate,
        km: m.current_km,
        image: m.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_iDY37qkVOGCyzG76NaMGEsijzu23TUXhsGAv0YZ59h8-QhaiQ8k0RSeVnwRw_nk3MHd873_95Y8BuVKQPU2NRW1yFZe3L-sProqcyY3GVV6TrX9ymUm29nO3aMaQYhw68gyUiYQkgGNQNq8HiUuxDcLumd1NquB22zHxUjsqZVJEbdWtBGu2zgfwKw4Gv8IYcIrRKlRiLHYnVF7TryPEaYhmIm2rw89SoHELgzG42OTFNISQk_WIxDiAjW20UU1VvivGk-COqlAR'
      }))
    : [
        {
          id: 'empty-state',
          name: 'No tienes motos',
          plate: 'REGISTRA',
          km: 0,
          image: 'https://via.placeholder.com/600x400/161D2C/00C8D4?text=Tu+Moto+Aquí'
        }
      ];

  const plan = profile?.plan || 'free';
  const canAddMoto = (plan === 'free' && motorcycles.length < 1) || (plan === 'pro' && motorcycles.length < 3);

  const getStatus = (expiryDate?: string) => {
    if (!expiryDate || expiryDate === 'Sin registrar') {
      return { text: 'Sin registrar', status: 'VENCIDO', color: Colores.acento, progress: 0.1 };
    }
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(expiry.getTime())) {
      return { text: expiryDate, status: 'VENCIDO', color: Colores.acento, progress: 0.1 };
    }
    
    if (expiry < today) {
      return { text: expiryDate, status: 'VENCIDO', color: Colores.acento, progress: 0.4 };
    }
    
    const diffTime = Math.abs(expiry.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) {
      return { text: expiryDate, status: 'PREVENTIVO', color: '#eab308', progress: 0.7 }; // Yellow/Amber for warning
    }
    return { text: expiryDate, status: 'AL DÍA', color: Colores.primario, progress: 1 };
  };

  const soatData = getStatus(activeMoto?.soat_expiry);
  const tecnoData = getStatus(activeMoto?.tecno_expiry);

  return (
    <View style={styles.container}>
      <Encabezado />
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingTop: 20,
            paddingBottom: insets.bottom + 20 
          }
        ]}
      >
        <View style={styles.section}>
          <CarruselMotos 
            bikes={formattedMotosForCarousel} 
            activeId={activeMoto?.id !== 'empty' ? activeMoto?.id : null}
            onActiveItemChange={setActiveMotorcycle}
          />
        </View>

        <View style={[styles.section, styles.row]}>
          <View style={styles.col}>
            <TarjetaEstado 
              title="SOAT" 
              date={soatData.text}
              status={soatData.status}
              icon="description"
              color={soatData.color}
              progress={soatData.progress}
            />
          </View>
          <View style={styles.col}>
            <TarjetaEstado 
              title="Tecno" 
              date={tecnoData.text}
              status={tecnoData.status}
              icon="build-circle"
              color={tecnoData.color}
              progress={tecnoData.progress}
            />
          </View>
        </View>

        <View style={styles.section}>
          <TarjetaConsejo />
        </View>

        <View style={styles.section}>
          <CuadriculaAcciones activeMotorcycleId={activeMoto?.id !== 'empty' ? activeMoto?.id : undefined} />
        </View>
      </ScrollView>

      {canAddMoto && motorcycles.length > 0 && (
        <TouchableOpacity 
          style={[styles.fab, { bottom: insets.bottom + 80 }]}
          onPress={() => router.push('/(tabs)/garaje/register')}
        >
          <MaterialIcons name="add" size={24} color={Colores.fondoPrincipal} />
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
  scrollContent: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  col: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colores.primario,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  }
});
