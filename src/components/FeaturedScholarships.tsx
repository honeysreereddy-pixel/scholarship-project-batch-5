import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, MapPin, ArrowRight, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useScholarships } from "@/hooks/useScholarships";
import { useSavedScholarships } from "@/hooks/useSavedScholarships";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Scholarship } from "@/lib/types";

const SkeletonCard = () => (
  <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-5 w-20 rounded bg-muted" />
      <div className="h-5 w-16 rounded bg-muted" />
    </div>
    <div className="h-5 w-3/4 rounded bg-muted mb-2" />
    <div className="h-4 w-1/2 rounded bg-muted mb-6" />
    <div className="space-y-2">
      <div className="h-4 w-2/3 rounded bg-muted" />
      <div className="h-4 w-1/2 rounded bg-muted" />
      <div className="h-4 w-2/3 rounded bg-muted" />
    </div>
  </div>
);

const ScholarshipCard = ({
  s,
  index,
  savedIds,
  onToggleSave,
  user,
  onRequireAuth,
}: {
  s: Scholarship;
  index: number;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  user: any;
  onRequireAuth: () => void;
}) => {
  const { toast } = useToast();
  const isSaved = savedIds.has(s.id);
  const targetUrl = s.url && s.url !== "#" ? (s.url.startsWith("http") ? s.url : `https://${s.url}`) : "";
  return (
    <motion.div
      key={s.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
    >
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
            <Badge variant="secondary" className="text-xs font-medium">
              {s.category}
            </Badge>
            <div className="flex items-center gap-2">
              {s.featured && (
                <Badge className="bg-gold/15 text-gold border-0 text-xs">Featured</Badge>
              )}
              <button
                onClick={(e) => { e.preventDefault(); onToggleSave(s.id); }}
                aria-label={isSaved ? "Unsave scholarship" : "Save scholarship"}
                className={`p-1 rounded-full transition-colors ${
                  isSaved
                    ? "text-gold"
                    : "text-muted-foreground hover:text-gold"
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-gold" : ""}`} />
              </button>
            </div>
          </div>

          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-gold-dark transition-colors mb-1">
            {s.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{s.provider}</p>

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
    </motion.div>
  );
};

const FeaturedScholarships = () => {
  const { data: scholarships, isLoading, isError } = useScholarships({ featured: true, limit: 6 });
  const { savedIds, toggleSave } = useSavedScholarships();
  const { user } = useAuth();
  const [authModal, setAuthModal] = useState(false);

  const handleToggleSave = (id: string) => {
    if (!user) {
      setAuthModal(true);
      return;
    }
    toggleSave.mutate(id);
  };

  return (
    <section id="scholarships" className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-gold">
            Opportunities
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 text-foreground">
            Featured Scholarships
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Explore top scholarships curated for ambitious students worldwide.
          </p>
        </motion.div>

        {isError ? (
          <div className="text-center py-12 text-muted-foreground">
            Failed to load scholarships. Please try again later.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : scholarships?.map((s, i) => (
                  <ScholarshipCard
                    key={s.id}
                    s={s}
                    index={i}
                    savedIds={savedIds}
                    onToggleSave={handleToggleSave}
                    user={user}
                    onRequireAuth={() => setAuthModal(true)}
                  />
                ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/scholarships">
            <Button variant="outline" size="lg" className="font-semibold">
              Browse All Scholarships
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <AuthModal open={authModal} defaultTab="signup" onClose={() => setAuthModal(false)} />
    </section>
  );
};

export default FeaturedScholarships;
