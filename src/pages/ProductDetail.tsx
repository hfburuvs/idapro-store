import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { Star, ExternalLink, ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCountry } from "@/hooks/useCountry";
import { trackViewItem, trackClickAffiliate } from "@/lib/analytics";

interface Product {
  id: number;
  title: string;
  image_url: string;
  price: number;
  amazon_link: string;
  description: string | null;
  features: string | null;
  aplus_images: string | null;
  category_id: number;
  brand_id: number;
  rating: number | null;
  reviews: number | null;
}

interface Review {
  id: number;
  name: string;
  rating: number;
  content: string;
  created_at: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "0");
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { config, path, t } = useCountry();

  useEffect(() => {
    async function loadData() {
      try {
        const [{ data: prod }, { data: revs }] = await Promise.all([
          supabase.from("products").select("*").eq("id", productId).single(),
          supabase
            .from("reviews")
            .select("*")
            .eq("is_approved", 1)
            .order("created_at", { ascending: false }),
        ]);
        setProduct((prod as Product) || null);
        setReviews((revs as Review[]) || []);
      } catch (err: any) {
        console.error("[ProductDetail] Failed to load:", err);
        setProduct(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    if (productId > 0) loadData();
  }, [productId]);

  // Track GA4 view_item when product loads
  useEffect(() => {
    if (product) {
      trackViewItem(
        {
          id: product.id,
          title: product.title,
          price: product.price,
          category: String(product.category_id),
          currency: config.currency,
        },
        config.currency
      );
    }
  }, [product, config.currency]);

  const features: string[] = (() => {
    try {
      const f = product?.features;
      if (!f) return [];
      const parsed = JSON.parse(f);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return product?.features
        ? product.features.split("|").filter(Boolean)
        : [];
    }
  })();

  const aplusImages: string[] = (() => {
    try {
      const a = product?.aplus_images;
      if (!a) return [];
      const parsed = JSON.parse(a);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return product?.aplus_images
        ? product.aplus_images.split("|").filter(Boolean)
        : [];
    }
  })();

  // Use product's own rating/reviews fields, fallback to reviews table
  const productRating = product?.rating ?? 0;
  const productReviews = product?.reviews ?? 0;
  const avgRating = productRating || (reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0);
  const totalReviews = productReviews || reviews.length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-lg w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
              <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
              <div className="h-24 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t("noResults")}
        </h1>
        <Link
          to={path("/")}
          className="text-[#FF9900] hover:underline inline-flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("home")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link to={path("/")} className="hover:text-[#FF9900] transition-colors">
              {t("home")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 font-medium truncate max-w-[200px]">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="aspect-square bg-gray-50 flex items-center justify-center p-8">
            <img
              src={product.image_url}
              alt={product.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {product.title}
            </h1>

            {/* Rating */}
            {totalReviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(avgRating)
                          ? "fill-[#FFA41C] text-[#FFA41C]"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {avgRating.toFixed(1)} ({totalReviews} {t("reviews")})
                </span>
              </div>
            )}

            <p className="text-3xl font-bold text-[#FF9900]">
              {config.currency}{product.price}
            </p>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">{t("featuredProducts")}</h3>
              <ul className="space-y-1.5">
                {features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <Star className="w-4 h-4 text-[#FF9900] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t("viewDetails")}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Buy Button */}
          <div className="pt-4">
            <a
              href={product.amazon_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#FF9900] hover:bg-[#E68A00] text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              onClick={() => {
                trackClickAffiliate(
                  {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    category: String(product.category_id),
                    currency: config.currency,
                  },
                  config.currency
                );
              }}
            >
              {t("buyNow")}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* A+ Images */}
      {aplusImages.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Product Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aplusImages.map((img, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <img
                  src={img}
                  alt={`${product.title} detail ${i + 1}`}
                  className="w-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
