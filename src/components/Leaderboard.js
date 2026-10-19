import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGame } from "../context/GameContext";

export default function Leaderboard() {
  const { sortedLeaderboard, activePlayerId, addPlayer, switchPlayer } =
    useGame();

  const [expanded, setExpanded] = useState(false);
  const [newName, setNewName] = useState("");

  function handleAddPlayer() {
    const name = newName.trim();
    if (!name) return;
    if (name.length > 20) {
      Alert.alert("Nombre muy largo", "Máximo 20 caracteres");
      return;
    }
    addPlayer(name);
    setNewName("");
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((p) => !p)}
        activeOpacity={0.8}
      >
        <Text style={styles.title}>🏆 Tabla de jugadores</Text>
        <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {expanded && (
        <>
          {/* Player rows */}
          <ScrollView
            style={styles.list}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {sortedLeaderboard.map((player, index) => {
              const isActive = player.id === activePlayerId;
              return (
                <TouchableOpacity
                  key={player.id}
                  style={[styles.row, isActive && styles.activeRow]}
                  onPress={() => switchPlayer(player.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.medal}>
                    {medals[index] ?? `#${index + 1}`}
                  </Text>
                  <Text
                    style={[styles.playerName, isActive && styles.activeName]}
                    numberOfLines={1}
                  >
                    {player.name}
                    {isActive ? " ← tú" : ""}
                  </Text>
                  <Text style={styles.playerScore}>{player.score} pts</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Add player */}
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Nombre del jugador..."
              placeholderTextColor="#475569"
              maxLength={20}
              returnKeyType="done"
              onSubmitEditing={handleAddPlayer}
            />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAddPlayer}
              disabled={!newName.trim()}
            >
              <Text style={styles.addBtnText}>+ Agregar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Toca un jugador para cambiar el turno activo
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  title: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
  },
  chevron: {
    color: "#64748b",
    fontSize: 12,
  },
  list: {
    maxHeight: 200,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: "#0f172a",
  },
  activeRow: {
    backgroundColor: "#1e3a5f",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  medal: {
    fontSize: 18,
    width: 30,
  },
  playerName: {
    flex: 1,
    color: "#cbd5e1",
    fontSize: 14,
  },
  activeName: {
    color: "#93c5fd",
    fontWeight: "700",
  },
  playerScore: {
    color: "#facc15",
    fontWeight: "800",
    fontSize: 14,
    minWidth: 60,
    textAlign: "right",
  },
  addRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    paddingTop: 4,
  },
  input: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#f8fafc",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  addBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  hint: {
    color: "#475569",
    fontSize: 11,
    textAlign: "center",
    paddingBottom: 10,
  },
});
