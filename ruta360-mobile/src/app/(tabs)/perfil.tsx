import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colores } from '@/constants/colores';
import { useAutenticacionStore } from '@/store/autenticacionStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, profile, session } = useAutenticacionStore();
  
  const userName = profile?.full_name || profile?.name || session?.user_metadata?.full_name || session?.email?.split('@')[0] || 'Rider Ruta 360';
  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAfvgcF624JbaMCLk0i6_7R7AXNgkSZqdomUzKxmXt_2O-xIs4bBiJ1k6iTjgwzU_q7OV99aUZWrfCxGR1vbRzmsqGnU-38ihS2dnpP_3kIC4OAM6r23gqCF78lazFRJ0syKUv_SZoQFk5wKF5LuKfsqNj_MljaCvO77V36fanKZ6GzOV10EvLXslCeuzM0BfmM5rDVeIEnDGlKiY32iUPPDY1Y-0U17kEdI4OXBJG0CEOwKW0PuYth3kRLGe3f3mN-rLy5rZXfUe7s";
  const avatarUri = profile?.avatar_url || session?.user_metadata?.avatar_url || defaultAvatar;

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/inicio')} 
          style={styles.headerButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RUTA 360</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialIcons name="settings" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarGlow} />
            <View style={styles.avatarBorder}>
              <Image 
                source={{ uri: avatarUri }} 
                style={styles.avatar} 
              />
            </View>
            <TouchableOpacity style={styles.editButton}>
              <MaterialIcons name="edit" size={16} color={Colores.fondoPrincipal} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.roleBadge}>
            <MaterialIcons name="stars" size={14} color={Colores.acento} />
            <Text style={styles.roleText}>Piloto Experto</Text>
          </View>
        </View>

        {/* Options List */}
        <View style={styles.optionsList}>
          <OptionItem 
            icon="two-wheeler" 
            title="Mis Motos" 
            onPress={() => router.push('/garaje')} 
          />
          <OptionItem 
            icon="manage-accounts" 
            title="Configuración de la cuenta" 
            onPress={() => router.push('/cuenta')}
          />
          <OptionItem 
            icon="payments" 
            title="Historial de pagos" 
          />
          <OptionItem 
            icon="notifications" 
            title="Notificaciones" 
            badge={3}
          />
          <OptionItem 
            icon="help" 
            title="Ayuda y Soporte" 
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={Colores.peligro} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        {/* Version Footer */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>V 2.4.1</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const OptionItem = ({ icon, title, onPress, badge }: { icon: keyof typeof MaterialIcons.glyphMap, title: string, onPress?: () => void, badge?: number }) => (
  <TouchableOpacity style={styles.optionItem} onPress={onPress}>
    <View style={styles.optionIconContainer}>
      <MaterialIcons name={icon} size={20} color={Colores.primario} />
    </View>
    <View style={styles.optionContent}>
      <Text style={styles.optionTitle}>{title}</Text>
    </View>
    {badge && (
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
  </TouchableOpacity>
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
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: Colores.primario,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colores.primario,
    borderRadius: 60,
    opacity: 0.3,
    transform: [{ scale: 1.15 }],
  },
  avatarBorder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: Colores.primario,
    padding: 4,
    backgroundColor: Colores.fondoPrincipal,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colores.primario,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  userName: {
    color: Colores.blanco,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    gap: 6,
  },
  roleText: {
    color: Colores.acento,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionsList: {
    marginBottom: 40,
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 27, 41, 0.7)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.1)',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 200, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  badgeContainer: {
    backgroundColor: Colores.acento,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: Colores.fondoPrincipal,
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    gap: 8,
    backgroundColor: 'transparent',
  },
  logoutText: {
    color: Colores.peligro,
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
