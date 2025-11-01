"use client";

import { useWidgetProps, useMaxHeight, useDisplayMode, useIsChatGptApp } from "../hooks";
import ProductCarousel from "../components/ProductCarousel";

interface Product {
    id: number;
    title: string;
    category: string;
    price: number;
    thumbnail: string;
    rating?: number;
    brand?: string;
    description?: string;
}

interface ProductsPageProps {
    query?: string;
    products?: Product[];
    total?: number;
    error?: string;
}

export default function ProductsPage() {
    const toolOutput = useWidgetProps<{
        query?: string;
        products?: Product[];
        total?: number;
        error?: string;
        timestamp?: string;
    }>();

    console.log('bmt', 'ProductsPage toolOutput:', toolOutput);
    const maxHeight = useMaxHeight() ?? undefined;
    const displayMode = useDisplayMode();
    const isChatGptApp = useIsChatGptApp();


    // Extract data from widget props - data is directly in toolOutput
    const query = toolOutput?.query || '';
    const products = toolOutput?.products || [];
    const total = toolOutput?.total || 0;
    const error = toolOutput?.error;


    return (
        <div
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
            style={{
                maxHeight,
                height: displayMode === "fullscreen" ? maxHeight : undefined,
                overflow: displayMode === "fullscreen" ? "auto" : "visible",
            }}
        >
            {/* Header with context info */}
            {!isChatGptApp && (
                <div className="max-w-6xl mx-auto px-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-3">
                            <svg
                                className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                                    This page displays product search results from ChatGPT.
                                </p>
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    Use the search_products tool in ChatGPT to see results here.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="max-w-6xl mx-auto px-4">
                {error ? (
                    // Error state
                    <div className="text-center py-12">
                        <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
                            Search Error
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                            {error}
                        </div>
                        {query && (
                            <div className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                                Query: "{query}"
                            </div>
                        )}
                    </div>
                ) : query && products.length > 0 ? (
                    // Products carousel
                    <ProductCarousel
                        products={products}
                        total={total}
                        query={query}
                    />
                ) : query && products.length === 0 ? (
                    // No results state
                    <div className="text-center py-12">
                        <div className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                            No products found for "{query}"
                        </div>
                        <div className="text-gray-500 dark:text-gray-500 text-sm">
                            Try searching with different keywords
                        </div>
                    </div>
                ) : (
                    // Initial state - no search performed
                    <div className="text-center py-12">
                        <div className="mb-6">
                            <svg
                                className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                            </svg>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Product Search
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                Use ChatGPT to search for products. Try asking "search for phones" or "find laptops" to see products displayed here.
                            </p>
                        </div>

                        {/* Example searches */}
                        <div className="max-w-md mx-auto">
                            <div className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                                Example searches:
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {["phones", "laptops", "headphones", "watches", "cameras"].map((term) => (
                                    <span
                                        key={term}
                                        className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full"
                                    >
                                        {term}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Debug info (only in development) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 right-4 bg-black text-white text-xs p-2 rounded max-w-xs opacity-50">
                    <div>Display: {displayMode}</div>
                    <div>MaxHeight: {maxHeight}px</div>
                    <div>Query: {query || 'none'}</div>
                    <div>Products: {products.length}</div>
                </div>
            )}
        </div>
    );
}