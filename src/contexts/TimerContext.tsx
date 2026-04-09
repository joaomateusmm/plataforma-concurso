"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

type TimerMode = "cronometro" | "temporizador" | "pomodoro" | "none";
type PomodoroPhase = "focus" | "break";

type TimerContextType = {
  activeTimerMode: TimerMode;
  stopwatchTime: number;
  isStopwatchRunning: boolean;
  toggleStopwatch: () => void;
  resetStopwatch: () => void;
  temporizadorTime: number;
  isTemporizadorRunning: boolean;
  isTemporizadorEditing: boolean;
  startTemporizador: (seconds?: number) => void;
  pauseTemporizador: () => void;
  resetTemporizador: () => void;
  setIsTemporizadorEditing: (val: boolean) => void;
  pomodoroTime: number;
  isPomodoroRunning: boolean;
  isPomodoroEditing: boolean;
  pomodoroPhase: PomodoroPhase;
  pomodoroCurrentCycle: number;
  pomodoroTotalCycles: number;
  startPomodoro: (
    focusSecs?: number,
    breakSecs?: number,
    cycles?: number,
  ) => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimerMode, setActiveTimerMode] = useState<TimerMode>(() => {
    if (typeof window !== "undefined")
      return (localStorage.getItem("activeTimerMode") as TimerMode) || "none";
    return "none";
  });

  useEffect(() => {
    localStorage.setItem("activeTimerMode", activeTimerMode);
  }, [activeTimerMode]);

  const playNotificationSound = (
    type: "focus" | "break" | "finish" | "ticktack",
  ) => {
    if (typeof window !== "undefined") {
      try {
        const audio = new Audio(`/sounds/${type}.mp3`);
        audio.play().catch((e) => {
          console.log("O navegador bloqueou o autoplay do áudio:", e);
        });
      } catch (error) {
        console.error("Erro ao reproduzir o som:", error);
      }
    }
  };

  // ==========================================
  // 1. CRONÓMETRO
  // ==========================================
  const [stopwatchTime, setStopwatchTime] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("stopwatchTime");
      if (saved) return parseInt(saved, 10);
    }
    return 0;
  });

  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("isStopwatchRunning") === "true";
    return false;
  });

  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem("stopwatchTime", stopwatchTime.toString());
  }, [stopwatchTime]);
  useEffect(() => {
    localStorage.setItem("isStopwatchRunning", isStopwatchRunning.toString());
  }, [isStopwatchRunning]);

  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchRef.current = setInterval(
        () => setStopwatchTime((prev) => prev + 1),
        1000,
      );
    } else if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, [isStopwatchRunning]);

  const toggleStopwatch = () => {
    setIsStopwatchRunning(!isStopwatchRunning);
    setActiveTimerMode("cronometro");
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
    localStorage.removeItem("stopwatchTime");
    localStorage.removeItem("isStopwatchRunning");
    setActiveTimerMode((prev) => (prev === "cronometro" ? "none" : prev));
  };

  // ==========================================
  // 2. TEMPORIZADOR
  // ==========================================
  const [temporizadorTime, setTemporizadorTime] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedEndTime = localStorage.getItem("temporizadorEndTime");
      if (savedEndTime) {
        const left = Math.ceil(
          (parseInt(savedEndTime, 10) - Date.now()) / 1000,
        );
        if (left > 0) return left;
      }
      const savedRemaining = localStorage.getItem("temporizadorRemaining");
      if (savedRemaining) return parseInt(savedRemaining, 10);
    }
    return 0;
  });

  const [isTemporizadorRunning, setIsTemporizadorRunning] = useState<boolean>(
    () => {
      if (typeof window !== "undefined") {
        const savedEndTime = localStorage.getItem("temporizadorEndTime");
        if (savedEndTime)
          return (
            Math.ceil((parseInt(savedEndTime, 10) - Date.now()) / 1000) > 0
          );
      }
      return false;
    },
  );

  const [isTemporizadorEditing, setIsTemporizadorEditing] = useState<boolean>(
    () => {
      if (typeof window !== "undefined") {
        if (
          localStorage.getItem("temporizadorEndTime") ||
          localStorage.getItem("temporizadorRemaining")
        )
          return false;
      }
      return true;
    },
  );

  const temporizadorRef = useRef<NodeJS.Timeout | null>(null);

  const resetTemporizador = useCallback(() => {
    setIsTemporizadorRunning(false);
    setIsTemporizadorEditing(true);
    setTemporizadorTime(0);
    localStorage.removeItem("temporizadorEndTime");
    localStorage.removeItem("temporizadorRemaining");
    setActiveTimerMode((prev) => (prev === "temporizador" ? "none" : prev));
  }, []);

  useEffect(() => {
    if (isTemporizadorRunning) {
      temporizadorRef.current = setInterval(() => {
        const savedEndTime = localStorage.getItem("temporizadorEndTime");
        if (savedEndTime) {
          const left = Math.ceil(
            (parseInt(savedEndTime, 10) - Date.now()) / 1000,
          );
          if (left === 3) playNotificationSound("ticktack");
          if (left <= 0) {
            resetTemporizador();
            playNotificationSound("finish");
          } else {
            setTemporizadorTime(left);
          }
        }
      }, 1000);
    } else if (temporizadorRef.current) clearInterval(temporizadorRef.current);
    return () => {
      if (temporizadorRef.current) clearInterval(temporizadorRef.current);
    };
  }, [isTemporizadorRunning, resetTemporizador]);

  const startTemporizador = (totalSeconds?: number) => {
    let total = temporizadorTime;
    if (totalSeconds !== undefined) total = totalSeconds;
    if (total <= 0) return;
    localStorage.setItem(
      "temporizadorEndTime",
      (Date.now() + total * 1000).toString(),
    );
    localStorage.removeItem("temporizadorRemaining");
    setTemporizadorTime(total);
    setIsTemporizadorRunning(true);
    setIsTemporizadorEditing(false);
    setActiveTimerMode("temporizador");
  };

  const pauseTemporizador = () => {
    setIsTemporizadorRunning(false);
    localStorage.setItem("temporizadorRemaining", temporizadorTime.toString());
    localStorage.removeItem("temporizadorEndTime");
  };

  // ==========================================
  // 3. POMODORO (CORRIGIDO PARA LER O STORAGE NO MOUNT)
  // ==========================================
  const [pomodoroTime, setPomodoroTime] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedEndTime = localStorage.getItem("pomoEndTime");
      if (savedEndTime) {
        const left = Math.ceil(
          (parseInt(savedEndTime, 10) - Date.now()) / 1000,
        );
        if (left > 0) return left;
      }
      const savedRemaining = localStorage.getItem("pomoRemaining");
      if (savedRemaining) return parseInt(savedRemaining, 10);
    }
    return 25 * 60;
  });

  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedEndTime = localStorage.getItem("pomoEndTime");
      if (savedEndTime)
        return Math.ceil((parseInt(savedEndTime, 10) - Date.now()) / 1000) > 0;
    }
    return false;
  });

  const [isPomodoroEditing, setIsPomodoroEditing] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      if (
        localStorage.getItem("pomoEndTime") ||
        localStorage.getItem("pomoRemaining")
      )
        return false;
    }
    return true;
  });

  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("pomodoroPhase") as PomodoroPhase) || "focus"
      );
    }
    return "focus";
  });

  const [pomodoroCurrentCycle, setPomodoroCurrentCycle] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("pomodoroCurrentCycle") || "1", 10);
    }
    return 1;
  });

  const [pomodoroTotalCycles, setPomodoroTotalCycles] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("pomoCyclesTotal") || "4", 10);
    }
    return 4;
  });

  const pomoRef = useRef<NodeJS.Timeout | null>(null);

  const resetPomodoro = useCallback(() => {
    setIsPomodoroRunning(false);
    setIsPomodoroEditing(true);
    setPomodoroPhase("focus");
    setPomodoroCurrentCycle(1);
    setPomodoroTime(25 * 60);
    localStorage.removeItem("pomoEndTime");
    localStorage.removeItem("pomoRemaining");
    localStorage.removeItem("pomodoroPhase");
    localStorage.removeItem("pomodoroCurrentCycle");
    setActiveTimerMode((prev) => (prev === "pomodoro" ? "none" : prev));
  }, []);

  useEffect(() => {
    if (isPomodoroRunning) {
      pomoRef.current = setInterval(() => {
        const savedEndTime = localStorage.getItem("pomoEndTime");
        if (savedEndTime) {
          const left = Math.ceil(
            (parseInt(savedEndTime, 10) - Date.now()) / 1000,
          );

          if (left === 3) playNotificationSound("ticktack");

          if (left <= 0) {
            const focusTotal = parseInt(
              localStorage.getItem("pomoFocusTotal") || "1500",
              10,
            );
            const breakTotal = parseInt(
              localStorage.getItem("pomoBreakTotal") || "300",
              10,
            );
            const totalCycles = parseInt(
              localStorage.getItem("pomoCyclesTotal") || "4",
              10,
            );

            if (pomodoroPhase === "focus") {
              setPomodoroPhase("break");
              setPomodoroTime(breakTotal);
              localStorage.setItem("pomodoroPhase", "break"); // Salva no storage para a outra aba saber!
              localStorage.setItem(
                "pomoEndTime",
                (Date.now() + breakTotal * 1000).toString(),
              );
              playNotificationSound("break");
            } else {
              if (pomodoroCurrentCycle >= totalCycles) {
                resetPomodoro();
                playNotificationSound("finish");
              } else {
                setPomodoroPhase("focus");
                setPomodoroCurrentCycle((prev) => {
                  const next = prev + 1;
                  localStorage.setItem("pomodoroCurrentCycle", next.toString());
                  return next;
                });
                setPomodoroTime(focusTotal);
                localStorage.setItem("pomodoroPhase", "focus");
                localStorage.setItem(
                  "pomoEndTime",
                  (Date.now() + focusTotal * 1000).toString(),
                );
                playNotificationSound("focus");
              }
            }
          } else {
            setPomodoroTime(left);
          }
        }
      }, 1000);
    } else if (pomoRef.current) clearInterval(pomoRef.current);
    return () => {
      if (pomoRef.current) clearInterval(pomoRef.current);
    };
  }, [isPomodoroRunning, pomodoroPhase, pomodoroCurrentCycle, resetPomodoro]);

  const startPomodoro = (
    focusSecs?: number,
    breakSecs?: number,
    cycles?: number,
  ) => {
    let total = pomodoroTime;
    if (focusSecs !== undefined) {
      total = focusSecs;
      localStorage.setItem("pomoFocusTotal", focusSecs.toString());
      localStorage.setItem("pomoBreakTotal", (breakSecs || 300).toString());
      localStorage.setItem("pomoCyclesTotal", (cycles || 4).toString());
      setPomodoroTotalCycles(cycles || 4);
    }
    if (total <= 0) return;

    localStorage.setItem("pomoEndTime", (Date.now() + total * 1000).toString());
    localStorage.setItem("pomodoroPhase", pomodoroPhase);
    localStorage.setItem(
      "pomodoroCurrentCycle",
      pomodoroCurrentCycle.toString(),
    );
    localStorage.removeItem("pomoRemaining");

    setPomodoroTime(total);
    setIsPomodoroRunning(true);
    setIsPomodoroEditing(false);
    setActiveTimerMode("pomodoro");
  };

  const pausePomodoro = () => {
    setIsPomodoroRunning(false);
    localStorage.setItem("pomoRemaining", pomodoroTime.toString());
    localStorage.removeItem("pomoEndTime");
  };

  return (
    <TimerContext.Provider
      value={{
        activeTimerMode,
        stopwatchTime,
        isStopwatchRunning,
        toggleStopwatch,
        resetStopwatch,
        temporizadorTime,
        isTemporizadorRunning,
        isTemporizadorEditing,
        startTemporizador,
        pauseTemporizador,
        resetTemporizador,
        setIsTemporizadorEditing,
        pomodoroTime,
        isPomodoroRunning,
        isPomodoroEditing,
        pomodoroPhase,
        pomodoroCurrentCycle,
        pomodoroTotalCycles,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context)
    throw new Error("useTimer deve ser usado dentro de um TimerProvider");
  return context;
}
