import { insforge } from './client';
import * as FileSystem from 'expo-file-system/legacy';

import { Platform } from 'react-native';

/**
 * Obtiene los headers de autenticación del cliente InsForge.
 * El client expone `this.http` como HttpClient con método getHeaders()
 */
function getAuthHeaders(): Record<string, string> {
  const client = insforge as any;
  
  // El SDK expone client.http como HttpClient con getHeaders()
  if (client.http?.getHeaders) {
    return client.http.getHeaders();
  }
  
  // Fallback: construir headers manualmente
  const anonKey = process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY || '';
  return {
    'Authorization': `Bearer ${anonKey}`,
  };
}

/**
 * Obtiene la URL base del proyecto InsForge
 */
function getBaseUrl(): string {
  return process.env.EXPO_PUBLIC_INSFORGE_URL || 'https://qy4t6j33.us-east.insforge.app';
}

export const storageService = {
  /**
   * Sube una imagen al bucket de vehículos en InsForge.
   * 
   * IMPORTANTE: No usamos el SDK para upload porque internamente hace:
   *   1. FormData.append("file", blob) — esto NO funciona en React Native
   *   2. React Native requiere { uri, name, type } para FormData con archivos
   * 
   * En su lugar, llamamos directamente a la API REST de InsForge Storage.
   */
  async subirImagenVehiculo(localUri: string, usuarioId: string, vehiculoId: string): Promise<string> {
    try {
      const baseUrl = getBaseUrl();
      const bucketName = 'vehiculos-imagenes';
      
      let fileSize = 0;
      let webBlob: Blob | undefined;
      
      if (Platform.OS === 'web') {
        const response = await fetch(localUri);
        webBlob = await response.blob();
        fileSize = webBlob.size;
      } else {
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        fileSize = fileInfo.exists ? fileInfo.size : 0;
      }

      // 2. Generar nombre único para el archivo
      const timestamp = new Date().getTime();
      const fileName = `usuarios/${usuarioId}/${vehiculoId}_${timestamp}.jpg`;
      const encodedFileName = encodeURIComponent(fileName);

      // 3. Pedir la estrategia de upload al backend
      const headers = getAuthHeaders();
      
      const strategyRes = await fetch(
        `${baseUrl}/api/storage/buckets/${bucketName}/upload-strategy`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: fileName,
            contentType: 'image/jpeg',
            size: fileSize,
          }),
        }
      );

      if (!strategyRes.ok) {
        const errText = await strategyRes.text();
        throw new Error(`Error al obtener estrategia de upload: ${strategyRes.status} - ${errText}`);
      }

      const strategy = await strategyRes.json();

      // 4. Crear FormData con formato nativo de React Native
      const formData = new FormData();
      
      if (strategy.method === 'presigned') {
        if (strategy.fields) {
          Object.entries(strategy.fields).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
        }
        
        if (Platform.OS === 'web' && webBlob) {
          formData.append('file', webBlob, fileName);
        } else {
          formData.append('file', {
            uri: localUri,
            name: fileName,
            type: 'image/jpeg',
          } as any);
        }

        const uploadRes = await fetch(strategy.uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`Error en presigned upload: ${uploadRes.status} - ${errText}`);
        }

        if (strategy.confirmRequired && strategy.confirmUrl) {
          const confirmUrl = strategy.confirmUrl.startsWith('http') 
            ? strategy.confirmUrl 
            : `${baseUrl}${strategy.confirmUrl}`;
            
          const confirmRes = await fetch(confirmUrl, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              size: fileSize,
              contentType: 'image/jpeg',
            }),
          });

          if (!confirmRes.ok) {
            const errText = await confirmRes.text();
            throw new Error(`Error en confirmación de upload: ${confirmRes.status} - ${errText}`);
          }
        }

      } else if (strategy.method === 'direct') {
        if (Platform.OS === 'web' && webBlob) {
          formData.append('file', webBlob, fileName);
        } else {
          formData.append('file', {
            uri: localUri,
            name: fileName,
            type: 'image/jpeg',
          } as any);
        }

        const uploadRes = await fetch(
          `${baseUrl}/api/storage/buckets/${bucketName}/objects/${encodedFileName}`,
          {
            method: 'PUT',
            headers: {
              ...headers,
            },
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`Error en direct upload: ${uploadRes.status} - ${errText}`);
        }
      } else {
        throw new Error(`Método de upload no soportado: ${strategy.method}`);
      }

      // 4. Construir URL pública del archivo subido
      //    Usamos el key que nos devolvió la estrategia o el fileName original
      const fileKey = strategy.key || fileName;
      const { data: publicUrlData } = insforge.storage
        .from(bucketName)
        .getPublicUrl(fileKey);

      return publicUrlData?.publicUrl || '';

    } catch (error: any) {
      console.error('Error en subirImagenVehiculo:', error);
      throw new Error(`No se pudo subir la imagen al bucket: ${error.message}`);
    }
  },

  /**
   * Elimina una imagen del bucket de vehículos
   * @param fotoUrl La URL completa de la imagen
   */
  async eliminarImagenVehiculo(fotoUrl: string): Promise<void> {
    if (!fotoUrl || !fotoUrl.includes('/usuarios/')) {
      // Si no es una imagen subida por el usuario (ej. default), no la eliminamos
      return;
    }

    try {
      // Extraer el path relativo dentro del bucket desde la URL pública
      const basePath = 'vehiculos-imagenes/';
      const index = fotoUrl.indexOf(basePath);
      
      if (index === -1) return;

      const relativePath = fotoUrl.substring(index + basePath.length);

      const { error } = await insforge.storage
        .from('vehiculos-imagenes')
        .remove(relativePath);

      if (error) {
        console.error('Error eliminando imagen del storage:', error);
      }
    } catch (error) {
      console.error('Error en eliminarImagenVehiculo:', error);
    }
  }
};
