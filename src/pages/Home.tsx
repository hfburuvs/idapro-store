import { Link, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import { Star, ExternalLink, Camera, Watch, Search, X, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCountry } from "@/hooks/useCountry";
import Carousel from "@/components/Carousel";

/* ========================================
   Home Page — Category > Brand > Product
   With Global Search
   ======================================== */

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  category_id: number;
}

interface Product {
  id: number;
  title: string;
  image_url: string;
  price: number;
  amazon_link: string;
  description: string | null;
  brand_id: number;
  category_id: number;
}

interface CarouselSlide {
  id: number;
  image_url: string;
  title: string;
  subtitle: string;
  link: string;
  sort_order: number;
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { country, t, path } = useCountry();

  // Load categories, carousel, and settings
  useEffect(() => {
    async function loadData() {
      try {
        const [{ data: cats }, { data: slds }, { data: settings }] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order", { ascending: true }),
          supabase.from("carousel").select("*").eq("is_active", 1).order("sort_order", { ascending: true }),
          supabase.from("settings").select("*"),
        ]);
        setCategories((cats || []) as Category[]);
        setSlides((slds || []) as CarouselSlide[]);
        const map: Record<string, string> = {};
        (settings || []).forEach((s: any) => { map[s.key] = s.value; });
        setSettingsMap(map);
      } catch (err: any) {
        console.error("[Home] Failed to load data:", err);
        setCategories([]);
        setSlides([]);
        setSettingsMap({});
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Search products when query changes (filtered by country)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    async function doSearch() {
      setSearchLoading(true);
      try {
        const q = searchQuery.trim().toLowerCase();
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("country", country)
          .order("created_at", { ascending: false });
        if (error) {
          console.error("[Home] Search error:", error);
          setSearchResults([]);
          return;
        }
        const filtered = (data || []).filter((p: Product) =>
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
        setSearchResults(filtered as Product[]);
      } catch (err: any) {
        console.error("[Home] Search failed:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }
    doSearch();
  }, [searchQuery, country]);

  const clearSearch = () => {
    setSearchParams({});
  };

  // Handle ?cat=xxx param — scroll to category after data loads
  // Handle ?cat=xxx param — scroll to category after data loads
  useEffect(() => {
    const catSlug = searchParams.get("cat");
    if (!catSlug || loading || categories.length === 0) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`cat-${catSlug}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setSearchParams({}, { replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchParams, categories, loading]);

  // Handle sessionStorage scroll target (from cross-page category navigation)
  useEffect(() => {
    if (loading || categories.length === 0) return;
    const targetId = sessionStorage.getItem("scrollToCategory");
    if (!targetId) return;
    sessionStorage.removeItem("scrollToCategory");
    const timer = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
    return () => clearTimeout(timer);
  }, [categories, loading]);

  // Show search results view
  if (searchQuery) {
    return (
      <div>
        {/* Search Header */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {t("searchBtn")}: "<span className="text-[#FF9900]">{searchQuery}</span>"
                </h1>
                <p className="text-gray-400 text-sm">
                  {searchResults.length} product{searchResults.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <button
                onClick={clearSearch}
                className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {searchLoading ? (
            <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 bg-gray-200 rounded-xl" />
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-900 mb-2">{t("noResults")}</h2>
              <p className="text-sm text-gray-500 mb-4">{t("search")}</p>
              <button
                onClick={clearSearch}
                className="text-[#FF9900] hover:underline text-sm font-medium"
              >
                {t("allProducts")}
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Normal home view
  return (
    <div>
      {/* Carousel / Hero */}
      {slides.length > 0 ? (
        <Carousel slides={slides} />
      ) : (
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white" role="banner" aria-label="Hero banner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                {settingsMap["heroTitle"] || (
                  <>{t("heroTitle")}</>
                )}
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                {settingsMap["heroSubtitle"] || t("heroSubtitle")}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Category Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
        {loading ? (
          <div className="animate-pulse space-y-8" aria-hidden="true">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-8 bg-gray-200 rounded-lg w-64 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-80 bg-gray-200 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          categories.map((cat) => (
            <CategorySection key={cat.id} category={cat} />
          ))
        )}
      </main>
    </div>
  );
}

function CategorySection({ category }: { category: Category }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    async function loadBrands() {
      try {
        const { data } = await supabase
          .from("brands")
          .select("*")
          .eq("category_id", category.id)
          .order("sort_order", { ascending: true });
        setBrands((data || []) as Brand[]);
      } catch (err: any) {
        console.error("[CategorySection] Failed to load brands:", err);
        setBrands([]);
      }
    }
    loadBrands();
  }, [category.id]);

  return (
    <section id={`cat-${category.slug}`} aria-label={`${category.name} section`} className="scroll-mt-20">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-3 mb-2 group w-full text-left"
      >
        <div className="w-8 h-8 bg-[#FF9900]/10 rounded-lg flex items-center justify-center">
          {category.slug === "camera" || category.slug === "camera-accessories" ? (
            <Camera className="w-5 h-5 text-[#FF9900]" aria-hidden="true" />
          ) : category.slug === "watch" || category.slug === "watch-accessories" ? (
            <Watch className="w-5 h-5 text-[#FF9900]" aria-hidden="true" />
          ) : (
            <Star className="w-5 h-5 text-[#FF9900]" aria-hidden="true" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
        {collapsed ? (
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#FF9900] transition-colors" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-[#FF9900] transition-colors" />
        )}
      </button>
      {!collapsed && (
        <>
          <p className="text-sm text-gray-500 mb-6 ml-11">
            {category.slug === "camera" || category.slug === "camera-accessories"
              ? "Screen protectors and lens caps for cameras."
              : category.slug === "watch" || category.slug === "watch-accessories"
              ? "Screen protectors and cases for smartwatches."
              : "Browse all accessories by brand."}
          </p>
          <div className="space-y-10">
            {brands.map((brand) => (
              <BrandGroup key={brand.id} brand={brand} categoryId={category.id} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function BrandGroup({ brand, categoryId }: { brand: Brand; categoryId: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const { country } = useCountry();

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("brand_id", brand.id)
          .eq("category_id", categoryId)
          .eq("country", country)
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true });
        if (error) {
          console.error("[BrandGroup] Query error:", error);
          setProducts([]);
        } else {
          setProducts((data || []) as Product[]);
        }
      } catch (err: any) {
        console.error("[BrandGroup] Failed to load products:", err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    if (country) {
      loadProducts();
    }
  }, [brand.id, categoryId, country]);

  if (!isLoading && products.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF9900] transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#FF9900] transition-colors" />
          )}
          <span className="w-2 h-2 bg-[#FF9900] rounded-full" aria-hidden="true" />
          {brand.name}
        </h3>
        <span className="text-xs text-gray-400">{products.length} items</span>
      </button>

      {!collapsed && (
        isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" role="list" aria-label={`${brand.name} products`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { country, path, config } = useCountry();
  return (
    <article className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={path(`/product/${product.id}`)} className="block" aria-label={`View details: ${product.title}`}>
        <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-contain p-4"
            loading="lazy"
            decoding="async"
          />
        </div>
      </Link>

      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 hover:text-[#FF9900] transition-colors leading-snug">
          <Link to={path(`/product/${product.id}`)}>{product.title}</Link>
        </h4>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-gray-900">{config.currency}{product.price}</span>
          <a
            href={product.amazon_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-[#FF9900] hover:bg-[#E68A00] text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors flex-shrink-0"
            aria-label={`${config.domain}: ${product.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="hidden sm:inline">Amazon</span>
            <span className="sm:hidden">Buy</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
