import { Link, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import { Star, ExternalLink, Camera, Watch, Search, X, ChevronDown, ChevronRight, ArrowUpDown } from "lucide-react";
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
  image_url?: string | null;
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

  // Handle scroll target from other pages (via sessionStorage)
  useEffect(() => {
    if (loading || categories.length === 0) return;
    const targetId = sessionStorage.getItem("scrollToCategory");
    if (!targetId) return;
    sessionStorage.removeItem("scrollToCategory");
    // Wait for images to load, then scroll with retry
    const scrollWithRetry = (attempt: number) => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Verify scroll position after a short delay
        if (attempt < 3) {
          setTimeout(() => {
            const rect = el.getBoundingClientRect();
            if (rect.top < 0 || rect.top > window.innerHeight) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 600);
        }
      }
    };
    const timer = setTimeout(() => scrollWithRetry(0), 600);
    return () => clearTimeout(timer);
  }, [categories, loading]);

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

  // Hero carousel auto-play
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

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
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl" />
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((product) => (
                <ProductRow key={product.id} product={product} />
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
      {/* Featured Categories — above Hero */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide justify-center md:justify-start">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={path(`/#cat-${cat.slug}`)}
                onClick={(e) => {
                  e.preventDefault();
                  sessionStorage.setItem("scrollToCategory", `cat-${cat.slug}`);
                  const el = document.getElementById(`cat-${cat.slug}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="flex flex-col items-center gap-3 flex-shrink-0 group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-100 group-hover:border-orange-300 transition-all overflow-hidden bg-white shadow-sm group-hover:shadow-md flex items-center justify-center">
                  <img
                    src={cat.image_url || `/cat-${cat.slug === "camera" || cat.slug === "camera-accessories" ? "camera" : cat.slug === "watch" || cat.slug === "watch-accessories" ? "watch" : "accessories"}.jpg`}
                    alt={cat.name}
                    className="w-full h-full object-contain p-2"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 font-bold text-lg">${cat.name.charAt(0)}</div>`;
                      }
                    }}
                  />
                </div>
                <span className="text-xs md:text-sm text-gray-700 group-hover:text-[#FF9900] transition-colors text-center whitespace-nowrap">{cat.name}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Hero / Carousel */}
      <section className="hero-pattern py-12 md:py-16" role="banner" aria-label="Hero banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left: Text content */}
            <div className="flex-1 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-[#FF9900] rounded-full animate-pulse" />
                {settingsMap["heroBadge"] || t("heroBadge") || "New Collection 2026"}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {settingsMap["heroTitle"] ? (
                  <span dangerouslySetInnerHTML={{ __html: settingsMap["heroTitle"].replace(/Quality/g, '<span class="text-[#FF9900]">Quality</span>') }} />
                ) : (
                  <>{t("heroTitle")?.split("Quality")[0] || "Discover "}<span className="text-[#FF9900]">Quality</span>{t("heroTitle")?.split("Quality")[1] || " Products Daily"}</>
                )}
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {settingsMap["heroSubtitle"] || t("heroSubtitle") || "Curated selection of top-rated products from trusted brands. Shop with confidence."}
              </p>
              <div className="flex gap-4 justify-center lg:justify-start">
                <a
                  href="#products"
                  onClick={(e) => { e.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="btn-primary text-white px-6 md:px-8 py-3 rounded-full font-semibold text-sm inline-block"
                >
                  {t("exploreProducts") || "Explore Products"}
                </a>
                <Link
                  to={path("/about")}
                  className="border-2 border-gray-300 text-gray-700 px-6 md:px-8 py-3 rounded-full font-semibold text-sm hover:border-[#FF9900] hover:text-[#FF9900] transition-all inline-block"
                >
                  {t("learnMore") || "Learn More"}
                </Link>
              </div>
            </div>
            {/* Right: Carousel */}
            <div className="flex-1 relative hidden lg:block">
              <div className="absolute -inset-4 bg-orange-200 rounded-3xl opacity-30 blur-2xl" />
              <div className="relative bg-white rounded-2xl shadow-xl p-3 md:p-4 overflow-hidden">
                {slides.length > 0 ? (
                  <div className="relative">
                    {/* Slides */}
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                      {slides.map((slide, index) => (
                        <a
                          key={slide.id}
                          href={slide.button_link || "#"}
                          target={slide.button_link ? "_blank" : undefined}
                          rel={slide.button_link ? "noopener noreferrer" : undefined}
                          onClick={(e) => { if (!slide.button_link) e.preventDefault(); }}
                          className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                          <img
                            src={slide.image_url}
                            alt={slide.title || "Featured"}
                            className="w-full h-full object-cover rounded-xl cursor-pointer"
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                        </a>
                      ))}
                    </div>
                    {/* Navigation arrows */}
                    {slides.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-10"
                          aria-label="Previous slide"
                        >
                          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-10"
                          aria-label="Next slide"
                        >
                          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        {/* Dots indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                          {slides.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentSlide(index)}
                              className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-[#FF9900] w-5' : 'bg-white/70'}`}
                              aria-label={`Go to slide ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop"
                    alt="Featured products"
                    className="rounded-xl w-full object-cover aspect-[16/10]"
                    loading="eager"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Sections */}
      <main id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
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
  const [sortBy, setSortBy] = useState<string>("default");
  const { country } = useCountry();

  // Load brands dynamically from products in this category + country
  // (not from brands table, to support same brand appearing in multiple categories)
  useEffect(() => {
    async function loadBrands() {
      try {
        // Step 1: Get distinct brand_ids of products in this category + country
        const { data: productRows, error: prodErr } = await supabase
          .from("products")
          .select("brand_id")
          .eq("category_id", category.id)
          .eq("country", country)
          .order("brand_id");
        if (prodErr) { console.error("[CategorySection] Product query error:", prodErr); setBrands([]); return; }
        const brandIds = [...new Set((productRows || []).map((p: any) => p.brand_id).filter(Boolean))];
        if (brandIds.length === 0) { setBrands([]); return; }
        // Step 2: Load brand details for those brand_ids
        const { data: brandRows, error: brandErr } = await supabase
          .from("brands")
          .select("*")
          .in("id", brandIds)
          .order("sort_order", { ascending: true });
        if (brandErr) { console.error("[CategorySection] Brand query error:", brandErr); setBrands([]); return; }
        // Preserve sort order from DB but filter to only brands that have products
        const brandMap = new Map((brandRows || []).map((b: any) => [b.id, b]));
        const sortedBrands = brandIds
          .map((id) => brandMap.get(id))
          .filter((b): b is Brand => b !== undefined);
        setBrands(sortedBrands);
      } catch (err: any) {
        console.error("[CategorySection] Failed to load brands:", err);
        setBrands([]);
      }
    }
    if (country) loadBrands();
  }, [category.id, country]);

  return (
    <section id={`cat-${category.slug}`} aria-label={`${category.name} section`} className="scroll-mt-20">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 group w-full text-left"
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
          <div className="relative flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] cursor-pointer"
              aria-label="Sort products"
            >
              <option value="default">Default</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>
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
              <BrandGroup key={brand.id} brand={brand} categoryId={category.id} sortBy={sortBy} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function BrandGroup({ brand, categoryId, sortBy = "default" }: { brand: Brand; categoryId: number; sortBy?: string }) {
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

  // Apply client-side sorting
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "name-asc": return a.title.localeCompare(b.title);
      case "name-desc": return b.title.localeCompare(a.title);
      default: return 0; // keep original order from DB
    }
  });

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
          <div className="space-y-4" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4" role="list" aria-label={`${brand.name} products`}>
            {sortedProducts.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const { country, path, config } = useCountry();
  return (
    <article className="product-card bg-white rounded-xl border border-black/[0.08] p-4 md:p-5 flex gap-5 md:gap-6 hover:shadow-lg transition-all duration-300">
      {/* Product Image */}
      <Link to={path(`/product/${product.id}`)} className="block flex-shrink-0" aria-label={`View details: ${product.title}`}>
        <div className="w-40 h-40 md:w-52 md:h-52 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-contain p-3 md:p-4"
            loading="lazy"
            decoding="async"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2 hover:text-[#FF9900] transition-colors leading-snug">
            <Link to={path(`/product/${product.id}`)}>{product.title}</Link>
          </h4>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between mt-4 gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl md:text-2xl font-bold text-gray-900">{config.currency}{product.price}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-400 line-through">{config.currency}{product.original_price}</span>
            )}
          </div>
          <a
            href={product.amazon_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-white px-5 md:px-6 py-2.5 rounded-full text-sm font-semibold flex-shrink-0"
            aria-label={`${config.domain}: ${product.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="hidden sm:inline">Check Price on Amazon</span>
            <span className="sm:hidden">Amazon</span>
            <ExternalLink className="w-3.5 h-3.5 inline-block ml-1.5 -mt-0.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
