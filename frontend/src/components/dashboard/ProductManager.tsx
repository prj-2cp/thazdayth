/**
 * PRODUCT MANAGER COMPONENT
 * Handles managing olive oil products, categories, and pressing services.
 */

import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  TrendingUp, 
  ClipboardList,
  Package,
  Archive,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApi } from "@/hooks/useApi";

interface ProductManagerProps {
  products: any[];
  oliveCategories: any[];
  pressingServices: any[];
  shippingRates: any[];
  globalSettings: any;
  onRefresh: () => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  oliveCategories,
  pressingServices,
  shippingRates,
  globalSettings,
  onRefresh
}) => {
  const { t } = useTranslation();
  const { request, loading: apiLoading } = useApi();
  const [showProductModal, setShowProductModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [shippingSearch, setShippingSearch] = useState("");
  const [productForm, setProductForm] = useState({
    name: "",
    price_per_liter: 0,
    stock_liters: 0,
    category: "extra_virgin"
  });

  const [shippingForm, setShippingForm] = useState({
    wilaya_code: 0,
    wilaya: "",
    price: 0
  });

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `/products/${editingProduct._id}` : `/products`;

    try {
      await request(url, {
        method,
        body: productForm
      });
      toast.success(editingProduct ? t("dashboard.products.update_success") : t("dashboard.products.create_success"));
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: "", price_per_liter: 0, stock_liters: 0, category: "extra_virgin" });
      onRefresh();
    } catch (err: any) {}
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await request('/shipping-rates', {
        method: 'POST',
        body: shippingForm
      });
      toast.success(t("dashboard.products.update_success"));
      setShowShippingModal(false);
      setShippingForm({ wilaya_code: 0, wilaya: "", price: 0 });
      onRefresh();
    } catch (err: any) {}
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm(t("dashboard.products.delete_confirm"))) return;
    try {
      await request(`/products/${id}`, { method: 'DELETE' });
      toast.success(t("dashboard.products.delete_success"));
      onRefresh();
    } catch (err: any) {}
  };

  const deleteOliveCategory = async (id: string) => {
    if (!window.confirm(t("dashboard.products.delete_confirm"))) return;
    try {
      await request(`/prices/olives/${id}`, { method: 'DELETE' });
      toast.success(t("dashboard.products.delete_success"));
      onRefresh();
    } catch (err: any) {}
  };

  const deletePressingService = async (id: string) => {
    if (!window.confirm(t("dashboard.products.delete_confirm"))) return;
    try {
      await request(`/prices/pressing/${id}`, { method: 'DELETE' });
      toast.success(t("dashboard.products.delete_success"));
      onRefresh();
    } catch (err: any) {}
  };

  const deleteShippingRate = async (id: string) => {
    if (!window.confirm(t("dashboard.products.delete_confirm"))) return;
    try {
      await request(`/shipping-rates/${id}`, { method: 'DELETE' });
      toast.success(t("dashboard.products.delete_success"));
      onRefresh();
    } catch (err: any) {}
  };

  const updatePrice = async (type: 'olives' | 'pressing', id: string, newPrice: number) => {
    try {
      await request(`/prices/${type}/${id}`, {
        method: 'PATCH',
        body: type === 'olives' ? { price_per_liter: newPrice } : { fee: newPrice }
      });
      toast.success(t("dashboard.products.update_success"));
      onRefresh();
    } catch (err: any) {}
  };

  const updateShippingPrice = async (id: string, newPrice: number) => {
    try {
      await request(`/shipping-rates/${id}`, {
        method: 'PATCH',
        body: { price: newPrice }
      });
      toast.success(t("dashboard.products.update_success"));
      onRefresh();
    } catch (err: any) {}
  };

  // updateCategory function removed as categories are deprecated

  const updateOliveStock = async (id: string, newStock: number) => {
    try {
      await request(`/prices/olives/${id}`, {
        method: 'PATCH',
        body: { stock_liters: newStock }
      });
      toast.success(t("dashboard.products.update_success"));
      onRefresh();
    } catch (err: any) {}
  };

  const updateProductField = async (id: string, field: string, value: any) => {
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) return;
    try {
      await request(`/products/${id}`, {
        method: 'PUT',
        body: { [field]: value }
      });
      toast.success(t("dashboard.products.update_success"));
      onRefresh();
    } catch (err: any) {}
  };

  const updateName = async (type: 'olives' | 'pressing', id: string, newName: string) => {
    if (!newName.trim()) return;
    try {
      await request(`/prices/${type}/${id}`, {
        method: 'PATCH',
        body: { name: newName }
      });
      toast.success(t("dashboard.products.update_success"));
      onRefresh();
    } catch (err: any) {}
  };

  const updateYield = async (id: string, newYield: number) => {
    try {
      await request(`/prices/pressing/${id}`, {
        method: 'PATCH',
        body: { yield_per_kg: newYield }
      });
      toast.success(t("dashboard.products.update_success"));
      onRefresh();
    } catch (err: any) {}
  };

  const updateGlobalSettings = async (newSettings: any) => {
    try {
      await request(`/settings`, {
        method: 'PUT',
        body: newSettings
      });
      toast.success(t("dashboard.products.update_success"));
      onRefresh();
    } catch (err: any) {}
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price_per_liter: product.price_per_liter,
      stock_liters: product.stock_liters,
      category: product.category || "extra_virgin"
    });
    setShowProductModal(true);
  };

  return (
    <div className="space-y-10">
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          {t("dashboard.products.title")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Olive Prices and Products */}
          <div>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t("dashboard.products.oil_section")}</h4>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: "", price_per_liter: 0, stock_liters: 0, category: "extra_virgin" });
                  setShowProductModal(true);
                }}
                className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity font-bold text-xs shadow-sm"
              >
                <Plus className="w-3 h-3" />
                {t("dashboard.products.new")}
              </button>
            </div>
            <div className="space-y-3">
              {oliveCategories.map(cat => (
                <div key={cat._id} className="flex flex-col gap-3 p-4 bg-background border border-border rounded-2xl group relative overflow-hidden">
                  <div className="flex items-center justify-between gap-4">
                    <input
                      type="text"
                      defaultValue={cat.name}
                      onBlur={(e) => updateName('olives', cat._id, e.target.value)}
                      className="font-semibold bg-transparent border-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 flex-1 outline-none relative z-10"
                    />
                    <div className="flex items-center gap-2 relative z-10">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          defaultValue={cat.price_per_liter}
                          onBlur={(e) => updatePrice('olives', cat._id, parseFloat(e.target.value))}
                          className="w-20 px-3 py-1.5 rounded-xl border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                          placeholder={t("dashboard.products.price")}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex-shrink-0">DA/L</span>
                      </div>
                      <div className="hidden sm:flex gap-1">
                        <button onClick={() => deleteOliveCategory(cat._id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors bg-background" title={t("dashboard.products.delete_confirm")}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 relative z-10">
                    <span className="text-xs text-muted-foreground">{t("dashboard.products.category")} Olive</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          defaultValue={cat.stock_liters}
                          onBlur={(e) => updateOliveStock(cat._id, parseFloat(e.target.value))}
                          className={`w-20 px-3 py-1.5 rounded-xl border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none ${cat.stock_liters <= 10 ? "text-red-500" : "text-green-500"}`}
                          placeholder={t("dashboard.products.stock")}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("dashboard.products.liters")}</span>
                      </div>
                      <div className="flex sm:hidden gap-1">
                        <button onClick={() => deleteOliveCategory(cat._id)} className="p-1.5 text-red-500/70 hover:text-red-500 transition-colors" title={t("dashboard.products.delete_confirm")}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {products.map(p => (
                <div key={p._id} className="flex flex-col gap-3 p-4 bg-background border border-border rounded-2xl group relative overflow-hidden">
                  <div className="flex items-center justify-between gap-4">
                    <input
                      type="text"
                      defaultValue={p.name}
                      onBlur={(e) => updateProductField(p._id, 'name', e.target.value)}
                      className="font-semibold text-primary bg-transparent border-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 flex-1 outline-none relative z-10"
                      title={t("dashboard.products.product_name")}
                    />
                    <div className="flex items-center gap-2 relative z-10">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          defaultValue={p.price_per_liter}
                          onBlur={(e) => updateProductField(p._id, 'price_per_liter', parseFloat(e.target.value))}
                          className="w-20 px-3 py-1.5 rounded-xl border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                          placeholder={t("dashboard.products.price")}
                          title={t("dashboard.products.price")}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex-shrink-0">DA/L</span>
                      </div>
                      <div className="hidden sm:flex gap-1">
                        <button onClick={() => openEditModal(p)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors bg-background" title={t("dashboard.products.category")}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteProduct(p._id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors bg-background" title={t("dashboard.products.delete")}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 relative z-10">
                    <span className="text-xs font-medium text-muted-foreground">{t("dashboard.products.standard")}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          defaultValue={p.stock_liters}
                          onBlur={(e) => updateProductField(p._id, 'stock_liters', parseFloat(e.target.value))}
                          className={`w-20 px-3 py-1.5 rounded-xl border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none ${p.stock_liters <= 10 ? "text-red-500" : "text-green-500"}`}
                          placeholder={t("dashboard.products.stock")}
                          title={t("dashboard.products.stock")}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("dashboard.products.liters")}</span>
                      </div>
                      <div className="flex sm:hidden gap-1">
                        <button onClick={() => openEditModal(p)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title={t("dashboard.products.category")}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteProduct(p._id)} className="p-1.5 text-red-500/70 hover:text-red-500 transition-colors" title={t("dashboard.products.delete")}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            </div>

          {/* Pressing Service Prices */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">{t("dashboard.products.pressing_section")}</h4>
            <div className="space-y-4">
              {pressingServices.map(svc => (
                <div key={svc._id} className="p-5 bg-background border border-border rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">{t("dashboard.products.equipment_name")}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={svc.name}
                          onBlur={(e) => updateName('pressing', svc._id, e.target.value)}
                          className="flex-1 font-semibold bg-transparent border-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 outline-none text-sm"
                        />
                        <button 
                          onClick={() => deletePressingService(svc._id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors bg-background"
                          title={t("dashboard.products.delete_confirm")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full sm:w-32">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">{t("dashboard.products.fees")}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={svc.fee}
                          onBlur={(e) => updatePrice('pressing', svc._id, parseFloat(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <span className="text-xs font-bold text-muted-foreground">DA</span>
                      </div>
                    </div>
                    <div className="w-full sm:w-32">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">{t("dashboard.products.yield")}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={svc.yield_per_kg || 0.2}
                          onBlur={(e) => updateYield(svc._id, parseFloat(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <span className="text-xs font-bold text-muted-foreground">L</span>
                      </div>
                    </div>
                  </div>
                  {/* Target quality category buttons removed */}
                </div>
              ))}
            </div>

            {/* Global settings */}
            <div className="mt-10 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
              <h4 className="text-sm font-bold uppercase tracking-widest text-amber-700 mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                {t("dashboard.products.global_settings")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">{t("dashboard.products.percentage_taken")}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      defaultValue={globalSettings.pressing_percentage_taken}
                      onBlur={(e) => updateGlobalSettings({ pressing_percentage_taken: parseFloat(e.target.value) })}
                      className="w-32 px-4 py-2 rounded-xl border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <span className="text-xs font-bold text-muted-foreground">{t("dashboard.products.percentage_desc")}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">{t("dashboard.products.percentage_hint")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SHIPPING RATES SECTION (Full Width) */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 mt-10">
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Archive className="w-5 h-5 text-amber-600" />
            {t("dashboard.products.shipping_section")}
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("dashboard.products.search_wilaya")}
                value={shippingSearch}
                onChange={(e) => setShippingSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-background border border-border rounded-full text-sm outline-none focus:ring-2 focus:ring-amber-500/20 w-64"
              />
            </div>
            <button
              onClick={() => {
                setShippingForm({ wilaya_code: 0, wilaya: "", price: 0 });
                setShowShippingModal(true);
              }}
              className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity font-bold text-sm shadow-md shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              {t("dashboard.products.new_wilaya")}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {shippingRates
            .filter(r => 
              r.wilaya.toLowerCase().includes(shippingSearch.toLowerCase()) || 
              r.wilaya_code.toString().includes(shippingSearch)
            )
            .map(rate => (
            <div key={rate._id} className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl hover:border-amber-500/30 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-secondary rounded-lg text-xs font-bold text-muted-foreground">{rate.wilaya_code}</span>
                <span className="text-sm font-bold truncate">{rate.wilaya}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-secondary/30 rounded-xl px-2 py-1">
                  <input
                    type="number"
                    defaultValue={rate.price}
                    onBlur={(e) => updateShippingPrice(rate._id, parseFloat(e.target.value))}
                    className="w-16 bg-transparent border-none text-xs font-bold focus:ring-0 outline-none text-right"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground">DA</span>
                </div>
                <button onClick={() => deleteShippingRate(rate._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-secondary/50 border border-border p-8 rounded-[40px] shadow-2xl backdrop-blur-xl">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              {editingProduct ? <Edit2 className="w-6 h-6 text-primary" /> : <Plus className="w-6 h-6 text-primary" />}
              {editingProduct ? t("dashboard.products.edit_product") : t("dashboard.products.create_product")}
            </h3>
            <form onSubmit={handleProductSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">{t("dashboard.products.product_name")}</label>
                <input
                  required
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder={t("dashboard.products.product_name")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category selector removed */}
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">{t("dashboard.products.price")} (DA/L)</label>
                   <input
                     required
                     type="number"
                     value={productForm.price_per_liter}
                     onChange={(e) => setProductForm({ ...productForm, price_per_liter: parseFloat(e.target.value) })}
                     className="w-full bg-background border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">{t("dashboard.products.initial_stock")}</label>
                <input
                  required
                  type="number"
                  value={productForm.stock_liters}
                  onChange={(e) => setProductForm({ ...productForm, stock_liters: parseFloat(e.target.value) })}
                  className="w-full bg-background border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 px-8 py-4 rounded-2xl border border-border font-bold hover:bg-secondary transition-colors"
                >
                  {t("dashboard.products.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={apiLoading}
                  className="flex-1 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {apiLoading ? t("dashboard.products.adding") : editingProduct ? t("dashboard.products.save") : t("dashboard.products.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-secondary/50 border border-border p-8 rounded-[40px] shadow-2xl backdrop-blur-xl">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-amber-600">
              <Plus className="w-6 h-6" />
              {t("dashboard.products.new_wilaya")}
            </h3>
            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-2 col-span-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">{t("dashboard.products.code")}</label>
                  <input
                    required
                    type="number"
                    value={shippingForm.wilaya_code}
                    onChange={(e) => setShippingForm({ ...shippingForm, wilaya_code: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="06"
                  />
                </div>
                <div className="space-y-2 col-span-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">{t("dashboard.products.wilaya_name")}</label>
                  <input
                    required
                    type="text"
                    value={shippingForm.wilaya}
                    onChange={(e) => setShippingForm({ ...shippingForm, wilaya: e.target.value })}
                    className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Béjaïa"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">{t("dashboard.products.shipping_price")}</label>
                <input
                  required
                  type="number"
                  value={shippingForm.price}
                  onChange={(e) => setShippingForm({ ...shippingForm, price: parseFloat(e.target.value) })}
                  className="w-full bg-background border border-border rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-lg font-bold"
                  placeholder="500"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowShippingModal(false)}
                  className="flex-1 px-8 py-4 rounded-2xl border border-border font-bold hover:bg-secondary transition-colors"
                >
                  {t("dashboard.products.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={apiLoading}
                  className="flex-1 px-8 py-4 rounded-2xl bg-amber-500 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {apiLoading ? t("dashboard.products.adding") : t("dashboard.products.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
