import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colores } from '@/constants/colores';
import { insforge } from '@/services/insforge/client';
import { useAutenticacionStore } from '@/store/autenticacionStore';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { checkSession } = useAutenticacionStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Credenciales inválidas');
      } else if (data?.accessToken || (data as any)?.session) {
        // Update the Zustand global state
        await checkSession();
        // The _layout.tsx guard will automatically redirect to dashboard
      } else {
        // Maybe it needs email verification
        setErrorMsg('Por favor verifica tu correo electrónico.');
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
      const redirectUrl = Platform.OS === 'web' ? window.location.origin : Linking.createURL('/');
      
      const { data, error } = await insforge.auth.signInWithOAuth('google', {
        redirectTo: redirectUrl,
        skipBrowserRedirect: Platform.OS !== 'web',
        additionalParams: { prompt: 'select_account' },
      });

      if (error) {
        console.error('OAuth Initialization Error:', error);
        setErrorMsg(error.message);
      } else if (data?.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
        } else {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
          // If the auth was successful, checkSession() should ideally be triggered, 
          // or a deep link listener should handle the returned session.
          // For now, check if we got a success redirect.
          if (result.type === 'success' && result.url) {
            const parsedUrl = Linking.parse(result.url);
            const code = parsedUrl.queryParams?.insforge_code;
            
            if (code && typeof code === 'string') {
              // Passamos el codeVerifier devuelto por signInWithOAuth
              const exchangeResult = await insforge.auth.exchangeOAuthCode(code, data.codeVerifier);
              if (exchangeResult.error) {
                console.error('OAuth Exchange Error:', exchangeResult.error);
                setErrorMsg('Error de autenticación: ' + exchangeResult.error.message);
                return;
              }
            }
            
            await checkSession();
          }
        }
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
      <View style={styles.main}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/logo-ruta360.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Login Section */}
        <View style={styles.glassPanel}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Bienvenido de nuevo</Text>
            <Text style={styles.subtitle}>Ingresa tus credenciales para continuar</Text>
          </View>

          {errorMsg ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="mail" size={20} color="rgba(255, 255, 255, 0.3)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="rider@ruta360.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.2)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color="rgba(255, 255, 255, 0.3)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.2)"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, styles.glowCyan]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colores.fondoPrincipal} />
              ) : (
                <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerTextContainer}>
              <Text style={styles.dividerText}>O ENTRA CON</Text>
            </View>
          </View>

          <View style={styles.socialGrid}>
            <TouchableOpacity 
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={handleGoogleLogin}
            >
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDf_fSZh3_cRq9_jwQSyBF7j0LpLT9AsFj2kXWHYXDYu2gAdS3e2JSKYy2ep3p6Z8UAQNe7O70DM1kga6hE5e6uRUTsHkmnvyGLsKzWJrShJiIb2GEoTB2iKdv0x4-l5fjTAp6vpYkH7uPZ8YGjjierAH6twb_0vyOawxkMpkgc5ladOhBL-MYrt6MQetQQOmdNTrovUcOhrV8E5MW_u4MaEU9C0pb8hznDnqmdijXx8c3upGNhiQdM1iaOy-lv-8-LSe3gN_bamyLH' }}
                style={styles.socialIcon}
              />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPnMWmj05GATQ5dxvSfqpyutAnS_SYZvgdTFcb-9nrXDREya3Flkc-mEzMv22xzGLdpfMgZNdM5W1HC1-UBe2arNmS3qZQMWM1-_ngXGTvZPsO26SdjmSRqQ6SEfGtHjaPNfy0oRBKpZYfkidMh0F7ZrWhiKwD4T6zryTScBIpuNKQy9chZAFUGciWSp_W5y1Zy5Z8QA1sLRajhPz58JjdtGUbODf4ewMK_ynuzxfLMknrjKATcN-EaBL8EJqx6RMzQCxenaSwk0yX' }}
                style={styles.socialIcon}
              />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    backgroundColor: Colores.fondoPrincipal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    width: '100%',
    maxWidth: 448, // max-w-md
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 80,
  },
  glassPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerText: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colores.blanco,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 44,
    paddingRight: 16,
    color: Colores.blanco,
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: 'rgba(0, 200, 212, 0.8)',
  },
  primaryButton: {
    backgroundColor: Colores.primario,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
  dividerContainer: {
    position: 'relative',
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dividerTextContainer: {
    backgroundColor: '#0f1422',
    paddingHorizontal: 8,
  },
  dividerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    textTransform: 'uppercase',
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colores.blanco,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  footerLink: {
    color: Colores.primario,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
