import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGame } from "../context/GameContext";

export default function GuessForm() {
  const {
    guess,
    nextCountry,
    resetScore,
    useHint,
    getRevealedHints,
    options,
    lastResult,
    roundOver,
    currentCountry,
    loading,
  } = useGame();

  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState("multiple"); // "multiple" | "text"
  const [selectedOption, setSelectedOption] = useState(null);

  const feedbackAnim = useRef(new Animated.Value(0)).current;

  // Reset input on new country
  useEffect(() => {
    setInputValue("");
    setSelectedOption(null);
  }, [currentCountry]);

  // Animate feedback banner
  useEffect(() => {
    if (lastResult) {
      feedbackAnim.setValue(0);
      Animated.timing(feedbackAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [lastResult]);

  function handleOptionPress(countryName) {
    if (roundOver) return;
    setSelectedOption(countryName);
    guess(countryName);
  }

  function handleTextGuess() {
    if (!inputValue.trim() || roundOver) return;
    guess(inputValue.trim());
  }

  const hints = getRevealedHints();

  if (loading || !currentCountry) return null;

  const feedbackConfig = {
    correct: { bg: "#166534", text: "#4ade80", msg: "🎉 ¡Correcto! +10 pts" },
    wrong: { bg: "#7f1d1d", text: "#f87171", msg: "❌ Incorrecto -1 pt" },
    timeout: { bg: "#7c2d12", text: "#fdba74", msg: "⏰ ¡Tiempo! -1 pt" },
  };
  const fb = feedbackConfig[lastResult];

  return (
    <View style={styles.container}>
      {/* Mode toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === "multiple" && styles.toggleActive]}
          onPress={() => setMode("multiple")}
        >
          <Text style={[styles.toggleText, mode === "multiple" && styles.toggleActiveText]}>
            Opciones
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === "text" && styles.toggleActive]}
          onPress={() => setMode("text")}
        >
          <Text style={[styles.toggleText, mode === "text" && styles.toggleActiveText]}>
            Escribir
          </Text>
        </TouchableOpacity>
      </View>

      {/* Feedback banner */}
      {lastResult && (
        <Animated.View
          style={[
            styles.feedback,
            { backgroundColor: fb.bg, opacity: feedbackAnim },
          ]}
        >
          <Text style={[styles.feedbackText, { color: fb.text }]}>
            {fb.msg}
          </Text>
          {(lastResult === "wrong" || lastResult === "timeout") && (
            <Text style={styles.correctAnswer}>
              Era: {currentCountry.name}
            </Text>
          )}
        </Animated.View>
      )}

      {/* Hints revealed */}
      {hints.length > 0 && (
        <View style={styles.hintsBox}>
          {hints.map((h, i) => (
            <Text key={i} style={styles.hintText}>
              💡 {h}
            </Text>
          ))}
        </View>
      )}

      {/* Multiple choice */}
      {mode === "multiple" && (
        <View style={styles.optionsGrid}>
          {options.map((country) => {
            const isSelected = selectedOption === country.name;
            const isCorrectAnswer =
              roundOver && country.name === currentCountry.name;
            const isWrongSelected =
              roundOver && isSelected && country.name !== currentCountry.name;

            let btnStyle = styles.optionBtn;
            if (isCorrectAnswer)
              btnStyle = { ...styles.optionBtn, ...styles.optionCorrect };
            else if (isWrongSelected)
              btnStyle = { ...styles.optionBtn, ...styles.optionWrong };

            return (
              <TouchableOpacity
                key={country.name}
                style={btnStyle}
                onPress={() => handleOptionPress(country.name)}
                disabled={roundOver}
                activeOpacity={0.75}
              >
                <Text style={styles.optionText} numberOfLines={2}>
                  {country.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Free text */}
      {mode === "text" && !roundOver && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Escribí el país..."
            placeholderTextColor="#475569"
            onSubmitEditing={handleTextGuess}
            returnKeyType="send"
            autoCapitalize="words"
            editable={!roundOver}
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleTextGuess}
            disabled={!inputValue.trim()}
          >
            <Text style={styles.sendBtnText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        {!roundOver ? (
          <TouchableOpacity style={styles.hintBtn} onPress={useHint}>
            <Text style={styles.hintBtnText}>💡 Pista (-2 pts)</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={nextCountry}>
            <Text style={styles.nextBtnText}>Siguiente →</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.resetBtn} onPress={resetScore}>
          <Text style={styles.resetBtnText}>↺ Reiniciar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#334155",
  },
  toggleText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
  toggleActiveText: {
    color: "#f8fafc",
  },
  feedback: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "800",
  },
  correctAnswer: {
    color: "#fde68a",
    fontSize: 13,
    marginTop: 4,
  },
  hintsBox: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    gap: 4,
  },
  hintText: {
    color: "#fbbf24",
    fontSize: 13,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  optionBtn: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#334155",
  },
  optionCorrect: {
    backgroundColor: "#14532d",
    borderColor: "#4ade80",
  },
  optionWrong: {
    backgroundColor: "#450a0a",
    borderColor: "#f87171",
  },
  optionText: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#334155",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#f8fafc",
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  hintBtn: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  hintBtnText: {
    color: "#f59e0b",
    fontWeight: "700",
    fontSize: 13,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: "#6366f1",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  nextBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  resetBtn: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#475569",
  },
  resetBtnText: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 13,
  },
});
