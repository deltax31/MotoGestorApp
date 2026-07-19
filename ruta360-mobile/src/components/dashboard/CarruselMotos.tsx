import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colores, UI } from '@/constants/colores';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.92;
const CARD_HEIGHT = CARD_WIDTH * (10/16); // Aspect ratio 16:10 for a taller card

export interface CarruselMotosItem {
  id: string;
  name: string;
  plate: string;
  km: number;
  image: string;
}

interface CarruselMotosProps {
  bikes: CarruselMotosItem[];
  activeId?: string | null;
  onActiveItemChange?: (id: string) => void;
}

export function CarruselMotos({ bikes, activeId, onActiveItemChange }: CarruselMotosProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isMounting, setIsMounting] = useState(true);
  const router = useRouter();

  // Sincronizar el scroll inicial con la moto activa
  useEffect(() => {
    if (isMounting && activeId && scrollViewRef.current && bikes.length > 0) {
      const index = bikes.findIndex(b => b.id === activeId);
      if (index > 0) {
        // Pequeño timeout para asegurar que el ScrollView ya renderizó
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: index * (CARD_WIDTH + 16),
            animated: false,
          });
        }, 100);
      }
      setIsMounting(false);
    }
  }, [activeId, bikes, isMounting]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + 16));
    const currentBike = bikes[index];
    
    // Evitar actualizaciones innecesarias o en el montaje
    if (currentBike && currentBike.id !== activeId && onActiveItemChange) {
      onActiveItemChange(currentBike.id);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {bikes.map((bike) => (
          <TouchableOpacity 
            key={bike.id} 
            style={styles.cardContainer}
            activeOpacity={0.9}
            onPress={() => {
              if (bike.id === 'empty-state') {
                router.push('/(tabs)/garaje/register');
              }
            }}
          >
            <ImageBackground source={{ uri: bike.image }} style={styles.cardImage} imageStyle={{ borderRadius: 16 }}>
              <LinearGradient
                colors={['transparent', 'rgba(10, 15, 26, 0.8)', Colores.fondoPrincipal]}
                style={styles.gradient}
              />
              <View style={styles.cardContent}>
                <View>
                  <Text style={styles.bikeName}>{bike.name}</Text>
                  <Text style={styles.bikeType}>{bike.plate}</Text>
                </View>
                {bike.id !== 'empty-state' && (
                  <View style={styles.statusContainer}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>ACTIVA</Text>
                    </View>
                    <Text style={styles.mileage}>
                      {bike.km} <Text style={styles.km}>KM</Text>
                    </Text>
                  </View>
                )}
                {bike.id === 'empty-state' && (
                  <View style={styles.statusContainer}>
                    <View style={[styles.badge, { backgroundColor: Colores.primario }]}>
                      <Text style={[styles.badgeText, { color: Colores.fondoPrincipal }]}>AGREGAR</Text>
                    </View>
                  </View>
                )}
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
    gap: 16,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradient: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bikeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colores.blanco,
    letterSpacing: -0.5,
  },
  bikeType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  badge: {
    backgroundColor: 'rgba(0, 200, 212, 0.2)',
    borderColor: 'rgba(0, 200, 212, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: Colores.primario,
    fontSize: 10,
    fontWeight: 'bold',
  },
  mileage: {
    fontSize: 20,
    fontWeight: '900',
    color: Colores.blanco,
  },
  km: {
    fontSize: 12,
    fontWeight: 'normal',
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
