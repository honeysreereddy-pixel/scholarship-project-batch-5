import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSavedScholarships } from "@/hooks/useSavedScholarships";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Profile } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, BookOpen, GraduationCap, Heart,
  Calendar, DollarSign, MapPin, ArrowRight, Pencil, Loader2, Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const { savedList, toggleSave } = useSavedScholarships();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    full_name: "", field_of_study: "", graduation_year: "",
    age: "", gender: "Prefer not to say", nationality: "", income_level: "", academic_level: "", gpa: "" 
  });
  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        field_of_study: profile.field_of_study ?? "",
        graduation_year: profile.graduation_year ? String(profile.graduation_year) : "",
        age: profile.age ? String(profile.age) : "",
        gender: profile.gender ?? "Prefer not to say",
        nationality: profile.nationality ?? "",
        income_level: profile.income_level ?? "",
        academic_level: profile.academic_level ?? "",
        gpa: profile.gpa ? String(profile.gpa) : "",
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").upsert({
        id: user!.id,
        full_name: form.full_name,
        field_of_study: form.field_of_study,
        graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
        email: user!.email,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender,
        nationality: form.nationality,
        income_level: form.income_level,
        academic_level: form.academic_level,
        gpa: form.gpa ? parseFloat(form.gpa) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      setEditing(false);
      toast({ title: "Profile updated ✓" });
    },
    onError: () => {
      toast({ title: "Update failed", variant: "destructive" });
    },
  });

  if (!loading && !user) return <Navigate to="/" replace />;

  const initials = (profile?.full_name ?? user?.email ?? "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container max-w-4xl">
          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-gold flex items-center justify-center text-3xl font-bold text-primary">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {profileLoading ? (
                  <span className="inline-block h-7 w-40 rounded bg-muted animate-pulse" />
                ) : (
                  profile?.full_name ?? user?.email
                )}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
              className="shrink-0"
            >
              {editing ? <><X className="w-4 h-4 mr-1" /> Cancel</> : <><Pencil className="w-4 h-4 mr-1" /> Edit Profile</>}
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Profile details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card className="border border-border">
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-semibold text-foreground mb-4">Profile Details</h2>

                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            value={form.full_name}
                            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                            className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Field of Study</label>
                        <div className="relative">
                          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            value={form.field_of_study}
                            onChange={(e) => setForm((f) => ({ ...f, field_of_study: e.target.value }))}
                            placeholder="e.g. Computer Science"
                            className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Graduation Year</label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            value={form.graduation_year}
                            onChange={(e) => setForm((f) => ({ ...f, graduation_year: e.target.value }))}
                            placeholder="e.g. 2027"
                            type="number"
                            min="2024"
                            max="2035"
                            className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Age</label>
                        <input value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} type="number" className="w-full h-9 px-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">GPA</label>
                        <input value={form.gpa} onChange={(e) => setForm((f) => ({ ...f, gpa: e.target.value }))} type="number" step="0.01" className="w-full h-9 px-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Nationality</label>
                        <input value={form.nationality} onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))} className="w-full h-9 px-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Gender</label>
                        <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className="w-full h-9 px-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold">
                          <option value="Prefer not to say">Prefer not to say</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Income Level</label>
                        <select value={form.income_level} onChange={(e) => setForm((f) => ({ ...f, income_level: e.target.value }))} className="w-full h-9 px-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold">
                          <option value="">Select Income Level</option>
                          <option value="Low">Low</option>
                          <option value="Middle">Middle</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Academic Level</label>
                        <select value={form.academic_level} onChange={(e) => setForm((f) => ({ ...f, academic_level: e.target.value }))} className="w-full h-9 px-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold">
                          <option value="">Select Level</option>
                          <option value="High School">High School</option>
                          <option value="Undergraduate (Bachelor's)">Undergraduate (Bachelor's)</option>
                          <option value="Graduate (Master's)">Graduate (Master's)</option>
                          <option value="Doctoral (PhD)">Doctoral (PhD)</option>
                          <option value="Postdoctoral">Postdoctoral</option>
                          <option value="Vocational / Certificate">Vocational / Certificate</option>
                        </select>
                      </div>
                      <Button
                        className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90 font-semibold"
                        onClick={() => updateProfile.mutate()}
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><Check className="w-4 h-4 mr-1" /> Save Changes</>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-gold shrink-0" />
                        <span className="text-muted-foreground truncate">{user?.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <BookOpen className="w-4 h-4 text-gold shrink-0" />
                        <span className="text-muted-foreground">
                          {profile?.field_of_study || <em>Field of study not set</em>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <GraduationCap className="w-4 h-4 text-gold shrink-0" />
                        <span className="text-muted-foreground">
                          {profile?.graduation_year ? `Class of ${profile.graduation_year}` : <em>Graduation year not set</em>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Heart className="w-4 h-4 text-gold shrink-0" />
                        <span className="text-muted-foreground">{savedList.length} saved scholarships</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm mt-4 pt-4 border-t border-border">
                        <User className="w-4 h-4 text-gold shrink-0" />
                        <span className="text-muted-foreground">
                          {profile?.age ? `${profile.age} years old` : <em>Age not set</em>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <BookOpen className="w-4 h-4 text-gold shrink-0" />
                        <span className="text-muted-foreground">
                          {profile?.gpa ? `GPA: ${profile.gpa}` : <em>GPA not set</em>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-gold shrink-0" />
                        <span className="text-muted-foreground">
                          {profile?.nationality || <em>Nationality not set</em>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-gold shrink-0" />
                        <span className="text-muted-foreground">
                          {profile?.gender || <em>Gender not set</em>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <DollarSign className="w-4 h-4 text-gold shrink-0" />
                        <span className="text-muted-foreground">
                          {profile?.income_level ? `${profile.income_level} Income` : <em>Income level not set</em>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <GraduationCap className="w-4 h-4 text-gold shrink-0" />
                        <span className="text-muted-foreground">
                          {profile?.academic_level || <em>Academic level not set</em>}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right: Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <h2 className="font-semibold text-xl text-foreground mb-6">
                Saved Scholarships ({savedList.length})
              </h2>
              <div>
                  {savedList.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                      <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No saved scholarships yet</p>
                      <p className="text-sm mt-1">Browse scholarships and click the heart icon to save them here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {savedList.map((saved: any) => {
                        const s = saved.scholarship;
                        if (!s) return null;
                        const targetUrl = s.url && s.url !== "#" ? (s.url.startsWith("http") ? s.url : `https://${s.url}`) : "";
                        return (
                          <a 
                            key={saved.id} 
                            href={targetUrl || "#"} 
                            target={targetUrl ? "_blank" : undefined} 
                            rel="noopener noreferrer" 
                            className="block group"
                            onClick={(e) => {
                              if (!targetUrl) {
                                e.preventDefault();
                                toast({ title: "No Website Available", description: "This scholarship provider has not listed an official website." });
                              }
                            }}
                          >
                          <Card className="border border-border hover:border-gold/40 hover:shadow-md transition-all">
                            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs">{s.category}</Badge>
                                  {s.featured && <Badge className="bg-gold/15 text-gold border-0 text-xs">Featured</Badge>}
                                </div>
                                <h3 className="font-semibold text-foreground truncate">{s.title}</h3>
                                <p className="text-sm text-muted-foreground">{s.provider}</p>
                                <div className="flex flex-wrap gap-4 mt-2">
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <DollarSign className="w-3 h-3 text-gold" />{s.amount}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />{s.deadline}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3" />{s.location}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={(e) => { e.preventDefault(); toggleSave.mutate(s.id); }}
                                  className="p-2 rounded-full relative z-10 text-gold hover:bg-gold/10 transition-colors"
                                  title="Unsave"
                                >
                                  <Heart className="w-4 h-4 fill-gold" />
                                </button>
                              </div>
                            </CardContent>
                          </Card>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// need X for cancel button
function X({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

export default ProfilePage;
