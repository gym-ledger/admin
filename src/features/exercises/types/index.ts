import type { Muscle } from "@/features/muscles/types";

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  added_by_admin_user_id: string | null;
  added_by_user_id: string | null;
  visibility: "public" | "private";
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  /** Only present on the list endpoint, which annotates a muscle count per row. */
  muscle_count?: number | string;
}

export interface ExerciseMuscle {
  id: string;
  contribution: number;
  muscle: Muscle;
}

export interface ExerciseDetail {
  exercise: Exercise;
  exerciseMuscles: ExerciseMuscle[];
}

/**
 * Shape returned by the export endpoint only: the muscle links are flattened
 * into a "slug:contribution,slug:contribution" cell, matching what the
 * import endpoint parses back out of the same CSV column.
 */
export interface ExerciseExportRow extends Exercise {
  exerciseMuscles: string;
}
