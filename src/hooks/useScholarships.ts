import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Scholarship } from "@/lib/types";

interface UseScholarshipsOptions {
  featured?: boolean;
  limit?: number;
  search?: string;
  category?: string;
}

export function useScholarships(options: UseScholarshipsOptions = {}) {
  const { featured, limit, search, category } = options;

  return useQuery<Scholarship[]>({
    queryKey: ["scholarships", { featured, limit, search, category }],
    queryFn: async () => {
      let query = supabase.from("scholarships").select("*").order("created_at", { ascending: false });

      if (featured !== undefined) query = query.eq("featured", featured);
      if (search) query = query.or(`title.ilike.%${search}%,provider.ilike.%${search}%`);
      if (category && category !== "All") query = query.eq("category", category);
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
