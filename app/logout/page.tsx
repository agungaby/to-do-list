'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TASKS_API_LOGOUT } from '@/lib/api';

type User = {
  id: number;
  name: string;
};

export default function LogoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Gagal parse user:', e);
      }
    }
  }, []);

  const handleLogout = async () => {
    await fetch(TASKS_API_LOGOUT, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-black outline-4 rounded shadow text-center">
      <h1 className="text-xl font-bold mb-4">Konfirmasi Logout</h1>
      <p className="mb-6">
        {user ? (
          <>
            Apakah kamu yakin ingin logout dari akun, {' '}
            <span className="font-semibold text-purple-600 text-2xl">{user.name}</span>❓
          </>
        ) : (
          <>Apakah kamu yakin ingin logout?</>
        )}
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
        >
          Ya, Logout
        </button>
        <button
          onClick={() => router.back()}
          className="border px-4 py-2 rounded hover:bg-green-950"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
