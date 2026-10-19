import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useGame } from "../context/GameContext";

export default function Timer() {
  const { timeLeft, maxTime, roundOver } = useGame();

  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef(null);

  // Animate bar smoothly
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: timeLeft / maxTime,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  // Pulse when time is low
  useEffect(() => {
    if (timeLeft <= 10 && !roundOver) {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 300, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ])
      );
      pulseRef.current.start();
    } else {
      pulseRef.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => pulseRef.current?.stop();
  }, [timeLeft <= 10, roundOver]);

  const ratio = timeLeft / maxTime;
  const barColor =
    ratio > 0.5 ? "#4ade80" : ratio > 0.25 ? "#facc15" : "#ef4444";

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>⏱ TIEMPO</Text>
        <Animated.Text
          style={[
            styles.timeText,
            { color: barColor, transform: [{ scale: pulseAnim }] },
          ]}
        >
          {timeLeft}s
        </Animated.Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[styles.bar, { width: barWidth, backgroundColor: barColor }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "900",
  },
  track: {
    height: 8,
    backgroundColor: "#0f172a",
    borderRadius: 4,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 4,
  },
});
