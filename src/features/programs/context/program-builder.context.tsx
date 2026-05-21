"use client";

import { createContext, useContext, useReducer, type Dispatch } from "react";
import type {
  ProgramBuilderState,
  ProgramBuilderDay,
  ProgramBuilderSession,
  ProgramBuilderExercise,
  SplitType,
  SessionOrderingLogic,
  DurationType,
} from "@/features/programs/types";
import { DAY_FULL_NAMES } from "@/features/programs/types";

function makeDefaultDays(): ProgramBuilderDay[] {
  return DAY_FULL_NAMES.map((_, i) => ({
    dayNumber: i + 1,
    name: "",
    sessions: [makeDefaultSession()],
    visibility: "public" as const,
  }));
}

function makeDefaultSession(): ProgramBuilderSession {
  return { tempId: crypto.randomUUID(), name: "Morning", exercises: [], visibility: "public" };
}

export const INITIAL_STATE: ProgramBuilderState = {
  name: "",
  visibility: "public",
  description: "",
  split_type: "ppl",
  session_ordering_logic: "sequential",
  duration_type: "finite",
  duration_weeks: 8,
  version_visibility: "public",
  days: [],
};

type Action =
  | { type: "SET_NAME"; value: string }
  | { type: "SET_VISIBILITY"; value: "public" | "private" }
  | { type: "SET_DESCRIPTION"; value: string }
  | { type: "SET_SPLIT_TYPE"; value: SplitType }
  | { type: "SET_SESSION_ORDERING"; value: SessionOrderingLogic }
  | { type: "SET_DURATION_TYPE"; value: DurationType }
  | { type: "SET_DURATION_WEEKS"; value: number }
  | { type: "SET_VERSION_VISIBILITY"; value: "public" | "private" }
  | { type: "SET_DAY_NAME"; dayIndex: number; value: string }
  | { type: "ADD_SESSION"; dayIndex: number; name: string }
  | { type: "REMOVE_SESSION"; dayIndex: number; sessionTempId: string }
  | { type: "SET_SESSION_NAME"; dayIndex: number; sessionTempId: string; value: string }
  | { type: "ADD_EXERCISE"; dayIndex: number; sessionTempId: string; exercise: ProgramBuilderExercise }
  | { type: "UPDATE_EXERCISE"; dayIndex: number; sessionTempId: string; exercise: ProgramBuilderExercise }
  | { type: "REMOVE_EXERCISE"; dayIndex: number; sessionTempId: string; exerciseTempId: string }
  | { type: "RESET" };

function reducer(state: ProgramBuilderState, action: Action): ProgramBuilderState {
  switch (action.type) {
    case "SET_NAME": return { ...state, name: action.value };
    case "SET_VISIBILITY": return { ...state, visibility: action.value };
    case "SET_DESCRIPTION": return { ...state, description: action.value };
    case "SET_SPLIT_TYPE": return { ...state, split_type: action.value };
    case "SET_SESSION_ORDERING": return { ...state, session_ordering_logic: action.value };
    case "SET_DURATION_TYPE": return { ...state, duration_type: action.value };
    case "SET_DURATION_WEEKS": return { ...state, duration_weeks: action.value };
    case "SET_VERSION_VISIBILITY": return { ...state, version_visibility: action.value };

    case "SET_DAY_NAME": {
      const days = state.days.map((d, i) =>
        i === action.dayIndex ? { ...d, name: action.value } : d
      );
      return { ...state, days };
    }

    case "ADD_SESSION": {
      const days = state.days.map((d, i) =>
        i === action.dayIndex
          ? { ...d, sessions: [...d.sessions, { tempId: crypto.randomUUID(), name: action.name, exercises: [], visibility: "public" as const }] }
          : d
      );
      return { ...state, days };
    }

    case "REMOVE_SESSION": {
      const days = state.days.map((d, i) =>
        i === action.dayIndex
          ? { ...d, sessions: d.sessions.filter((s) => s.tempId !== action.sessionTempId) }
          : d
      );
      return { ...state, days };
    }

    case "SET_SESSION_NAME": {
      const days = state.days.map((d, i) =>
        i === action.dayIndex
          ? { ...d, sessions: d.sessions.map((s) => s.tempId === action.sessionTempId ? { ...s, name: action.value } : s) }
          : d
      );
      return { ...state, days };
    }

    case "ADD_EXERCISE": {
      const days = state.days.map((d, i) =>
        i === action.dayIndex
          ? {
              ...d, sessions: d.sessions.map((s) =>
                s.tempId === action.sessionTempId
                  ? { ...s, exercises: [...s.exercises, { ...action.exercise, exercise_order: s.exercises.length + 1 }] }
                  : s
              ),
            }
          : d
      );
      return { ...state, days };
    }

    case "UPDATE_EXERCISE": {
      const days = state.days.map((d, i) =>
        i === action.dayIndex
          ? {
              ...d, sessions: d.sessions.map((s) =>
                s.tempId === action.sessionTempId
                  ? { ...s, exercises: s.exercises.map((e) => e.tempId === action.exercise.tempId ? action.exercise : e) }
                  : s
              ),
            }
          : d
      );
      return { ...state, days };
    }

    case "REMOVE_EXERCISE": {
      const days = state.days.map((d, i) =>
        i === action.dayIndex
          ? {
              ...d, sessions: d.sessions.map((s) =>
                s.tempId === action.sessionTempId
                  ? {
                      ...s, exercises: s.exercises
                        .filter((e) => e.tempId !== action.exerciseTempId)
                        .map((e, idx) => ({ ...e, exercise_order: idx + 1 })),
                    }
                  : s
              ),
            }
          : d
      );
      return { ...state, days };
    }

    case "RESET": return { ...INITIAL_STATE, days: makeDefaultDays() };

    default: return state;
  }
}

interface ProgramBuilderContextValue {
  state: ProgramBuilderState;
  dispatch: Dispatch<Action>;
}

const ProgramBuilderContext = createContext<ProgramBuilderContextValue | null>(null);

export function ProgramBuilderProvider({
  children,
  initialValues,
}: {
  children: React.ReactNode;
  initialValues?: ProgramBuilderState;
}) {
  const [state, dispatch] = useReducer(reducer, initialValues ?? INITIAL_STATE, (s) => ({
    ...s,
    days: s.days.length > 0 ? s.days : makeDefaultDays(),
  }));
  return (
    <ProgramBuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </ProgramBuilderContext.Provider>
  );
}

export function useProgramBuilder() {
  const ctx = useContext(ProgramBuilderContext);
  if (!ctx) throw new Error("useProgramBuilder must be used inside ProgramBuilderProvider");
  return ctx;
}
