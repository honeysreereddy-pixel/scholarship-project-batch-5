import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, LogOut, User, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: "login" | "signup" }>({
    open: false,
    tab: "login",
  });
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotifications();

  const links = [
    { label: "Live Radar", href: "/live", isLive: true },
    { label: "Smart Matching", href: "/find" },
    { label: "Browse All", href: "/scholarships" },
    { label: "How It Works", href: "/#how-it-works" },
  ];

  const initials = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string)
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "?";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">ScholarHub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                {link.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative group hover:bg-gold/10 transition-colors mr-1">
                      <Bell className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
                      {notifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 mr-4" align="end">
                    <div className="p-4 border-b border-border/50">
                      <h4 className="font-semibold text-sm">Notifications</h4>
                    </div>
                    <ScrollArea className="h-[300px]">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No new notifications.
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {notifications.map((n) => (
                            <div key={n.id} className="p-4 border-b border-border/50 hover:bg-muted/50 transition-colors flex flex-col gap-2">
                              <p className="text-sm font-medium">{n.title}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(n.created_at).toLocaleDateString()}
                                </p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 text-xs text-primary hover:text-primary-foreground hover:bg-primary"
                                  onClick={() => markAsRead.mutate(n.id)}
                                >
                                  Mark as Read
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary">
                    {initials}
                  </div>
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthModal({ open: true, tab: "login" })}
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-gold text-accent-foreground hover:opacity-90 font-semibold"
                  onClick={() => setAuthModal({ open: true, tab: "signup" })}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-card border-b border-border"
            >
              <div className="container py-4 flex flex-col gap-3">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium flex items-center gap-2 text-muted-foreground hover:text-foreground py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.isLive && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                    {link.label}
                  </a>
                ))}
                <div className="flex gap-3 pt-2">
                  {user ? (
                    <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon" className="relative group shrink-0">
                            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            {notifications.length > 0 && (
                              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[calc(100vw-2rem)] mx-4 p-0" align="end">
                          <div className="p-4 border-b border-border/50 bg-card">
                            <h4 className="font-semibold text-sm">Notifications</h4>
                          </div>
                          <ScrollArea className="h-[300px]">
                            {notifications.length === 0 ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                No new notifications.
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                {notifications.map((n) => (
                                  <div key={n.id} className="p-4 border-b border-border/50 hover:bg-muted/50 transition-colors flex flex-col gap-2">
                                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                                    <div className="flex items-center justify-between mt-1">
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(n.created_at).toLocaleDateString()}
                                      </p>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 px-3 text-xs"
                                        onClick={() => markAsRead.mutate(n.id)}
                                      >
                                        Mark as Read
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                      <Link
                        to="/profile"
                        className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-foreground border border-border rounded-md px-3 py-2"
                        onClick={() => setMobileOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      >
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => { setAuthModal({ open: true, tab: "login" }); setMobileOpen(false); }}
                      >
                        Log In
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-gold text-accent-foreground font-semibold"
                        onClick={() => { setAuthModal({ open: true, tab: "signup" }); setMobileOpen(false); }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal
        open={authModal.open}
        defaultTab={authModal.tab}
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default Navbar;
