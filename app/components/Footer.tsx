// app/components/Footer.tsx
'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/5 bg-gray-950 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              UNtube <span className="text-white">Exploration</span>
            </h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Platform galeri video modern dengan performa tinggi dan pengalaman pengguna yang imersif.
            </p>
          </div>

          {/* Bagian Platform, Support, dan Connect telah dihapus sesuai permintaan */}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {currentYear} AVTub API Demo Project. All rights reserved.
          </p>
          <div className="flex gap-4">
             <span className="text-xs text-gray-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                System Operational
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
}