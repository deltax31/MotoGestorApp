import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface Props {
  imageUri?: string | null;
  onImageSelected: (uri: string) => void;
  onImageRemoved?: () => void;
  size?: number;
}

export function ImagePickerSelector({ imageUri, onImageSelected, onImageRemoved, size = 120 }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const processImage = async (uri: string) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      onImageSelected(manipResult.uri);
    } catch (error) {
      console.error('Error compressing image:', error);
      Alert.alert('Error', 'Hubo un problema procesando la imagen.');
    } finally {
      setModalVisible(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para tomar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería para seleccionar fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  const handleRemove = () => {
    if (onImageRemoved) {
      onImageRemoved();
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.imageContainer, { width: size, height: size, borderRadius: size / 2 }]} 
        onPress={() => setModalVisible(true)}
      >
        {imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} 
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <Ionicons name="camera" size={size * 0.4} color="#8E8E93" />
            <Text style={styles.placeholderText}>Añadir Foto</Text>
          </View>
        )}
        
        {imageUri && (
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={16} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Imagen</Text>
            
            <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color="#2C5364" />
              <Text style={styles.optionText}>Tomar una foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color="#2C5364" />
              <Text style={styles.optionText}>Elegir de la galería</Text>
            </TouchableOpacity>

            {imageUri && onImageRemoved && (
              <TouchableOpacity style={[styles.optionButton, styles.optionRemove]} onPress={handleRemove}>
                <Ionicons name="trash-outline" size={24} color="#E74C3C" />
                <Text style={[styles.optionText, { color: '#E74C3C' }]}>Eliminar foto actual</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E2D9',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    backgroundColor: '#E8E2D9',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C7C7CC',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 8,
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF5733',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5F0E8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F5F0E8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A3A4A',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionRemove: {
    backgroundColor: '#FDEDEC',
  },
  optionText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#1A3A4A',
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
});
