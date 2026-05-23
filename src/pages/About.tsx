import { useState, useEffect } from "react";
import { Shield, Eye, Smartphone, Award, Users, Zap, ChevronLeft, ChevronRight, Play } from "lucide-react";
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
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
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

  const c = (key: string) => settingsMap[key] || t(key);

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
      {/* Hero — Amazon dark style */}
      <section style={{ background: '#131921', color: '#fff', padding: '48px 24px' }}>
        <div className="max-w-[1300px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5" style={{ background: 'rgba(255,153,0,0.15)', color: '#FF9900' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#FF9900' }} />
            {t("aboutUs")}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            {c("aboutTitle")} <span style={{ color: '#FF9900' }}>iDaPro</span>
          </h1>
          <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: '#ccc' }}>
            {c("aboutHero")}
          </p>
        </div>
      </section>

      {/* Brand Story + Video */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#0F1111' }}>
              {c("aboutSubtitle")} <span style={{ color: '#FF9900' }}>9H Films</span>
            </h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: '#565959' }}>
              <p>{c("aboutStory")}</p>
            </div>
            <div className="flex gap-3 mt-6 flex-wrap">
              <Link to={path("/")} className="inline-block px-6 py-2.5 rounded-md text-sm font-semibold" style={{ background: 'linear-gradient(180deg, #ffd472, #f3a847)', color: '#0F1111', border: '1px solid #a88734' }}>
                {t("aboutShopNow")}
              </Link>
              <Link to={path("/contact")} className="inline-block px-6 py-2.5 rounded-md text-sm font-semibold bg-white" style={{ color: '#0F1111', border: '1px solid #d5d9d9' }}>
                {t("contactTitle")}
              </Link>
            </div>
          </div>
          {/* Video Player */}
          <div className="bg-white rounded-xl p-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {videos.length > 0 ? (
              <div>
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
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
                  <div className="flex items-center justify-between mt-3 px-1">
                    <button onClick={() => setCurrentVideo(p => (p - 1 + videos.length) % videos.length)} className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: '#EAEDED' }}><ChevronLeft className="w-4 h-4" /></button>
                    <p className="text-xs font-medium truncate max-w-[200px]" style={{ color: '#565959' }}>{videos[currentVideo]?.title}</p>
                    <button onClick={() => setCurrentVideo(p => (p + 1) % videos.length)} className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: '#EAEDED' }}><ChevronRight className="w-4 h-4" /></button>
                  </div>
                )}
                {videos.length > 1 && (
                  <div className="flex justify-center gap-1 mt-2">
                    {videos.map((_, i) => <button key={i} onClick={() => setCurrentVideo(i)} className="h-1.5 rounded-full transition-all" style={{ width: i === currentVideo ? 16 : 6, background: i === currentVideo ? '#FF9900' : '#ddd' }} />)}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video rounded-lg flex flex-col items-center justify-center" style={{ background: '#f7f8f8' }}>
                <Play className="w-12 h-12 mb-3" style={{ color: '#ccc' }} />
                <p className="text-sm" style={{ color: '#999' }}>No videos yet</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: '#fff', padding: '48px 24px' }}>
        <div className="max-w-[1300px] mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: '#0F1111' }}>
            {c("aboutWhyTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-lg p-5 transition-all" style={{ border: '1px solid #eee' }}>
                <f.icon className="w-8 h-8 mb-3" style={{ color: '#FF9900' }} />
                <h3 className="text-base font-semibold mb-1.5" style={{ color: '#0F1111' }}>{t(f.titleKey)}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#565959' }}>{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#0F1111' }}>
          {c("aboutCommitment")}
        </h2>
        <div className="max-w-2xl mx-auto text-sm leading-relaxed text-center" style={{ color: '#565959' }}>
          <p>{c("aboutCommitmentText")}</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#f7f8f8', padding: '48px 24px' }}>
        <div className="max-w-[1300px] mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#0F1111' }}>
            {c("aboutCTA")}
          </h2>
          <p className="text-sm mb-6 max-w-lg mx-auto" style={{ color: '#565959' }}>
            {c("aboutCTADesc")}
          </p>
          <Link to={path("/")} className="inline-block px-8 py-3 rounded-md text-sm font-semibold" style={{ background: 'linear-gradient(180deg, #ffd472, #f3a847)', color: '#0F1111', border: '1px solid #a88734' }}>
            {t("aboutShopNow")}
          </Link>
        </div>
      </section>
    </div>
  );
}
