import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import SectionReveal from "@/components/SectionReveal";
import { Bell } from "lucide-react";

/**
 * NOTIFICATIONS PAGE
 * This page will display the user's notifications.
 */
const Notifications = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <section className="pt-24 lg:pt-32 pb-20 px-6 lg:px-10 max-w-7xl mx-auto">
                <SectionReveal>
                    <span className="inline-block border border-foreground/20 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase text-muted-foreground mb-6">
                        {t("notifications.title")}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {t("notifications.title")}
                    </h1>
                    <p className="text-muted-foreground max-w-xl mb-10">
                        {t("notifications.empty")}
                    </p>
                </SectionReveal>
                
                <div className="flex flex-col items-center justify-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-foreground/10">
                    <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">{t("notifications.empty")}</p>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Notifications;
