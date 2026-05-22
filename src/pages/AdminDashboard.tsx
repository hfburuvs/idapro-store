import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import {
  ShoppingBag, MessageSquare, Star, LogOut, Package,
  Upload, Download, Trash2, Plus, Search, Pencil,
  Settings, Layers, Tag, LayoutDashboard, Image,
  Navigation, Globe, Code2, RotateCcw, Mail, Lock,
} from "lucide-react";

type Tab = "dashboard" | "products" | "messages" | "categories" | "brands"
  | "countries" | "carousel" | "navigation" | "settings" | "seo" | "analytics" | "subscribers" | "reset";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/admin");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const navItems: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "products", label: "Products", icon: Package },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "subscribers", label: "Subscribers", icon: Mail },
    { key: "categories", label: "Categories", icon: Layers },
    { key: "brands", label: "Brands", icon: Tag },
    { key: "countries", label: "Countries", icon: Globe },
    { key: "carousel", label: "Carousel", icon: Image },
    { key: "navigation", label: "Navigation", icon: Navigation },
    { key: "settings", label: "Settings", icon: Settings },
    { key: "seo", label: "SEO", icon: Globe },
    { key: "analytics", label: "Analytics", icon: Code2 },
    { key: "reset", label: "Reset", icon: RotateCcw },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FF9900]" />
              <span className="font-semibold text-gray-900">iDaPro Admin</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="lg:w-48 flex-shrink-0">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {navItems.map((item) => (
                <button key={item.key} onClick={() => setTab(item.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === item.key ? "bg-[#FF9900]/10 text-[#FF9900]" : "text-gray-600 hover:bg-gray-100"}`}>
                  <item.icon className="w-4 h-4" /> {item.label}
                </button>
              ))}
            </div>
          </nav>
          <main className="flex-1 min-w-0">
            {tab === "dashboard" && <DashboardTab onNavigate={setTab} />}
            {tab === "products" && <ProductsTab />}
            {tab === "messages" && <MessagesTab />}
            {tab === "subscribers" && <SubscribersTab />}
            {tab === "categories" && <CategoriesTab />}
            {tab === "brands" && <BrandsTab />}
            {tab === "countries" && <CountriesTab />}
            {tab === "carousel" && <CarouselTab />}
            {tab === "navigation" && <NavigationTab />}
            {tab === "settings" && <SettingsTab />}
            {tab === "seo" && <SeoTab />}
            {tab === "analytics" && <AnalyticsTab />}
            {tab === "reset" && <ResetTab />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ============ Error display ============ */
function ErrorMsg({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700 flex items-start justify-between gap-3">
      <span>{msg}</span>
      <button onClick={onClose} className="text-red-400 hover:text-red-600 flex-shrink-0">x</button>
    </div>
  );
}

/* ============ Dashboard ============ */
function DashboardTab({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const [stats, setStats] = useState({ products: 0, messages: 0, newMessages: 0, subscribers: 0 });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [{ count: pc }, { count: mc }, { count: nmc }, { count: sc }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", 0),
        supabase.from("subscribers").select("*", { count: "exact", head: true }),
      ]);
      setStats({ products: pc || 0, messages: mc || 0, newMessages: nmc || 0, subscribers: sc || 0 });
      const [{ data: rp }, { data: rm }] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setRecentProducts(rp || []);
      setRecentMessages(rm || []);
    }
    load();
  }, []);

  const statCards = [
    { label: "Products", value: stats.products, icon: Package, color: "text-blue-600 bg-orange-50", tab: "products" as Tab },
    { label: "Messages", value: stats.messages, icon: MessageSquare, color: "text-purple-600 bg-purple-50", tab: "messages" as Tab },
    { label: "New", value: stats.newMessages, icon: Star, color: "text-red-600 bg-red-50", tab: "messages" as Tab },
    { label: "Subscribers", value: stats.subscribers, icon: Mail, color: "text-green-600 bg-green-50", tab: "subscribers" as Tab },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <button key={s.label} onClick={() => onNavigate(s.tab)}
            className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{s.label}</span>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Products</h3>
          <div className="space-y-2">
            {recentProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-500">${p.price}</p>
                </div>
              </div>
            ))}
            {recentProducts.length === 0 && <p className="text-sm text-gray-400">No products yet</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Messages</h3>
          <div className="space-y-2">
            {recentMessages.map((m) => (
              <div key={m.id} className={`py-2 border-b border-gray-50 last:border-0 ${!m.is_read ? "bg-orange-50 -mx-4 px-4" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{m.name}</p>
                  {!m.is_read && <span className="text-xs bg-[#FF9900] text-white px-2 py-0.5 rounded-full">New</span>}
                </div>
                <p className="text-xs text-gray-500 truncate">{m.content}</p>
              </div>
            ))}
            {recentMessages.length === 0 && <p className="text-sm text-gray-400">No messages yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Products ============ */
function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [sortOrderTip, setSortOrderTip] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number; updated: number; failed?: number } | null>(null);
  const [duplicateModal, setDuplicateModal] = useState<{ rows: any[]; existingTitles: Set<string> } | null>(null);
  const [form, setForm] = useState({ title: "", image_url: "", price: "", amazon_link: "", description: "", features: "", category_id: "", brand_id: "", rating: "", reviews: "", country: "us" });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  async function loadData() {
    setLoading(true); setError("");
    try {
      const [{ data: p }, { data: c }, { data: b }, { data: co }] = await Promise.all([
        supabase.from("products").select("*").order("sort_order", { ascending: true }).order("id", { ascending: true }).limit(500),
        supabase.from("categories").select("*"),
        supabase.from("brands").select("*"),
        supabase.from("countries").select("*").eq("is_active", true).order("sort_order"),
      ]);
      setProducts(p || []);
      setCategories(c || []);
      setBrands(b || []);
      setCountries(co || []);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  // Sort products: if sort_order exists use it, otherwise use id desc
  const sortedProducts = [...products].sort((a, b) => {
    if (a.sort_order !== undefined && b.sort_order !== undefined && a.sort_order !== b.sort_order) {
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    }
    return (b.id ?? 0) - (a.id ?? 0);
  });

  const filtered = sortedProducts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  // Seeded random for consistent per-product rating
  const seededRandom = (seed: string) => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    const x = Math.sin(h) * 10000;
    return x - Math.floor(x);
  };

  const generateRating = (seed: string) => {
    const r = seededRandom(seed + "rating");
    return parseFloat((4.7 + r * 0.3).toFixed(1));
  };
  const generateReviews = (seed: string) => {
    const r = seededRandom(seed + "reviews");
    return Math.floor(10 + r * 190);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      const seed = form.title || String(Date.now());
      const data: Record<string, any> = {
        title: form.title, image_url: form.image_url,
        price: parseFloat(form.price) || 0, amazon_link: form.amazon_link,
        description: form.description,
        category_id: parseInt(form.category_id) || null,
        brand_id: parseInt(form.brand_id) || null,
        rating: form.rating ? parseFloat(form.rating) : generateRating(seed),
        reviews: form.reviews ? parseInt(form.reviews) : generateReviews(seed),
        country: form.country || "us",
      };
      if (editId) {
        const { error: err } = await supabase.from("products").update(data).eq("id", editId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("products").insert(data);
        if (err) throw err;
      }
      setShowForm(false); setEditId(null);
      setForm({ title: "", image_url: "", price: "", amazon_link: "", description: "", features: "", category_id: "", brand_id: "", rating: "", reviews: "" });
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try {
      const { error: err } = await supabase.from("products").delete().eq("id", id);
      if (err) throw err;
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    }
  };

  const handleEdit = (p: any) => {
    setEditId(p.id);
    setForm({ title: p.title, image_url: p.image_url, price: String(p.price), amazon_link: p.amazon_link, description: p.description || "", features: p.features || "", category_id: String(p.category_id || ""), brand_id: String(p.brand_id || ""), rating: p.rating ? String(p.rating) : "", reviews: p.reviews ? String(p.reviews) : "", country: p.country || "us" });
    setShowForm(true);
  };

  // Move product up/down within same brand using sort_order
  const moveProduct = async (productId: number, direction: "up" | "down") => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const sameBrand = sortedProducts.filter((p) => p.brand_id === product.brand_id);
    const idx = sameBrand.findIndex((p) => p.id === productId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sameBrand.length) return;
    try {
      // Remove product from current position and insert at swap position
      const reordered = [...sameBrand];
      const [moved] = reordered.splice(idx, 1);
      reordered.splice(swapIdx, 0, moved);
      // Reassign sequential sort_order: 0, 1, 2, 3...
      const updates = reordered.map((p, i) =>
        supabase.from("products").update({ sort_order: i }).eq("id", p.id)
      );
      await Promise.all(updates);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to reorder");
      setSortOrderTip(true);
    }
  };

  // ===== CSV / Markdown Table Import =====
  // CORRECT ORDER: 1) Parse → 2) Check duplicates → 3) Show modal → 4) Create brands/cats → 5) Insert products
  const [pendingRows, setPendingRows] = useState<Record<string, any>[]>([]);

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const allLines = text.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim());
        if (allLines.length < 2) { setError("File is empty"); return; }

        // Auto-detect format
        const isMarkdownTable = allLines[0].startsWith("|");
        let lines = allLines;
        let headers: string[];
        if (isMarkdownTable) {
          headers = allLines[0].split("|").map((h) => h.trim().toLowerCase()).filter((h) => h);
          lines = allLines.filter((_, idx) => idx !== 1); // skip separator line
        } else {
          headers = allLines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\r/g, ""));
        }

        const requiredCols = ["title", "image_url", "price", "amazon_link"];
        const missingRequiredCols = requiredCols.filter((c) => !headers.includes(c));
        if (missingRequiredCols.length > 0) {
          setError(`File missing required columns: ${missingRequiredCols.join(", ")}`);
          return;
        }

        // Parse rows (NO brand/category creation here!)
        const newRows: Record<string, any>[] = [];
        const errorDetails: string[] = [];
        let failed = 0;
        for (let i = 1; i < lines.length; i++) {
          let vals: string[];
          if (isMarkdownTable) {
            vals = lines[i].split("|").map((v) => v.trim());
            if (lines[i].startsWith("|")) vals = vals.slice(1);
          } else {
            vals = parseCSVLine(lines[i].replace(/\r/g, ""));
          }

          const row: Record<string, any> = {};
          headers.forEach((h, idx) => {
            const rawVal = (vals[idx] || "").trim();
            if (h === "price") row[h] = parseFloat(rawVal.replace(/^\$/, "")) || 0;
            else if (["category_id", "brand_id", "id"].includes(h)) row[h] = parseInt(rawVal) || null;
            else row[h] = rawVal;
          });
          if (!row.title) continue;

          // === Row-level required field validation ===
          const rowErrors: string[] = [];
          const rowNum = i + 1;
          if (!row.title?.trim()) rowErrors.push(`Row ${rowNum}: title is required`);
          if (!row.price || parseFloat(String(row.price)) <= 0) rowErrors.push(`Row ${rowNum}: price must be > 0`);
          if (!row.amazon_link?.trim()) rowErrors.push(`Row ${rowNum}: amazon_link is required`);
          if (!row.country?.trim()) rowErrors.push(`Row ${rowNum}: country is required (us/de/es/it/fr)`);
          else {
            const validCountries = ["us", "de", "es", "it", "fr"];
            if (!validCountries.includes(row.country.trim().toLowerCase())) rowErrors.push(`Row ${rowNum}: country "${row.country}" is invalid. Must be one of: us, de, es, it, fr`);
          }
          // Must have category identification (by ID or name - slug auto-generated from name if missing)
          const hasCatId = row.category_id && parseInt(String(row.category_id)) > 0;
          const hasCatName = row.category_name?.trim();
          if (!hasCatId && !hasCatName) rowErrors.push(`Row ${rowNum}: requires category_id OR category_name (slug will be auto-generated from name)`);
          // Must have brand identification (by ID or name - slug auto-generated from name if missing)
          const hasBrandId = row.brand_id && parseInt(String(row.brand_id)) > 0;
          const hasBrandName = row.brand_name?.trim();
          if (!hasBrandId && !hasBrandName) rowErrors.push(`Row ${rowNum}: requires brand_id OR brand_name (slug will be auto-generated from name)`);

          if (rowErrors.length > 0) {
            errorDetails.push(...rowErrors);
            failed++;
            continue;
          }

          newRows.push(row);
        }

        if (errorDetails.length > 0) {
          setError(`Import validation failed (${failed} rows):\n${errorDetails.slice(0, 8).join("\n")}${errorDetails.length > 8 ? `\n(+${errorDetails.length - 8} more errors)` : ""}`);
          if (newRows.length === 0) return; // No valid rows to import
        }

        if (newRows.length === 0) { setError("No valid data rows found"); return; }

        // STEP 1: Check duplicates by ASIN (before any brand/cat creation)
        const asinFromUrl = (url: string) => {
          const m = url?.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/i);
          return m ? m[2].toUpperCase() : url?.toLowerCase();
        };
        const { data: existingProducts } = await supabase.from("products").select("title,amazon_link");
        const existingAsins = new Set((existingProducts || []).map((e: any) => asinFromUrl(e.amazon_link)).filter(Boolean));

        const dupRows = newRows.filter((r) => existingAsins.has(asinFromUrl(r.amazon_link)));

        // Store ALL rows as pending - brand/cat creation happens AFTER user confirms duplicates
        setPendingRows(newRows);

        if (dupRows.length > 0) {
          setDuplicateModal({ rows: dupRows, existingTitles: new Set(existingAsins as any) });
          return;
        }

        // No duplicates - proceed directly
        await processImport(newRows, []);
      } catch (err: any) {
        setError(err.message || "Import failed");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Unified import: creates brands/categories THEN inserts products
  const processImport = async (allRows: any[], dupActions: { title: string; action: "overwrite" | "addnew" | "skip" }[]) => {
    console.log("[IMPORT] ====== Starting import ======", { totalRows: allRows.length, dupActions: dupActions.length });
    const actionMap = new Map(dupActions.map((d) => [d.title.toLowerCase(), d.action]));
    const asinFromUrl = (url: string) => {
      const m = url?.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/i);
      return m ? m[2].toUpperCase() : url?.toLowerCase();
    };
    let added = 0, skipped = 0, updated = 0, failed = 0;
    const errorDetails: string[] = [];

    try {
      // === PHASE 1: Simple approach - only insert core fields ===
      console.log("[IMPORT] PHASE 1 - Starting import");

      // === PHASE 2: Load existing categories, brands & countries ===
      const { data: freshCats } = await supabase.from("categories").select("*");
      const { data: freshBrands } = await supabase.from("brands").select("*");
      const { data: freshCountries } = await supabase.from("countries").select("*");
      let liveCats: any[] = freshCats || [];
      let liveBrands: any[] = freshBrands || [];
      let liveCountries: any[] = freshCountries || [];
      console.log("[IMPORT] PHASE 2 - Existing data:", { cats: liveCats.length, brands: liveBrands.length, countries: liveCountries.length });

      const catSlugMap = new Map(liveCats.map((c: any) => [c.slug, c.id]));
      const brandSlugMap = new Map(liveBrands.map((b: any) => [b.slug, b.id]));
      const catNameMap = new Map(liveCats.map((c: any) => [c.name.toLowerCase(), c.id]));
      const brandNameMap = new Map(liveBrands.map((b: any) => [b.name.toLowerCase(), b.id]));
      const countryCodeMap = new Map(liveCountries.map((c: any) => [c.code.toLowerCase(), c.code]));

      // === PHASE 3: Collect unique brands & categories from CSV ===
      const csvBrands = new Map<string, { name: string; slug: string; categorySlug: string }>();
      const csvCats = new Map<string, { name: string; slug: string }>();

      // Helper: generate slug from name
      const toSlug = (name: string) => name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');

      for (const row of allRows) {
        const userAction = actionMap.get(row.title?.toLowerCase());
        if (userAction === "skip") continue;

        // Collect category: prefer explicit slug, fallback to generated slug from name
        const catName = row.category_name?.trim();
        const catSlug = row.category_slug?.trim() || (catName ? toSlug(catName) : '');
        if (catName && catSlug) {
          csvCats.set(catSlug, { name: catName, slug: catSlug });
        }

        // Collect brand: prefer explicit slug, fallback to generated slug from name
        const brandName = row.brand_name?.trim();
        const brandSlug = row.brand_slug?.trim() || (brandName ? toSlug(brandName) : '');
        if (brandName && brandSlug) {
          let targetCatSlug = catSlug;
          if (!targetCatSlug && row.category_id) {
            const existingCat = liveCats.find((c: any) => c.id === row.category_id);
            if (existingCat) targetCatSlug = existingCat.slug;
          }
          csvBrands.set(brandSlug, { name: brandName, slug: brandSlug, categorySlug: targetCatSlug });
        }
      }
      console.log("[IMPORT] PHASE 3 - CSV unique items:", { csvCats: Array.from(csvCats.keys()), csvBrands: Array.from(csvBrands.entries()) });

      // === PHASE 4: Create missing categories FIRST (core fields only) ===
      for (const [, cat] of csvCats) {
        if (catSlugMap.has(cat.slug)) continue;
        const catPayload = { name: cat.name, slug: cat.slug, sort_order: liveCats.length + 1 };
        console.log("[IMPORT] PHASE 4 - Creating category:", catPayload);
        const { data: newCat, error: catErr } = await supabase.from("categories").insert(catPayload).select();
        if (catErr) { console.error("[IMPORT] PHASE 4 - Category FAILED:", cat.name, catErr); errorDetails.push(`Category "${cat.name}": ${catErr.message}`); continue; }
        if (newCat && newCat[0]) {
          console.log("[IMPORT] PHASE 4 - Category created:", newCat[0]);
          catSlugMap.set(cat.slug, newCat[0].id);
          catNameMap.set(cat.name.toLowerCase(), newCat[0].id);
          liveCats.push(newCat[0]);
        }
      }
      console.log("[IMPORT] PHASE 4 done - cats now:", liveCats.length);

      // === PHASE 5: Create missing brands (need valid category_id) ===
      for (const [, brand] of csvBrands) {
        if (brandSlugMap.has(brand.slug)) { console.log("[IMPORT] PHASE 5 - Brand exists:", brand.slug); continue; }
        let catId = catSlugMap.get(brand.categorySlug);
        if (!catId && liveCats.length > 0) catId = liveCats[0].id;
        if (!catId) { console.error("[IMPORT] PHASE 5 - No catId for brand:", brand); errorDetails.push(`Brand "${brand.name}": no category`); continue; }
        const brandPayload = { name: brand.name, slug: brand.slug, category_id: catId, sort_order: liveBrands.length + 1 };
        console.log("[IMPORT] PHASE 5 - Creating brand:", brandPayload);
        const { data: newBrand, error: brandErr } = await supabase.from("brands").insert(brandPayload).select();
        if (brandErr) { console.error("[IMPORT] PHASE 5 - Brand FAILED:", brand.name, brandErr); errorDetails.push(`Brand "${brand.name}": ${brandErr.message}`); continue; }
        if (newBrand && newBrand[0]) {
          console.log("[IMPORT] PHASE 5 - Brand created:", newBrand[0]);
          brandSlugMap.set(brand.slug, newBrand[0].id);
          brandNameMap.set(brand.name.toLowerCase(), newBrand[0].id);
          liveBrands.push(newBrand[0]);
        }
      }
      console.log("[IMPORT] PHASE 5 done - brands now:", liveBrands.length);

      // === PHASE 5b: Auto-create countries ===
      const csvCountries = [...new Set(allRows.map((r: any) => (r.country || "us").toString().trim().toLowerCase()).filter(Boolean))];
      const missingCountries = csvCountries.filter((c: string) => !countryCodeMap.has(c));
      console.log("[IMPORT] PHASE 5b - Countries:", { csvCountries, missing: missingCountries });
      for (const countryCode of missingCountries) {
        const countryPayload = { code: countryCode, name: countryCode.toUpperCase(), currency_symbol: "$", flag: "", sort_order: 99, is_active: true };
        console.log("[IMPORT] PHASE 5b - Creating country:", countryPayload);
        const { data: newCountry, error: countryErr } = await supabase.from("countries").insert(countryPayload).select();
        if (countryErr) { console.error("[IMPORT] PHASE 5b - Country FAILED:", countryCode, countryErr); errorDetails.push(`Country "${countryCode}": ${countryErr.message}`); continue; }
        if (newCountry && newCountry[0]) {
          countryCodeMap.set(countryCode, newCountry[0].code);
          liveCountries.push(newCountry[0]);
        }
      }
      console.log("[IMPORT] PHASE 5b done - countries now:", liveCountries.length);

      // === PHASE 6: Assign IDs and insert products ===
      const dbCols = ["title", "image_url", "price", "amazon_link", "description", "category_id", "brand_id", "rating", "reviews", "country"];
      const failedRows: any[] = [];

      // Prepare fallback IDs (use first available if lookup fails)
      const fallbackCategoryId = liveCats.length > 0 ? liveCats[0].id : null;
      const fallbackBrandId = liveBrands.length > 0 ? liveBrands[0].id : null;

      for (let i = 0; i < allRows.length; i++) {
        const row = allRows[i];
        const userAction = actionMap.get(row.title?.toLowerCase());
        if (userAction === "skip") { skipped++; continue; }

        // Resolve category_id: explicit ID > lookup by slug > lookup by name > fallback
        const catSlugFromName = row.category_name?.trim() ? toSlug(row.category_name) : '';
        let resolvedCatId: number | null = null;
        if (row.category_id && parseInt(String(row.category_id)) > 0) {
          const exists = liveCats.some((c: any) => c.id === parseInt(String(row.category_id)));
          if (exists) resolvedCatId = parseInt(String(row.category_id));
        }
        if (!resolvedCatId && row.category_slug) {
          resolvedCatId = catSlugMap.get(row.category_slug) || null;
        }
        if (!resolvedCatId && catSlugFromName) {
          resolvedCatId = catSlugMap.get(catSlugFromName) || null;
        }
        if (!resolvedCatId && row.category_name) {
          resolvedCatId = catNameMap.get(row.category_name.toLowerCase()) || null;
        }
        if (!resolvedCatId && fallbackCategoryId) {
          resolvedCatId = fallbackCategoryId;
          console.warn(`[IMPORT] Row ${i}: using fallback category_id=${fallbackCategoryId} for "${row.title?.substring(0,40)}"`);
        }
        row.category_id = resolvedCatId;

        // Resolve brand_id: explicit ID > lookup by slug > lookup by name > fallback
        const brandSlugFromName = row.brand_name?.trim() ? toSlug(row.brand_name) : '';
        let resolvedBrandId: number | null = null;
        if (row.brand_id && parseInt(String(row.brand_id)) > 0) {
          const exists = liveBrands.some((b: any) => b.id === parseInt(String(row.brand_id)));
          if (exists) resolvedBrandId = parseInt(String(row.brand_id));
        }
        if (!resolvedBrandId && row.brand_slug) {
          resolvedBrandId = brandSlugMap.get(row.brand_slug) || null;
        }
        if (!resolvedBrandId && brandSlugFromName) {
          resolvedBrandId = brandSlugMap.get(brandSlugFromName) || null;
        }
        if (!resolvedBrandId && row.brand_name) {
          resolvedBrandId = brandNameMap.get(row.brand_name.toLowerCase()) || null;
        }
        if (!resolvedBrandId && fallbackBrandId) {
          resolvedBrandId = fallbackBrandId;
          console.warn(`[IMPORT] Row ${i}: using fallback brand_id=${fallbackBrandId} for "${row.title?.substring(0,40)}"`);
        }
        row.brand_id = resolvedBrandId;

        // Skip if still no valid category/brand after all fallbacks
        if (!row.category_id) {
          failed++;
          errorDetails.push(`Row ${i + 1} "${row.title?.substring(0, 40)}": no valid category_id (and no fallback available)`);
          failedRows.push({title: row.title, err: "No valid category"});
          continue;
        }
        if (!row.brand_id) {
          failed++;
          errorDetails.push(`Row ${i + 1} "${row.title?.substring(0, 40)}": no valid brand_id (and no fallback available)`);
          failedRows.push({title: row.title, err: "No valid brand"});
          continue;
        }

        // Build clean row
        const cleanRow: Record<string, any> = {};
        const seed = row.title || String(Date.now() + Math.random());
        dbCols.forEach((c) => {
          if (c === "rating") {
            cleanRow[c] = row[c] && row[c].toString().trim() ? parseFloat(row[c]) : generateRating(seed);
          } else if (c === "reviews") {
            cleanRow[c] = row[c] && row[c].toString().trim() ? parseInt(row[c]) : generateReviews(seed);
          } else if (c === "country") {
            cleanRow[c] = (row[c] || "").toString().trim().toLowerCase();
          } else if (c === "category_id" || c === "brand_id") {
            cleanRow[c] = row[c]; // Already resolved above
          } else if (row[c] !== undefined && row[c] !== null && row[c] !== "") {
            cleanRow[c] = row[c];
          }
        });

        if (i < 5) console.log(`[IMPORT] PHASE 6 - Row ${i}: title="${row.title?.substring(0,40)}" cat_id=${row.category_id} brand_id=${row.brand_id}`, cleanRow);

        if (userAction === "overwrite") {
          const asin = asinFromUrl(row.amazon_link);
          const { error: updErr } = await supabase.from("products").update(cleanRow).ilike("amazon_link", `%${asin}%`);
          if (updErr) { failed++; errorDetails.push(`Update "${row.title?.substring(0, 40)}": ${updErr.message}`); failedRows.push({title: row.title, err: updErr.message}); }
          else { updated++; }
          continue;
        }

        const { error: insErr } = await supabase.from("products").insert(cleanRow);
        if (insErr) {
          failed++;
          errorDetails.push(`Insert "${row.title?.substring(0, 40)}": ${insErr.message}`);
          failedRows.push({title: row.title, err: insErr.message, cleanRow});
          if (failed <= 5) console.error(`[IMPORT] PHASE 6 - Insert FAILED (${failed}):`, row.title?.substring(0,50), insErr.message, cleanRow);
        } else { added++; }
      }

      console.log("[IMPORT] ====== Done ======", { added, skipped, updated, failed, failedRows: failedRows.slice(0,5) });
      setImportResult({ added, skipped, updated, failed });
      if (errorDetails.length > 0) {
        const summary = errorDetails.slice(0, 5).join("; ");
        setError(`Import: ${added} added, ${failed} failed. ${summary}${errorDetails.length > 5 ? ` (+${errorDetails.length - 5} more)` : ""}`);
      }
    } catch (err: any) {
      console.error("[IMPORT] CRASH:", err);
      setError(`Import error: ${err.message}`);
    }
    setDuplicateModal(null);
    setPendingRows([]);
    loadData();
    setTimeout(() => setImportResult(null), 15000);
  };

  const handleCSVExport = () => {
    const headers = ["title", "image_url", "price", "amazon_link", "description", "features", "category_id", "category_name", "category_slug", "brand_id", "brand_name", "brand_slug", "rating", "reviews", "country"];
    const catMap = new Map(categories.map((c: any) => [c.id, c]));
    const brandMap = new Map(brands.map((b: any) => [b.id, b]));
    const rows = products.map((p) => {
      const cat = catMap.get(p.category_id);
      const br = brandMap.get(p.brand_id);
      const vals: Record<string, string> = {
        title: p.title || "",
        image_url: p.image_url || "",
        price: String(p.price ?? ""),
        amazon_link: p.amazon_link || "",
        description: p.description || "",
        features: p.features || "",
        category_id: String(p.category_id ?? ""),
        category_name: cat?.name || "",
        category_slug: cat?.slug || "",
        brand_id: String(p.brand_id ?? ""),
        brand_name: br?.name || "",
        brand_slug: br?.slug || "",
        rating: String(p.rating ?? ""),
        reviews: String(p.reviews ?? ""),
        country: p.country || "us",
      };
      return headers.map((h) => `"${(vals[h] ?? "").replace(/"/g, '""')}"`).join(",");
    });
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "products.csv"; a.click();
  };

  // Duplicate resolution modal
  const DuplicateModal = () => {
    if (!duplicateModal) return null;
    const [actions, setActions] = useState<Record<string, "overwrite" | "addnew" | "skip">>({});
    const [importing, setImporting] = useState(false);
    const dupKey = (r: any) => r.amazon_link?.toLowerCase() || r.title?.toLowerCase() || "";

    const handleConfirm = async () => {
      if (importing) return; // Prevent double-click
      setImporting(true);
      const dupActions = duplicateModal.rows.map((r) => ({
        title: r.title,
        action: actions[dupKey(r)] || "skip",
      }));
      // Process ALL pending rows (not just duplicates), with user's choices applied
      await processImport(pendingRows, dupActions);
      setImporting(false);
    };

    const asinDisplay = (url: string) => {
      const m = url?.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/i);
      return m ? `ASIN: ${m[2]}` : url;
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Duplicate Products Found</h3>
          <p className="text-sm text-gray-500 mb-4">These products already exist (matched by Amazon link). Choose an action for each:</p>
          <div className="space-y-3">
            {duplicateModal.rows.map((row) => (
              <div key={dupKey(row)} className="border border-gray-100 rounded-lg p-3">
                <p className="font-medium text-gray-900 text-sm">{row.title}</p>
                <p className="text-xs text-gray-400 mb-2">{asinDisplay(row.amazon_link)}</p>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="radio" name={`dup-${dupKey(row)}`} onChange={() => setActions({ ...actions, [dupKey(row)]: "overwrite" })} checked={actions[dupKey(row)] === "overwrite"} />
                    Overwrite
                  </label>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="radio" name={`dup-${dupKey(row)}`} onChange={() => setActions({ ...actions, [dupKey(row)]: "addnew" })} checked={actions[dupKey(row)] === "addnew"} />
                    Add as new
                  </label>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="radio" name={`dup-${dupKey(row)}`} onChange={() => setActions({ ...actions, [dupKey(row)]: "skip" })} checked={(actions[dupKey(row)] || "skip") === "skip"} />
                    Skip
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleConfirm} disabled={importing} className={`px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-2 ${importing ? "bg-gray-400 cursor-not-allowed" : "bg-[#FF9900] hover:bg-[#E68A00]"}`}>
              {importing ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Importing...
                </>
              ) : (
                "Confirm Import"
              )}
            </button>
            <button onClick={() => { if (!importing) setDuplicateModal(null); }} disabled={importing} className={`px-4 py-2 rounded-lg text-sm ${importing ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"}`}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {error && <ErrorMsg msg={error} onClose={() => setError("")} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Products ({products.length})</h2>
        <div className="flex gap-2 flex-wrap items-center">
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-gray-500">{selectedIds.size} selected</span>
              <button
                onClick={async () => {
                  if (!confirm(`Delete ${selectedIds.size} selected products? This cannot be undone.`)) return;
                  setLoading(true);
                  let failed = 0;
                  const ids = Array.from(selectedIds);
                  for (let i = 0; i < ids.length; i += 50) {
                    const batch = ids.slice(i, i + 50);
                    const { error: delErr } = await supabase.from("products").delete().in("id", batch);
                    if (delErr) failed += batch.length;
                  }
                  setSelectedIds(new Set());
                  if (failed > 0) setError(`${failed} products failed to delete.`);
                  loadData();
                }}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete ({selectedIds.size})
              </button>
            </>
          )}
          <label className="cursor-pointer px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-1.5">
            <Upload className="w-4 h-4" /> Import
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
          </label>
          <button onClick={handleCSVExport} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", image_url: "", price: "", amazon_link: "", description: "", features: "", category_id: "", brand_id: "", rating: "", reviews: "", country: "us" }); }} className="px-3 py-2 bg-[#FF9900] hover:bg-[#E68A00] rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900]" />
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
            <input placeholder="Image URL *" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
            <input placeholder="Price *" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
            <input placeholder="Amazon Link *" value={form.amazon_link} onChange={(e) => setForm({ ...form, amazon_link: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name} (ID:{c.id})</option>)}
            </select>
            <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Brand</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name} (ID:{b.id})</option>)}
            </select>
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" required>
              <option value="">Select country</option>
              {countries.map((c) => (<option key={c.code} value={c.code}>{c.flag} {c.code.toUpperCase()} ({c.name})</option>))}
            </select>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Rating (e.g. 4.7, blank = random 4.7-4.8)" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <input placeholder="Reviews (e.g. 100, blank = random 10-200)" value={form.reviews} onChange={(e) => setForm({ ...form, reviews: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-lg text-sm font-medium">{editId ? "Update" : "Create"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}
      {sortOrderTip && (
        <div className="bg-orange-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
          <strong>Tip:</strong> To enable drag-to-sort, run this in Supabase SQL Editor:
          <code className="block mt-1 bg-blue-100 px-2 py-1 rounded text-xs font-mono">ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0;</code>
          <button onClick={() => setSortOrderTip(false)} className="text-xs text-blue-500 hover:underline mt-1">Dismiss</button>
        </div>
      )}
      {importResult && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-700">
          Import complete: {importResult.added} added{importResult.failed ? `, ${importResult.failed} failed` : ""}, {importResult.updated} updated, {importResult.skipped} skipped
        </div>
      )}
      {duplicateModal && <DuplicateModal />}
      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="px-2 py-2 text-left w-8">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every((p: any) => selectedIds.has(p.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(filtered.map((p: any) => p.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                      className="w-4 h-4 accent-[#FF9900]"
                    />
                  </th>
                  <th className="px-2 py-2 text-left w-8">Order</th>
                  <th className="px-4 py-2 text-left">Image</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Cat / Brand</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-center">Country</th>
                  <th className="px-4 py-2 text-left">Rating</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  const brand = brands.find((b) => b.id === p.brand_id);
                  const sameBrand = sortedProducts.filter((x) => x.brand_id === p.brand_id);
                  const posInBrand = sameBrand.findIndex((x) => x.id === p.id);
                  const isSelected = selectedIds.has(p.id);
                  return (
                    <tr key={p.id} className={`border-t border-gray-50 hover:bg-gray-50 ${isSelected ? "bg-orange-50/40" : ""}`}>
                      <td className="px-2 py-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = new Set(selectedIds);
                            if (e.target.checked) next.add(p.id);
                            else next.delete(p.id);
                            setSelectedIds(next);
                          }}
                          className="w-4 h-4 accent-[#FF9900]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveProduct(p.id, "up")} disabled={posInBrand === 0} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30" title="Move up">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                          </button>
                          <button onClick={() => moveProduct(p.id, "down")} disabled={posInBrand === sameBrand.length - 1} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30" title="Move down">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2"><img src={p.image_url} alt="" className="w-10 h-10 rounded object-cover" /></td>
                      <td className="px-4 py-2 font-medium text-gray-900 max-w-[150px] truncate">{p.title}</td>
                      <td className="px-4 py-2 text-xs text-gray-500">{cat?.name || "-"} / {brand?.name || "-"}</td>
                      <td className="px-4 py-2">${p.price}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${p.country === "de" ? "bg-black text-white" : p.country === "es" ? "bg-red-50 text-red-700" : p.country === "it" ? "bg-green-50 text-green-700" : p.country === "fr" ? "bg-orange-50 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                          {p.country?.toUpperCase() || "US"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-[#FFA41C] fill-[#FFA41C]" />
                          <span className="text-gray-700">{p.rating ?? "-"}</span>
                          <span className="text-gray-400">({p.reviews ?? 0})</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => handleEdit(p)} className="p-1 hover:bg-gray-100 rounded mr-1"><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No products found</p>}
        </div>
      )}
    </div>
  );
}

/* ============ Messages ============ */
function MessagesTab() {
  const [messages, setMessages] = useState<any[]>([]);
  const [replying, setReplying] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  async function load() {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    setMessages(data || []);
  }

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => { await supabase.from("messages").update({ is_read: 1 }).eq("id", id); load(); };
  const sendReply = async (id: number) => { if (!replyText.trim()) return; await supabase.from("messages").update({ reply: replyText }).eq("id", id); setReplying(null); setReplyText(""); load(); };
  const del = async (id: number) => { if (!confirm("Delete?")) return; await supabase.from("messages").delete().eq("id", id); load(); };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Messages ({messages.filter((m) => !m.is_read).length} new)</h2>
      {messages.map((m) => (
        <div key={m.id} className={`bg-white rounded-xl border p-4 ${!m.is_read ? "border-[#FF9900]/30" : "border-gray-100"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{m.name}</span>
            <span className="text-xs text-gray-400">{m.email}</span>
            {!m.is_read && <span className="text-xs bg-[#FF9900] text-white px-1.5 py-0.5 rounded-full">New</span>}
          </div>
          <p className="text-sm text-gray-600 mb-2">{m.content}</p>
          {m.reply && <div className="bg-green-50 rounded-lg p-2 text-sm text-green-700 mb-2"><strong>Reply:</strong> {m.reply}</div>}
          {replying === m.id ? (
            <div className="flex gap-2">
              <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type reply..." className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
              <button onClick={() => sendReply(m.id)} className="px-3 py-1.5 bg-[#FF9900] text-white rounded-lg text-sm">Send</button>
              <button onClick={() => setReplying(null)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm">Cancel</button>
            </div>
          ) : (
            <div className="flex gap-2">
              {!m.is_read && <button onClick={() => markRead(m.id)} className="text-xs text-[#FF9900] hover:underline">Mark read</button>}
              <button onClick={() => { setReplying(m.id); setReplyText(""); }} className="text-xs text-blue-600 hover:underline">Reply</button>
              <button onClick={() => del(m.id)} className="text-xs text-red-400 hover:underline">Delete</button>
            </div>
          )}
        </div>
      ))}
      {messages.length === 0 && <p className="text-sm text-gray-400">No messages</p>}
    </div>
  );
}

/* ============ Subscribers ============ */
function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data, error: err } = await supabase.from("subscribers").select("*").order("subscribed_at", { ascending: false });
      if (err) throw err;
      setSubscribers(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load subscribers");
    }
  }

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this subscriber?")) return;
    try {
      await supabase.from("subscribers").delete().eq("id", id);
      load();
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorMsg msg={error} onClose={() => setError("")} />}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Subscribers ({subscribers.length})</h2>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Subscribed At</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2 text-xs text-[#FF9900] font-mono">{s.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{s.email}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{s.subscribed_at ? new Date(s.subscribed_at).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleDelete(s.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {subscribers.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No subscribers yet</p>}
      </div>
    </div>
  );
}

/* ============ Categories ============ */
function CategoriesTab() {
  const [items, setItems] = useState<any[]>([]);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data, error: err } = await supabase.from("categories").select("*").order("sort_order");
      if (err) throw err;
      setItems(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load");
    }
  }

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      if (editId) {
        const newId = parseInt(id);
        if (newId && newId !== editId) {
          // ID changed: temp rename old slug → insert new → update refs → delete old
          const oldItem = items.find((i) => i.id === editId);
          const tempSlug = `__temp_${Date.now()}_${Math.floor(Math.random()*10000)}`;
          await supabase.from("categories").update({ slug: tempSlug }).eq("id", editId);
          const { error: insErr } = await supabase.from("categories").insert({ id: newId, name, slug, sort_order: oldItem?.sort_order ?? 0 });
          if (insErr) {
            // Rollback old slug
            await supabase.from("categories").update({ slug }).eq("id", editId);
            throw insErr;
          }
          await supabase.from("products").update({ category_id: newId }).eq("category_id", editId);
          await supabase.from("brands").update({ category_id: newId }).eq("category_id", editId);
          await supabase.from("categories").delete().eq("id", editId);
        } else {
          await supabase.from("categories").update({ name, slug }).eq("id", editId);
        }
      } else {
        const insertData: any = { name, slug, sort_order: Math.floor(Date.now() / 1000) };
        const { error: err } = await supabase.from("categories").insert(insertData);
        if (err) throw err;
      }
      setId(""); setName(""); setSlug(""); setEditId(null); load();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    }
  };

  const handleDelete = async (id: number) => {
    // Count products and brands associated with this category
    const [{ count: productCount }, { count: brandCount }] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id),
      supabase.from("brands").select("id", { count: "exact", head: true }).eq("category_id", id),
    ]);
    const total = (productCount || 0) + (brandCount || 0);
    if (total > 0) {
      const msg = `This category has ${productCount || 0} product(s) and ${brandCount || 0} brand(s).\nDeleting it will CASCADE DELETE all associated items.\n\nAre you sure?`;
      if (!confirm(msg)) return;
      // Cascade delete: products first, then brands, then category
      await supabase.from("products").delete().eq("category_id", id);
      await supabase.from("brands").delete().eq("category_id", id);
    }
    try { await supabase.from("categories").delete().eq("id", id); load(); } catch (err: any) { setError(err.message); }
  };

  const moveCategory = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;
    const [curr, swap] = [items[index], items[swapIndex]];
    const [tempSort, swapSort] = [curr.sort_order ?? 0, swap.sort_order ?? 0];
    await supabase.from("categories").update({ sort_order: swapSort }).eq("id", curr.id);
    await supabase.from("categories").update({ sort_order: tempSort }).eq("id", swap.id);
    load();
  };

  return (
    <div className="space-y-4">
      {error && <ErrorMsg msg={error} onClose={() => setError("")} />}
      <h2 className="text-xl font-bold text-gray-900">Categories</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        <input placeholder="ID (optional)" value={id} onChange={(e) => setId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" type="number" />
        <input placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)} className="sm:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
        <input placeholder="Slug *" value={slug} onChange={(e) => setSlug(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-[#FF9900] text-white rounded-lg text-sm font-medium">{editId ? "Update" : "Add"}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setId(""); setName(""); setSlug(""); }} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Cancel</button>}
        </div>
      </form>
      <div className="bg-white rounded-xl border border-gray-100">
        {items.map((c, idx) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveCategory(idx, "up")} disabled={idx === 0} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"><svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                <button onClick={() => moveCategory(idx, "down")} disabled={idx === items.length - 1} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"><svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
              </div>
              <div>
                <span className="font-medium text-gray-900">{c.name}</span>
                <span className="text-xs text-gray-400 ml-1">/{c.slug}</span>
                <span className="text-xs text-[#FF9900] ml-2 font-mono bg-orange-50 px-1.5 py-0.5 rounded">ID: {c.id}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditId(c.id); setId(String(c.id)); setName(c.name); setSlug(c.slug); }} className="p-1 hover:bg-gray-100 rounded"><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
              <button onClick={() => handleDelete(c.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400 px-4 py-8 text-center">No categories</p>}
      </div>
    </div>
  );
}

/* ============ Brands ============ */
function BrandsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [{ data: b }, { data: c }] = await Promise.all([
        supabase.from("brands").select("*").order("sort_order"),
        supabase.from("categories").select("*"),
      ]);
      setItems(b || []);
      setCategories(c || []);
    } catch (err: any) {
      setError(err.message || "Failed to load");
    }
  }

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      if (editId) {
        const newId = parseInt(id);
        if (newId && newId !== editId) {
          // ID changed: temp rename old slug → insert new → update refs → delete old
          const oldItem = items.find((i) => i.id === editId);
          const tempSlug = `__temp_${Date.now()}_${Math.floor(Math.random()*10000)}`;
          await supabase.from("brands").update({ slug: tempSlug }).eq("id", editId);
          const { error: insErr } = await supabase.from("brands").insert({ id: newId, name, slug, category_id: parseInt(categoryId) || oldItem?.category_id, sort_order: oldItem?.sort_order ?? 0 });
          if (insErr) {
            await supabase.from("brands").update({ slug }).eq("id", editId);
            throw insErr;
          }
          await supabase.from("products").update({ brand_id: newId }).eq("brand_id", editId);
          await supabase.from("brands").delete().eq("id", editId);
        } else {
          await supabase.from("brands").update({ name, slug, category_id: parseInt(categoryId) || null }).eq("id", editId);
        }
      } else {
        const data: any = { name, slug, category_id: parseInt(categoryId) || null, sort_order: Math.floor(Date.now() / 1000) };
        const { error: err } = await supabase.from("brands").insert(data);
        if (err) throw err;
      }
      setId(""); setName(""); setSlug(""); setCategoryId(""); setEditId(null); load();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    }
  };

  const handleDelete = async (id: number) => {
    // Count products associated with this brand
    const { count: productCount } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("brand_id", id);
    if (productCount && productCount > 0) {
      const msg = `This brand has ${productCount} product(s).\nDeleting it will CASCADE DELETE all associated products.\n\nAre you sure?`;
      if (!confirm(msg)) return;
      // Cascade delete: products first, then brand
      await supabase.from("products").delete().eq("brand_id", id);
    }
    try { await supabase.from("brands").delete().eq("id", id); load(); } catch (err: any) { setError(err.message); }
  };

  const moveBrand = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;
    const [curr, swap] = [items[index], items[swapIndex]];
    const [tempSort, swapSort] = [curr.sort_order ?? 0, swap.sort_order ?? 0];
    await supabase.from("brands").update({ sort_order: swapSort }).eq("id", curr.id);
    await supabase.from("brands").update({ sort_order: tempSort }).eq("id", swap.id);
    load();
  };

  return (
    <div className="space-y-4">
      {error && <ErrorMsg msg={error} onClose={() => setError("")} />}
      <h2 className="text-xl font-bold text-gray-900">Brands</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-6 gap-2">
        <input placeholder="ID (optional)" value={id} onChange={(e) => setId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" type="number" />
        <input placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)} className="sm:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
        <input placeholder="Slug *" value={slug} onChange={(e) => setSlug(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">Category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name} (ID:{c.id})</option>)}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-[#FF9900] text-white rounded-lg text-sm font-medium">{editId ? "Update" : "Add"}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setId(""); setName(""); setSlug(""); setCategoryId(""); }} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Cancel</button>}
        </div>
      </form>
      <div className="bg-white rounded-xl border border-gray-100">
        {items.map((b, idx) => (
          <div key={b.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveBrand(idx, "up")} disabled={idx === 0} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"><svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                <button onClick={() => moveBrand(idx, "down")} disabled={idx === items.length - 1} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"><svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
              </div>
              <div>
                <span className="font-medium text-gray-900">{b.name}</span>
                <span className="text-xs text-gray-400 ml-1">/{b.slug}</span>
                <span className="text-xs text-[#FF9900] ml-2 font-mono bg-orange-50 px-1.5 py-0.5 rounded">ID: {b.id}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditId(b.id); setId(String(b.id)); setName(b.name); setSlug(b.slug); setCategoryId(String(b.category_id || "")); }} className="p-1 hover:bg-gray-100 rounded"><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
              <button onClick={() => handleDelete(b.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400 px-4 py-8 text-center">No brands</p>}
      </div>
    </div>
  );
}

/* ============ Carousel ============ */
function CarouselTab() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ image_url: "", title: "", subtitle: "", link: "", sort_order: "0" });
  const [editId, setEditId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data, error: err } = await supabase.from("carousel").select("*").order("sort_order");
      if (err) throw err;
      setItems(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load");
    }
  }

  useEffect(() => { load(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) { setUploadError("Only JPG, PNG, WebP allowed"); return; }
    if (file.size > 2 * 1024 * 1024) { setUploadError("Max 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { const result = ev.target?.result as string; setPreviewUrl(result); setForm((p) => ({ ...p, image_url: result })); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      if (!form.image_url) { setUploadError("Please upload an image"); return; }
      const data = { ...form, sort_order: parseInt(form.sort_order) || 0 };
      if (editId) {
        await supabase.from("carousel").update(data).eq("id", editId);
      } else {
        await supabase.from("carousel").insert({ ...data, is_active: 1 });
      }
      setShowForm(false); setEditId(null); setForm({ image_url: "", title: "", subtitle: "", link: "", sort_order: "0" }); setPreviewUrl(""); setUploadError(""); load();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    }
  };

  const toggleActive = async (id: number, current: number) => {
    await supabase.from("carousel").update({ is_active: current ? 0 : 1 }).eq("id", id);
    load();
  };

  const startEdit = (item: any) => { setEditId(item.id); setForm({ image_url: item.image_url, title: item.title || "", subtitle: item.subtitle || "", link: item.link || "", sort_order: String(item.sort_order || 0) }); setPreviewUrl(item.image_url); setUploadError(""); setShowForm(true); };
  const startAdd = () => { setEditId(null); setForm({ image_url: "", title: "", subtitle: "", link: "", sort_order: "0" }); setPreviewUrl(""); setUploadError(""); setShowForm(true); };

  return (
    <div className="space-y-4">
      {error && <ErrorMsg msg={error} onClose={() => setError("")} />}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Carousel</h2>
        <button onClick={startAdd} className="px-3 py-2 bg-[#FF9900] text-white rounded-lg text-sm font-medium flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Slide</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Upload className="w-4 h-4" /> {previewUrl ? "Change" : "Upload"}
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            </label>
            <span className="text-xs text-gray-400">JPG/PNG/WebP, max 2MB, 1200x400px</span>
          </div>
          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          {previewUrl && <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-contain rounded-lg border border-gray-100 bg-gray-50" />}
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <input placeholder="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <input placeholder="Sort Order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-[#FF9900] text-white rounded-lg text-sm font-medium">{editId ? "Update" : "Create"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
            <img src={item.image_url} alt="" className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.title || "Untitled"}</p>
              <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => toggleActive(item.id, item.is_active)} className={`text-xs px-2 py-1 rounded ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.is_active ? "Active" : "Inactive"}</button>
                <button onClick={() => startEdit(item)} className="text-xs text-blue-600 hover:underline">Edit</button>
                <button onClick={() => { if (confirm("Delete?")) { supabase.from("carousel").delete().eq("id", item.id).then(() => load()); } }} className="text-xs text-red-400 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No slides</p>}
      </div>
    </div>
  );
}

/* ============ Navigation ============ */
const DEFAULT_NAV_ITEMS = [
  { label: "Home", link: "/", sort_order: 0, parent_id: 0 },
  { label: "Products", link: "#products", sort_order: 1, parent_id: 0 },
  { label: "About", link: "/about", sort_order: 2, parent_id: 0 },
  { label: "Contact", link: "/contact", sort_order: 3, parent_id: 0 },
];

function CountriesTab() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ code: "", name: "", currency_symbol: "", flag: "", sort_order: 0, is_active: true });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("countries").select("*").order("sort_order", { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from("countries").update(form).eq("id", editingId);
    } else {
      await supabase.from("countries").insert(form);
    }
    setForm({ code: "", name: "", currency_symbol: "", flag: "", sort_order: 0, is_active: true });
    setEditingId(null);
    fetchItems();
  };

  const handleEdit = (item: any) => { setForm({ ...item }); setEditingId(item.id); };
  const handleDelete = async (id: number) => { if (confirm("Delete?")) { await supabase.from("countries").delete().eq("id", id); fetchItems(); } };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="grid grid-cols-6 gap-2">
        <input placeholder="Code (e.g. us)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="border p-2 rounded" required />
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" required />
        <select value={form.currency_symbol} onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })} className="border p-2 rounded" title="Currency Symbol">
          <option value="">Select Currency</option>
          <option value="$">$ USD (US Dollar)</option>
          <option value="€">€ EUR (Euro)</option>
          <option value="£">£ GBP (British Pound)</option>
          <option value="¥">¥ JPY (Japanese Yen)</option>
          <option value="A$">A$ AUD (Australian Dollar)</option>
          <option value="C$">C$ CAD (Canadian Dollar)</option>
          <option value="CHF">CHF (Swiss Franc)</option>
          <option value="kr">kr SEK (Swedish Krona)</option>
          <option value="kr">kr NOK (Norwegian Krone)</option>
          <option value="kr">kr DKK (Danish Krone)</option>
          <option value="zł">zł PLN (Polish Zloty)</option>
          <option value="₹">₹ INR (Indian Rupee)</option>
          <option value="R">R ZAR (South African Rand)</option>
          <option value="R$">R$ BRL (Brazilian Real)</option>
          <option value="₩">₩ KRW (South Korean Won)</option>
          <option value="MX$">MX$ MXN (Mexican Peso)</option>
          <option value="AED">AED (UAE Dirham)</option>
          <option value="S$">S$ SGD (Singapore Dollar)</option>
        </select>
        <input placeholder="Flag emoji" value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })} className="border p-2 rounded" />
        <input type="number" placeholder="Order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="border p-2 rounded" />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? "Update" : "Add"}</button>
          {editingId && <button type="button" onClick={() => { setForm({ code: "", name: "", currency_symbol: "", flag: "", sort_order: 0, is_active: true }); setEditingId(null); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>
      <table className="w-full border text-sm">
        <thead><tr className="bg-gray-100"><th className="p-2 border">Code</th><th className="p-2 border">Name</th><th className="p-2 border">Currency</th><th className="p-2 border">Flag</th><th className="p-2 border">Order</th><th className="p-2 border">Actions</th></tr></thead>
        <tbody>{items.map((item) => (
          <tr key={item.id}>
            <td className="p-2 border font-mono">{item.code}</td>
            <td className="p-2 border">{item.name}</td>
            <td className="p-2 border">{item.currency_symbol}</td>
            <td className="p-2 border">{item.flag}</td>
            <td className="p-2 border">{item.sort_order}</td>
            <td className="p-2 border space-x-2">
              <button onClick={() => handleEdit(item)} className="text-blue-600">Edit</button>
              <button onClick={() => handleDelete(item.id)} className="text-red-600">Delete</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function NavigationTab() {
  const [items, setItems] = useState<any[]>([]);
  const [label, setLabel] = useState("");
  const [link, setLink] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  async function load() {
    try {
      const { data, error: err } = await supabase.from("navigation").select("*").order("sort_order");
      if (err) throw err;
      if (!data || data.length === 0) {
        // Auto-seed defaults into DB on first visit
        await supabase.from("navigation").insert(
          DEFAULT_NAV_ITEMS.map((n) => ({ ...n, is_active: 1 }))
        );
        const { data: seeded } = await supabase.from("navigation").select("*").order("sort_order");
        setItems(seeded || []);
      } else {
        setItems(data);
      }
      setInitialized(true);
    } catch (err: any) { setError(err.message); }
  }

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      if (editId && editId > 0) {
        await supabase.from("navigation").update({ label, link }).eq("id", editId);
      } else {
        const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order ?? 0)) + 1 : 0;
        await supabase.from("navigation").insert({ label, link, is_active: 1, sort_order: maxOrder });
      }
      setLabel(""); setLink(""); setEditId(null); load();
    } catch (err: any) { setError(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this navigation item?")) return;
    try { await supabase.from("navigation").delete().eq("id", id); load(); }
    catch (err: any) { setError(err.message); }
  };

  const moveNavItem = async (id: number, direction: "up" | "down") => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    try {
      const reordered = [...items];
      const [moved] = reordered.splice(idx, 1);
      reordered.splice(swapIdx, 0, moved);
      const updates = reordered.map((item, i) =>
        supabase.from("navigation").update({ sort_order: i }).eq("id", item.id)
      );
      await Promise.all(updates);
      load();
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorMsg msg={error} onClose={() => setError("")} />}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
        <input placeholder="Link (e.g. /about)" value={link} onChange={(e) => setLink(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
        <button type="submit" className="px-4 py-2 bg-[#FF9900] text-white rounded-lg text-sm font-medium">{editId && editId > 0 ? "Update" : "Add"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setLabel(""); setLink(""); }} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Cancel</button>}
      </form>
      {!initialized ? (
        <div className="text-sm text-gray-400 text-center py-8">Loading...</div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No navigation items</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100">
          {items.map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveNavItem(item.id, "up")} disabled={idx === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-30 leading-none">&#9650;</button>
                  <button onClick={() => moveNavItem(item.id, "down")} disabled={idx === items.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-30 leading-none">&#9660;</button>
                </div>
                <div>
                  <span className="font-medium text-gray-900">{item.label}</span>
                  <span className="text-xs text-gray-400 ml-2">{item.link}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditId(item.id); setLabel(item.label); setLink(item.link); }} className="p-1.5 hover:bg-gray-100 rounded"><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ Settings ============ */
function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const keys = [
    { key: "siteTitle", label: "Site Title" },
    { key: "contactEmail", label: "Contact Email" },
    { key: "metaKeywords", label: "Meta Keywords" },
    { key: "metaDescription", label: "Meta Description" },
    { key: "heroTitle", label: "Hero Title" },
    { key: "heroSubtitle", label: "Hero Subtitle" },
    { key: "aboutTitle", label: "About Title" },
    { key: "aboutHero", label: "About Hero Tagline" },
    { key: "aboutSubtitle", label: "About Subtitle" },
    { key: "aboutStory", label: "About Brand Story", long: true },
    { key: "aboutWhyTitle", label: "About Features Heading" },
    { key: "aboutCommitment", label: "About Commitment Heading" },
    { key: "aboutCommitmentText", label: "About Commitment Text", long: true },
    { key: "aboutCTA", label: "About CTA Heading" },
    { key: "aboutCTADesc", label: "About CTA Description" },
    { key: "footerAbout", label: "Footer About Text", long: true },
  ];

  async function load() {
    try {
      const { data } = await supabase.from("settings").select("*");
      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
    } catch (err: any) { setError(err.message); }
  }

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true); setError("");
    try {
      for (const { key } of keys) {
        const val = settings[key] || "";
        const { data: existing } = await supabase.from("settings").select("id").eq("key", key).single();
        if (existing) { await supabase.from("settings").update({ value: val }).eq("key", key); }
        else { await supabase.from("settings").insert({ key, value: val }); }
      }
    } catch (err: any) { setError(err.message); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {error && <ErrorMsg msg={error} onClose={() => setError("")} />}
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
        {keys.map(({ key, label, long }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {long ? (
              <textarea value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={4} />
            ) : key === "metaDescription" || key === "heroSubtitle" ? (
              <textarea value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
            ) : (
              <input value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            )}
          </div>
        ))}
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? "Saving..." : "Save Settings"}</button>
      </div>

      {/* Password Change */}
      <PasswordChangeSection />
    </div>
  );
}

function PasswordChangeSection() {
  const navigate = useNavigate();
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setErr("");
    if (newPass !== confirmPass) { setErr("New passwords do not match"); return; }
    if (newPass.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setLoading(true);

    // Verify old password
    const { data: stored } = await supabase.from("settings").select("value").eq("key", "adminPassword").single();
    const currentPass = stored?.value || window.__ADMIN_PASS__;
    if (oldPass !== currentPass) { setErr("Old password is incorrect"); setLoading(false); return; }

    // Update password in settings
    if (stored) {
      await supabase.from("settings").update({ value: newPass }).eq("key", "adminPassword");
    } else {
      await supabase.from("settings").insert({ key: "adminPassword", value: newPass });
    }
    setMsg("Password updated successfully! Logging out...");
    setOldPass(""); setNewPass(""); setConfirmPass("");
    setLoading(false);
    setTimeout(() => {
      localStorage.removeItem("adminToken");
      navigate("/admin");
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Lock size={18} className="text-[#FF9900]" /> Change Admin Password</h3>
      {msg && <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{msg}</p>}
      {err && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{err}</p>}
      <form onSubmit={handleChange} className="space-y-3">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label><input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label><input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required /></div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-lg text-sm font-medium disabled:opacity-50">{loading ? "Updating..." : "Update Password"}</button>
      </form>
    </div>
  );
}

/* ============ SEO ============ */
function SeoTab() {
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [savedDesc, setSavedDesc] = useState("");
  const [savedKeywords, setSavedKeywords] = useState("");

  async function load() {
    const { data } = await supabase.from("seo_settings").select("*");
    const items = data || [];
    const desc = items.find((i: any) => i.key === "metaDescription")?.value || "";
    const kw = items.find((i: any) => i.key === "metaKeywords")?.value || "";
    setMetaDescription(desc);
    setMetaKeywords(kw);
    setSavedDesc(desc);
    setSavedKeywords(kw);
  }

  useEffect(() => { load(); }, []);

  const save = async (key: string, value: string) => {
    const { data: existing } = await supabase.from("seo_settings").select("id").eq("key", key).single();
    if (existing) { await supabase.from("seo_settings").update({ value }).eq("key", key); }
    else { await supabase.from("seo_settings").insert({ key, value }); }
  };

  const handleSaveDescription = async () => {
    await save("metaDescription", metaDescription);
    setSavedDesc(metaDescription);
  };

  const handleSaveKeywords = async () => {
    await save("metaKeywords", metaKeywords);
    setSavedKeywords(metaKeywords);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">SEO Settings</h2>

      {/* Meta Description */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900">Meta Description</label>
          {savedDesc === metaDescription && metaDescription && <span className="text-xs text-green-600">Saved</span>}
        </div>
        <p className="text-xs text-gray-500">Shown in Google search results as the page description. Keep under 160 characters.</p>
        <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="e.g. ULBTER offers premium camera accessories including screen protectors and lens caps..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={3} />
        <div className="flex items-center justify-between">
          <span className={`text-xs ${metaDescription.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>{metaDescription.length}/160 chars</span>
          <button onClick={handleSaveDescription} className="px-4 py-2 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-lg text-sm font-medium">Save</button>
        </div>
      </div>

      {/* Meta Keywords */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900">Meta Keywords</label>
          {savedKeywords === metaKeywords && metaKeywords && <span className="text-xs text-green-600">Saved</span>}
        </div>
        <p className="text-xs text-gray-500">Comma-separated keywords. Note: Google no longer uses this for ranking, but some other search engines do.</p>
        <input value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="e.g. camera accessories, screen protector, gopro case, lens cap" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        <div className="flex justify-end">
          <button onClick={handleSaveKeywords} className="px-4 py-2 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-lg text-sm font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}

/* ============ Analytics ============ */
function AnalyticsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  async function load() {
    const { data } = await supabase.from("analytics").select("*");
    setItems(data || []);
  }

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("analytics").insert({ name, code, is_active: 1 });
    setName(""); setCode(""); load();
  };

  const toggleActive = async (id: number, current: number) => {
    await supabase.from("analytics").update({ is_active: current ? 0 : 1 }).eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Analytics Code</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <input placeholder="Name (e.g. Google Analytics)" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
        <textarea placeholder="Paste tracking code..." value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" rows={6} required />
        <button type="submit" className="px-4 py-2 bg-[#FF9900] text-white rounded-lg text-sm font-medium">Add Code</button>
      </form>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{item.name}</span>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(item.id, item.is_active)} className={`text-xs px-2 py-1 rounded ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.is_active ? "Active" : "Inactive"}</button>
                <button onClick={() => { if (confirm("Delete?")) { supabase.from("analytics").delete().eq("id", item.id).then(() => load()); } }} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
              </div>
            </div>
            <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded overflow-x-auto">{item.code.substring(0, 100)}...</pre>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No analytics code</p>}
      </div>
    </div>
  );
}

/* ============ Reset ============ */
function ResetTab() {
  const [confirming, setConfirming] = useState(false);

  const handleReset = async () => {
    if (!confirming) { setConfirming(true); return; }
    await Promise.all([
      supabase.from("products").delete().neq("id", 0),
      supabase.from("messages").delete().neq("id", 0),
      supabase.from("subscribers").delete().neq("id", 0),
      supabase.from("reviews").delete().neq("id", 0),
    ]);
    alert("All data has been reset.");
    setConfirming(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Reset Data</h2>
      <div className="bg-red-50 border border-red-100 rounded-xl p-6">
        <h3 className="font-semibold text-red-700 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-4">This will permanently delete all products, messages, subscribers, and reviews.</p>
        {confirming && <p className="text-sm text-red-700 mb-4 font-medium">Are you sure? Click again to confirm.</p>}
        <button onClick={handleReset} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">{confirming ? "Click again to confirm" : "Reset All Data"}</button>
        {confirming && <button onClick={() => setConfirming(false)} className="ml-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">Cancel</button>}
      </div>
    </div>
  );
}

/* ============ CSV Parser ============ */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += char; }
  }
  result.push(current.trim());
  return result.map((v) => v.replace(/^"|"$/g, ""));
}
