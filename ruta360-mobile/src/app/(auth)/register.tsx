import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';
import { insforge } from '@/services/insforge/client';
import { useAutenticacionStore } from '@/store/autenticacionStore';
import Svg, { Path } from 'react-native-svg';

export default function RegisterScreen() {
  const router = useRouter();
  const { checkSession } = useAutenticacionStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name: name,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.accessToken || data?.user) {
        if (data.accessToken) {
          await checkSession();
        } else {
          // Force login attempt just in case (auto-login is assumed)
          const { data: loginData, error: loginError } = await insforge.auth.signInWithPassword({
            email,
            password,
          });
          if (loginData?.accessToken) {
            await checkSession();
          } else if (loginError) {
             setErrorMsg(loginError.message);
          }
        }
      }
    } catch (err) {
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const redirectUrl = Platform.OS === 'web' ? window.location.origin : 'exp://localhost:8081';
      
      const { data, error } = await insforge.auth.signInWithOAuth('google', {
        redirectTo: redirectUrl,
        additionalParams: { prompt: 'select_account' },
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.url && Platform.OS === 'web') {
        window.location.href = data.url;
      }
    } catch (err) {
      setErrorMsg('Error al iniciar sesión con Google.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: Colores.fondoPrincipal }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          
          {/* Logo Area */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/images/logo-ruta360.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Title & Subtitle */}
          <View style={styles.headerText}>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Únete a la comunidad motera más grande</Text>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Nombre completo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOMBRE COMPLETO</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color="rgba(255, 255, 255, 0.4)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="rgba(255, 255, 255, 0.2)"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Correo electrónico */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="mail" size={20} color="rgba(255, 255, 255, 0.4)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="email@ejemplo.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.2)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONTRASEÑA</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color="rgba(255, 255, 255, 0.4)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.2)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons 
                    name={showPassword ? "visibility-off" : "visibility"} 
                    size={20} 
                    color={showPassword ? Colores.primario : "rgba(255, 255, 255, 0.4)"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-reset" size={20} color="rgba(255, 255, 255, 0.4)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.2)"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialIcons 
                    name={showConfirmPassword ? "visibility-off" : "visibility"} 
                    size={20} 
                    color={showConfirmPassword ? Colores.primario : "rgba(255, 255, 255, 0.4)"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colores.fondoPrincipal} />
              ) : (
                <Text style={styles.primaryButtonText}>Regístrate</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O REGÍSTRATE CON</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="white">
                <Path d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.28-2.06 4.44-1.16 1.16-2.96 2.36-5.78 2.36-4.64 0-8.44-3.76-8.44-8.4s3.8-8.4 8.44-8.4c2.5 0 4.34 1 5.76 2.38l2.3-2.3c-1.92-1.84-4.38-3.3-8.06-3.3C6.34 1.2 1.2 6.34 1.2 12s5.14 10.8 10.8 10.8c3.08 0 5.42-1.02 7.34-3 1.98-1.98 2.6-4.78 2.6-6.98 0-.66-.06-1.28-.16-1.9h-9.3z" />
              </Svg>
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7} onPress={() => {}}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="white">
                <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </Svg>
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.footerLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
      {/* Bottom Aesthetic Accent */}
      <View style={styles.bottomGradient} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 80,
  },
  headerText: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: Colores.blanco,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  form: {
    width: '100%',
    gap: 20,
  },
  inputGroup: {
    width: '100%',
    gap: 6,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colores.primario,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 48,
    color: Colores.blanco,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: Colores.primario,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colores.primario,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: Colores.fondoPrincipal,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 32,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  socialContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    gap: 12,
  },
  socialButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  footerLink: {
    color: Colores.acento,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colores.primario,
    opacity: 0.3,
  },
});
