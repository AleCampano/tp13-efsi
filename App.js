import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import Flag from "./src/components/Flag";
import GuessForm from "./src/components/GuessForm";
import Leaderboard from "./src/components/Leaderboard";
import ScoreBoard from "./src/components/ScoreBoard";
import Timer from "./src/components/Timer";
import { GameProvider } from "./src/context/GameContext";

export default function App() {
  return (
    <GameProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🌍 Fun With Flags</Text>
            <Text style={styles.subtitle}>¿Conocés todas las banderas?</Text>
          </View>

          {/* Score always visible */}
          <ScoreBoard />

          {/* Timer */}
          <Timer />

          {/* Flag image */}
          <Flag />

          {/* Guess input / options */}
          <GuessForm />

          {/* Leaderboard (expandible) */}
          <Leaderboard />

          <View style={styles.footer} />
        </ScrollView>
      </SafeAreaView>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  footer: {
    height: 20,
  },
});
