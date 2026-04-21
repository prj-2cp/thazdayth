/**
 * NAVBAR COMPONENT
 * Main navigation bar present on every page.
 * Current Version: Static for the first-semester submission.
 * Handles links to created pages (Home, Process, Dishes, etc.)
 * and the implementation of multi-language support (i18n).
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LogOut, Bell, ShoppingBag } from "lucide-react";
import { useAuth } from "@/Context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import NotificationDrawer from "./NotificationDrawer";

// Configuration for site-wide links
const getLeftLinks = (t: any) => [
  { to: "/", label: t("nav.home") },
  { to: "/processus", label: t("nav.process") },
  { to: "/plats", label: t("nav.dishes") },
];

const getRightLinks = (t: any) => [
  { to: "/region", label: t("nav.region") },
  { to: "/a-propos", label: t("nav.about") },
];

const languages = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "kab", label: "Kabyle" },
];

const Navbar = ({ className = "", onNotificationClick }: { className?: string, onNotificationClick?: (type: 'order' | 'pressing', id: string) => void }) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, token, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false); // Controls background transparency on scroll
  const [menuOpen, setMenuOpen] = useState(false); // Mobile menu state
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const location = useLocation();

  // Change navbar appearance when user scrolls down
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Set up the notification checker (olls every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const API_URL = (await import("@/config")).default;
        const res = await fetch(`${API_URL}/notifications/unread-count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count || 0);
        }
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  // Close mobile menu when user clicks a link (navigates)
  useEffect(() => setMenuOpen(false), [location]);

  const currentLang = i18n.language || "fr";
  const leftLinks = getLeftLinks(t);
  const rightLinks = getRightLinks(t);
  const mainLinks = [...leftLinks, ...rightLinks];
  
  // Suivi is only for authenticated users
  if (isAuthenticated) {
    mainLinks.push({ to: "/suivi", label: t("nav.tracking") || "Suivi" });
  }

  const allLinks = mainLinks;

  // Language switching function via i18next
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${className} ${scrolled
          ? "bg-background/60 backdrop-blur-md shadow-sm"
          : "bg-background/30 backdrop-blur-sm"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-14 lg:h-16 relative">

          {/* Left area: Logo */}
          <div className="flex items-center z-10 flex-1">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="TAZDAYTH Logo"
                className="h-14 lg:h-16 w-auto object-contain mt-0.5"
                style={{ transform: "scale(1.2)", transformOrigin: "left center" }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="text-xl lg:text-2xl font-bold tracking-tight text-foreground hidden">
                TAZDAYTH
              </span>
            </Link>
          </div>

          {/* Absolute Center Area: Links */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex justify-center w-full pointer-events-none">
            <div className="hidden lg:flex items-center justify-center gap-8 max-w-4xl mx-auto pointer-events-auto">
              {allLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm tracking-wide transition-colors duration-300 hover:text-primary whitespace-nowrap ${location.pathname === l.to ? "text-primary font-semibold" : "text-foreground/70"
                    }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right area: Icons */}
          <div className="flex items-center justify-end gap-4 z-10 flex-1">
            <Link
              to="/boutique"
              className="relative flex items-center justify-center text-foreground/70 hover:text-primary transition-all hover:scale-110"
              title={t("nav.shop") || "Boutique"}
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
            </Link>

            {isAuthenticated && (
              <button
                onClick={() => setIsNotificationDrawerOpen(true)}
                className="relative flex items-center justify-center text-foreground/70 hover:text-primary transition-all hover:scale-110 focus:outline-none"
              >
                <Bell className="w-4 h-4 stroke-[2.2]" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm text-foreground/70 hover:text-primary transition-colors focus:outline-none">
                  <Globe className="w-4 h-4" />
                  <span className="hidden lg:inline text-xs">{currentLang.toUpperCase()}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="flex flex-row items-center justify-between cursor-pointer"
                  >
                    <span>{lang.label}</span>
                    {currentLang === lang.code && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-foreground/70 hover:text-primary transition-all hover:scale-110 focus:outline-none">
                    <User className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-border/50 backdrop-blur-xl bg-background/80">
                  <div className="px-2 py-2 mb-1 border-b border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("nav.profile") || "Mon Compte"}</p>
                    <p className="text-xs font-bold truncate">{user?.first_name} {user?.last_name}</p>
                  </div>
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-xl py-2.5 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-semibold">{t("nav.logout") || "Déconnexion"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/connexion" className="flex items-center gap-1 text-foreground/70 hover:text-primary transition-all hover:scale-110">
                <User className="w-4 h-4 stroke-[2.2]" />
              </Link>
            )}

            <button onClick={() => setMenuOpen(true)} className="lg:hidden text-foreground">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }} // The menu slides in from the right
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-background lg:hidden pt-24 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-14">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="TAZDAYTH Logo"
                  className="h-7 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="text-xl font-bold tracking-tight text-foreground hidden">TAZDAYTH</span>
              </Link>
              <button onClick={() => setMenuOpen(false)}>
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center gap-5">
              {allLinks.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={l.to}
                    className={`text-2xl font-medium tracking-tight transition-colors ${location.pathname === l.to ? "text-primary" : "text-foreground"
                      }`}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: allLinks.length * 0.08 }}
                className="flex flex-col items-center gap-6 mt-3 w-full"
              >
                <div className="flex gap-5 mt-3 items-center">
                  <Link
                    to="/boutique"
                    onClick={() => setMenuOpen(false)}
                    className="relative p-2 bg-secondary/50 rounded-full text-foreground"
                  >
                    <ShoppingBag className="w-6 h-6" />
                  </Link>

                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setIsNotificationDrawerOpen(true);
                      }}
                      className="relative p-2 bg-secondary/50 rounded-full text-foreground"
                    >
                      <Bell className="w-6 h-6" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white border-2 border-background">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  )}
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`text-base font-medium transition-colors ${currentLang === lang.code ? "text-primary" : "text-foreground/60"
                        }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
                {isAuthenticated ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t("nav.profile") || "Mon Compte"}</p>
                      <p className="text-lg font-bold">{user?.first_name} {user?.last_name}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-destructive font-bold text-xl py-2 px-6 rounded-full bg-destructive/5"
                    >
                      <LogOut className="w-5 h-5" />
                      {t("nav.logout") || "Déconnexion"}
                    </button>
                  </div>
                ) : (
                  <Link to="/connexion" className="text-xl font-bold text-foreground/60 hover:text-primary transition-colors">
                    {t("nav.login")}
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <NotificationDrawer 
        isOpen={isNotificationDrawerOpen} 
        onClose={() => setIsNotificationDrawerOpen(false)} 
        unreadCount={unreadCount}
        setUnreadCount={setUnreadCount}
        onNotificationClick={onNotificationClick}
      />
    </>
  );
};

export default Navbar;