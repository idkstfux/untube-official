/* eslint-disable react-hooks/exhaustive-deps */
// app/detailVid/page.tsx
'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { VideoDetail } from '../types/video-detail';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function DetailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-white text-center p-10 animate-pulse">Loading Route...</div>
      </div>
    }>
      <DetailContent />
    </Suspense>
  );
}

function DetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Ambil parameter
  const rawUrlParam = searchParams?.get('url'); // Param lama
  const encodedUrl = searchParams?.get('data'); // Param baru

  // --- LOGIC AUTO-FIX URL (REDIRECT DARI ?URL KE ?DATA) ---
  useEffect(() => {
    if (rawUrlParam) {
        const encoded = btoa(rawUrlParam);
        router.replace(`${pathname}?data=${encodeURIComponent(encoded)}`);
    }
  }, [rawUrlParam, pathname, router]);

  const [detail, setDetail] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const STATIC_CATEGORIES = ['Bokep Indo', 'Bokep Jilbab'];
  const categoryList = useMemo(() => {
    return STATIC_CATEGORIES;
  }, []);

  useEffect(() => {
    if (detail) {
        document.title = `${detail.title} | UNtube Player`;
    }
  }, [detail]);

  useEffect(() => {
    // Jika sedang redirect, jangan fetch
    if (rawUrlParam) return;
    if (!encodedUrl) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      
      const cacheKey = `video_detail_${encodedUrl}`;

      try {
        const res = await fetch(
          `/api/video-detail?data=${encodeURIComponent(encodedUrl)}`
        );

        if (!res.ok) {
          throw new Error(`Server Error: ${res.status}`);
        }

        const data: VideoDetail = await res.json();
        setDetail(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (err: unknown) {
        let errorMessage = 'Unknown error occurred';
        if (err instanceof Error) errorMessage = err.message;
        console.warn('Fetch detail failed, checking cache:', errorMessage);

        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          try {
            const parsedData: VideoDetail = JSON.parse(cachedData);
            setDetail(parsedData);
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

    fetchDetail();
  }, [encodedUrl, rawUrlParam]);

  // Loading state (muncul juga saat sedang redirect)
  if (loading || rawUrlParam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-blue-400 animate-pulse">Memuat Video...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-red-400">
        <div className="text-center p-8 bg-red-900/20 rounded-xl border border-red-900/50 max-w-md">
          <p className="text-xl font-bold mb-2">Terjadi Kesalahan</p>
          <p className="mb-6">{error || 'Video tidak ditemukan'}</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100 selection:bg-blue-500/30">
      
      <Header categories={categoryList} />

      <main className="container mx-auto flex-1 px-4 py-8 md:px-6">
        <div className="mb-6">
          <Link href="/" className="text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Galeri
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Container */}
            <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl shadow-blue-900/20 z-0">
              <iframe 
                src={detail.embedUrl} 
                className="absolute top-0 left-0 w-full h-full z-10"
                allowFullScreen 
                loading="eager"
                title={detail.title}
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              />
            </div>

            {/* Video Info */}
            <div className="animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4 text-white">
                {detail.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-b border-white/5 pb-6">
                <div className="flex items-center gap-1.5 bg-gray-900 px-3 py-1 rounded-full border border-white/5">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{detail.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-900 px-3 py-1 rounded-full border border-white/5">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{detail.uploadDate || 'Baru saja'}</span>
                </div>
                
                {detail.downloadUrl && (
                  <a 
                    href={detail.downloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-xs font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    DOWNLOAD VIDEO
                  </a>
                )}
              </div>
            </div>

            {/* Tags */}
            {detail.tags && detail.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {detail.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-800/50 text-gray-400 rounded-lg text-xs hover:bg-blue-600/20 hover:text-blue-400 cursor-pointer border border-white/5 transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                Deskripsi
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                {detail.description || 'Tidak ada deskripsi tersedia.'}
              </p>
            </div>
          </div>

          {/* Sidebar: Related Videos */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Video Terkait
            </h3>
            
            <div className="flex flex-col gap-4">
              {detail.relatedVideos.map((video) => (
                <Link 
                  key={video.id} 
                  href={`/detailVid?data=${encodeURIComponent(btoa(video.link))}`}
                  className="group flex gap-3 bg-gray-900/40 hover:bg-gray-900 p-2 rounded-xl border border-transparent hover:border-white/10 transition-all duration-300"
                >
                  <div className="relative w-32 shrink-0 aspect-video rounded-lg overflow-hidden bg-black border border-white/5">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1.5 py-0.5 rounded text-white font-bold backdrop-blur-sm border border-white/10">
                      {video.duration}
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center flex-1">
                    <h4 className="text-sm font-bold text-gray-200 line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug">
                      {video.title}
                    </h4>
                    {video.hd && (
                      <span className="mt-2 inline-block w-max text-[9px] px-1.5 py-0.5 bg-blue-600/20 text-blue-400 rounded font-bold border border-blue-500/30 uppercase tracking-tighter">
                        HD Quality
                      </span>
                    )}
                  </div>
                </Link>
              ))}

              {detail.relatedVideos.length === 0 && (
                <div className="text-center py-10 bg-gray-900/30 rounded-xl border border-dashed border-white/5">
                  <p className="text-gray-500 text-sm italic">Tidak ada video terkait ditemukan.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}