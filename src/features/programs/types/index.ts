export interface WorkoutProgram {
  id: string;
  name: string;
  slug: string;
  visibility: "public" | "private";
  created_at: string;
  updated_at: string;
}

export type SplitType = "ppl" | "upper-lower" | "full-body" | "custom";
export type SessionOrderingLogic = "sequential" | "cyclic" | "random";
export type DurationType = "indefinite" | "finite";

export interface ProgramBuilderExercise {
  tempId: string;
  exercise_id: string;
  exercise_name: string;
  exercise_order: number;
  target_sets: number;
  min_reps: number;
  max_reps: number;
  target_rir: number | null;
  rest_seconds: number | null;
  tempo: string;
  notes: string;
  visibility: "public" | "private";
}

export interface ProgramBuilderSession {
  tempId: string;
  name: string;
  exercises: ProgramBuilderExercise[];
  visibility: "public" | "private";
}

export interface ProgramBuilderDay {
  dayNumber: number; // 1-7
  name: string;
  sessions: ProgramBuilderSession[];
  visibility: "public" | "private";
}

export interface ProgramBuilderState {
  name: string;
  visibility: "public" | "private";
  description: string;
  split_type: SplitType;
  session_ordering_logic: SessionOrderingLogic;
  duration_type: DurationType;
  duration_weeks: number;
  version_visibility: "public" | "private";
  days: ProgramBuilderDay[];
}

// Full program returned by the view API endpoint
export interface ProgramWithDetails extends WorkoutProgram {
  description: string;
  split_type: SplitType;
  session_ordering_logic: SessionOrderingLogic;
  duration_type: DurationType;
  duration_weeks: number;
  version_visibility: "public" | "private";
  program_days: {
    dayNumber: number;
    name: string;
    visibility: "public" | "private";
    sessions: {
      id: string;
      name: string;
      visibility: "public" | "private";
      exercises: {
        id: string;
        exercise_id: string;
        exercise_name: string;
        exercise_order: number;
        target_sets: number;
        min_reps: number;
        max_reps: number;
        target_rir: number | null;
        rest_seconds: number | null;
        tempo: string;
        notes: string;
        visibility: "public" | "private";
      }[];
    }[];
  }[];
}

export const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
export const DAY_FULL_NAMES = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;

export const SPLIT_TYPE_LABELS: Record<SplitType, string> = {
  ppl: "Push / Pull / Legs",
  "upper-lower": "Upper / Lower",
  "full-body": "Full Body",
  custom: "Custom",
};

export const SESSION_ORDERING_LABELS: Record<SessionOrderingLogic, string> = {
  sequential: "Sequential",
  cyclic: "Cyclic",
  random: "Random",
};
