import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colores } from '@/constants/colores';
import { useAutenticacionStore } from '@/store/autenticacionStore';
import { useVehiculoStore } from '@/store/vehiculoStore';
import * as ImagePicker from 'expo-image-picker';
import { insforge } from '@/services/insforge/client';
import { Platform } from 'react-native';

import { ImagePickerSelector } from '@/components/vehiculo/ImagePickerSelector';

export default function RegisterMotoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, profile } = useAutenticacionStore();
  const { addMotorcycle, motorcycles } = useVehiculoStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    plate: '',
    color: '',
    engine_cc: '',
    current_km: '0',
    soat_expiry: '',
    soat_policy_number: '',
    tecno_expiry: '',
    tecno_certificate: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const handleSave = async () => {
    if (!session?.id) {
      setErrorMsg('Error de sesión: No se encontró el usuario activo.');
      return;
    }
    
    // Validaciones
    if (!formData.brand || !formData.model || !formData.year || !formData.plate) {
      setErrorMsg('Faltan datos: Por favor llena todos los campos obligatorios (*)');
      return;
    }

    const plan = profile?.plan || 'free';
    const isPro = plan === 'pro';
    
    if (!isPro && motorcycles.length >= 1) {
      setErrorMsg('Tu plan actual no permite registrar más de 1 moto. Actualiza a Pro.');
      return;
    }
    
    if (isPro && motorcycles.length >= 3) {
      setErrorMsg('Has alcanzado el límite máximo de 3 motos para el Plan Pro.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    
    const motoData = {
      user_id: session.id,
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year) || 2024,
      plate: formData.plate.toUpperCase(),
      color: formData.color || undefined,
      engine_cc: formData.engine_cc ? parseInt(formData.engine_cc) : undefined,
      current_km: parseInt(formData.current_km) || 0,
      soat_expiry: formData.soat_expiry || undefined,
      soat_policy_number: formData.soat_policy_number || undefined,
      tecno_expiry: formData.tecno_expiry || undefined,
      tecno_certificate: formData.tecno_certificate || undefined,
      localImageUri: localImageUri,
    };

    const { error } = await addMotorcycle(motoData);
    setIsLoading(false);

    if (error) {
      console.error("Supabase insert error:", error);
      setErrorMsg(error.message || 'No se pudo registrar la motocicleta.');
    } else {
      router.back();
    }
  };

  const handleIAScan = async () => {
    try {
      let result;
      if (Platform.OS === 'web') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          base64: true,
          quality: 0.5,
        });
      } else {
        const choice = await new Promise<string>((resolve) => {
          Alert.alert(
            "Escanear matrícula",
            "¿Desde dónde quieres cargar la imagen?",
            [
              { text: "Tomar Foto", onPress: () => resolve("camera") },
              { text: "Galería", onPress: () => resolve("gallery") },
              { text: "Cancelar", style: "cancel", onPress: () => resolve("cancel") }
            ]
          );
        });

        if (choice === "cancel") return;

        if (choice === "camera") {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert("Permiso denegado", "Se requiere acceso a la cámara.");
            return;
          }
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            base64: true,
            quality: 0.5,
          });
        } else {
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            base64: true,
            quality: 0.5,
          });
        }
      }

      if (result && !result.canceled && result.assets && result.assets[0]?.base64) {
        setIsScanning(true);
        setErrorMsg('');

        // Llamada a la IA usando el proxy
        const response = await insforge.ai.chat.completions.create({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Extrae los siguientes datos de la matrícula/tarjeta de propiedad de esta moto en formato JSON estricto con las siguientes claves: brand (marca), model (modelo), year (año, texto numérico), plate (placa), color (color), engine_cc (cilindraje, texto numérico). Si no encuentras un dato, envíalo como null.' },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${result.assets[0]?.base64}` } }
              ]
            }
          ]
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            setFormData(prev => ({
              ...prev,
              brand: data.brand || prev.brand,
              model: data.model || prev.model,
              year: data.year ? String(data.year) : prev.year,
              plate: data.plate || prev.plate,
              color: data.color || prev.color,
              engine_cc: data.engine_cc ? String(data.engine_cc) : prev.engine_cc,
            }));
            
            if (Platform.OS === 'web') {
              window.alert("Datos extraídos correctamente. Revisa que sean correctos antes de guardar.");
            } else {
              Alert.alert("Éxito", "Datos extraídos correctamente. Revisa que sean correctos antes de guardar.");
            }
          } else {
            throw new Error("No se pudo leer el JSON devuelto por la IA.");
          }
        }
      }
    } catch (error: any) {
      console.error("Error AI scan:", error);
      setErrorMsg("Error al procesar la imagen con IA: " + (error.message || ""));
      if (Platform.OS !== 'web') {
         Alert.alert("Error", "No se pudo extraer la información de la imagen.");
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="motorcycle" size={24} color={Colores.primario} />
          <Text style={styles.headerTitle}>Registrar Moto</Text>
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="close" size={24} color={Colores.blanco} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
        
        <ImagePickerSelector
          imageUri={localImageUri}
          onImageSelected={(uri) => setLocalImageUri(uri)}
          onImageRemoved={() => setLocalImageUri(null)}
          size={120}
        />

        {/* IA Scanner Banner */}
        <View style={styles.iaBanner}>
          <TouchableOpacity 
            style={styles.iaButton}
            onPress={handleIAScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color={Colores.primario} />
            ) : (
              <MaterialIcons name="photo-camera" size={20} color={Colores.primario} />
            )}
            <Text style={styles.iaButtonText}>
              {isScanning ? "Analizando imagen..." : "Escanear matrícula con IA"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.iaHelpText}>Sube una foto de la tarjeta de propiedad y la IA llenará los campos automáticamente.</Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Datos del vehículo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Datos del vehículo</Text>
          </View>

          <View style={styles.grid}>
            <View style={styles.col2}>
              <Text style={styles.label}>Marca *</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. Yamaha"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={formData.brand}
                onChangeText={(t) => handleChange('brand', t)}
              />
            </View>
            <View style={styles.col2}>
              <Text style={styles.label}>Modelo *</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. MT-09"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={formData.model}
                onChangeText={(t) => handleChange('model', t)}
              />
            </View>

            <View style={styles.col1}>
              <Text style={styles.label}>Año *</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={formData.year}
                onChangeText={(t) => handleChange('year', t)}
              />
            </View>
            <View style={styles.col1}>
              <Text style={styles.label}>Placa *</Text>
              <TextInput
                style={[styles.input, { textTransform: 'uppercase' }]}
                placeholder="ABC123"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                autoCapitalize="characters"
                value={formData.plate}
                onChangeText={(t) => handleChange('plate', t)}
              />
            </View>

            <View style={styles.col1}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. Cyan"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={formData.color}
                onChangeText={(t) => handleChange('color', t)}
              />
            </View>
            <View style={styles.col1}>
              <Text style={styles.label}>Cilindraje (cc)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="ej. 890"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={formData.engine_cc}
                onChangeText={(t) => handleChange('engine_cc', t)}
              />
            </View>

            <View style={styles.col2}>
              <Text style={styles.label}>Kilometraje actual *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  keyboardType="numeric"
                  value={formData.current_km}
                  onChangeText={(t) => handleChange('current_km', t)}
                />
                <Text style={styles.inputSuffix}>KM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SOAT */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>SOAT (Opcional)</Text>
          </View>
          <View style={styles.grid}>
            <View style={styles.col1}>
              <Text style={styles.label}>Vencimiento (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2027-10-12"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={formData.soat_expiry}
                onChangeText={(t) => handleChange('soat_expiry', t)}
              />
            </View>
            <View style={styles.col1}>
              <Text style={styles.label}>Nº Póliza</Text>
              <TextInput
                style={styles.input}
                value={formData.soat_policy_number}
                onChangeText={(t) => handleChange('soat_policy_number', t)}
              />
            </View>
          </View>
        </View>

        {/* Tecnomecánica */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Tecnomecánica (Opcional)</Text>
          </View>
          <View style={styles.grid}>
            <View style={styles.col1}>
              <Text style={styles.label}>Vencimiento (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2027-06-05"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={formData.tecno_expiry}
                onChangeText={(t) => handleChange('tecno_expiry', t)}
              />
            </View>
            <View style={styles.col1}>
              <Text style={styles.label}>Nº Certificado</Text>
              <TextInput
                style={styles.input}
                value={formData.tecno_certificate}
                onChangeText={(t) => handleChange('tecno_certificate', t)}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Area */}
      <View style={[styles.bottomActionArea, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={styles.submitButton}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colores.fondoPrincipal} />
          ) : (
            <Text style={styles.submitButtonText}>Guardar Moto</Text>
          )}
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colores.primario,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  iaBanner: {
    backgroundColor: 'rgba(0, 200, 212, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 212, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  iaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colores.primario,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  iaButtonText: {
    color: Colores.primario,
    fontSize: 14,
    fontWeight: 'bold',
  },
  iaHelpText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 32,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionIndicator: {
    width: 32,
    height: 4,
    backgroundColor: Colores.primario,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colores.primario,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  col1: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  col2: {
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: Colores.blanco,
    fontSize: 14,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputSuffix: {
    position: 'absolute',
    right: 16,
    color: Colores.primario,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomActionArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'rgba(10, 15, 26, 0.9)',
    paddingTop: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  submitButton: {
    backgroundColor: Colores.acento,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: Colores.fondoPrincipal,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
