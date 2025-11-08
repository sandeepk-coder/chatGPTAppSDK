"use client";

import { useState, useRef, useEffect } from "react";

interface Product {
    id: number;
    title: string;
    category: string;
    price: number|string;
    thumbnail: string;
    rating?: number;
    brand?: string;
    description?: string;
    pdpurl?: string; 
    companyname?: string; // e.g. "Abc Enterprises"
    location?: string;    // e.g. "Noida"
  }

interface ProductCarouselProps {
    products: Product[];
    total: number;
    query: string;
}

export default function ProductCarousel({ products, total, query }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);
//   const products = sampleProducts;

  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCardsPerView(1);
      } else if (width < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, products.length - cardsPerView);

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="max-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Compact Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
             Results({products.length}) from IndiaMART
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons - Compact */}
          {products.length > cardsPerView && (
            <>
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous"
              >
                <svg className="w-4 h-4 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex >= maxIndex}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next"
              >
                <svg className="w-4 h-4 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Carousel Track */}
          <div className="overflow-hidden px-2">
            <div
              className="flex transition-transform duration-300 ease-out gap-3"
              style={{
                transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
              }}
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} cardsPerView={cardsPerView} />
              ))}
            </div>
          </div>

          {/* Dot Indicators - Minimalist */}
          {products.length > cardsPerView && (
            <div className="flex justify-center mt-4 gap-1.5">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-blue-600 w-6"
                      : "bg-gray-300 dark:bg-gray-600 w-1.5"
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, cardsPerView }: { product: Product; cardsPerView: number }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="flex-shrink-0"
      style={{ width: `calc(${100 / cardsPerView}% - ${(cardsPerView - 1) * 12 / cardsPerView}px)` }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* full-bleed image */}
        
        <div className="w-full overflow-hidden">
          <div className="relative w-full pt-[62.5%]">
            {!imageError ? (
              <img
                src={product.thumbnail}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <svg
                  className="w-10 h-10 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="p-3">
          {/* product title */}
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
            {product.title}
          </h3>

          {/* smaller company name */}
          {product.companyname && (
            <div className="text-[12px] text-gray-800 dark:text-gray-200 font-medium">
              {product.companyname}
            </div>
          )}

          {/* location with location icon */}
          {product.location && (
            <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11a3 3 0 100-6 3 3 0 000 6z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                />
              </svg>
              {product.location}
            </div>
          )}

          {/* rating - only if present */}
          {product.rating && product.rating !== 0 && (
            <div className="flex items-center gap-1 mt-2 mb-2">
              <svg
                className="w-3.5 h-3.5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {product.rating}
              </span>
            </div>
          )}

          {/* price - hide if 0 */}
          {product.price && Number(product.price) !== 0 && (
  <div className="text-lg font-bold text-gray-900 dark:text-white mb-3">
    {typeof product.price === "string"
      ? product.price
      : `₹ ${product.price}/Piece`}
  </div>
)}

          {/* CTAs (IndiaMART teal) */}
          <div className="flex gap-2">
            <a
              href={product.pdpurl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1D8480] hover:bg-[#166762] text-white rounded-full py-2 text-xs font-medium transition-colors"
              onClick={(e) => {
                if (!product.pdpurl) e.preventDefault();
              }}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-.59 1.41l-1 1a16 16 0 006.18 6.18l1-1A2 2 0 0115 14h2a2 2 0 012 2v2a2 2 0 01-2 2h-1C9.82 20 4 14.18 4 7V6a1 1 0 011-1H4a2 2 0 01-2-2z"
                />
              </svg>
              Call Now
            </a>

            <a
              href={product.pdpurl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1D8480] hover:bg-[#166762] text-white rounded-full py-2 text-xs font-medium transition-colors"
              onClick={(e) => {
                if (!product.pdpurl) e.preventDefault();
              }}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h8M8 14h5M4 6h16v12H4z"
                />
              </svg>
              Get Best Price
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
