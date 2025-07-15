'use client'

import { useEffect, useState } from 'react'

type Item = {
  id: number
  name: string
  deadline: string
  priority: string
  is_done: number | boolean
}

export default function PostList() {
  const [posts, setPosts] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(
          'https://a9b69f4ca76f.ngrok-free.app/api/tasks',
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          },
        )

        if (!res.ok) {
          const text = await res.text()
          throw new Error(
            `HTTP ${res.status}: ${res.statusText}. Body: ${text}`,
          )
        }

        const json = await res.json()
        const rawData = json.data

        const formattedData = rawData.map((item: any) => ({
          ...item,
          is_done: Boolean(item.is_done),
        }))

        setPosts(formattedData)
      } catch (err: any) {
        setError(err.message || 'Gagal fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>

  return (
    <div className="p-4 space-y-4 text-black">
      {posts.map((item) => (
        <div
          key={item.id}
          className="p-4 border rounded shadow bg-white space-y-1"
        >
          <h2 className="text-lg font-semibold">{item.name}</h2>
          <p>Deadline: {new Date(item.deadline).toLocaleDateString()}</p>
          <p>Priority: {item.priority}</p>
          <p>Status: {item.is_done ? '✅ Selesai' : '⌛ Belum'}</p>
        </div>
      ))}
    </div>
  )
}
