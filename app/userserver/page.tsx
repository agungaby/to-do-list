'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TASKS_API } from '@/lib/api';
import { useRef } from 'react';

type Task = {
  id: number;
  name: string;
  deadline: string;
  priority: 'low' | 'normal' | 'high';
  is_done: boolean;
};

function logoutAndRedirect() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('expires_at');
  window.location.href = '/expired';
}

function checkTokenOrLogout(): boolean {
  const token = localStorage.getItem('token');
  if (!token) {
    logoutAndRedirect();
    return false;
  }
  return true;
}

export default function TaskList() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; deadline?: string }>({});
  const [name, setName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('normal');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'undone'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'normal' | 'high'>('all');
  const [countdown, setCountdown] = useState<number | null>(null);
  const hasAlertedRef = useRef(false);

useEffect(() => {
  const interval = setInterval(() => {
    const expiresAt = localStorage.getItem('expires_at');
    if (!expiresAt) {
      logoutAndRedirect();
      return;
    }

    const now = new Date();
    const expiryDate = new Date(expiresAt);
    const timeLeft = Math.floor((expiryDate.getTime() - now.getTime()) / 1000);

    if (timeLeft <= 0) {
      logoutAndRedirect();
    } else if (timeLeft <= 10) {
      setCountdown(timeLeft);

      if (!hasAlertedRef.current) {
        alert(`Sesi kamu akan habis dalam ${timeLeft} detik!`);
        hasAlertedRef.current = true;
      }
    } else {
      setCountdown(null);
      hasAlertedRef.current = false; 
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

const fetchTasks = async () => {
  setLoading(true);
  setError(null);
  try {
    if (!checkTokenOrLogout()) return;

    const res = await fetch(TASKS_API, { headers: getHeaders() });

    if (res.status === 401 || res.status === 403 || res.status === 500) {
      logoutAndRedirect();
      return;
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const json = await res.json();
    setTasks(json.data.map((t: any) => ({ ...t, is_done: Boolean(t.is_done) })));
  } catch (e: any) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);

    const errors: { name?: string; deadline?: string } = {};
    if (!name.trim()) errors.name = 'Nama tugas wajib diisi';
    if (!deadline) errors.deadline = 'Tanggal deadline wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!checkTokenOrLogout()) return;

    try {
      const res = await fetch(TASKS_API, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, deadline, priority }),
      });

      if (res.status === 401 || res.status === 403) {
        logoutAndRedirect();
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setName('');
      setDeadline('');
      setPriority('normal');
      fetchTasks();
    } catch (e: any) {
      setError(e.message);
    }
    if (!checkToken()) {
  alert('Sesi kamu telah habis. Silakan login ulang.');
  logoutAndRedirect();
  return;
}
  };
function checkToken(): boolean {
  const token = localStorage.getItem('token');
  const expiresAt = localStorage.getItem('expires_at');
  if (!token || !expiresAt || new Date() >= new Date(expiresAt)) {
    return false;
  }
  return true;
}

  const toggleDone = async (task: Task) => {
    if (!checkTokenOrLogout()) return;

    const updated = { ...task, is_done: !task.is_done };

    try {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));

      const res = await fetch(`${TASKS_API}/${task.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updated),
      });

      if (res.status === 401 || res.status === 403) {
        logoutAndRedirect();
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e: any) {
      setError(e.message);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }
  };

  const deleteTask = async (id: number) => {
    if (!checkTokenOrLogout()) return;

    try {
      setTasks((prev) => prev.filter((t) => t.id !== id));

      const res = await fetch(`${TASKS_API}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        logoutAndRedirect();
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e: any) {
      setError(e.message);
      fetchTasks();
    }
  };

  const displayedTasks = tasks
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    .filter((t) =>
      statusFilter === 'all' ? true : statusFilter === 'done' ? t.is_done : !t.is_done,
    )
    .filter((t) => (priorityFilter === 'all' ? true : t.priority === priorityFilter));

  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;

  return (
    <div className="container border border-gray-300 rounded-lg p-4 max-w-2xl mx-auto space-y-6 my-10">
      <h1 className="text-6xl">To-Do List🦾</h1>

      {user && (
        <h1 className="text-2xl mb-4">
          Halo, <span className="font-semibold text-purple-600">{user.name}</span>👤! Selamat datang.
        </h1>
      )}
      {countdown !== null && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
    Token akan kedaluwarsa dalam <span className="font-bold">{countdown}</span> detik. Kamu akan logout otomatis.
  </div>
)}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari tugas…"
        className="w-full p-2 border rounded focus:outline-none"
      />

      <form
        onSubmit={handleAdd}
        className="bg-gray-50 p-4 rounded-xl shadow flex flex-col md:flex-row md:items-end gap-4 text-black"
      >
        <div className="flex-1 flex flex-col">
          <input
            className={`p-2 border rounded ${formErrors.name ? 'border-red-500' : ''}`}
            placeholder="Tambah tugas…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
        </div>

        <div className="flex flex-col">
          <input
            type="date"
            className={`p-2 border rounded ${formErrors.deadline ? 'border-red-500' : ''}`}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          {formErrors.deadline && <p className="text-red-600 text-sm mt-1">{formErrors.deadline}</p>}
        </div>

        <select
          className="p-2 border rounded"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task['priority'])}
        >
          <option value="low">🟢 Rendah</option>
          <option value="normal">🟠 Normal</option>
          <option value="high">🔴 Tinggi</option>
        </select>

        <button className="bg-indigo-600 hover:bg-indigo-950 text-white px-4 py-2 rounded">+</button>
      </form>

      <div className="space-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold">Status:</span>
            {(['all', 'done', 'undone'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={statusFilter === s ? 'underline font-medium' : 'text-gray-600 hover:underline'}
              >
                {s === 'all' ? '📘 Semua' : s === 'done' ? '✅ Selesai' : '📥 Belum'}
              </button>
            ))}
          </div>

          <Link href="/logout" className="text-red-600 hover:underline text-sm font-semibold">
            🚪 Log-Out
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold">Prioritas:</span>
          {(['all', 'high', 'normal', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={priorityFilter === p ? 'underline font-medium' : 'text-gray-600 hover:underline'}
            >
              {p === 'all'
                ? '📋 Semua'
                : p === 'high'
                ? '🔴 Tinggi'
                : p === 'normal'
                ? '🟠 Normal'
                : '🟢 Rendah'}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-4">
        {displayedTasks.length ? (
          displayedTasks.map((t) => (
            <li key={t.id} className="flex justify-between items-start p-4 bg-white rounded shadow border">
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={t.is_done} onChange={() => toggleDone(t)} />
                <div className={t.is_done ? 'line-through text-black' : ''}>
                  <div className="font-semibold text-purple-600">{t.name}</div>
                  <div className="text-sm text-gray-600">
                    🗓 {formatDate(t.deadline)}
                    <br />
                    🔥{' '}
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded ${
                        t.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : t.priority === 'normal'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <button className="text-red-600 hover:text-red-800" onClick={() => deleteTask(t.id)}>
                  🗑 Hapus
                </button>
                <Link href={`/userserver/edit/${t.id}`} className="text-blue-600 hover:underline text-sm">
                  ✏ Edit
                </Link>
              </div>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-400">Tidak ada tugas.</li>
        )}
      </ul>
    </div>
  );
}