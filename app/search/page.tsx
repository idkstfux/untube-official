// app/search/page.tsx
'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SearchResponse } from '../types/search-response';
import { Video } from '../types/video';

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-500">Loading Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Ambil parameter URL
  const query = searchParams?.get('q') || '';
  const pageParam = searchParams?.get('page') || '1';
  const filterParam = searchParams?.get('filter') || 'latest';
  // Ambil parameter domain (default null/avtub)
  const domainParam = searchParams?.get('domain') || 'avtub';

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headerCategories = ['Bokep Indo', 'Bokep Jilbab', 'Bokep Korea'];

  // Update Title
  useEffect(() => {
    if (data && query) {
        document.title = `Search: ${query} | UNtube`;
    }
  }, [data, query]);

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Cache key bedakan berdasarkan domain
      const cacheKey = `search_${query}_${pageParam}_${filterParam}_${domainParam}`;

      try {
        // Panggil API dengan parameter domain
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&page=${pageParam}&filter=${filterParam}&domain=${domainParam}`
        );

        if (!res.ok) {
          throw new Error(`Server Error: ${res.status}`);
        }

        const responseData: SearchResponse = await res.json();
        setData(responseData);
        localStorage.setItem(cacheKey, JSON.stringify(responseData));
        setError(null);
      } catch (err: unknown) {
        let errorMessage = 'Unknown error occurred';
        if (err instanceof Error) errorMessage = err.message;

        console.warn('Fetch search failed, attempting fallback to cache:', errorMessage);
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          try {
            const parsedData: SearchResponse = JSON.parse(cachedData);
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
  }, [query, pageParam, filterParam, domainParam]);

  // Handler Tab Domain (Indo vs Korea)
  const handleDomainChange = (newDomain: string) => {
    // Reset ke page 1 saat ganti domain
    router.push(`/search?q=${encodeURIComponent(query)}&page=1&filter=${filterParam}&domain=${newDomain}`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFilter = e.target.value;
    router.push(`/search?q=${encodeURIComponent(query)}&page=1&filter=${selectedFilter}&domain=${domainParam}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}&filter=${filterParam}&domain=${domainParam}`);
  };

  // Pagination Logic
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

  // UI Helper variables
  const isKorea = domainParam === 'korea';
  const themeColor = isKorea ? 'pink' : 'blue';
  
  if (!query) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
             <Header categories={headerCategories} />
             <div className="flex-1 flex items-center justify-center">
                 <p className="text-gray-400">Silakan masukkan kata kunci pencarian.</p>
             </div>
        </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
             <div className={`h-12 w-12 animate-spin rounded-full border-4 border-${themeColor}-500 border-t-transparent`}></div>
             <p className={`text-${themeColor}-400 animate-pulse`}>Mencari &ldquo;{query}&ldquo;...</p>
        </div>
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

  const activeFilterValue = data.filters.find(f => f.isActive)?.value || filterParam || 'latest';
  const paginationItems = generatePagination(data.currentPage, data.totalPages);

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100 selection:bg-blue-500/30">
      
      <Header categories={headerCategories} activeCategory={isKorea ? 'Bokep Korea' : ''} />

      <main className="container mx-auto flex-1 px-4 py-8 md:px-6">
        
        {/* TABS DOMAIN SELECTION */}
        <div className="flex justify-center mb-8">
            <div className="bg-gray-900 p-1 rounded-xl flex gap-1 border border-white/10">
                <button 
                    onClick={() => handleDomainChange('avtub')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isKorea ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white'}`}
                >
                    Global / Indo
                </button>
                <button 
                    onClick={() => handleDomainChange('korea')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isKorea ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'text-gray-400 hover:text-white'}`}
                >
                    Korea Only
                </button>
            </div>
        </div>

        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl text-white">
              Search: <span className={`${isKorea ? 'text-pink-500' : 'text-blue-500'} italic`}>&ldquo;{data.searchQuery}&ldquo;</span>
            </h2>
            <p className="mt-2 text-gray-400 text-sm">
              Source: {isKorea ? 'BokepKorea.tv' : 'Avtub.net'} • Page {data.currentPage} of {data.totalPages}
            </p>
          </div>

          {/* DROPDOWN FILTER */}
          {data.filters.length > 0 && (
            <div className="relative z-10">
              <label htmlFor="searchFilter" className={`text-xs font-bold uppercase tracking-widest mb-1 block ${isKorea ? 'text-pink-400' : 'text-blue-400'}`}>
                Sort By
              </label>
              <div className="relative">
                <select
                  id="searchFilter"
                  value={activeFilterValue}
                  onChange={handleFilterChange}
                  className="appearance-none w-full md:w-56 bg-gray-900 border border-white/10 text-white py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:border-white/20 transition-all cursor-pointer hover:bg-gray-800"
                >
                  {data.filters.map((filter, idx) => (
                    <option key={idx} value={filter.value}>
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
            <SearchVideoCard key={video.id} video={video} isKorea={isKorea} />
          ))}
        </div>

        {data.videos.length === 0 && (
          <div className="text-center py-20 text-gray-500 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
            <p className="text-lg">Tidak ada video ditemukan di server {isKorea ? 'Korea' : 'Global'}.</p>
            <p className="text-sm mt-2">Coba ganti tab server di atas.</p>
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
                  !data.prevPageUrl
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {paginationItems.map((item, index) => (
                <React.Fragment key={index}>
                  {item === '...' ? (
                    <span className="w-10 h-10 flex items-center justify-center text-gray-600 font-bold select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(item as number)}
                      className={`min-w-[40px] h-10 px-2 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        data.currentPage === item
                          ? isKorea 
                             ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20 scale-105'
                             : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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
                  !data.nextPageUrl
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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

// Component Card khusus Search
function SearchVideoCard({ video, isKorea }: { video: Video, isKorea: boolean }) {
    const encodedLink = btoa(video.link);
    const borderColor = isKorea ? 'border-pink-500/10 hover:border-pink-500/40' : 'border-white/10 hover:border-blue-500/50';
    const textColor = isKorea ? 'group-hover:text-pink-400' : 'group-hover:text-blue-400';
    const hdBg = isKorea ? 'bg-pink-600' : 'bg-blue-600';

    return (
        <div className={`group flex flex-col overflow-hidden rounded-2xl border bg-gray-900/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${borderColor}`}>
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
                    <div className={`absolute top-2 right-2 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-widest text-white shadow-lg ${hdBg}`}>
                        HD
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <Link
                    href={`/detailVid?data=${encodeURIComponent(encodedLink)}`}
                    className="mb-4 flex-1"
                >
                    <h3 className={`line-clamp-2 text-lg font-bold leading-tight transition-colors ${textColor}`}>
                        {video.title}
                    </h3>
                </Link>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <Link
                        href={`/detailVid?data=${encodeURIComponent(encodedLink)}`}
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
    );
}