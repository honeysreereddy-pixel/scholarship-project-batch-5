import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type Reminder = {
  id: string;
  user_id: string;
  scholarship_id: string;
  title: string;
  trigger_date: string;
  is_read: boolean;
  created_at: string;
};

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .lte('trigger_date', new Date().toISOString())
        .order('trigger_date', { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }
      return data as Reminder[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Sync every 30 seconds
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from('reminders')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(["notifications", user?.id], (old: Reminder[] = []) => 
        old.filter(n => n.id !== id)
      );
    },
    onError: (error) => {
      console.error("Failed to dismiss notification:", error);
      toast({
        title: "Error",
        description: "Could not dismiss notification.",
        variant: "destructive"
      });
    }
  });

  return {
    notifications,
    isLoading,
    markAsRead
  };
};
