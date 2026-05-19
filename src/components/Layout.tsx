import { Link, useLocation, useNavigate } from "react-router";
import { useCountry } from "@/hooks/useCountry";
import { countryConfig, type CountryCode, VALID_COUNTRIES } from "@/lib/i18n";
import { type ReactNode, useState, useEffect } from "react";
import {
  ShoppingBag,
  Menu,
  X,
  MessageSquare,
  Shield,
  Home,
  Info,
  ChevronDown,
  Search,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";

interface Category {
  id: number;
  name: string;
  slug: string;
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
  const [productsOpen, setProductsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [analyticsCode, setAnalyticsCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { country, t, path, switchCountry } = useCountry();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, location.search]);

  useEffect(() => {
    async function loadData() {
      try {
        // Load categories that have products for the current country
        const { data: productCats } = await supabase
          .from("products")
          .select("category_id")
          .eq("country", country);
        const activeCatIds = new Set((productCats || []).map((p: any) => p.category_id));

        const [{ data: cats }, { data: settings }, { data: navs }] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order", { ascending: true }),
          supabase.from("settings").select("*"),
          supabase.from("navigation").select("*").eq("is_active", 1).order("sort_order", { ascending: true }),
        ]);
        // Only show categories that have products for this country
        const filteredCats = (cats || []).filter((c: Category) => activeCatIds.has(c.id));
        setCategories(filteredCats as Category[]);
        setNavItems((navs || []) as NavItem[]);

        const map: Record<string, string> = {};
        (settings || []).forEach((s: Setting) => {
          map[s.key] = s.value;
        });
        setSettingsMap(map);

        const { data: analytics } = await supabase
          .from("analytics")
          .select("code")
          .eq("is_active", 1);
        if (analytics && analytics.length > 0) {
          setAnalyticsCode(analytics.map((a) => a.code).join("\n"));
        }
      } catch (err: any) {
        console.error("[Layout] Failed to load data:", err);
        // Set empty defaults to avoid undefined state
        setCategories([]);
        setNavItems([]);
        setSettingsMap({});
      }
    }
    loadData();
  }, [country]);

  const siteTitle = settingsMap["siteTitle"] || "iDaPro";
  const contactEmail = settingsMap["contactEmail"] || "iddadirect@126.com";
  const metaKeywords =
    settingsMap["metaKeywords"] ||
    "screen protector, tempered glass, camera accessories, watch accessories";
  const metaDescription =
    settingsMap["metaDescription"] ||
    "Premium screen protectors and accessories for cameras and smartwatches.";

  const cleanPath = location.pathname.replace(/^\/(de|es|it|fr)\b/, "") || "/";
  const siteTagline = settingsMap["siteTagline"] || "";
  const pageTitle =
    cleanPath === "/"
      ? siteTagline ? `${siteTitle} - ${siteTagline}` : siteTitle
      : cleanPath === "/contact"
      ? `${t("contact")} - ${siteTitle}`
      : cleanPath === "/about"
      ? `${t("about")} - ${siteTitle}`
      : cleanPath.startsWith("/product/")
      ? `${t("products")} - ${siteTitle}`
      : cleanPath.startsWith("/category/")
      ? `${t("categories")} - ${siteTitle}`
      : siteTitle;

  // Build nav from DB; fallback to hardcoded if empty
  const hasCustomNav = navItems.length > 0;
  const topLevelNavs = hasCustomNav
    ? navItems.filter((n) => n.parent_id === 0)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="keywords" content={metaKeywords} />
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* ===== TOP NAVIGATION BAR ===== */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-[#FF9900] rounded-md flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                {siteTitle}
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-1">
              {hasCustomNav ? (
                // Dynamic nav from database
                <>
                  {topLevelNavs.map((item) => {
                    const navLabelMap: Record<string, string> = {
                      home: t("home"),
                      products: t("products"),
                      about: t("about"),
                      contact: t("contact"),
                    };
                    const children = navItems.filter((n) => n.parent_id === item.id);
                    const isActive = location.pathname === item.link;
                    const isProducts = item.label?.toLowerCase() === "products" || item.link === "#products";
                    const displayLabel = navLabelMap[item.label?.toLowerCase()] || item.label;
                    if (children.length > 0 || isProducts) {
                      return (
                        <div key={item.id} className="relative group">
                          <button className={`flex items-center space-x-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${isActive ? "text-[#FF9900] bg-orange-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"}`}>
                            <span>{displayLabel}</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 hidden group-hover:block">
                            {children.length > 0 ? (
                              children.map((child) => {
                                const childLabel = navLabelMap[child.label?.toLowerCase()] || child.label;
                                return (
                                  <Link key={child.id} to={child.link} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#FF9900] transition-colors">
                                    <span className="w-2 h-2 rounded-full bg-[#FF9900] mr-3" />
                                    {childLabel}
                                  </Link>
                                );
                              })
                            ) : (
                              categories.map((cat) => (
                                <a key={cat.id} href={path(`/#cat-${cat.slug}`)} onClick={(e) => { e.preventDefault(); setProductsOpen(false); const pn = location.pathname; const isHome = pn === '/' || pn === '/de' || pn === '/es' || pn === '/it' || pn === '/fr' || pn === '/us'; if (!isHome) { navigate(path(`/?cat=${cat.slug}`)); } else { setTimeout(() => { const el = document.getElementById(`cat-${cat.slug}`); if (el) el.scrollIntoView({behavior:'smooth',block:'start'}); }, 150); } }} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#FF9900] transition-colors">
                                  <span className="w-2 h-2 rounded-full bg-[#FF9900] mr-3" />
                                  {cat.name}
                                </a>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <Link key={item.id} to={item.link === "/" ? path("/") : item.link === "/about" ? path("/about") : item.link === "/contact" ? path("/contact") : item.link} className={`flex items-center space-x-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${isActive ? "text-[#FF9900] bg-orange-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"}`}>
                        <span>{displayLabel}</span>
                      </Link>
                    );
                  })}
                </>
              ) : (
                // Fallback: hardcoded nav
                <>
                  <Link
                    to={path("/")}
                    className={`flex items-center space-x-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                      cleanPath === "/"
                        ? "text-[#FF9900] bg-orange-50"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>{t("home")}</span>
                  </Link>

                  <div
                    className="relative"
                    onMouseEnter={() => setProductsOpen(true)}
                    onMouseLeave={() => setProductsOpen(false)}
                  >
                    <button
                      className={`flex items-center space-x-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                        location.pathname.startsWith("/category")
                          ? "text-[#FF9900] bg-orange-50"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t("products")}</span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          productsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {productsOpen && categories.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        {categories.map((cat) => (
                          <a
                            key={cat.id}
                            href={`#cat-${cat.slug}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setProductsOpen(false);
                              const el = document.getElementById(`cat-${cat.slug}`);
                              if (el) {
                                el.scrollIntoView({ behavior: "smooth", block: "start" });
                              } else {
                                navigate(path(`/?cat=${cat.slug}`));
                              }
                            }}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#FF9900] transition-colors"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#FF9900] mr-3" />
                            {cat.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    to={path("/about")}
                    className={`flex items-center space-x-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                      cleanPath === "/about"
                        ? "text-[#FF9900] bg-orange-50"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Info className="w-4 h-4" />
                    <span>{t("about")}</span>
                  </Link>

                  <Link
                    to={path("/contact")}
                    className={`flex items-center space-x-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                      cleanPath === "/contact"
                        ? "text-[#FF9900] bg-orange-50"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t("contact")}</span>
                  </Link>
                </>
              )}
            </div>

            {/* Right side: Country switcher + Search + Mobile menu */}
            <div className="flex items-center gap-2">
              {/* Country Switcher */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium px-2 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <span>{countryConfig[country as CountryCode]?.flag ?? "🇺🇸"}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 hidden group-hover:block">
                  {VALID_COUNTRIES.map((cc) => (
                    <button
                      key={cc}
                      onClick={() => switchCountry(cc as CountryCode)}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                        country === cc ? "text-[#FF9900] bg-orange-50 font-medium" : "text-gray-700 hover:bg-orange-50 hover:text-[#FF9900]"
                      }`}
                    >
                      <span>{countryConfig[cc as CountryCode].flag}</span>
                      <span>{countryConfig[cc as CountryCode].name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Search */}
              <div className="hidden md:flex items-center">
                {searchOpen ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (searchQuery.trim()) {
                        navigate(path(`/?search=${encodeURIComponent(searchQuery.trim())}`));
                      }
                    }}
                    className="flex items-center"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-48 px-3 py-1.5 text-sm border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900]"
                      autoFocus
                      onBlur={() => {
                        if (!searchQuery) setSearchOpen(false);
                      }}
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-r-lg transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-600 hover:text-gray-900 p-2"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
                    setMobileMenuOpen(false);
                  }
                }}
                className="flex items-center"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900]"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-r-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
            <div className="px-4 py-3 space-y-1">
              {hasCustomNav ? (
                navItems
                  .filter((n) => n.parent_id === 0)
                  .map((item) => (
                    <Link
                      key={item.id}
                      to={item.link === "/" ? path("/") : item.link === "/about" ? path("/about") : item.link === "/contact" ? path("/contact") : item.link}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))
              ) : (
                <>
                  <Link
                    to={path("/")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <Home className="w-4 h-4" />
                    <span>{t("home")}</span>
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={path(`/category/${cat.slug}`)}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 pl-8 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                  <Link
                    to={path("/about")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <Info className="w-4 h-4" />
                    <span>{t("about")}</span>
                  </Link>
                  <Link
                    to={path("/contact")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t("contact")}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1">{children}</main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-7 h-7 bg-[#FF9900] rounded-md flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  {siteTitle}
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {settingsMap["footerAbout"] || t("footerAbout")}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                {t("quickLinks")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to={path("/")}
                    className="text-sm text-gray-400 hover:text-[#FF9900] transition-colors"
                  >
                    {t("home")}
                  </Link>
                </li>
                <li>
                  <Link
                    to={path("/about")}
                    className="text-sm text-gray-400 hover:text-[#FF9900] transition-colors"
                  >
                    {t("about")}
                  </Link>
                </li>
                <li>
                  <Link
                    to={path("/contact")}
                    className="text-sm text-gray-400 hover:text-[#FF9900] transition-colors"
                  >
                    {t("contact")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                {t("categories")}
              </h3>
              <ul className="space-y-2">
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={path(`/#cat-${cat.slug}`)}
                      onClick={(e) => {
                        e.preventDefault();
                        const pn = location.pathname;
                        const isHome = pn === '/' || pn === '/de' || pn === '/es' || pn === '/it' || pn === '/fr' || pn === '/us';
                        if (!isHome) {
                          navigate(path(`/?cat=${cat.slug}`));
                        } else {
                          const el = document.getElementById(`cat-${cat.slug}`);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="text-sm text-gray-400 hover:text-[#FF9900] transition-colors"
                    >
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect + Admin */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                Connect
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                {contactEmail}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                &copy; {new Date().getFullYear()} {siteTitle}. {t("copyright")}
              </p>
              {/* Admin entry - moved to footer */}
              <Link
                to={path("/admin")}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#FF9900] transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg"
              >
                <Shield className="w-3.5 h-3.5" />
                {t("adminLogin")}
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Analytics code injection */}
      {analyticsCode && (
        <div dangerouslySetInnerHTML={{ __html: analyticsCode }} />
      )}
    </div>
  );
}
