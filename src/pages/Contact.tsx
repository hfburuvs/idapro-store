import { supabase } from "@/lib/supabase";
import { Mail, User, MessageSquare, Send, Check, AlertCircle } from "lucide-react";
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

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-pattern py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t("contactTitle")}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("contactSubtitle")}</p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("contactInfo")}</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">{t("contactInfoDesc")}</p>
              <div className="space-y-4">
                {contactEmail && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[#FF9900]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#FF9900]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-500">{contactEmail}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-[#FF9900]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-[#FF9900]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t("contactResponseTime")}</p>
                    <p className="text-sm text-gray-500">{t("contactResponseValue")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-[#FF9900]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-[#FF9900]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t("contactBusinessHours")}</p>
                    <p className="text-sm text-gray-500">{t("contactBusinessValue")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t("contactFAQ")}</h3>
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <details key={i} className="group">
                    <summary className="flex items-center justify-between text-sm font-medium text-gray-700 cursor-pointer">
                      {t(`contactFAQ${i}Q` as any)}
                      <svg className="w-4 h-4 transition group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <p className="mt-2 text-sm text-gray-500">{t(`contactFAQ${i}A` as any)}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("contactSuccessTitle")}</h3>
                <p className="text-sm text-gray-500 mb-6">{t("contactSuccessDesc")}</p>
                <button onClick={() => setSubmitted(false)} className="text-[#FF9900] hover:underline text-sm font-medium">{t("contactSendAnother")}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("contactFormTitle")}</h2>
                {error && <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("contactNameLabel")}</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] text-sm" placeholder={t("contactNamePlaceholder")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("contactEmailLabel")}</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] text-sm" placeholder={t("contactEmailPlaceholder")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("contactMessageLabel")}</label>
                  <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] text-sm resize-none" placeholder={t("contactMessagePlaceholder")} />
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={subscribe} onChange={e => setSubscribe(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#FF9900] focus:ring-[#FF9900]/20" />
                  <span className="text-sm text-gray-600">{t("contactSubscribe")}</span>
                </label>
                <button type="submit" disabled={sending} className="w-full py-2.5 bg-[#FF9900] hover:bg-[#E68A00] text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /><span>{sending ? t("contactSending") : t("contactSend")}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
