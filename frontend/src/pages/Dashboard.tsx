/**
 * ADMIN DASHBOARD
 * Core administrative hub for managing orders, products, and pressing requests.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Package, 
  Factory, 
  Archive, 
  ClipboardList, 
  Calendar, 
  Users as UsersIcon, 
  TrendingUp, 
  AlertCircle 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Context & Hooks
import { useAuth } from "@/Context/AuthContext";
import { useApi } from "@/hooks/useApi";

// UI Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionReveal from "@/components/SectionReveal";

// Modular Dashboard Components
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ProductManager from "@/components/dashboard/ProductManager";
import OrderManager from "@/components/dashboard/OrderManager";
import PressingManager from "@/components/dashboard/PressingManager";
import UserManager from "@/components/dashboard/UserManager";
import AgendaManager from "@/components/dashboard/AgendaManager";

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const { user, token } = useAuth();
    const { request, loading } = useApi();

    // Tabs & UI State
    const [activeTab, setActiveTab] = useState<
        "overview" | "products" | "orders" | "pressing" | "clients" | "availability" | "archive"
    >("overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Data State
    const [orders, setOrders] = useState<any[]>([]);
    const [archivedOrders, setArchivedOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [pressingRequests, setPressingRequests] = useState<any[]>([]);
    const [archivedPressing, setArchivedPressing] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [oliveCategories, setOliveCategories] = useState<any[]>([]);
    const [pressingServices, setPressingServices] = useState<any[]>([]);
    const [shippingRates, setShippingRates] = useState<any[]>([]);
    const [globalSettings, setGlobalSettings] = useState<any>({ pressing_percentage_taken: 20 });

    const fetchAllData = async () => {
        if (!token) return;
        
        setError(null);
        try {
            // Sequential fetching to avoid overloading or handling errors individually if needed
            const [
                ordersData,
                archivedOrdersData,
                productsData,
                pressingRequestsData,
                archivedPressingData,
                usersData,
                oliveCatsData,
                pressingSvcsData,
                shippingRatesData,
                settingsData
            ] = await Promise.all([
                request<any[]>('/orders'),
                request<any[]>('/orders/archived'),
                request<any[]>('/products'),
                request<any[]>('/pressing'),
                request<any[]>('/pressing/archived'),
                request<any[]>('/users'),
                request<any[]>('/prices/olives'),
                request<any[]>('/prices/pressing'),
                request<any[]>('/shipping-rates'),
                request<any>('/settings')
            ]);

            setOrders(ordersData || []);
            setArchivedOrders(archivedOrdersData || []);
            setProducts(productsData || []);
            setPressingRequests(pressingRequestsData || []);
            setArchivedPressing(archivedPressingData || []);
            setAllUsers(usersData || []);
            setOliveCategories(oliveCatsData || []);
            setPressingServices(pressingSvcsData || []);
            setShippingRates(shippingRatesData || []);
            setGlobalSettings(settingsData || { pressing_percentage_taken: 20 });

        } catch (err: any) {
            console.error("Dashboard fetch error:", err);
            setError(err.message || "Erreur de chargement des données");
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [token]);

    const handleNotificationClick = (type: 'order' | 'pressing', id: string) => {
        const isActiveOrder = orders.some(o => o._id === id);
        const isActivePressing = pressingRequests.some(r => r._id === id);
        const isArchivedOrder = archivedOrders.some(o => o._id === id);
        const isArchivedPressing = archivedPressing.some(r => r._id === id);

        if (isActiveOrder) {
            setActiveTab('orders');
        } else if (isActivePressing) {
            setActiveTab('pressing');
        } else if (isArchivedOrder || isArchivedPressing) {
            setActiveTab('archive');
        } else {
            if (type === 'order') setActiveTab('orders');
            else setActiveTab('pressing');
        }

        setSearchTerm(id);
        setHighlightedId(id);
        
        setTimeout(() => {
            setHighlightedId(null);
        }, 8000);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar onNotificationClick={handleNotificationClick} />

            <main className="pt-24 lg:pt-32 pb-20 px-6 lg:px-10 max-w-7xl mx-auto">
                <SectionReveal>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <span className="inline-block border border-primary/20 bg-primary/5 text-primary rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-4">
                                Administration
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold">Tableau de Bord</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchAllData}
                                className="p-3 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors shadow-sm"
                                title="Rafraîchir"
                                disabled={loading}
                            >
                                <TrendingUp className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </SectionReveal>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-10 pb-2 scrollbar-hide border-b border-border/50">
                    {[
                        { id: "overview", label: t("dashboard.tabs.overview"), icon: TrendingUp },
                        { id: "products", label: t("dashboard.tabs.products"), icon: Package },
                        { id: "orders", label: t("dashboard.tabs.orders"), icon: ShoppingBag },
                        { id: "pressing", label: t("dashboard.tabs.pressing"), icon: Factory },
                        { id: "clients", label: "Clients", icon: UsersIcon },
                        { id: "availability", label: t("dashboard.tabs.availability"), icon: Calendar },
                        { id: "archive", label: t("dashboard.tabs.archive"), icon: Archive },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setSearchTerm("");
                            }}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-t-2xl transition-all whitespace-nowrap relative ${
                                activeTab === tab.id
                                ? "bg-primary/5 text-primary font-bold"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "animate-pulse" : ""}`} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="active-tab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <p className="text-sm font-medium text-red-600">{error}</p>
                            </div>
                            <button 
                                onClick={fetchAllData}
                                className="text-xs font-bold text-primary hover:underline bg-primary/5 px-4 py-2 rounded-full"
                            >
                                Réessayer
                            </button>
                        </motion.div>
                    )}

                    {loading && activeTab === "overview" && orders.length === 0 ? (
                        <motion.div
                            key="initial-loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-muted-foreground font-medium">Chargement du dashboard...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {activeTab === "overview" && (
                                <DashboardOverview 
                                    orders={orders}
                                    products={products}
                                    pressingRequests={pressingRequests}
                                    allUsers={allUsers}
                                    setActiveTab={setActiveTab}
                                />
                            )}

                            {activeTab === "products" && (
                                <ProductManager 
                                    products={products}
                                    oliveCategories={oliveCategories}
                                    pressingServices={pressingServices}
                                    shippingRates={shippingRates}
                                    globalSettings={globalSettings}
                                    onRefresh={fetchAllData}
                                />
                            )}

                            {activeTab === "orders" && (
                                <OrderManager 
                                    orders={orders}
                                    onRefresh={fetchAllData}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    highlightedId={highlightedId}
                                />
                            )}

                            {activeTab === "pressing" && (
                                <PressingManager 
                                    pressingRequests={pressingRequests}
                                    onRefresh={fetchAllData}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    highlightedId={highlightedId}
                                />
                            )}

                            {activeTab === "clients" && (
                                <UserManager 
                                    users={allUsers}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    onRefresh={fetchAllData}
                                />
                            )}

                            {activeTab === "availability" && (
                                <AgendaManager 
                                    orders={orders}
                                    pressingRequests={pressingRequests}
                                    allUsers={allUsers}
                                    onRefresh={fetchAllData}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    setActiveTab={setActiveTab}
                                    view="availability"
                                />
                            )}

                            {activeTab === "archive" && (
                                <div className="space-y-12 pb-10">
                                    <OrderManager 
                                        orders={archivedOrders}
                                        onRefresh={fetchAllData}
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        highlightedId={highlightedId}
                                        isArchived={true}
                                    />
                                    <div className="border-t border-border pt-12">
                                        <PressingManager 
                                            pressingRequests={archivedPressing}
                                            onRefresh={fetchAllData}
                                            searchTerm={searchTerm}
                                            setSearchTerm={setSearchTerm}
                                            highlightedId={highlightedId}
                                            isArchived={true}
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
