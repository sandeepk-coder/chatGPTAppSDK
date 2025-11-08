"use client";

import { useWidgetProps, useMaxHeight, useDisplayMode, useIsChatGptApp } from "../hooks";
import ProductCarousel from "../components/ProductCarousel";

export default function ProductsPage() {
  const toolOutput = useWidgetProps<{
    query?: string;
    products?: any[];
    total?: number;
    error?: string;
    timestamp?: string;
  }>();

  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const isChatGptApp = useIsChatGptApp();

  const query = toolOutput?.query || "";
  const products = toolOutput?.products || [];
  const total = toolOutput?.total || 0;
  const error = toolOutput?.error;
  const isLoading = !query && products.length === 0 && !error;

  return (
    <div
      className="max-h-screen bg-gray-50 dark:bg-gray-900"
      style={{
        maxHeight,
        height: displayMode === "fullscreen" ? maxHeight : undefined,
        overflow: displayMode === "fullscreen" ? "auto" : "visible",
      }}
    >
      {!isChatGptApp && (
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
              {/* <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                  This page displays product search results from ChatGPT.
                </p>
              </div> */}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4">
        {error ? (
          // Error message
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
              Search Error
            </div>
            <div className="text-gray-600 dark:text-gray-400">{error}</div>
            {query && (
              <div className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                Query: "{query}"
              </div>
            )}
          </div>
        ) : query && products.length > 0 ? (
          // Show carousel once loaded
          <ProductCarousel products={products} total={total} query={query} />
        ) : isLoading ? (
          // ✨ Shimmer while loading
          <div className="max-w-5xl mx-auto p-4 animate-pulse">
            <div className="mb-6 h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
