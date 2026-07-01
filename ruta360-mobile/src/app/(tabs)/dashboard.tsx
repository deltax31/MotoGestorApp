import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colores } from '@/constants/colores';
import { useAuthStore } from '@/store/authStore';
import { useGarageStore } from '@/store/garageStore';

import { DashboardHeader } from '@/components/DashboardHeader';
import { BikeCarousel } from '@/components/BikeCarousel';
import { StatusCard } from '@/components/StatusCard';
import { TipCard } from '@/components/TipCard';
import { ActionGrid } from '@/components/ActionGrid';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const { motorcycles, fetchMotorcycles, isLoading, activeMotorcycleId, setActiveMotorcycle } = useGarageStore();

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
    };
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

  return (
    <View style={styles.container}>
      <DashboardHeader />
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingTop: insets.top + 70, // Espacio para el header absolute
            paddingBottom: insets.bottom + 100 
          }
        ]}
      >
        <View style={styles.section}>
          <BikeCarousel 
            bikes={formattedMotosForCarousel} 
            activeId={activeMoto.id !== 'empty' ? activeMoto.id : null}
            onActiveItemChange={setActiveMotorcycle}
          />
        </View>

        <View style={[styles.section, styles.row]}>
          <View style={styles.col}>
            <StatusCard 
              title="SOAT" 
              date={activeMoto.soat_expiry || 'Sin registrar'}
              status={activeMoto.soat_status === 'ok' ? 'AL DÍA' : activeMoto.soat_status === 'warning' ? 'PREVENTIVO' : 'VENCIDO'}
              icon="description"
              color={activeMoto.soat_status === 'ok' ? Colores.primario : Colores.acento}
              progress={activeMoto.soat_status === 'ok' ? 1 : 0.4}
            />
          </View>
          <View style={styles.col}>
            <StatusCard 
              title="Tecno" 
              date={activeMoto.tecno_expiry || 'Sin registrar'}
              status={activeMoto.tecno_status === 'ok' ? 'AL DÍA' : activeMoto.tecno_status === 'warning' ? 'PREVENTIVO' : 'VENCIDO'}
              icon="build-circle"
              color={activeMoto.tecno_status === 'ok' ? Colores.primario : Colores.acento}
              progress={activeMoto.tecno_status === 'ok' ? 1 : 0.4}
            />
          </View>
        </View>

        <View style={styles.section}>
          <TipCard />
        </View>

        <View style={styles.section}>
          <ActionGrid activeMotorcycleId={activeMoto.id !== 'empty' ? activeMoto.id : undefined} />
        </View>
      </ScrollView>
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
  }
});
