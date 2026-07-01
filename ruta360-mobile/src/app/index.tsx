import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        
        {/* Hero Section */}
        <View style={[styles.heroSection, { minHeight: Math.max(530, height * 0.6) }]}>
          <ImageBackground 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-CIImpYwjtE__SY5Yi5GfqlGYMJPPOMI_dwrGxfhxi2IJ9SoLVwWV3F_71pRjwexnF_uxAez5piG4Ed6vf1jTz-nAfEOkTSynarlqCaVVbZgcPBSzx_AzfcUJbsQKEfeHLJm8vqT_pA0PAph0X3t7toZFoL9WXeAIDbNknKN3-JiLr0dlfsR4WBbo4GgjdcD59p3ElxtXhaxbenm19DG0DcLTFINMmF5w40H-JiqK2C53GrETLtdpMQaEvp5Uhv4mxZlk7Lt5BJ8U' }}
            style={styles.heroBackground}
            imageStyle={{ opacity: 0.4 }}
          >
            <LinearGradient
              colors={[Colores.fondoPrincipal, 'rgba(10, 15, 26, 0.6)', 'transparent']}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </ImageBackground>

          <View style={[styles.heroContent, { paddingTop: insets.top + 40 }]}>
            <Text style={styles.heroTitle}>Gestiona tu moto sin complicaciones</Text>
            <Text style={styles.heroSubtitle}>Centraliza SOAT, tecnomecánica y mantenimientos en un solo lugar.</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.primaryButton, styles.glowCyan]}
                activeOpacity={0.8}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.primaryButtonText}>Empezar gratis</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                activeOpacity={0.8}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.secondaryButtonText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bento Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.glassPanel}>
            <MaterialIcons name="build" size={40} color={Colores.primario} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Control de Mantenimientos</Text>
            <Text style={styles.featureDesc}>Registra cada cambio de aceite, frenos y llantas con recordatorios inteligentes.</Text>
          </View>
          
          <View style={styles.glassPanel}>
            <MaterialIcons name="smart-toy" size={40} color={Colores.primario} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Asistente IA</Text>
            <Text style={styles.featureDesc}>Predicciones basadas en tu estilo de conducción para prevenir fallos mecánicos.</Text>
          </View>
          
          <View style={styles.glassPanel}>
            <MaterialIcons name="payments" size={40} color={Colores.primario} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Gestión de Gastos</Text>
            <Text style={styles.featureDesc}>Visualiza cuánto inviertes en combustible y repuestos con gráficas detalladas.</Text>
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.pricingSection}>
          <View style={styles.pricingHeader}>
            <Text style={styles.pricingTitle}>Elige tu plan de ruta</Text>
            <Text style={styles.pricingSubtitle}>Lleva el control total de tu máquina</Text>
          </View>

          {/* Free Plan */}
          <View style={styles.freePlanCard}>
            <Text style={styles.planName}>Plan Gratuito</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>$0</Text>
              <Text style={styles.period}>/siempre</Text>
            </View>
            <View style={styles.featureList}>
              <View style={styles.featureListItem}>
                <MaterialIcons name="check-circle" size={20} color={Colores.primario} />
                <Text style={styles.featureListText}>Alertas de SOAT y Tecno</Text>
              </View>
              <View style={styles.featureListItem}>
                <MaterialIcons name="check-circle" size={20} color={Colores.primario} />
                <Text style={styles.featureListText}>Registro de 1 motocicleta</Text>
              </View>
              <View style={styles.featureListItem}>
                <MaterialIcons name="check-circle" size={20} color={Colores.primario} />
                <Text style={styles.featureListText}>Historial básico de gastos</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.outlineButton}
              activeOpacity={0.8}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.outlineButtonText}>Continuar gratis</Text>
            </TouchableOpacity>
          </View>

          {/* Pro Plan */}
          <View style={styles.proPlanCard}>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>RECOMENDADO</Text>
            </View>
            <Text style={[styles.planName, { color: Colores.primario }]}>Plan Pro</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>$9.900</Text>
              <Text style={styles.period}>/mes</Text>
            </View>
            <View style={styles.featureList}>
              <View style={styles.featureListItem}>
                <MaterialIcons name="stars" size={20} color={Colores.acento} />
                <Text style={[styles.featureListText, { color: Colores.blanco }]}>Motos ilimitadas en tu garaje</Text>
              </View>
              <View style={styles.featureListItem}>
                <MaterialIcons name="stars" size={20} color={Colores.acento} />
                <Text style={[styles.featureListText, { color: Colores.blanco }]}>Exportación de historial (PDF/Excel)</Text>
              </View>
              <View style={styles.featureListItem}>
                <MaterialIcons name="stars" size={20} color={Colores.acento} />
                <Text style={[styles.featureListText, { color: Colores.blanco }]}>Recordatorios de mantenimiento Pro</Text>
              </View>
              <View style={styles.featureListItem}>
                <MaterialIcons name="stars" size={20} color={Colores.acento} />
                <Text style={[styles.featureListText, { color: Colores.blanco }]}>Soporte prioritario 24/7</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.primaryButton, styles.glowCyan, { marginTop: 24 }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.primaryButtonText}>Obtener Plan Pro</Text>
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
  heroSection: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
    width: '100%',
    maxWidth: 400,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: Colores.primario,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: Colores.primario,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCyan: {
    shadowColor: Colores.primario,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  primaryButtonText: {
    color: Colores.fondoPrincipal,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Colores.blanco,
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    gap: 24,
  },
  glassPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colores.blanco,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
  pricingSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  pricingHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colores.blanco,
    marginBottom: 8,
  },
  pricingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  freePlanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  proPlanCard: {
    backgroundColor: 'rgba(0, 200, 212, 0.05)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colores.acento,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recommendedText: {
    color: Colores.fondoPrincipal,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colores.blanco,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
    gap: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: '900',
    color: Colores.blanco,
  },
  period: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  featureList: {
    gap: 16,
    marginBottom: 24,
  },
  featureListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureListText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: Colores.blanco,
    fontSize: 14,
    fontWeight: 'bold',
  }
});
