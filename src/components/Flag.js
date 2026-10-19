import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useGame } from "../context/GameContext";

export default function Flag() {
  const { currentCountry, loading, error, lastResult } = useGame();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Fade + scale in whenever the country changes
  useEffect(() => {
    if (!currentCountry) return;
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.85);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentCountry]);

  // Shake on wrong answer
  useEffect(() => {
    if (lastResult === "wrong" || lastResult === "timeout") {
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [lastResult]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando banderas…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  if (!currentCountry) return null;

  const borderColor =
    lastResult === "correct"
      ? "#4ade80"
      : lastResult === "wrong" || lastResult === "timeout"
      ? "#f87171"
      : "#334155";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
          borderColor,
        },
      ]}
    >
      <Text style={styles.question}>¿De qué país es esta bandera?</Text>
      <Image
        source={{ uri: currentCountry.flag }}
        style={styles.flag}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#334155",
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  question: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  flag: {
    width: 260,
    height: 160,
    borderRadius: 8,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 16,
  },
  errorText: {
    color: "#f87171",
    fontSize: 14,
    textAlign: "center",
  },
});
