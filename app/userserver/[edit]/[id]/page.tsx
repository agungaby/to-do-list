'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Task = {
  name: string;
  deadline: string;
  priority: 'low' | 'normal' | 'high';
  is_done: boolean;
};

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const API = `https://a9f809492570.ngrok-free.app/api/tasks/${id}`;
  const hdr = {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  };

  const [task, setTask] = useState<Task>({
    name: '',
    deadline: '',
    priority: 'normal',
    is_done: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; deadline?: string }>({});

  useEffect(() => {
    const getTask = async () => {
      try {
        const res = await fetch(API, { headers: hdr });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTask({
          name: data.name,
          deadline: data.deadline?.slice(0, 10) ?? '',
          priority: data.priority,
          is_done: Boolean(data.is_done),
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    getTask();
  }, [API]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    let errors: { name?: string; deadline?: string } = {};

    if (!task.name.trim()) errors.name = 'Nama tugas wajib diisi';
    if (!task.deadline) errors.deadline = 'Tanggal deadline wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const res = await fetch(API, {
        method: 'PUT',
        headers: hdr,
        body: JSON.stringify(task),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.push('/userserver');
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;

  return (
    <div className="container max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Edit Tugas #{id}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Tugas */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Tugas</label>
          <input
            className={`w-full p-2 border rounded ${formErrors.name ? 'border-red-500' : ''}`}
            value={task.name}
            onChange={(e) => setTask({ ...task, name: e.target.value })}
            required
          />
          {formErrors.name && (
            <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
          )}
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Deadline</label>
          <input
            type="date"
            className={`w-full p-2 border rounded ${formErrors.deadline ? 'border-red-500' : ''}`}
            value={task.deadline}
            onChange={(e) => setTask({ ...task, deadline: e.target.value })}
            min="2024-01-01"
            max="2030-12-31"
          />
          {formErrors.deadline && (
            <p className="text-red-600 text-sm mt-1">{formErrors.deadline}</p>
          )}
        </div>

        {/* Prioritas */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Prioritas</label>
          <select
            className="w-full p-2 border rounded"
            value={task.priority}
            onChange={(e) =>
              setTask({ ...task, priority: e.target.value as Task['priority'] })
            }
          >
            <option value="low">🟢 Rendah</option>
            <option value="normal">🟠 Normal</option>
            <option value="high">🔴 Tinggi</option>
          </select>
        </div>

        {/* Tombol */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded border"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-800"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
