import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from "react-i18next";
import { 
    Bell, 
    CheckCheck, 
    Clock, 
    ShoppingBag, 
    Factory, 
    ChevronRight,
    X,
    Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import API_URL from "@/config";

interface Notification {
    _id: string;
    title: string;
    content: string;
    related_id?: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    token: string | null;
    onUnreadChange: (count: number) => void;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, token, onUnreadChange }) => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                onUnreadChange(data.filter((n: any) => !n.is_read).length);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && token) {
            fetchNotifications();
        }
    }, [isOpen, token]);

    const markAllAsRead = async () => {
        try {
            const res = await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                onUnreadChange(0);
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
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-background/40 backdrop-blur-sm lg:backdrop-blur-md"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-[400px] bg-background border-l border-border/50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black tracking-tight uppercase">
                                    {t("notifications.title") || "Notifications"}
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                {notifications.some(n => !n.is_read) && (
                                    <button 
                                        onClick={markAllAsRead}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all bg-primary/5 px-3 py-1.5 rounded-full"
                                    >
                                        {t("notifications.mark_all") || "Tout marquer"}
                                    </button>
                                )}
                                <button 
                                    onClick={onClose}
                                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {loading && notifications.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground opacity-50">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <p className="text-xs uppercase tracking-widest font-black">Chargement</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 p-10 text-center">
                                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-2">
                                        <Bell className="w-8 h-8 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="font-bold text-lg">{t("notifications.empty") || "Aucune notification"}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Vous serez averti ici lorsqu'il y aura du nouveau sur vos commandes ou rendez-vous.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={`group relative flex gap-4 p-4 rounded-[24px] border transition-all ${
                                                notif.is_read 
                                                ? 'bg-secondary/10 border-transparent opacity-80' 
                                                : 'bg-secondary/40 border-primary/20 shadow-sm'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                                notif.is_read ? 'bg-background/50' : 'bg-primary/5'
                                            }`}>
                                                {getIcon(notif.title)}
                                            </div>

                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className={`font-bold text-sm truncate ${notif.is_read ? 'text-foreground/70' : 'text-foreground'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    {!notif.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                                                    {notif.content}
                                                </p>
                                                <div className="flex items-center justify-between mt-auto pt-1">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        {new Date(notif.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    {notif.related_id && (
                                                        <Link 
                                                            to={`/suivi?id=${notif.related_id}&tab=${notif.title.toLowerCase().includes('pressage') ? 'pressing' : 'orders'}`}
                                                            onClick={onClose}
                                                            className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-0.5"
                                                        >
                                                            Détails <ChevronRight className="w-2.5 h-2.5" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationDrawer;
