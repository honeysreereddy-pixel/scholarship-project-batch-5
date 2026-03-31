import { UserPlus, Search, Send, Bell } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: UserPlus,
    title: "Create Profile",
    description: "Sign up and fill in your academic background, interests, and goals.",
  },
  {
    icon: Search,
    title: "Discover & Match",
    description: "Browse scholarships or let our smart algorithms match you with the best opportunities.",
  },
  {
    icon: Send,
    title: "Apply Online",
    description: "Submit applications and upload documents directly through the platform.",
  },
  {
    icon: Bell,
    title: "Track & Get Notified",
    description: "Monitor application status and receive deadline reminders and updates.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-muted/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-gold">
            Simple Process
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 text-foreground">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            From sign-up to submission in four simple steps.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-gold mx-auto flex items-center justify-center mb-5 shadow-lg shadow-gold/20">
                <step.icon className="w-7 h-7 text-navy-dark" />
              </div>
              <div className="text-xs font-bold text-gold mb-2 uppercase tracking-widest">
                Step {i + 1}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
