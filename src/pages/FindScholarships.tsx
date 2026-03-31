import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Profile } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap, User, Globe, BookOpen, Star, ArrowRight,
  ChevronLeft, Search, Heart, Calendar, DollarSign, MapPin,
  CheckCircle2, Sparkles, Loader2, Users, Banknote, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Scholarship } from "@/lib/types";
import { getStaticMockScholarships } from "@/lib/mockLiveScholarships";
import { useAuth } from "@/hooks/useAuth";
import { useSavedScholarships } from "@/hooks/useSavedScholarships";
import AuthModal from "@/components/AuthModal";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────
interface FormData {
  fullName: string;
  age: string;
  gender: string;
  nationality: string;
  incomeLevel: string;
  academicLevel: string;
  fieldOfStudy: string;
  gpa: string;
}

const ACADEMIC_LEVELS = [
  "High School",
  "Undergraduate (Bachelor's)",
  "Graduate (Master's)",
  "Doctoral (PhD)",
  "Postdoctoral",
  "Vocational / Certificate",
];

const FIELDS = [
  { label: "STEM", value: "STEM", icon: "🔬" },
  { label: "Technology & CS", value: "Technology", icon: "💻" },
  { label: "Medicine & Health", value: "Medicine", icon: "🏥" },
  { label: "Arts & Humanities", value: "Arts", icon: "🎨" },
  { label: "Business & Finance", value: "Business", icon: "📊" },
  { label: "Law & Social Work", value: "Social Work", icon: "⚖️" },
  { label: "Leadership & Policy", value: "Leadership", icon: "🌟" },
  { label: "Other", value: "Other", icon: "📚" },
];

const NATIONALITIES = ["All", "USA", "Canada", "UK", "India", "Australia", "Europe", "Asia", "Africa", "Other"];
const GENDERS = ["Prefer not to say", "Male", "Female", "Non-binary"];
const INCOME_LEVELS = ["Low", "Middle", "High"];

// ─── Step indicator ────────────────────────────────────────────
const steps = ["About You", "Academic Info", "Review & Match"];

const StepBar = ({ current }: { current: number }) => (
  <div className="flex items-center gap-2 mb-8">
    {steps.map((label, i) => (
      <div key={label} className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-2 flex-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
              i < current
                ? "bg-gold text-primary"
                : i === current
                ? "bg-gradient-gold text-primary ring-2 ring-gold/40"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-sm font-medium hidden sm:block ${i === current ? "text-foreground" : "text-muted-foreground"}`}>
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div className={`h-px flex-1 mx-2 ${i < current ? "bg-gold" : "bg-border"}`} />
        )}
      </div>
    ))}
  </div>
);

const inputClass =
  "w-full h-11 px-4 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold transition";

// ─── Smart eligibility matching ────────────────────────────────
function matchesEligibility(s: Scholarship, form: FormData): boolean {
  const gpa = parseFloat(form.gpa);

  // GPA check: scholarship min_gpa must be <= student GPA (if both provided)
  if (s.min_gpa !== null && !isNaN(gpa) && gpa < s.min_gpa) return false;

  // Academic level check
  if (s.eligible_levels && s.eligible_levels.length > 0) {
    if (!s.eligible_levels.includes(form.academicLevel)) return false;
  }

  // Gender check
  if (s.eligible_genders && s.eligible_genders !== "Any") {
    const studentGender = form.gender === "Prefer not to say" ? null : form.gender;
    if (studentGender && s.eligible_genders !== studentGender) return false;
  }

  // Income level check
  if (s.income_level && s.income_level !== "Any") {
    if (form.incomeLevel && s.income_level !== form.incomeLevel) return false;
  }

  // Age check
  const age = parseInt(form.age);
  if (!isNaN(age)) {
    if (s.min_age !== null && age < s.min_age) return false;
    if (s.max_age !== null && age > s.max_age) return false;
  }

  // Nationality check
  if (s.eligible_nationalities && s.eligible_nationalities !== "All") {
    if (form.nationality && form.nationality !== "All" && s.eligible_nationalities !== form.nationality) return false;
  }

  return true;
}

// ─── Main Page ────────────────────────────────────────────────
const FindScholarships = () => {
  const [step, setStep] = useState(0);
  const [authModal, setAuthModal] = useState(false);
  const [form, setForm] = useState<FormData>({
    fullName: "",
    age: "",
    gender: "Prefer not to say",
    nationality: "",
    incomeLevel: "",
    academicLevel: "",
    fieldOfStudy: "",
    gpa: "",
  });
  const [results, setResults] = useState<Scholarship[] | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { savedIds, toggleSave } = useSavedScholarships();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: profile } = useQuery<Profile>({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        fullName: profile.full_name || prev.fullName,
        age: profile.age ? String(profile.age) : prev.age,
        gender: profile.gender || prev.gender,
        nationality: profile.nationality || prev.nationality,
        incomeLevel: profile.income_level || prev.incomeLevel,
        academicLevel: profile.academic_level || prev.academicLevel,
        fieldOfStudy: profile.field_of_study || prev.fieldOfStudy,
        gpa: profile.gpa ? String(profile.gpa) : prev.gpa,
      }));
    }
  }, [profile]);

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canNext = () => {
    if (step === 0) return form.fullName.trim().length > 0 && form.nationality.length > 0;
    if (step === 1) return form.academicLevel.length > 0 && form.fieldOfStudy.length > 0;
    return true;
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: form.fullName,
          age: parseInt(form.age) || null,
          gender: form.gender,
          nationality: form.nationality,
          income_level: form.incomeLevel,
          academic_level: form.academicLevel,
          field_of_study: form.fieldOfStudy,
          gpa: parseFloat(form.gpa) || null,
          email: user.email,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      const allMocks = getStaticMockScholarships();
      const matched = allMocks.filter((s) => matchesEligibility(s, form));
      
      setResults(matched);
      setStep(3);
    } catch {
      toast({ title: "Setup failed", description: "Could not save profile. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (id: string) => {
    if (!user) { setAuthModal(true); return; }
    toggleSave.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container max-w-3xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 text-gold text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Eligibility Matching
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Find Your Perfect{" "}
              <span className="text-gradient-gold">Scholarship</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Tell us about yourself and we'll match you with scholarships you're actually eligible for.
            </p>
          </motion.div>

          {/* Form / Results card */}
          {!user ? (
            <Card className="border border-border shadow-xl">
              <CardContent className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Sign in to Access</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Our Smart Eligibility Matching algorithm is exclusively available to registered students. Create a free account to instantly find your perfect scholarships.
                </p>
                <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={() => setAuthModal(true)}>
                  Create Account / Log In
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border shadow-xl">
              <CardContent className="p-6 sm:p-8">
                {step < 3 && <StepBar current={step} />}

              <AnimatePresence mode="wait">
                {/* ─── Step 0: About You ──────────────────────── */}
                {step === 0 && (
                  <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input className={inputClass + " pl-10"} placeholder="Jane Smith" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1.5 block">Age</label>
                        <input className={inputClass} type="number" min="10" max="80" placeholder="e.g. 22" value={form.age} onChange={(e) => set("age", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1.5 block">Gender</label>
                        <select className={inputClass + " cursor-pointer"} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                          {GENDERS.map((g) => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Nationality / Region *</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select className={inputClass + " pl-10 cursor-pointer"} value={form.nationality} onChange={(e) => set("nationality", e.target.value)}>
                          <option value="">Select your nationality/region...</option>
                          {NATIONALITIES.map((n) => <option key={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">
                        <Banknote className="w-4 h-4 inline mr-1.5 text-muted-foreground" />
                        Family Income Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {INCOME_LEVELS.map((level) => (
                          <button key={level} type="button" onClick={() => set("incomeLevel", level)}
                            className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${form.incomeLevel === level ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold/40"}`}>
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ─── Step 1: Academic Info ───────────────────── */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Academic Level *</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select className={inputClass + " pl-10 cursor-pointer"} value={form.academicLevel} onChange={(e) => set("academicLevel", e.target.value)}>
                          <option value="">Select your level...</option>
                          {ACADEMIC_LEVELS.map((l) => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-3 block">Field of Study *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {FIELDS.map((f) => (
                          <button key={f.value} type="button" onClick={() => set("fieldOfStudy", f.value)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${form.fieldOfStudy === f.value ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground"}`}>
                            <span className="text-lg">{f.icon}</span>
                            <span className="leading-tight text-center">{f.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">
                        <Star className="w-4 h-4 inline mr-1.5 text-muted-foreground" />
                        GPA <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <input className={inputClass} placeholder="e.g. 8.5 (out of 10.0)" type="number" min="0" max="10" step="0.1" value={form.gpa} onChange={(e) => set("gpa", e.target.value)} />
                    </div>
                  </motion.div>
                )}

                {/* ─── Step 2: Review & Match ────────────────────────── */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="rounded-xl bg-gradient-navy p-6 text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="w-6 h-6 text-gold" />
                        </div>
                        <h3 className="font-display text-xl font-bold mb-2" style={{ color: "hsl(45,100%,96%)" }}>
                          Profile Ready for Matching
                        </h3>
                        <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "hsl(215,20%,72%)" }}>
                          We will scan hundreds of active scholarships and filter them against your unique profile.
                        </p>
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Click <strong>Find Matches</strong> below to execute the smart match algorithm.
                    </p>
                  </motion.div>
                )}

                {/* ─── Step 3: Results ───────────────────────────── */}
                {step === 3 && results && (
                  <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-display font-bold text-foreground">
                        Your Perfect Matches
                      </h2>
                      <Badge variant="secondary" className="bg-gold/10 text-gold font-bold">
                        {results.length} found
                      </Badge>
                    </div>

                    {results.length === 0 ? (
                      <div className="text-center py-16 bg-muted/50 rounded-2xl border border-border">
                        <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-foreground">No perfect matches right now</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                          Check back later! We add new scholarships every day that might fit your profile.
                        </p>
                        <Button variant="outline" className="mt-6" onClick={() => setStep(0)}>
                          Edit Profile
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {results.map((scholarship) => {
                          const isSaved = savedIds.has(scholarship.id);
                          return (
                            <div key={scholarship.id} className="p-5 rounded-2xl bg-card border border-border hover:border-gold/30 hover:shadow-lg transition flex flex-col md:flex-row gap-5">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="font-bold text-lg text-foreground">{scholarship.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{scholarship.provider}</p>
                                  </div>
                                  <button
                                    onClick={() => handleSave(scholarship.id)}
                                    className={`p-2 rounded-full transition-colors ${
                                      isSaved ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
                                    }`}
                                  >
                                    <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                                  </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
                                  <span className="flex items-center text-foreground font-semibold bg-primary/10 px-2 py-1 rounded-md">
                                    <DollarSign className="w-4 h-4 mr-1 text-primary" /> {scholarship.amount}
                                  </span>
                                  <span className="flex items-center text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-1.5" /> Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-1.5" /> {scholarship.location}
                                  </span>
                                </div>
                              </div>
                              <div className="md:w-auto flex items-end">
                                <Button className="w-full md:w-auto bg-gradient-gold text-accent-foreground font-semibold shadow-lg shadow-gold/20" asChild>
                                  <a 
                                    href={scholarship.url ?? "#"} 
                                    target={user ? "_blank" : undefined} 
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      if (!user) {
                                        e.preventDefault();
                                        setAuthModal(true);
                                      }
                                    }}
                                  >
                                    Apply Now
                                  </a>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Navigation buttons */}
              {step < 3 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="text-muted-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>

                  {step < 2 ? (
                    <Button className="bg-gradient-gold text-accent-foreground hover:opacity-90 font-semibold px-8" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button className="bg-gradient-gold text-accent-foreground hover:opacity-90 font-semibold px-8" onClick={handleSearch} disabled={loading}>
                      {loading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Matching...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-1" />Find Matches</>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </div>
      </main>
      <Footer />
      <AuthModal open={authModal} defaultTab="signup" onClose={() => setAuthModal(false)} />
    </div>
  );
};

export default FindScholarships;
