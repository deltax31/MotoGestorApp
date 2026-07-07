import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Colores } from '@/constants/colores';
import { useAutenticacionStore } from '@/store/autenticacionStore';
import { useVehiculoStore } from '@/store/vehiculoStore';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { session, profile, refreshProfile } = useAutenticacionStore();
  const { motorcycles, fetchMotorcycles } = useVehiculoStore();
  
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      if (session?.id) {
        fetchMotorcycles(session.id);
      }
    }, [session?.id])
  );
  
  const userName = profile?.full_name || profile?.name || session?.user_metadata?.full_name || session?.email?.split('@')[0] || 'Usuario';
  const userEmail = session?.email || 'No disponible';
  const userPhone = profile?.phone || 'No configurado';
  const plan = profile?.plan || 'free';
  const isPro = plan === 'pro';
  
  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBRfbBn6BRuXGpZoBvnVKge4kt32mqtTLfDl2ljDluLE4bKHp9xERwxGmBhyf1efEP4NefwMYm3HelB2WOwCDXdkqP199zHJ8unp4_Ve9W1u_9IGUqayqT_4k5dpfv2edE1vqkds0aKqEUfV24XwdoPJBNAfjqdaCyfcIPHDfCJAZfbpbAROCRxtOHKva4cSfKs7zEGE2c1iR786tyXVYuqD5F-11cB5zCBW-hNLpqbTeiM-JHDBj2XF_9yK-BA3L1QIOuCLDiuwWrY";
  const avatarUri = profile?.avatar_url || session?.user_metadata?.avatar_url || defaultAvatar;
  const maxMotos = isPro ? 3 : 1;
  const numMotos = motorcycles?.length || 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colores.primario} />
          </TouchableOpacity>
          <View style={styles.smallAvatarContainer}>
            <Image source={{ uri: avatarUri }} style={styles.smallAvatar} />
          </View>
          <Text style={styles.headerTitle}>Ruta 360</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialIcons name="notifications" size={24} color={Colores.primario} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.glassCard}>
          <View style={styles.arcAccent} />
          
          <View style={styles.userInfoTop}>
            <View style={styles.avatarGradient}>
              {avatarUri && avatarUri !== defaultAvatar ? (
                <Image source={{ uri: avatarUri }} style={styles.largeAvatar} />
              ) : (
                <Text style={styles.avatarInitial}>{userName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.userInfoText}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
              <View style={styles.planBadgeContainer}>
                <MaterialIcons name="workspace-premium" size={12} color={Colores.primario} />
                <Text style={styles.planBadgeText}>{isPro ? 'Plan Pro' : 'Plan Gratis'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsList}>
            <DetailItem icon="person" label="Nombre" value={userName} />
            <DetailItem icon="mail" label="Email" value={userEmail} />
            <DetailItem icon="phone-iphone" label="Teléfono" value={userPhone} italic={!profile?.phone} />
            <DetailItem icon="motorcycle" label="Motos registradas" value={`${numMotos}/${maxMotos}`} />
          </View>

          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="edit" size={14} color={Colores.primario} />
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Plans Section */}
        <View style={styles.plansSection}>
          <View style={styles.plansHeader}>
            <MaterialIcons name="account-balance-wallet" size={20} color={Colores.acento} />
            <Text style={styles.plansTitle}>Planes de suscripción</Text>
          </View>

          {/* Free Plan */}
          <View style={[styles.planCard, styles.freePlanCard]}>
            <View style={styles.planCardHeader}>
              <View>
                <Text style={styles.planName}>Plan Gratis</Text>
                <Text style={styles.planPrice}>$0</Text>
              </View>
              {!isPro && (
                <View style={styles.currentPlanBadge}>
                  <Text style={styles.currentPlanBadgeText}>Plan actual</Text>
                </View>
              )}
            </View>
            <View style={styles.planFeatures}>
              <FeatureItem text="1 moto registrada" active />
              <FeatureItem text="SOAT & Tecnomecánica" active />
              <FeatureItem text="Mantenimientos" active />
              <FeatureItem text="Asistente IA básico" active />
            </View>
            {!isPro && (
              <View style={styles.currentPlanFooter}>
                <MaterialIcons name="check" size={14} color="rgba(255,255,255,0.4)" />
                <Text style={styles.currentPlanFooterText}>Plan actual</Text>
              </View>
            )}
          </View>

          {/* Pro Plan */}
          <View style={styles.proPlanContainer}>
            <View style={styles.proPlanGlow} />
            <View style={styles.proPlanCard}>
              <View style={styles.planCardHeader}>
                <View>
                  <Text style={styles.proPlanName}>Plan Pro</Text>
                  <Text style={styles.planPrice}>
                    $9.900<Text style={styles.planPriceMonth}>/mes</Text>
                  </Text>
                </View>
                <View style={styles.starIconContainer}>
                  <MaterialIcons name="star" size={20} color={Colores.acento} />
                </View>
              </View>
              <View style={styles.planFeatures}>
                <FeatureItem text="Hasta 3 motos" active isProFeature />
                <FeatureItem text="Todo del plan Gratis" active isProFeature />
                <FeatureItem text="Análisis avanzado de gastos" active isProFeature />
                <FeatureItem text="Escaneo IA de imágenes" active isProFeature />
                <FeatureItem text="Recordatorios inteligentes" active isProFeature />
              </View>
              {!isPro ? (
                <TouchableOpacity style={styles.upgradeButton}>
                  <MaterialIcons name="star" size={16} color={Colores.fondoPrincipal} />
                  <Text style={styles.upgradeButtonText}>Actualizar a Pro</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.currentPlanFooterPro}>
                  <MaterialIcons name="check" size={14} color={Colores.acento} />
                  <Text style={styles.currentPlanFooterTextPro}>Plan actual</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailItem = ({ icon, label, value, italic }: { icon: keyof typeof MaterialIcons.glyphMap, label: string, value: string, italic?: boolean }) => (
  <View style={styles.detailItem}>
    <MaterialIcons name={icon} size={20} color="rgba(255,255,255,0.4)" />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, italic && styles.italicText]}>{value}</Text>
    </View>
  </View>
);

const FeatureItem = ({ text, active, isProFeature }: { text: string, active: boolean, isProFeature?: boolean }) => (
  <View style={styles.featureItem}>
    <MaterialIcons name="check-circle" size={18} color={isProFeature ? Colores.acento : Colores.primario} />
    <Text style={[styles.featureText, isProFeature && styles.featureTextPro]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colores.fondoPrincipal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 64,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 4,
  },
  smallAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colores.primario,
    overflow: 'hidden',
  },
  smallAvatar: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    color: Colores.primario,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif',
  },
  headerButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  glassCard: {
    backgroundColor: 'rgba(22, 27, 34, 0.8)',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24,
  },
  arcAccent: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: 'rgba(0, 200, 212, 0.1)',
  },
  userInfoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colores.primario,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colores.primario,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  largeAvatar: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: Colores.fondoPrincipal,
    fontSize: 32,
    fontWeight: '900',
  },
  userInfoText: {
    flex: 1,
  },
  userName: {
    color: Colores.blanco,
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 2,
  },
  planBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.2)',
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 4,
  },
  planBadgeText: {
    color: Colores.primario,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailsList: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 15, 26, 0.5)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: Colores.blanco,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  italicText: {
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.4)',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 24,
    gap: 8,
  },
  editButtonText: {
    color: Colores.primario,
    fontSize: 14,
    fontWeight: 'bold',
  },
  plansSection: {
    gap: 16,
  },
  plansHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  plansTitle: {
    color: Colores.blanco,
    fontSize: 18,
    fontWeight: 'bold',
  },
  planCard: {
    backgroundColor: 'rgba(22, 27, 34, 0.8)',
    borderRadius: 12,
    padding: 24,
    borderLeftWidth: 4,
  },
  freePlanCard: {
    borderLeftColor: 'rgba(255,255,255,0.2)',
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    color: Colores.blanco,
    fontSize: 18,
    fontWeight: 'bold',
  },
  proPlanName: {
    color: Colores.acento,
    fontSize: 18,
    fontWeight: 'bold',
  },
  planPrice: {
    color: Colores.blanco,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
  },
  planPriceMonth: {
    fontSize: 14,
    fontWeight: 'normal',
    color: 'rgba(255,255,255,0.5)',
  },
  currentPlanBadge: {
    backgroundColor: Colores.acento,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentPlanBadgeText: {
    color: Colores.fondoPrincipal,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planFeatures: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  featureTextPro: {
    color: 'rgba(255,255,255,0.9)',
  },
  currentPlanFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  currentPlanFooterText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  proPlanContainer: {
    position: 'relative',
    marginTop: 8,
  },
  proPlanGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: Colores.acento,
    borderRadius: 14,
    opacity: 0.2,
  },
  proPlanCard: {
    backgroundColor: 'rgba(22, 27, 34, 0.8)',
    borderRadius: 12,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colores.acento,
  },
  starIconContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colores.acento,
    paddingVertical: 16,
    borderRadius: 8,
    shadowColor: Colores.acento,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  upgradeButtonText: {
    color: Colores.fondoPrincipal,
    fontSize: 16,
    fontWeight: '900',
  },
  currentPlanFooterPro: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    gap: 8,
  },
  currentPlanFooterTextPro: {
    color: Colores.acento,
    fontSize: 14,
    fontWeight: 'bold',
  }
});
