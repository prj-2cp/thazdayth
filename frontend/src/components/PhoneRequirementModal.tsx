/**
 * PHONE REQUIREMENT MODAL
 * This component ensures that users who login with Google (or any method
 * that results in a missing phone number) provide it before using the app.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/Context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const PhoneRequirementModal: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // We only show this if the user is logged in but has no valid phone number
  // The backend defaults Google users to "N/A"
  const needsPhone = user && (user.phone === "N/A" || !user.phone || user.phone.trim() === "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      toast.error(t("auth.register.error_empty"));
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ phone });
      toast.success(t("auth.forgot_password.success_title"));
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {needsPhone && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#4A3B28]/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-[#EFEEE7] w-full max-w-md p-10 rounded-[3rem] shadow-2xl border border-white/50"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#6B8E23]/10 rounded-2xl flex items-center justify-center mb-6">
                <Phone className="w-8 h-8 text-[#6B8E23]" />
              </div>

              <h2 className="text-2xl font-black text-[#4A3B28] mb-3 uppercase tracking-tight">
                Numéro de téléphone requis
              </h2>
              <p className="text-[#8B7E66] text-sm mb-8 leading-relaxed">
                Pour finaliser votre inscription et accéder à nos services (commandes, pressage), veuillez renseigner votre numéro de téléphone.
              </p>

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="relative group">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7E66]/40" />
                   <input
                     type="tel"
                     placeholder="0555 123 456"
                     value={phone}
                     onChange={(e) => setPhone(e.target.value)}
                     className="w-full pl-12 pr-4 py-4 bg-white/50 rounded-2xl border-none text-sm font-bold font-sans outline-none focus:ring-2 focus:ring-[#6B8E23]/20 shadow-inner"
                     autoFocus
                   />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#6B8E23] hover:bg-[#556B2F] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#6B8E23]/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Mise à jour..." : "Confirmer mon numéro"}
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="text-[11px] font-black text-[#8B7E66] hover:text-[#4A3B28] uppercase tracking-widest transition-colors pt-4"
                >
                  Me déconnecter
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PhoneRequirementModal;
