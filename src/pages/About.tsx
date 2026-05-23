import { useState, useEffect } from "react";
import { Shield, Eye, Smartphone, Award, Users, Zap, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { useCountry } from "@/hooks/useCountry";
import { supabase } from "@/lib/supabase";

interface VideoItem {
  id: number;
  title: string;
  video_url: string;
  sort_order: number;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
}

export default function About() {
  const { t, path, country } = useCountry();
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: settingsData }, { data: videoData }] = await Promise.all([
          supabase.from("settings").select("*"),
          supabase.from("videos").select("*").order("sort_order", { ascending: true }),
        ]);
        const map: Record<string, string> = {};
        (settingsData || []).forEach((s: any) => { map[s.key] = s.value; });
        setSettingsMap(map);
        setVideos(videoData || []);
      } catch (e) { /* ignore */ }
    }
    load();
  }, []);

  const c = (key: string) => {
    if (country === "us") return settingsMap[key] || t(key);
    return t(key);
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
      {/* Hero Banner */}
      <section className="hero-pattern py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-[#FF9900] rounded-full animate-pulse" />
            {t("aboutUs") || "About Us"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {c("aboutTitle")} <span className="text-[#FF9900]">iDaPro</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {c("aboutHero")}
          </p>
        </div>
      </section>

      {/* Brand Story */}
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
          <div className="bg-gradient-to-br from-[#FF9900]/10 to-orange-100 rounded-2xl p-6 text-center relative overflow-hidden">
            {videos.length > 0 ? (
              <div className="relative">
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  {videos.map((v, i) => {
                    const embedUrl = getYouTubeEmbedUrl(v.video_url);
                    return (
                      <div key={v.id} className={`${i === currentVideo ? 'block' : 'hidden'} w-full h-full`}>
                        {embedUrl ? (
                          <iframe src={embedUrl} title={v.title} className="w-full h-full" allowFullScreen />
                        ) : (
                          <video src={v.video_url} controls className="w-full h-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
                {videos.length > 1 && (
                  <>
                    <div className="flex justify-between items-center mt-3">
                      <button onClick={() => setCurrentVideo((p) => (p - 1 + videos.length) % videos.length)} className="w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"><ChevronLeft className="w-4 h-4 text-gray-700" /></button>
                      <p className="text-sm text-gray-600 font-medium">{videos[currentVideo]?.title}</p>
                      <button onClick={() => setCurrentVideo((p) => (p + 1) % videos.length)} className="w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"><ChevronRight className="w-4 h-4 text-gray-700" /></button>
                    </div>
                    <div className="flex justify-center gap-1.5 mt-2">
                      {videos.map((_, i) => (
                        <button key={i} onClick={() => setCurrentVideo(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentVideo ? 'bg-[#FF9900] w-4' : 'bg-gray-300'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="text-6xl font-black text-[#FF9900] mb-2">iDaPro</div>
                <div className="text-xl font-bold text-gray-900 mb-4">Precision Armor</div>
                <div className="text-lg text-gray-600 italic">Unstoppable Clarity</div>
                <div className="mt-6 flex justify-center gap-4">
                  <Shield className="w-8 h-8 text-[#FF9900]" />
                  <Eye className="w-8 h-8 text-[#FF9900]" />
                  <Smartphone className="w-8 h-8 text-[#FF9900]" />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {c("aboutWhyTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-black/[0.08] p-6 hover:shadow-md transition-shadow">
                <f.icon className="w-10 h-10 text-[#FF9900] mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(f.titleKey)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {c("aboutCommitment")}
        </h2>
        <div className="max-w-3xl mx-auto text-gray-600 leading-relaxed text-center">
          <p>{c("aboutCommitmentText")}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-pattern py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {c("aboutCTA")}
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
            {c("aboutCTADesc")}
          </p>
          <Link to={path("/")} className="btn-primary text-white text-lg font-semibold py-3 px-8 rounded-full transition-all inline-block">
            {t("aboutShopNow")}
          </Link>
        </div>
      </section>
    </div>
  );
}
