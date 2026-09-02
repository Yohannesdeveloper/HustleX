import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SplashScreen: React.FC<{ onAnimationComplete: () => void }> = ({ onAnimationComplete }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));

  useEffect(() => {
    // Animate the star logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Wait 5 seconds then trigger completion
    const timer = setTimeout(() => {
      // Fade out animation before transitioning
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete();
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onAnimationComplete]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Ionicons name="star" size={100} color="#06b6d4" />
        <Text style={styles.title}>HustleX</Text>
        <Text style={styles.subtitle}>Find Your Perfect Match</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  logoContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
    fontFamily: 'System',
  },
});

export default SplashScreen;