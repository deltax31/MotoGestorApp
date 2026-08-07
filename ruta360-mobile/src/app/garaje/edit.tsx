import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colores } from '@/constants/colores';
import { useAutenticacionStore } from '@/store/autenticacionStore';
import { useVehiculoStore, Motorcycle } from '@/store/vehiculoStore';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { insforge } from '@/services/insforge/client';
import { supabaseUrl } from '@/services/insforge/client';
import { ImagePickerSelector } from '@/components/vehiculo/ImagePickerSelector';

export default function EditMotoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { session } = useAutenticacionStore();
  const { motorcycles, updateMotorcycle, deleteMotorcycle } = useVehiculoStore();

  const moto = motorcycles.find(m => m.id === id);

  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isUploadingManual, setIsUploadingManual] = useState(false);
  const [hasGlobalManual, setHasGlobalManual] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [showSoatPicker, setShowSoatPicker] = useState(false);
  const [showTecnoPicker, setShowTecnoPicker] = useState(false);
  
  const [displayImageUri, setDisplayImageUri] = useState<string | null>(moto?.image_url || null);
  const [localImageUri, setLocalImageUri] = useState<string | null | undefined>(undefined);

  const handleImageSelected = (uri: string) => {
    setDisplayImageUri(uri);
    setLocalImageUri(uri);
  };

  const handleImageRemoved = () => {
    setDisplayImageUri(null);
    setLocalImageUri(null);
  };

  const [formData, setFormData] = useState({
    brand: moto?.brand || '',
    model: moto?.model || '',
    year: moto?.year?.toString() || new Date().getFullYear().toString(),
    plate: moto?.plate || '',
    color: moto?.color || '',
    engine_cc: moto?.engine_cc?.toString() || '',
    current_km: moto?.current_km?.toString() || '0',
    soat_expiry: moto?.soat_expiry || '',
    soat_policy_number: moto?.soat_policy_number || '',
    tecno_expiry: moto?.tecno_expiry || '',
    tecno_certificate: moto?.tecno_certificate || '',
  });


  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSoatDateChange = (event: any, selectedDate?: Date) => {
    setShowSoatPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('soat_expiry', formattedDate);
    }
  };

  const handleTecnoDateChange = (event: any, selectedDate?: Date) => {
    setShowTecnoPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('tecno_expiry', formattedDate);
    }
  };  

  React.useEffect(() => {
    if (moto?.brand && moto?.model) {
      insforge.database.rpc('check_global_manual_exists', {
        check_brand: moto.brand,
        check_model: moto.model
      }).then(({ data, error }) => {
        if (!error && data) setHasGlobalManual(true);
        else setHasGlobalManual(false);
      });
    }
  }, [moto?.brand, moto?.model]);

  const handleUploadManual = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];

      setIsUploadingManual(true);
      setErrorMsg('');

      // Upload to Storage
      const timestamp = new Date().getTime();
      const storageKey = `manuals/${moto?.id}_${timestamp}.pdf`;
      
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: 'application/pdf'
      } as any);

      const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/manuals/${storageKey}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Error subiendo el archivo al servidor.');
      }

      // Call Edge Function to process it
      const { data, error } = await insforge.functions.invoke('process-manual', {
        body: {
          storage_key: storageKey,
          motorcycle_id: moto?.id,
          filename: file.name
        }
      });

      if (error || (data && data.error)) {
        throw new Error(error?.message || data?.error || 'Error procesando el manual con IA.');
      }

      setHasGlobalManual(true);
      Alert.alert('¡Éxito!', 'Manual procesado e integrado exitosamente. Todos los usuarios de esta moto se beneficiarán.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocurrió un error inesperado al subir el manual.');
      Alert.alert('Error', err.message || 'Ocurrió un error inesperado al subir el manual.');
    } finally {
      setIsUploadingManual(false);
    }
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

    setIsLoading(true);
    setErrorMsg('');
    
    const motoData = {
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
      currentImageUrl: moto?.image_url,
    };

    const { error } = await updateMotorcycle(id as string, motoData);
    setIsLoading(false);

    if (error) {
      console.error("Supabase update error:", error);
      setErrorMsg(error.message || 'No se pudo actualizar la motocicleta.');
    } else {
      router.back();
    }
  };

  const executeDelete = async () => {
    setIsLoading(true);
    const { error } = await deleteMotorcycle(id as string);
    setIsLoading(false);
    if (error) {
      console.error("Supabase delete error:", error);
      if (Platform.OS === 'web') {
        window.alert(error.message || 'No se pudo eliminar la motocicleta.');
      } else {
        Alert.alert("Error", error.message || 'No se pudo eliminar la motocicleta.');
      }
    } else {
      router.back();
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar esta motocicleta? Esta acción no se puede deshacer.");
      if (confirmDelete) {
        executeDelete();
      }
    } else {
      Alert.alert(
        "Eliminar Moto",
        "¿Estás seguro de que quieres eliminar esta motocicleta? Esta acción no se puede deshacer.",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: executeDelete
          }
        ]
      );
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
          <MaterialIcons name="edit" size={24} color={Colores.primario} />
          <Text style={styles.headerTitle}>Editar Moto</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <MaterialIcons name="delete" size={24} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={24} color={Colores.blanco} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
        
        <ImagePickerSelector
          imageUri={displayImageUri}
          onImageSelected={handleImageSelected}
          onImageRemoved={handleImageRemoved}
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

        {/* Manual Inteligente Section */}
        <View style={[styles.section, { backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)', borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 16 }]}>
          <View style={[styles.sectionHeader, { marginBottom: 8 }]}>
            <MaterialIcons name="menu-book" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: '#3b82f6', marginBottom: 0 }]}>Manual Inteligente RAG</Text>
          </View>
          
          {hasGlobalManual === null ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : hasGlobalManual ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 8 }}>
              <MaterialIcons name="check-circle" size={20} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={{ color: '#10b981', flex: 1, fontSize: 13 }}>Manual activo. Tienes tips y alertas precisas para esta moto.</Text>
            </View>
          ) : (
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 12, lineHeight: 20 }}>
                Esta moto aún no tiene un manual oficial registrado. Sé el primero en subir el PDF y la IA lo procesará para toda la comunidad.
              </Text>
              <TouchableOpacity 
                style={[styles.iaButton, { backgroundColor: '#3b82f6' }]}
                onPress={handleUploadManual}
                disabled={isUploadingManual}
              >
                {isUploadingManual ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialIcons name="upload-file" size={20} color="#fff" />
                )}
                <Text style={[styles.iaButtonText, { color: '#fff' }]}>
                  {isUploadingManual ? "Procesando manual con IA..." : "Subir PDF del Manual"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
              <TouchableOpacity onPress={() => setShowSoatPicker(true)} activeOpacity={0.8}>
                <View pointerEvents="none">
                  <TextInput
                    style={styles.input}
                    placeholder="2027-10-12"
                    placeholderTextColor="rgba(255, 255, 255, 0.2)"
                    value={formData.soat_expiry}
                    editable={false}
                  />
                  <MaterialIcons name="calendar-today" size={20} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', right: 16, top: 14 }} />
                </View>
              </TouchableOpacity>
              {showSoatPicker && (
                <DateTimePicker
                  value={formData.soat_expiry ? new Date(formData.soat_expiry + 'T12:00:00Z') : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleSoatDateChange}
                />
              )}
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
              <TouchableOpacity onPress={() => setShowTecnoPicker(true)} activeOpacity={0.8}>
                <View pointerEvents="none">
                  <TextInput
                    style={styles.input}
                    placeholder="2027-06-05"
                    placeholderTextColor="rgba(255, 255, 255, 0.2)"
                    value={formData.tecno_expiry}
                    editable={false}
                  />
                  <MaterialIcons name="calendar-today" size={20} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', right: 16, top: 14 }} />
                </View>
              </TouchableOpacity>
              {showTecnoPicker && (
                <DateTimePicker
                  value={formData.tecno_expiry ? new Date(formData.tecno_expiry + 'T12:00:00Z') : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleTecnoDateChange}
                />
              )}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
