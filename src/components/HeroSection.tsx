import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroPattern from "@/assets/hero-pattern.jpg";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroPattern} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-navy opacity-90" />
      </div>

      <div className="container relative z-10 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-gold/20 text-gold-light mb-6">
              Smart Scholarship Matching
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ color: "hsl(45, 100%, 96%)" }}
          >
            Find & Apply to{" "}
            <span className="text-gradient-gold">Scholarships</span>{" "}
            That Match You
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto"
            style={{ color: "hsl(215, 20%, 75%)" }}
          >
            Search thousands of scholarships, get smart-matched recommendations,
            and submit applications — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search scholarships by name, field, or country..."
                className="w-full h-12 pl-12 pr-4 rounded-lg bg-card/95 backdrop-blur text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && navigate("/scholarships?q=" + encodeURIComponent(query))}
              />
            </div>
            <Button
              className="h-12 px-8 bg-primary text-primary-foreground hover:opacity-90 font-semibold shrink-0 w-full sm:w-auto"
              onClick={() => navigate("/scholarships?q=" + encodeURIComponent(query))}
            >
              Search
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mt-12"
          >
            {[
              { value: "10,000+", label: "Scholarships" },
              { value: "50,000+", label: "Students Matched" },
              { value: "$2B+", label: "In Awards" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-gold">{stat.value}</p>
                <p className="text-xs uppercase tracking-wider" style={{ color: "hsl(215, 20%, 65%)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
