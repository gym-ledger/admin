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
}
