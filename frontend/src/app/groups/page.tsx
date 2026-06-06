'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Link from 'next/link';

export default function GroupsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column' }}>
        <TopBar title="My Groups" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>No groups yet</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Create a group to organize your students by class or subject.</p>
          <button style={{ marginTop: '8px', padding: '11px 24px', background: 'var(--color-text-primary)', color: 'white', borderRadius: '9999px', border: 'none', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            + Create Group
          </button>
        </div>
      </div>
    </div>
  );
}
