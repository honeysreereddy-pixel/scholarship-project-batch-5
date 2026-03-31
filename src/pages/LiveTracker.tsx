import { useState } from "react";
import { useLiveScholarships } from "@/hooks/useLiveScholarships";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radar, 
  MapPin, 
  Calendar, 
  Banknote, 
  Globe2, 
  Lock, 
  PlayCircle, 
  PauseCircle,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const LiveTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { scholarships, isLive, toggleLive, justAddedId } = useLiveScholarships(7000, 8);
  const [filter, setFilter] = useState<"All" | "National" | "International">("All");

  const filteredScholarships = scholarships.filter(
    (s) => filter === "All" || s.category === filter
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container px-4">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground flex items-center gap-4">
                Global Tracker
                {user && (
                  <span className="relative flex h-5 w-5">
                    {isLive && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-5 w-5 ${isLive ? 'bg-green-500' : 'bg-destructive'}`}></span>
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Real-time active radar for National & International Scholarships
              </p>
            </div>
            
            {user && (
              <div className="flex flex-wrap items-center gap-3 bg-secondary/30 p-2 rounded-xl border border-border">
                {["All", "National", "International"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as typeof filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === f 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
                <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleLive}
                  className="hidden sm:flex"
                >
                  {isLive ? <PauseCircle className="w-4 h-4 mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                  {isLive ? "Pause Radar" : "Start Radar"}
                </Button>
              </div>
            )}
          </div>

          {!user ? (
            <div className="py-24 flex flex-col items-center justify-center text-center bg-card rounded-2xl border border-border">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-4">Radar Access Restricted</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                The Live Global Radar is an exclusive premium feature. Please log in or sign up to activate real-time tracking of worldwide scholarship opportunities.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-[1fr_350px]">
              {/* Main Radar Feed */}
              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {filteredScholarships.map((scholarship) => {
                    const isNew = justAddedId === scholarship.id;
                    const isInternational = scholarship.category === "International";
                    const targetUrl = scholarship.url && scholarship.url !== "#" ? (scholarship.url.startsWith("http") ? scholarship.url : `https://${scholarship.url}`) : "";
                    return (
                      <a
                        key={scholarship.id}
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
                      <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className={`p-6 rounded-2xl border transition-colors ${
                          isNew 
                            ? "bg-primary/10 border-primary ring-2 ring-primary/20" 
                            : "bg-card border-border hover:border-gold/40 hover:shadow-md"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={isInternational ? "default" : "secondary"}>
                                {isInternational ? <Globe2 className="w-3 h-3 mr-1" /> : <Radar className="w-3 h-3 mr-1" />}
                                {scholarship.category}
                              </Badge>
                              {isNew && (
                                <Badge className="bg-green-500 hover:bg-green-600 animate-pulse">JUST ADDED</Badge>
                              )}
                            </div>
                            <h3 className="text-xl font-bold font-display text-foreground leading-tight">
                              {scholarship.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 font-medium text-gradient-gold inline-block">
                              {scholarship.provider}
                            </p>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm mb-6 max-w-2xl line-clamp-2">
                          {scholarship.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                          <div className="flex items-center text-foreground font-medium">
                            <Banknote className="w-4 h-4 mr-2 text-primary" />
                            {scholarship.amount}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            {scholarship.location}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            Deadline: <span className="text-foreground ml-1">{new Date(scholarship.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </motion.div>
                      </a>
                    );
                  })}
                  {filteredScholarships.length === 0 && (
                    <div className="py-20 text-center text-muted-foreground">
                      No matching scholarships in the live feed.
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar Stats & Info */}
              <div className="hidden lg:flex flex-col gap-6">
                <div className="p-6 rounded-2xl bg-card border border-border sticky top-24">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Radar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">System Status</h3>
                      <p className="text-sm text-muted-foreground">{isLive ? "Scanning Global Networks..." : "Radar Offline"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Incoming</span>
                      <span className="font-bold">{scholarships.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">National</span>
                      <span className="font-bold text-foreground">
                        {scholarships.filter(s => s.category === "National").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">International</span>
                      <span className="font-bold text-foreground">
                        {scholarships.filter(s => s.category === "International").length}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-xs text-muted-foreground text-center">
                      Our live radar aggregates opportunities from 500+ global university and government sources.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LiveTracker;
