import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useGame } from "../context/GameContext";

export default function ScoreBoard() {
  const { score, streak, totalCorrect, totalWrong, activePlayer, deckNumber, deckProgress } = useGame();

  const scoreAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scoreAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.timing(scoreAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }, [score]);

  const accuracy =
    totalCorrect + totalWrong > 0
      ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
      : 0;

  const { shown = 0, total = 0 } = deckProgress || {};

  return (
    <View style={styles.container}>
      {/* Player name */}
      <Text style={styles.playerName}>
        👤 {activePlayer?.name ?? "Jugador"}
      </Text>

      {/* Score */}
      <View style={styles.row}>
        <Animated.Text
          style={[styles.score, { transform: [{ scale: scoreAnim }] }]}
        >
          {score}
        </Animated.Text>
        <Text style={styles.pts}>pts</Text>
      </View>

      {/* Deck progress */}
      {total > 0 && (
        <View style={styles.deckRow}>
          <Text style={styles.deckText}>
            🃏 Vuelta {deckNumber} · Bandera {shown} de {total}
          </Text>
          <View style={styles.deckTrack}>
            <View style={[styles.deckBar, { width: `${(shown / total) * 100}%` }]} />
          </View>
        </View>
      )}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatPill emoji="✅" value={totalCorrect} label="correctas" color="#4ade80" />
        <StatPill emoji="❌" value={totalWrong} label="fallidas" color="#f87171" />
        <StatPill emoji="🎯" value={`${accuracy}%`} label="precisión" color="#facc15" />
        {streak >= 2 && (
          <StatPill emoji="🔥" value={streak} label="racha" color="#fb923c" />
        )}
      </View>
    </View>
  );
}

function StatPill({ emoji, value, label, color }) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillValue, { color }]}>
        {emoji} {value}
      </Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playerName: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  score: {
    fontSize: 48,
    fontWeight: "900",
    color: "#f8fafc",
  },
  pts: {
    fontSize: 18,
    color: "#64748b",
    marginBottom: 8,
    marginLeft: 4,
  },
  deckRow: {
    width: "100%",
    marginBottom: 6,
    alignItems: "center",
  },
  deckText: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
  },
  deckTrack: {
    width: "90%",
    height: 5,
    backgroundColor: "#0f172a",
    borderRadius: 3,
    overflow: "hidden",
  },
  deckBar: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  pill: {
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  pillLabel: {
    fontSize: 10,
    color: "#64748b",
  },
});
