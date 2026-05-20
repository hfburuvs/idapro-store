import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  image_url: string;
  title?: string | null;
  subtitle?: string | null;
  link?: string | null;
}

export default function Carousel({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [slides.length, next]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: "1370 / 520", maxHeight: "520px" }}>
      {slides.map((slide, idx) => (
        <a
          key={slide.id}
          href={slide.link || "#"}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.image_url}
            alt={slide.title || `Slide ${idx + 1}`}
            className="w-full h-full object-cover"
            loading={idx === 0 ? "eager" : "lazy"}
          />
          {(slide.title || slide.subtitle) && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-lg">
                  {slide.title && (
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-sm sm:text-base text-white/90 drop-shadow">
                      {slide.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </a>
      ))}

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              prev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              next();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrent(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === current
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
