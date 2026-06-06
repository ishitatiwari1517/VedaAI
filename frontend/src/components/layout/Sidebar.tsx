'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const navItems = [
  {
    key: 'home',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    label: 'Home',
    href: '/',
  },
  {
    key: 'groups',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    label: 'My Groups',
    href: '/groups',
  },
  {
    key: 'assignments',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    label: 'Assignments',
    href: '/assignments',
    showBadge: true,
  },
  {
    key: 'toolkit',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    label: "AI Teacher's Toolkit",
    href: '/toolkit',
  },
  {
    key: 'library',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    label: 'My Library',
    href: '/library',
  },
  {
    key: 'settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
    label: 'Settings',
    href: '/settings',
  },
];

import { useAssignmentStore } from '@/stores/assignmentStore';

interface SidebarProps {
  assignmentCount?: number;
}

export default function Sidebar({ assignmentCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { userSettings } = useAssignmentStore();
  const schoolInitial = userSettings.schoolName.charAt(0).toUpperCase() || 'D';

  return (
    <aside className={`${styles.sidebar} sidebar`}>
      {/* ── Logo ─────────────────────────── */}
      <div className={styles.logoArea}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className={styles.logoText}>VedaAI</span>
        </div>
        {/* AI Teacher's Toolkit pill — orange, below logo */}
        <div className={styles.toolkitBadge}>AI Teacher&apos;s Toolkit</div>
      </div>

      {/* ── Navigation ───────────────────── */}
      <nav className={styles.nav} role="navigation">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.key === 'assignments' && (pathname === '/' || pathname.startsWith('/assignments'))) ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              id={`nav-${item.key}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.showBadge && assignmentCount > 0 && (
                <span className={styles.badge}>{assignmentCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── School info footer ────────────── */}
      <div className={styles.schoolBlock}>
        <div className={styles.schoolAvatar}>
          {schoolInitial}
        </div>
        <div className={styles.schoolText}>
          <span className={styles.schoolName}>{userSettings.schoolName}</span>
          <span className={styles.schoolCity}>{userSettings.schoolCity}</span>
        </div>
      </div>
    </aside>
  );
}
