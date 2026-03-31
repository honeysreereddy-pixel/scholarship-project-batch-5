import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getStaticMockScholarships } from "@/lib/mockLiveScholarships";

export function useSavedScholarships() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch set of saved scholarship IDs
  const { data: savedIds = new Set<string>() } = useQuery<Set<string>>({
    queryKey: ["saved-scholarships", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_scholarships")
        .select("scholarship_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.scholarship_id as string));
    },
  });

  // Fetch full saved scholarship records (with joined scholarship data)
  const { data: savedList = [] } = useQuery({
    queryKey: ["saved-scholarships-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_scholarships")
        .select("*, scholarship:scholarships(*)")
        .eq("user_id", user!.id)
        .order("saved_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleSave = useMutation({
    mutationFn: async (scholarshipId: string) => {
      if (!user) throw new Error("Not authenticated");
      if (savedIds.has(scholarshipId)) {
        await supabase
          .from("saved_scholarships")
          .delete()
          .eq("user_id", user.id)
        // Delete reminder
        await supabase
          .from("reminders")
          .delete()
          .eq("user_id", user.id)
          .eq("scholarship_id", scholarshipId);

      } else {
        await supabase.from("saved_scholarships").insert({
          user_id: user.id,
          scholarship_id: scholarshipId,
        });

        // Insert reminder
        try {
          // Find scholarship details (try DB first, then Mock)
          let title = "Saved Scholarship";
          let trigger_date = new Date();
          let found = false;

          const { data: dbS } = await supabase.from('scholarships').select('title, deadline').eq('id', scholarshipId).single();
          if (dbS) {
            title = dbS.title;
            if (dbS.deadline) {
              const d = new Date(dbS.deadline);
              d.setDate(d.getDate() - 3);
              trigger_date = d;
            }
            found = true;
          } else {
            const mocks = getStaticMockScholarships();
            const mockS = mocks.find(m => m.id === scholarshipId);
            if (mockS) {
              title = mockS.title || "mock";
              if (mockS.deadline) {
                const parts = mockS.deadline.split('/');
                let d = new Date();
                if (parts.length === 3) d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                d.setDate(d.getDate() - 3);
                trigger_date = d;
              }
              found = true;
            }
          }

          if (found) {
            await supabase.from("reminders").insert({
              user_id: user.id,
              scholarship_id: scholarshipId,
              title: `Deadline Approaching: ${title}`,
              trigger_date: trigger_date.toISOString()
            });
          }
        } catch(e) { console.error("Could not set reminder", e); }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-scholarships", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["saved-scholarships-list", user?.id] });
    },
  });

  return { savedIds, savedList, toggleSave };
}
