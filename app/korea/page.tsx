// app/korea/page.tsx
'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header'; // Adjust path based on your folder structure
import Footer from '../components/Footer'; // Adjust path based on your folder structure
import { Video } from '../types/video'; // Adjust path

// Tipe data untuk section Korea
interface KoreaSection {
  title: string;
  videos: Video[];
  moreLink: string;
}

export default function KoreaPage() {
  const [koreaSections, setKoreaSections] = useState<KoreaSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Kategori Header
  const headerCategories = ['Bokep Indo', 'Bokep Jilbab', 'Bokep Korea'];

  useEffect(() => {
    const fetchKoreaData = async () => {
      setLoading(true);
      try {
        // Panggil API khusus Korea yang sudah kita buat sebelumnya
        const res = await fetch('/api/korea-home');
        if (res.ok) {
          const data = await res.json();
          setKoreaSections(data);
        }
      } catch (error) {
        console.error('Failed to fetch Korea data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKoreaData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
          <span className="text-pink-400 animate-pulse font-medium">Memuat Konten Korea...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100 selection:bg-pink-500/30">
      {/* Active category di-set 'Bokep Korea' agar menu ter-highlight */}
      <Header categories={headerCategories} activeCategory="Bokep Korea" />

      <main className="container mx-auto flex-1 px-4 py-8 md:px-6">
        
        {/* Hero Section Khusus Korea */}
        <section className="mb-12 text-center animate-fade-in-up">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-pink-500 uppercase bg-pink-500/10 rounded-full border border-pink-500/20">
            Premium Collection
          </div>
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            Bokep <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Korea</span> Terbaru
          </h2>
          <p className="mx-auto max-w-2xl text-gray-400 text-lg">
            Nonton streaming video bokep Korea viral, skandal artis, BJ live cam, dan amateur terbaru dengan kualitas HD.
          </p>
        </section>

        {/* Loop Section dari API Korea */}
        {koreaSections.length > 0 ? (
          koreaSections.map((section, idx) => (
            <section key={`korea-sec-${idx}`} className="mb-16 animate-fade-in">
              <div className="mb-6 flex items-center justify-between border-b border-pink-500/20 pb-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600/20 text-pink-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </span>
                    <h3 className="text-2xl font-bold text-white">
                    {section.title}
                    </h3>
                </div>
                
                <Link 
                  // Encode Link asli bokepkorea ke base64 agar ditangkap oleh page category universal kita
                  href={`/category?data=${encodeURIComponent(btoa(section.moreLink))}`}
                  className="group flex items-center gap-1 text-sm font-bold text-pink-500 transition-colors hover:text-pink-400 bg-pink-500/10 px-4 py-2 rounded-full hover:bg-pink-500/20"
                >
                  Lihat Semua
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.videos.map((video) => (
                  <KoreaVideoCard key={video.id} video={video} />
                ))}
              </div>
            </section>
          ))
        ) : (
            <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-dashed border-gray-800">
                <p className="text-gray-500">Tidak ada konten yang tersedia saat ini.</p>
            </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

// Komponen Card Khusus Tema Korea (Pink)
function KoreaVideoCard({ video }: { video: Video }) {
  // Encode link detail
  const encodedLink = btoa(video.link);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-pink-500/10 bg-gray-900/80 transition-all duration-300 hover:-translate-y-2 hover:border-pink-500/40 hover:shadow-2xl hover:shadow-pink-500/10">
      <div className="relative aspect-video overflow-hidden bg-black">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-xs font-medium backdrop-blur-sm border border-white/10">
          {video.duration}
        </div>
        {video.hd && (
          <div className="absolute top-2 right-2 rounded-md bg-gradient-to-r from-pink-600 to-purple-600 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white shadow-lg">
            HD
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/detailVid?data=${encodeURIComponent(encodedLink)}`}
          className="mb-3 flex-1"
        >
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-100 transition-colors group-hover:text-pink-400">
            {video.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
          <Link
            href={`/detailVid?data=${encodeURIComponent(encodedLink)}`}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider transition-colors hover:text-white"
          >
            <span>Watch Now</span>
            <svg className="h-3 w-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}