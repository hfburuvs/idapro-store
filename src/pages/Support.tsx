import { supabase } from "@/lib/supabase";
import {
  Mail, User, MessageSquare, Send, Check, AlertCircle, Clock, Briefcase,
  Store, ExternalLink, Video, Download, BookOpen, HelpCircle, ChevronDown, ChevronRight, Globe
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

// Country code → language label map (shows language, not country)
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

  // Collapse state for categories and tags
  const [collapsedCats, setCollapsedCats] = useState<Set<number>>(new Set());
  const [collapsedTags, setCollapsedTags] = useState<Set<string>>(new Set());
  const toggleCat = (id: number) => setCollapsedCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleTag = (key: string) => setCollapsedTags(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  // Collapse state for categories and tags
  const [collapsedCats, setCollapsedCats] = useState<Set<number>>(new Set());
  const [collapsedTags, setCollapsedTags] = useState<Set<string>>(new Set());
  const toggleCat = (id: number) => setCollapsedCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleTag = (key: string) => setCollapsedTags(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  // Store links
  const [storeLinks, setStoreLinks] = useState<StoreLink[]>([]);
  // Categories + guides
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

        // Load store links
        const { data: linksData } = await supabase
          .from("store_links")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });
        setStoreLinks(linksData || []);

        // Load categories
        const { data: catsData } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true });
        setCategories(catsData || []);

        // Load installation guides
        const { data: guidesData } = await supabase
          .from("installation_guides")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });
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
    if (!name.trim() || !email.trim() || !content.trim()) {
      setError(c("contactRequiredError"));
      return;
    }
    setSending(true);
    try {
      const { error: msgErr } = await supabase.from("messages").insert({ name, email, content });
      if (msgErr) throw msgErr;
      if (subscribe) { try { await supabase.from("subscribers").insert({ email }); } catch {} }
      setSubmitted(true);
      setName(""); setEmail(""); setContent(""); setSubscribe(false);
    } catch (err: any) { setError(err.message || "Failed"); }
    finally { setSending(false); }
  };

  const infoItems = [
    ...(contactEmail ? [{ icon: Mail, label: "Email", value: contactEmail }] : []),
    { icon: Clock, label: c("contactResponseTime"), value: c("contactResponseValue") },
    { icon: Briefcase, label: c("contactBusinessHours"), value: c("contactBusinessValue") },
  ];

  // Group guides by category → product_tag → country variants (sorted 3-level)
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
    // Sort Level 1: categories by sort_order
    return Object.values(map).sort((a, b) => (a.category.sort_order ?? 0) - (b.category.sort_order ?? 0));
  }, [guides, categories]);

  // Download helper: open preview in new window + trigger file download
  async function downloadFile(url: string, filename?: string) {
    // 1. Open preview in new window immediately
    window.open(url, '_blank', 'noopener,noreferrer');
    // 2. Try to trigger download via fetch+blob
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const ext = url.split('.').pop()?.split('?')[0] || 'pdf';
      const name = filename ? `${filename}.${ext}` : `manual.${ext}`;
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
        URL.revokeObjectURL(objUrl);
      }, 200);
    } catch {
      // Download via fetch failed — preview window is already open
    }
  }

  // Default store links if DB is empty
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
      {/* ============ Hero Banner ============ */}
      <section style={{ background: '#131921', color: '#fff', padding: '48px 24px' }}>
        <div className="max-w-[1500px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{t("supportTitle") || "Support"}</h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: '#ccc' }}>{t("supportSubtitle") || "Find installation guides, store links, and get in touch with us."}</p>
        </div>
      </section>

      <main className="max-w-[1500px] mx-auto px-3 sm:px-4 py-10 space-y-12">

        {/* ============ Section 1: Store Links ============ */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: '#131921' }}>
              <Store className="w-4 h-4" style={{ color: '#FF9900' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#0F1111' }}>{t("storeLinksTitle") || "Our Amazon Stores"}</h2>
          </div>
          <p className="text-sm mb-5" style={{ color: '#565959' }}>{t("storeLinksDesc") || "Click to visit our store in your country:"}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {displayStoreLinks.map((link) => (
              <a
                key={`${link.country_code}-${link.sort_order}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-lg transition-all hover:shadow-md"
                style={{ background: '#fff', border: '1px solid #eee' }}
              >
                <img
                  src={`https://flagcdn.com/w80/${link.country_code === 'uk' ? 'gb' : link.country_code}.png`}
                  alt={link.country_code}
                  className="w-10 h-7 object-cover rounded-sm"
                />
                <span className="text-sm font-semibold" style={{ color: '#0F1111' }}>{link.label}</span>
                <ExternalLink className="w-3.5 h-3.5" style={{ color: '#999' }} />
              </a>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #eee' }} />

        {/* ============ Section 2: Installation Guides ============ */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: '#131921' }}>
              <BookOpen className="w-4 h-4" style={{ color: '#FF9900' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#0F1111' }}>{t("installationGuidesTitle") || "Installation Guides"}</h2>
          </div>
          <p className="text-sm mb-5" style={{ color: '#565959' }}>{t("installationGuidesDesc") || "Find video tutorials and download instruction manuals by product category:"}</p>

          {guidesByCategory.length === 0 ? (
            <div className="text-center py-10 rounded-lg" style={{ background: '#f7f8f8', border: '1px dashed #ddd' }}>
              <HelpCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
              <p className="text-sm" style={{ color: '#565959' }}>{t("noGuides") || "No installation guides available yet."}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {guidesByCategory.map(({ category, products }) => {
                const isCatCollapsed = collapsedCats.has(category.id);
                return (
                  <div key={category.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid #eee' }}>
                    {/* Category header (Level 1) — clickable toggle */}
                    <button onClick={() => toggleCat(category.id)} className="w-full flex items-center justify-between px-5 py-3 font-semibold text-sm cursor-pointer" style={{ background: '#f0f1f2', color: '#0F1111', borderBottom: '1px solid #ddd' }}>
                      <span>{category.name}</span>
                      {isCatCollapsed ? <ChevronRight className="w-4 h-4" style={{ color: '#999' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#999' }} />}
                    </button>
                    {/* Products (Level 2) — sorted by first guide's sort_order */}
                    {!isCatCollapsed && (
                      <div className="p-4 space-y-4" style={{ background: '#fafafa' }}>
                        {Object.values(products).sort((a, b) => (a.guides[0]?.sort_order ?? 0) - (b.guides[0]?.sort_order ?? 0)).map((product) => {
                          const tagKey = `${category.id}:${product.tag}`;
                          const isTagCollapsed = collapsedTags.has(tagKey);
                          // Single guide: merge Level 2 + Level 3 into one row
                          if (product.guides.length === 1) {
                            const guide = product.guides[0];
                            return (
                              <div key={product.tag} className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 rounded-lg bg-white" style={{ border: '1px solid #e5e5e5' }}>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {product.icon_url ? (
                                    <img src={product.icon_url} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#e5e7eb' }}>
                                      <HelpCircle className="w-5 h-5" style={{ color: '#9ca3af' }} />
                                    </div>
                                  )}
                                  <span className="text-sm font-medium" style={{ color: '#0F1111' }}>{product.tag}</span>
                                  <span
                                    title={getLangFullName(guide.country_code)}
                                    className="inline-flex items-center justify-center w-8 h-5 rounded text-[10px] font-bold flex-shrink-0"
                                    style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}
                                  >{guide.language || getLangLabel(guide.country_code)}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {guide.video_url && (
                                    <a href={guide.video_url} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                                      style={{ background: 'linear-gradient(180deg, #ffd472, #f3a847)', color: '#0F1111', border: '1px solid #a88734' }}>
                                      <Video className="w-3 h-3" />{t("watchVideo") || "Video"}
                                    </a>
                                  )}
                                  {guide.manual_url && (
                                    <button onClick={() => downloadFile(guide.manual_url, (guide.title || product.tag).replace(/[^a-zA-Z0-9]/g, "_"))}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
                                      style={{ background: '#fff', color: '#0F1111', border: '1px solid #d5d9d9' }}>
                                      <Download className="w-3 h-3" />{t("downloadManual") || "Manual"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          // Multi guides: normal 3-level display with collapsible tag
                          return (
                            <div key={product.tag} className="rounded-lg overflow-hidden bg-white" style={{ border: '1px solid #e5e5e5' }}>
                              {/* Tag header (Level 2) — clickable toggle */}
                              <button onClick={() => toggleTag(tagKey)} className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer" style={{ background: '#f7f8f8', borderBottom: '1px solid #eee' }}>
                                <div className="flex items-center gap-3">
                                  {product.icon_url ? (
                                    <img src={product.icon_url} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#e5e7eb' }}>
                                      <HelpCircle className="w-5 h-5" style={{ color: '#9ca3af' }} />
                                    </div>
                                  )}
                                  <span className="text-sm font-medium" style={{ color: '#0F1111' }}>{product.tag}</span>
                                </div>
                                {isTagCollapsed ? <ChevronRight className="w-4 h-4" style={{ color: '#999' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#999' }} />}
                              </button>
                              {/* Language variants (Level 3) — sorted by sort_order */}
                              {!isTagCollapsed && (
                                <div className="divide-y divide-gray-100">
                                  {product.guides.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((guide) => (
                                    <div key={guide.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span
                                          title={getLangFullName(guide.country_code)}
                                          className="inline-flex items-center justify-center w-8 h-5 rounded text-[10px] font-bold flex-shrink-0"
                                          style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}
                                        >{guide.language || getLangLabel(guide.country_code)}</span>
                                        <span className="text-sm truncate" style={{ color: '#0F1111' }}>{guide.title || product.tag}</span>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        {guide.video_url && (
                                          <a href={guide.video_url} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                                            style={{ background: 'linear-gradient(180deg, #ffd472, #f3a847)', color: '#0F1111', border: '1px solid #a88734' }}>
                                            <Video className="w-3 h-3" />{t("watchVideo") || "Video"}
                                          </a>
                                        )}
                                        {guide.manual_url && (
                                          <button onClick={() => downloadFile(guide.manual_url, (guide.title || product.tag).replace(/[^a-zA-Z0-9]/g, "_"))}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
                                            style={{ background: '#fff', color: '#0F1111', border: '1px solid #d5d9d9' }}>
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
        </section>        {/* Divider */}
        <div style={{ borderTop: '1px solid #eee' }} />

        {/* ============ Section 3: Contact Us ============ */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: '#131921' }}>
              <MessageSquare className="w-4 h-4" style={{ color: '#FF9900' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#0F1111' }}>{c("contactTitle")}</h2>
          </div>
          <p className="text-sm mb-5" style={{ color: '#565959' }}>{c("contactSubtitle")}</p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#0F1111' }}>{c("contactInfo")}</h3>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: '#565959' }}>{c("contactInfoDesc")}</p>
                <div className="space-y-3">
                  {infoItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#fff', border: '1px solid #eee' }}>
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
              </div>
              {/* FAQ */}
              <div className="bg-white rounded-lg p-5" style={{ border: '1px solid #eee' }}>
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
              <div className="bg-white rounded-lg p-6" style={{ border: '1px solid #eee' }}>
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
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#0F1111' }}>{c("contactFormTitle")}</h3>
                    {error && <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ color: '#dc2626', background: '#fef2f2' }}><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>}
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0F1111' }}>{c("contactNameLabel")}</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 border rounded-md text-sm outline-none focus:ring-2" style={{ borderColor: '#d5d9d9' }} placeholder={c("contactNamePlaceholder")}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,153,0,0.15)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#d5d9d9'; e.currentTarget.style.boxShadow = 'none'; }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0F1111' }}>{c("contactEmailLabel")}</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border rounded-md text-sm outline-none" style={{ borderColor: '#d5d9d9' }} placeholder={c("contactEmailPlaceholder")}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,153,0,0.15)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#d5d9d9'; e.currentTarget.style.boxShadow = 'none'; }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0F1111' }}>{c("contactMessageLabel")}</label>
                      <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full px-3 py-2.5 border rounded-md text-sm outline-none resize-none" style={{ borderColor: '#d5d9d9' }} placeholder={c("contactMessagePlaceholder")}
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
