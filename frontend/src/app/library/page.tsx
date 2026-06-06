'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Link from 'next/link';

export default function LibraryPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column' }}>
        <TopBar title="My Library" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>Your library is empty</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Question papers you generate will be saved here automatically.</p>
          <Link href="/assignments/create" style={{ marginTop: '8px', padding: '11px 24px', background: 'var(--color-text-primary)', color: 'white', borderRadius: '9999px', textDecoration: 'none', fontWeight: 600, fontSize: '13.5px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            Generate your first paper
          </Link>
        </div>
      </div>
    </div>
  );
}
