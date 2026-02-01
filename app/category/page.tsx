/* eslint-disable @typescript-eslint/no-unused-vars */
// app/category/page.tsx
'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CategoryResponse } from '../types/category-response';

export default function CategoryPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-500">Loading...</div>}>
      <CategoryContent />
    </Suspense>
  );
}

function CategoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Ambil parameter
  const rawUrlParam = searchParams?.get('url'); // Parameter lama
  const encodedParam = searchParams?.get('data'); // Parameter baru (Base64)
  const pageParam = searchParams?.get('page') || '1';

  // --- LOGIC AUTO-FIX URL (REDIRECT DARI ?URL KE ?DATA) ---
  useEffect(() => {
    if (rawUrlParam) {
      // Jika mendeteksi parameter 'url', encode ke base64 lalu replace URL browser
      const encoded = btoa(rawUrlParam);
      router.replace(`${pathname}?data=${encodeURIComponent(encoded)}&page=${pageParam}`);
    }
  }, [rawUrlParam, pathname, pageParam, router]);

  // Default URL jika tidak ada parameter sama sekali
  const defaultUrl = 'https://www.avtub.net/category/bokep-indo/?filter=latest';
  
  // Tentukan URL aktif (Decode 'data' jika ada, atau gunakan default)
  let currentCategoryUrl = defaultUrl;
  if (encodedParam) {
    try {
      currentCategoryUrl = atob(encodedParam);
    } catch (e) {
      console.error('Gagal decode URL:', e);
    }
  }

  const [data, setData] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headerCategories = ['Bokep Indo', 'Bokep Jilbab'];

  // Update Title
  useEffect(() => {
    if (data) {
        document.title = `${data.categoryName} | UNtube`;
    }
  }, [data]);

  // Fetch Data
  useEffect(() => {
    // Jika masih dalam proses redirect dari ?url ke ?data, jangan fetch dulu
    if (rawUrlParam) return;

    const fetchData = async () => {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Gunakan encodedParam yang ada, atau encode defaultUrl
      const paramToSend = encodedParam || btoa(defaultUrl);
      const cacheKey = `category_${paramToSend}_${pageParam}`;

      try {
        const res = await fetch(
          `/api/category?data=${encodeURIComponent(paramToSend)}&page=${pageParam}`
        );

        if (!res.ok) {
          throw new Error(`Server Error: ${res.status}`);
        }

        const responseData: CategoryResponse = await res.json();

        setData(responseData);
        localStorage.setItem(cacheKey, JSON.stringify(responseData));
        setError(null);
      } catch (err: unknown) {
        let errorMessage = 'Unknown error occurred';
        if (err instanceof Error) errorMessage = err.message;

        console.warn('Fetch failed, attempting fallback to cache:', errorMessage);
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          try {
            const parsedData: CategoryResponse = JSON.parse(cachedData);
            setData(parsedData);
            setError(null);
          } catch {
            setError(errorMessage);
          }
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [encodedParam, pageParam, rawUrlParam]); // Tambahkan rawUrlParam ke dependency

  // Handler Filter
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let selectedUrl = e.target.value;
    if (selectedUrl.startsWith('/')) {
      selectedUrl = `https://www.avtub.net${selectedUrl}`;
    }
    const encodedUrl = btoa(selectedUrl);
    router.push(`/category?data=${encodeURIComponent(encodedUrl)}&page=1`);
  };

  // Handler Pagination
  const handlePageChange = (newPage: number) => {
    const paramToUse = encodedParam || btoa(defaultUrl);
    router.push(`/category?data=${encodeURIComponent(paramToUse)}&page=${newPage}`);
  };

  const generatePagination = (current: number, total: number) => {
    const delta = 2; 
    const range = [];
    const rangeWithDots = [];
    let l;
    range.push(1);
    for (let i = current - delta; i <= current + delta; i++) {
      if (i < total && i > 1) range.push(i);
    }
    range.push(total);
    for (const i of range) {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  // Tampilkan loading jika sedang loading atau sedang redirect
  if (loading || rawUrlParam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-red-400">
        <div className="text-center p-8 bg-red-900/20 rounded-xl border border-red-900/50">
          <p className="text-xl font-bold">Error!</p>
          <p>{error}</p>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-gray-800 rounded text-white hover:bg-gray-700">Kembali</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const activeFilterUrl = data.filters.find(f => f.isActive)?.url || data.filters[0]?.url || '';
  const paginationItems = generatePagination(data.currentPage, data.totalPages);

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100 selection:bg-blue-500/30">
      <Header categories={headerCategories} activeCategory={data.categoryName} />

      <main className="container mx-auto flex-1 px-4 py-8 md:px-6">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
              {data.categoryName}
            </h2>
            <p className="mt-2 text-gray-400">
              Menampilkan halaman {data.currentPage} dari {data.totalPages}
            </p>
          </div>

          {/* DROPDOWN FILTER */}
          {data.filters.length > 0 && (
            <div className="relative">
              <label htmlFor="filter" className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1 block">
                Sort By
              </label>
              <div className="relative">
                <select
                  id="filter"
                  value={activeFilterUrl}
                  onChange={handleFilterChange}
                  className="appearance-none w-full md:w-56 bg-gray-900 border border-white/10 text-white py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer hover:bg-gray-800"
                >
                  {data.filters.map((filter, idx) => (
                    <option key={idx} value={filter.url}>
                      {filter.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-16">
          {data.videos.map((video) => (
            <div
              key={video.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="relative aspect-video overflow-hidden bg-black">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-xs font-medium">
                  {video.duration}
                </div>
                {video.hd && (
                  <div className="absolute top-2 right-2 rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white shadow-lg">
                    HD
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <Link
                  href={`/detailVid?data=${encodeURIComponent(btoa(video.link))}`}
                  className="mb-4 flex-1"
                >
                  <h3 className="line-clamp-2 text-lg font-bold leading-tight transition-colors group-hover:text-blue-400">
                    {video.title}
                  </h3>
                </Link>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <Link
                    href={`/detailVid?data=${encodeURIComponent(btoa(video.link))}`}
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
                  >
                    <span>Watch Now</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.videos.length === 0 && (
          <div className="text-center py-20 text-gray-500 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
            <p className="text-lg">Tidak ada video ditemukan untuk filter ini.</p>
          </div>
        )}

        {/* NUMBERED PAGINATION UI */}
        {data.totalPages > 1 && (
          <div className="flex justify-center py-10 mt-8">
            <nav className="flex items-center gap-1.5 bg-gray-900/50 p-3 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl overflow-x-auto max-w-full">
              <button
                disabled={!data.prevPageUrl}
                onClick={() => handlePageChange(data.currentPage - 1)}
                className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg transition-all ${
                  !data.prevPageUrl ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {paginationItems.map((item, index) => (
                <React.Fragment key={index}>
                  {item === '...' ? (
                    <span className="w-10 h-10 flex items-center justify-center text-gray-600 font-bold select-none">...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(item as number)}
                      className={`min-w-[40px] h-10 px-2 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        data.currentPage === item ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  )}
                </React.Fragment>
              ))}

              <button
                disabled={!data.nextPageUrl}
                onClick={() => handlePageChange(data.currentPage + 1)}
                className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg transition-all ${
                  !data.nextPageUrl ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}