// app/expired/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExpiredPage() {
  const router = useRouter();

  useEffect(() => {
    // Hapus data saat halaman ini dibuka
    localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('user');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center rounded-4xl ">
      <div className="bg-black p-8 rounded shadow text-center space-y-4 outline-4">
        <h1 className="text-3xl font-bold text-red-600">⏰ Sesi Habis</h1>
        <p className="text-white-700">Sesi login kamu telah berakhir. Silakan login ulang untuk melanjutkan.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-800"
        >
          🔐 Kembali ke Login
        </button>
      </div>
    </div>
  );
}
