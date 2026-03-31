import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Scholarship } from "@/lib/types";

const CATEGORIES = ["STEM", "Technology", "Medicine", "Arts", "Business", "Social Work", "Leadership", "Other"];
const LOCATIONS = ["Worldwide", "Global", "USA", "Canada", "UK", "Europe", "Asia", "Africa", "Australia", "India", "Other"];
const LEVELS = ["High School", "Undergraduate (Bachelor's)", "Graduate (Master's)", "Doctoral (PhD)", "Postdoctoral", "Vocational / Certificate"];
const GENDERS = ["Any", "Female", "Male"];
const INCOME_LEVELS = ["Any", "Low", "Middle", "High"];
const NATIONALITIES = ["All", "USA", "Canada", "UK", "India", "Australia", "Europe", "Asia", "Africa", "Other"];

type FormState = Omit<Scholarship, "id" | "created_at">;

const EMPTY: FormState = {
  title: "", provider: "", amount: "", deadline: "", location: "", category: "",
  featured: false, description: "", url: "",
  min_gpa: null, eligible_levels: [], eligible_genders: "Any",
  income_level: "Any", min_age: null, max_age: null, eligible_nationalities: "All",
};

interface Props {
  initial?: Scholarship | null;
  onSubmit: (data: FormState) => void;
  onClose: () => void;
  loading?: boolean;
}

const label = "block text-sm font-semibold text-slate-300 mb-1.5";
const inp = "w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition";
const sel = inp + " cursor-pointer";

export default function ScholarshipForm({ initial, onSubmit, onClose, loading }: Props) {
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          title: initial.title, provider: initial.provider, amount: initial.amount,
          deadline: initial.deadline, location: initial.location, category: initial.category,
          featured: initial.featured, description: initial.description ?? "",
          url: initial.url ?? "", min_gpa: initial.min_gpa,
          eligible_levels: initial.eligible_levels ?? [],
          eligible_genders: initial.eligible_genders ?? "Any",
          income_level: initial.income_level ?? "Any",
          min_age: initial.min_age, max_age: initial.max_age,
          eligible_nationalities: initial.eligible_nationalities ?? "All",
        }
      : EMPTY
  );

  const set = (key: keyof FormState, value: unknown) =>
    setForm((p) => ({ ...p, [key]: value }));

  const toggleLevel = (level: string) => {
    const current = form.eligible_levels ?? [];
    set("eligible_levels", current.includes(level) ? current.filter((l) => l !== level) : [...current, level]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      description: form.description || null,
      url: form.url || null,
      min_gpa: form.min_gpa ? Number(form.min_gpa) : null,
      min_age: form.min_age ? Number(form.min_age) : null,
      max_age: form.max_age ? Number(form.max_age) : null,
      eligible_levels: (form.eligible_levels ?? []).length > 0 ? form.eligible_levels : null,
    } as FormState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="w-full max-w-2xl mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">{initial ? "Edit Scholarship" : "Add New Scholarship"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Basic Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Title *</label>
                <input className={inp} required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Global Excellence Award" />
              </div>
              <div>
                <label className={label}>Provider *</label>
                <input className={inp} required value={form.provider} onChange={(e) => set("provider", e.target.value)} placeholder="e.g. International Education Fund" />
              </div>
              <div>
                <label className={label}>Amount *</label>
                <input className={inp} required value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="e.g. $25,000" />
              </div>
              <div>
                <label className={label}>Deadline *</label>
                <input className={inp} required value={form.deadline} onChange={(e) => set("deadline", e.target.value)} placeholder="e.g. Apr 30, 2026" />
              </div>
              <div>
                <label className={label}>Category *</label>
                <select className={sel} required value={form.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Location *</label>
                <select className={sel} required value={form.location} onChange={(e) => set("location", e.target.value)}>
                  <option value="">Select location...</option>
                  {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Application URL</label>
                <input className={inp} value={form.url ?? ""} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Description</label>
                <textarea className={inp + " h-20 resize-none pt-2"} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Short description of this scholarship..." />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input id="featured" type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 accent-amber-400" />
                <label htmlFor="featured" className="text-sm text-slate-300 cursor-pointer">Mark as Featured</label>
              </div>
            </div>
          </div>

          {/* Eligibility */}
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Eligibility Criteria</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Minimum GPA</label>
                <input className={inp} type="number" min="0" max="10" step="0.1" value={form.min_gpa ?? ""} onChange={(e) => set("min_gpa", e.target.value)} placeholder="Leave blank = no minimum" />
              </div>
              <div>
                <label className={label}>Gender</label>
                <select className={sel} value={form.eligible_genders ?? "Any"} onChange={(e) => set("eligible_genders", e.target.value)}>
                  {GENDERS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Income Level</label>
                <select className={sel} value={form.income_level ?? "Any"} onChange={(e) => set("income_level", e.target.value)}>
                  {INCOME_LEVELS.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Eligible Nationality</label>
                <select className={sel} value={form.eligible_nationalities ?? "All"} onChange={(e) => set("eligible_nationalities", e.target.value)}>
                  {NATIONALITIES.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Min Age</label>
                <input className={inp} type="number" min="0" value={form.min_age ?? ""} onChange={(e) => set("min_age", e.target.value)} placeholder="No minimum" />
              </div>
              <div>
                <label className={label}>Max Age</label>
                <input className={inp} type="number" min="0" value={form.max_age ?? ""} onChange={(e) => set("max_age", e.target.value)} placeholder="No maximum" />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Eligible Academic Levels (select all that apply)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {LEVELS.map((l) => {
                    const active = (form.eligible_levels ?? []).includes(l);
                    return (
                      <button key={l} type="button" onClick={() => toggleLevel(l)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? "border-amber-400 bg-amber-400/15 text-amber-300" : "border-slate-600 text-slate-400 hover:border-slate-400"}`}>
                        {l}
                      </button>
                    );
                  })}
                  <span className="text-xs text-slate-500 self-center">(none selected = all levels)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700">
            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Scholarship</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
