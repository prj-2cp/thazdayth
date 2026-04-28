/**
 * ORDER MANAGER COMPONENT (ELITE MINIMALIST EDITION)
 * Designed for pure effortless luxury. 
 * Strips away the boxy structure for a sleek, horizontal horizontal list flow.
 * High-performance, ultra-clean, and scanner-friendly.
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ShoppingBag, 
  Trash2, 
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronRight,
  Box,
  Circle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

interface OrderManagerProps {
  orders: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  highlightedId: string | null;
  onRefresh: () => void;
  isArchived?: boolean;
}

const OrderManager: React.FC<OrderManagerProps> = ({
  orders,
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
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [showBlacklisted, setShowBlacklisted] = useState(false);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: { status }
      });
      toast.success("Statut mis à jour");
      onRefresh();
    } catch (err) {}
  };

  const toggleBlacklist = async (userId: string, orderId: string) => {
    if (!userId) return;
    setActionLoadingId(orderId);
    try {
      await request(`/users/${userId}/blacklist`, { method: 'PATCH' });
      toast.success("Statut client mis à jour");
      onRefresh();
    } catch (err) {
      toast.error("Échec de l'action");
    } finally {
      setActionLoadingId(null);
    }
  };

  const updateNote = async (id: string, notes: string) => {
    try {
      await request(`/orders/${id}/notes`, {
        method: 'PATCH',
        body: { notes }
      });
      toast.success("Note enregistrée");
      setEditingNoteId(null);
      onRefresh();
    } catch (err) {}
  };

  const archiveOrder = async (id: string) => {
    try {
      await request(`/orders/${id}/archive`, { method: 'PATCH' });
      toast.success("Commande archivée");
      onRefresh();
    } catch (err) {}
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (!showBlacklisted && o.user_id?.is_blacklisted) return false;

      const searchStr = `${o._id} ${o.tracking_code || ''} ${o.user_id?.first_name} ${o.user_id?.last_name} ${o.user_id?.phone} ${o.user_id?.email}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, searchTerm, statusFilter, showBlacklisted]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-secondary/30 rounded-2xl text-sm border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          
          <div className="h-10 w-[1px] bg-border mx-2 hidden md:block" />

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary/30 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-secondary/50 transition-all border-none"
          >
            <option value="all">Tout</option>
            <option value="pending">En attente</option>
            <option value="in-progress">En cours</option>
            <option value="completed">Prêt</option>
            <option value="delivered">Délivré</option>
          </select>
        </div>

        <button 
          onClick={() => setShowBlacklisted(!showBlacklisted)}
          className={cn(
             "h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
             showBlacklisted 
              ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
              : "bg-secondary text-muted-foreground/60 border border-border"
          )}
        >
          {showBlacklisted ? "Masquer Restreints" : "Gérer Restreints"}
        </button>
      </div>

      {/* Pure List View */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <div className="py-24 text-center">
               <Box className="w-12 h-12 text-muted-foreground/10 mx-auto mb-6" />
               <p className="text-sm font-medium text-muted-foreground italic">Aucun flux de commande détecté.</p>
            </div>
          ) : (
            filteredOrders.map(o => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={o._id}
                className={cn(
                  "bg-card hover:bg-secondary/[0.15] border border-border/50 p-4 rounded-2xl transition-all flex flex-col lg:flex-row lg:items-center gap-6 group",
                  o.user_id?.is_blacklisted && "opacity-60 grayscale-[0.5]"
                )}
              >
                {/* ID & Identity */}
                <div className="flex items-center gap-6 lg:w-[350px]">
                   <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black text-muted-foreground/60 group-hover:scale-105 transition-transform border border-border/50 font-sans">
                         #{ (o.tracking_code || o._id).slice(-4).toUpperCase() }
                      </div>
                      {o.status === 'pending' && <Circle size={8} className="absolute -top-0.5 -right-0.5 fill-amber-500 text-amber-500 animate-pulse" />}
                   </div>

                   <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground leading-tight">{o.user_id?.first_name} {o.user_id?.last_name}</h3>
                        {o.user_id?.is_blacklisted && <ShieldAlert size={14} className="text-red-500" />}
                      </div>
                      <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-3">
                        <span className="font-sans">{o.user_id?.email}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                        <span className="font-sans">{o.user_id?.phone}</span>
                      </p>
                   </div>
                </div>

                {/* Content Summary */}
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 lg:border-l border-border/40 lg:pl-8">
                   <div className="flex flex-wrap items-center gap-2">
                      {o.items.map((item: any, idx: number) => (
                        <span key={idx} className="text-[11px] font-black text-muted-foreground/60 bg-secondary/40 px-3 py-1 rounded-lg">
                           {item.olive_category_id?.name || item.name} <span className="text-primary italic">x{item.quantity}</span>
                        </span>
                      ))}
                   </div>
                   
                   <div className="flex items-center gap-6">
                      <p className="text-sm font-black text-foreground whitespace-nowrap">
                         {o.total_price.toLocaleString()} <span className="text-[10px] opacity-30 tracking-widest">DA</span>
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest hidden xl:block font-sans">
                        {new Date(o.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                      </p>
                   </div>
                </div>

                {/* Status & Actions Tail */}
                <div className="flex items-center justify-between lg:justify-end gap-3 lg:w-[320px] lg:border-l border-border/40 lg:pl-8">
                   <div className="relative min-w-[130px]">
                      <select 
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                        className={cn(
                          "w-full px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border transition-all appearance-none cursor-pointer",
                          o.status === 'delivered' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600" : o.status === 'pending' ? "bg-amber-500/5 border-amber-500/10 text-amber-600" : "bg-primary/5 border-primary/10 text-primary"
                        )}
                      >
                        <option value="pending">Attente</option>
                        <option value="in-progress">Cours</option>
                        <option value="completed">Prêt</option>
                        <option value="delivered">Délivré</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-20 rotate-90" />
                   </div>

                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleBlacklist(o.user_id?._id, o._id)}
                        disabled={actionLoadingId === o._id}
                        className={cn(
                          "p-2.5 rounded-xl border transition-all",
                          o.user_id?.is_blacklisted 
                            ? "bg-emerald-500 text-white border-emerald-400" 
                            : "bg-secondary text-muted-foreground/40 hover:bg-red-500 hover:text-white hover:border-red-400"
                        )}
                      >
                         {o.user_id?.is_blacklisted ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                      </button>

                      <button 
                         onClick={() => setEditingNoteId(editingNoteId === o._id ? null : o._id)}
                         className={cn("p-2.5 rounded-xl border border-border transition-all", editingNoteId === o._id ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-secondary")}
                      >
                         <MoreHorizontal size={18} />
                      </button>
                      
                      {['delivered', 'cancelled', 'completed'].includes(o.status) && !isArchived && (
                        <button onClick={() => archiveOrder(o._id)} className="p-2.5 rounded-xl bg-secondary text-muted-foreground/30 hover:text-red-500 transition-colors">
                           <Trash2 size={16} />
                        </button>
                      )}
                   </div>
                </div>

                {/* Inline Note Editor */}
                <AnimatePresence>
                  {editingNoteId === o._id && (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full lg:order-last border-t border-border/30 pt-4 mt-2"
                    >
                       <div className="flex flex-col md:flex-row gap-4">
                          <textarea
                            value={tempNoteValue}
                            onChange={(e) => setTempNoteValue(e.target.value)}
                            placeholder="Observations confidentielles..."
                            className="flex-1 bg-secondary/20 p-4 rounded-xl text-xs font-semibold outline-none resize-none min-h-[50px] border border-border/20"
                          />
                          <button 
                            onClick={() => updateNote(o._id, tempNoteValue)}
                            className="px-8 py-4 bg-foreground text-background text-[10px] font-black uppercase rounded-xl hover:opacity-90 transition-opacity"
                          >
                            Valider
                          </button>
                       </div>
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

export default OrderManager;
