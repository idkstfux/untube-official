// app/page.tsx
'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';
import { Video } from './types/video';

// Tipe data untuk section Korea
interface KoreaSection {
  title: string;
  videos: Video[];
  moreLink: string;
}

export default function Home() {
  // State untuk Data Avtub (Indo & Jilbab)
  const [avtubVideos, setAvtubVideos] = useState<Video[]>([]);
  
  // State untuk Data Korea
  const [koreaSections, setKoreaSections] = useState<KoreaSection[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Kategori Header: Masukkan 'Bokep Korea' agar muncul di navigasi
  const headerCategories = ['Bokep Indo', 'Bokep Jilbab', 'Bokep Korea'];

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Data Avtub (Bokep Indo, Jilbab, dll)
        const resAvtub = await fetch('/api/videos');
        if (resAvtub.ok) {
          const dataAvtub = await resAvtub.json();
          setAvtubVideos(dataAvtub);
        }

        // 2. Fetch Data Korea
        const resKorea = await fetch('/api/korea-home');
        if (resKorea.ok) {
          const dataKorea = await resKorea.json();
          setKoreaSections(dataKorea);
        }

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Grouping Data Avtub berdasarkan kategori widget aslinya
  // Ini memastikan "Bokep Indo Terbaru" dan "Jilbab Viral" tetap terpisah rapi
  const groupedAvtub = avtubVideos.reduce((acc, video) => {
    const cat = video.category || 'Latest Updates';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(video);
    return acc;
  }, {} as Record<string, Video[]>);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-gray-400 animate-pulse">Memuat Video...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100 selection:bg-blue-500/30">
      <Header categories={headerCategories} activeCategory="Home" />

      <main className="container mx-auto flex-1 px-4 py-8 md:px-6">
        
        {/* Hero Section */}
        <section className="mb-10 text-center animate-fade-in-up">
          <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            UNtube <span className="text-blue-500">Explorer</span>
          </h2>
          <p className="text-gray-400">Streaming video terlengkap: Indo, Jilbab, & Korea.</p>
        </section>

        {/* =========================================
            SECTION 1: AVTUB CONTENT (Indo & Jilbab)
            Tetap ada dan muncul paling atas
           ========================================= */}
        {Object.keys(groupedAvtub).map((category, idx) => (
          <section key={`avtub-${idx}`} className="mb-12 animate-fade-in">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="h-8 w-1.5 rounded-full bg-blue-500"></span>
                {category}
              </h3>
              <Link 
                href={`/category?data=${encodeURIComponent(btoa(`https://www.avtub.net/category/${category.toLowerCase().replace(/\s+/g, '-')}/?filter=latest`))}`}
                className="group flex items-center gap-1 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
              >
                Lihat Semua
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {groupedAvtub[category].slice(0, 8).map((video) => (
                <VideoCard key={video.id} video={video} variant="blue" />
              ))}
            </div>
          </section>
        ))}

        {/* =========================================
            SECTION 2: KOREA CONTENT (Tambahan Baru)
            Muncul di bawah section Indo
           ========================================= */}
        {koreaSections.length > 0 && (
          <div className="my-16 border-t border-dashed border-gray-800 pt-10">
             <div className="flex items-center justify-center gap-4 mb-10">
                <span className="h-px w-10 bg-pink-500/50"></span>
                <h2 className="text-center text-2xl md:text-3xl font-bold text-pink-500 tracking-widest uppercase">
                   Korea Updates
                </h2>
                <span className="h-px w-10 bg-pink-500/50"></span>
             </div>
             
             {koreaSections.map((section, idx) => (
                <section key={`korea-${idx}`} className="mb-12 animate-fade-in">
                  <div className="mb-6 flex items-center justify-between border-b border-pink-900/30 pb-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span className="h-8 w-1.5 rounded-full bg-pink-500"></span>
                      {section.title}
                    </h3>
                    <Link 
                      // Menggunakan base64 link asli dari API Korea untuk ke halaman category
                      href={`/category?data=${encodeURIComponent(btoa(section.moreLink))}`}
                      className="group flex items-center gap-1 text-sm font-medium text-pink-400 transition-colors hover:text-pink-300"
                    >
                      Lihat Semua
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {section.videos.slice(0, 8).map((video) => (
                      <VideoCard key={video.id} video={video} variant="pink" />
                    ))}
                  </div>
                </section>
             ))}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

// Komponen Card Universal (Biru untuk Avtub, Pink untuk Korea)
function VideoCard({ video, variant = 'blue' }: { video: Video, variant?: 'blue' | 'pink' }) {
  // Encode link video ke Base64 untuk dikirim ke detailVid
  const encodedLink = btoa(video.link);
  
  const isPink = variant === 'pink';
  const borderColor = isPink ? 'group-hover:border-pink-500/50' : 'group-hover:border-blue-500/50';
  const shadowColor = isPink ? 'group-hover:shadow-pink-500/10' : 'group-hover:shadow-blue-500/10';
  const badgeColor = isPink ? 'bg-pink-600' : 'bg-blue-600';
  const textColor = isPink ? 'group-hover:text-pink-400' : 'group-hover:text-blue-400';

  return (
    <div className={`group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-gray-900/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${borderColor} ${shadowColor}`}>
      <div className="relative aspect-video overflow-hidden bg-black">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
          {video.duration}
        </div>
        {video.hd && (
          <div className={`absolute top-2 right-2 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-widest text-white shadow-lg ${badgeColor}`}>
            HD
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/detailVid?data=${encodeURIComponent(encodedLink)}`}
          className="mb-3 flex-1"
        >
          <h3 className={`line-clamp-2 text-base font-bold leading-snug transition-colors ${textColor}`}>
            {video.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
          <Link
            href={`/detailVid?data=${encodeURIComponent(encodedLink)}`}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider transition-colors hover:text-white"
          >
            <span>Watch Now</span>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}