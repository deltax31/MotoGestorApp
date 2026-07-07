import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colores } from '@/constants/colores';
import { useVehiculoStore } from '@/store/vehiculoStore';

const StatusRing = ({ status, color, icon }: { status: string, color: string, icon: keyof typeof MaterialIcons.glyphMap }) => (
  <View style={styles.statusRingContainer}>
    <Svg width="48" height="48" viewBox="0 0 36 36" style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx="18" cy="18" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none" />
      <Circle cx="18" cy="18" r="16" stroke={color} strokeWidth="3" fill="none" strokeDasharray="100, 100" strokeDashoffset={status === 'vigente' ? 0 : 35} strokeLinecap="round" />
    </Svg>
    <View style={styles.statusRingIcon}>
      <MaterialIcons name={icon} size={18} color={color} />
    </View>
  </View>
);

export default function GarageDetailScreen() {
  const { id, from } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { motorcycles } = useVehiculoStore();

  const handleBack = () => {
    if (from === 'dashboard') {
      router.navigate('/(tabs)/inicio');
    } else {
      router.navigate('/(tabs)/garaje');
    }
  };

  const moto = motorcycles.find(m => m.id === id);

  if (!moto) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colores.blanco }}>Moto no encontrada.</Text>
        <TouchableOpacity onPress={handleBack} style={{ marginTop: 20 }}>
          <Text style={{ color: Colores.primario }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const soatColor = moto.soat_status === 'vigente' ? Colores.primario : Colores.acento;
  const tecnoColor = moto.tecno_status === 'vigente' ? Colores.primario : Colores.acento;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles de Moto</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push(`/garaje/edit?id=${id}`)}>
          <MaterialIcons name="edit" size={24} color={Colores.primario} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={{ uri: moto.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuADzUGLuRrdb7dn0e08Ppb0Bts3cP1ZuR39H34d-C2tqE3vE7NPlB6zOAdmZ3wEZNHaMoYibvYAHgvYFCXYATLTyCfVJIP0LEYjl7uIktFb9050LfSVEQnkZ-OiLa8qVOgJzm_mLDvDjhI6LXzcB3FNcb9VWV2RIrIVpcTOo7kCXH1ZszTQxKrGui2HrDZd0ltBfEnBcVQfdEm1m8mXfmdO0sDUaRlss-dQL2_jDEaIHZd2MiaxwsrEfhdiUcye0fHdy6reCgdd-iZP' }}
            style={styles.heroBackground}
          >
            <LinearGradient
              colors={['transparent', 'transparent', Colores.fondoPrincipal]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <View style={styles.plateBadge}>
                <Text style={styles.plateText}>{moto.plate}</Text>
              </View>
              <Text style={styles.heroTitle}>{moto.brand} {moto.model}</Text>
              <Text style={styles.heroSubtitle}>Año {moto.year}</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Kilometraje Card */}
        <View style={styles.kmCard}>
          <View>
            <Text style={styles.kmLabel}>RECORRIDO TOTAL</Text>
            <View style={styles.kmValueRow}>
              <Text style={styles.kmValue}>{moto.current_km.toLocaleString('es-CO')}</Text>
              <Text style={styles.kmUnit}>KM</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.kmButton}>
            <Text style={styles.kmButtonText}>Actualizar KM</Text>
          </TouchableOpacity>
        </View>

        {/* Ficha Técnica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FICHA TÉCNICA</Text>
          <View style={styles.grid}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoLabel}>MARCA</Text>
              <Text style={styles.cardInfoValue}>{moto.brand}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoLabel}>MODELO</Text>
              <Text style={styles.cardInfoValue}>{moto.model}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoLabel}>AÑO</Text>
              <Text style={styles.cardInfoValue}>{moto.year}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoLabel}>PLACA</Text>
              <Text style={styles.cardInfoValue}>{moto.plate}</Text>
            </View>
            <View style={[styles.cardInfo, { width: '100%' }]}>
              <Text style={styles.cardInfoLabel}>CILINDRAJE (CC)</Text>
              <Text style={styles.cardInfoValue}>{moto.engine_cc || 'No especificado'}</Text>
            </View>
          </View>
        </View>

        {/* Documentación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DOCUMENTACIÓN</Text>
          <View style={styles.grid}>
            <View style={styles.docCard}>
              <StatusRing 
                status={moto.soat_status} 
                color={soatColor} 
                icon={moto.soat_status === 'vigente' ? 'verified' : 'warning'} 
              />
              <View>
                <Text style={styles.docTitle}>SOAT</Text>
                <Text style={styles.docSubtitle}>Vence: {moto.soat_expiry || 'N/A'}</Text>
                <Text style={[styles.docStatus, { color: soatColor }]}>
                  {moto.soat_status === 'vigente' ? 'AL DÍA' : 'PENDIENTE'}
                </Text>
              </View>
            </View>

            <View style={styles.docCard}>
              <StatusRing 
                status={moto.tecno_status} 
                color={tecnoColor} 
                icon={moto.tecno_status === 'vigente' ? 'verified' : 'warning'} 
              />
              <View>
                <Text style={styles.docTitle}>Tecno</Text>
                <Text style={styles.docSubtitle}>Vence: {moto.tecno_expiry || 'N/A'}</Text>
                <Text style={[styles.docStatus, { color: tecnoColor }]}>
                  {moto.tecno_status === 'vigente' ? 'AL DÍA' : 'PREVENTIVO'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Gestión */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GESTIÓN</Text>
          <View style={{ gap: 8 }}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/mantenimientos')}>
              <View style={styles.actionCardLeft}>
                <View style={styles.actionIconWrapper}>
                  <MaterialIcons name="history" size={20} color={Colores.primario} />
                </View>
                <Text style={styles.actionCardText}>Historial de Mantenimiento</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionCardLeft}>
                <View style={styles.actionIconWrapper}>
                  <MaterialIcons name="payments" size={20} color={Colores.primario} />
                </View>
                <Text style={styles.actionCardText}>Registro de Gastos</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
          </View>
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
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colores.blanco,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroSection: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroBackground: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  plateBadge: {
    backgroundColor: Colores.acento,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  plateText: {
    color: Colores.fondoPrincipal,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colores.blanco,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  kmCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
  },
  kmLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  kmValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  kmValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colores.blanco,
  },
  kmUnit: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colores.primario,
  },
  kmButton: {
    backgroundColor: 'rgba(0, 200, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  kmButtonText: {
    color: Colores.primario,
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardInfo: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardInfoLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colores.blanco,
  },
  docCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusRingContainer: {
    width: 48,
    height: 48,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusRingIcon: {
    position: 'absolute',
  },
  docTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colores.blanco,
  },
  docSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  docStatus: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colores.blanco,
  }
});
