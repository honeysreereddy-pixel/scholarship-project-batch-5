import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Scholarship } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type ScholarshipInput = Omit<Scholarship, "id" | "created_at">;

export function useAdminScholarships() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["scholarships"] });

  const add = useMutation({
    mutationFn: async (data: ScholarshipInput) => {
      const { error } = await supabase.from("scholarships").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Scholarship added ✅" });
    },
    onError: (e: Error) =>
      toast({ title: "Failed to add", description: e.message, variant: "destructive" }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ScholarshipInput> }) => {
      const { error } = await supabase.from("scholarships").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Scholarship updated ✅" });
    },
    onError: (e: Error) =>
      toast({ title: "Failed to update", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scholarships").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Scholarship deleted 🗑️" });
    },
    onError: (e: Error) =>
      toast({ title: "Failed to delete", description: e.message, variant: "destructive" }),
  });

  return { add, update, remove };
}
