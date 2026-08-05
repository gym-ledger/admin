export interface Muscle {
  id: string;
  name: string;
  slug: string;
  parent_muscle_id: string | null;
  xp_enabled: boolean;
  recovery_enabled: boolean;
  body_region: string | null;
  display_order: number;
  added_by_admin_user_id: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MuscleDetail {
  muscle: Muscle;
  parentMuscle: Muscle | null;
  childrenMuscles: Muscle[];
}

export interface MuscleDropdownItem {
  id: string;
  name: string;
  parent_muscle_id?: string | null;
}
