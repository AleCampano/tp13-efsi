import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const API_URL = "https://countriesnow.space/api/v0.1/countries/flag/images";

// ─── TIMER CONFIG ───────────────────────────────────────────────
const ROUND_SECONDS = 30;
const POINTS_CORRECT = 10;
const POINTS_WRONG = -1;
const OPTIONS_COUNT = 4; // multiple-choice options shown per round

// ─── CONTEXT ────────────────────────────────────────────────────
export const GameContext = createContext(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}

// ─── HELPERS ────────────────────────────────────────────────────

/** Fisher-Yates shuffle — returns a NEW shuffled array */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildOptions(countries, correct) {
  const opts = new Set([correct]);
  while (opts.size < Math.min(OPTIONS_COUNT, countries.length)) {
    opts.add(pickRandom(countries));
  }
  // shuffle
  return [...opts].sort(() => Math.random() - 0.5);
}

function buildHints(country) {
  // We derive hints purely from the data we have (name + iso codes + flag url)
  const name = country.name;
  const iso2 = country.iso2 || "";
  const iso3 = country.iso3 || "";
  return [
    `Esta bandera tiene 2 letras ISO: "${iso2}"`,
    `El código ISO de 3 letras es "${iso3}"`,
    `El nombre empieza con "${name[0]}" y tiene ${name.length} letras`,
    `El nombre completo es: "${name}"`,
  ];
}

// ─── PROVIDER ───────────────────────────────────────────────────
export function GameProvider({ children }) {
  // ── raw data ──
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── deck: baraja sin repetición ──
  // deckRef guarda los países que aún no se mostraron en esta vuelta
  const deckRef = useRef([]);
  const [deckNumber, setDeckNumber] = useState(1);   // N° de vuelta (1, 2, 3…)
  const [deckProgress, setDeckProgress] = useState({ shown: 0, total: 0 });

  // ── round ──
  const [currentCountry, setCurrentCountry] = useState(null);
  const [options, setOptions] = useState([]);
  const [hintIndex, setHintIndex] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [lastResult, setLastResult] = useState(null); // "correct" | "wrong" | null
  const [roundOver, setRoundOver] = useState(false);

  // ── score ──
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // ── timer ──
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const timerRef = useRef(null);

  // ── leaderboard ──
  const [players, setPlayers] = useState([
    { id: 1, name: "Jugador 1", score: 0, active: true },
  ]);
  const [activePlayerId, setActivePlayerId] = useState(1);

  // ── stats ──
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);

  // ────────────────────────────────────────────────────────────────
  // Fetch countries on mount → inicializa la baraja
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        if (json.error) throw new Error(json.msg);
        const data = json.data;
        setCountries(data);

        // Mezclar y arrancar la primera baraja
        const deck = shuffle(data);
        deckRef.current = deck;
        setDeckNumber(1);
        setDeckProgress({ shown: 1, total: data.length });

        const chosen = deck[0];
        setCurrentCountry(chosen);
        setOptions(buildOptions(data, chosen));
      } catch (e) {
        setError(e.message || "Error al cargar países");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ────────────────────────────────────────────────────────────────
  // Timer: start/reset whenever currentCountry changes
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentCountry || loading) return;
    setTimeLeft(ROUND_SECONDS);
    setRoundOver(false);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Time's up → treat as wrong
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCountry]);

  // ────────────────────────────────────────────────────────────────
  // Internal helpers
  // ────────────────────────────────────────────────────────────────
  function handleTimeout() {
    clearInterval(timerRef.current);
    setRoundOver(true);
    setLastResult("timeout");
    setStreak(0);
    addPoints(POINTS_WRONG);
    setTotalWrong((p) => p + 1);
  }

  function addPoints(delta) {
    setScore((prev) => Math.max(0, prev + delta));
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === activePlayerId
          ? { ...p, score: Math.max(0, p.score + delta) }
          : p
      )
    );
  }

  // ────────────────────────────────────────────────────────────────
  // Public API
  // ────────────────────────────────────────────────────────────────

  /** Player submits a guess (country name string) */
  function guess(countryName) {
    if (roundOver || !currentCountry) return;

    const correct =
      countryName.trim().toLowerCase() ===
      currentCountry.name.trim().toLowerCase();

    clearInterval(timerRef.current);
    setRoundOver(true);

    if (correct) {
      const bonus = hintsUsed > 0 ? 0 : 0; // no deduction here, hints cost points when used
      addPoints(POINTS_CORRECT + bonus);
      setStreak((p) => p + 1);
      setLastResult("correct");
      setTotalCorrect((p) => p + 1);
    } else {
      addPoints(POINTS_WRONG);
      setStreak(0);
      setLastResult("wrong");
      setTotalWrong((p) => p + 1);
    }
  }

  /** Avanza al siguiente país de la baraja (sin repeticiones) */
  function nextCountry() {
    if (countries.length === 0) return;

    // Sacamos el primero que ya se mostró
    deckRef.current.shift();

    // Si la baraja se vació → nueva vuelta mezclada
    if (deckRef.current.length === 0) {
      const newDeck = shuffle(countries);
      deckRef.current = newDeck;
      setDeckNumber((p) => p + 1);
      setDeckProgress({ shown: 1, total: countries.length });
    } else {
      setDeckProgress((p) => ({ ...p, shown: p.total - deckRef.current.length + 1 }));
    }

    const chosen = deckRef.current[0];
    setCurrentCountry(chosen);
    setOptions(buildOptions(countries, chosen));
    setHintIndex(0);
    setHintsUsed(0);
    setLastResult(null);
    setRoundOver(false);
  }

  /** Reset score (current player) — reinicia la baraja también */
  function resetScore() {
    setScore(0);
    setStreak(0);
    setTotalCorrect(0);
    setTotalWrong(0);
    setPlayers((prev) =>
      prev.map((p) => (p.id === activePlayerId ? { ...p, score: 0 } : p))
    );

    // Reiniciar baraja desde cero
    const newDeck = shuffle(countries);
    deckRef.current = newDeck;
    setDeckNumber(1);
    setDeckProgress({ shown: 1, total: countries.length });

    const chosen = newDeck[0];
    setCurrentCountry(chosen);
    setOptions(buildOptions(countries, chosen));
    setHintIndex(0);
    setHintsUsed(0);
    setLastResult(null);
    setRoundOver(false);
  }

  /** Reveal next hint (costs 2 pts) */
  function useHint() {
    if (!currentCountry || roundOver) return;
    const hints = buildHints(currentCountry);
    if (hintIndex >= hints.length) return;
    setHintIndex((p) => p + 1);
    setHintsUsed((p) => p + 1);
    addPoints(-2);
  }

  /** Get current hints list (only revealed ones) */
  function getRevealedHints() {
    if (!currentCountry) return [];
    return buildHints(currentCountry).slice(0, hintIndex);
  }

  /** Add a new player to leaderboard */
  function addPlayer(name) {
    const newId = Date.now();
    setPlayers((prev) => [
      ...prev,
      { id: newId, name, score: 0, active: false },
    ]);
  }

  /** Switch active player — reinicia baraja para el nuevo jugador */
  function switchPlayer(id) {
    setActivePlayerId(id);
    const p = players.find((x) => x.id === id);
    if (p) setScore(p.score);
    setStreak(0);
    setTotalCorrect(0);
    setTotalWrong(0);

    const newDeck = shuffle(countries);
    deckRef.current = newDeck;
    setDeckNumber(1);
    setDeckProgress({ shown: 1, total: countries.length });

    const chosen = newDeck[0];
    setCurrentCountry(chosen);
    setOptions(buildOptions(countries, chosen));
    setHintIndex(0);
    setHintsUsed(0);
    setLastResult(null);
    setRoundOver(false);
  }

  /** Sorted leaderboard */
  const sortedLeaderboard = [...players].sort((a, b) => b.score - a.score);

  const activePlayer = players.find((p) => p.id === activePlayerId);

  return (
    <GameContext.Provider
      value={{
        // data
        countries,
        currentCountry,
        options,
        loading,
        error,
        // deck progress
        deckNumber,
        deckProgress,
        // round
        lastResult,
        roundOver,
        hintsUsed,
        // score
        score,
        streak,
        totalCorrect,
        totalWrong,
        // timer
        timeLeft,
        maxTime: ROUND_SECONDS,
        // leaderboard
        players,
        sortedLeaderboard,
        activePlayer,
        activePlayerId,
        // actions
        guess,
        nextCountry,
        resetScore,
        useHint,
        getRevealedHints,
        addPlayer,
        switchPlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
