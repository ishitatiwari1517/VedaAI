'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

const features = [
  { title: '📝 Rubric Generator', desc: 'Auto-generate marking rubrics for any assignment' },
  { title: '📊 Performance Analyzer', desc: 'AI insights on student performance patterns' },
  { title: '🎯 Learning Path Creator', desc: 'Personalized study plans based on assessment results' },
];

export default function ToolkitPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column' }}>
        <TopBar title="AI Teacher's Toolkit" />
        <div style={{ flex: 1, padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', fontSize: '11px', borderRadius: '9999px', padding: '4px 10px', fontWeight: 600 }}>Coming Soon</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '12px', marginBottom: '8px', maxWidth: '70%' }}>{f.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
