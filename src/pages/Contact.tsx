import { supabase } from "@/lib/supabase";
import { Mail, User, MessageSquare, Send, Check, AlertCircle, Clock, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { useCountry } from "@/hooks/useCountry";

export default function Contact() {
  const { t } = useCountry();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from("settings").select("*");
        const map: Record<string, string> = {};
        (data || []).forEach((s: any) => { map[s.key] = s.value; });
        if (map["contactEmail"]) setContactEmail(map["contactEmail"]);
      } catch (e) { /* ignore */ }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !content.trim()) {
      setError(t("contactRequiredError"));
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
    { icon: Clock, label: t("contactResponseTime"), value: t("contactResponseValue") },
    { icon: Briefcase, label: t("contactBusinessHours"), value: t("contactBusinessValue") },
  ];

  return (
    <div>
      {/* Hero — Amazon dark style */}
      <section style={{ background: '#131921', color: '#fff', padding: '48px 24px' }}>
        <div className="max-w-[1500px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{t("contactTitle")}</h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: '#ccc' }}>{t("contactSubtitle")}</p>
        </div>
      </section>

      <main className="max-w-[1500px] mx-auto px-3 sm:px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#0F1111' }}>{t("contactInfo")}</h2>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: '#565959' }}>{t("contactInfoDesc")}</p>
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
              <h3 className="font-bold mb-3 text-sm" style={{ color: '#0F1111' }}>{t("contactFAQ")}</h3>
              <div className="space-y-2">
                {[1,2,3].map(i => (
                  <details key={i} className="group">
                    <summary className="flex items-center justify-between text-sm py-2 cursor-pointer" style={{ color: '#0F1111' }}>
                      {t(`contactFAQ${i}Q` as any)}
                      <svg className="w-3.5 h-3.5 transition group-open:rotate-180" style={{ color: '#999' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <p className="pb-2 text-xs" style={{ color: '#565959' }}>{t(`contactFAQ${i}A` as any)}</p>
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
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#0F1111' }}>{t("contactSuccessTitle")}</h3>
                  <p className="text-sm mb-5" style={{ color: '#565959' }}>{t("contactSuccessDesc")}</p>
                  <button onClick={() => setSubmitted(false)} className="text-sm font-medium" style={{ color: '#FF9900' }}>{t("contactSendAnother")}</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-bold mb-2" style={{ color: '#0F1111' }}>{t("contactFormTitle")}</h2>
                  {error && <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ color: '#dc2626', background: '#fef2f2' }}><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0F1111' }}>{t("contactNameLabel")}</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 border rounded-md text-sm outline-none focus:ring-2" style={{ borderColor: '#d5d9d9' }} placeholder={t("contactNamePlaceholder")}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,153,0,0.15)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#d5d9d9'; e.currentTarget.style.boxShadow = 'none'; }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0F1111' }}>{t("contactEmailLabel")}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border rounded-md text-sm outline-none" style={{ borderColor: '#d5d9d9' }} placeholder={t("contactEmailPlaceholder")}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,153,0,0.15)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#d5d9d9'; e.currentTarget.style.boxShadow = 'none'; }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0F1111' }}>{t("contactMessageLabel")}</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full px-3 py-2.5 border rounded-md text-sm outline-none resize-none" style={{ borderColor: '#d5d9d9' }} placeholder={t("contactMessagePlaceholder")}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,153,0,0.15)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#d5d9d9'; e.currentTarget.style.boxShadow = 'none'; }} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={subscribe} onChange={e => setSubscribe(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#FF9900' }} />
                    <span className="text-sm" style={{ color: '#565959' }}>{t("contactSubscribe")}</span>
                  </label>
                  <button type="submit" disabled={sending} className="w-full py-2.5 rounded-md text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(180deg, #ffd472, #f3a847)', color: '#0F1111', border: '1px solid #a88734' }}>
                    <Send className="w-4 h-4" /><span>{sending ? t("contactSending") : t("contactSend")}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
