'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/');
    } else {
      setError('Invalid password');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-accent to-cyan-accent/40 items-center justify-center mb-4 cyan-glow">
            <svg className="h-8 w-8 text-space-black" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-cyan-accent">Command</span>{' '}
            <span className="text-white">Center</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">YouTube Long-Form Pipeline</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/60 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-space-border bg-space-dark px-4 py-3 text-white placeholder-white/20 focus:border-cyan-accent focus:outline-none focus:ring-1 focus:ring-cyan-accent transition-colors"
              placeholder="Enter your password"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-accent px-4 py-3 text-sm font-semibold text-space-black hover:bg-cyan-accent/90 focus:outline-none focus:ring-2 focus:ring-cyan-accent focus:ring-offset-2 focus:ring-offset-space-black disabled:opacity-50 transition-all cyan-glow"
          >
            {loading ? 'Authenticating...' : 'Access Command Center'}
          </button>
        </form>
      </div>
    </div>
  );
}
