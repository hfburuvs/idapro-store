import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SitemapXml() {
  useEffect(() => {
    async function generate() {
      const [{ data: products }, { data: categories }] = await Promise.all([
        supabase.from("products").select("id, title"),
        supabase.from("categories").select("id, slug"),
      ]);
      const baseUrl = window.location.origin;
      const lines: string[] = [];
      lines.push(`  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>`);
      lines.push(`  <url><loc>${baseUrl}/about</loc><priority>0.8</priority></url>`);
      lines.push(`  <url><loc>${baseUrl}/contact</loc><priority>0.8</priority></url>`);
      (categories || []).forEach((c: any) => {
        lines.push(`  <url><loc>${baseUrl}/category/${c.slug}</loc><priority>0.7</priority></url>`);
      });
      (products || []).forEach((p: any) => {
        lines.push(`  <url><loc>${baseUrl}/product/${p.id}</loc><priority>0.6</priority></url>`);
      });
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join("\n")}
</urlset>`;
      document.open();
      document.write(xml);
      document.close();
    }
    generate();
  }, []);

  return null;
}
