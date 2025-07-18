'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TASKS_API_REGISTER } from '@/lib/api'; 

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [alert, setAlert] = useState('');
  const [match, setMatch] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'confirm') {
      setMatch(form.password === value);
    }
    if (name === 'password') {
      setMatch(form.confirm === value);
    }
  };

  const handleRegister = async () => {
    const { username, email, password, confirm } = form;

    if (!username || !email || !password || !confirm) {
      setAlert('Please fill in all fields');
      return;
    }

    if (password !== confirm) {
      setAlert('Passwords do not match');
      return;
    }

    try {
      const res = await fetch(TASKS_API_REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: username,
          email,
          password,
          password_confirmation: confirm,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert(data.message || 'Registration failed');
        return;
      }

      setAlert('Registration successful! Redirecting...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      setAlert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br p-4">
      <div className="bg-black text-white p-8 rounded-lg shadow-lg w-full outline-4 max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

        {alert && (
          <div className="bg-red-500 text-white p-2 rounded mb-4 text-center">
            {alert}
          </div>
        )}

        {['username', 'email', 'password', 'confirm'].map((field, i) => (
          <div key={i} className="mb-4">
            <label className="block font-medium mb-1 capitalize">
              {field === 'confirm' ? 'Confirm Password' : field}
            </label>
            <input
              type={field.includes('password') ? 'password' : 'text'}
              name={field}
              value={form[field as keyof typeof form]}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {field === 'confirm' && form.confirm && (
              <p
                className={`text-sm mt-1 ${
                  match ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {match ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>
        ))}

        <button
          onClick={handleRegister}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Register
        </button>

        <p className="text-center mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-purple-400 font-semibold hover:underline">
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
}
