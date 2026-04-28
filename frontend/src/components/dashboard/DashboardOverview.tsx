import React from "react";
import { ShoppingBag, Package, Factory, Users as UsersIcon, Plus, AlertCircle, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatCard from "./StatCard";
import QuickActionButton from "./QuickActionButton";

interface DashboardOverviewProps {
  orders: any[];
  products: any[];
  pressingRequests: any[];
  allUsers: any[];
  setActiveTab: (tab: any) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  orders, 
  products, 
  pressingRequests, 
  allUsers, 
  setActiveTab 
}) => {
  const { t } = useTranslation();

  const stats = {
    ordersCount: orders.length,
    productsCount: products.length,
    pressingCount: pressingRequests.length,
    usersCount: allUsers.length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Ventes Totales" 
        value={stats.ordersCount} 
        icon={ShoppingBag} 
        color="text-blue-500" 
      />
      <StatCard 
        title="Produits" 
        value={stats.productsCount} 
        icon={Package} 
        color="text-amber-500" 
      />
      <StatCard 
        title="Demandes Pressage" 
        value={stats.pressingCount} 
        icon={Factory} 
        color="text-green-500" 
      />

      <div className="col-span-full mt-6 bg-secondary/20 border border-border rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Actions Rapides</h2>
        </div>
        <p className="text-muted-foreground mb-8">
          Bienvenue sur votre espace de gestion. Utilisez les onglets ci-dessus pour gérer vos produits, suivre les commandes et organiser les rendez-vous de pressage.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionButton 
            onClick={() => setActiveTab("products")} 
            label="Ajouter un produit" 
            icon={Plus} 
          />
          <QuickActionButton 
            onClick={() => setActiveTab("orders")} 
            label="Voir les commandes" 
            icon={ShoppingBag} 
          />
          <QuickActionButton 
            onClick={() => setActiveTab("pressing")} 
            label="Gérer le pressage" 
            icon={Factory} 
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
