import { supabase } from "@/lib/supabase";
import {
  Mail, User, MessageSquare, Send, Check, AlertCircle, Clock, Briefcase,
  Store, ExternalLink, Video, Download, BookOpen, HelpCircle, ChevronDown, ChevronRight, Globe, Headphones, MapPin
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useCountry } from "@/hooks/useCountry";

interface StoreLink {
  id: number;
  country_code: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

interface InstallationGuide {
  id: number;
  category_id: number;
  icon_url: string;
  product_tag: string;
  country_code: string;
  video_url: string;
  manual_url: string;
  sort_order: number;
  is_active: boolean;
  title: string;
  language: string;
}

const LANG_MAP: Record<string, string> = {
  us: "English", uk: "English", ca: "English", au: "English", nz: "English", ie: "English",
  de: "Deutsch", es: "Español", fr: "Français", it: "Italiano",
  ja: "日本語", ko: "한국어", zh: "中文", nl: "Nederlands",
  pt: "Português", pl: "Polski", sv: "Svenska", da: "Dansk",
  no: "Norsk", fi: "Suomi", ru: "Русский", ar: "العربية",
  hi: "हिन्दी", th: "ไทย", vi: "Tiếng Việt", tr: "Türkçe",
  he: "עברית", id: "Bahasa Indonesia", ms: "Bahasa Melayu",
  cs: "Čeština", el: "Ελληνικά", hu: "Magyar", ro: "Română",
  sk: "Slovenčina", bg: "Български", hr: "Hrvatski", lt: "Lietuvių",
  sl: "Slovenščina", et: "Eesti", lv: "Latviešu", mt: "Malti",
};
const LANG_CODE_MAP: Record<string, string> = {
  us: "EN", uk: "EN", ca: "EN", au: "EN", nz: "EN", ie: "EN",
  de: "DE", es: "ES", fr: "FR", it: "IT",
  ja: "JA", ko: "KO", zh: "ZH", nl: "NL",
  pt: "PT", pl: "PL", sv: "SV", da: "DA",
  no: "NO", fi: "FI", ru: "RU", ar: "AR",
  hi: "HI", th: "TH", vi: "VI", tr: "TR",
  he: "HE", id: "ID", ms: "MS",
  cs: "CS", el: "EL", hu: "HU", ro: "RO",
  sk: "SK", bg: "BG", hr: "HR", lt: "LT",
  sl: "SL", et: "ET", lv: "LV", mt: "MT",
};
function getLangLabel(code: string) { return LANG_CODE_MAP[code] || code.toUpperCase(); }
function getLangFullName(code: string) { return LANG_MAP[code] || code.toUpperCase(); }

export default function Support() {
  const { t, country } = useCountry();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});

  // Collapse state
  const [collapsedCats, setCollapsedCats] = useState<Set<number>>(new Set());
  const [collapsedTags, setCollapsedTags] = useState<Set<string>>(new Set());
  const toggleCat = (id: number) => setCollapsedCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleTag = (key: string) => setCollapsedTags(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  // Store links
  const [storeLinks, setStoreLinks] = useState<StoreLink[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [guides, setGuides] = useState<InstallationGuide[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const { data: settingsData } = await supabase.from("settings").select("*");
        const map: Record<string, string> = {};
        (settingsData || []).forEach((s: any) => { map[s.key] = s.value; });
        setSettingsMap(map);
        if (map["contactEmail"]) setContactEmail(map["contactEmail"]);

        const { data: linksData } = await supabase.from("store_links").select("*").eq("is_active", true).order("sort_order", { ascending: true });
        setStoreLinks(linksData || []);
        const { data: catsData } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
        setCategories(catsData || []);
        const { data: guidesData } = await supabase.from("installation_guides").select("*").eq("is_active", true).order("sort_order", { ascending: true });
        setGuides(guidesData || []);
      } catch (e) { /* ignore */ }
    }
    load();
  }, []);

  const c = (key: string) => {
    if (country === "us") return settingsMap[key] || t(key);
    return t(key);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !content.trim()) { setError(c("contactRequiredError")); return; }
    setSending(true);
    try {
      const { error: msgErr } = await supabase.from("messages").insert({ name, email, content });
      if (msgErr) throw msgErr;
      if (subscribe) { try { await supabase.from("subscribers").insert({ email }); } catch {} }
      setSubmitted(true); setName(""); setEmail(""); setContent(""); setSubscribe(false);
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSending(false); }
  };

  const infoItems = [
    ...(contactEmail ? [{ icon: Mail, label: "Email", value: contactEmail }] : []),
    { icon: Clock, label: c("contactResponseTime"), value: c("contactResponseValue") },
    { icon: Briefcase, label: c("contactBusinessHours"), value: c("contactBusinessValue") },
  ];

  // Group guides (sorted 3-level)
  const guidesByCategory = useMemo(() => {
    const map: Record<number, { category: Category; products: Record<string, { icon_url: string; tag: string; guides: InstallationGuide[] }> }> = {};
    for (const guide of guides) {
      const cat = categories.find((c) => c.id === guide.category_id);
      if (!cat) continue;
      if (!map[cat.id]) map[cat.id] = { category: cat, products: {} };
      const tag = guide.product_tag || guide.title || "untitled";
      if (!map[cat.id].products[tag]) map[cat.id].products[tag] = { icon_url: guide.icon_url, tag, guides: [] };
      if (guide.icon_url && !map[cat.id].products[tag].icon_url) map[cat.id].products[tag].icon_url = guide.icon_url;
      map[cat.id].products[tag].guides.push(guide);
    }
    return Object.values(map).sort((a, b) => (a.category.sort_order ?? 0) - (b.category.sort_order ?? 0));
  }, [guides, categories]);

  async function downloadFile(url: string, filename?: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
    try {
      const res = await fetch(url); const blob = await res.blob();
      const ext = url.split('.').pop()?.split('?')[0] || 'pdf';
      const name = filename ? `${filename}.${ext}` : `manual.${ext}`;
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = objUrl; a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(() => { if (a.parentNode) document.body.removeChild(a); URL.revokeObjectURL(objUrl); }, 200);
    } catch { /* preview already opened */ }
  }

  const defaultStoreLinks: StoreLink[] = [
    { id: 0, country_code: "us", label: t("storeUS") || "US Store", url: "https://www.amazon.com", sort_order: 0, is_active: true },
    { id: 0, country_code: "uk", label: t("storeUK") || "UK Store", url: "https://www.amazon.co.uk", sort_order: 1, is_active: true },
    { id: 0, country_code: "de", label: t("storeDE") || "DE Store", url: "https://www.amazon.de", sort_order: 2, is_active: true },
    { id: 0, country_code: "es", label: t("storeES") || "ES Store", url: "https://www.amazon.es", sort_order: 3, is_active: true },
    { id: 0, country_code: "it", label: t("storeIT") || "IT Store", url: "https://www.amazon.it", sort_order: 4, is_active: true },
    { id: 0, country_code: "fr", label: t("storeFR") || "FR Store", url: "https://www.amazon.fr", sort_order: 5, is_active: true },
  ];
  const displayStoreLinks = storeLinks.length > 0 ? storeLinks : defaultStoreLinks;

  return (
    <div>
      {/* ============ Hero — Home style gradient + left-right layout ============ */}
      <section style={{ background: 'linear-gradient(135deg, #f7f8f8 0%, #e8e8e8 50%, #f0f1f1 100%)', padding: '40px 0' }}>
        <div className="max-w-[1500px] mx-auto px-3 sm:px-4 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#131921', color: '#fff', letterSpacing: 0.3 }}>
              <Headphones className="w-3 h-3" style={{ color: '#FF9900' }} />
              {t("supportBadge") || "Customer Support"}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight" style={{ color: '#0F1111' }}>
              {t("supportTitle") || "Support"}<span style={{ color: '#FF9900' }}>.</span>
            </h1>
            <p className="text-base max-w-lg mx-auto lg:mx-0 leading-relaxed" style={{ color: '#565959' }}>
              {t("supportSubtitle") || "Find installation guides, store links, and get in touch with us."}
            </p>
          </div>
          <div className="flex-1 hidden lg:flex justify-end gap-4 max-w-[480px]">
            <div className="bg-white rounded-xl p-5 flex-1" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
              <Store className="w-8 h-8 mb-3" style={{ color: '#FF9900' }} />
              <p className="text-sm font-bold" style={{ color: '#0F1111' }}>{t("storeLinksTitle") || "Amazon Stores"}</p>
              <p className="text-xs mt-1" style={{ color: '#565959' }}>Visit our stores worldwide</p>
            </div>
            <div className="bg-white rounded-xl p-5 flex-1" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
              <BookOpen className="w-8 h-8 mb-3" style={{ color: '#FF9900' }} />
              <p className="text-sm font-bold" style={{ color: '#0F1111' }}>{t("installationGuidesTitle") || "Guides"}</p>
              <p className="text-xs mt-1" style={{ color: '#565959' }}>Videos & manuals by product</p>
            </div>
            <div className="bg-white rounded-xl p-5 flex-1" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
              <MessageSquare className="w-8 h-8 mb-3" style={{ color: '#FF9900' }} />
              <p className="text-sm font-bold" style={{ color: '#0F1111' }}>{c("contactTitle") || "Contact"}</p>
              <p className="text-xs mt-1" style={{ color: '#565959' }}>Get in touch with us</p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-[1500px] mx-auto px-3 sm:px-4 py-8 space-y-8">

        {/* ============ Section 1: Store Links — horizontal strip ============ */}
        <section className="bg-white rounded-lg p-5 sm:p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: '#131921' }}>
              <Store className="w-4 h-4" style={{ color: '#FF9900' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: '#0F1111' }}>{t("storeLinksTitle") || "Our Amazon Stores"}</h2>
          </div>
          {/* Horizontal scrolling strip */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {displayStoreLinks.map((link) => (
              <a key={`${link.country_code}-${link.sort_order}`} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all bg-white"
                style={{ color: '#0F1111', border: '1px solid #d5d9d9' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,153,0,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d5d9d9'; e.currentTarget.style.boxShadow = 'none'; }}>
                <img src={`https://flagcdn.com/w80/${link.country_code === 'uk' ? 'gb' : link.country_code}.png`} alt={link.country_code} className="w-6 h-4 object-cover rounded-sm" />
                <span>{link.label}</span>
                <ExternalLink className="w-3 h-3" style={{ color: '#999' }} />
              </a>
            ))}
          </div>
        </section>

        {/* ============ Section 2: Installation Guides — card sections ============ */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: '#131921' }}>
              <BookOpen className="w-4 h-4" style={{ color: '#FF9900' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: '#0F1111' }}>{t("installationGuidesTitle") || "Installation Guides"}</h2>
          </div>

          {guidesByCategory.length === 0 ? (
            <div className="bg-white rounded-lg p-10 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <HelpCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#ccc' }} />
              <p className="text-sm" style={{ color: '#565959' }}>{t("noGuides") || "No installation guides available yet."}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {guidesByCategory.map(({ category, products }) => {
                const isCatCollapsed = collapsedCats.has(category.id);
                return (
                  <div key={category.id} className="bg-white rounded-lg overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    {/* Category header — Home style */}
                    <button onClick={() => toggleCat(category.id)}
                      className="w-full flex items-center justify-between px-5 py-3 cursor-pointer"
                      style={{ borderBottom: isCatCollapsed ? 'none' : '1px solid #eee' }}>
                      <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#FF9900' }} />
                        <h3 className="text-sm font-bold" style={{ color: '#0F1111' }}>{category.name}</h3>
                        <span className="text-xs" style={{ color: '#999' }}>{Object.keys(products).length} products</span>
                      </div>
                      {isCatCollapsed ? <ChevronRight className="w-4 h-4" style={{ color: '#999' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#999' }} />}
                    </button>
                    {!isCatCollapsed && (
                      <div className="p-4 space-y-3" style={{ background: '#fafafa' }}>
                        {Object.values(products).sort((a, b) => (a.guides[0]?.sort_order ?? 0) - (b.guides[0]?.sort_order ?? 0)).map((product) => {
                          const tagKey = `${category.id}:${product.tag}`;
                          const isTagCollapsed = collapsedTags.has(tagKey);
                          // Single guide: compact merged row
                          if (product.guides.length === 1) {
                            const guide = product.guides[0];
                            return (
                              <div key={product.tag} className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 bg-white rounded-lg transition-all"
                                style={{ border: '1px solid #e3e6e6' }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#cdcdcd'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e3e6e6'; }}>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {product.icon_url ? (
                                    <img src={product.icon_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#f0f1f2' }}>
                                      <HelpCircle className="w-4 h-4" style={{ color: '#bbb' }} />
                                    </div>
                                  )}
                                  <span className="text-sm font-semibold truncate" style={{ color: '#0F1111' }}>{product.tag}</span>
                                  <span title={getLangFullName(guide.country_code)} className="inline-flex items-center justify-center w-7 h-4 rounded text-[9px] font-bold flex-shrink-0" style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>{guide.language || getLangLabel(guide.country_code)}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {guide.video_url && (
                                    <a href={guide.video_url} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                      style={{ background: 'linear-gradient(180deg, #ffd472, #f3a847)', color: '#0F1111', border: '1px solid #a88734' }}>
                                      <Video className="w-3 h-3" />{t("watchVideo") || "Video"}
                                    </a>
                                  )}
                                  {guide.manual_url && (
                                    <button onClick={() => downloadFile(guide.manual_url, (guide.title || product.tag).replace(/[^a-zA-Z0-9]/g, "_"))}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer bg-white"
                                      style={{ color: '#0F1111', border: '1px solid #d5d9d9' }}
                                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF9900'; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d5d9d9'; }}>
                                      <Download className="w-3 h-3" />{t("downloadManual") || "Manual"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          // Multi guides: collapsible tag
                          return (
                            <div key={product.tag} className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #e3e6e6' }}>
                              <button onClick={() => toggleTag(tagKey)} className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer" style={{ borderBottom: isTagCollapsed ? 'none' : '1px solid #eee' }}>
                                <div className="flex items-center gap-3">
                                  {product.icon_url ? (
                                    <img src={product.icon_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#f0f1f2' }}>
                                      <HelpCircle className="w-4 h-4" style={{ color: '#bbb' }} />
                                    </div>
                                  )}
                                  <span className="text-sm font-semibold" style={{ color: '#0F1111' }}>{product.tag}</span>
                                  <span className="text-xs" style={{ color: '#999' }}>({product.guides.length} languages)</span>
                                </div>
                                {isTagCollapsed ? <ChevronRight className="w-4 h-4" style={{ color: '#999' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#999' }} />}
                              </button>
                              {!isTagCollapsed && (
                                <div className="divide-y divide-gray-100">
                                  {product.guides.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((guide) => (
                                    <div key={guide.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-2.5">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span title={getLangFullName(guide.country_code)} className="inline-flex items-center justify-center w-7 h-4 rounded text-[9px] font-bold flex-shrink-0" style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>{guide.language || getLangLabel(guide.country_code)}</span>
                                        <span className="text-sm truncate" style={{ color: '#0F1111' }}>{guide.title || product.tag}</span>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        {guide.video_url && (
                                          <a href={guide.video_url} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                            style={{ background: 'linear-gradient(180deg, #ffd472, #f3a847)', color: '#0F1111', border: '1px solid #a88734' }}>
                                            <Video className="w-3 h-3" />{t("watchVideo") || "Video"}
                                          </a>
                                        )}
                                        {guide.manual_url && (
                                          <button onClick={() => downloadFile(guide.manual_url, (guide.title || product.tag).replace(/[^a-zA-Z0-9]/g, "_"))}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer bg-white"
                                            style={{ color: '#0F1111', border: '1px solid #d5d9d9' }}>
                                            <Download className="w-3 h-3" />{t("downloadManual") || "Manual"}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ============ Section 3: Contact Us — card layout ============ */}
        <section className="bg-white rounded-lg overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid #eee' }}>
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: '#131921' }}>
              <MessageSquare className="w-4 h-4" style={{ color: '#FF9900' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: '#0F1111' }}>{c("contactTitle")}</h2>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ background: '#fafafa' }}>
            {/* Left: Contact Info */}
            <div className="lg:col-span-2 space-y-5">
              <p className="text-sm leading-relaxed" style={{ color: '#565959' }}>{c("contactInfoDesc")}</p>
              <div className="space-y-2.5">
                {infoItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg" style={{ border: '1px solid #eee' }}>
                    <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: '#131921' }}>
                      <item.icon className="w-4 h-4" style={{ color: '#FF9900' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#0F1111' }}>{item.label}</p>
                      <p className="text-xs" style={{ color: '#565959' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* FAQ */}
              <div className="bg-white rounded-lg p-4" style={{ border: '1px solid #eee' }}>
                <h3 className="font-bold mb-3 text-sm" style={{ color: '#0F1111' }}>{c("contactFAQ")}</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <details key={i} className="group">
                      <summary className="flex items-center justify-between text-sm py-2 cursor-pointer" style={{ color: '#0F1111' }}>
                        {c(`contactFAQ${i}Q` as any)}
                        <svg className="w-3.5 h-3.5 transition group-open:rotate-180" style={{ color: '#999' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </summary>
                      <p className="pb-2 text-xs" style={{ color: '#565959' }}>{c(`contactFAQ${i}A` as any)}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg p-5" style={{ border: '1px solid #eee' }}>
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#ecfdf5' }}>
                      <Check className="w-7 h-7" style={{ color: '#16a34a' }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#0F1111' }}>{c("contactSuccessTitle")}</h3>
                    <p className="text-sm mb-5" style={{ color: '#565959' }}>{c("contactSuccessDesc")}</p>
                    <button onClick={() => setSubmitted(false)} className="text-sm font-medium" style={{ color: '#FF9900' }}>{c("contactSendAnother")}</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-base font-bold mb-1" style={{ color: '#0F1111' }}>{c("contactFormTitle")}</h3>
                    {error && <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ color: '#dc2626', background: '#fef2f2' }}><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>}
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#0F1111' }}>{c("contactNameLabel")}</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 border rounded-md text-sm outline-none" style={{ borderColor: '#d5d9d9' }} placeholder={c("contactNamePlaceholder")}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,153,0,0.15)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#d5d9d9'; e.currentTarget.style.boxShadow = 'none'; }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#0F1111' }}>{c("contactEmailLabel")}</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border rounded-md text-sm outline-none" style={{ borderColor: '#d5d9d9' }} placeholder={c("contactEmailPlaceholder")}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,153,0,0.15)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#d5d9d9'; e.currentTarget.style.boxShadow = 'none'; }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#0F1111' }}>{c("contactMessageLabel")}</label>
                      <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full px-3 py-2.5 border rounded-md text-sm outline-none resize-none" style={{ borderColor: '#d5d9d9' }} placeholder={c("contactMessagePlaceholder")}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,153,0,0.15)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#d5d9d9'; e.currentTarget.style.boxShadow = 'none'; }} />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={subscribe} onChange={e => setSubscribe(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#FF9900' }} />
                      <span className="text-sm" style={{ color: '#565959' }}>{c("contactSubscribe")}</span>
                    </label>
                    <button type="submit" disabled={sending} className="w-full py-2.5 rounded-md text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(180deg, #ffd472, #f3a847)', color: '#0F1111', border: '1px solid #a88734' }}>
                      <Send className="w-4 h-4" /><span>{sending ? c("contactSending") : c("contactSend")}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
