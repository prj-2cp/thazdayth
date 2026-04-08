/**
 * LOGIN PAGE (CONNEXION)
 * Handles user authentication via email/password or Google.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import BackButton from "@/components/BackButton";
import heroImg from "@/assets/background-main-image.jpg";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/Context/AuthContext";
import { useGoogleLogin } from '@react-oauth/google';

import { useTranslation } from "react-i18next";

const Connexion = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, googleLogin } = useAuth(); // Functions from AuthContext

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false); // Toggles password visibility
    const [loading, setLoading] = useState(false);

    /**
     * Google Login via popup — uses access_token flow instead of credential/JWT.
     * This avoids the origin_mismatch issue with self-signed HTTPS certificates.
     */
    const triggerGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // Send the access_token to our backend (different from credential flow)
                await googleLogin(tokenResponse.access_token);
                toast({ title: t("auth.login.success_title"), description: t("auth.login.google_success") });

                const redirect = searchParams.get("redirect") || "/boutique";
                navigate(redirect, { replace: true });
            } catch (err: any) {
                toast({ title: t("auth.login.error_title"), description: err.message || t("auth.login.google_error"), variant: "destructive" });
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            toast({ title: t("auth.login.error_title"), description: t("auth.login.google_error"), variant: "destructive" });
        },
    });

    /**
     * handleSubmit
     * Standard login flow with email and password.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic check: don't send empty requests
        if (!email || !password) {
            toast({ title: t("auth.login.error_title"), description: t("auth.login.error_empty"), variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            toast({ title: t("auth.login.success_title"), description: t("auth.login.success_desc") });

            // Redirect to the page the user originally wanted (e.g. checkout), or /boutique
            const redirect = searchParams.get("redirect") || "/boutique";
            navigate(redirect, { replace: true });
        } catch (err: any) {
            toast({ title: t("auth.login.error_title"), description: err.message || t("auth.login.error_invalid"), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:block overflow-hidden">
                <motion.img
                    src={heroImg}
                    alt="Oliveraie"
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                />
            </div>

            <div className="flex items-center justify-center p-8 lg:p-16 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <BackButton variant="auth" />
                    <Link to="/" className="text-2xl font-bold tracking-tight text-foreground mb-2 block">TAZDAYTH</Link>
                    <h1 className="text-3xl font-bold mb-2">{t("auth.login.title")}</h1>
                    <p className="text-muted-foreground text-sm mb-8">{t("auth.login.subtitle")}</p>

                    <div className="mb-6 flex justify-center">
                        <button
                            type="button"
                            onClick={() => triggerGoogleLogin()}
                            className="flex items-center gap-3 w-full justify-center bg-white border border-gray-300 rounded-full px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {t("auth.login.google_btn") || "Se connecter avec Google"}
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">{t("auth.login.or_email")}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="peer w-full bg-secondary rounded-xl px-4 pt-6 pb-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                                placeholder=" "
                            />
                            <label className="absolute left-4 top-2 text-[10px] font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px]">
                                {t("auth.login.email")}
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="peer w-full bg-secondary rounded-xl px-4 pt-6 pb-2 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                                placeholder=" "
                            />
                            <label className="absolute left-4 top-2 text-[10px] font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px]">
                                {t("auth.login.password")}
                            </label>
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <Link to="/mot-de-passe-oublie" className="text-xs text-primary hover:underline">
                                {t("auth.login.forgot_password")}
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                        >
                            {loading ? t("auth.login.loading") : t("auth.login.submit")}
                        </button>
                    </form>

                    <p className="text-sm text-muted-foreground mt-6 text-center">
                        {t("auth.login.no_account")}{" "}
                        <Link to="/inscription" className="text-primary font-medium hover:underline">
                            {t("auth.login.signup_link")}
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Connexion;
