/**
 * PRESSING MANAGER COMPONENT (ELITE MINIMALIST - EXACT CLONE)
 * Stripped down to the absolute essentials to match the screenshot perfectly.
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone,
  Calendar as CalendarIcon,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

interface PressingManagerProps {
  pressingRequests: any[];
  onRefresh: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  highlightedId: string | null;
  isArchived?: boolean;
}

import { ShieldAlert, ShieldCheck, Archive } from "lucide-react";

const PressingManager: React.FC<PressingManagerProps> = ({
  pressingRequests,
  onRefresh,
  isArchived = false
}) => {
  const { request } = useApi();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [dateEditingId, setDateEditingId] = useState<string | null>(null);
  const [tempDates, setTempDates] = useState({ bring: "", collect: "" });

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

  const archivePressing = async (id: string) => {
    try {
      await request(`/pressing/${id}/archive`, { method: 'PATCH' });
      toast.success("Demande archivée");
      onRefresh();
    } catch (err) {}
  };

  const toggleBlacklist = async (userId: string, requestId: string) => {
    if (!userId) return;
    setActionLoadingId(requestId);
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

  const pressingWaitlist = useMemo(() => 
    pressingRequests.filter(r => !r.bring_olives_date && r.status === 'pending'),
    [pressingRequests]
  );

  const pressingScheduled = useMemo(() => 
    pressingRequests.filter(r => r.bring_olives_date),
    [pressingRequests]
  );

  return (
    <div className="space-y-16 pb-20 font-sans">
      {/* Header section */}
      <div className="space-y-2">
        <h2 className="text-[32px] font-black text-[#4A3B28] flex items-center gap-4">
          <CalendarIcon className="w-10 h-10 text-[#6B8E23]" />
          Agenda des Pressages
        </h2>
        <p className="text-[#8B7E66] font-medium text-lg">Gérez le planning des rendez-vous de trituration.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Column 1: À programmer */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-[#A67C52]" />
            <h3 className="text-2xl font-black text-[#A67C52]">À programmer (Appels à passer)</h3>
          </div>

          <div className="space-y-6">
            {pressingWaitlist.map(r => (
              <div key={r._id} className="bg-[#EFEEE7] rounded-[2.5rem] p-8 flex items-center justify-between shadow-sm">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[22px] font-black text-[#2D2418]">{r.user_id?.first_name} {r.user_id?.last_name}</h4>
                    <div className="flex items-center gap-2 text-[#6B8E23] font-bold">
                       <Phone className="w-4 h-4" />
                       <span className="text-base">{r.user_id?.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="px-5 py-1.5 bg-[#E2E1D8] text-[#8B7E66] font-black rounded-full text-[11px] uppercase tracking-widest">
                       {r.olive_quantity_kg}kg Olives
                     </span>
                     <span className="text-[11px] font-black text-[#B0A695] uppercase tracking-widest">
                       {r.oil_quality || "EXTRA_VIRGIN"}
                     </span>
                  </div>
                </div>
                  <button 
                    onClick={() => { setDateEditingId(r._id); setTempDates({ bring: "", collect: "" }); }}
                    className="px-8 py-3 bg-[#6B8E23] hover:bg-[#556B2F] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-md"
                  >
                    Programmer
                  </button>
                  <div className="flex flex-col gap-2 ml-4">
                    <button 
                      onClick={() => archivePressing(r._id)}
                      className="p-3 bg-[#E2E1D8] text-[#8B7E66] hover:bg-zinc-800 hover:text-white rounded-xl transition-all"
                      title="Archiver"
                    >
                      <Archive size={16} />
                    </button>
                    <button 
                      onClick={() => toggleBlacklist(r.user_id?._id, r._id)}
                      disabled={actionLoadingId === r._id}
                      className={cn(
                        "p-3 rounded-xl transition-all",
                        r.user_id?.is_blacklisted ? "bg-emerald-500 text-white" : "bg-[#E2E1D8] text-[#8B7E66] hover:bg-red-500 hover:text-white"
                      )}
                      title={r.user_id?.is_blacklisted ? "Réhabiliter" : "Banir"}
                    >
                      {actionLoadingId === r._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        r.user_id?.is_blacklisted ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />
                      )}
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Column 2: Planning des Rendez-vous */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-[#6B8E23]" />
            <h3 className="text-2xl font-black text-[#6B8E23]">Planning des Rendez-vous</h3>
          </div>

          <div className="space-y-6">
            {pressingScheduled.map(r => (
              <div key={r._id} className="bg-[#EFEEE7] rounded-[2.5rem] p-8 flex items-center justify-between shadow-sm relative">
                <div className="space-y-5">
                  <div className="space-y-1">
                     <h4 className="text-[22px] font-black text-[#2D2418]">{r.user_id?.first_name} {r.user_id?.last_name}</h4>
                     <div className="flex items-center gap-2 text-[#8B7E66] font-bold">
                        <Phone className="w-4 h-4" />
                        <span className="text-base">{r.user_id?.phone}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-white/50 flex items-center justify-center">
                        <Package className="w-5 h-5 text-[#6B8E23]" />
                     </div>
                     <span className="text-xl font-black text-[#4A3B28]">{r.olive_quantity_kg} kg</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                   <div className="px-6 py-2.5 bg-[#6B8E23] text-white rounded-full text-[11px] font-black uppercase tracking-widest min-w-[170px] text-center shadow-sm">
                      APPORT: {new Date(r.bring_olives_date).toLocaleDateString()}
                   </div>
                   {r.collect_oil_date && (
                     <div className="px-6 py-2.5 bg-[#D9D9C3] text-[#6B8E23] rounded-full text-[11px] font-black uppercase tracking-widest min-w-[170px] text-center">
                        COLLECTE: {new Date(r.collect_oil_date).toLocaleDateString()}
                     </div>
                   )}
                   <button 
                      onClick={() => {
                          setDateEditingId(r._id);
                          setTempDates({ bring: r.bring_olives_date?.split('T')[0] || "", collect: r.collect_oil_date?.split('T')[0] || "" });
                      }}
                      className="text-[11px] font-black text-[#6B8E23] hover:underline uppercase tracking-widest mt-4"
                   >
                      Modifier
                   </button>
                    <div className="flex gap-2 mt-4">
                        <button 
                          onClick={() => archivePressing(r._id)}
                          className="p-3 bg-[#E2E1D8] text-[#8B7E66] hover:bg-zinc-800 hover:text-white rounded-xl transition-all"
                          title="Archiver"
                        >
                          <Archive size={16} />
                        </button>
                        <button 
                          onClick={() => toggleBlacklist(r.user_id?._id, r._id)}
                          disabled={actionLoadingId === r._id}
                          className={cn(
                            "p-3 rounded-xl transition-all",
                            r.user_id?.is_blacklisted ? "bg-emerald-500 text-white" : "bg-[#E2E1D8] text-[#8B7E66] hover:bg-red-500 hover:text-white"
                          )}
                          title={r.user_id?.is_blacklisted ? "Réhabiliter" : "Banir"}
                        >
                          {actionLoadingId === r._id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            r.user_id?.is_blacklisted ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />
                          )}
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Date Editor Modal Overlay */}
      <AnimatePresence>
        {dateEditingId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
          >
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="bg-[#EFEEE7] p-12 rounded-[3rem] shadow-2xl border border-white max-w-xl w-full"
             >
                <h3 className="text-2xl font-black mb-8 text-[#4A3B28] uppercase tracking-widest flex items-center gap-3">
                   <CalendarIcon className="w-6 h-6 text-[#6B8E23]" />
                   Fixer Rendez-vous
                </h3>
                <div className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-[#8B7E66] tracking-widest ml-1">Date d'apport d'olives</label>
                      <input 
                        type="date" 
                        value={tempDates.bring} 
                        onChange={(e) => setTempDates({...tempDates, bring: e.target.value})} 
                        className="w-full bg-white/50 p-5 rounded-2xl border-none text-sm font-bold font-sans outline-none focus:ring-2 focus:ring-[#6B8E23]/20" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-[#8B7E66] tracking-widest ml-1">Date de collecte d'huile</label>
                      <input 
                        type="date" 
                        value={tempDates.collect} 
                        onChange={(e) => setTempDates({...tempDates, collect: e.target.value})} 
                        className="w-full bg-white/50 p-5 rounded-2xl border-none text-sm font-bold font-sans outline-none focus:ring-2 focus:ring-[#6B8E23]/20" 
                      />
                   </div>
                </div>
                <div className="flex gap-4 mt-12">
                   <button 
                     onClick={() => updateDates(dateEditingId)} 
                     className="flex-1 py-5 bg-[#6B8E23] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all shadow-lg"
                   >
                     Confirmer
                   </button>
                   <button 
                     onClick={() => setDateEditingId(null)} 
                     className="px-10 py-5 bg-white text-[#8B7E66] text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/80 transition-all shadow-sm"
                   >
                     Annuler
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PressingManager;
