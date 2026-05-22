import { useState, useEffect } from "react";
import { Shield, Eye, Smartphone, Award, Users, Zap } from "lucide-react";
import { Link } from "react-router";
import { useCountry } from "@/hooks/useCountry";
import { supabase } from "@/lib/supabase";

export default function About() {
  const { t, path, country } = useCountry();
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from("settings").select("*");
        const map: Record<string, string> = {};
        (data || []).forEach((s: any) => { map[s.key] = s.value; });
        setSettingsMap(map);
      } catch (e) { /* ignore */ }
    }
    load();
  }, []);

  const c = (key: string) => {
    // US site: use settings value (editable) or fallback to English translation
    // Other sites: use translated text from i18n system
    if (country === "us") return settingsMap[key] || t(key);
    return t(key); // Non-US: always use translation
  };

  const features = [
    { icon: Shield, titleKey: "aboutFeature1", descKey: "aboutFeature1Desc" },
    { icon: Eye, titleKey: "aboutFeature2", descKey: "aboutFeature2Desc" },
    { icon: Smartphone, titleKey: "aboutFeature3", descKey: "aboutFeature3Desc" },
    { icon: Zap, titleKey: "aboutFeature4", descKey: "aboutFeature4Desc" },
    { icon: Award, titleKey: "aboutFeature5", descKey: "aboutFeature5Desc" },
    { icon: Users, titleKey: "aboutFeature6", descKey: "aboutFeature6Desc" },
  ];

  return (
    <div>
      <section className="relative bg-gradient-to-br from-[#111827] to-[#374151] py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {c("aboutTitle")} <span className="text-[#FF9900]">iDaPro</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {c("aboutHero")}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {c("aboutSubtitle")} <span className="text-[#FF9900]">9H Films</span>
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>{c("aboutStory")}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#FF9900]/10 to-[#111827]/10 rounded-2xl p-8 text-center">
            <div className="text-6xl font-black text-[#FF9900] mb-2">iDaPro</div>
            <div className="text-xl font-bold text-gray-900 mb-4">Precision Armor</div>
            <div className="text-lg text-gray-600 italic">Unstoppable Clarity</div>
            <div className="mt-6 flex justify-center gap-4">
              <Shield className="w-8 h-8 text-[#FF9900]" />
              <Eye className="w-8 h-8 text-[#FF9900]" />
              <Smartphone className="w-8 h-8 text-[#FF9900]" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {c("aboutWhyTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <f.icon className="w-10 h-10 text-[#FF9900] mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(f.titleKey)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {c("aboutCommitment")}
        </h2>
        <div className="max-w-3xl mx-auto text-gray-600 leading-relaxed">
          <p>{c("aboutCommitmentText")}</p>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#111827] to-[#374151] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {c("aboutCTA")}
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            {c("aboutCTADesc")}
          </p>
          <Link to={path("/")} className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#E68A00] text-white text-lg font-semibold py-3 px-8 rounded-lg transition-colors">
            {t("aboutShopNow")}
          </Link>
        </div>
      </section>
    </div>
  );
}
