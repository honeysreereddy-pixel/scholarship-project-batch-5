import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = "admin@scholarhub.com";
const ADMIN_PASSWORD = "Admin@123";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (email.trim() === ADMIN_EMAIL && password.trim() === ADMIN_PASSWORD) {
        sessionStorage.setItem("admin_auth", "true");
        navigate("/admin/dashboard");
      } else {
        setError("Invalid email or password.");
      }
      setLoading(false);
    }, 600);
  };

  const inp = "w-full h-11 px-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-card backdrop-blur-xl border border-border rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">ScholarHub Admin</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Restricted Access
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  className={inp + " pl-10"}
                  type="email"
                  required
                  placeholder="admin@scholarhub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  className={inp + " pl-10 pr-10"}
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <div className="p-3 bg-muted/50 rounded-lg border border-border text-xs text-muted-foreground text-center">
              <span className="font-semibold block mb-1">Testing Credentials:</span>
              <span className="font-mono">admin@scholarhub.com</span> <br />
              <span className="font-mono mt-1 inline-block">Admin@123</span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/20 mt-2 transition-all"
            >
              {loading ? "Signing in..." : "Sign In to Admin"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Not an admin?{" "}
            <a href="/" className="text-primary hover:underline font-medium">Go to ScholarHub →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
