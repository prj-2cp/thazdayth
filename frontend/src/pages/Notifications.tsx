import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionReveal from "@/components/SectionReveal";
import API_URL from "@/config";
import { 
    Bell, 
    CheckCheck, 
    Clock, 
    ShoppingBag, 
    Factory, 
    ChevronRight,
    AlertCircle,
    Loader2
} from "lucide-react";
import { Link } from "react-router-dom";

interface Notification {
    _id: string;
    title: string;
    content: string;
    related_id?: string;
    is_read: boolean;
    created_at: string;
}

/**
 * NOTIFICATIONS PAGE
 * Displays a list of user notifications fetched from the backend.
 * Provides functionality to mark individual or all notifications as read.
 */
const Notifications = () => {
    const { t } = useTranslation();
    const { token, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Erreur lors de la récupération des notifications");
            const data = await res.json();
            setNotifications(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated, token]);

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
            }
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            }
        } catch (err) {
            console.error("Error marking all as read:", err);
        }
    };

    const getIcon = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('commande') || lowerTitle.includes('boutique')) return <ShoppingBag className="w-5 h-5 text-blue-500" />;
        if (lowerTitle.includes('pressage') || lowerTitle.includes('trituration') || lowerTitle.includes('réservation')) return <Factory className="w-5 h-5 text-emerald-500" />;
        return <Bell className="w-5 h-5 text-primary" />;
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-24 lg:pt-32 pb-20 px-6 lg:px-10 max-w-4xl mx-auto">
                <SectionReveal>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div>
                            <span className="inline-block border border-foreground/20 rounded-full px-4 py-1.5 text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground mb-4">
                                {t("notifications.title") || "Notifications"}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold flex items-center gap-4">
                                {t("notifications.title") || "Notifications"}
                                {notifications.filter(n => !n.is_read).length > 0 && (
                                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                        {notifications.filter(n => !n.is_read).length}
                                    </span>
                                )}
                            </h1>
                        </div>
                        
                        {notifications.some(n => !n.is_read) && (
                            <button 
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                            >
                                <CheckCheck className="w-4 h-4" />
                                {t("notifications.mark_all") || "Tout marquer comme lu"}
                            </button>
                        )}
                    </div>
                </SectionReveal>

                <div className="space-y-4">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-sm">Chargement des notifications...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center bg-destructive/5 rounded-[40px] border border-destructive/10">
                            <AlertCircle className="w-12 h-12 text-destructive/50 mx-auto mb-4" />
                            <p className="font-bold text-destructive">{error}</p>
                            <button onClick={fetchNotifications} className="mt-4 text-sm underline font-bold">Réessayer</button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-32 text-center bg-secondary/30 rounded-[40px] border border-dashed border-foreground/10"
                        >
                            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                                <Bell className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t("notifications.empty") || "Aucune notification"}</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">Vous serez averti ici lorsqu'il y aura du nouveau sur vos commandes.</p>
                            <Link to="/boutique" className="mt-8 inline-block px-10 py-4 bg-foreground text-background rounded-full font-bold hover:scale-105 transition-transform">
                                Visiter la boutique
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid gap-3">
                            <AnimatePresence mode="popLayout">
                                {notifications.map((notif, index) => (
                                    <motion.div
                                        key={notif._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`group relative flex gap-4 p-5 sm:p-6 rounded-[32px] border transition-all ${
                                            notif.is_read 
                                            ? 'bg-secondary/20 border-foreground/5 opacity-80' 
                                            : 'bg-secondary/40 border-primary/20 ring-1 ring-primary/5 shadow-lg shadow-primary/5'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                            notif.is_read ? 'bg-background/50' : 'bg-primary/10'
                                        }`}>
                                            {getIcon(notif.title)}
                                        </div>

                                        <div className="flex-1 min-w-0 pr-8">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-bold truncate ${notif.is_read ? 'text-foreground/70' : 'text-foreground'}`}>
                                                    {notif.title}
                                                </h3>
                                                {!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary" />}
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                                {notif.content}
                                            </p>
                                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-60">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(notif.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {notif.related_id && (
                                                    <Link 
                                                        to={`/suivi?id=${notif.related_id}&tab=${notif.title.toLowerCase().includes('pressage') ? 'pressing' : 'orders'}`}
                                                        className="flex items-center gap-1 text-primary hover:underline"
                                                    >
                                                        Voir détails <ChevronRight className="w-3 h-3" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        {!notif.is_read && (
                                            <button 
                                                onClick={() => markAsRead(notif._id)}
                                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all"
                                                title="Marquer comme lu"
                                            >
                                                <CheckCheck className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Notifications;
