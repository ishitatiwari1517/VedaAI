'use client';

import styles from './TopBar.module.css';

import { useAssignmentStore } from '@/stores/assignmentStore';

interface TopBarProps {
  title?: string;
  breadcrumb?: string;
  breadcrumbHref?: string;
}

export default function TopBar({ title, breadcrumb, breadcrumbHref }: TopBarProps) {
  const { userSettings } = useAssignmentStore();
  const userInitials = userSettings.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'JD';

  return (
    <header className={`${styles.topbar} topbar no-print`}>
      {/* Left — breadcrumb or page title */}
      <div className={styles.left}>
        {breadcrumb && (
          <a href={breadcrumbHref || '/'} className={styles.breadcrumb}>
            ← {breadcrumb}
          </a>
        )}
        {title && <h1 className={styles.pageTitle}>{title}</h1>}
      </div>

      <div className={styles.spacer} />

      {/* Right — bell + user */}
      <div className={styles.actions}>
        <button className={styles.bellBtn} aria-label="Notifications" id="notification-btn">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className={styles.notifDot} />
        </button>

        {/* User avatar + name */}
        <div className={styles.userChip} id="user-menu-btn">
          <div className={styles.avatar}>{userInitials}</div>
          <span className={styles.userName}>{userSettings.userName}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevron}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </header>
  );
}
