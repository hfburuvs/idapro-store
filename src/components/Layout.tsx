import { Link, useLocation, useNavigate } from "react-router";
import { useCountry } from "@/hooks/useCountry";
import { countryConfig, type CountryCode } from "@/lib/i18n";
import { type ReactNode, useState, useEffect } from "react";
import {
  ShoppingBag, Menu, X, MessageSquare, Shield,
  Home, Info, ChevronDown, Search,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";

function isHomePath(pathname: string): boolean {
  if (pathname === '/') return true;
  return /^\/[a-z]{2}\/?$/i.test(pathname);
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  category_id: number;
}

interface NavItem {
  id: number;
  label: string;
  link: string;
  parent_id: number;
  sort_order: number;
  is_active: number;
}

interface Setting {
  key: string;
  value: string;
}

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryBrands, setCategoryBrands] = useState<Record<number, Brand[]>>({});
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [seoMap, setSeoMap] = useState<Record<string, string>>({});
  const [dbCountries, setDbCountries] = useState<any[]>([]);
  const [analyticsCode, setAnalyticsCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { country, t, path, switchCountry } = useCountry();

  // Sync searchQuery with URL search param
  useEffect(() => {
    const urlSearch = new URLSearchParams(location.search).get("search") || "";
    setSearchQuery(urlSearch);
    if (urlSearch) setSearchOpen(true);
  }, [location.search]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [location.pathname, location.search]);

  // Load categories, brands for sub-nav dropdowns, settings, etc.
  useEffect(() => {
    async function loadData() {
      try {
        const { data: productCats } = await supabase
          .from("products").select("category_id").eq("country", country);
        const activeCatIds = new Set((productCats || []).map((p: any) => p.category_id));

        const [{ data: cats }, { data: settings }, { data: navs }, { data: countriesData }, { data: allBrands }] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order", { ascending: true }),
          supabase.from("settings").select("*"),
          supabase.from("navigation").select("*").eq("is_active", 1).order("sort_order", { ascending: true }),
          supabase.from("countries").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
          supabase.from("brands").select("*").order("sort_order", { ascending: true }),
        ]);
        setDbCountries(countriesData || []);
        const filteredCats = (cats || []).filter((c: Category) => activeCatIds.has(c.id));
        setCategories(filteredCats as Category[]);
        setNavItems((navs || []) as NavItem[]);

        // Map brands to categories for sub-nav dropdowns
        const brandMap: Record<number, Brand[]> = {};
        filteredCats.forEach((cat: Category) => {
          brandMap[cat.id] = (allBrands || []).filter((b: Brand) => b.category_id === cat.id);
        });
        setCategoryBrands(brandMap);

        const map: Record<string, string> = {};
        (settings || []).forEach((s: Setting) => { map[s.key] = s.value; });
        setSettingsMap(map);

        const [{ data: analytics }, { data: seoSettings }] = await Promise.all([
          supabase.from("analytics").select("code").eq("is_active", 1),
          supabase.from("seo_settings").select("*"),
        ]);
        if (analytics && analytics.length > 0) {
          setAnalyticsCode(analytics.map((a) => a.code).join("\n"));
        }
        const seo: Record<string, string> = {};
        (seoSettings || []).forEach((s: any) => { seo[s.key] = s.value; });
        setSeoMap(seo);
      } catch (err: any) {
        console.error("[Layout] Failed to load data:", err);
        setCategories([]); setNavItems([]); setSettingsMap({}); setCategoryBrands({});
      }
    }
    loadData();
  }, [country]);

  const siteTitle = settingsMap["siteTitle"] || "iDaPro";
  const contactEmail = settingsMap["contactEmail"] || "";
  const logoImage = settingsMap["logoImage"] || "";
  const metaKeywords = seoMap["metaKeywords"] || settingsMap["metaKeywords"] || "screen protector, tempered glass, camera accessories, watch accessories";
  const metaDescription = seoMap["metaDescription"] || settingsMap["metaDescription"] || "Premium screen protectors and accessories for cameras and smartwatches.";
  const cleanPath = location.pathname.replace(/^\/(de|es|it|fr|uk)\b/, "") || "/";
  const siteTagline = settingsMap["siteTagline"] || "";
  const pageTitle = cleanPath === "/" ? (siteTagline ? `${siteTitle} - ${siteTagline}` : siteTitle) : cleanPath === "/contact" ? `${t("contact")} - ${siteTitle}` : cleanPath === "/about" ? `${t("about")} - ${siteTitle}` : cleanPath.startsWith("/product/") ? `${t("products")} - ${siteTitle}` : cleanPath.startsWith("/category/") ? `${t("categories")} - ${siteTitle}` : siteTitle;

  // Country flag image URL from flagcdn
  const flagUrl = (code: string) => `https://flagcdn.com/w40/${code?.toLowerCase()}.png`;

  // Scroll to brand within a category
  const scrollToBrand = (catSlug: string, brandSlug: string) => {
    const el = document.getElementById(`brand-${catSlug}-${brandSlug}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#EAEDED' }}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="keywords" content={metaKeywords} />
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* ===== BLACK TOP BAR (#131921) ===== */}
      <header className="sticky top-0 z-50" style={{ background: '#131921', height: 60, color: '#fff' }}>
        <div className="max-w-[1500px] mx-auto px-3 sm:px-4 h-full flex items-center gap-2 sm:gap-3">

          {/* Logo */}
          <Link to={path("/")} className="flex items-center flex-shrink-0 px-2 py-1 rounded-sm" style={{ border: '1px solid transparent' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
            {logoImage ? (
              <img src={logoImage} alt={siteTitle} style={{ height: 36 }} />
            ) : (
              <span style={{ fontSize: 24, fontWeight: 700, color: '#FF9900', letterSpacing: -0.5 }}>iDaPro</span>
            )}
          </Link>

          {/* Search Bar (centered) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) navigate(path(`/?search=${encodeURIComponent(searchQuery.trim())}`));
            }}
            className="flex flex-1 max-w-[720px] mx-auto h-10 rounded overflow-hidden"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search iDaPro"
              className="flex-1 px-3 text-sm outline-none border-none"
              style={{ borderRadius: '4px 0 0 4px', fontSize: 15 }}
            />
            <button type="submit" className="flex items-center justify-center transition-colors" style={{ width: 45, background: '#febd69' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f3a847')} onMouseLeave={(e) => (e.currentTarget.style.background = '#febd69')}>
              <Search className="w-5 h-5" style={{ color: '#131921' }} />
            </button>
          </form>

          {/* Desktop Nav: Home, About, Contact (NO Products) */}
          <nav className="hidden md:flex items-center gap-0 flex-shrink-0">
            <Link to={path("/")} className="text-sm font-medium px-3 py-2 rounded-sm transition-colors" style={{ border: '1px solid transparent' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
              {t("home")}
            </Link>
            <Link to={path("/about")} className="text-sm font-medium px-3 py-2 rounded-sm transition-colors" style={{ border: '1px solid transparent' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
              {t("about")}
            </Link>
            <Link to={path("/contact")} className="text-sm font-medium px-3 py-2 rounded-sm transition-colors" style={{ border: '1px solid transparent' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
              {t("contact")}
            </Link>
          </nav>

          {/* Country Switcher with flag images */}
          <div className="relative group flex-shrink-0">
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-sm text-xs" style={{ border: '1px solid transparent' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
              <img src={flagUrl(country)} width={20} height={15} style={{ borderRadius: 2, objectFit: 'cover' }} alt={country} />
              <span className="uppercase font-medium">{country}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute top-full right-0 mt-0 w-48 py-2 hidden group-hover:block" style={{ background: '#fff', borderRadius: '0 0 4px 4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1001 }}>
              {(dbCountries.length > 0 ? dbCountries : []).map((c: any) => (
                <button key={c.code} onClick={() => switchCountry(c.code as CountryCode)} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors" style={{ color: country === c.code ? '#FF9900' : '#0F1111', background: country === c.code ? '#fff7ed' : 'transparent' }} onMouseEnter={(e) => { if (country !== c.code) e.currentTarget.style.background = '#EAEDED'; }} onMouseLeave={(e) => { if (country !== c.code) e.currentTarget.style.background = 'transparent'; }}>
                  <img src={flagUrl(c.code)} width={20} height={15} style={{ borderRadius: 2, objectFit: 'cover' }} alt={c.code} />
                  <span>{c.name || c.code.toUpperCase()}</span>
                </button>
              ))}
              {dbCountries.length === 0 && (
                <p className="px-4 py-2 text-sm text-center" style={{ color: '#999' }}>No active countries</p>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2" style={{ color: '#fff' }}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden" style={{ background: '#232f3e', borderTop: '1px solid #37475a' }}>
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(path(`/?search=${encodeURIComponent(searchQuery.trim())}`)); setMobileMenuOpen(false); } }} className="flex items-center px-4 py-3">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="flex-1 px-3 py-2 text-sm outline-none rounded-l" />
              <button type="submit" className="px-3 py-2 rounded-r" style={{ background: '#febd69' }}><Search className="w-4 h-4" /></button>
            </form>
            <div className="px-4 py-2 space-y-0.5">
              <Link to={path("/")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded" style={{ color: '#fff' }}><Home className="w-4 h-4" />{t("home")}</Link>
              {categories.map((cat) => (
                <a key={cat.id} href={path(`/#cat-${cat.slug}`)} onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); if (isHomePath(location.pathname)) { setTimeout(() => document.getElementById(`cat-${cat.slug}`)?.scrollIntoView({ behavior: 'smooth' }), 100); } else { sessionStorage.setItem("scrollToCategory", `cat-${cat.slug}`); navigate(path("/")); } }} className="flex items-center gap-2 px-3 py-2 pl-8 text-sm rounded" style={{ color: '#ddd' }}><span className="w-1.5 h-1.5 rounded-full bg-orange-400" />{cat.name}</a>
              ))}
              <Link to={path("/about")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded" style={{ color: '#fff' }}><Info className="w-4 h-4" />{t("about")}</Link>
              <Link to={path("/contact")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded" style={{ color: '#fff' }}><MessageSquare className="w-4 h-4" />{t("contact")}</Link>
            </div>
          </div>
        )}
      </header>

      {/* ===== GRAY SUB NAV (#232f3e) with Brand Dropdowns ===== */}
      {categories.length > 0 && (
        <nav className="hidden md:flex items-center gap-0 px-4 text-sm sticky z-40" style={{ background: '#232f3e', height: 40, color: '#fff', top: 60 }}>
          <div className="max-w-[1500px] mx-auto flex items-center gap-0 w-full">
            {categories.map((cat) => {
              const brands = categoryBrands[cat.id] || [];
              return (
                <div key={cat.id} className="relative group">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-sm whitespace-nowrap transition-colors" style={{ border: '1px solid transparent' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
                    {cat.name}
                    {brands.length > 0 && <ChevronDown className="w-3 h-3 opacity-60" />}
                  </button>
                  {brands.length > 0 && (
                    <div className="absolute top-full left-0 py-2 hidden group-hover:block" style={{ background: '#fff', color: '#0F1111', minWidth: 220, borderRadius: '0 0 4px 4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1001 }}>
                      <div className="px-4 py-1 text-xs font-bold uppercase tracking-wider" style={{ color: '#565959' }}>{cat.name} Brands</div>
                      {brands.map((brand) => (
                        <a key={brand.id} href={path(`/#cat-${cat.slug}`)} onClick={(e) => { e.preventDefault(); if (isHomePath(location.pathname)) { setTimeout(() => scrollToBrand(cat.slug, brand.slug), 200); } else { sessionStorage.setItem("scrollToCategory", `cat-${cat.slug}`); sessionStorage.setItem("scrollToBrand", brand.slug); navigate(path("/")); } }} className="block px-4 py-1.5 text-sm transition-colors" style={{ color: '#444' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#EAEDED'; e.currentTarget.style.color = '#e47911'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#444'; }}>
                          {brand.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1">{children}</main>

      {/* ===== AMAZON-STYLE FOOTER ===== */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-full text-center text-sm cursor-pointer transition-colors" style={{ background: '#37475a', color: '#fff', padding: '14px' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#485769')} onMouseLeave={(e) => (e.currentTarget.style.background = '#37475a')}>
        Back to top
      </button>
      <footer style={{ background: '#232f3e', color: '#fff', padding: '40px 24px' }}>
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <h4 className="font-bold mb-3 text-base">Get to Know Us</h4>
            <Link to={path("/about")} className="block py-1 text-sm" style={{ color: '#ddd' }} onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}>{t("about")}</Link>
            <span className="block py-1 text-sm cursor-default" style={{ color: '#ddd' }}>Our Story</span>
            <span className="block py-1 text-sm cursor-default" style={{ color: '#ddd' }}>Careers</span>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-base">Shop With Us</h4>
            {categories.slice(0, 5).map((cat) => (
              <a key={cat.id} href={path(`/#cat-${cat.slug}`)} onClick={(e) => { e.preventDefault(); if (isHomePath(location.pathname)) { setTimeout(() => document.getElementById(`cat-${cat.slug}`)?.scrollIntoView({ behavior: 'smooth' }), 100); } else { sessionStorage.setItem("scrollToCategory", `cat-${cat.slug}`); navigate(path("/")); } }} className="block py-1 text-sm" style={{ color: '#ddd' }} onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}>{cat.name}</a>
            ))}
          </div>
          <div>
            <h4 className="font-bold mb-3 text-base">Customer Service</h4>
            <Link to={path("/contact")} className="block py-1 text-sm" style={{ color: '#ddd' }} onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}>{t("contact")}</Link>
            <span className="block py-1 text-sm cursor-default" style={{ color: '#ddd' }}>Shipping Info</span>
            <span className="block py-1 text-sm cursor-default" style={{ color: '#ddd' }}>Returns</span>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-base">Account</h4>
            <Link to={path("/admin")} className="flex items-center gap-1.5 py-1 text-sm" style={{ color: '#ddd' }} onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}>
              <Shield className="w-3.5 h-3.5" />{t("adminLogin")}
            </Link>
            {contactEmail && <span className="block py-1 text-sm" style={{ color: '#999' }}>{contactEmail}</span>}
          </div>
        </div>
      </footer>
      <div className="text-center" style={{ background: '#131921', color: '#aaa', padding: '24px', fontSize: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#FF9900', marginBottom: 4 }}>{siteTitle}</div>
        <p>&copy; {new Date().getFullYear()} {siteTitle}. {t("copyright") || "All rights reserved."}</p>
      </div>

      {/* Analytics code injection */}
      {analyticsCode && <div dangerouslySetInnerHTML={{ __html: analyticsCode }} />}
    </div>
  );
}
