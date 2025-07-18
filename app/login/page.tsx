'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TASKS_API_LOGIN } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState('');

  const showAlert = (msg: string) => {
    setAlert(msg);
    setTimeout(() => setAlert(''), 4000);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch(TASKS_API_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Login failed');
        showAlert(message);
        return;
      }

      const token = data.access_token;
      const user = data.user;

      if (!token || !user) {
        showAlert('Login berhasil tapi data tidak lengkap.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      showAlert('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/userserver'); // Redirect ke halaman task setelah login
      }, 1000);
    } catch {
      showAlert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {alert && (
          <div className={`mb-4 p-2 text-center rounded ${alert.toLowerCase().includes('success') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {alert}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-6 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Log In
        </button>
      </div>
    </div>
  );
}
