import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, GraduationCap, Loader2, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  defaultTab?: "login" | "signup";
  onClose: () => void;
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export default function AuthModal({ open, defaultTab = "login", onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const handleLogin = async (data: LoginForm) => {
    try {
      await signIn(data.email, data.password);
      toast({ title: "Welcome back! 👋", description: "You're now logged in." });
      loginForm.reset();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      // Supabase returns this when email confirmation is pending
      if (message.toLowerCase().includes("email not confirmed")) {
        toast({
          title: "Email not confirmed",
          description: "Please check your inbox and click the confirmation link, then try logging in again.",
          variant: "destructive",
        });
      } else if (message.toLowerCase().includes("invalid login credentials")) {
        toast({
          title: "Invalid credentials",
          description: "Your email or password is incorrect. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Login failed", description: message, variant: "destructive" });
      }
    }
  };

  const handleSignup = async (data: SignupForm) => {
    try {
      const result = await signUp(data.email, data.password, data.fullName);
      // If email confirmation is required, session will be null
      if (result?.user && !result?.session) {
        toast({
          title: "Check your email 📬",
          description: "We sent a confirmation link to " + data.email + ". Click it to activate your account.",
        });
        signupForm.reset();
        setTab("login");
      } else {
        toast({ title: "Account created! 🎉", description: "Welcome to ScholarHub." });
        signupForm.reset();
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      if (message.toLowerCase().includes("already registered") || message.toLowerCase().includes("already been registered")) {
        toast({
          title: "Email already in use",
          description: "An account with this email already exists. Try logging in instead.",
          variant: "destructive",
        });
        setTab("login");
      } else {
        toast({ title: "Sign up failed", description: message, variant: "destructive" });
      }
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-navy p-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: "hsl(45, 100%, 96%)" }}>ScholarHub</h2>
                <p className="text-xs" style={{ color: "hsl(215, 20%, 65%)" }}>
                  {tab === "login" ? "Welcome back!" : "Join thousands of students"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: "hsl(215, 20%, 65%)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                    tab === t
                      ? "text-gold border-b-2 border-gold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Forms */}
            <div className="p-6">
              {tab === "login" ? (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        {...loginForm.register("email")}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        {...loginForm.register("password")}
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={loginForm.formState.isSubmitting}
                    className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90 font-semibold h-10"
                  >
                    {loginForm.formState.isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : "Log In"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setTab("signup")} className="text-gold hover:underline font-medium">
                      Sign up
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        {...signupForm.register("fullName")}
                        placeholder="Jane Smith"
                        className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    {signupForm.formState.errors.fullName && (
                      <p className="text-xs text-destructive mt-1">{signupForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        {...signupForm.register("email")}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    {signupForm.formState.errors.email && (
                      <p className="text-xs text-destructive mt-1">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        {...signupForm.register("password")}
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    {signupForm.formState.errors.password && (
                      <p className="text-xs text-destructive mt-1">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={signupForm.formState.isSubmitting}
                    className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90 font-semibold h-10"
                  >
                    {signupForm.formState.isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : "Create Account"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-gold hover:underline font-medium">
                      Log in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
