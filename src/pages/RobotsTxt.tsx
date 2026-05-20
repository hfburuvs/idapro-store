import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function RobotsTxt() {
  useEffect(() => {
    async function generate() {
      const { data } = await supabase
        .from("seo_settings")
        .select("value")
        .eq("key", "robotsContent")
        .single();
      const content =
        data?.value ||
        `User-agent: *\nAllow: /\nSitemap: ${window.location.origin}/sitemap.xml`;
      document.open();
      document.write(content);
      document.close();
    }
    generate();
  }, []);

  return null;
}
