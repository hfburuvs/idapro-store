import { Link, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import { Star, ExternalLink, Camera, Watch, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCountry } from "@/hooks/useCountry";

/* ========================================
   Home — Amazon Style Grid Layout
   5-6 columns, category sections
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
  original_price?: number;
  amazon_link: string;
  description: string | null;
  brand_id: number;
  category_id: number;
  rating?: number;
  reviews?: number;
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
  const { country, t, path, config } = useCountry();

  // Load data
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
        console.error("[Home] Failed:", err);
        setCategories([]); setSlides([]); setSettingsMap({});
      } finally { setLoading(false); }
    }
    loadData();
  }, []);

  // Scroll target from other pages
  useEffect(() => {
    if (loading || categories.length === 0) return;
    const targetId = sessionStorage.getItem("scrollToCategory");
    const targetBrand = sessionStorage.getItem("scrollToBrand");
    sessionStorage.removeItem("scrollToCategory");
    sessionStorage.removeItem("scrollToBrand");
    if (!targetId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (targetBrand) {
          setTimeout(() => {
            const bel = document.getElementById(`brand-${targetId.replace('cat-', '')}-${targetBrand}`);
            if (bel) bel.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 400);
        }
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [categories, loading]);

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    async function doSearch() {
      setSearchLoading(true);
      try {
        const q = searchQuery.trim().toLowerCase();
        const { data, error } = await supabase.from("products").select("*").eq("country", country).order("created_at", { ascending: false });
        if (error) { setSearchResults([]); return; }
        const filtered = (data || []).filter((p: Product) =>
          p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
        );
        setSearchResults(filtered);
      } catch { setSearchResults([]); } finally { setSearchLoading(false); }
    }
    doSearch();
  }, [searchQuery, country]);

  const clearSearch = () => setSearchParams({});

  // Hero carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Search results view
  if (searchQuery) {
    return (
      <div>
        <section style={{ background: '#131921', color: '#fff' }}>
          <div className="max-w-[1500px] mx-auto px-3 sm:px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold mb-1">{t("searchBtn")}: &quot;<span style={{ color: '#FF9900' }}>{searchQuery}</span>&quot;</h1>
                <p className="text-sm" style={{ color: '#aaa' }}>{searchResults.length} product{searchResults.length !== 1 ? "s" : ""} found</p>
              </div>
              <button onClick={clearSearch} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded" style={{ color: '#ccc', background: 'rgba(255,255,255,0.1)' }}><X className="w-4 h-4" />Clear</button>
            </div>
          </div>
        </section>
        <main className="max-w-[1500px] mx-auto px-3 sm:px-4 py-8">
          {searchLoading ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
              {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-lg h-72 animate-pulse" />)}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
              {searchResults.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-16"><Search className="w-12 h-12 mx-auto mb-4" style={{ color: '#ccc' }} /><h2 className="text-lg font-medium mb-2">{t("noResults")}</h2></div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #f7f8f8 0%, #e8e8e8 50%, #f0f1f1 100%)', padding: '40px 0' }}>
        <div className="max-w-[1500px] mx-auto px-3 sm:px-4 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#131921', color: '#fff', letterSpacing: 0.3 }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#FF9900' }} />
              {settingsMap["heroBadge"] || t("heroBadge")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight" style={{ color: '#0F1111' }}>
              {settingsMap["heroTitle"] ? <span dangerouslySetInnerHTML={{ __html: settingsMap["heroTitle"].replace(/Quality/g, '<span style="color:#FF9900">Quality</span>') }} /> : <>{t("heroTitle")?.split("Quality")[0] || "Discover "}<span style={{ color: '#FF9900' }}>Quality</span>{t("heroTitle")?.split("Quality")[1] || " Products Daily"}</>}
            </h1>
            <p className="text-base max-w-lg mx-auto lg:mx-0 leading-relaxed" style={{ color: '#565959' }}>
              {settingsMap["heroSubtitle"] || t("heroSubtitle") || "Curated selection of top-rated screen protectors and accessories."}
            </p>
            <div className="flex gap-3 justify-center lg:justify-start flex-wrap">
              <a href="#products" onClick={(e) => { e.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-block px-7 py-3 rounded-md text-sm font-semibold" style={{ background: 'linear-gradient(180deg, #ffd472, #f3a847)', color: '#0F1111', border: '1px solid #a88734' }}>{t("exploreProducts")}</a>
              <Link to={path("/about")} className="inline-block px-7 py-3 rounded-md text-sm font-semibold bg-white" style={{ color: '#0F1111', border: '1px solid #d5d9d9' }}>{t("learnMore")}</Link>
            </div>
          </div>
          <div className="flex-1 relative hidden lg:block max-w-[480px]">
            <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
              {slides.length > 0 ? (
                <div className="relative">
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                    {slides.map((slide, i) => (
                      <a key={slide.id} href={slide.link || "#"} target={slide.link ? "_blank" : undefined} rel="noopener noreferrer" onClick={(e) => { if (!slide.link) e.preventDefault(); }} className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                        <img src={slide.image_url} alt={slide.title || "Featured"} className="w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                      </a>
                    ))}
                  </div>
                  {slides.length > 1 && (
                    <div className="flex justify-center gap-1.5 py-3">
                      {slides.map((_, i) => <button key={i} onClick={() => setCurrentSlide(i)} className="h-2 rounded-full transition-all" style={{ width: i === currentSlide ? 20 : 8, background: i === currentSlide ? '#FF9900' : '#ddd' }} />)}
                    </div>
                  )}
                </div>
              ) : (
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop" alt="Featured" className="w-full object-cover" style={{ aspectRatio: '16/10' }} loading="eager" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Sections with Product Grid */}
      <div id="products" className="max-w-[1500px] mx-auto px-3 sm:px-4 py-8 space-y-6">
        {loading ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-lg h-72 animate-pulse" />)}
          </div>
        ) : (
          categories.map(cat => <CategorySection key={cat.id} category={cat} />)
        )}
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: Category }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { country } = useCountry();

  useEffect(() => {
    async function load() {
      try {
        const [{ data: prods }, { data: brds }] = await Promise.all([
          supabase.from("products").select("*").eq("category_id", category.id).eq("country", country).order("sort_order", { ascending: true }).order("id", { ascending: true }),
          supabase.from("brands").select("*").eq("category_id", category.id).order("sort_order", { ascending: true }),
        ]);
        setProducts((prods || []) as Product[]);
        setBrands((brds || []) as Brand[]);
      } catch { setProducts([]); setBrands([]); }
      finally { setIsLoading(false); }
    }
    if (country) load();
  }, [category.id, country]);

  if (!isLoading && products.length === 0) return null;

  // Group products by brand
  const productsByBrand: Record<number, Product[]> = {};
  products.forEach(p => { if (!productsByBrand[p.brand_id]) productsByBrand[p.brand_id] = []; productsByBrand[p.brand_id].push(p); });
  const brandList = brands.filter(b => productsByBrand[b.id]?.length > 0);

  return (
    <section id={`cat-${category.slug}`} className="bg-white rounded-lg p-5 sm:p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: '#131921' }}>
          {category.slug === "camera" || category.slug === "camera-accessories" ? <Camera className="w-4 h-4" style={{ color: '#FF9900' }} /> : category.slug === "watch" || category.slug === "watch-accessories" ? <Watch className="w-4 h-4" style={{ color: '#FF9900' }} /> : <Star className="w-4 h-4" style={{ color: '#FF9900' }} />}
        </div>
        <h2 className="text-lg font-bold" style={{ color: '#0F1111' }}>{category.name}</h2>
        <span className="text-xs ml-auto" style={{ color: '#999' }}>{products.length} products</span>
      </div>

      {isLoading ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />)}
        </div>
      ) : (
        <>
          {brandList.map(brand => (
            <div key={brand.id} id={`brand-${category.slug}-${brand.slug}`} className="mb-5 last:mb-0">
              <h3 className="text-sm font-semibold mb-3 px-1 flex items-center gap-2" style={{ color: '#565959' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF9900' }} />
                {brand.name}
                <span className="text-xs font-normal" style={{ color: '#999' }}>({productsByBrand[brand.id]?.length || 0})</span>
              </h3>
              <div className="grid gap-4 product-grid">
                {(productsByBrand[brand.id] || []).map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            </div>
          ))}
          {/* Products without a known brand */}
          {(productsByBrand[0] || products.filter(p => !brands.some(b => b.id === p.brand_id))).length > 0 && (
            <div className="grid gap-4 product-grid mt-4">
              {(productsByBrand[0] || products.filter(p => !brands.some(b => b.id === p.brand_id))).map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { path, config } = useCountry();
  const currency = config.currency || "$";
  const priceWhole = Math.floor(product.price);
  const priceFrac = Math.round((product.price - priceWhole) * 100).toString().padStart(2, '0');

  return (
    <div className="bg-white rounded-lg overflow-hidden transition-all duration-200 cursor-pointer group" style={{ border: '1px solid transparent' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#e3e6e6'; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}>
      <Link to={path(`/product/${product.id}`)} className="block">
        <div className="w-full flex items-center justify-center" style={{ aspectRatio: 1, background: '#f7f8f8', padding: 16 }}>
          <img src={product.image_url} alt={product.title} className="w-full h-full object-contain" loading="lazy" decoding="async" />
        </div>
      </Link>
      <div className="p-3">
        <Link to={path(`/product/${product.id}`)}>
          <h4 className="text-sm mb-1.5 leading-snug transition-colors group-hover:text-orange-600" style={{ color: '#0F1111', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 40 }}>
            {product.title}
          </h4>
        </Link>
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-sm" style={{ color: '#ffa41c', letterSpacing: -1 }}>{'★'.repeat(Math.round(product.rating || 4))}{'☆'.repeat(5 - Math.round(product.rating || 4))}</span>
          {product.reviews ? <span className="text-xs" style={{ color: '#007185' }}>{product.reviews.toLocaleString()}</span> : null}
        </div>
        {/* Price */}
        <div className="mb-2.5">
          <span className="text-xs align-top relative" style={{ top: 2 }}>{currency}</span>
          <span className="text-xl font-semibold">{priceWhole}</span>
          <span className="text-xs align-top relative" style={{ top: 2 }}>{priceFrac}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs ml-1.5 line-through" style={{ color: '#565959' }}>{currency}{product.original_price}</span>
          )}
        </div>
        {/* Amazon Button */}
        <a href={product.amazon_link} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-1.5 rounded-full text-xs font-semibold transition-all" style={{ background: 'linear-gradient(180deg, #ffd472, #f3a847)', color: '#0F1111', border: '1px solid #a88734' }} onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.95)')} onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')} onClick={(e) => e.stopPropagation()}>
          Amazon<ExternalLink className="w-3 h-3 inline-block ml-1 -mt-0.5" />
        </a>
      </div>
    </div>
  );
}

// Star icon for category headers
function Star(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
