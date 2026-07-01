import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colores } from '@/constants/colores';
import { useAuthStore } from '@/store/authStore';
import { useGarageStore, Motorcycle } from '@/store/garageStore';

export default function GarageListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const { motorcycles, isLoading, fetchMotorcycles } = useGarageStore();

  const loadData = useCallback(() => {
    if (session?.id) {
      fetchMotorcycles(session.id);
    }
  }, [session?.id, fetchMotorcycles]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    loadData();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <MaterialIcons name="add-circle" size={32} color="rgba(255, 255, 255, 0.2)" />
      </View>
      <Text style={styles.emptyText}>¿Tienes otra compañera de ruta?</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyzHngsfYt9J5Ao_oVJa4eLHmqTm2EfmwiBByxZ09CoffC8ObO5vvWv5xq-gSaylkvyzszmcnHrlzcOk9ytA9cKHESVG9RRYtqP4fkRcqROZvkGyaIOKwySuR4LTExED__SVLx4TCBeYCAV8H96kNHJMO8JxPN2Vh4ERMN-uCpuIedGHwccH29LJD-pXLBUfq9olFZI0ATDRe5pNKcVVFVK1Fr2vuRTorlrKRL8_RhI0JAc0-s09lxyoB02J2inawYUa48VQFbnyub' }}
              style={styles.avatarImage}
            />
          </View>
          <Text style={styles.headerTitle}>Ruta 360</Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="settings" size={24} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={onRefresh} 
            tintColor={Colores.primario} 
          />
        }
      >
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Mi Garaje</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.pageSubtitle}>Gestiona tus máquinas y preparativos de ruta.</Text>
        </View>

        <View style={styles.listContainer}>
          {motorcycles.length === 0 && !isLoading ? (
            renderEmptyState()
          ) : (
            motorcycles.map((moto, index) => (
              <View key={moto.id} style={[styles.bikeCard, index > 0 && styles.bikeCardInactive]}>
                <View style={styles.bikeImageContainer}>
                  <Image 
                    source={{ uri: moto.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_iDY37qkVOGCyzG76NaMGEsijzu23TUXhsGAv0YZ59h8-QhaiQ8k0RSeVnwRw_nk3MHd873_95Y8BuVKQPU2NRW1yFZe3L-sProqcyY3GVV6TrX9ymUm29nO3aMaQYhw68gyUiYQkgGNQNq8HiUuxDcLumd1NquB22zHxUjsqZVJEbdWtBGu2zgfwKw4Gv8IYcIrRKlRiLHYnVF7TryPEaYhmIm2rw89SoHELgzG42OTFNISQk_WIxDiAjW20UU1VvivGk-COqlAR' }}
                    style={styles.bikeImage}
                  />
                  {index === 0 && (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>Activa</Text>
                    </View>
                  )}
                </View>
                <View style={styles.bikeInfo}>
                  <View style={styles.bikeInfoRow}>
                    <View>
                      <Text style={styles.bikeName}>{moto.brand} {moto.model}</Text>
                      <Text style={styles.bikeMeta}>Año: {moto.year} • Placa: {moto.plate}</Text>
                    </View>
                    <MaterialIcons 
                      name="motorcycle" 
                      size={24} 
                      color={index === 0 ? Colores.primario : "rgba(255, 255, 255, 0.2)"} 
                    />
                  </View>
                  <TouchableOpacity 
                    style={[styles.detailsButton, index > 0 && styles.detailsButtonInactive]}
                    onPress={() => router.push(`/(tabs)/garage/${moto.id}?from=gallery` as any)}
                  >
                    <Text style={[styles.detailsButtonText, index > 0 && styles.detailsButtonTextInactive]}>
                      Ver detalles
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          
          {motorcycles.length > 0 && renderEmptyState()}
        </View>
      </ScrollView>

      {/* FAB Add */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/garage/register')}
      >
        <MaterialIcons name="add" size={32} color={Colores.fondoPrincipal} />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colores.fondoPrincipal,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colores.primario,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colores.primario,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  titleSection: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colores.blanco,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  titleUnderline: {
    height: 4,
    width: 48,
    backgroundColor: Colores.primario,
    marginTop: 8,
  },
  pageSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginTop: 8,
  },
  listContainer: {
    gap: 24,
  },
  bikeCard: {
    backgroundColor: 'rgba(22, 29, 44, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  bikeCardInactive: {
    opacity: 0.8,
  },
  bikeImageContainer: {
    height: 192,
    position: 'relative',
    width: '100%',
  },
  bikeImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(10, 15, 26, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.3)',
  },
  statusBadgeText: {
    color: Colores.primario,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bikeInfo: {
    padding: 20,
  },
  bikeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bikeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colores.blanco,
  },
  bikeMeta: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
  },
  detailsButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    color: Colores.primario,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailsButtonInactive: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailsButtonTextInactive: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyContainer: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '500',
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
    shadowColor: Colores.primario,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  }
});
