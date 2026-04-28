/**
 * PRESSING MANAGER COMPONENT (ELITE MINIMALIST EDITION)
 * Designed for effortless luxury and functional speed.
 * Strips away heavy card structures for a sleek, horizontal list flow.
 * Perfect for managing high-volume pressing workflows with professional ease.
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Factory, 
  Trash2, 
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronRight,
  CalendarDays,
  FileText,
  Scale,
  Circle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

interface PressingManagerProps {
  pressingRequests: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  highlightedId: string | null;
  onRefresh: () => void;
  isArchived?: boolean;
}

const PressingManager: React.FC<PressingManagerProps> = ({
  pressingRequests,
  searchTerm,
  setSearchTerm,
  highlightedId,
  onRefresh,
  isArchived = false
}) => {
  const { t } = useTranslation();
  const { request } = useApi();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteValue, setTempNoteValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewFilter, setViewFilter] = useState<"all" | "waitlist" | "scheduled">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [showBlacklisted, setShowBlacklisted] = useState(false);

  const [dateEditingId, setDateEditingId] = useState<string | null>(null);
  const [tempDates, setTempDates] = useState({ bring: "", collect: "" });

  const updatePressingStatus = async (id: string, status: string) => {
    try {
      await request(`/pressing/${id}/status`, {
        method: 'PATCH',
        body: { status }
      });
      toast.success("Statut mis à jour");
      onRefresh();
    } catch (err) {}
  };

  const toggleBlacklist = async (userId: string, requestId: string) => {
    if (!userId) return;
    setActionLoadingId(requestId);
    try {
      await request(`/users/${userId}/blacklist`, { method: 'PATCH' });
      toast.success("Statut mis à jour");
      onRefresh();
    } catch (err) {
      toast.error("Échec de l'action");
    } finally {
      setActionLoadingId(null);
    }
  };

  const updateDates = async (id: string) => {
    try {
      await request(`/pressing/${id}/dates`, {
        method: 'PATCH',
        body: {
          bring_olives_date: tempDates.bring,
          collect_oil_date: tempDates.collect
        }
      });
      toast.success("RDV Programmé");
      setDateEditingId(null);
      onRefresh();
    } catch (err) {}
  };

  const filteredRequests = useMemo(() => {
    return pressingRequests.filter(r => {
      if (!showBlacklisted && r.user_id?.is_blacklisted) return false;

      const searchStr = `${r._id} ${r.user_id?.first_name} ${r.user_id?.last_name} ${r.user_id?.phone} ${r.user_id?.email}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesView = viewFilter === 'all' || (viewFilter === 'waitlist' && !r.bring_olives_date) || (viewFilter === 'scheduled' && r.bring_olives_date);
      return matchesSearch && matchesStatus && matchesView;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [pressingRequests, searchTerm, statusFilter, viewFilter, showBlacklisted]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
            <input
              type="text"
              placeholder="Rechercher un producteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-secondary/30 rounded-2xl text-sm border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40"
            />
          </div>

          <div className="flex bg-secondary/20 p-1 rounded-2xl border border-border/50">
            {(['all', 'waitlist', 'scheduled'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewFilter(v)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    viewFilter === v ? "bg-background text-primary shadow-sm" : "text-muted-foreground/40 hover:text-muted-foreground"
                  )}
                >
                  {v === 'all' ? "Touts" : v === 'waitlist' ? "Sans RDV" : "Programmés"}
                </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setShowBlacklisted(!showBlacklisted)}
          className={cn(
             "h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
             showBlacklisted ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-secondary text-muted-foreground/60 border border-border"
          )}
        >
          {showBlacklisted ? "Masquer Restreints" : "Gérer Restreints"}
        </button>
      </div>

      {/* Pure List View */}
      <div className="space-y-3 font-sans">
        <AnimatePresence mode="popLayout">
          {filteredRequests.length === 0 ? (
            <div className="py-24 text-center">
               <FileText className="w-12 h-12 text-muted-foreground/10 mx-auto mb-6" />
               <p className="text-sm font-medium text-muted-foreground italic">Aucune file de trituration détectée.</p>
            </div>
          ) : (
            filteredRequests.map(r => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={r._id}
                className={cn(
                  "bg-card hover:bg-secondary/[0.15] border border-border/50 p-4 rounded-2xl transition-all flex flex-col lg:flex-row lg:items-center gap-6 group",
                  r.user_id?.is_blacklisted && "opacity-60 grayscale-[0.5]"
                )}
              >
                {/* ID & Identity */}
                <div className="flex items-center gap-6 lg:w-[350px]">
                   <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black text-muted-foreground/60 group-hover:scale-105 transition-transform border border-border/50">
                         #{ (r._id).slice(-4).toUpperCase() }
                      </div>
                      {!r.bring_olives_date && <Circle size={8} className="absolute -top-0.5 -right-0.5 fill-amber-500 text-amber-500 animate-pulse" />}
                   </div>

                   <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground leading-tight">{r.user_id?.first_name} {r.user_id?.last_name}</h3>
                        {r.user_id?.is_blacklisted && <ShieldAlert size={14} className="text-red-500" />}
                      </div>
                      <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-3">
                        <span className="font-sans">{r.user_id?.email}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                        <span className="font-sans">{r.user_id?.phone}</span>
                      </p>
                   </div>
                </div>

                {/* Content & Yield Summary */}
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 lg:border-l border-border/40 lg:pl-8">
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                         <Scale size={14} className="text-primary/40" />
                         <span className="text-sm font-black text-foreground">{r.olive_quantity_kg.toLocaleString()} <small className="text-[10px] opacity-30">KG</small></span>
                      </div>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                         {r.oil_quality || "Vierge Extra"}
                      </span>
                   </div>

                   {/* Compact High-Visibility RDV Block */}
                   <div className="flex items-center gap-3 bg-secondary/20 p-2 px-4 rounded-xl border border-border/30">
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-tighter">Apport</span>
                         <span className={cn("text-[11px] font-black", r.bring_olives_date ? "text-foreground" : "text-amber-500 italic")}>
                            {r.bring_olives_date ? new Date(r.bring_olives_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : "Attente"}
                         </span>
                      </div>
                      <div className="w-[1px] h-6 bg-border/40 mx-1" />
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-tighter">Collecte</span>
                         <span className="text-[11px] font-black text-muted-foreground/60">
                            {r.collect_oil_date ? new Date(r.collect_oil_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : "—"}
                         </span>
                      </div>
                   </div>
                </div>

                {/* Status & Actions Tail */}
                <div className="flex items-center justify-between lg:justify-end gap-3 lg:w-[350px] lg:border-l border-border/40 lg:pl-8">
                   <div className="relative min-w-[130px]">
                      <select 
                        value={r.status}
                        onChange={(e) => updatePressingStatus(r._id, e.target.value)}
                        className={cn(
                          "w-full px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border transition-all appearance-none cursor-pointer",
                          r.status === 'completed' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600" : r.status === 'pending' ? "bg-amber-500/5 border-amber-500/10 text-amber-600" : "bg-primary/5 border-primary/10 text-primary"
                        )}
                      >
                        <option value="pending">Attente</option>
                        <option value="accepted">Validé</option>
                        <option value="completed">Terminé</option>
                        <option value="rejected">Refusé</option>
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-20 rotate-90" />
                   </div>

                   <div className="flex items-center gap-2">
                      {dateEditingId === r._id ? (
                        <button onClick={() => updateDates(r._id)} className="px-6 py-2.5 bg-foreground text-background rounded-xl text-[10px] font-black uppercase">Fixer RDV</button>
                      ) : (
                        <button onClick={() => {
                            setDateEditingId(r._id);
                            setTempDates({ bring: r.bring_olives_date?.split('T')[0] || "", collect: r.collect_oil_date?.split('T')[0] || "" });
                        }} className="p-2.5 bg-secondary text-muted-foreground/60 border border-border rounded-xl transition-all hover:bg-background">
                           <CalendarDays size={16} />
                        </button>
                      )}

                      <button 
                        onClick={() => toggleBlacklist(r.user_id?._id, r._id)}
                        disabled={actionLoadingId === r._id}
                        className={cn(
                          "p-2.5 rounded-xl border transition-all",
                          r.user_id?.is_blacklisted 
                            ? "bg-emerald-500 text-white border-emerald-400" 
                            : "bg-secondary text-muted-foreground/40 hover:bg-red-500 hover:text-white hover:border-red-400"
                        )}
                      >
                         {r.user_id?.is_blacklisted ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                      </button>

                      <button 
                         onClick={() => setEditingNoteId(editingNoteId === r._id ? null : r._id)}
                         className={cn("p-2.5 rounded-xl border border-border transition-all", editingNoteId === r._id ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-secondary")}
                      >
                         <MoreHorizontal size={18} />
                      </button>
                   </div>
                </div>

                {/* Inline Scheduling & Note Drawer */}
                <AnimatePresence>
                  {(editingNoteId === r._id || dateEditingId === r._id) && (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full lg:order-last border-t border-border/30 pt-4 mt-2"
                    >
                       {dateEditingId === r._id ? (
                          <div className="flex flex-col md:flex-row gap-4 items-end bg-secondary/10 p-4 rounded-2xl">
                             <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground">Date d'apport d'olives</label>
                                <input type="date" value={tempDates.bring} onChange={(e) => setTempDates({...tempDates, bring: e.target.value})} className="w-full bg-background p-3 rounded-xl border border-border/50 text-xs font-bold font-sans outline-none focus:ring-1 focus:ring-primary/20" />
                             </div>
                             <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground">Date de collecte d'huile</label>
                                <input type="date" value={tempDates.collect} onChange={(e) => setTempDates({...tempDates, collect: e.target.value})} className="w-full bg-background p-3 rounded-xl border border-border/50 text-xs font-bold font-sans outline-none focus:ring-1 focus:ring-primary/20" />
                             </div>
                             <button onClick={() => updateDates(r._id)} className="px-8 h-10 bg-foreground text-background text-[10px] font-black uppercase rounded-xl">Confirmer</button>
                             <button onClick={() => setDateEditingId(null)} className="px-8 h-10 bg-secondary text-muted-foreground text-[10px] font-black uppercase rounded-xl">Annuler</button>
                          </div>
                       ) : (
                          <div className="flex flex-col md:flex-row gap-4">
                            <textarea
                              value={tempNoteValue}
                              onChange={(e) => setTempNoteValue(e.target.value)}
                              placeholder="Observations confidentielles sur ce lot..."
                              className="flex-1 bg-secondary/20 p-4 rounded-xl text-xs font-semibold outline-none resize-none min-h-[50px] border border-border/20"
                            />
                            <button 
                              onClick={() => {
                                 request(`/pressing/${r._id}/notes`, { method: 'PATCH', body: { notes: tempNoteValue } });
                                 setEditingNoteId(null);
                                 onRefresh();
                              }}
                              className="px-8 py-4 bg-foreground text-background text-[10px] font-black uppercase rounded-xl hover:opacity-90 transition-opacity"
                            >
                              Valider Note
                            </button>
                          </div>
                       )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PressingManager;
