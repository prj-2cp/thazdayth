import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MessageSquare, User, Send, Trash2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/Context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import API_URL from "@/config";

interface IComment {
    _id: string;
    user_id: {
        _id: string;
        first_name: string;
        last_name: string;
    };
    content: string;
    rating: number;
    createdAt: string;
}

const Testimonials = () => {
    const { t } = useTranslation();
    const { user, token } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useState<IComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true); 
    const [error, setError] = useState<string | null>(null);

    const fetchComments = async () => {
        setFetching(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/comments`);
            if (!res.ok) throw new Error(t("testimonials.load_error"));
            const data = await res.json();
            setComments(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !token) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: newComment,
                    rating
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || t("testimonials.error_title"));
            }

            toast({ title: t("testimonials.success_post"), description: t("testimonials.success_post_desc") });
            setNewComment("");
            setRating(5);
            fetchComments();
        } catch (err: any) {
            toast({ title: t("testimonials.error_title"), description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/comments/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error(t("testimonials.error_title"));

            toast({ title: t("testimonials.success_delete"), description: t("testimonials.success_delete_desc") });
            fetchComments();
        } catch (err: any) {
            toast({ title: t("testimonials.error_title"), description: err.message, variant: "destructive" });
        }
    };

    const renderStars = (count: number, interactive = false) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={`w-4 h-4 transition-all ${(interactive ? (hoverRating || rating) : count) >= s
                            ? "fill-primary text-primary scale-110"
                            : "text-muted-foreground/30"
                            } ${interactive ? "cursor-pointer hover:scale-125" : ""}`}
                        onClick={() => interactive && setRating(s)}
                        onMouseEnter={() => interactive && setHoverRating(s)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                    />
                ))}
            </div>
        );
    };

    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="container px-6 mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4"
                        >
                            <MessageSquare className="w-3 h-3" />
                            {t("testimonials.badge")}
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black tracking-tight"
                        >
                            {t("testimonials.title")}<span className="text-primary">{t("testimonials.title_accent")}</span> </motion.h2>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* Submission Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-1 bg-secondary/30 border border-border p-8 rounded-[2rem] sticky top-24"
                    >
                        <h3 className="text-xl font-bold mb-6">{t("testimonials.form_title")}</h3>
                        {user ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("testimonials.rating_label")}</label>
                                    <div className="p-4 bg-background/50 rounded-2xl border border-border/50">
                                        {renderStars(rating, true)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("testimonials.opinion_label")}</label>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={t("testimonials.placeholder")}
                                        className="w-full bg-background/50 border border-border/50 rounded-2xl p-4 text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !newComment.trim()}
                                    className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                >
                                    {loading ? t("testimonials.loading") : <><Send className="w-4 h-4" /> {t("testimonials.submit")}</>}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm text-muted-foreground mb-4">{t("testimonials.login_msg")}</p>
                                <Link to="/connexion?redirect=/" className="text-sm font-bold text-primary hover:underline flex items-center justify-center gap-2">
                                    {t("testimonials.login_link")} <Send className="w-3 h-3" />
                                </Link>
                            </div>
                        )}
                    </motion.div>

                    {/* Comments List */}
                    <div className="lg:col-span-2">
                        <ScrollArea className="h-[750px] w-full rounded-[3rem] border-2 border-primary/5 bg-secondary/5 shadow-inner">
                            <div className="p-8 md:p-12 space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold tracking-tight">{t("testimonials.all_reviews")}</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-background/50 px-3 py-1.4 rounded-full border border-border/50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {comments.length} {t("testimonials.verified_reviews")}
                                    </div>
                                </div>

                                {fetching ? (
                                    <div className="grid gap-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-40 bg-background/50 animate-pulse rounded-[2.5rem] border border-border/20" />
                                        ))}
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-16 bg-red-500/5 rounded-[2.5rem] border border-red-500/10 mb-6">
                                        <AlertCircle className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
                                        <p className="text-red-600 font-bold mb-4">{error}</p>
                                        <button 
                                            onClick={fetchComments}
                                            className="px-6 py-2 bg-primary text-white rounded-full text-xs font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                                        >
                                            {t("testimonials.retry")}
                                        </button>
                                    </div>
                                ) : comments.length > 0 ? (
                                    <div className="grid gap-6">
                                        {comments.map((c, idx) => (
                                            <motion.div
                                                key={c._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-background border border-border/80 p-8 rounded-[2.5rem] hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden"
                                            >
                                                {/* Subtle decorative background element */}
                                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                                                
                                                <div className="flex justify-between items-start mb-6 relative z-10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                                                            <User className="w-7 h-7" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-lg text-foreground">{c.user_id?.first_name} {c.user_id?.last_name}</h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString()}</p>
                                                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{t("testimonials.buyer_verified")}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <div className="px-4 py-1.5 bg-secondary/30 rounded-full border border-border/50 shadow-sm backdrop-blur-sm">
                                                            {renderStars(c.rating)}
                                                        </div>
                                                        {(user?._id === c.user_id?._id || user?.role === 'owner') && (
                                                            <button
                                                                onClick={() => handleDelete(c._id)}
                                                                className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all border border-transparent hover:border-destructive/20"
                                                                title={t("testimonials.delete_title")}
                                                            >
                                                                <Trash2 className="w-4.5 h-4.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <MessageSquare className="absolute -left-2 -top-2 w-8 h-8 text-primary/5 -z-10 group-hover:text-primary/10 transition-colors" />
                                                    <p className="text-foreground/90 text-base leading-relaxed font-medium pl-2">
                                                        {c.content}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-32 bg-background/50 rounded-[3rem] border-2 border-dashed border-border/50">
                                        <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <MessageSquare className="w-10 h-10 text-muted-foreground/20" />
                                        </div>
                                        <h4 className="text-lg font-bold mb-2">{t("testimonials.empty_title")}</h4>
                                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">{t("testimonials.empty_desc")}</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
