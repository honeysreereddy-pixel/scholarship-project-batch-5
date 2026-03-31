import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Heart, Calendar, DollarSign, MapPin, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useScholarships } from "@/hooks/useScholarships";
import { useSavedScholarships } from "@/hooks/useSavedScholarships";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Scholarship } from "@/lib/types";

const CATEGORIES = ["All", "STEM", "Technology", "Leadership", "Arts", "Social Work", "Medicine", "Business", "Law", "Other"];

const SkeletonCard = () => (
  <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-5 w-20 rounded bg-muted" />
    </div>
    <div className="h-5 w-3/4 rounded bg-muted mb-2" />
    <div className="h-4 w-1/2 rounded bg-muted mb-6" />
    <div className="space-y-2">
      <div className="h-4 w-2/3 rounded bg-muted" />
      <div className="h-4 w-1/2 rounded bg-muted" />
    </div>
  </div>
);

const ScholarshipCard = ({
  s,
  savedIds,
  onToggleSave,
  user,
  onRequireAuth,
}: {
  s: Scholarship;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  user: any;
  onRequireAuth: () => void;
}) => {
  const { toast } = useToast();
  const isSaved = savedIds.has(s.id);
  const targetUrl = s.url && s.url !== "#" ? (s.url.startsWith("http") ? s.url : `https://${s.url}`) : "";
  return (
    <a 
      href={targetUrl || "#"} 
      target={targetUrl ? "_blank" : undefined} 
      rel="noopener noreferrer" 
      className="block group h-full"
      onClick={(e) => {
        if (!user) {
          e.preventDefault();
          onRequireAuth();
          return;
        }
        if (!targetUrl) {
          e.preventDefault();
          toast({ title: "No Website Available", description: "This scholarship provider has not listed an official website." });
        }
      }}
    >
      <Card className="h-full border border-border hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className="text-xs font-medium">{s.category}</Badge>
          <div className="flex items-center gap-2">
            {s.featured && <Badge className="bg-gold/15 text-gold border-0 text-xs">Featured</Badge>}
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleSave(s.id);
              }}
              className={`p-1 rounded-full z-10 relative transition-colors ${isSaved ? "text-gold" : "text-muted-foreground hover:text-gold"}`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-gold" : ""}`} />
            </button>
          </div>
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-gold-dark transition-colors mb-1">{s.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{s.provider}</p>
        {s.description && (
          <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{s.description}</p>
        )}
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4 text-gold" />
            <span className="font-semibold text-foreground">{s.amount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Deadline: {s.deadline}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{s.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
    </a>
  );
};

const ScholarshipsPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [category, setCategory] = useState("All");
  const [authModal, setAuthModal] = useState(false);
  const { user } = useAuth();
  const { savedIds, toggleSave } = useSavedScholarships();

  const { data: scholarships, isLoading, isError } = useScholarships({
    search: debouncedSearch,
    category,
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const handleToggleSave = (id: string) => {
    if (!user) { setAuthModal(true); return; }
    toggleSave.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-gold">Browse</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mt-2 text-foreground">
              All Scholarships
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLoading ? "Loading..." : `${scholarships?.length ?? 0} scholarships found`}
            </p>
          </motion.div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name or provider..."
                className="w-full h-10 pl-10 pr-10 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setDebouncedSearch(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter:</span>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  category === cat
                    ? "bg-gold text-primary border-gold"
                    : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          {isError ? (
            <div className="text-center py-20 text-muted-foreground">
              Failed to load scholarships. Please try again later.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
                : scholarships?.length === 0
                ? (
                  <div className="col-span-full text-center py-20 text-muted-foreground">
                    No scholarships found. Try a different search or category.
                  </div>
                )
                : scholarships?.map((s) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ScholarshipCard
                        s={s}
                        savedIds={savedIds}
                        onToggleSave={handleToggleSave}
                        user={user}
                        onRequireAuth={() => setAuthModal(true)}
                      />
                    </motion.div>
                  ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <AuthModal open={authModal} defaultTab="signup" onClose={() => setAuthModal(false)} />
    </div>
  );
};

export default ScholarshipsPage;
